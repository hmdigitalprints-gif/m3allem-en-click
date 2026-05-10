import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { bookingService, Booking } from '../../services/marketplaceService';

interface ReviewModalProps {
  booking: Booking;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ booking, onClose, onSuccess }: ReviewModalProps) {
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await bookingService.submitReview(booking.id, stars, review);
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-[var(--bg)]/80 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--border)] rounded-[40px] p-8 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold tracking-tight">Rate your experience</h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg)] rounded-full transition-colors">
            <X size={24} className="text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="text-center mb-8">
          <img src={booking.other_party_avatar} className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover" alt="" referrerPolicy="no-referrer" />
          <h4 className="font-bold text-lg">{booking.other_party_name}</h4>
          <p className="text-[var(--text-muted)] text-sm">{booking.service_name}</p>
        </div>

        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3, 4, 5]?.map(i => (
            <button 
              key={i} 
              onClick={() => setStars(i)}
              className={`p-2 transition-all hover:scale-125 ${i <= stars ? 'text-yellow-500 scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]' : 'text-[var(--text-muted)] opacity-30'}`}
            >
              <Star size={36} fill={i <= stars ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>

        <textarea 
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write a review... (optional)"
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-4 h-32 resize-none mb-8 focus:outline-none focus:border-[var(--accent)]/50 transition-all text-[var(--text)]"
        />

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[var(--accent)] text-[var(--accent-foreground)] py-4 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </motion.div>
    </motion.div>
  );
}
