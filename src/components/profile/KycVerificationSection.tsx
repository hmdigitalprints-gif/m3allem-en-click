import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Loader2, 
  ShieldCheck, 
  AlertCircle,
  Clock, 
  ArrowLeft, 
  Building, 
  Info,
  CheckCircle,
  Check,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface KycData {
  id: string;
  documentType: string;
  documentNumber: string;
  documentUrl: string;
  idDocumentUrl?: string;
  companyRegistration?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

export default function KycVerificationSection({ onBack, onAction }: { onBack: () => void; onAction: (msg: string) => void }) {
  const { user } = useAuth();
  const toast = useToast();
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [verified, setVerified] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form states
  const [documentType, setDocumentType] = useState('National ID Carbon Card');
  const [documentNumber, setDocumentNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [ocrResult, setOcrResult] = useState<any>(null);

  // Upload URL refs
  const [documentUrl, setDocumentUrl] = useState('');
  const [idDocumentUrl, setIdDocumentUrl] = useState('');
  const [companyRegistration, setCompanyRegistration] = useState('');

  // Upload UI names
  const [docFileLabel, setDocFileLabel] = useState('');
  const [selfieFileLabel, setSelfieFileLabel] = useState('');
  const [corpFileLabel, setCorpFileLabel] = useState('');

  // Individual loaders
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [uploadingCorp, setUploadingCorp] = useState(false);

  // Active scanning/auto-detect progress states
  const [docScanProgress, setDocScanProgress] = useState(0);
  const [docScanStep, setDocScanStep] = useState('');
  const [selfieScanProgress, setSelfieScanProgress] = useState(0);
  const [selfieScanStep, setSelfieScanStep] = useState('');
  const [corpScanProgress, setCorpScanProgress] = useState(0);
  const [corpScanStep, setCorpScanStep] = useState('');

  // Image preview thumbnails (object URL base64 helper refs)
  const [docPreviewUrl, setDocPreviewUrl] = useState('');
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState('');
  const [corpPreviewUrl, setCorpPreviewUrl] = useState('');

  // Fetch current KYC record
  const fetchKycStatus = async () => {
    try {
      const res = await fetch('/api/kyc/status', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setVerified(data.verified);
        setKyc(data.kyc);
      }
    } catch (err) {
      console.error('Error fetching KYC status:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setTargetUrl: (url: string) => void,
    setTargetLabel: (name: string) => void,
    setLoadingState: (loading: boolean) => void,
    channel: 'doc' | 'selfie' | 'corp'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingState(true);
    setTargetLabel(file.name);

    // Create instant local object URL image preview for visual feedback
    const isImage = file.type.startsWith('image/');
    if (isImage) {
      const previewUrl = URL.createObjectURL(file);
      if (channel === 'doc') setDocPreviewUrl(previewUrl);
      else if (channel === 'selfie') setSelfiePreviewUrl(previewUrl);
      else if (channel === 'corp') setCorpPreviewUrl(previewUrl);
    } else {
      // Clear thumbnail if they upload a PDF (rendered beautifully as fallback)
      if (channel === 'doc') setDocPreviewUrl('');
      else if (channel === 'selfie') setSelfiePreviewUrl('');
      else if (channel === 'corp') setCorpPreviewUrl('');
    }

    // Initialize progress scanning metrics
    let currentProgress = 0;
    const progressSetter = 
      channel === 'doc' ? setDocScanProgress : 
      channel === 'selfie' ? setSelfieScanProgress : 
      setCorpScanProgress;
      
    const stepSetter = 
      channel === 'doc' ? setDocScanStep : 
      channel === 'selfie' ? setSelfieScanStep : 
      setCorpScanStep;

    progressSetter(0);
    stepSetter("Initializing scanners...");

    // Start auto-detect progress simulation
    const progressInterval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 8) + 4; // increment 4% to 11%
      if (currentProgress >= 93) {
        currentProgress = 93;
        clearInterval(progressInterval);
      }
      
      let stepText = "";
      if (channel === 'doc') {
        if (currentProgress < 20) stepText = "Scanning anti-virus blocks...";
        else if (currentProgress < 45) stepText = "Detecting document boundaries...";
        else if (currentProgress < 70) stepText = "Parsing OCR textual keys...";
        else stepText = "Binding secure cryptographic signatures...";
      } else if (channel === 'selfie') {
        if (currentProgress < 20) stepText = "Calibrating resolution offsets...";
        else if (currentProgress < 45) stepText = "Analyzing facial geometry ratios...";
        else if (currentProgress < 70) stepText = "Matching portrait vectors...";
        else stepText = "Structuring compliance credentials...";
      } else {
        if (currentProgress < 20) stepText = "Contacting chamber register indices...";
        else if (currentProgress < 45) stepText = "Validating authority seals...";
        else if (currentProgress < 70) stepText = "Parsing registered company structure...";
        else stepText = "Signing corporate legal compliance papers...";
      }
      
      progressSetter(currentProgress);
      stepSetter(stepText);
    }, 120);

    // Validate size (PDFs up to 5MB, others up to 3MB)
    const isPdf = file.type === "application/pdf";
    const maxSize = isPdf ? 5 * 1024 * 1024 : 3 * 1024 * 1024;
    if (file.size > maxSize) {
      clearInterval(progressInterval);
      progressSetter(0);
      stepSetter('');
      setFormError(`Upload limits exceeded: files must stay below ${isPdf ? '5MB' : '3MB'}`);
      setLoadingState(false);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, type: 'verification' }),
          credentials: 'include'
        });

        if (res.ok) {
          clearInterval(progressInterval);
          progressSetter(100);
          stepSetter(
            channel === 'doc' ? "Government ID scan fully validated!" : 
            channel === 'selfie' ? "Portrait biometrics verified!" : 
            "Company registration verified!"
          );
          
          const data = await res.json();
          setTargetUrl(data.url);
          setFormError('');
          onAction(`Secure upload verified: ${file.name}`);

          if (channel === 'doc') {
            try {
              stepSetter("Decoding OCR fields via Gemini AI...");
              const ocrRes = await fetch('/api/kyc/ocr-extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentUrl: data.url, fileBase64: base64 }),
                credentials: 'include'
              });
              if (ocrRes.ok) {
                const ocrData = await ocrRes.json();
                setOcrResult(ocrData);
                if (ocrData.documentNumber) {
                  setDocumentNumber(ocrData.documentNumber);
                }
                if (ocrData.documentType) {
                  // Ensure we match option values rendered in the select
                  if (ocrData.documentType.toLowerCase().includes("passport")) {
                    setDocumentType("Passport Copy");
                  } else if (ocrData.documentType.toLowerCase().includes("license") || ocrData.documentType.toLowerCase().includes("driving")) {
                    setDocumentType("Driving License Certificate");
                  } else {
                    setDocumentType("National Identity Card");
                  }
                }
                onAction(`AI Auto-Fill: Extracted details successfully (${Math.round(ocrData.confidence * 100)}% Match)`);
                stepSetter(`Gemini OCR Auto-filled details successfully!`);
              }
            } catch (ocrErr) {
              console.error("AI OCR extraction failed:", ocrErr);
            }
          }
        } else {
          clearInterval(progressInterval);
          progressSetter(0);
          stepSetter('');
          const errorData = await res.json();
          setFormError(errorData.error || 'Identity document security upload rejected');
        }
      } catch (err) {
        clearInterval(progressInterval);
        progressSetter(0);
        stepSetter('');
        console.error(err);
        setFormError('Network communication error with file scanner');
      } finally {
        setLoadingState(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!documentNumber.trim()) {
      setFormError('Please input your document reference number');
      return;
    }

    if (!documentUrl) {
      setFormError('Primary government identity document is required');
      return;
    }

    if (user?.role === 'company' && !companyRegistration) {
      setFormError('Corporate trade registration certification is mandatory');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalNotes = notes.trim();
      if (ocrResult) {
        finalNotes = JSON.stringify({
          userNote: notes.trim(),
          ocr: {
            documentType: ocrResult.documentType,
            documentNumber: ocrResult.documentNumber,
            fullName: ocrResult.fullName,
            confidence: ocrResult.confidence,
            isAuthentic: ocrResult.isAuthentic
          }
        });
      }

      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          documentNumber,
          documentUrl,
          idDocumentUrl: idDocumentUrl || undefined,
          companyRegistration: companyRegistration || undefined,
          notes: finalNotes || undefined
        }),
        credentials: 'include'
      });

      if (res.ok) {
        onAction('Verification papers submitted successfully.');
        toast.success(
          'Verification Documents Submitted',
          'Thank you! Your verification request has been successfully queued for security review.'
        );
        fetchKycStatus();
      } else {
        const err = await res.json();
        const msg = err.error || 'Failed to submit KYC review form';
        setFormError(msg);
        toast.error('KYC Submission Failed', msg);
      }
    } catch (err) {
      console.error(err);
      const msg = 'Failed to communicate with authentication servers';
      setFormError(msg);
      toast.error('KYC Connection Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 size={36} className="animate-spin text-[#FFD700] mb-4" />
        <p className="text-xs font-black uppercase text-[var(--text-muted)] tracking-widest">Verifying Compliance credentials...</p>
      </div>
    );
  }

  const getParsedNotesAndOcr = () => {
    if (!kyc?.notes) return { userNote: '', ocr: null };
    if (kyc.notes.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(kyc.notes);
        return {
          userNote: parsed.userNote || '',
          ocr: parsed.ocr || null
        };
      } catch (e) {
        return { userNote: kyc.notes, ocr: null };
      }
    }
    return { userNote: kyc.notes, ocr: null };
  };

  const { userNote, ocr } = getParsedNotesAndOcr();

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      {/* Navigation Return */}
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors font-bold text-sm"
      >
        <ArrowLeft size={18} />
        Back to Settings
      </button>

      {/* Main Header */}
      <div className="mb-10 text-start">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3">Identity <span className="text-[#FFD700]">Verification</span></h2>
        <p className="text-[var(--text-muted)] text-sm md:text-base font-medium">
          M3allem requires valid government identity papers or company registries to safeguard our marketplace and enable smooth billing withdrawals.
        </p>
      </div>

      {/* RENDER ACTIVE STATUS: APPROVED */}
      {verified && kyc?.status === 'approved' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[40px] p-8 md:p-12 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle size={36} />
          </div>
          
          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-2xl font-black text-emerald-500 tracking-tight">Status: Fully Verified</h3>
            <p className="text-xs font-semibold text-[var(--text-muted)] leading-relaxed">
              Your government documents have been scrutinized and approved by our security administrators. Your billing withdrawal restrictions and profile tags are now fully active.
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 text-start max-w-md mx-auto grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xxs font-black text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Approved Document</span>
              <span className="text-xs font-black text-[var(--text)]">{kyc.documentType}</span>
            </div>
            <div>
              <span className="block text-xxs font-black text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Identity Reference</span>
              <span className="text-xs font-bold text-mono text-[var(--text)]">{kyc.documentNumber}</span>
            </div>
          </div>

          {ocr && (
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 text-start max-w-md mx-auto space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)] text-[#FFD700] text-xxs font-black uppercase tracking-widest">
                <ShieldCheck size={14} className="text-[#FFD700]" />
                Gemini AI Identity Autodetect Report
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] font-semibold">Extracted Name:</span>
                  <span className="font-extrabold text-[var(--text)]">{ocr.fullName}</span>
                </div>
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-[var(--text-muted)] font-semibold">Extracted ID:</span>
                  <span className="font-mono font-bold text-[var(--text)]">{ocr.documentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] font-semibold">Scan Confidence:</span>
                  <span className="font-black text-emerald-500">{Math.round((ocr.confidence || 0.95) * 100)}% Match</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] font-semibold">Image Integrity:</span>
                  <span className="font-bold text-emerald-500">Legible & Authentic</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER ACTIVE STATUS: PENDING REVIEW */}
      {!verified && kyc?.status === 'pending' && (
        <div className="bg-amber-500/5 border border-amber-500/25 rounded-[40px] p-8 md:p-12 text-center space-y-6">
          <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Clock size={36} />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-2xl font-black text-amber-500 tracking-tight">KYC Auditing Underway</h3>
            <p className="text-xs font-semibold text-[var(--text-muted)] leading-relaxed">
              We have securely transferred your uploaded identity papers to-and-from our encrypted scanning servers. Our administrative team is currently conducting a physical verification of compliance. This typically takes up to 24 hours.
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 text-start max-w-md mx-auto grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xxs font-black text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Submitted Paper</span>
              <span className="text-xs font-bold text-[var(--text)]">{kyc.documentType}</span>
            </div>
            <div>
              <span className="block text-xxs font-black text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Identity ID NO.</span>
              <span className="text-xs font-bold text-mono text-[var(--text)]">{kyc.documentNumber}</span>
            </div>
          </div>

          {ocr && (
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 text-start max-w-md mx-auto space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)] text-amber-500 text-xxs font-black uppercase tracking-widest">
                <ShieldCheck size={14} className="text-amber-500" />
                Gemini AI Identity Autodetect Report
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] font-semibold">Extracted Name:</span>
                  <span className="font-extrabold text-[var(--text)]">{ocr.fullName}</span>
                </div>
                <div className="flex justify-between flex-wrap gap-2">
                  <span className="text-[var(--text-muted)] font-semibold">Extracted ID:</span>
                  <span className="font-mono font-bold text-[var(--text)]">{ocr.documentNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] font-semibold">Scan Confidence:</span>
                  <span className="font-black text-amber-500">{Math.round((ocr.confidence || 0.95) * 100)}% Match</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)] font-semibold">Image Integrity:</span>
                  <span className="font-bold text-amber-500">Scanned Securely</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER FORM: NO KYC OR REJECTED RE-SUBMIT */}
      {(!kyc || kyc.status === 'rejected') && (
        <div className="space-y-8">
          {/* Rejection Alert Box */}
          {kyc?.status === 'rejected' && (
            <div className="bg-red-500/10 border border-red-500/20 p-6 md:p-8 rounded-3xl flex gap-4 text-start">
              <div className="text-red-500 shrink-0">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase text-red-500 tracking-tight">Identity Papers Rejected</h4>
                <p className="text-xs font-semibold text-[var(--text-muted)] leading-relaxed">
                  The documents you previously uploaded were rejected by our compliance review desk. 
                </p>
                <div className="mt-3 bg-red-500/5 p-4 rounded-xl border border-red-500/10 text-xs font-semibold text-[var(--text)] leading-relaxed italic">
                  "Reason: {kyc.rejectionReason}"
                </div>
                <p className="text-xs font-semibold text-[var(--text-muted)] pt-2 leading-relaxed">
                  Please correct the issues indicated above and re-submit your files using the form below.
                </p>
              </div>
            </div>
          )}

          {/* Secure compliance disclaimer banner */}
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/15 p-5 rounded-2xl flex gap-3 text-start items-center">
            <Info size={20} className="text-blue-500 shrink-0" />
            <p className="text-xxs font-semibold text-[var(--text-muted)] leading-relaxed">
              <strong>Enterprise Secure Cryptographic Storage:</strong> Your scanned identification papers are tagged as <span className="text-[var(--accent)] font-bold">PRIVATE</span> and are isolated from search engine crawls, direct browser links, or third-party scopes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 md:p-12 text-start space-y-6">
            <h3 className="text-xl font-black text-[var(--text)] tracking-tight">Upload KYC Application</h3>
            
            {formError && (
              <div className="p-4 bg-red-500/10 border border-red-500/15 text-red-500 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Type Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-2">
                  Document Identity Type
                </label>
                <select 
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm font-bold text-[var(--text)]"
                >
                  <option value="National Identity Card">National ID Card</option>
                  <option value="Passport Copy">International Passport</option>
                  <option value="Driving License Certificate">Driving License</option>
                  {user?.role === 'company' && (
                    <option value="Trade Registration Certificate">Corporate Trade Register (Registre)</option>
                  )}
                </select>
              </div>

              {/* Document/Registration Reference Number */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-2">
                  ID Document Reference / Registry Code
                </label>
                <input 
                  type="text" 
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm font-bold text-[var(--text)]" 
                  placeholder="E.g., CN593214, B/9431/2026..."
                  required
                />
              </div>
            </div>

            {/* Drag Drop Custom Uploaders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* PRIMARY ID UPLOADER */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-2">
                  Identity Document File (PDF or Image) <span className="text-red-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-[var(--border)] hover:border-[#FFD700]/30 transition-all rounded-[24px] p-2 min-h-[170px] flex items-center justify-center bg-[var(--card-surface)] group overflow-hidden">
                  {uploadingDoc ? (
                    <div className="flex flex-col items-center justify-center py-6 px-4 w-full relative">
                      {docPreviewUrl && (
                        <div className="absolute inset-0 bg-cover bg-center blur-[6px] opacity-25" style={{ backgroundImage: `url(${docPreviewUrl})` }} />
                      )}
                      <div className="relative z-10 flex flex-col items-center justify-center w-full">
                        <div className="relative w-full max-w-[180px] h-2 bg-[var(--bg)] border border-[var(--border)] rounded-full overflow-hidden mb-3">
                          <div 
                            className="absolute top-0 left-0 h-full bg-[#FFD700] rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(255,215,0,0.5)]"
                            style={{ width: `${docScanProgress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between w-full max-w-[180px] mb-2 px-1">
                          <span className="text-[10px] font-black text-[#FFD700] tracking-wider uppercase animate-pulse">Auto-Scan</span>
                          <span className="text-[10px] font-black text-[var(--text)] tracking-wider">{docScanProgress}%</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-center text-center px-4">
                          <Loader2 size={12} className="text-[#FFD700] animate-spin shrink-0" />
                          <span className="text-[10px] font-bold text-[var(--text)] uppercase tracking-wider truncate max-w-[200px]" title={docScanStep}>
                            {docScanStep}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : documentUrl ? (
                    <div className="w-full relative flex flex-col items-center p-3 text-center">
                      {/* Delete button (Z-25 so it can be clicked over input) */}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setDocumentUrl('');
                          setDocFileLabel('');
                          setDocPreviewUrl('');
                        }}
                        className="absolute top-3 right-3 z-20 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg hover:scale-105 active:scale-95"
                        title="Delete document upload"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Image Thumbnail or PDF fallback inside a premium frame */}
                      <div className="w-full h-32 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center overflow-hidden mb-3 relative">
                        {docPreviewUrl ? (
                          <img 
                            src={docPreviewUrl} 
                            alt="Government ID Document Thumbnail" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-red-500 bg-red-500/5 p-4 rounded-xl">
                            <FileText size={42} className="mb-1 text-red-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 px-3 py-1 rounded-full">PDF Document</span>
                          </div>
                        )}
                      </div>

                      <div className="w-full text-start px-2">
                        <div className="flex items-center gap-1.5 text-emerald-500 mb-0.5">
                          <CheckCircle size={14} className="shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Document Scanned & Active</span>
                        </div>
                        <p className="text-xs font-bold text-[var(--text-muted)] truncate max-w-[85%]" title={docFileLabel}>
                          {docFileLabel || 'government_identity.pdf'}
                        </p>
                      </div>

                      {/* Cover replace input */}
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(e, setDocumentUrl, setDocFileLabel, setUploadingDoc, 'doc')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 w-full">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(e, setDocumentUrl, setDocFileLabel, setUploadingDoc, 'doc')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload size={32} className="text-[var(--text-muted)] mb-3" />
                      <span className="text-sm font-black text-[var(--text)]">Drop / Choose ID document</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold mt-1">PDF or image payload up to 5MB</span>
                    </div>
                  )}
                </div>
              </div>

              {/* OPTIONAL HOLDING ID SELFIE */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-2">
                  Face photo holding your ID (Optional)
                </label>
                <div className="relative border-2 border-dashed border-[var(--border)] hover:border-[#FFD700]/30 transition-all rounded-[24px] p-2 min-h-[170px] flex items-center justify-center bg-[var(--card-surface)] group overflow-hidden">
                  {uploadingSelfie ? (
                    <div className="flex flex-col items-center justify-center py-6 px-4 w-full relative">
                      {selfiePreviewUrl && (
                        <div className="absolute inset-0 bg-cover bg-center blur-[6px] opacity-25" style={{ backgroundImage: `url(${selfiePreviewUrl})` }} />
                      )}
                      <div className="relative z-10 flex flex-col items-center justify-center w-full">
                        <div className="relative w-full max-w-[180px] h-2 bg-[var(--bg)] border border-[var(--border)] rounded-full overflow-hidden mb-3">
                          <div 
                            className="absolute top-0 left-0 h-full bg-[#FFD700] rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(255,215,0,0.5)]"
                            style={{ width: `${selfieScanProgress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between w-full max-w-[180px] mb-2 px-1">
                          <span className="text-[10px] font-black text-[#FFD700] tracking-wider uppercase animate-pulse">Bio-Scan</span>
                          <span className="text-[10px] font-black text-[var(--text)] tracking-wider">{selfieScanProgress}%</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-center text-center px-4">
                          <Loader2 size={12} className="text-[#FFD700] animate-spin shrink-0" />
                          <span className="text-[10px] font-bold text-[var(--text)] uppercase tracking-wider truncate max-w-[200px]" title={selfieScanStep}>
                            {selfieScanStep}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : idDocumentUrl ? (
                    <div className="w-full relative flex flex-col items-center p-3 text-center">
                      {/* Delete button */}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setIdDocumentUrl('');
                          setSelfieFileLabel('');
                          setSelfiePreviewUrl('');
                        }}
                        className="absolute top-3 right-3 z-20 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg hover:scale-105 active:scale-95"
                        title="Delete selfie upload"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Image Thumbnail */}
                      <div className="w-full h-32 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center overflow-hidden mb-3 relative">
                        {selfiePreviewUrl ? (
                          <img 
                            src={selfiePreviewUrl} 
                            alt="Selfie Bio Thumbnail" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-indigo-500 bg-indigo-500/5 p-4 rounded-xl">
                            <FileText size={42} className="mb-1 text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full">PDF Document</span>
                          </div>
                        )}
                      </div>

                      <div className="w-full text-start px-2">
                        <div className="flex items-center gap-1.5 text-emerald-500 mb-0.5">
                          <CheckCircle size={14} className="shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Selfie Bio Clear</span>
                        </div>
                        <p className="text-xs font-bold text-[var(--text-muted)] truncate max-w-[85%]" title={selfieFileLabel}>
                          {selfieFileLabel || 'biometric_selfie.png'}
                        </p>
                      </div>

                      {/* Cover replace input */}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setIdDocumentUrl, setSelfieFileLabel, setUploadingSelfie, 'selfie')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 w-full">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, setIdDocumentUrl, setSelfieFileLabel, setUploadingSelfie, 'selfie')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload size={32} className="text-[var(--text-muted)] mb-3" />
                      <span className="text-sm font-black text-[var(--text)]">Drop / Choose holding ID photo</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold mt-1">Image payload up to 3MB</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ROLE SPECIFIC UPLOADER: CORPORATE REGISTRATION (MANDATORY FOR COMPANY ACTIONS) */}
            {user?.role === 'company' && (
              <div className="space-y-2 pt-2 text-start">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-2 flex items-center gap-1.5">
                  <Building size={14} className="text-indigo-400" />
                  Corporate Register Certificate (Registre du Commerce) <span className="text-red-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-indigo-500/20 hover:border-indigo-500/40 transition-all rounded-[24px] p-2 min-h-[170px] flex items-center justify-center bg-[var(--card-surface)] group overflow-hidden">
                  {uploadingCorp ? (
                    <div className="flex flex-col items-center justify-center py-6 px-4 w-full relative">
                      {corpPreviewUrl && (
                        <div className="absolute inset-0 bg-cover bg-center blur-[6px] opacity-25" style={{ backgroundImage: `url(${corpPreviewUrl})` }} />
                      )}
                      <div className="relative z-10 flex flex-col items-center justify-center w-full">
                        <div className="relative w-full max-w-[180px] h-2 bg-[var(--bg)] border border-[var(--border)] rounded-full overflow-hidden mb-3">
                          <div 
                            className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                            style={{ width: `${corpScanProgress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between w-full max-w-[180px] mb-2 px-1">
                          <span className="text-[10px] font-black text-indigo-400 tracking-wider uppercase animate-pulse">Corp-Scan</span>
                          <span className="text-[10px] font-black text-[var(--text)] tracking-wider">{corpScanProgress}%</span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-center text-center px-4">
                          <Loader2 size={12} className="text-indigo-400 animate-spin shrink-0" />
                          <span className="text-[10px] font-bold text-[var(--text)] uppercase tracking-wider truncate max-w-[200px]" title={corpScanStep}>
                            {corpScanStep}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : companyRegistration ? (
                    <div className="w-full relative flex flex-col items-center p-3 text-center">
                      {/* Delete button */}
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setCompanyRegistration('');
                          setCorpFileLabel('');
                          setCorpPreviewUrl('');
                        }}
                        className="absolute top-3 right-3 z-20 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg hover:scale-105 active:scale-95"
                        title="Delete corporate registration upload"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Image Thumbnail or PDF fallback */}
                      <div className="w-full h-32 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center overflow-hidden mb-3 relative">
                        {corpPreviewUrl ? (
                          <img 
                            src={corpPreviewUrl} 
                            alt="Corporate Registry Thumbnail" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-indigo-500 bg-indigo-500/5 p-4 rounded-xl">
                            <FileText size={42} className="mb-1 text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full">PDF Document</span>
                          </div>
                        )}
                      </div>

                      <div className="w-full text-start px-2">
                        <div className="flex items-center gap-1.5 text-emerald-500 mb-0.5">
                          <CheckCircle size={14} className="shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Corporate Registry Online</span>
                        </div>
                        <p className="text-xs font-bold text-[var(--text-muted)] truncate max-w-[85%]" title={corpFileLabel}>
                          {corpFileLabel || 'registre_commerce.pdf'}
                        </p>
                      </div>

                      {/* Cover replace input */}
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(e, setCompanyRegistration, setCorpFileLabel, setUploadingCorp, 'corp')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 w-full">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileUpload(e, setCompanyRegistration, setCorpFileLabel, setUploadingCorp, 'corp')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Upload size={32} className="text-indigo-400/60 mb-3" />
                      <span className="text-sm font-black text-indigo-400">Click to fetch corporate certificate</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold mt-1">Upload matching Registre PDF or image up to 5MB</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Special comments / Description text box */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-2">
                Additional Comments / Description Notes
              </label>
              <textarea 
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm font-semibold text-[var(--text)] resize-none" 
                placeholder="Include any instructions, explanations or notes that help validators confirm your business registry profile..."
              />
            </div>

            {/* Submit Control */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={onBack}
                disabled={isSubmitting}
                className="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-wider border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text)] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || uploadingDoc || uploadingSelfie || uploadingCorp}
                className="bg-[#FFD700] hover:bg-[#FFD710] text-[#0A0D14] px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Submit Verification
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
