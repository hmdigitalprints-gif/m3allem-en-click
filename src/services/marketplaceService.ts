export interface Category {
  id: string;
  name: string;
  icon: string;
  commission_rate: number;
}

export interface Artisan {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string;
  category_id: string;
  category_name: string;
  bio: string;
  expertise: string;
  years_experience: number;
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_online: boolean;
  city: string;
  starting_price?: number;
}

export interface Booking {
  id: string;
  client_id: string;
  artisan_id: string;
  service_id: string;
  service_name: string;
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled' | 'en_route' | 'in_progress' | 'proposal_submitted' | 'proposal_approved';
  price: number;
  scheduled_at: string;
  started_at?: string;
  finished_at?: string;
  other_party_name: string;
  other_party_avatar: string;
  payment_status?: string;
  payment_method?: string;
  has_review?: boolean;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('m3allem_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const marketplaceService = {
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/marketplace/categories');
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async getArtisans(filters: any = {}): Promise<Artisan[]> {
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/marketplace/artisans?${params.toString()}`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async getArtisanProfile(id: string) {
    try {
      const res = await fetch(`/api/marketplace/artisans/${id}`);
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    } catch {
      return null;
    }
  },

  async toggleFavorite(artisanId: string, isFavorite: boolean) {
    const method = isFavorite ? 'DELETE' : 'POST';
    const url = isFavorite ? `/api/marketplace/favorites/${artisanId}` : '/api/marketplace/favorites';
    const body = isFavorite ? null : JSON.stringify({ artisanId });
    
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body
    });
    return res.json();
  },

  async getMyFavorites(): Promise<Artisan[]> {
    try {
      const res = await fetch('/api/marketplace/my-favorites', {
        headers: getAuthHeaders()
      });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async getServicesByCategory(categoryId: string): Promise<any[]> {
    try {
      const res = await fetch(`/api/services/by-category/${categoryId}`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  }
};

export const bookingService = {
  async createBooking(data: any) {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getMyBookings(): Promise<Booking[]> {
    const res = await fetch('/api/bookings/my-bookings', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateStatus(id: string, status: string) {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async submitReview(id: string, stars: number, review: string) {
    const res = await fetch(`/api/bookings/${id}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stars, review })
    });
    return res.json();
  },

  async getNearbyBookings(): Promise<any[]> {
    const res = await fetch('/api/bookings/nearby', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async submitProposal(id: string, price: number, comment?: string) {
    const res = await fetch(`/api/bookings/${id}/propose`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ price, comment })
    });
    return res.json();
  }
};

export const walletService = {
  async getWallet() {
    const res = await fetch('/api/wallet/balance', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getBalance() {
    const res = await fetch('/api/wallet/balance', {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async topup(amount: number, method: string) {
    const res = await fetch('/api/wallet/topup', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, method })
    });
    return res.json();
  },

  async payOrder(orderId: string, method: string) {
    const res = await fetch('/api/wallet/pay-order', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderId, method })
    });
    return res.json();
  },

  async withdraw(amount: number, method: string) {
    const res = await fetch('/api/wallet/withdraw', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, method })
    });
    return res.json();
  }
};
