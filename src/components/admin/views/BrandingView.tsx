import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Save, Upload, Image as ImageIcon, Trash2, Palette, Sparkles, AlertCircle, Eye, Monitor, Smartphone, Settings } from 'lucide-react';
import { ViewProps } from '../types';

import { useAuth } from '../../../context/AuthContext';

interface BrandingViewProps extends ViewProps {
  settings: any;
  updateSettings: (settings: any) => Promise<void>;
}

export default function BrandingView({ settings, updateSettings, isDarkMode, onAction }: BrandingViewProps) {
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
            <h4 className="tech-header text-sm">{title}</h4>
            <p className="text-xs text-[var(--text-muted)] mt-1">{description}</p>
          </div>
          {value && (
            <button 
              onClick={() => handleChange(settingKey, '')}
              className="text-xs text-[var(--destructive)] hover:underline"
            >
              Remove
            </button>
          )}
        </div>
        
        <div 
          onClick={() => triggerUpload(settingKey)}
          className={`relative h-32 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden transition-all group ${
            value ? 'border-transparent bg-[var(--bg)]' : 'border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg)]/50'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-[var(--accent)]">
              <Loader2 size={24} className="animate-spin mb-2" />
              <span className="text-xs font-medium">Processing...</span>
            </div>
          ) : value ? (
            <>
              <img src={value} alt={title} className="max-w-[80%] max-h-[80%] object-contain relative z-10" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
                <span className="text-white text-xs font-semibold bg-[var(--accent)] px-3 py-1.5 rounded-full flex items-center gap-2">
                  <Upload size={14} /> Replace Image
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors">
              <Upload size={24} className="mb-2" />
              <span className="text-xs font-medium">Click to upload</span>
              <span className="text-[10px] opacity-70 mt-1">SVG, PNG, WebP</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".png,.jpg,.jpeg,.webp,.svg,.ico" 
        className="hidden" 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="tech-header text-2xl flex items-center gap-3">
            <Sparkles className="text-[var(--accent)]" /> Branding & Logo
          </h1>
          <p className="tech-label opacity-70 mt-1">Manage your platform's visual identity, logos, and global colors.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 py-3 rounded-2xl tech-label hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[var(--accent)]/20"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="hynex-card p-8">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4 mb-6">
              <ImageIcon size={20} className="text-[var(--accent)]" /> 
              <h3 className="tech-header text-lg m-0">Logos & Assets</h3>
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

          <div className="hynex-card p-8">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4 mb-6">
              <Palette size={20} className="text-[var(--accent)]" /> 
              <h3 className="tech-header text-lg m-0">Theme & Colors</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="tech-label opacity-70 mb-2 block">Primary Brand Color</label>
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl border border-[var(--border)] overflow-hidden shrink-0">
                    <input 
                      type="color" 
                      value={localSettings.branding_primary_color || '#B68B42'} 
                      onChange={(e) => handleChange('branding_primary_color', e.target.value)}
                      className="w-full h-full p-0 border-0 cursor-pointer" 
                    />
                  </div>
                  <input 
                    type="text" 
                    value={localSettings.branding_primary_color || '#B68B42'} 
                    onChange={(e) => handleChange('branding_primary_color', e.target.value)}
                    placeholder="#HEX"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm font-medium focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-transparent outline-none transition-all" 
                  />
                </div>
              </div>
              
              <div>
                <label className="tech-label opacity-70 mb-2 block">Custom Gradient Details</label>
                <input 
                  type="text" 
                  value={localSettings.branding_gradient || ''} 
                  onChange={(e) => handleChange('branding_gradient', e.target.value)}
                  placeholder="e.g. linear-gradient(135deg, #B68B42, #DEAD78)"
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-sm font-medium focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-transparent outline-none transition-all" 
                />
                <p className="text-xs text-[var(--text-muted)] mt-2">CSS linear-gradient applied to primary touches.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="hynex-card p-6 border-[var(--accent)]/30 border">
            <h3 className="tech-header text-sm flex items-center gap-2 mb-4">
              <Eye size={16} className="text-[var(--accent)]" /> Live Preview
            </h3>
            
            <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 h-8">
                  {localSettings.branding_logo_light ? (
                    <img src={localSettings.branding_logo_light} className="h-full object-contain" />
                  ) : (
                    <div className="h-full px-3 text-black font-bold flex items-center bg-gray-100 rounded">Logo Space</div>
                  )}
                </div>
                <div className="flex gap-2 text-gray-300">
                  <div className="w-8 h-2 bg-gray-200 rounded"></div>
                  <div className="w-8 h-2 bg-gray-200 rounded"></div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-500 font-medium">Light Mode Preview</p>
            </div>
            
            <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 h-8">
                  {localSettings.branding_logo_dark ? (
                    <img src={localSettings.branding_logo_dark} className="h-full object-contain" />
                  ) : (
                    <div className="h-full px-3 text-white font-bold flex items-center bg-gray-800 rounded">Logo Space</div>
                  )}
                </div>
                <div className="flex gap-2 text-gray-700">
                  <div className="w-8 h-2 bg-gray-800 rounded"></div>
                  <div className="w-8 h-2 bg-gray-800 rounded"></div>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 font-medium">Dark Mode Preview</p>
            </div>
            
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-6 text-[var(--text-muted)]">
                <div className="flex flex-col items-center gap-1">
                  <Monitor size={20} />
                  <span className="text-[10px]">Desktop Ready</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Smartphone size={20} />
                  <span className="text-[10px]">Mobile Optimized</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[var(--accent)]">
                  <Sparkles size={20} />
                  <span className="text-[10px] font-semibold">4K Quality</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hynex-card p-6">
            <h3 className="tech-header text-sm flex items-center gap-2 mb-4">
              <Settings size={16} className="text-[var(--accent)]" /> Logo Preferences
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="tech-header text-sm not-italic mt-0 mb-1">Animate Navbar Logo</p>
                  <p className="tech-label opacity-60 text-xs">Add a subtle hover animation.</p>
                </div>
                <button 
                  onClick={() => handleChange('branding_navbar_animation', localSettings.branding_navbar_animation === '1' ? '0' : '1')}
                  className={`w-12 h-6 rounded-full relative transition-all ${localSettings.branding_navbar_animation === '1' ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${localSettings.branding_navbar_animation === '1' ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
              
              <div className="bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">Changes save instantly. Backup your old logos by right clicking them and saving locally before replacement.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
