import { ChatMessage, ChatSession, KnowledgeItem, SupportTicket, AdminStats, OrderLookupResult, Language } from '../types';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      let errorMsg = `Server error: ${res.status} ${res.statusText}`;
      try {
        const data = await res.json();
        if (data.error) errorMsg = data.error;
      } catch {
        // use default error message
      }
      throw new Error(errorMsg);
    }

    return res.json();
  }

  // Health
  async getHealth(): Promise<{ status: string; geminiConfigured: boolean; model: string }> {
    return this.request('/api/health');
  }

  // Conversations
  async getConversations(): Promise<ChatSession[]> {
    return this.request('/api/conversations');
  }

  async getConversation(id: string): Promise<ChatSession> {
    return this.request(`/api/conversations/${id}`);
  }

  async createConversation(language: Language = 'en', title?: string): Promise<ChatSession> {
    return this.request('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ language, title }),
    });
  }

  async deleteConversation(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/conversations/${id}`, {
      method: 'DELETE',
    });
  }

  async recordFeedback(sessionId: string, messageId: string, feedback: 'like' | 'dislike'): Promise<{ success: boolean }> {
    return this.request(`/api/conversations/${sessionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ messageId, feedback }),
    });
  }

  // Send message to Gemini chat
  async sendMessage(sessionId: string, message: string, language: Language = 'en'): Promise<{
    sessionId: string;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    session: ChatSession;
  }> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ sessionId, message, language }),
    });
  }

  // Knowledge Base
  async getKnowledgeBase(query?: string, category?: string): Promise<KnowledgeItem[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/api/knowledge-base${qs}`);
  }

  async addKnowledgeItem(item: Omit<KnowledgeItem, 'id' | 'updatedAt'>): Promise<KnowledgeItem> {
    return this.request('/api/knowledge-base', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateKnowledgeItem(id: string, updates: Partial<KnowledgeItem>): Promise<KnowledgeItem> {
    return this.request(`/api/knowledge-base/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteKnowledgeItem(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/knowledge-base/${id}`, {
      method: 'DELETE',
    });
  }

  // Support Tickets
  async getTickets(): Promise<SupportTicket[]> {
    return this.request('/api/tickets');
  }

  async getTicket(id: string): Promise<SupportTicket> {
    return this.request(`/api/tickets/${id}`);
  }

  async createTicket(ticket: {
    name: string;
    email: string;
    category: SupportTicket['category'];
    priority: SupportTicket['priority'];
    subject: string;
    description: string;
    orderId?: string;
    sourceSessionId?: string;
  }): Promise<SupportTicket> {
    return this.request('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  }

  async updateTicketStatus(id: string, status: SupportTicket['status'], note?: string): Promise<SupportTicket> {
    return this.request(`/api/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  }

  // Order lookup
  async lookupOrder(orderId: string): Promise<OrderLookupResult> {
    return this.request(`/api/orders/${orderId}`);
  }

  // Admin stats
  async getAdminStats(): Promise<AdminStats> {
    return this.request('/api/admin/stats');
  }
}

export const api = new ApiService();
