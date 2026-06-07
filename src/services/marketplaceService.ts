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
  artisan_phone?: string;
  client_phone?: string;
  payment_status?: string;
  payment_method?: string;
  has_review?: boolean;
  artisanProposedPrice?: number;
  materialCost?: number;
  artisanProposalComments?: string;
  materialHandling?: string;
}

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

export const fetchJson = async (url: string, options: RequestInit = {}) => {
  const currentLang = typeof window !== 'undefined' ? (localStorage.getItem('m3allem_lang') || localStorage.getItem('i18nextLng') || 'en') : 'en';
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Accept-Language')) {
    headers.set('Accept-Language', currentLang);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });
  
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

export const marketplaceService = {
  async getCategories(): Promise<Category[]> {
    try {
      return await fetchJson('/api/marketplace/categories', { 
        headers: getHeaders()
      });
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      if (err instanceof Error) {
        console.error('Error Stack:', err.stack);
      }
      return [];
    }
  },

  async getArtisans(filters: any = {}): Promise<Artisan[]> {
    try {
      const params = new URLSearchParams(filters);
      return await fetchJson(`/api/marketplace/artisans?${params.toString()}`, { 
        headers: getHeaders()
      });
    } catch (err) {
      console.error('Failed to fetch artisans:', err);
      if (err instanceof Error) {
        console.error('Error Stack:', err.stack);
      }
      return [];
    }
  },

  async getArtisanProfile(id: string) {
    try {
      return await fetchJson(`/api/marketplace/artisans/${id}`, { 
        headers: getHeaders()
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      return null;
    }
  },

  async toggleFavorite(artisanId: string, isFavorite: boolean) {
    const method = isFavorite ? 'DELETE' : 'POST';
    const url = isFavorite 
      ? `/api/marketplace/favorites/remove` // Fixed endpoint based on server/index.ts
      : '/api/marketplace/favorites/add';   // Fixed endpoint based on server/index.ts
    const body = JSON.stringify({ artisanId });
    
    try {
      return await fetchJson(url, {
        method,
        headers: getHeaders(),
        body
      });
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      return { error: 'Failed to update favorite' };
    }
  },

  async getMyFavorites(): Promise<Artisan[]> {
    try {
      return await fetchJson('/api/marketplace/my-favorites', { 
        headers: getHeaders()
      });
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      return [];
    }
  },

  async getServicesByCategory(categoryId: string): Promise<any[]> {
    try {
      return await fetchJson(`/api/services/by-category/${categoryId}`, { 
        headers: getHeaders()
      });
    } catch (err) {
      console.error('Failed to fetch services:', err);
      return [];
    }
  }
};

export const bookingService = {
  async createBooking(data: any) {
    return fetchJson('/api/bookings', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
  },

  async getMyBookings(): Promise<Booking[]> {
    return fetchJson('/api/bookings', {
      headers: getHeaders()
    });
  },

  async updateStatus(id: string, status: string) {
    return fetchJson(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
  },

  async submitReview(id: string, stars: number, review: string) {
    return fetchJson(`/api/bookings/${id}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ stars, review })
    });
  },

  async getNearbyBookings(): Promise<any[]> {
    return fetchJson('/api/bookings/nearby', {
      headers: getHeaders()
    });
  },

  async submitProposal(id: string, proposedPrice: number, comments?: string, materialCost: number = 0, requiredMaterials: any[] = []) {
    return fetchJson(`/api/bookings/${id}/proposal`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ proposedPrice, comments, materialCost, requiredMaterials })
    });
  }
};

export const walletService = {
  async getWallet() {
    return fetchJson('/api/wallet/balance', { 
      headers: getHeaders()
    });
  },

  async getBalance() {
    return fetchJson('/api/wallet/balance', { 
      headers: getHeaders()
    });
  },

  async topup(amount: number, method: string) {
    return fetchJson('/api/wallet/topup', { 
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, method })
    });
  },

  async payOrder(orderId: string, method: string) {
    return fetchJson('/api/wallet/pay-order', { 
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId, method })
    });
  },

  async withdraw(amount: number, method: string) {
    return fetchJson('/api/wallet/withdraw', { 
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, method })
    });
  }
};

export const escrowService = {
  async payBooking(bookingId: string) {
    return fetchJson('/api/escrow/pay', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookingId })
    });
  },

  async releaseEscrow(bookingId: string) {
    return fetchJson('/api/escrow/release', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookingId })
    });
  },

  async refundEscrow(bookingId: string) {
    return fetchJson('/api/escrow/refund', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookingId })
    });
  },

  async resolveDispute(disputeId: string, resolution: "refund_client" | "release_artisan", notes: string) {
    return fetchJson(`/api/escrow/disputes/${disputeId}/resolve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ resolution, notes })
    });
  },

  async getEscrowStatus(bookingId: string) {
    return fetchJson(`/api/escrow/booking/${bookingId}/status`, {
      headers: getHeaders()
    });
  }
};
