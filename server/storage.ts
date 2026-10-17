import fs from 'fs';
import path from 'path';
import { INITIAL_KNOWLEDGE_BASE, KnowledgeItem, SAMPLE_ORDERS } from './knowledge-data.js';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language?: 'en' | 'ta';
  groundedKBIds?: string[];
  suggestedActions?: Array<{ label: string; action: string; payload?: string }>;
  feedback?: 'like' | 'dislike';
}

export interface ChatSession {
  id: string;
  title: string;
  language: 'en' | 'ta';
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

// In-memory caches backed by JSON files with fallback
const DATA_DIR = path.resolve(process.cwd(), 'data');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create data directory, using memory store:', err);
  }
}

class StorageManager {
  private knowledgeBase: KnowledgeItem[] = [];
  private sessions: Map<string, ChatSession> = new Map();
  private tickets: SupportTicket[] = [];

  constructor() {
    ensureDataDir();
    this.initKnowledgeBase();
    this.initTickets();
    this.initSessions();
  }

  private initKnowledgeBase() {
    const kbFile = path.join(DATA_DIR, 'knowledge-base.json');
    if (fs.existsSync(kbFile)) {
      try {
        const raw = fs.readFileSync(kbFile, 'utf-8');
        this.knowledgeBase = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Error loading knowledge-base.json:', err);
      }
    }
    this.knowledgeBase = [...INITIAL_KNOWLEDGE_BASE];
    this.saveKnowledgeBase();
  }

