import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Sparkles, BrainCircuit, Banknote, X, Maximize2, Minimize2 } from 'lucide-react';

interface LiveDiagnosticProps {
  userId: string;
  userName: string;
  targetUserId: string;
  targetUserName: string;
  isArtisan: boolean;
  onClose: () => void;
  initialSignal?: any;
}

export default function LiveDiagnostic({ userId, userName, targetUserId, targetUserName, isArtisan, onClose, initialSignal }: LiveDiagnosticProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState<any>();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [diagnosis, setDiagnosis] = useState("");
  const [price, setPrice] = useState("");
  const [receivedDiagnostic, setReceivedDiagnostic] = useState<{ diagnosis: string, price: string } | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (initialSignal) {
      setReceivingCall(true);
      setCaller(targetUserId);
      setName(targetUserName);
      setCallerSignal(initialSignal);
    }
  }, [initialSignal, targetUserId, targetUserName]);

  useEffect(() => {
    socket.current = io(window.location.origin);
    socket.current.emit("join", userId);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setStream(stream);
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
    });

    socket.current.on("incoming_call", (data) => {
      if (!data) return;
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.fromName || data.name);
      setCallerSignal(data.signal);
    });

    socket.current.on("call_accepted", (data) => {
      if (!data) return;
      setCallAccepted(true);
    });

    socket.current.on("webrtc_signal", (data) => {
      if (!data) return;
      if (connectionRef.current) {
        connectionRef.current.signal(data.signal);
      }
    });

    socket.current.on("ice_candidate", (data) => {
      if (!data) return;
      if (connectionRef.current) {
        // connectionRef.current.addIceCandidate(data.candidate);
      }
    });

    socket.current.on("call_ended", () => {
      setCallEnded(true);
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
      onClose();
    });

    socket.current.on("receive_diagnostic", (data) => {
      if (!data) return;
      setReceivedDiagnostic(data);
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [userId]);

  const callUser = (id: string) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream!,
    });

    peer.on("signal", (data) => {
      socket.current?.emit("call_request", {
        to: id,
        from: userId,
        fromName: userName,
        signal: data,
      });
    });

    peer.on("stream", (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
      setRemoteStream(stream);
    });

    socket.current?.on("call_accepted", (data) => {
      if (!data) return;
      setCallAccepted(true);
      peer.signal(data.signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = (cId?: string, cSignal?: any) => {
    const targetCaller = cId || caller;
    const targetSignal = cSignal || callerSignal;
    if (!targetSignal) return;

    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream!,
    });

    peer.on("signal", (data) => {
      socket.current?.emit("accept_call", { signal: data, to: targetCaller });
    });

    peer.on("stream", (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
      setRemoteStream(stream);
    });

    peer.signal(targetSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    socket.current?.emit("end_call", { to: targetUserId });
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    onClose();
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !videoEnabled;
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !audioEnabled;
      setAudioEnabled(!audioEnabled);
    }
  };

  const submitDiagnostic = () => {
    socket.current?.emit("submit_diagnostic", {
      to: targetUserId,
      diagnosis,
      price
    });
    // Maybe show a success toast
  };

  // Auto-call or Auto-answer
  useEffect(() => {
    if (stream) {
      if (initialSignal && !callAccepted) {
        answerCall(targetUserId, initialSignal);
      } else if (!receivingCall && !callAccepted) {
        callUser(targetUserId);
      }
    }
  }, [stream, initialSignal]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed z-[200] ${isMinimized ? 'bottom-6 right-6 w-64 h-48' : 'inset-0 md:inset-10 bg-[var(--bg)] border border-[var(--border)] md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col'}`}
    >
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card-bg)]/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center text-[var(--accent-foreground)]">
            <Video size={20} />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text)]">Live Diagnostic</h3>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold">
              {callAccepted ? `Connected with ${targetUserName}` : `Calling ${targetUserName}...`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-[var(--card-bg)]/10 rounded-lg text-[var(--text-muted)] transition-colors"
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button 
            onClick={leaveCall}
            className="p-2 hover:bg-[var(--destructive)]/20 rounded-lg text-[var(--destructive)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Video Area */}
          <div className="flex-1 relative bg-[var(--bg)] flex items-center justify-center">
            {/* Incoming Call UI */}
            {receivingCall && !callAccepted && (
              <div className="absolute inset-0 z-50 bg-[var(--bg)] flex flex-col items-center justify-center gap-8">
                <div className="w-24 h-24 bg-[var(--accent)]/10 rounded-full flex items-center justify-center text-[var(--accent)] animate-pulse">
                  <Video size={48} />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-[var(--text)]">Incoming Diagnostic Call</h3>
                  <p className="text-[var(--text-muted)]">{name} is calling...</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={leaveCall}
                    className="w-16 h-16 rounded-full bg-[var(--destructive)] text-white flex items-center justify-center hover:opacity-90 transition-all"
                  >
                    <PhoneOff size={24} />
                  </button>
                  <button 
                    onClick={() => answerCall()}
                    className="w-16 h-16 rounded-full bg-[var(--success)] text-white flex items-center justify-center hover:opacity-90 transition-all animate-bounce"
                  >
                    <Video size={24} />
                  </button>
                </div>
              </div>
            )}

            {/* Remote Video */}
            <video 
              playsInline 
              ref={userVideo} 
              autoPlay 
              className="w-full h-full object-cover bg-black"
            />
            
            {/* Local Video Overlay */}
            <div className="absolute bottom-6 right-6 w-32 md:w-48 aspect-video bg-[var(--card-bg)]/10 rounded-2xl overflow-hidden border-2 border-[var(--border)] shadow-2xl">
              <video 
                playsInline 
                muted 
                ref={myVideo} 
                autoPlay 
                className="w-full h-full object-cover bg-black"
              />
              {!videoEnabled && (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <VideoOff size={24} className="text-white/20" />
                </div>
              )}
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button 
                onClick={toggleAudio}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${audioEnabled ? 'bg-[var(--text)]/10 text-[var(--text)] hover:bg-[var(--text)]/20' : 'bg-[var(--destructive)] text-white'}`}
              >
                {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button 
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${videoEnabled ? 'bg-[var(--text)]/10 text-[var(--text)] hover:bg-[var(--text)]/20' : 'bg-[var(--destructive)] text-white'}`}
              >
                {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              <button 
                onClick={leaveCall}
                className="w-14 h-14 rounded-full bg-[var(--destructive)] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-xl"
              >
                <PhoneOff size={24} />
              </button>
            </div>
          </div>

          {/* Diagnostic Panel */}
          <div className="w-full md:w-80 border-l border-[var(--border)] bg-[var(--card-bg)] p-6 flex flex-col gap-6">
            {isArtisan ? (
              <>
                <div className="flex items-center gap-2 text-[var(--accent)]">
                  <BrainCircuit size={20} />
                  <h4 className="font-bold uppercase tracking-wider text-sm">Artisan Diagnostic</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Diagnosis</label>
                    <textarea 
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Describe the problem and solution..."
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 h-32 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Approximate Price (MAD)</label>
                    <div className="relative">
                      <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                      <input 
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 250"
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={submitDiagnostic}
                    className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                  >
                    <Sparkles size={18} /> Send Diagnostic
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[var(--accent)]">
                  <Sparkles size={20} />
                  <h4 className="font-bold uppercase tracking-wider text-sm">Live Diagnosis</h4>
                </div>

                {receivedDiagnostic ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-4 rounded-2xl bg-[var(--card-bg)]/5 border border-[var(--border)]">
                      <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Diagnosis</p>
                      <p className="text-sm text-[var(--text)] leading-relaxed">{receivedDiagnostic.diagnosis}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
                      <p className="text-xs font-bold text-[var(--accent)] uppercase mb-1">Estimated Price</p>
                      <p className="text-2xl font-black text-[var(--text)]">{receivedDiagnostic.price} <span className="text-sm font-bold opacity-50">MAD</span></p>
                    </div>
                    <button className="w-full bg-[var(--text)] text-[var(--bg)] py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                      Book Service Now
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                    <Loader size={32} className="animate-spin mb-4" />
                    <p className="text-sm text-[var(--text)]">Waiting for artisan's diagnostic...</p>
                  </div>
                )}
              </>
            )}
            
            <div className="mt-auto pt-6 border-t border-[var(--border)]">
              <p className="text-[10px] text-center text-[var(--text-muted)] uppercase tracking-widest font-bold">
                Secure Live Diagnostic Session
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Loader({ size, className }: { size: number, className?: string }) {
  return (
    <div className={`w-${size} h-${size} border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin ${className}`} />
  );
}
