import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Settings, CreditCard, ShieldCheck, LogOut, ChevronRight, Sparkles, Globe, MapPin } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { AddressInput } from '../components/ui/AddressInput';

export default function Profile() {
  const { t } = useTranslation();
  const { user, updateLanguage, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(user?.name || '');
  const [editAvatar, setEditAvatar] = React.useState<string | null>(user?.avatar_url || null);
  const [editCity, setEditCity] = React.useState(user?.city || 'Casablanca');
  const [editAddress, setEditAddress] = React.useState(user?.address || '');
  const [loading, setLoading] = React.useState(false);
  const [langLoading, setLangLoading] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setEditName(user.name);
      setEditAvatar(user.avatar_url || null);
      setEditCity(user.city || 'Casablanca');
      setEditAddress(user.address || '');
    }
  }, [user]);

  const handleUpdateLanguage = async (lang: string) => {
    setLangLoading(true);
    try {
      await updateLanguage(lang);
    } catch (err) {
      console.error(err);
    } finally {
      setLangLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({ 
        name: editName, 
        avatarUrl: editAvatar || undefined,
        city: editCity,
        address: editAddress
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[var(--text)]">
            {t('profile_title_1', 'Your ')} <span className="text-[var(--accent)]">{t('profile_title_2', 'Profile.')}</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg">{t('profile_subtitle', 'Manage your account and preferences.')}</p>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 md:p-12 mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-[var(--bg)] border-4 border-[var(--accent)]/20 flex items-center justify-center shrink-0 overflow-hidden">
              {editAvatar || user?.avatar_url ? (
                <img src={editAvatar || user?.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-[var(--text-muted)]" />
              )}
            </div>
            {isEditing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Settings size={24} className="text-white" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2 w-full text-2xl font-bold focus:outline-none focus:border-[var(--accent)]/50 text-[var(--text)]"
                />
                <div className="pt-4 border-t border-[var(--border)]">
                  <AddressInput 
                    city={editCity}
                    address={editAddress}
                    onCityChange={setEditCity}
                    onAddressChange={setEditAddress}
                  />
                </div>
                <div className="flex justify-center md:justify-start gap-3">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : t('profile_btn_save', 'Save Changes')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setIsEditing(false); setEditName(user.name); setEditAvatar(user.avatar_url); }}
                    className="bg-[var(--card-bg)] hover:bg-[var(--bg)] text-[var(--text)] px-6 py-2 rounded-xl font-bold transition-colors border border-[var(--border)]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-2 text-[var(--text)]">{user?.name || 'Loading...'}</h2>
                <p className="text-[var(--text-muted)] mb-2">{user?.phone || ''}</p>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-4">
                  <MapPin size={14} className="text-[var(--accent)]" />
                  <span>{user?.address ? `${user.address}, ${user.city}` : 'No address set'}</span>
                </div>
                
                <div className="inline-flex items-center gap-3 bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-4 py-2 rounded-2xl mb-6">
                  <Sparkles size={18} className="text-[var(--accent)]" />
                  <span className="font-bold text-[var(--accent)]">{user?.points || 0} Loyalty Points</span>
                </div>

                <div className="flex justify-center md:justify-start">
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-[var(--card-bg)] hover:bg-[var(--bg)] text-[var(--text)] px-6 py-3 rounded-2xl font-bold transition-colors text-sm border border-[var(--border)]"
                  >
                    {t('profile_btn_edit', 'Edit Profile')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 md:p-12 mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-12 h-12 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--accent)]">
              <Globe size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-1 text-[var(--text)]">Language Preference</h3>
              <p className="text-[var(--text-muted)] text-sm">Choose your preferred language for the app.</p>
            </div>
            <select 
              value={user?.preferred_language || 'fr'}
              onChange={(e) => handleUpdateLanguage(e.target.value)}
              disabled={langLoading}
              className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 disabled:opacity-50 appearance-none cursor-pointer min-w-[120px]"
            >
              <option value="fr" className="bg-[var(--card-bg)]">Français</option>
              <option value="en" className="bg-[var(--card-bg)]">English</option>
              <option value="ar" className="bg-[var(--card-bg)]">العربية</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { icon: <Settings size={20} />, label: 'Account Settings', desc: 'Personal details, password' },
            { icon: <CreditCard size={20} />, label: 'Payment Methods', desc: 'Cards, billing history' },
            { icon: <ShieldCheck size={20} />, label: 'Privacy & Security', desc: '2FA, connected devices' },
          ]?.map((item, i) => (
            <button key={i} className="w-full bg-[var(--card-bg)] hover:bg-[var(--bg)] border border-[var(--border)] rounded-3xl p-6 flex items-center gap-6 transition-colors group text-left">
              <div className="w-12 h-12 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1 text-[var(--text)]">{item.label}</h3>
                <p className="text-[var(--text-muted)] text-sm">{item.desc}</p>
              </div>
              <ChevronRight size={20} className="text-[var(--text-muted)]/20 group-hover:text-[var(--text)] transition-colors" />
            </button>
          ))}
        </div>

        <button 
          onClick={logout}
          className="w-full mt-12 bg-[var(--destructive)]/10 hover:bg-[var(--destructive)]/20 text-[var(--destructive)] border border-[var(--destructive)]/20 rounded-3xl py-5 font-bold flex items-center justify-center gap-3 transition-colors"
        >
          <LogOut size={20} /> {t('profile_btn_logout', 'Log Out')}
        </button>
      </div>
    </Layout>
  );
}
