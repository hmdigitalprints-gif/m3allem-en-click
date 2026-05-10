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
  artisanProposedPrice?: number;
  materialCost?: number;
  artisanProposalComments?: string;
  materialHandling?: string;
}

const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  return headers;
};

export const marketplaceService = {
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/marketplace/categories', { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async getArtisans(filters: any = {}): Promise<Artisan[]> {
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(`/api/marketplace/artisans?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },

  async getArtisanProfile(id: string) {
    try {
      const res = await fetch(`/api/marketplace/artisans/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch profile');
      return res.json();
    } catch {
      return null;
    }
  },

  async toggleFavorite(artisanId: string, isFavorite: boolean) {
    const method = isFavorite ? 'DELETE' : 'POST';
    const url = isFavorite ? `/api/marketplace/favorites/${artisanId}` : '/api/marketplace/favorites';
    const body = isFavorite ? undefined : JSON.stringify({ artisanId });
    
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body,
      credentials: 'include'
    });
    return res.json();
  },

  async getMyFavorites(): Promise<Artisan[]> {
    try {
      const res = await fetch('/api/marketplace/my-favorites', { 
        credentials: 'include', 
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
      const res = await fetch(`/api/services/by-category/${categoryId}`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  }
};

const fetchJson = async (url: string, options: RequestInit = {}) => {
  options.credentials = 'include';
  const res = await fetch(url, options);
  const contentType = res.headers.get("content-type");
  
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error(`API response was not JSON. Status: ${res.status}. Body: ${text.substring(0, 150)}...`);
    throw new Error(`Server returned an unexpected response (Status ${res.status}). Please try again later.`);
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'API request failed');
  }
  return data;
};

export const bookingService = {
  async createBooking(data: any) {
    return fetchJson('/api/bookings', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
  },

  async getMyBookings(): Promise<Booking[]> {
    return fetchJson('/api/bookings', {
      headers: getAuthHeaders()
    });
  },

  async updateStatus(id: string, status: string) {
    return fetchJson(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
  },

  async submitReview(id: string, stars: number, review: string) {
    return fetchJson(`/api/bookings/${id}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ stars, review })
    });
  },

  async getNearbyBookings(): Promise<any[]> {
    return fetchJson('/api/bookings/nearby', {
      headers: getAuthHeaders()
    });
  },

  async submitProposal(id: string, price: number, comment?: string) {
    return fetchJson(`/api/bookings/${id}/propose`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ price, comment })
    });
  }
};

export const walletService = {
  async getWallet() {
    return fetchJson('/api/wallet/balance', { 
      headers: getAuthHeaders()
    });
  },

  async getBalance() {
    return fetchJson('/api/wallet/balance', { 
      headers: getAuthHeaders()
    });
  },

  async topup(amount: number, method: string) {
    return fetchJson('/api/wallet/topup', { 
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, method })
    });
  },

  async payOrder(orderId: string, method: string) {
    return fetchJson('/api/wallet/pay-order', { 
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderId, method })
    });
  },

  async withdraw(amount: number, method: string) {
    return fetchJson('/api/wallet/withdraw', { 
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, method })
    });
  }
};
