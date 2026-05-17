import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  MapPin, 
  Mail, 
  Phone, 
  Award, 
  Briefcase, 
  CheckCircle, 
  Star 
} from 'lucide-react';

interface ProfileTabProps {
  user: any;
  stats: any;
  personalInfo: { name: string; phone: string };
  setPersonalInfo: (info: { name: string; phone: string }) => void;
  artisanSettings: any;
  setArtisanSettings: (settings: any) => void;
  fieldErrors: Record<string, string>;
  validateProfileField: (name: string, value: any) => boolean;
  updateProfile: (data: any) => Promise<void>;
  onAction: (msg: string) => void;
}

export function ProfileTab({
  user,
  stats,
  personalInfo,
  setPersonalInfo,
  artisanSettings,
  setArtisanSettings,
  fieldErrors,
  validateProfileField,
  updateProfile,
  onAction
}: ProfileTabProps) {
  const { t } = useTranslation();

  const [isEditing, setIsEditing] = React.useState(false);

  const handleSaveProfile = async () => {
    // Validate everything
    const isNameValid = validateProfileField('name', personalInfo.name);
    const isExpertiseValid = validateProfileField('expertise', artisanSettings.expertise);
    const isBioValid = validateProfileField('bio', artisanSettings.bio);

    if (isNameValid && isExpertiseValid && isBioValid) {
      try {
        await updateProfile({
          name: personalInfo.name,
          phone: personalInfo.phone,
          expertise: artisanSettings.expertise,
          bio: artisanSettings.bio,
          years_experience: artisanSettings.yearsExperience,
          certifications: artisanSettings.certifications
        });
        setIsEditing(false);
        onAction(t('profile_updated_success', 'Profile updated successfully!'));
      } catch (error) {
        console.error("Profile update error:", error);
      }
    }
  };

  return (
    <div className="space-y-12">
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[48px] p-12 glass relative overflow-hidden text-left">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-muted)] opacity-20" />
        
        <div className="flex flex-col md:flex-row gap-12 relative z-10">
          <div className="relative">
            <div className="w-48 h-48 rounded-[40px] overflow-hidden border-8 border-[var(--card-bg)] shadow-2xl relative group">
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=FFD700&color=000&size=200`} alt={user?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <button 
                onClick={() => onAction?.('Changing avatar...')}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera size={32} className="text-white" />
              </button>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-[var(--success)] text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-[var(--success)]/40 border-4 border-[var(--card-bg)]">
              <CheckCircle size={28} />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {isEditing ? (
                  <input 
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                    className="text-4xl font-black bg-transparent border-b-2 border-[var(--accent)] focus:outline-none uppercase tracking-tighter w-full mb-2"
                  />
                ) : (
                  <h3 className="text-5xl font-black text-[var(--text)] italic uppercase tracking-tighter mb-2">{user?.name}</h3>
                )}
                <div className="flex items-center gap-4 text-sm font-bold text-[var(--text-muted)] opacity-80 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><MapPin size={16} className="text-[var(--accent)]" /> {user?.city || 'Casablanca'}, Morocco</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]" />
                  <span className="flex items-center gap-1.5 text-[var(--success)]"><Award size={16} /> Verified Expert</span>
                </div>
              </div>
              <div className="flex gap-4">
                {isEditing ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-8 py-4 border-2 border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--text)]/5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                    >
                      {t('cancel', 'Cancel')}
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      className="px-8 py-4 bg-[var(--accent)] text-white hover:opacity-90 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                    >
                      {t('save_changes', 'Save Changes')}
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-8 py-4 border-2 border-[var(--text)] text-[var(--text)] hover:bg-[var(--text)] hover:text-[var(--bg)] rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                  >
                    {t('edit_profile', 'Edit Profile')}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-[var(--border)]">
              {[
                { label: t('experience', 'Experience'), value: `${artisanSettings.yearsExperience} Years`, icon: <Briefcase size={14} /> },
                { label: t('rating', 'Rating'), value: stats.rating, icon: <Star size={14} /> },
                { label: t('completed', 'Completed'), value: stats.completedJobs, icon: <CheckCircle size={14} /> },
                { label: t('success_rate', 'Success Rate'), value: '98%', icon: <Award size={14} /> }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[var(--text-muted)] opacity-60">
                    <div className="w-3.5 h-3.5">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                  <span className="text-xl font-black text-[var(--text)]">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 text-left">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-60">
                {t('about_me', 'Professional Biography')}
              </h4>
              {isEditing ? (
                <textarea 
                  value={artisanSettings.bio}
                  onChange={(e) => setArtisanSettings({ ...artisanSettings, bio: e.target.value })}
                  rows={4}
                  className="w-full bg-[var(--text)]/5 border border-[var(--border)] rounded-2xl p-4 focus:outline-none focus:border-[var(--accent)] text-[var(--text)] font-medium italic"
                />
              ) : (
                <p className="text-[var(--text)] font-medium leading-relaxed max-w-2xl text-lg italic">
                  "{user?.bio || "Expert artisan with over 8 years of experience in high-end construction and repair. Dedicated to precision, reliability, and client satisfaction. Specializing in advanced electrical systems and luxury plumbing solutions."}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-10 glass text-left">
          <h4 className="text-xl font-black text-[var(--text)] italic uppercase tracking-tight mb-8 tracking-tighter">{t('contact_information', 'Contact Information')}</h4>
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-[var(--text)]/5 rounded-3xl border border-[var(--border)] group hover:bg-[var(--text)]/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1 opacity-60">Email Address</p>
                <p className="font-bold text-[var(--text)]">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 p-6 bg-[var(--text)]/5 rounded-3xl border border-[var(--border)] group hover:bg-[var(--text)]/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1 opacity-60">Phone Number</p>
                {isEditing ? (
                  <input 
                    type="text"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="font-bold text-[var(--text)] bg-transparent border-b border-[var(--border)] focus:outline-none"
                  />
                ) : (
                  <p className="font-bold text-[var(--text)]">{user?.phone || '+212 600 000 000'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-10 glass text-left">
          <h4 className="text-xl font-black text-[var(--text)] italic uppercase tracking-tight mb-8 tracking-tighter">{t('certifications_badges', 'Certifications & Badges')}</h4>
          <div className="flex flex-wrap gap-4">
            {[
              { name: 'Top Rated', color: 'bg-yellow-500/10 text-yellow-600', icon: <Star size={16} /> },
              { name: 'Identity Verified', color: 'bg-emerald-500/10 text-emerald-600', icon: <CheckCircle size={16} /> },
              { name: 'Fast Responder', color: 'bg-blue-500/10 text-blue-600', icon: <ClockIcon size={16} /> },
              { name: 'Expert Level', color: 'bg-purple-500/10 text-purple-600', icon: <Award size={16} /> }
            ].map((badge, idx) => (
              <div key={idx} className={`${badge.color} px-6 py-3 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-black/5`}>
                <div className="w-4 h-4">
                  {badge.icon}
                </div>
                {badge.name}
              </div>
            ))}
          </div>
          <div className="mt-8 p-6 bg-[var(--text)]/5 rounded-3xl border border-[var(--border)]">
            <p className="text-sm font-bold text-[var(--text-muted)] italic text-center">"{t('badge_info', 'Badges are automatically awarded based on your performance, reliability, and customer feedback.')}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Renamed to avoid shadow or conflict
function ClockIcon({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/1999/xlink" 
      viewBox="0 0 24 24" 
      width={size} 
      height={size} 
      stroke="currentColor" 
      fill="none" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
