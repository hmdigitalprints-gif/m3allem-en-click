import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Eye,
  EyeOff,
  Save,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Lock,
  Wallet,
  Banknote,
} from 'lucide-react';

interface PaymentSettingsViewProps {
  onAction?: (msg: string) => void;
}

interface Settings {
  stripe_enabled: string;
  stripe_secret_key: string | null;
  stripe_secret_key_set: boolean;
  stripe_webhook_secret: string | null;
  stripe_webhook_secret_set: boolean;
  stripe_public_key: string | null;
  stripe_public_key_set: boolean;
}

export default function PaymentSettingsView({ onAction }: PaymentSettingsViewProps) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [secretKey, setSecretKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [stripeEnabled, setStripeEnabled] = useState(false);

  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  const token = localStorage.getItem('m3allem_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/payment-settings', { credentials: 'include', headers });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setStripeEnabled(data.stripe_enabled === 'true');
      }
    } catch (e) {
      console.error('Failed to load payment settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setTestResult(null);
    try {
      const payload: Record<string, any> = { stripe_enabled: stripeEnabled };
      if (secretKey) payload.stripe_secret_key = secretKey;
      if (webhookSecret) payload.stripe_webhook_secret = webhookSecret;
      if (publicKey) payload.stripe_public_key = publicKey;

      const res = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        onAction?.('Payment settings saved successfully');
        setSecretKey('');
        setWebhookSecret('');
        setPublicKey('');
        await fetchSettings();
      } else {
        onAction?.('Error: ' + (data.error || 'Failed to save'));
      }
    } catch {
      onAction?.('Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestStripe = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/payment-settings/test-stripe', {
        method: 'POST',
        credentials: 'include',
        headers,
      });
      const data = await res.json();
      setTestResult({ success: data.success, message: data.message });
    } catch {
      setTestResult({ success: false, message: 'Network error during test' });
    } finally {
      setTesting(false);
    }
  };

  const handleDeleteKey = async (key: string) => {
    if (!confirm(`Delete ${key}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/payment-settings/${key}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });
      if (res.ok) {
        onAction?.(`${key} deleted`);
        await fetchSettings();
      }
    } catch {
      onAction?.('Failed to delete key');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 pb-20 pt-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
        <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-[var(--text)] tracking-tight">Payment Settings</h1>
          <p className="text-sm font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">Configure payment methods and Stripe integration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Active payment methods (always-on) */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 relative overflow-hidden shadow-sm group hover:border-[#22C55E]/30 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#22C55E]/5 rounded-bl-full pointer-events-none group-hover:opacity-60 transition-opacity" />
          <h2 className="text-lg font-black text-[var(--text)] mb-8 flex items-center gap-3 relative z-10 w-fit">
            <span className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[#22C55E] shadow-inner">
              <Wallet size={20} strokeWidth={2.5} />
            </span>
            Active Payment Methods
          </h2>
          <p className="text-sm text-[var(--text-muted)] font-medium mb-6 relative z-10">
            These methods are always available and require no external configuration.
          </p>
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between p-5 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 flex items-center justify-center shrink-0 border border-[#22C55E]/20 shadow-sm">
                  <Wallet className="text-[#22C55E]" size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[var(--text)] font-bold text-sm tracking-tight">Internal Wallet (Solde)</p>
                  <p className="text-xs font-semibold text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">Clients pay from their balance</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-3 py-1.5 rounded-lg shadow-sm">
                <CheckCircle size={14} strokeWidth={2.5} /> Active
              </span>
            </div>
            <div className="flex items-center justify-between p-5 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] shadow-inner">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 flex items-center justify-center shrink-0 border border-[#22C55E]/20 shadow-sm">
                  <Banknote className="text-[#22C55E]" size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[var(--text)] font-bold text-sm tracking-tight">Cash on Completion</p>
                  <p className="text-xs font-semibold text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">Client pays directly</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-3 py-1.5 rounded-lg shadow-sm">
                <CheckCircle size={14} strokeWidth={2.5} /> Active
              </span>
            </div>
          </div>
        </div>

        {/* Stripe configuration */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-8 relative overflow-hidden shadow-sm group hover:border-[#635BFF]/30 transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#635BFF]/5 rounded-bl-full pointer-events-none group-hover:opacity-60 transition-opacity" />
          <div className="flex items-center justify-between mb-8 relative z-10 w-fit w-full">
            <h2 className="text-lg font-black text-[var(--text)] flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-[var(--card-surface)] border border-[var(--border)] text-[#635BFF] shadow-inner">
                <CreditCard size={20} strokeWidth={2.5} />
              </span>
              Stripe Configuration
            </h2>
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border shadow-sm ${
              stripeEnabled
                ? 'bg-[#635BFF]/10 text-[#8680FF] border-[#635BFF]/20'
                : 'bg-[var(--card-surface)] text-[var(--text-muted)] border-[var(--border)]'
            }`}>
              {stripeEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          
          <div className="relative z-10">
            <p className="text-sm text-[var(--text-muted)] font-medium mb-8 bg-[var(--card-surface)] p-4 rounded-lg border border-[var(--border)] shadow-inner">
              Stripe is optional. The platform works without it. Add keys here to enable online top-ups.
            </p>

            {/* Enable / disable toggle */}
            <div className="flex items-center justify-between p-5 rounded-lg bg-[var(--card-surface)] border border-[var(--border)] mb-8 shadow-inner">
              <div>
                <p className="text-[var(--text)] font-bold text-sm tracking-tight">Enable Stripe Integration</p>
                <p className="text-xs font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                  {settings?.stripe_secret_key_set
                    ? 'Keys are configured. Toggle to enable/disable Stripe.'
                    : 'Add keys below first, then enable.'}
                </p>
              </div>
              <button
                onClick={() => setStripeEnabled((v) => !v)}
                disabled={!settings?.stripe_secret_key_set}
                className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none shadow-inner disabled:opacity-40 disabled:cursor-not-allowed ${
                  stripeEnabled ? 'bg-[#635BFF]' : 'bg-[var(--border)]'
                }`}
                aria-label="Toggle Stripe"
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    stripeEnabled ? 'translate-x-7 bg-white' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Key inputs */}
            <div className="space-y-6">
              {/* Secret key */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2 mb-3">
                  <Lock size={14} className="text-[#635BFF]" strokeWidth={2.5} /> Stripe Secret Key
                  {settings?.stripe_secret_key_set && (
                    <span className="ml-auto text-emerald-500 font-black tracking-widest text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">SET</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    placeholder={settings?.stripe_secret_key_set ? 'Leave blank to keep existing' : 'sk_live_…'}
                    className="w-full px-5 py-4 pr-12 rounded-lg border border-[var(--border)] bg-[var(--card-surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[#635BFF]/50 font-mono transition-colors shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    aria-label={showSecret ? 'Hide' : 'Show'}
                  >
                    {showSecret ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                  </button>
                </div>
                {settings?.stripe_secret_key_set && (
                  <div className="mt-2 flex items-center justify-between px-2">
                    <span className="text-xs text-[var(--text-muted)] font-mono tracking-wider">{settings.stripe_secret_key}</span>
                    <button
                      onClick={() => handleDeleteKey('stripe_secret_key')}
                      className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:bg-red-500/10 px-2 py-1 flex items-center gap-1.5 transition-colors border border-transparent rounded-lg"
                    >
                      <Trash2 size={12} strokeWidth={2.5} /> Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Webhook secret */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2 mb-3">
                  <Lock size={14} className="text-[#635BFF]" strokeWidth={2.5} /> Webhook Secret
                  {settings?.stripe_webhook_secret_set && (
                    <span className="ml-auto text-emerald-500 font-black tracking-widest text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">SET</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showWebhook ? 'text' : 'password'}
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                    placeholder={settings?.stripe_webhook_secret_set ? 'Leave blank to keep existing' : 'whsec_…'}
                    className="w-full px-5 py-4 pr-12 rounded-lg border border-[var(--border)] bg-[var(--card-surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[#635BFF]/50 font-mono transition-colors shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhook((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    aria-label={showWebhook ? 'Hide' : 'Show'}
                  >
                    {showWebhook ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                  </button>
                </div>
                {settings?.stripe_webhook_secret_set && (
                  <div className="mt-2 flex items-center justify-between px-2">
                    <span className="text-xs text-[var(--text-muted)] font-mono tracking-wider">{settings.stripe_webhook_secret}</span>
                    <button
                      onClick={() => handleDeleteKey('stripe_webhook_secret')}
                      className="text-[10px] font-black uppercase tracking-wider text-red-500 hover:bg-red-500/10 px-2 py-1 flex items-center gap-1.5 transition-colors border border-transparent rounded-lg"
                    >
                      <Trash2 size={12} strokeWidth={2.5} /> Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Public key */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2 mb-3">
                  Stripe Publishable Key
                  {settings?.stripe_public_key_set && (
                    <span className="ml-auto text-emerald-500 font-black tracking-widest text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">SET</span>
                  )}
                </label>
                <input
                  type="text"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder={settings?.stripe_public_key_set ? settings.stripe_public_key || '' : 'pk_live_…'}
                  className="w-full px-5 py-4 rounded-lg border border-[var(--border)] bg-[var(--card-surface)] text-sm text-[var(--text)] focus:outline-none focus:border-[#635BFF]/50 font-mono transition-colors shadow-inner"
                />
              </div>
            </div>

            {/* Test connection result */}
            {testResult && (
              <div
                className={`mt-6 p-5 rounded-lg flex items-center gap-3 border shadow-sm ${
                  testResult.success
                    ? 'bg-[#22C55E]/10 border-[#22C55E]/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle size={18} className="text-[#22C55E] flex-shrink-0" strokeWidth={2.5} />
                ) : (
                  <XCircle size={18} className="text-red-500 flex-shrink-0" strokeWidth={2.5} />
                )}
                <p className={`text-sm font-bold tracking-tight ${testResult.success ? 'text-[#22C55E]' : 'text-red-500'}`}>
                  {testResult.message}
                </p>
              </div>
            )}

            {/* Security notice */}
            <div className="mt-6 p-5 rounded-lg bg-[#FFD700]/5 border border-[#FFD700]/10 flex gap-4 shadow-sm">
              <AlertTriangle size={20} className="text-[#FFD700] flex-shrink-0" strokeWidth={2.5} />
              <p className="text-xs text-[var(--text-muted)] font-semibold tracking-wide leading-relaxed">
                <strong className="text-[#FFD700] font-black uppercase">Security Notice:</strong> Keys are encrypted with AES-256-GCM before being stored in the database.
                Secret keys are never exposed to the frontend — only masked previews are shown.
                Only admins with database access can decrypt stored keys.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4 flex-wrap">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 max-w-[250px] flex items-center justify-center gap-2 px-6 py-4 bg-[#FFD700] text-black rounded-lg font-black uppercase tracking-wider text-sm hover:bg-[#E6C200] transition-colors disabled:opacity-50 shadow-lg shadow-[#FFD700]/10"
              >
                {saving ? <Loader2 size={18} className="animate-spin" strokeWidth={2.5} /> : <Save size={18} strokeWidth={2.5} />}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                onClick={handleTestStripe}
                disabled={testing || !settings?.stripe_secret_key_set}
                className="flex-1 max-w-[250px] flex items-center justify-center gap-2 px-6 py-4 bg-[var(--card-surface)] border border-[var(--border)] text-[var(--text-muted)] rounded-lg font-black uppercase tracking-wider text-sm hover:text-[var(--text)] hover:bg-[var(--border)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                {testing ? <Loader2 size={18} className="animate-spin text-[#635BFF]" strokeWidth={2.5} /> : <RefreshCw size={18} className={settings?.stripe_secret_key_set ? 'text-[#635BFF]' : 'text-[var(--text-muted)]'} strokeWidth={2.5} />}
                Test Stripe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
