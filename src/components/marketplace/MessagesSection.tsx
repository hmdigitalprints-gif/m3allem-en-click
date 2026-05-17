import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { MessageSquare, Search, Send, Video, Phone, MoreVertical, Paperclip, Smile, ArrowLeft, MapPin, Play, Square, Mic, Image as ImageIcon, Loader2, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { socket, connectSocket } from '../../services/socket';
import { useTranslation } from 'react-i18next';

interface MessagesSectionProps {
  minimal?: boolean;
}

export default function MessagesSection({ minimal = false }: MessagesSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callType, setCallType] = useState<'video' | 'voice'>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connectSocket();
    
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/messages/conversations', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    socket.on('receive_message', (msg) => {
      setConversations(prev => {
        const index = prev.findIndex(c => c.userId === msg.senderId || c.userId === msg.receiverId);
        let updated = [...prev];
        
        if (index === -1) {
          // Could fetch info for new conversation or just refresh
          return updated;
        }
        
        const conv = { ...updated[index] };
        conv.lastMessage = msg.content || (msg.type === 'voice' ? 'Voice message' : msg.type === 'image' ? 'Image message' : 'Location shared');
        conv.lastMessageTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (msg.senderId !== user?.id && (!activeConversation || activeConversation.userId !== msg.senderId)) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
        
        updated.splice(index, 1);
        updated.unshift(conv);
        return updated;
      });

      if (activeConversation && (msg.senderId === activeConversation.userId || msg.receiverId === activeConversation.userId)) {
        setMessages(prev => [...prev, msg]);
        if (msg.senderId === activeConversation.userId) {
          socket.emit('mark_delivered', {
            messageIds: [msg.id],
            senderId: msg.senderId
          });
          
          socket.emit('mark_read', {
            messageIds: [msg.id],
            readerId: user?.id,
            senderId: msg.senderId
          });
        }
      }
    });

    socket.on('user_typing', (data) => {
      if (activeConversation && data.from === activeConversation.userId) {
        setOtherUserTyping(data.isTyping ? data.from : null);
      }
    });

    socket.on('messages_read', (data) => {
      setMessages(prev => prev.map(m => 
        data.messageIds.includes(m.id) ? { ...m, status: 'read' } : m
      ));
    });

    socket.on('messages_delivered', (data) => {
      setMessages(prev => prev.map(m => 
        data.messageIds.includes(m.id) && m.status === 'sent' ? { ...m, status: 'delivered' } : m
      ));
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('messages_read');
      socket.off('messages_delivered');
    };
  }, [activeConversation, user?.id]);

  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const otherUserId = activeConversation.userId;
        const res = await fetch(`/api/messages/${user?.id}/${otherUserId}`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
          
          const unreadIds = data
            .filter((m: any) => m.senderId === otherUserId && m.status !== 'read')
            .map((m: any) => m.id);
          
          if (unreadIds.length > 0) {
            socket.emit('mark_read', {
              messageIds: unreadIds,
              readerId: user?.id,
              senderId: otherUserId
            });
            
            setConversations(prev => prev.map(c => 
              c.userId === otherUserId ? { ...c, unreadCount: 0 } : c
            ));
          }

          const undeliveredIds = data
            .filter((m: any) => m.senderId === otherUserId && m.status === 'sent')
            .map((m: any) => m.id);
          
          if (undeliveredIds.length > 0) {
            socket.emit('mark_delivered', {
              messageIds: undeliveredIds,
              senderId: otherUserId
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [activeConversation, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && activeConversation) {
      setIsTyping(true);
      socket.emit('typing_start', { to: activeConversation.userId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (activeConversation) {
        socket.emit('typing_stop', { to: activeConversation.userId });
      }
    }, 2000);
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    socket.emit('send_message', {
      receiverId: activeConversation.userId,
      content: newMessage,
      type: 'text'
    });
    
    setNewMessage('');
    setIsTyping(false);
    setShowEmojiPicker(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('typing_stop', { to: activeConversation.userId });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch('/api/upload', { 
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ file: base64, type: 'image' })
        });
        if (!res.ok) throw new Error("Upload failed");
        const { url } = await res.json();
        
        socket.emit('send_message', {
          receiverId: activeConversation.userId,
          type: 'image',
          imageUrl: url
        });
      } catch (err) {
        console.error("Image upload failed", err);
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation || !activeConversation) return;

    navigator.geolocation.getCurrentPosition((position) => {
      socket.emit('send_message', {
        receiverId: activeConversation.userId,
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
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          try {
            const res = await fetch('/api/upload', { 
              method: 'POST',
              credentials: 'include',
              headers: { 
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ file: base64Audio, type: 'audio' })
            });
            if (!res.ok) throw new Error("Upload failed");
            const { url } = await res.json();

            socket.emit('send_message', {
              receiverId: activeConversation.userId,
              type: 'voice',
              audioUrl: url
            });
          } catch (err) {
            console.error("Voice upload failed", err);
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

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const initiateCall = (type: 'video' | 'voice') => {
    if (type === 'video') {
      window.dispatchEvent(new CustomEvent('start-live-diagnostic', {
        detail: {
          artisanId: activeConversation.userId,
          artisanName: activeConversation.name,
          artisanUserId: activeConversation.userId
        }
      }));
      return;
    }
    
    setCallType(type);
    setShowVideoCall(true);
    socket.emit('call_request', {
      to: activeConversation.userId,
      from: user?.id,
      fromName: user?.name,
      type: type
    });
  };

  return (
    <div className={`flex flex-col h-full bg-[var(--bg)] ${minimal ? '' : 'p-4 md:p-12 max-w-7xl mx-auto'}`}>
      {!minimal && (
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2 text-[var(--text)] italic uppercase">
              {t('messages_title_1', 'Your ')} <span className="text-[var(--accent)]">{t('messages_title_2', 'Messages.')}</span>
            </h1>
            <p className="text-[var(--text-muted)] text-sm md:text-lg font-medium">{t('messages_subtitle', 'Communicate directly with your artisans.')}</p>
          </div>
          {activeConversation && (
            <button 
              onClick={() => setActiveConversation(null)}
              className="md:hidden flex items-center gap-2 text-[var(--accent)] font-black uppercase tracking-widest text-xs"
            >
              <ArrowLeft size={16} /> Back to List
            </button>
          )}
        </div>
      )}

      <div className={`flex-1 bg-[var(--card-bg)] border border-[var(--border)] ${minimal ? 'rounded-none' : 'rounded-[40px] shadow-2xl'} overflow-hidden flex relative glass`}>
        {/* Conversations List */}
        <div className={`${activeConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-[var(--border)] flex flex-col bg-[var(--card-bg)]`}>
          <div className="p-4 md:p-6 border-b border-[var(--border)]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-30" size={18} />
              <input 
                type="text" 
                placeholder={t('messages_placeholder_search', 'Search conversations...') as string} 
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/40 font-bold"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 no-scrollbar">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-20 bg-[var(--bg)]/50 animate-pulse rounded-2xl mb-2" />
              ))
            ) : conversations.length === 0 ? (
              <div className="text-center py-20">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest opacity-40">No conversations</p>
              </div>
            ) : (
              conversations?.map((conv) => (
                <button 
                  key={conv.id} 
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full p-4 rounded-3xl cursor-pointer transition-all flex items-center gap-4 text-left group ${activeConversation?.id === conv.id ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-xl shadow-[var(--accent)]/30 scale-[1.02]' : 'hover:bg-[var(--text)]/5'}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[var(--bg)] relative shrink-0 border border-[var(--border)] overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                    {conv.avatarUrl ? (
                      <img src={conv.avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--accent)]/5 text-[var(--accent)] font-bold">
                        {conv.name?.charAt(0)}
                      </div>
                    )}
                    {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--card-bg)] shadow-sm"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="font-black truncate text-sm tracking-tight">{conv.name}</h4>
                      <span className={`text-[10px] font-bold uppercase tracking-tighter shrink-0 ${activeConversation?.id === conv.id ? 'opacity-80' : 'text-[var(--text-muted)]'}`}>{conv.lastMessageTime}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <p className={`text-xs truncate font-medium ${activeConversation?.id === conv.id ? 'opacity-90' : 'text-[var(--text-muted)] opacity-70'}`}>{conv.lastMessage}</p>
                      {conv.unreadCount > 0 && conv.id !== activeConversation?.id && (
                        <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-[10px] font-black flex items-center justify-center shrink-0 shadow-lg shadow-[var(--accent)]/30">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className={`${activeConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[var(--bg)]/30 relative`}>
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card-bg)]/80 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  {minimal && (
                    <button onClick={() => setActiveConversation(null)} className="md:hidden p-2">
                       <ArrowLeft size={20} />
                    </button>
                  )}
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-[var(--bg)] relative overflow-hidden ring-2 ring-[var(--accent)]/10 shadow-lg">
                    {activeConversation.avatarUrl ? (
                      <img src={activeConversation.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--accent)]/5 text-[var(--accent)] font-bold">
                        {activeConversation.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-[var(--text)] text-lg tracking-tight italic uppercase">{activeConversation.name}</h4>
                    <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${activeConversation.online || otherUserTyping ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
                      <span className={`w-2 h-2 rounded-full ${activeConversation.online || otherUserTyping ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-400 opacity-30 shadow-none'}`}></span>
                      {otherUserTyping ? 'Typing...' : (activeConversation.online ? 'Online' : 'Offline')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <button 
                    onClick={() => initiateCall('video')}
                    className="p-3.5 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95 shadow-xl shadow-[var(--accent)]/10" 
                    title="Video Call"
                  >
                    <Video size={20} />
                  </button>
                  <button 
                    onClick={() => initiateCall('voice')}
                    className="p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all active:scale-95 shadow-sm"
                    title="Voice Call"
                  >
                    <Phone size={20} />
                  </button>
                  <div className="relative group/more">
                    <button className="p-3.5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all active:scale-95 shadow-sm">
                      <MoreVertical size={20} />
                    </button>
                    <div className="absolute right-0 top-full mt-3 w-56 bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl shadow-2xl hidden group-hover/more:block z-20 glass overflow-hidden">
                      <button 
                        onClick={handleShareLocation}
                        className="w-full p-5 flex items-center gap-4 hover:bg-[var(--text)]/5 transition-colors text-sm font-black uppercase tracking-wider text-[var(--text)]"
                      >
                        <MapPin size={20} className="text-[var(--accent)]" /> Share Location
                      </button>
                      <button 
                         onClick={() => setActiveConversation(null)}
                         className="w-full p-5 flex items-center gap-4 hover:bg-rose-500/10 transition-colors text-sm font-black uppercase tracking-wider text-rose-500 border-t border-[var(--border)]"
                      >
                        <X size={20} /> Close Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 no-scrollbar scroll-smooth">
                <AnimatePresence>
                  {messages?.map((msg, index) => {
                    const isMe = msg.senderId === user?.id;
                    const showDate = index === 0 || new Date(messages[index-1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
                    
                    return (
                      <React.Fragment key={msg.id}>
                        {showDate && (
                          <div className="flex justify-center my-8">
                            <span className="px-4 py-1.5 bg-[var(--text)]/5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] border border-[var(--border)]">
                              {new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                        <motion.div 
                          initial={{ opacity: 0, y: 15, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] md:max-w-[75%] p-5 md:p-6 rounded-[32px] shadow-xl relative group ${isMe ? 'bg-[var(--accent)] text-[var(--accent-foreground)] rounded-tr-none' : 'bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] rounded-tl-none glass'}`}>
                            {msg.type === 'voice' ? (
                              <div className="flex items-center gap-5 min-w-[220px]">
                                <button className={`p-4 rounded-full shadow-lg transition-all active:scale-95 ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)]'}`}>
                                  <Play size={24} fill="currentColor" />
                                </button>
                                <div className="flex-1 space-y-2">
                                  <div className={`h-1.5 rounded-full overflow-hidden ${isMe ? 'bg-white/20' : 'bg-[var(--text)]/10'}`}>
                                    <div className={`h-full w-0 ${isMe ? 'bg-white' : 'bg-[var(--accent)]'}`} />
                                  </div>
                                  <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-60">
                                    <span>0:00</span>
                                    <span>Voice Note</span>
                                  </div>
                                </div>
                                <audio src={msg.audioUrl} className="hidden" />
                              </div>
                            ) : msg.type === 'image' ? (
                              <div className="space-y-4">
                                <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10">
                                  <img 
                                    src={msg.imageUrl} 
                                    alt="Sent image" 
                                    className="max-w-full h-auto cursor-zoom-in hover:scale-[1.02] transition-transform duration-500"
                                    onClick={() => window.open(msg.imageUrl, '_blank')}
                                    loading="lazy"
                                  />
                                </div>
                                {msg.content && <p className="text-sm md:text-lg font-medium leading-relaxed italic">{msg.content}</p>}
                              </div>
                            ) : msg.type === 'location' ? (
                              <a 
                                href={`https://www.google.com/maps?q=${msg.latitude},${msg.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-5 group/loc"
                              >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${isMe ? 'bg-white/20' : 'bg-[var(--accent)]/10 text-[var(--accent)]'}`}>
                                  <MapPin size={28} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-black uppercase italic italic tracking-tight">Shared Location</p>
                                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover/loc:translate-x-1 transition-transform">Open in Google Maps →</p>
                                </div>
                              </a>
                            ) : (
                              <p className="text-sm md:text-lg font-medium leading-relaxed">{msg.content}</p>
                            )}
                            <div className={`flex items-center gap-2 mt-3 opacity-40 group-hover:opacity-100 transition-opacity ${isMe ? 'justify-end' : ''}`}>
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && (
                                <div className="flex items-center">
                                   {msg.status === 'read' ? (
                                     <div className="flex -space-x-1">
                                       <CheckCircle size={10} className="text-blue-400 fill-blue-400/20" />
                                       <CheckCircle size={10} className="text-blue-400 fill-blue-400/20" />
                                     </div>
                                   ) : msg.status === 'delivered' ? (
                                     <div className="flex -space-x-1">
                                       <CheckCircle size={10} className="text-gray-400" />
                                       <CheckCircle size={10} className="text-gray-400" />
                                     </div>
                                   ) : (
                                     <CheckCircle size={10} className="text-gray-300" />
                                   )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      </React.Fragment>
                    );
                  })}
                </AnimatePresence>
                {otherUserTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[var(--card-bg)] border border-[var(--border)] p-5 rounded-[24px] flex gap-2 glass">
                      <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 md:p-8 bg-[var(--card-bg)]/80 backdrop-blur-2xl border-t border-[var(--border)] relative z-20">
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.9 }}
                      className="absolute bottom-full left-4 mb-4 p-5 bg-[var(--card-bg)] border border-[var(--accent)]/20 rounded-[40px] shadow-2xl z-30 grid grid-cols-6 gap-3 glass"
                    >
                      {['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🙌', '✨', '✅', '🙏', '💯'].map(emoji => (
                        <button 
                          key={emoji} 
                          onClick={() => addEmoji(emoji)}
                          className="w-12 h-12 flex items-center justify-center hover:bg-[var(--bg)] rounded-2xl transition-all hover:scale-110 active:scale-95 text-2xl"
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-5xl mx-auto">
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 rounded-2xl text-[var(--text-muted)] hover:bg-[var(--text)]/5 hover:text-[var(--accent)] transition-all active:scale-90 relative shadow-sm"
                    >
                      {isUploading ? <Loader2 size={24} className="animate-spin text-[var(--accent)]" /> : <Paperclip size={24} />}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-4 rounded-2xl transition-all active:scale-90 hidden sm:flex items-center justify-center shadow-sm ${showEmojiPicker ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--text)]/5'}`}
                    >
                      <Smile size={24} />
                    </button>
                  </div>
                  
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={handleTyping}
                      placeholder={isRecording ? "Listening..." : "Write a message..."}
                      disabled={isRecording}
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-3xl py-5 px-8 focus:outline-none focus:border-[var(--accent)]/50 focus:ring-4 focus:ring-[var(--accent)]/5 transition-all text-base font-bold text-[var(--text)] shadow-inner"
                    />
                  </div>

                  <div className="flex gap-3">
                    {newMessage.trim() || isRecording ? (
                      <button 
                        type={isRecording ? 'button' : 'submit'}
                        onClick={isRecording ? stopRecording : undefined}
                        className={`${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-[var(--accent)]'} text-white p-5 rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[var(--accent)]/30`}
                      >
                        {isRecording ? <Square size={24} /> : <Send size={24} />}
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={startRecording}
                        className="p-5 rounded-3xl bg-[var(--text)]/5 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all active:scale-90"
                      >
                        <Mic size={24} />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-[var(--text-muted)] p-12 text-center h-full min-h-[400px]">
              <div className="w-32 h-32 rounded-[48px] bg-[var(--accent)]/5 flex items-center justify-center text-[var(--accent)] mb-10 opacity-30 shadow-inner">
                <MessageSquare size={56} />
              </div>
              <h3 className="text-3xl font-black mb-4 text-[var(--text)] tracking-tighter italic uppercase">{t('messages_select_title', 'Select a conversation')}</h3>
              <p className="max-w-sm text-lg font-medium opacity-60 leading-relaxed">{t('messages_select_desc', 'Open a chat from the sidebar to start collaborating with your artisan.')}</p>
              
              <div className="mt-12 grid grid-cols-2 gap-4 max-w-md w-full">
                <div className="p-6 bg-[var(--text)]/5 border border-[var(--border)] rounded-3xl text-center">
                  <Video size={24} className="mx-auto mb-3 text-[var(--accent)]" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Video Diagnostic</p>
                </div>
                <div className="p-6 bg-[var(--text)]/5 border border-[var(--border)] rounded-3xl text-center">
                  <ImageIcon size={24} className="mx-auto mb-3 text-[var(--accent)]" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Photo Sharing</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Call Modal Overlay */}
        <AnimatePresence>
          {showVideoCall && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center text-white p-6"
            >
              <div className="w-48 h-48 rounded-[64px] bg-[var(--accent)]/20 flex items-center justify-center relative mb-12 shadow-[0_0_100px_rgba(255,215,0,0.2)]">
                 <div className="absolute inset-x-0 inset-y-0 rounded-[64px] border-4 border-[var(--accent)]/30 animate-pulse"></div>
                 <div className="w-40 h-40 rounded-[56px] overflow-hidden border-4 border-[var(--accent)] shadow-2xl relative z-10 scale-105">
                    {activeConversation.avatarUrl ? (
                      <img src={activeConversation.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-5xl font-black italic">
                        {activeConversation.name?.charAt(0)}
                      </div>
                    )}
                 </div>
              </div>
              
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black mb-3 tracking-tighter italic uppercase">{activeConversation.name}</h2>
                <div className="flex items-center justify-center gap-3">
                  <div className="flex gap-1">
                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}} />)}
                  </div>
                  <p className="text-[var(--accent)] font-black uppercase tracking-[0.3em] text-[10px]">{t('calling_via', 'Calling via')} {callType}</p>
                </div>
              </div>

              <div className="flex gap-10">
                <button 
                  onClick={() => setShowVideoCall(false)}
                  className="w-24 h-24 rounded-full bg-rose-500 hover:bg-rose-600 transition-all active:scale-90 shadow-[0_15px_40px_rgba(244,63,94,0.3)] flex items-center justify-center group"
                >
                  <Phone size={36} className="rotate-[135deg] group-hover:scale-110 transition-transform" />
                </button>
                {callType === 'video' && (
                  <button className="w-24 h-24 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-90 backdrop-blur-md border border-white/10 flex items-center justify-center group">
                    <Video size={36} className="group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
