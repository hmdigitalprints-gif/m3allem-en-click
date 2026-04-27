import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Users, ArrowRight, MapPin, Calendar, CheckCircle2, Plus, Info } from 'lucide-react';
import Layout from '../components/layout/Layout';
import BookingModal from '../components/marketplace/BookingModal';

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_percentage: number;
  service_names: string[];
  service_ids: string[];
}

interface GroupRequest {
  id: string;
  title: string;
  description: string;
  creator_name: string;
  service_name: string;
  participant_count: number;
  min_participants: number;
  max_participants: number;
  current_price_per_user: number;
  address: string;
  scheduled_at: string;
}

export default function MarketplaceExtras() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [groupRequests, setGroupRequests] = useState<GroupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'packages' | 'groups'>('packages');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, grpRes] = await Promise.all([
          fetch('/api/marketplace-extras/packages'),
          fetch('/api/marketplace-extras/group-requests')
        ]);
        const pkgData = await pkgRes.json();
        const grpData = await grpRes.json();
        setPackages(pkgData);
        setGroupRequests(grpData);
      } catch (error) {
        console.error("Error fetching marketplace extras:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleJoinGroup = async (id: string) => {
    try {
      const res = await fetch(`/api/marketplace-extras/group-requests/${id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}`
        }
      });
      if (res.ok) {
        alert("Successfully joined the group request!");
        // Refresh data
        const grpRes = await fetch('/api/marketplace-extras/group-requests');
        setGroupRequests(await grpRes.json());
      } else {
        const data = await res.json();
        alert(data.error || "Failed to join group");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12 bg-[var(--bg)] text-[var(--text)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-4 text-[var(--text)]">{t('extras_title', 'Marketplace Extras')}</h1>
            <p className="text-[var(--text-muted)] max-w-2xl">
              Discover multi-service bundles and join group requests to save money and get more done.
            </p>
          </div>
          
          <div className="flex bg-[var(--card-bg)] p-1 rounded-2xl border border-[var(--border)] shadow-lg">
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'packages' ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
            >
              Bundles
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'groups' ? 'bg-[var(--accent)] text-[var(--accent-foreground)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
            >
              Group Requests
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
          </div>
        ) : activeTab === 'packages' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages?.map((pkg) => (
              <div key={pkg.id} className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:border-[var(--accent)]/50 transition-all shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center text-[var(--accent)]">
                    <Package size={24} />
                  </div>
                  <div className="bg-[var(--success)]/10 text-[var(--success)] px-4 py-1 rounded-full text-xs font-bold border border-[var(--success)]/20">
                    Save {pkg.discount_percentage}%
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-[var(--text)]">{pkg.name}</h3>
                <p className="text-sm text-[var(--text-muted)] mb-6 line-clamp-2">{pkg.description}</p>
                
                <div className="space-y-3 mb-8">
                  {pkg?.service_names?.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-[var(--text)]/80">
                      <CheckCircle2 size={16} className="text-[var(--success)]" />
                      {s}
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider">Bundle Price</p>
                    <p className="text-2xl font-bold text-[var(--accent)]">{pkg.price} MAD</p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setShowBookingModal(true);
                    }}
                    className="w-12 h-12 bg-[var(--bg)] border border-[var(--border)] rounded-2xl flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-foreground)] transition-all text-[var(--text)]"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Custom Bundle CTA */}
            <div className="bg-gradient-to-br from-[var(--accent)]/20 to-transparent border border-[var(--accent)]/20 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center shadow-2xl">
              <div className="w-16 h-16 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-3xl flex items-center justify-center mb-6">
                <Plus size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--text)]">Custom Bundle</h3>
              <p className="text-[var(--text-muted)] text-sm mb-8">Need something specific? Create your own multi-service request and get a custom quote.</p>
              <button className="px-8 py-3 bg-[var(--text)] text-[var(--bg)] rounded-2xl font-bold hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-all">
                Request Custom
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {groupRequests?.map((req) => (
              <div key={req.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:border-[var(--accent)]/50 transition-all shadow-xl">
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-[var(--bg)] text-[var(--text-muted)] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[var(--border)]">
                        {req.service_name}
                      </span>
                      <span className="text-[var(--text-muted)]/20">•</span>
                      <span className="text-[var(--text-muted)] text-xs flex items-center gap-1">
                        <Users size={12} />
                        {req.participant_count}/{req.max_participants || '∞'} joined
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-[var(--text)]">{req.title}</h3>
                    <p className="text-[var(--text-muted)] text-sm line-clamp-2">{req.description}</p>
                  </div>
                  
                  <div className="bg-[var(--bg)] rounded-3xl p-6 flex flex-col items-center justify-center min-w-[140px] border border-[var(--border)]">
                    <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold mb-1">Price per user</p>
                    <p className="text-2xl font-bold text-[var(--accent)]">{req.current_price_per_user} MAD</p>
                    <p className="text-[10px] text-[var(--success)] font-bold mt-1 flex items-center gap-1">
                      <Info size={10} />
                      Group Discount
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <div className="w-8 h-8 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center justify-center">
                      <MapPin size={14} />
                    </div>
                    <span className="truncate">{req.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                    <div className="w-8 h-8 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center justify-center">
                      <Calendar size={14} />
                    </div>
                    <span>{new Date(req.scheduled_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full flex items-center justify-center font-bold text-sm">
                      {req.creator_name[0]}
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Organized by</p>
                      <p className="text-sm font-bold text-[var(--text)]">{req.creator_name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleJoinGroup(req.id)}
                    className="px-8 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-[var(--accent)]/20"
                  >
                    Join Group
                  </button>
                </div>
              </div>
            ))}
            
            {/* Create Group CTA */}
            <div className="bg-[var(--card-bg)] border border-dashed border-[var(--border)] rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center shadow-xl">
              <div className="w-16 h-16 bg-[var(--bg)] text-[var(--text-muted)]/40 rounded-3xl flex items-center justify-center mb-6 border border-[var(--border)]">
                <Users size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-[var(--text)]">Start a Group Request</h3>
              <p className="text-[var(--text-muted)] text-sm mb-8">Organize a collective service for your building or neighborhood and unlock lower prices for everyone.</p>
              <button className="px-8 py-3 border border-[var(--border)] text-[var(--text)] rounded-2xl font-bold hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all">
                Create Group
              </button>
            </div>
          </div>
        )}
      </div>

      {showBookingModal && selectedPackage && (
        <BookingModal 
          artisan={{
            id: 'package-artisan',
            user_id: 'package-user',
            name: 'Package Specialist',
            avatar_url: 'https://picsum.photos/seed/specialist/100/100',
            category_id: 'package-cat',
            category_name: 'Multi-Service',
            bio: 'Expert in bundled services',
            expertise: 'Bundled Services',
            years_experience: 10,
            rating: 4.9,
            review_count: 120,
            is_verified: true,
            is_online: true,
            city: 'Casablanca'
          }}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            alert("Package request submitted successfully!");
          }}
        />
      )}
    </Layout>
  );
}
