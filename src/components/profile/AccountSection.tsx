import React, { useState } from 'react';
import { 
  Camera, 
  ShieldCheck, 
  Wallet, 
  Heart, 
  ChevronRight, 
  Save, 
  ArrowLeft 
} from 'lucide-react';
import WalletSection from './WalletSection';
import { useTranslation } from 'react-i18next';

export default function AccountSection({ onAction }: { onAction: (msg: string) => void }) {
  const { t } = useTranslation();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('m3allem_user') || '{}'));
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [showWallet, setShowWallet] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}`
            },
            body: JSON.stringify({ file: base64, type: 'image' })
          });
          if (res.ok) {
            const data = await res.json();
            setAvatarUrl(data.url);
          }
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('m3allem_token')}`
        },
        body: JSON.stringify({ name, avatarUrl })
      });
      if (res.ok) {
        const updatedUser = { ...user, name, phone, address, avatar_url: avatarUrl };
        localStorage.setItem('m3allem_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        onAction('Profile updated successfully');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (showWallet) {
    return (
      <div className="relative">
        <button 
          onClick={() => {
            onAction('Returning to profile...');
            setShowWallet(false);
          }}
          className="absolute top-6 left-6 md:top-12 md:left-12 z-20 flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors font-bold"
        >
          <ArrowLeft size={20} />
          {t('back_to_profile')}
        </button>
        <WalletSection onAction={onAction} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12">
      <div className="mb-12">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">{t('account_title')} <span className="text-[var(--accent)]">{t('account_accent')}</span></h2>
        <p className="text-[var(--text-muted)] text-base md:text-xl">{t('account_desc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 text-center">
            <div className="w-32 h-32 mx-auto mb-6 relative group">
              <img src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} className="w-full h-full rounded-[40px] object-cover border-4 border-[var(--bg)] shadow-xl" alt="" referrerPolicy="no-referrer" />
              <label 
                onClick={() => onAction('Opening camera/file upload...')}
                className="absolute bottom-0 right-0 p-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl shadow-lg hover:scale-110 transition-all active:scale-95 cursor-pointer border-4 border-[var(--bg)]"
              >
                <Camera size={18} />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            <h3 className="text-2xl font-bold mb-1">{user.name}</h3>
            <p className="text-[var(--text-muted)] text-sm mb-6">{user.phone}</p>
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-xs font-bold uppercase tracking-widest border border-[var(--accent)]/20">
              <ShieldCheck size={14} />
              {t('verified_role')} {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] p-6 space-y-2">
            <button onClick={() => {
              onAction('Opening wallet...');
              setShowWallet(true);
            }} className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg)] rounded-2xl transition-colors group">
              <div className="flex items-center gap-3">
                <Wallet size={20} className="text-[var(--accent)]" />
                <span className="font-bold">M3allem En Click {t('wallet_title')}</span>
              </div>
              <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors" />
            </button>
            <button onClick={() => onAction('Favorites feature coming soon')} className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg)] rounded-2xl transition-colors group">
              <div className="flex items-center gap-3">
                <Heart size={20} className="text-[var(--accent)]" />
                <span className="font-bold">{t('my_favorites')}</span>
              </div>
              <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 md:p-10">
            <h3 className="text-2xl font-bold mb-8">{t('profile_settings')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">{t('full_name')}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">{t('phone_number')}</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-4">{t('default_address')}</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all h-32 resize-none text-[var(--text)]" placeholder={t('address_placeholder')}></textarea>
              </div>
            </div>
            <button onClick={() => {
              onAction('Saving profile changes...');
              handleSave();
            }} className="mt-8 bg-[var(--accent)] text-[var(--accent-foreground)] px-10 py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 flex items-center gap-2">
              <Save size={20} />
              {t('save_changes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
