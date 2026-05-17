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
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">

      {/* Active payment methods (always-on) */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
          <Wallet size={20} className="text-[var(--accent)]" />
          Active Payment Methods
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-5">
          These methods are always available and require no external configuration.
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-3">
              <Wallet size={18} className="text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-sm">Internal Wallet (Solde)</p>
                <p className="text-xs text-[var(--text-muted)]">Clients pay from their M3allem balance</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400">
              <CheckCircle size={14} /> Active
            </span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-3">
              <Banknote size={18} className="text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-sm">Cash on Completion</p>
                <p className="text-xs text-[var(--text-muted)]">Client pays artisan directly after service is done</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400">
              <CheckCircle size={14} /> Active
            </span>
          </div>
        </div>
      </div>

      {/* Commission info */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
          <ShieldCheck size={20} className="text-[var(--accent)]" />
          Commission & Payout Logic
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Commission is automatically deducted from every completed order.
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Client pays', value: '100 MAD', color: 'text-[var(--text)]' },
            { label: 'Platform commission', value: '10 MAD (10%)', color: 'text-orange-500' },
            { label: 'Artisan receives', value: '90 MAD', color: 'text-green-500' },
          ].map((item) => (
            <div key={item.label} className="bg-[var(--bg)] rounded-xl p-4 border border-[var(--border)]">
              <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">{item.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-3">
          Commission rate is configurable in <strong>Settings → Commission</strong>.
          Category-specific rates override the global rate.
        </p>
      </div>

      {/* Stripe configuration */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CreditCard size={20} className="text-[var(--accent)]" />
            Stripe Configuration
          </h2>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            stripeEnabled
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
          }`}>
            {stripeEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Stripe is optional. The platform works without it. Add keys here to enable online top-ups.
        </p>

        {/* Enable / disable toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] mb-6">
          <div>
            <p className="font-semibold text-sm">Enable Stripe</p>
            <p className="text-xs text-[var(--text-muted)]">
              {settings?.stripe_secret_key_set
                ? 'Keys are configured. Toggle to enable/disable Stripe.'
                : 'Add keys below first, then enable.'}
            </p>
          </div>
          <button
            onClick={() => setStripeEnabled((v) => !v)}
            disabled={!settings?.stripe_secret_key_set}
            className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
              stripeEnabled ? 'bg-[var(--accent)]' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            aria-label="Toggle Stripe"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                stripeEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Key inputs */}
        <div className="space-y-4">
          {/* Secret key */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-2">
              <Lock size={12} /> Stripe Secret Key
              {settings?.stripe_secret_key_set && (
                <span className="ml-auto text-green-600 dark:text-green-400 font-semibold">✓ Set</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder={settings?.stripe_secret_key_set ? 'Leave blank to keep existing' : 'sk_live_…'}
                className="w-full px-4 py-3 pr-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:border-[var(--accent)] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                aria-label={showSecret ? 'Hide' : 'Show'}
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {settings?.stripe_secret_key_set && (
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)] font-mono">{settings.stripe_secret_key}</span>
                <button
                  onClick={() => handleDeleteKey('stripe_secret_key')}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            )}
          </div>

          {/* Webhook secret */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-2">
              <Lock size={12} /> Webhook Secret
              {settings?.stripe_webhook_secret_set && (
                <span className="ml-auto text-green-600 dark:text-green-400 font-semibold">✓ Set</span>
              )}
            </label>
            <div className="relative">
              <input
                type={showWebhook ? 'text' : 'password'}
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder={settings?.stripe_webhook_secret_set ? 'Leave blank to keep existing' : 'whsec_…'}
                className="w-full px-4 py-3 pr-10 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:border-[var(--accent)] font-mono"
              />
              <button
                type="button"
                onClick={() => setShowWebhook((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                aria-label={showWebhook ? 'Hide' : 'Show'}
              >
                {showWebhook ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {settings?.stripe_webhook_secret_set && (
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)] font-mono">{settings.stripe_webhook_secret}</span>
                <button
                  onClick={() => handleDeleteKey('stripe_webhook_secret')}
                  className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            )}
          </div>

          {/* Public key */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 mb-2">
              Stripe Publishable Key
              {settings?.stripe_public_key_set && (
                <span className="ml-auto text-green-600 dark:text-green-400 font-semibold">✓ Set</span>
              )}
            </label>
            <input
              type="text"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder={settings?.stripe_public_key_set ? settings.stripe_public_key || '' : 'pk_live_…'}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-sm focus:outline-none focus:border-[var(--accent)] font-mono"
            />
          </div>
        </div>

        {/* Test connection result */}
        {testResult && (
          <div
            className={`mt-4 p-4 rounded-xl flex items-start gap-3 border ${
              testResult.success
                ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle size={16} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${testResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-400'}`}>
              {testResult.message}
            </p>
          </div>
        )}

        {/* Security notice */}
        <div className="mt-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex gap-3">
          <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Keys are encrypted with AES-256-GCM before being stored in the database.
            Secret keys are never exposed to the frontend — only masked previews are shown.
            Only admins with database access can decrypt stored keys.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 flex-wrap">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-3 bg-[var(--accent)] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Settings
          </button>
          <button
            onClick={handleTestStripe}
            disabled={testing || !settings?.stripe_secret_key_set}
            className="flex items-center gap-2 px-5 py-3 border border-[var(--border)] rounded-xl font-semibold text-sm hover:bg-[var(--border)]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {testing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Test Connection
          </button>
        </div>
      </div>
    </div>
  );
}
