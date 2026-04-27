import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Mic, Square, Play, Pause, Video, Image as ImageIcon, MapPin, Check, CheckCheck, Loader2 } from 'lucide-react';
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
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Fetch initial messages
    fetch(`/api/messages/${currentUser.id}/${artisan.user_id}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        // Mark unread messages as read
        const unreadIds = data
          .filter((m: any) => m.receiver_id === currentUser.id && m.status !== 'read')
          .map((m: any) => m.id);
        if (unreadIds.length > 0 && socket) {
          socket.emit('mark_read', { messageIds: unreadIds, readerId: currentUser.id, senderId: artisan.user_id });
        }
      })
      .catch(err => console.error("Failed to load messages", err));

    // Initialize socket
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join', currentUser.id);
    });

    newSocket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
      if (message.receiver_id === currentUser.id) {
        newSocket.emit('mark_read', { messageIds: [message.id], readerId: currentUser.id, senderId: artisan.user_id });
      }
    });

    newSocket.on('user_typing', (data) => {
      if (data && data.from === artisan.user_id) {
        setIsOtherTyping(data.isTyping);
      }
    });

    newSocket.on('messages_read', (data) => {
      if (!data || !data.messageIds) return;
      setMessages(prev => prev.map(m => 
        data.messageIds.includes(m.id) ? { ...m, status: 'read' } : m
      ));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser.id, artisan.user_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!socket) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    socket.emit('typing_start', { to: artisan.user_id, from: currentUser.id });
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { to: artisan.user_id, from: currentUser.id });
    }, 2000);
  };

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
    socket.emit('typing_stop', { to: artisan.user_id, from: currentUser.id });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socket) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, type: 'image' })
        });
        const { url } = await res.json();
        
        socket.emit('send_message', {
          sender_id: currentUser.id,
          receiver_id: artisan.user_id,
          type: 'image',
          image_url: url
        });
      } catch (err) {
        console.error("Image upload failed", err);
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation || !socket) return;

    navigator.geolocation.getCurrentPosition((position) => {
      socket.emit('send_message', {
        sender_id: currentUser.id,
        receiver_id: artisan.user_id,
        type: 'location',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    }, (err) => {
      console.error("Failed to get location", err);
    });
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
            <div className="relative">
              <img 
                src={artisan.image || artisan.avatar_url} 
                alt={artisan.name} 
                className="w-12 h-12 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--card-bg)] ${artisan.is_online ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--text)]">{artisan.name}</h3>
              <p className="text-[var(--text-muted)] text-sm">
                {isOtherTyping ? (
                  <span className="text-[var(--accent)] font-medium animate-pulse">Typing...</span>
                ) : artisan.category}
              </p>
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
              <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
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
                  ) : msg.type === 'image' ? (
                    <img 
                      src={msg.image_url} 
                      alt="Shared photo" 
                      className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(msg.image_url, '_blank')}
                    />
                  ) : msg.type === 'location' ? (
                    <a 
                      href={`https://www.google.com/maps?q=${msg.latitude},${msg.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:underline"
                    >
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Shared Location</p>
                        <p className="text-[10px] opacity-70">View on Google Maps</p>
                      </div>
                    </a>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
                
                {isMe && (
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.status === 'read' ? (
                      <CheckCheck size={12} className="text-[var(--accent)]" />
                    ) : (
                      <Check size={12} className="text-[var(--text-muted)]" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {isOtherTyping && (
            <div className="flex justify-start">
              <div className="bg-[var(--card-bg)]/80 text-[var(--text)] border border-[var(--border)] rounded-2xl rounded-bl-sm px-4 py-2 flex items-center gap-1">
                <div className="w-1 h-1 bg-[var(--text-muted)] rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--card-bg)]/50">
          <div className="flex gap-2 items-center">
            <div className="flex gap-1">
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-full transition-all ${isRecording ? 'bg-[var(--destructive)] text-white animate-pulse' : 'bg-[var(--card-bg)]/10 text-[var(--text)] hover:bg-[var(--card-bg)]/20'}`}
                title="Voice Message"
              >
                {isRecording ? <Square size={18} /> : <Mic size={18} />}
              </button>
              
              {!isRecording && (
                <>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 bg-[var(--card-bg)]/10 text-[var(--text)] hover:bg-[var(--card-bg)]/20 rounded-full transition-all disabled:opacity-50"
                    title="Send Photo"
                  >
                    {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                  </button>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <button 
                    onClick={handleShareLocation}
                    className="p-2 bg-[var(--card-bg)]/10 text-[var(--text)] hover:bg-[var(--card-bg)]/20 rounded-full transition-all"
                    title="Share Location"
                  >
                    <MapPin size={18} />
                  </button>
                </>
              )}
            </div>
            
            {!isRecording ? (
              <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
                <input 
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
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
