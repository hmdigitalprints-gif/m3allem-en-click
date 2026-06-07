import React, { useState, useEffect } from 'react';
import { Box, Filter, Search, Loader2, Star, Shield, Trash2, Check, Scissors, RefreshCw, MessageCircle } from 'lucide-react';
import { ViewProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContentModerationView({ onAction }: ViewProps) {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<{ lowRatings: any[], contentReports: any[] }>({ lowRatings: [], contentReports: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQueueTab, setActiveQueueTab] = useState<'ratings' | 'reports'>('ratings');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/moderation/queue', { credentials: 'include' });
      const data = await res.json();
      setQueue(data);
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleCensorRating = async (ratingId: string) => {
    try {
      const res = await fetch(`/api/admin/moderation/rating/${ratingId}/censor`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (res.ok) {
        onAction?.('Review censored successfully');
        fetchQueue();
      } else {
        onAction?.('Failed to censor review');
      }
    } catch (error) {
      console.error(error);
      onAction?.('Error censoring review');
    }
  };

  const handleDeleteRating = async (ratingId: string) => {
    try {
      const res = await fetch(`/api/admin/moderation/rating/${ratingId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        onAction?.('Review deleted successfully');
        fetchQueue();
      } else {
        onAction?.('Failed to delete review');
      }
    } catch (error) {
      console.error(error);
      onAction?.('Error deleting review');
    }
  };

  const handleCensorMessage = async (messageId: string, reportId?: string) => {
    try {
      const res = await fetch(`/api/admin/moderation/message/${messageId}/censor`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (res.ok) {
        onAction?.('Message censored successfully');
        if (reportId) {
          // Auto resolve associated report
          await fetch(`/api/admin/reports/${reportId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'resolved', resolutionDetails: 'Message censored by moderator' }),
            credentials: 'include'
          });
        }
        fetchQueue();
      } else {
        onAction?.('Failed to censor message');
      }
    } catch (error) {
      console.error(error);
      onAction?.('Error censoring message');
    }
  };

  const handleDeleteMessage = async (messageId: string, reportId?: string) => {
    try {
      const res = await fetch(`/api/admin/moderation/message/${messageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        onAction?.('Message deleted successfully');
        if (reportId) {
          // Auto resolve associated report
          await fetch(`/api/admin/reports/${reportId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'resolved', resolutionDetails: 'Message deleted by moderator' }),
            credentials: 'include'
          });
        }
        fetchQueue();
      } else {
        onAction?.('Failed to delete message');
      }
    } catch (error) {
      console.error(error);
      onAction?.('Error deleting message');
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed', resolutionDetails: 'Content dismissed as clean' }),
        credentials: 'include'
      });
      if (res.ok) {
        onAction?.('Report content dismissed as safe');
        fetchQueue();
      } else {
        onAction?.('Failed to dismiss report');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredRatings = queue.lowRatings.filter(r => 
    (r.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reported_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = queue.contentReports.filter(r => 
    (r.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.reporter?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.reported?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pt-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Content Moderation Queue</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
            Review and censor low-star reviews, flagged texts, and complained messages.
          </p>
        </div>
        <button 
          onClick={fetchQueue} 
          className="flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] hover:bg-[var(--border)] border border-[var(--border)] text-xs font-bold uppercase tracking-wider text-[var(--text)] rounded-xl transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Content
        </button>
      </div>

      {/* Selector Tabs */}
      <div className="flex border-b border-[var(--border)] gap-6">
        <button 
          onClick={() => setActiveQueueTab('ratings')}
          className={`pb-4 text-xs font-black uppercase tracking-wider relative transition-colors cursor-pointer ${
            activeQueueTab === 'ratings' ? 'text-white' : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          Low Star Ratings Queue ({queue.lowRatings.length})
          {activeQueueTab === 'ratings' && (
            <motion.div layoutId="moderationTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD700]" />
          )}
        </button>
        <button 
          onClick={() => setActiveQueueTab('reports')}
          className={`pb-4 text-xs font-black uppercase tracking-wider relative transition-colors cursor-pointer ${
            activeQueueTab === 'reports' ? 'text-white' : 'text-[var(--text-muted)] hover:text-white'
          }`}
        >
          Abuse Content Reports ({queue.contentReports.length})
          {activeQueueTab === 'reports' && (
            <motion.div layoutId="moderationTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD700]" />
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center px-5 py-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] focus-within:border-[#FFD700]/50 transition-colors shadow-inner max-w-md">
        <Search size={18} className="text-[var(--text-muted)]" />
        <input 
          type="text" 
          placeholder={activeQueueTab === 'ratings' ? "Search low star reviews..." : "Search abuse reports..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none w-full ml-3 text-sm font-bold text-[var(--text)] placeholder:text-[var(--text-muted)]" 
        />
      </div>

      {/* Display Queues */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#FFD700]" />
          <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Processing moderation queue...</p>
        </div>
      ) : activeQueueTab === 'ratings' ? (
        // RATINGS QUEUE
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRatings.length === 0 ? (
            <div className="col-span-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl py-16 text-center text-sm font-bold text-[var(--text-muted)]">
              All star ratings cleared and approved. No reports in review queue !
            </div>
          ) : filteredRatings.map((rating) => (
            <div key={rating.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 relative flex flex-col justify-between shadow-sm hover:border-[#FFD700]/10 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/15 rounded-lg text-xs font-black">
                    <Star size={12} fill="currentColor" />
                    {rating.stars} Stars Audit
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">{new Date(rating.created_at).toLocaleDateString()}</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Client Feedback</p>
                    <p className="text-sm font-semibold text-[var(--text)] italic bg-black/30 p-4 rounded-xl border border-[var(--border)]">
                      "{rating.content || 'No text review comment provided.'}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                    <div>
                      <span className="text-[var(--text-muted)] block uppercase tracking-wider mb-0.5">Left By</span>
                      <span className="text-white bg-white/5 border border-[var(--border)] px-2 py-0.5 rounded-md inline-block">{rating.reporter_name}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block uppercase tracking-wider mb-0.5">Target Artisan</span>
                      <span className="text-[#FFD700] bg-[#FFD700]/5 border border-[#FFD700]/10 px-2 py-0.5 rounded-md inline-block">{rating.reported_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-[var(--border)] pt-4 flex gap-3">
                <button 
                  onClick={() => handleCensorRating(rating.id)}
                  className="flex-1 py-2.5 rounded-xl border border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/15 transition-all text-xs font-black text-orange-400 uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Scissors size={14} />
                  Censor Text
                </button>
                <button 
                  onClick={() => handleDeleteRating(rating.id)}
                  className="flex-1 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/15 transition-all text-xs font-black text-red-500 uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  Delete Review
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // REPORTS CONTENT QUEUE
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.length === 0 ? (
            <div className="col-span-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl py-16 text-center text-sm font-bold text-[var(--text-muted)]">
              All reported messages and interactions investigated and closed. Clean!
            </div>
          ) : filteredReports.map((report) => (
            <div key={report.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 relative flex flex-col justify-between shadow-sm hover:border-red-500/10 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 capitalize">
                    <MessageCircle size={14} />
                    Reported {report.contentType}
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-red-500">Reason for abuse notification:</span>
                    <p className="text-sm font-black text-white mt-0.5">{report.reason}</p>
                  </div>

                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Details Reported</span>
                    <p className="text-xs font-semibold text-[var(--text-muted)] bg-black/30 p-3 rounded-lg border border-[var(--border)] whitespace-pre-wrap mt-0.5">
                      {report.details || 'No content message logs attachable.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                    <div>
                      <span className="text-[var(--text-muted)] block uppercase tracking-wider mb-0.5">Reporter</span>
                      <span className="text-white">{report.reporter?.name || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block uppercase tracking-wider mb-0.5">Reported Actor</span>
                      <span className="text-red-400">{report.reported?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action operations on associated message */}
              <div className="border-t border-[var(--border)] pt-4 space-y-2">
                {report.contentType === 'message' && report.contentId && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleCensorMessage(report.contentId, report.id)}
                      className="flex-1 py-2 bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/20 rounded-xl text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center justify-center gap-1"
                    >
                      <Scissors size={12} />
                      Censor Text
                    </button>
                    <button 
                      onClick={() => handleDeleteMessage(report.contentId, report.id)}
                      className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 rounded-xl text-xs font-bold text-red-500 uppercase tracking-wider flex items-center justify-center gap-1"
                    >
                      <Trash2 size={12} />
                      Kill Message
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={() => handleDismissReport(report.id)}
                  className="w-full py-2 bg-gray-500/10 hover:bg-gray-500/15 text-xs text-white uppercase font-black tracking-wider rounded-xl transition-all border border-gray-500/20"
                >
                  Dismiss & Reject Abuse Alert
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
