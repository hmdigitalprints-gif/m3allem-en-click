import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, ArrowRight, CheckCircle2, AlertCircle, Filter, Navigation, Sparkles, DollarSign, BrainCircuit } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { bookingService } from '../services/marketplaceService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { socket, connectSocket } from '../services/socket';
import { aiService } from '../services/aiService';

export default function ArtisanJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'urgent' | 'nearby'>('all');
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalComment, setProposalComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiEstimate, setAiEstimate] = useState<{ 
    suggested: number, 
    minPrice: number, 
    maxPrice: number, 
    marketInsight: string,
    breakdown: string[] 
  } | null>(null);
  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    if (selectedJob) {
      handleGetAiEstimate(selectedJob);
    } else {
      setAiEstimate(null);
    }
  }, [selectedJob]);

  const handleGetAiEstimate = async (job: any) => {
    setEstimating(true);
    try {
      const estimate = await aiService.getAutoEstimate(
        job.service_title,
        job.description,
        job.city,
        job.is_urgent ? 'Urgent' : 'Normal',
        job.category_id
      );
      setAiEstimate(estimate);
    } catch (err) {
      console.error("AI Estimate error:", err);
    } finally {
      setEstimating(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('m3allem_token');
    if (token) {
      connectSocket(token);
      socket.on('new_job_available', () => {
        fetchJobs();
      });
    }
    return () => {
      socket.off('new_job_available');
    };
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // For now we use the nearby endpoint which we updated to filter by category
      const data = await bookingService.getNearbyBookings();
      setJobs(data);
    } catch (err) {
      setError('Failed to fetch job requests');
    } finally {
      setLoading(false);
    }
  };

  const handleProposal = async (jobId: string) => {
    if (!proposalPrice) return;
    setSubmitting(true);
    try {
      const res = await bookingService.submitProposal(jobId, parseFloat(proposalPrice), proposalComment);
      if (res.error) {
        alert(res.error);
      } else {
        alert('Proposal submitted successfully!');
        setSelectedJob(null);
        setProposalPrice('');
        setProposalComment('');
        fetchJobs();
      }
    } catch (err) {
      alert('Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'artisan') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)]">Artisan Access Only</h2>
            <p className="text-[var(--text-muted)]">You need an artisan account to view and bid on job requests.</p>
            <Link to="/become-artisan" className="inline-block bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-3 rounded-2xl font-bold">
              Become an Artisan
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12 bg-[var(--bg)] text-[var(--text)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[var(--text)]">
              Job <span className="text-[var(--accent)]">Opportunities.</span>
            </h1>
            <p className="text-[var(--text-muted)] text-lg max-w-xl">Find nearby jobs that match your expertise and submit your best proposals.</p>
          </div>
          
          <div className="flex bg-[var(--card-bg)] p-1 rounded-2xl border border-[var(--border)] shadow-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
            >
              All Jobs
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === 'urgent' ? 'bg-[var(--destructive)] text-white' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
            >
              Urgent
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-24 bg-[var(--card-bg)]/5 border border-dashed border-[var(--border)] rounded-[40px] space-y-4">
            <Navigation size={48} className="mx-auto text-[var(--text-muted)]/20" />
            <h3 className="text-xl font-bold text-[var(--text)]">No jobs found nearby</h3>
            <p className="text-[var(--text-muted)]">Check back later or expand your service radius in settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs?.map((job) => (
              <div key={job.id} className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:border-[var(--accent)]/50 transition-all shadow-xl flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center shrink-0 overflow-hidden">
                      {job.client_avatar ? (
                        <img src={job.client_avatar} alt={job.client_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="font-bold text-[var(--accent)]">{job.client_name[0]}</div>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Client</p>
                      <p className="text-sm font-bold text-[var(--text)]">{job.client_name}</p>
                    </div>
                  </div>
                  {job.is_urgent && (
                    <div className="bg-[var(--destructive)]/10 text-[var(--destructive)] px-3 py-1 rounded-full text-[10px] font-bold border border-[var(--destructive)]/20 animate-pulse">
                      URGENT
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold mb-2 text-[var(--text)]">{job.service_title}</h3>
                <p className="text-sm text-[var(--text-muted)] mb-6 line-clamp-2 flex-1">{job.description}</p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <MapPin size={16} className="text-[var(--accent)]" />
                    <span>{job.city}, {job.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <Calendar size={16} className="text-[var(--accent)]" />
                    <span>{new Date(job.scheduled_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <Clock size={16} className="text-[var(--accent)]" />
                    <span>{new Date(job.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                  <div>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Distance</p>
                    <p className="text-lg font-bold text-[var(--text)]">{job.distance?.toFixed(1) || '?'} km away</p>
                  </div>
                  <button 
                    onClick={() => setSelectedJob(job)}
                    className="px-6 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                  >
                    View & Bid
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Proposal Modal */}
        <AnimatePresence>
          {selectedJob && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] bg-[var(--bg)]/80 backdrop-blur-xl flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-xl bg-[var(--bg)] border border-[var(--border)] rounded-[40px] overflow-hidden shadow-2xl"
              >
                <div className="p-8 border-b border-[var(--border)] flex justify-between items-center bg-[var(--card-bg)]/5">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[var(--text)]">Submit Proposal</h2>
                    <p className="text-[var(--text-muted)] text-sm">For: {selectedJob.service_title}</p>
                  </div>
                  <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-[var(--card-bg)]/10 rounded-full transition-colors">
                    <AlertCircle size={24} className="text-[var(--text-muted)]" />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Your Price (MAD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" size={18} />
                      <input 
                        type="number" 
                        value={proposalPrice}
                        onChange={(e) => setProposalPrice(e.target.value)}
                        placeholder="e.g. 250"
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm text-[var(--text)]" 
                      />
                    </div>
                    
                    {estimating ? (
                      <div className="flex items-center gap-2 px-4 py-2 text-[var(--accent)] text-[10px] font-bold animate-pulse">
                        <BrainCircuit size={14} />
                        ANALYZING MARKET DATA...
                      </div>
                    ) : aiEstimate && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-2 p-4 bg-[var(--accent)]/5 border border-[var(--accent)]/10 rounded-2xl space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2 text-[var(--accent)] font-bold text-[9px] uppercase tracking-wider">
                            <Sparkles size={12} />
                            AI Competitive Price
                          </div>
                          <button 
                            onClick={() => setProposalPrice(aiEstimate.suggested.toString())}
                            className="text-[9px] font-bold text-[var(--accent)] hover:underline"
                          >
                            Apply Suggested
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-[var(--text)]">{aiEstimate.suggested} MAD</p>
                          <p className="text-[9px] text-[var(--text-muted)] italic">Range: {aiEstimate.minPrice}-{aiEstimate.maxPrice}</p>
                        </div>
                        {aiEstimate.marketInsight && (
                          <p className="text-[9px] text-[var(--accent)] font-medium leading-tight opacity-80">
                            {aiEstimate.marketInsight}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">Message to Client</label>
                    <textarea 
                      value={proposalComment}
                      onChange={(e) => setProposalComment(e.target.value)}
                      placeholder="Explain why you're the best fit..."
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm h-32 resize-none text-[var(--text)]"
                    />
                  </div>

                  <div className="p-4 bg-[var(--accent)]/5 rounded-2xl border border-[var(--accent)]/10 flex items-start gap-3">
                    <Sparkles size={18} className="text-[var(--accent)] shrink-0 mt-0.5" />
                    <p className="text-xs text-[var(--text-muted)] italic">
                      Pro-tip: Mention your relevant experience and when you can start to increase your chances of being selected.
                    </p>
                  </div>

                  <button 
                    disabled={submitting || !proposalPrice}
                    onClick={() => handleProposal(selectedJob.id)}
                    className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Send Proposal'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
