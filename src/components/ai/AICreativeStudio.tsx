import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  Upload, 
  Sparkles, 
  Loader2, 
  Download 
} from 'lucide-react';
import { aiService } from '../../services/aiService';

interface AICreativeStudioProps {
  onAction: (msg: string) => void;
}

export default function AICreativeStudio({ onAction }: AICreativeStudioProps) {
  const [activeTool, setActiveTool] = useState<'image' | 'video' | 'edit' | 'animate'>('image');
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoOp, setVideoOp] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt && activeTool !== 'animate') return;
    setLoading(true);
    setResult(null);
    setVideoOp(null);
    try {
      if (activeTool === 'image') {
        const url = await aiService.generateImage(prompt, size);
        setResult(url);
      } else if (activeTool === 'edit') {
        if (!image) throw new Error("Please upload an image first");
        const url = await aiService.editImage(prompt, image);
        setResult(url);
      } else if (activeTool === 'video') {
        const op = await aiService.generateVeoVideo(prompt, aspectRatio);
        setVideoOp(op);
      } else if (activeTool === 'animate') {
        if (!image) throw new Error("Please upload an image first");
        const op = await aiService.animateImageToVideo(prompt, image, aspectRatio);
        setVideoOp(op);
      }
    } catch (err: any) {
      onAction("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (videoOp && !videoOp.done) {
      interval = setInterval(async () => {
        try {
          const updated = await aiService.getVideosOperation(videoOp);
          if (updated.done) {
            setVideoOp(updated);
            clearInterval(interval);
          }
        } catch (err) {
          clearInterval(interval);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [videoOp]);

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto">
      <div className="mb-12">
        <p className="micro-label mb-4">Creative Studio</p>
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-[var(--text)]">AI <span className="gold-text italic-serif">Creative</span> Studio</h2>
        <p className="text-[var(--text-muted)] text-base md:text-xl">Visualize your home improvement projects with state-of-the-art AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="card-luxury p-6 space-y-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Wand2 size={20} className="text-[var(--accent)]" />
              Select Tool
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setActiveTool('image')} className={`p-3 rounded-xl text-sm font-medium transition-all border ${activeTool === 'image' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--text)]/5'}`}>
                Image Gen
              </button>
              <button onClick={() => setActiveTool('edit')} className={`p-3 rounded-xl text-sm font-medium transition-all border ${activeTool === 'edit' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--text)]/5'}`}>
                Edit Image
              </button>
              <button onClick={() => setActiveTool('video')} className={`p-3 rounded-xl text-sm font-medium transition-all border ${activeTool === 'video' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--text)]/5'}`}>
                Video Gen
              </button>
              <button onClick={() => setActiveTool('animate')} className={`p-3 rounded-xl text-sm font-medium transition-all border ${activeTool === 'animate' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--text)]/5'}`}>
                Animate
              </button>
            </div>
          </div>

          <div className="card-luxury p-6 space-y-4">
            <h3 className="font-bold text-lg mb-4">Configuration</h3>
            
            {(activeTool === 'edit' || activeTool === 'animate') && (
              <div className="space-y-2">
                <label className="micro-label">Upload Reference Image</label>
                <div className="relative group cursor-pointer">
                  <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 group-hover:border-[var(--accent)]/50 transition-all">
                    {image ? (
                      <img src={image} className="w-full h-32 object-cover rounded-xl" alt="" />
                    ) : (
                      <>
                        <Upload size={32} className="text-[var(--text-muted)]" />
                        <span className="text-xs text-[var(--text-muted)]">Click or drag to upload</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="micro-label">Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTool === 'image' ? "A modern Moroccan living room with zellige tiles..." : "Add a traditional lantern to the ceiling..."}
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--accent)]/50 min-h-[100px]"
              />
            </div>

            {activeTool === 'image' && (
              <div className="space-y-2">
                <label className="micro-label">Image Size</label>
                <div className="flex gap-2">
                  {(['1K', '2K', '4K'] as const).map(s => (
                    <button key={s} onClick={() => setSize(s)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${size === s ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(activeTool === 'video' || activeTool === 'animate') && (
              <div className="space-y-2">
                <label className="micro-label">Aspect Ratio</label>
                <div className="flex gap-2">
                  {(['16:9', '9:16'] as const).map(r => (
                    <button key={r} onClick={() => setAspectRatio(r)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${aspectRatio === r ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>
                      {r === '16:9' ? 'Landscape' : 'Portrait'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleGenerate}
              disabled={loading || (!prompt && activeTool !== 'animate')}
              className="w-full bg-[var(--accent)] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[var(--accent)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {loading ? 'Processing...' : 'Generate Magic'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card-luxury p-8 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
            {loading ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[var(--text-muted)] animate-pulse">Our AI is crafting your masterpiece...</p>
              </div>
            ) : result ? (
              <div className="w-full h-full flex flex-col gap-4">
                <img src={result} className="w-full h-auto rounded-3xl shadow-2xl" alt="AI Generated" />
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = result;
                    link.download = 'm3allem-ai-creation.png';
                    link.click();
                  }}
                  className="flex items-center gap-2 text-[var(--accent)] font-bold self-end"
                >
                  <Download size={18} /> Download
                </button>
              </div>
            ) : videoOp ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                {!videoOp.done ? (
                  <div className="text-center space-y-4">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-4 border-[var(--accent)]/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="font-bold text-xl">Generating Video...</p>
                    <p className="text-[var(--text-muted)] max-w-xs mx-auto">Veo is processing your request. This usually takes 1-2 minutes.</p>
                  </div>
                ) : (
                  <div className="w-full space-y-4">
                    <video 
                      src={videoOp.response?.generatedVideos?.[0]?.video?.uri + `?x-goog-api-key=${aiService.getApiKey()}`} 
                      controls 
                      className="w-full rounded-3xl shadow-2xl"
                    />
                    <p className="text-sm text-[var(--text-muted)] text-center italic">Video generated successfully with Veo 3.1</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center space-y-6 max-w-md">
                <div className="w-24 h-24 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles size={48} className="text-[var(--accent)]" />
                </div>
                <h4 className="text-2xl font-bold">Your creation will appear here</h4>
                <p className="text-[var(--text-muted)]">Use the tools on the left to start visualizing your dream home projects.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