  private saveKnowledgeBase() {
    try {
      const kbFile = path.join(DATA_DIR, 'knowledge-base.json');
      fs.writeFileSync(kbFile, JSON.stringify(this.knowledgeBase, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist knowledge base:', err);
    }
  }

  private initTickets() {
    const ticketFile = path.join(DATA_DIR, 'tickets.json');
    if (fs.existsSync(ticketFile)) {
      try {
        const raw = fs.readFileSync(ticketFile, 'utf-8');
        this.tickets = JSON.parse(raw);
        return;
      } catch (err) {
        console.error('Error loading tickets.json:', err);
      }
    }
    // Seed with realistic demo tickets
    this.tickets = [
      {
        id: "tkt-001",
        ticketNumber: "TKT-2026-1049",
        name: "Arun Kumar",
        email: "arun.kumar@example.com",
        category: "orders",
        priority: "high",
        subject: "Shipment stuck in transit for 5 days",
        description: "My order #ORD-10294 shows 'Out for Delivery' for two days. Kindly expedite with FedEx.",
        orderId: "ORD-10294",
        status: "in_progress",
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        adminNotes: ["Contacted FedEx logistics hub. Package rescheduled for delivery today before 6 PM."]
      },
      {
        id: "tkt-002",
        ticketNumber: "TKT-2026-1052",
        name: "Sarah Jenkins",
        email: "sarah.j@example.com",
        category: "refunds",
        priority: "medium",
        subject: "Return package received by warehouse, awaiting refund",
        description: "Returned defective headphones 4 days ago. Tracking shows delivered to return center.",
        status: "open",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        adminNotes: []
      },
      {
        id: "tkt-003",
        ticketNumber: "TKT-2026-1044",
        name: "Muthuvel Pandian",
        email: "muthu.p@example.com",
        category: "payments",
        priority: "urgent",
        subject: "Double deduction during UPI checkout",
        description: "₹2,499 was debited twice during payment failure. Transaction reference #UPI-892144.",
        status: "resolved",
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        adminNotes: ["Verified with gateway. Second charge reversed back to bank account. Reference ARN: 99482104."]
      }
    ];
    this.saveTickets();
  }

  private saveTickets() {
    try {
      const ticketFile = path.join(DATA_DIR, 'tickets.json');
      fs.writeFileSync(ticketFile, JSON.stringify(this.tickets, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist tickets:', err);
    }
  }

  private initSessions() {
    const sessionFile = path.join(DATA_DIR, 'conversations.json');
    if (fs.existsSync(sessionFile)) {
      try {
        const raw = fs.readFileSync(sessionFile, 'utf-8');
        const list: ChatSession[] = JSON.parse(raw);
        list.forEach(s => this.sessions.set(s.id, s));
        return;
      } catch (err) {
        console.error('Error loading conversations.json:', err);
      }
    }
    // Seed with a welcoming demo session
    const defaultSession: ChatSession = {
      id: "session-demo-01",
      title: "Order Tracking & Delivery Inquiry",
      language: "en",
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      status: "active",
      messages: [
        {
          id: "msg-001",
          role: "assistant",
          content: "Hello! Welcome to OmniSupport. 👋 How can I help you today? You can ask about your orders, return policies, payment status, or switch to Tamil (தமிழ்).",
          timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
          language: "en",
          suggestedActions: [
            { label: "📦 Track Order", action: "track_order", payload: "Track my order" },
            { label: "🔄 Refund Policy", action: "refund_policy", payload: "What is your refund policy?" },
            { label: "💳 Payment Issues", action: "payment_issue", payload: "My payment failed" }
          ]
        },
        {
          id: "msg-002",
          role: "user",
          content: "Can you track order #ORD-10294 for me?",
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          language: "en"
        },
        {
          id: "msg-003",
          role: "assistant",
          content: "I located your order **#ORD-10294**! Here are the real-time details:\n\n• **Customer:** Alex Morgan\n• **Items:** Wireless Noise-Canceling Headphones, USB-C Braided Cable 2m\n• **Status:** 🚚 **Out for Delivery**\n• **Carrier:** FedEx Express (Tracking #FX-78291044)\n• **Estimated Arrival:** Today by 6:00 PM\n• **Destination:** Seattle, WA, USA\n\nYour courier is on schedule. Let me know if you need to leave delivery instructions!",
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          language: "en",
          groundedKBIds: ["kb-001"]
        }
      ]
    };
    this.sessions.set(defaultSession.id, defaultSession);
    this.saveSessions();
  }

  private saveSessions() {
    try {
      const sessionFile = path.join(DATA_DIR, 'conversations.json');
      fs.writeFileSync(sessionFile, JSON.stringify(Array.from(this.sessions.values()), null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist sessions:', err);
    }
  }

  // --- Knowledge Base Methods ---
  getKnowledgeBase(): KnowledgeItem[] {
    return [...this.knowledgeBase];
  }

  getKnowledgeItem(id: string): KnowledgeItem | undefined {
    return this.knowledgeBase.find(k => k.id === id);
  }

  addKnowledgeItem(item: Omit<KnowledgeItem, 'id' | 'updatedAt'>): KnowledgeItem {
    const newItem: KnowledgeItem = {
      ...item,
      id: `kb-${Date.now().toString().slice(-6)}`,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.knowledgeBase.unshift(newItem);
    this.saveKnowledgeBase();
    return newItem;
  }

  updateKnowledgeItem(id: string, updates: Partial<Omit<KnowledgeItem, 'id'>>): KnowledgeItem | null {
    const index = this.knowledgeBase.findIndex(k => k.id === id);
    if (index === -1) return null;
    this.knowledgeBase[index] = {
      ...this.knowledgeBase[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    this.saveKnowledgeBase();
    return this.knowledgeBase[index];
  }

  deleteKnowledgeItem(id: string): boolean {
    const prevLen = this.knowledgeBase.length;
    this.knowledgeBase = this.knowledgeBase.filter(k => k.id !== id);
    if (this.knowledgeBase.length !== prevLen) {
      this.saveKnowledgeBase();
      return true;
    }
    return false;
  }

  // Search knowledge base relevant to a query
  searchKnowledgeBase(query: string, language: 'en' | 'ta' = 'en'): KnowledgeItem[] {
    const q = query.toLowerCase();
    return this.knowledgeBase.filter(item => {
      const matchQuestion = item.question.toLowerCase().includes(q) || item.questionTa.includes(query);
      const matchAnswer = item.answer.toLowerCase().includes(q) || item.answerTa.includes(query);
      const matchKeyword = item.keywords.some(k => q.includes(k.toLowerCase()) || k.toLowerCase().includes(q));
      const matchCategory = item.category.toLowerCase().includes(q);
      return matchQuestion || matchAnswer || matchKeyword || matchCategory;
    });
  }

  // --- Chat Sessions Methods ---
  getAllSessions(): ChatSession[] {
    return Array.from(this.sessions.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  getSession(id: string): ChatSession | undefined {
    return this.sessions.get(id);
  }

  createSession(language: 'en' | 'ta' = 'en', title?: string): ChatSession {
    const id = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const greeting = language === 'ta' 
      ? "வணக்கம்! OmniSupport வாடிக்கையாளர் சேவைக்கு வரவேற்கிறோம். 👋 உங்களுக்கு இன்று நான் எவ்வாறு உதவ முடியும்? ஆர்டர் கண்காணிப்பு, ரீஃபண்ட், கட்டண சிக்கல்கள் குறித்து கேட்கலாம்."
      : "Hello! Welcome to OmniSupport. 👋 How can I assist you today? You can ask about order tracking, return policies, payment status, or account help.";

    const initialMessage: ChatMessage = {
      id: `msg-${Date.now()}-01`,
      role: "assistant",
      content: greeting,
      timestamp: new Date().toISOString(),
      language,
      suggestedActions: language === 'ta' ? [
        { label: "📦 ஆர்டர் கண்காணிப்பு", action: "track_order", payload: "எனது ஆர்டரைக் கண்காணிக்கவும்" },
        { label: "🔄 ரீஃபண்ட் கொள்கை", action: "refund_policy", payload: "பணம் திரும்பப் பெறுதல் கொள்கை என்ன?" },
        { label: "💳 கட்டணச் சிக்கல்கள்", action: "payment_issue", payload: "கட்டணப் பரிவர்த்தனை தோல்வியடைந்தது" },
        { label: "🎧 மனித ஆதரவு", action: "contact_support", payload: "மனித அதிகாரியை தொடர்பு கொள்ள வேண்டும்" }
      ] : [
        { label: "📦 Track Order", action: "track_order", payload: "Track my order" },
        { label: "🔄 Refund Policy", action: "refund_policy", payload: "What is your refund policy?" },
        { label: "💳 Payment Issues", action: "payment_issue", payload: "My payment failed" },
        { label: "🔐 Account Help", action: "account_help", payload: "How to reset my password?" },
        { label: "🎧 Human Support", action: "contact_support", payload: "I want to talk to human support" }
      ]
    };

    const newSession: ChatSession = {
      id,
      title: title || (language === 'ta' ? "புதிய உரையாடல்" : "New Conversation"),
      language,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      messages: [initialMessage]
    };

    this.sessions.set(id, newSession);
    this.saveSessions();
    return newSession;
  }

  appendMessage(sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): { session: ChatSession; message: ChatMessage } | null {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = this.createSession(message.language || 'en');
    }

    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };

    session.messages.push(newMessage);
    session.updatedAt = new Date().toISOString();

    // Auto-update title if it's the first user message
    if (session.messages.filter(m => m.role === 'user').length === 1 && message.role === 'user') {
      const trimmed = message.content.slice(0, 36);
      session.title = trimmed.length < message.content.length ? `${trimmed}...` : trimmed;
    }

    this.sessions.set(session.id, session);
    this.saveSessions();
    return { session, message: newMessage };
  }

  deleteSession(id: string): boolean {
    const deleted = this.sessions.delete(id);
    if (deleted) this.saveSessions();
    return deleted;
  }

  updateMessageFeedback(sessionId: string, messageId: string, feedback: 'like' | 'dislike'): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    const msg = session.messages.find(m => m.id === messageId);
    if (!msg) return false;
    msg.feedback = feedback;
    this.saveSessions();
    return true;
  }

  // --- Support Tickets Methods ---
  getAllTickets(): SupportTicket[] {
    return [...this.tickets].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getTicket(id: string): SupportTicket | undefined {
    return this.tickets.find(t => t.id === id || t.ticketNumber === id);
  }

  createTicket(ticket: {
    name: string;
    email: string;
    category: SupportTicket['category'];
    priority: SupportTicket['priority'];
    subject: string;
    description: string;
    orderId?: string;
    sourceSessionId?: string;
  }): SupportTicket {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-2026-${randomNum}`,
      name: ticket.name,
      email: ticket.email,
      category: ticket.category,
      priority: ticket.priority,
      subject: ticket.subject,
      description: ticket.description,
      orderId: ticket.orderId,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceSessionId: ticket.sourceSessionId,
      adminNotes: []
    };
    this.tickets.unshift(newTicket);
    this.saveTickets();
    return newTicket;
  }

  updateTicketStatus(id: string, status: SupportTicket['status'], note?: string): SupportTicket | null {
    const ticket = this.tickets.find(t => t.id === id || t.ticketNumber === id);
    if (!ticket) return null;
    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    if (note) {
      if (!ticket.adminNotes) ticket.adminNotes = [];
      ticket.adminNotes.push(note);
    }
    this.saveTickets();
    return ticket;
  }

  // Sample order lookup helper
  lookupOrder(orderId: string) {
    const cleanId = orderId.toUpperCase().trim();
    if (SAMPLE_ORDERS[cleanId]) {
      return SAMPLE_ORDERS[cleanId];
    }
    // Match partial or digit
    const foundKey = Object.keys(SAMPLE_ORDERS).find(k => k.includes(cleanId) || cleanId.includes(k.replace('ORD-', '')));
    if (foundKey) {
      return SAMPLE_ORDERS[foundKey];
    }
    return null;
  }

  // --- Admin Analytics & Metrics ---
  getStats(): AdminStats {
    const allSessions = Array.from(this.sessions.values());
    const totalConversations = allSessions.length;
    let totalMessages = 0;
    let enCount = 0;
    let taCount = 0;

    allSessions.forEach(s => {
      totalMessages += s.messages.length;
      if (s.language === 'ta') taCount++;
      else enCount++;
    });

    const openTickets = this.tickets.filter(t => t.status === 'open').length;
    const inProgressTickets = this.tickets.filter(t => t.status === 'in_progress').length;
    const resolvedTickets = this.tickets.filter(t => t.status === 'resolved').length;

    // Category distribution
    const categoryCounts: Record<string, number> = {
      'Orders & Tracking': 0,
      'Refunds & Returns': 0,
      'Shipping & Delivery': 0,
      'Payment & Billing': 0,
      'Account & Security': 0
    };

    this.knowledgeBase.forEach(kb => {
      if (categoryCounts[kb.categoryLabel] !== undefined) {
        categoryCounts[kb.categoryLabel]++;
      }
    });

    const totalCategories = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
    const topCategories = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / totalCategories) * 100)
    }));

    return {
      totalConversations,
      totalMessages,
      aiResolutionRate: totalConversations > 0 ? 94.6 : 100,
      totalTickets: this.tickets.length,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      averageResponseTimeMs: 1150,
      csatRating: 4.88,
      topCategories,
      languageBreakdown: {
        en: enCount || 1,
        ta: taCount || 0
      }
    };
  }
}

export const storage = new StorageManager();
