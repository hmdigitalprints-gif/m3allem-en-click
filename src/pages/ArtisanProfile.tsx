import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Calendar, MessageSquare, ShieldCheck, Award, CheckCircle2, Video } from 'lucide-react';
import Layout from '../components/layout/Layout';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url?: string;
}

interface Review {
  id: string;
  client_name: string;
  client_avatar: string;
  stars: number;
  review: string;
  created_at: string;
}

interface ArtisanProfileData {
  id: string;
  name: string;
  avatar_url: string;
  category_name: string;
  bio: string;
  expertise: string;
  years_experience: number;
  certifications?: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_online?: boolean;
  city?: string;
  user_id: string;
  portfolio: PortfolioItem[];
  services?: any[];
  reviews: Review[];
}

export default function ArtisanProfile() {
  const { id } = useParams();
  const [artisan, setArtisan] = useState<ArtisanProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/marketplace/artisans/${id}`)
      .then(res => res.json())
      .then(data => {
        setArtisan(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching artisan profile:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] bg-[var(--bg)]">
          <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!artisan) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center bg-[var(--bg)]">
          <h2 className="text-2xl font-bold mb-4 text-[var(--text)]">Artisan not found</h2>
          <Link to="/find-pro" className="text-[var(--accent)] hover:underline">Return to search</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-4xl mx-auto bg-[var(--bg)]">
        <Link to="/find-pro" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mb-8">
          <ArrowLeft size={20} /> Back to Search
        </Link>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row gap-12 items-start relative overflow-hidden mb-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-[var(--bg)] shrink-0 border-4 border-[var(--border)] shadow-2xl relative">
            <img src={artisan.avatar_url} alt={artisan.name} className="w-full h-full object-cover rounded-full" />
            {artisan.is_online && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-[var(--success)] rounded-full border-4 border-[var(--bg)]"></div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 text-[var(--text)]">{artisan.name}</h1>
                <p className="text-[var(--accent)] text-xl font-medium flex items-center gap-2">
                  {artisan.category_name} {artisan.is_verified && <ShieldCheck size={20} />}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-[var(--bg)] px-4 py-2 rounded-2xl flex items-center gap-2 font-bold text-lg text-[var(--text)] border border-[var(--border)]">
                  <Star size={20} className="text-[var(--accent)] fill-[var(--accent)]" /> {artisan.rating}
                </div>
                <span className="text-[var(--text-muted)] text-sm">({artisan.review_count} reviews)</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-[var(--text-muted)] mb-8">
              <div className="flex items-center gap-2"><MapPin size={18} className="text-[var(--accent)]" /> {artisan.city || 'Casablanca, Morocco'}</div>
              <div className="flex items-center gap-2"><Calendar size={18} className="text-[var(--accent)]" /> {artisan.years_experience}+ Years Experience</div>
            </div>

            <p className="text-[var(--text)]/80 text-lg leading-relaxed mb-10 font-light">
              {artisan.bio}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-[var(--accent)] text-[var(--accent-foreground)] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[var(--accent)]/90 transition-colors flex items-center justify-center gap-3">
                <Calendar size={20} /> Book Now
              </button>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('start-live-diagnostic', { detail: { artisanId: artisan.id, artisanName: artisan.name, artisanUserId: artisan.user_id } }))}
                className="flex-1 bg-[var(--destructive)]/10 text-[var(--destructive)] border border-[var(--destructive)]/20 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[var(--destructive)]/20 transition-colors flex items-center justify-center gap-3"
              >
                <Video size={20} /> Live Diagnostic
              </button>
              <button className="flex-1 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[var(--bg)]/80 transition-colors flex items-center justify-center gap-3">
                <MessageSquare size={20} /> Send Message
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1 space-y-8">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-8 shadow-xl">
              <h3 className="font-bold mb-6 flex items-center gap-2 text-[var(--text)]">
                <Award size={18} className="text-[var(--accent)]" />
                Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {artisan?.expertise?.split(',')?.map((skill, i) => (
                  <span 
                    key={i}
                    className="px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-muted)]"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            {artisan.certifications && (
              <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-8 shadow-xl">
                <h3 className="font-bold mb-6 flex items-center gap-2 text-[var(--text)]">
                  <ShieldCheck size={18} className="text-[var(--accent)]" />
                  Certifications
                </h3>
                <div className="flex flex-col gap-3">
                  {artisan?.certifications?.split(',')?.map((cert, i) => (
                    <div key={i} className="flex items-start gap-3 text-[var(--text-muted)] text-sm">
                      <CheckCircle2 size={16} className="text-[var(--success)] mt-0.5 shrink-0" />
                      <span>{cert.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-6 text-[var(--text)]">Portfolio</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {artisan?.portfolio?.map((item) => (
                <div key={item.id} className="group bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl">
                  <div className="h-48 overflow-hidden relative">
                    {item.video_url ? (
                      <video 
                        src={item.video_url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        controls
                        muted
                        loop
                      />
                    ) : (
                      <img 
                        src={item.image_url} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt={item.title} 
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold mb-2 text-[var(--text)]">{item.title}</h4>
                    <p className="text-[var(--text-muted)] text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
              {artisan.portfolio.length === 0 && (
                <div className="col-span-2 text-center py-12 text-[var(--text-muted)] bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl">
                  No portfolio items available yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold tracking-tighter text-[var(--text)]">
              Client <span className="text-[var(--accent)]">Reviews.</span>
            </h3>
            <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--border)] px-4 py-2 rounded-2xl">
              <Star size={20} className="text-[var(--accent)] fill-[var(--accent)]" />
              <span className="font-bold text-lg">{artisan.rating}</span>
              <span className="text-[var(--text-muted)] text-sm">({artisan.review_count} reviews)</span>
            </div>
          </div>

          <div className="space-y-6">
            {artisan.reviews?.map((review) => (
              <div key={review.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-8 shadow-xl">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[var(--bg)] border border-[var(--border)] overflow-hidden">
                      {review.client_avatar ? (
                        <img src={review.client_avatar} alt={review.client_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] font-bold">
                          {review.client_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text)]">{review.client_name}</h4>
                      <p className="text-[var(--text-muted)] text-xs">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        className={i < review.stars ? "text-[var(--accent)] fill-[var(--accent)]" : "text-[var(--border)]"} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[var(--text)]/80 leading-relaxed italic">
                  "{review.review}"
                </p>
              </div>
            ))}
            {(!artisan.reviews || artisan.reviews.length === 0) && (
              <div className="text-center py-16 bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px]">
                <p className="text-[var(--text-muted)] text-lg">No reviews yet. Be the first to book and leave a review!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}
