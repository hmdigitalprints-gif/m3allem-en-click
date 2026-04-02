import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Mic, Square, Play, Pause, Video } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface ChatModalProps {
  artisan: any;
  currentUser: any;
  onClose: () => void;
}

export default function ChatModal({ artisan, currentUser, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial messages
    fetch(`/api/messages/${currentUser.id}/${artisan.user_id}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Failed to load messages", err));

    // Initialize socket
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join', currentUser.id);
    });

    newSocket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser.id, artisan.user_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      sender_id: currentUser.id,
      receiver_id: artisan.user_id,
      content: newMessage.trim(),
      type: 'text'
    });

    setNewMessage('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setAudioChunks([]);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks((prev) => [...prev, e.data]);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          
          // Upload audio
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: base64Audio, type: 'audio' })
          });
          const { url } = await res.json();

          // Send voice message
          if (socket) {
            socket.emit('send_message', {
              sender_id: currentUser.id,
              receiver_id: artisan.user_id,
              type: 'voice',
              audio_url: url
            });
          }
        };
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[var(--bg)]/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center bg-[var(--card-bg)]/50">
          <div className="flex items-center gap-4">
            <img 
              src={artisan.image || artisan.avatar_url} 
              alt={artisan.name} 
              className="w-12 h-12 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="font-bold text-lg text-[var(--text)]">{artisan.name}</h3>
              <p className="text-[var(--text-muted)] text-sm">{artisan.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('start-live-diagnostic', {
                  detail: {
                    artisanId: artisan.id,
                    artisanName: artisan.name,
                    artisanUserId: artisan.user_id
                  }
                }));
                onClose();
              }}
              className="p-2 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-full transition-colors"
              title="Start Video Call"
            >
              <Video size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 bg-[var(--card-bg)]/10 hover:bg-[var(--card-bg)]/20 rounded-full transition-colors text-[var(--text)]"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages?.map((msg, idx) => {
            const isMe = msg.sender_id === currentUser.id;
            return (
              <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMe ? 'bg-[var(--accent)] text-[var(--accent-foreground)] rounded-br-sm' : 'bg-[var(--card-bg)]/80 text-[var(--text)] border border-[var(--border)] rounded-bl-sm'}`}>
                  {msg.type === 'voice' ? (
                    <div className="flex items-center gap-3 min-w-[150px]">
                      <button className="p-2 bg-[var(--text)]/10 rounded-full text-inherit">
                        <Play size={16} fill="currentColor" />
                      </button>
                      <div className="flex-1 h-1 bg-[var(--text)]/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--text)]/40 w-1/3" />
                      </div>
                      <audio src={msg.audio_url} className="hidden" />
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--card-bg)]/50">
          <div className="flex gap-2 items-center">
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-full transition-all ${isRecording ? 'bg-[var(--destructive)] text-white animate-pulse' : 'bg-[var(--card-bg)]/10 text-[var(--text)] hover:bg-[var(--card-bg)]/20'}`}
            >
              {isRecording ? <Square size={20} /> : <Mic size={20} />}
            </button>
            
            {!isRecording ? (
              <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
                <input 
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-full px-6 py-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </form>
            ) : (
              <div className="flex-1 flex items-center px-4 text-[var(--destructive)] font-bold text-sm">
                Recording...
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
