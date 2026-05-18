import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Save, Upload, Image as ImageIcon, Trash2, Palette, Sparkles, AlertCircle, Eye, Monitor, Smartphone, Settings } from 'lucide-react';
import { ViewProps } from '../types';

import { useAuth } from '../../../context/AuthContext';

interface BrandingViewProps extends ViewProps {
  settings: any;
  updateSettings: (settings: any) => Promise<void>;
}

export default function BrandingView({ settings, updateSettings, onAction }: BrandingViewProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [uploadingState, setUploadingState] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadKey, setCurrentUploadKey] = useState<string | null>(null);
  
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
      onAction?.('Branding settings updated successfully!');
      
      // Update css variables locally for instant feedback if color changed
      if (localSettings.branding_primary_color) {
        document.documentElement.style.setProperty('--accent', localSettings.branding_primary_color);
      }
      
      if (localSettings.branding_favicon) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = localSettings.branding_favicon;
        } else {
          const newLink = document.createElement("link");
          newLink.rel = "icon";
          newLink.href = localSettings.branding_favicon;
          document.head.appendChild(newLink);
        }
      }
    } catch (error) {
      onAction?.('Failed to update branding settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string | boolean) => {
    setLocalSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const triggerUpload = (key: string) => {
    setCurrentUploadKey(key);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUploadKey) return;

    if (file.size > 5 * 1024 * 1024) {
      onAction?.('File size exceeds 5MB limit.');
      return;
    }

    setUploadingState(currentUploadKey);
    onAction?.('Uploading logo...');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ file: base64data, type: 'image' })
        });

        if (res.ok) {
          const data = await res.json();
          handleChange(currentUploadKey, data.url);
          onAction?.('File uploaded successfully!');
        } else {
          const err = await res.json();
          onAction?.('Upload failed: ' + (err.error || 'Unknown error'));
        }
        setUploadingState(null);
        setCurrentUploadKey(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadingState(null);
      setCurrentUploadKey(null);
      onAction?.('Upload error');
    }
  };

  const LogoUploader = ({ title, description, settingKey, accepts = ".png,.jpg,.jpeg,.webp,.svg" }: { title: string, description: string, settingKey: string, accepts?: string }) => {
    const value = localSettings[settingKey] || '';
    const isUploading = uploadingState === settingKey;

    return (
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-sm font-bold text-[var(--text)] mb-1">{title}</h4>
            <p className="text-xs font-medium text-[var(--text-muted)]">{description}</p>
          </div>
          {value && (
            <button 
              onClick={() => handleChange(settingKey, '')}
              className="text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-500/10 px-2 py-1 rounded-md transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        
        <div 
          onClick={() => triggerUpload(settingKey)}
          className={`relative h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer overflow-hidden transition-all group shadow-inner ${
            value ? 'border-transparent bg-[var(--bg)]' : 'border-[var(--border)] hover:border-[#FFD700]/50 bg-[var(--card-surface)]'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-[#FFD700]">
              <Loader2 size={24} className="animate-spin mb-2" strokeWidth={2.5} />
              <span className="text-xs font-black uppercase tracking-wider">Processing...</span>
            </div>
          ) : value ? (
            <>
              <img src={value} alt={title} className="max-w-[80%] max-h-[80%] object-contain relative z-10" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center backdrop-blur-[2px]">
                <span className="text-black text-xs font-black uppercase tracking-wider bg-[#FFD700] px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                  <Upload size={16} strokeWidth={2.5} /> Replace Image
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-[var(--text-muted)] group-hover:text-[#FFD700] transition-colors">
              <Upload size={24} className="mb-2" strokeWidth={2.5} />
              <span className="text-xs font-black uppercase tracking-wider mb-1">Click to upload</span>
              <span className="text-[10px] font-bold opacity-70">SVG, PNG, WebP</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pt-4 pb-20">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".png,.jpg,.jpeg,.webp,.svg,.ico" 
        className="hidden" 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight flex items-center gap-3">
            <Sparkles className="text-[#FFD700]" size={24} strokeWidth={2.5} /> Branding & Logo
          </h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Manage your platform's visual identity, logos, and global colors.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#FFD700] text-black px-6 py-3 rounded-lg text-sm font-black uppercase tracking-wider hover:bg-[#E6C200] transition-colors active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#FFD700]/10"
          >
            {saving ? <Loader2 size={18} className="animate-spin" strokeWidth={2.5} /> : <Save size={18} strokeWidth={2.5} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--card-bg)] rounded-xl p-8 border border-[var(--border)] shadow-sm group hover:border-[#FFD700]/30 transition-colors">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4 mb-8">
              <span className="p-2 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                <ImageIcon size={20} className="text-[#FFD700]" strokeWidth={2.5} /> 
              </span>
              <h3 className="text-lg font-black text-[var(--text)] tracking-tight">Logos & Assets</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <LogoUploader 
                title="Light Mode Logo" 
                description="Used on light backgrounds. Use a dark SVG/PNG."
                settingKey="branding_logo_light" 
              />
              <LogoUploader 
                title="Dark Mode Logo" 
                description="Used on dark backgrounds. Use a light SVG/PNG."
                settingKey="branding_logo_dark" 
              />
              <LogoUploader 
                title="Symbol (Light)" 
                description="Icon only. Used in compact headers/mobile."
                settingKey="branding_symbol_light" 
              />
              <LogoUploader 
                title="Symbol (Dark)" 
                description="Icon only. Used in compact headers/mobile."
                settingKey="branding_symbol_dark" 
              />
              <LogoUploader 
                title="Favicon" 
                description="Browser tab icon (16x16 or 32x32 SVG/PNG/ICO)."
                settingKey="branding_favicon" 
                accepts=".ico,.png,.svg"
              />
            </div>
          </div>

          <div className="bg-[var(--card-bg)] rounded-xl p-8 border border-[var(--border)] shadow-sm group hover:border-[#FFD700]/30 transition-colors">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4 mb-8">
              <span className="p-2 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                <Palette size={20} className="text-[#FFD700]" strokeWidth={2.5} /> 
              </span>
              <h3 className="text-lg font-black text-[var(--text)] tracking-tight">Theme & Colors</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Primary Brand Color</label>
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-lg border border-[var(--border)] overflow-hidden shrink-0 shadow-inner">
                    <input 
                      type="color" 
                      value={localSettings.branding_primary_color || '#B68B42'} 
                      onChange={(e) => handleChange('branding_primary_color', e.target.value)}
                      className="w-[150%] h-[150%] -m-2 p-0 border-0 cursor-pointer" 
                    />
                  </div>
                  <input 
                    type="text" 
                    value={localSettings.branding_primary_color || '#B68B42'} 
                    onChange={(e) => handleChange('branding_primary_color', e.target.value)}
                    placeholder="#HEX"
                    className="flex-1 px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-mono text-sm tracking-wider focus:ring-1 focus:ring-[#FFD700]/50 outline-none transition-colors shadow-inner font-bold uppercase" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Custom Gradient Details</label>
                <input 
                  type="text" 
                  value={localSettings.branding_gradient || ''} 
                  onChange={(e) => handleChange('branding_gradient', e.target.value)}
                  placeholder="linear-gradient(135deg, #FFD700, #FF8C00)"
                  className="w-full px-5 py-4 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text)] font-mono text-sm tracking-wider focus:ring-1 focus:ring-[#FFD700]/50 outline-none transition-colors shadow-inner" 
                />
                <p className="text-[10px] font-bold text-[var(--text-muted)] mt-2 tracking-wider">CSS linear-gradient applied to primary touches.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[var(--card-bg)] rounded-xl p-8 border border-[var(--border)] shadow-sm sticky top-28 group hover:border-[#FFD700]/30 transition-colors">
            <h3 className="text-lg font-black text-[var(--text)] tracking-tight mb-8 flex items-center gap-3">
              <span className="p-2 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                <Eye size={20} className="text-[#FFD700]" strokeWidth={2.5} />
              </span>
              Live Preview
            </h3>
            
            <div className="bg-white rounded-lg p-5 mb-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 h-8 w-1/2">
                  {localSettings.branding_logo_light ? (
                    <img src={localSettings.branding_logo_light} className="h-full object-contain" />
                  ) : (
                    <div className="h-full w-full px-3 text-black font-black uppercase text-[10px] tracking-wider flex items-center justify-center bg-gray-100 rounded-lg">Logo Space</div>
                  )}
                </div>
                <div className="flex gap-2 text-[var(--text-muted)]">
                  <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-2 bg-gray-200 rounded-full"></div>
                </div>
              </div>
              <p className="text-center text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Light Mode Preview</p>
            </div>
            
            <div className="bg-gray-950 rounded-lg p-5 border border-gray-800 shadow-inner mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 h-8 w-1/2">
                  {localSettings.branding_logo_dark ? (
                    <img src={localSettings.branding_logo_dark} className="h-full object-contain" />
                  ) : (
                    <div className="h-full w-full px-3 text-[var(--text)] font-black uppercase text-[10px] tracking-wider flex items-center justify-center bg-gray-800 rounded-lg">Logo Space</div>
                  )}
                </div>
                <div className="flex gap-2 text-gray-700">
                  <div className="w-8 h-2 bg-gray-800 rounded-full"></div>
                  <div className="w-8 h-2 bg-gray-800 rounded-full"></div>
                </div>
              </div>
              <p className="text-center text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">Dark Mode Preview</p>
            </div>
            
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-6 text-[var(--text-muted)]">
                <div className="flex flex-col items-center gap-1.5">
                  <Monitor size={20} strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Desktop</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
                <div className="flex flex-col items-center gap-1.5">
                  <Smartphone size={20} strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Mobile</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
                <div className="flex flex-col items-center gap-1.5 text-[#FFD700]">
                  <Sparkles size={20} strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Perfect</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--card-bg)] rounded-xl p-8 border border-[var(--border)] shadow-sm group hover:border-[#FFD700]/30 transition-colors">
            <h3 className="text-lg font-black text-[var(--text)] tracking-tight mb-8 flex items-center gap-3">
              <span className="p-2 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
                <Settings size={20} className="text-[#FFD700]" strokeWidth={2.5} /> 
              </span>
              Logo Preferences
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--text)] mb-1 tracking-tight">Animate Navbar Logo</p>
                  <p className="text-xs font-medium text-[var(--text-muted)]">Add a subtle hover animation.</p>
                </div>
                <button 
                  onClick={() => handleChange('branding_navbar_animation', localSettings.branding_navbar_animation === '1' ? '0' : '1')}
                  className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${localSettings.branding_navbar_animation === '1' ? 'bg-[#FFD700]' : 'bg-[var(--border)]'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${localSettings.branding_navbar_animation === '1' ? 'translate-x-7 bg-black' : 'translate-x-1'}`}></div>
                </button>
              </div>
              
              <div className="bg-[#FFD700]/10 border border-[#FFD700]/20 p-5 rounded-lg flex items-start gap-3 shadow-inner">
                <AlertCircle size={18} className="text-[#FFD700] shrink-0 mt-0.5" strokeWidth={2.5} />
                <p className="text-xs font-medium text-[#FFD700] leading-relaxed">Changes save instantly. Backup your old logos by right clicking them and saving locally before replacement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
