export type Language = 'en' | 'ta';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language?: Language;
  groundedKBIds?: string[];
  suggestedActions?: Array<{ label: string; action: string; payload?: string }>;
  feedback?: 'like' | 'dislike';
}

export interface ChatSession {
  id: string;
  title: string;
  language: Language;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  status: 'active' | 'resolved' | 'escalated';
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  category: 'orders' | 'refunds' | 'shipping' | 'payments' | 'account' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  orderId?: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
  sourceSessionId?: string;
  adminNotes?: string[];
}

export interface KnowledgeItem {
  id: string;
  category: 'orders' | 'shipping' | 'refunds' | 'payments' | 'account' | 'general';
  categoryLabel: string;
  question: string;
  questionTa: string;
  answer: string;
  answerTa: string;
  keywords: string[];
  updatedAt: string;
}

export interface AdminStats {
  totalConversations: number;
  totalMessages: number;
  aiResolutionRate: number;
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  averageResponseTimeMs: number;
  csatRating: number;
  topCategories: Array<{ category: string; count: number; percentage: number }>;
  languageBreakdown: { en: number; ta: number };
}

export interface OrderLookupResult {
  orderId: string;
  customerName: string;
  items: string[];
  total: string;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Returned';
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  destination: string;
}
