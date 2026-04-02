import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import PublicLayout from '../components/layout/PublicLayout';

export default function Contact() {
  return (
    <PublicLayout>
      <div className="pt-32 pb-20 bg-[var(--bg)] text-[var(--text)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 text-[var(--text)]"
          >
            GET IN <span className="text-[var(--accent)]">TOUCH.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
          >
            Have questions or need assistance? Our team is here to help you with anything you need.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] p-10 rounded-[40px] space-y-8 shadow-xl">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl flex items-center justify-center shrink-0">
                  <Mail size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1 text-[var(--text)]">Email Us</h4>
                  <p className="text-[var(--text-muted)]">support@m3allem.ma</p>
                  <p className="text-[var(--text-muted)]">info@m3allem.ma</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl flex items-center justify-center shrink-0">
                  <Phone size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1 text-[var(--text)]">Call Us</h4>
                  <p className="text-[var(--text-muted)]">+212 522 123 456</p>
                  <p className="text-[var(--text-muted)]">+212 661 987 654</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1 text-[var(--text)]">Visit Us</h4>
                  <p className="text-[var(--text-muted)]">123 Boulevard d'Anfa</p>
                  <p className="text-[var(--text-muted)]">Casablanca, Morocco</p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 p-10 rounded-[40px]">
              <div className="flex items-center gap-4 mb-6">
                <Clock size={24} className="text-[var(--accent)]" />
                <h4 className="text-xl font-bold text-[var(--text)]">Business Hours</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Monday - Friday</span>
                  <span className="font-bold text-[var(--text)]">09:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Saturday</span>
                  <span className="font-bold text-[var(--text)]">10:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Sunday</span>
                  <span className="text-[var(--destructive)] font-bold">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] p-10 md:p-16 rounded-[48px] shadow-2xl">
              <h3 className="text-3xl font-bold mb-8 text-[var(--text)]">Send us a Message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com"
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">Subject</label>
                  <select className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all appearance-none text-[var(--text)]">
                    <option className="bg-[var(--card-bg)]">General Inquiry</option>
                    <option className="bg-[var(--card-bg)]">Support Request</option>
                    <option className="bg-[var(--card-bg)]">Partnership</option>
                    <option className="bg-[var(--card-bg)]">Feedback</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-muted)]/30 uppercase tracking-widest ml-4">Message</label>
                  <textarea 
                    placeholder="How can we help you?"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl py-4 px-6 focus:outline-none focus:border-[var(--accent)]/50 transition-all h-48 resize-none text-[var(--text)]"
                  ></textarea>
                </div>

                <button 
                  type="button"
                  className="bg-[var(--accent)] text-[var(--accent-foreground)] px-12 py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-[var(--accent)]/90 transition-all active:scale-95 shadow-2xl shadow-[var(--accent)]/20 w-full md:w-auto"
                >
                  Send Message
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      </div>
    </PublicLayout>
  );
}
