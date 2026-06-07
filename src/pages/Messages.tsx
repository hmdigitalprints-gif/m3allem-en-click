import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { MessageSquare, Search, Send, Video, Phone, MoreVertical, Paperclip, Smile, ArrowLeft, MapPin, Play, Square, Mic, Image as ImageIcon, Loader2, Check, CheckCheck, FileText, BellOff, Bell, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { socket, connectSocket } from '../services/socket';
import { useTranslation } from 'react-i18next';

export default function Messages() {
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
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep track of latest message timestamp for secure offline sync
  const lastSyncTimeRef = useRef<string>(new Date().toISOString());

  // Function to sync missed offline messages
  const syncOfflineMessages = async () => {
    if (!user?.id) return;
    try {
      const since = lastSyncTimeRef.current;
      const res = await fetch(`/api/messages/sync?since=${encodeURIComponent(since)}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const newMessages = await res.json();
        if (newMessages.length > 0) {
          // If we currently have an active chat conversation, merge missed items
          if (activeConversation) {
            const activeOtherId = activeConversation.userId;
            const relevantNew = newMessages.filter((m: any) =>
              (m.senderId === activeOtherId || m.receiverId === activeOtherId)
            );
            if (relevantNew.length > 0) {
              setMessages(prev => {
                const existingIds = new Set(prev.map(m => m.id));
                const filtered = relevantNew.filter((m: any) => !existingIds.has(m.id));
                return [...prev, ...filtered];
              });

              // Mark synchronized offline messages as read/delivered ASAP
              const unreadIds = relevantNew
                .filter((m: any) => m.senderId === activeOtherId && m.status !== 'read')
                .map((m: any) => m.id);
              if (unreadIds.length > 0) {
                socket.emit('mark_delivered', { messageIds: unreadIds, senderId: activeOtherId });
                socket.emit('mark_read', { messageIds: unreadIds, readerId: user.id, senderId: activeOtherId });
              }
            }
          }

          // Trigger state update on conversation list items
          setConversations(prev => {
            let updated = [...prev];
            newMessages.forEach((msg: any) => {
              const index = updated.findIndex(c => c.userId === msg.senderId || c.userId === msg.receiverId);
              if (index !== -1) {
                const conv = { ...updated[index] };
                conv.lastMessage = msg.content || (msg.type === 'voice' ? 'Voice message' : msg.type === 'file' ? 'Attachment' : 'Image message');
                conv.lastMessageTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                if (msg.senderId !== user?.id && (!activeConversation || activeConversation.userId !== msg.senderId)) {
                  conv.unreadCount = (conv.unreadCount || 0) + 1;
                }
                updated.splice(index, 1);
                updated.unshift(conv);
              }
            });
            return updated;
          });

          // Record latest sequence time
          const maxTime = newMessages.reduce((max: string, m: any) => m.createdAt > max ? m.createdAt : max, since);
          lastSyncTimeRef.current = maxTime;
        }
      }
    } catch (err) {
      console.error("[OFFLINE SYNC ERROR]:", err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      connectSocket();
      // Initially, the sync time is set to current time
      lastSyncTimeRef.current = new Date().toISOString();
    }
    
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

    // Set up auto-sync on socket re-connection and screen focus
    socket.on('connect', syncOfflineMessages);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncOfflineMessages();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    socket.on('receive_message', (msg) => {
      // Record this timestamp
      if (msg.createdAt > lastSyncTimeRef.current) {
        lastSyncTimeRef.current = msg.createdAt;
      }

      // Update conversations list with new message
      setConversations(prev => {
        const index = prev.findIndex(c => c.userId === msg.senderId || c.userId === msg.receiverId);
        if (index === -1) return prev;
        
        const updated = [...prev];
        const conv = { ...updated[index] };
        conv.lastMessage = msg.content || (msg.type === 'voice' ? 'Voice message' : msg.type === 'file' ? 'Attachment' : 'Image message');
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
      socket.off('connect', syncOfflineMessages);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
          
          // Capture latest sequences
          if (data.length > 0) {
            const maxMsg = data[data.length - 1];
            if (maxMsg.createdAt > lastSyncTimeRef.current) {
              lastSyncTimeRef.current = maxMsg.createdAt;
            }
          }

          // Mark as read
          const unreadIds = data
            .filter((m: any) => m.senderId === otherUserId && m.status !== 'read')
            .map((m: any) => m.id);
          
          if (unreadIds.length > 0) {
            socket.emit('mark_delivered', {
              messageIds: unreadIds,
              senderId: otherUserId
            });
            
            socket.emit('mark_read', {
              messageIds: unreadIds,
              readerId: user?.id,
              senderId: otherUserId
            });
            
            // Clear unread count locally
            setConversations(prev => prev.map(c => 
              c.userId === otherUserId ? { ...c, unreadCount: 0 } : c
            ));
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

    if (activeConversation.isBlocked) {
      alert("This connection is currently blocked.");
      return;
    }

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversation) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const isImage = file.type.startsWith('image/');
        const uploadType = isImage ? 'image' : 'file';

        const res = await fetch('/api/upload', { 
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ file: base64, type: uploadType })
        });
        if (!res.ok) throw new Error("Upload failed");
        const { url } = await res.json();
        
        socket.emit('send_message', {
          receiverId: activeConversation.userId,
          type: isImage ? 'image' : 'file',
          ...(isImage
            ? { imageUrl: url, content: "" }
            : { fileUrl: url, fileName: file.name, fileSize: file.size, content: "" })
        });
      } catch (err) {
        console.error("File upload failed", err);
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

  const handleToggleBlock = async () => {
    if (!activeConversation) return;
    const isCurrentlyBlocked = activeConversation.isBlocked;
    const endpoint = `/api/messages/relations/${isCurrentlyBlocked ? 'unblock' : 'block'}`;
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: activeConversation.userId })
      });

      if (res.ok) {
        const updatedConv = { ...activeConversation, isBlocked: !isCurrentlyBlocked };
        setActiveConversation(updatedConv);
        setConversations(prev => prev.map(c => 
          c.userId === activeConversation.userId ? { ...c, isBlocked: !isCurrentlyBlocked } : c
        ));
      }
    } catch (err) {
      console.error("Failed to toggle block state:", err);
    }
  };

  const handleToggleMute = async () => {
    if (!activeConversation) return;
    const isCurrentlyMuted = activeConversation.isMuted;
    const endpoint = `/api/messages/relations/${isCurrentlyMuted ? 'unmute' : 'mute'}`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: activeConversation.userId })
      });

      if (res.ok) {
        const updatedConv = { ...activeConversation, isMuted: !isCurrentlyMuted };
        setActiveConversation(updatedConv);
        setConversations(prev => prev.map(c => 
          c.userId === activeConversation.userId ? { ...c, isMuted: !isCurrentlyMuted } : c
        ));
      }
    } catch (err) {
      console.error("Failed to toggle mute state:", err);
    }
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
    <Layout>
      <div className="p-4 md:p-12 max-w-7xl mx-auto h-[calc(100vh-100px)] md:h-[calc(100vh-160px)] flex flex-col">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-2 text-[var(--text)]">
              {t('messages_title_1', 'Your ')} <span className="text-[var(--accent)]">{t('messages_title_2', 'Messages.')}</span>
            </h1>
            <p className="text-[var(--text-muted)] text-sm md:text-lg">{t('messages_subtitle', 'Communicate directly with your artisans.')}</p>
          </div>
          {activeConversation && (
            <button 
              onClick={() => setActiveConversation(null)}
              className="md:hidden flex items-center gap-2 text-[var(--accent)] font-bold text-sm"
            >
              <ArrowLeft size={16} /> Back to List
            </button>
          )}
        </div>

        <div className="flex-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] md:rounded-[40px] overflow-hidden flex shadow-2xl relative">
          <div className={`${activeConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-[var(--border)] flex flex-col bg-[var(--card-bg)]`}>
            <div className="p-4 md:p-6 border-b border-[var(--border)]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/30" size={18} />
                <input 
                  type="text" 
                  placeholder={t('messages_placeholder_search', 'Search conversations...') as string} 
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/40"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-1 no-scrollbar">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-20 bg-[var(--bg)]/50 animate-pulse rounded-2xl mb-2" />
                ))
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-muted)] text-sm">No conversations yet.</div>
              ) : (
                conversations?.map((conv) => (
                  <button 
                    key={conv.id} 
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 text-left ${activeConversation?.id === conv.id ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/20 scale-[0.98]' : 'hover:bg-[var(--bg)] border border-transparent'}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[var(--bg)] relative shrink-0 border border-[var(--border)] overflow-hidden shadow-sm">
                      {conv.avatarUrl ? (
                        <img src={conv.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--accent)]/5 text-[var(--accent)] font-bold">
                          {conv.name?.charAt(0)}
                        </div>
                      )}
                      {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--card-bg)] shadow-sm"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold truncate text-[var(--text)] text-sm">{conv.name}</h4>
                          {conv.isMuted && <BellOff size={12} className="text-[var(--text-muted)] shrink-0" />}
                          {conv.isBlocked && <ShieldAlert size={12} className="text-rose-500 shrink-0" />}
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] shrink-0">{conv.lastMessageTime}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-xs text-[var(--text-muted)] truncate opacity-70">{conv.lastMessage}</p>
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-[10px] font-bold flex items-center justify-center shrink-0 shadow-lg shadow-[var(--accent)]/30">
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
          
          <div className={`${activeConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[var(--bg)]/30`}>
            {activeConversation ? (
              <>
                <div className="p-4 md:p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card-bg)]/50 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--bg)] relative overflow-hidden ring-2 ring-[var(--accent)]/10">
                      {activeConversation.avatarUrl ? (
                        <img src={activeConversation.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--accent)]/5 text-[var(--accent)] font-bold">
                          {activeConversation.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[var(--text)] flex items-center gap-1.5">
                        {activeConversation.name}
                        {activeConversation.isMuted && <BellOff size={14} className="text-[var(--text-muted)]" />}
                        {activeConversation.isBlocked && <ShieldAlert size={14} className="text-rose-500" />}
                      </h4>
                      <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${activeConversation.online || otherUserTyping ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${activeConversation.online || otherUserTyping ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        {otherUserTyping ? 'Typing...' : (activeConversation.online ? 'Online' : 'Offline')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4">
                    <button 
                      onClick={() => initiateCall('video')}
                      className="p-3 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all active:scale-95" title="Video Call"
                    >
                      <Video size={20} />
                    </button>
                    <button 
                      onClick={() => initiateCall('voice')}
                      className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all active:scale-95"
                      title="Voice Call"
                    >
                      <Phone size={20} />
                    </button>
                    <div className="relative group/more">
                      <button 
                        className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-all active:scale-95"
                      >
                        <MoreVertical size={20} />
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-xl hidden group-hover/more:block z-20 overflow-hidden">
                        <button 
                          onClick={handleShareLocation}
                          className="w-full p-4 flex items-center gap-3 hover:bg-[var(--bg)] transition-colors text-sm text-left border-b border-[var(--border)]"
                        >
                          <MapPin size={18} className="text-[var(--accent)]" /> Share Location
                        </button>
                        <button 
                          onClick={handleToggleMute}
                          className="w-full p-4 flex items-center gap-3 hover:bg-[var(--bg)] transition-colors text-sm text-left border-b border-[var(--border)]"
                        >
                          {activeConversation.isMuted ? (
                            <>
                              <Bell size={18} className="text-[var(--accent)]" /> Enable Notifications
                            </>
                          ) : (
                            <>
                              <BellOff size={18} className="text-[var(--text-muted)]" /> Mute Notifications
                            </>
                          )}
                        </button>
                        <button 
                          onClick={handleToggleBlock}
                          className="w-full p-4 flex items-center gap-3 hover:bg-rose-500/10 text-rose-500 font-medium transition-colors text-sm text-left"
                        >
                          <ShieldAlert size={18} /> {activeConversation.isBlocked ? 'Unblock User' : 'Block User'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin">
                  <AnimatePresence>
                    {messages?.map((msg) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <motion.div 
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] md:max-w-[70%] p-4 md:p-5 rounded-[24px] md:rounded-[32px] shadow-sm relative ${isMe ? 'bg-[var(--accent)] text-[var(--accent-foreground)] rounded-tr-none' : 'bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] rounded-tl-none'}`}>
                            {msg.type === 'voice' ? (
                              <div className="flex items-center gap-4 min-w-[200px]">
                                <button className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                                  <Play size={20} fill="currentColor" />
                                </button>
                                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                  <div className="h-full bg-white w-1/3" />
                                </div>
                                <audio src={msg.audioUrl} className="hidden" />
                              </div>
                            ) : msg.type === 'image' ? (
                              <div className="space-y-2">
                                <img 
                                  referrerPolicy="no-referrer"
                                  src={msg.imageUrl} 
                                  alt="Sent image" 
                                  className="rounded-2xl max-w-full h-auto shadow-lg cursor-pointer"
                                  onClick={() => window.open(msg.imageUrl, '_blank')}
                                />
                                {msg.content && <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>}
                              </div>
                            ) : msg.type === 'file' ? (
                              <div className="flex items-center gap-4 min-w-[220px]">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20 text-white' : 'bg-[var(--accent)]/10 text-[var(--accent)]'}`}>
                                  <FileText size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate">{msg.fileName || 'Attachment'}</p>
                                  <p className="text-[10px] opacity-60 font-mono">
                                    {msg.fileSize ? `${(msg.fileSize / 1024).toFixed(1)} KB` : 'File'}
                                  </p>
                                </div>
                                <a 
                                  href={msg.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black'}`}
                                >
                                  Download
                                </a>
                              </div>
                            ) : msg.type === 'location' ? (
                              <a 
                                href={`https://www.google.com/maps?q=${msg.latitude},${msg.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                              >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20' : 'bg-[var(--accent)]/10 text-[var(--accent)]'}`}>
                                  <MapPin size={24} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold">Shared Location</p>
                                  <p className="text-[10px] opacity-60 uppercase tracking-widest font-bold">View on Google Maps</p>
                                </div>
                              </a>
                            ) : (
                              <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                            )}
                            <div className={`flex items-center gap-2 mt-2 opacity-50 ${isMe ? 'justify-end' : ''}`}>
                              <span className="text-[9px] font-bold uppercase tracking-wider">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && (
                                <div className="flex items-center gap-0.5">
                                  {msg.status === 'read' ? (
                                    <CheckCheck size={12} className="text-blue-500 font-bold" />
                                  ) : msg.status === 'delivered' ? (
                                    <CheckCheck size={12} className="text-[var(--text-muted)] opacity-70" />
                                  ) : (
                                    <Check size={12} className="text-[var(--text-muted)] opacity-50" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {otherUserTyping && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-[var(--card-bg)] border border-[var(--border)] p-3 rounded-2xl flex gap-1">
                        <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {activeConversation.isBlocked ? (
                  <div className="p-6 bg-rose-500/5 text-rose-500 flex flex-col items-center justify-center text-center gap-2 border-t border-[var(--border)]">
                    <p className="text-sm font-bold">You have blocked this partner or they have blocked you.</p>
                    <button 
                      onClick={handleToggleBlock}
                      className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors"
                    >
                      Unblock User
                    </button>
                  </div>
                ) : (
                  <div className="p-4 md:p-6 bg-[var(--card-bg)] border-t border-[var(--border)] relative">
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute bottom-full left-4 mb-4 p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-[32px] shadow-2xl z-30 grid grid-cols-6 gap-2"
                        >
                          {['👍', '❤️', '😂', '😮', '😢', '🔥', '👏', '🙌', '✨', '✅', '🙏', '💯'].map(emoji => (
                            <button 
                              key={emoji} 
                              onClick={() => addEmoji(emoji)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-[var(--bg)] rounded-xl transition-colors text-xl"
                            >
                              {emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*,application/pdf,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" 
                        className="hidden" 
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors relative"
                        title="Upload attachment"
                      >
                        {isUploading ? <Loader2 size={20} className="animate-spin text-[var(--accent)]" /> : <Paperclip size={20} />}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-3 rounded-xl transition-colors hidden sm:block ${showEmojiPicker ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg)]'}`}
                      >
                        <Smile size={20} />
                      </button>
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          value={newMessage}
                          onChange={handleTyping}
                          placeholder={isRecording ? "Voice recording active..." : "Type your message..."}
                          disabled={isRecording}
                          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)] shadow-inner"
                        />
                      </div>
                      {newMessage.trim() || isRecording ? (
                        <button 
                          type={isRecording ? 'button' : 'submit'}
                          onClick={isRecording ? stopRecording : undefined}
                          className={`${isRecording ? 'bg-red-500' : 'bg-[var(--accent)]'} text-white p-4 rounded-2xl hover:opacity-90 transition-all active:translate-y-1 shadow-lg shadow-[var(--accent)]/30`}
                        >
                          {isRecording ? <Square size={20} /> : <Send size={20} />}
                        </button>
                      ) : (
                        <button 
                          type="button"
                          onClick={startRecording}
                          className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)]/80 transition-all"
                        >
                          <Mic size={20} />
                        </button>
                      )}
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-[var(--text-muted)] p-12 text-center h-full">
                <div className="w-24 h-24 rounded-full bg-[var(--accent)]/5 flex items-center justify-center text-[var(--accent)] mb-8 opacity-20">
                  <MessageSquare size={48} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-[var(--text)]/60">{t('messages_select_title', 'Select a conversation')}</h3>
                <p className="max-w-xs">{t('messages_select_desc', 'Choose a message from the list to view the conversation details and connect with your artisan.')}</p>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showVideoCall && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center text-white"
              >
                <div className="w-40 h-40 rounded-full bg-[var(--accent)]/20 flex items-center justify-center relative mb-12">
                   <div className="absolute inset-0 rounded-full border-4 border-[var(--accent)]/30 animate-ping"></div>
                   <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--accent)] shadow-2xl relative z-10">
                      {activeConversation?.avatarUrl ? (
                        <img src={activeConversation.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-3xl font-bold">
                          {activeConversation?.name?.charAt(0)}
                        </div>
                      )}
                   </div>
                </div>
                <h2 className="text-4xl font-bold mb-2 tracking-tighter">{activeConversation?.name}</h2>
                <p className="text-[var(--accent)] font-bold uppercase tracking-widest text-xs mb-12 animate-pulse">Calling via {callType}...</p>
                <div className="flex gap-8">
                  <button 
                    onClick={() => setShowVideoCall(false)}
                    className="p-8 rounded-full bg-red-500 hover:bg-red-600 transition-all active:scale-90 shadow-xl shadow-red-500/20"
                  >
                    <Phone size={32} className="rotate-[135deg]" />
                  </button>
                  {callType === 'video' && (
                    <button className="p-8 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-90 backdrop-blur-md">
                      <Video size={32} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
