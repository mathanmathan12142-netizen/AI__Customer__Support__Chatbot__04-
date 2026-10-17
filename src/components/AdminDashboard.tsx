import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  BookOpen,
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle2,
  TrendingUp,
  Globe2,
  Percent
} from 'lucide-react';
import { AdminStats, SupportTicket, KnowledgeItem, Language } from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  language: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ language }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'kb'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [kbItems, setKbItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ticket management state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);

  // KB Add/Edit state
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [editingKbItem, setEditingKbItem] = useState<KnowledgeItem | null>(null);
  const [kbCategory, setKbCategory] = useState<KnowledgeItem['category']>('general');
  const [kbCategoryLabel, setKbCategoryLabel] = useState('General Inquiries');
  const [kbQuestion, setKbQuestion] = useState('');
  const [kbQuestionTa, setKbQuestionTa] = useState('');
  const [kbAnswer, setKbAnswer] = useState('');
  const [kbAnswerTa, setKbAnswerTa] = useState('');
  const [kbKeywords, setKbKeywords] = useState('');
  const [isSavingKb, setIsSavingKb] = useState(false);
  const [kbSearch, setKbSearch] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, ticketsData, kbData] = await Promise.all([
        api.getAdminStats(),
        api.getTickets(),
        api.getKnowledgeBase()
      ]);
      setStats(statsData);
      setTickets(ticketsData);
      setKbItems(kbData);
      if (ticketsData.length > 0 && !selectedTicket) {
        setSelectedTicket(ticketsData[0]);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
    try {
      setIsUpdatingTicket(true);
      const updated = await api.updateTicketStatus(ticketId, newStatus, adminNote.trim() || undefined);
      setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
      setSelectedTicket(updated);
      setAdminNote('');
      // refresh stats
      const newStats = await api.getAdminStats();
      setStats(newStats);
    } catch (err: any) {
      alert(`Error updating ticket: ${err?.message || err}`);
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  const handleOpenAddKb = () => {
    setEditingKbItem(null);
    setKbCategory('general');
    setKbCategoryLabel('General Inquiries');
    setKbQuestion('');
    setKbQuestionTa('');
    setKbAnswer('');
    setKbAnswerTa('');
    setKbKeywords('');
    setIsKbModalOpen(true);
  };

  const handleOpenEditKb = (item: KnowledgeItem) => {
    setEditingKbItem(item);
    setKbCategory(item.category);
    setKbCategoryLabel(item.categoryLabel);
    setKbQuestion(item.question);
    setKbQuestionTa(item.questionTa);
    setKbAnswer(item.answer);
    setKbAnswerTa(item.answerTa);
    setKbKeywords(item.keywords.join(', '));
    setIsKbModalOpen(true);
  };

  const handleSaveKb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbQuestion.trim() || !kbAnswer.trim()) {
      alert('Question and Answer in English are required.');
      return;
    }

    try {
      setIsSavingKb(true);
      const keywordsArray = kbKeywords
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);

      if (editingKbItem) {
        // Update
        const updated = await api.updateKnowledgeItem(editingKbItem.id, {
          category: kbCategory,
          categoryLabel: kbCategoryLabel,
          question: kbQuestion,
          questionTa: kbQuestionTa || kbQuestion,
          answer: kbAnswer,
          answerTa: kbAnswerTa || kbAnswer,
          keywords: keywordsArray
        });
        setKbItems(prev => prev.map(k => k.id === updated.id ? updated : k));
      } else {
        // Create
        const created = await api.addKnowledgeItem({
          category: kbCategory,
          categoryLabel: kbCategoryLabel,
          question: kbQuestion,
          questionTa: kbQuestionTa || kbQuestion,
          answer: kbAnswer,
          answerTa: kbAnswerTa || kbAnswer,
          keywords: keywordsArray
        });
        setKbItems(prev => [created, ...prev]);
      }

      setIsKbModalOpen(false);
    } catch (err: any) {
      alert(`Failed to save knowledge item: ${err?.message || err}`);
    } finally {
      setIsSavingKb(false);
    }
  };

  const handleDeleteKb = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Knowledge Base item?')) return;
    try {
      await api.deleteKnowledgeItem(id);
      setKbItems(prev => prev.filter(k => k.id !== id));
    } catch (err: any) {
      alert(`Failed to delete item: ${err?.message || err}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Operations Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            OmniSupport Admin Portal
          </h1>
          <p className="text-sm text-slate-500">
            Real-time analytics, unresolved ticket escalation, and knowledge base management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleOpenAddKb}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New FAQ
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics & Metrics
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'tickets'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Tickets & Escalations ({tickets.length})
        </button>

        <button
          onClick={() => setActiveTab('kb')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'kb'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Knowledge Base Manager ({kbItems.length})
        </button>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Conversations</span>
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {stats.totalConversations}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {stats.totalMessages} total user & AI turns
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">AI Resolution Rate</span>
                <Percent className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-600">
                {stats.aiResolutionRate}%
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Resolved without human intervention
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Unresolved / Open</span>
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {stats.openTickets + stats.inProgressTickets}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {stats.openTickets} open, {stats.inProgressTickets} in progress
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Avg Response Time</span>
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {(stats.averageResponseTimeMs / 1000).toFixed(1)}s
              </div>
              <p className="text-xs text-slate-400 mt-1">
                CSAT Rating: ⭐ {stats.csatRating} / 5.0
              </p>
            </div>

          </div>

          {/* Breakdown Charts & Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Top Inquiries by Category */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Frequently Inquired Categories
              </h3>
              <div className="space-y-4">
                {stats.topCategories.map((cat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                      <span>{cat.category}</span>
                      <span className="font-bold">{cat.count} FAQs ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                        style={{ width: `${Math.max(cat.percentage, 8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Distribution & System Info */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-blue-600" />
                  Language Demographics
                </h3>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-700">🇬🇧 English Sessions</span>
                    <span className="font-bold text-slate-900">{stats.languageBreakdown.en}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">🇮🇳 Tamil (தமிழ்) Sessions</span>
                    <span className="font-bold text-slate-900">{stats.languageBreakdown.ta}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span>AI Model:</span>
                    <span className="font-mono font-bold text-blue-700">gemini-3.8-flash</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span>Grounding Mode:</span>
                    <span className="font-bold text-emerald-600">Strict Knowledge Base Check</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Active Support Tickets:</span>
                    <span className="font-bold text-slate-900">{stats.totalTickets} total</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                <strong>Project Portfolio Tip:</strong> This full-stack system integrates Node.js Express server routes with Google's modern @google/genai SDK, implementing grounded RAG (Retrieval-Augmented Generation) without hallucinations.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. TICKETS & ESCALATIONS TAB */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Ticket Listing Table */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col h-[650px]">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Incoming Support Tickets ({tickets.length})
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {tickets.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p className="text-xs font-semibold">Zero unresolved tickets! Great job.</p>
                </div>
              ) : (
                tickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicket(t)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-extrabold text-blue-700">
                          {t.ticketNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                          t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {t.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {t.subject}
                      </h4>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                        <span>{t.name}</span>
                        <span className="uppercase font-semibold text-slate-500">{t.priority}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Ticket Admin Resolver Panel */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between h-[650px] overflow-y-auto">
            {selectedTicket ? (
              <div className="space-y-5">
                
                {/* Header */}
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-mono text-lg font-extrabold text-blue-700">
                      {selectedTicket.ticketNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">Status:</span>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value as any)}
                        disabled={isUpdatingTicket}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-hidden"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2">
                    {selectedTicket.subject}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-600">
                    <div><strong>Customer:</strong> {selectedTicket.name} ({selectedTicket.email})</div>
                    <div><strong>Priority:</strong> <span className="uppercase font-bold">{selectedTicket.priority}</span></div>
                    <div><strong>Category:</strong> {selectedTicket.category}</div>
                    {selectedTicket.orderId && <div><strong>Order ID:</strong> #{selectedTicket.orderId}</div>}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Customer Statement
                  </h4>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Resolution Notes History */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Internal Specialist Notes & Customer Replies
                  </h4>
                  {selectedTicket.adminNotes && selectedTicket.adminNotes.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTicket.adminNotes.map((note, idx) => (
                        <div key={idx} className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950">
                          {note}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No notes posted yet.</p>
                  )}
                </div>

                {/* Add Note / Resolve Action */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Append Resolution Note or Agent Message
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Spoke with delivery partner, refund initiated with ARN: 994021..."
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      onClick={() => handleUpdateTicketStatus(selectedTicket.id, selectedTicket.status)}
                      disabled={!adminNote.trim() || isUpdatingTicket}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-40"
                    >
                      Post Note
                    </button>
                    {selectedTicket.status !== 'resolved' && (
                      <button
                        onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resolved')}
                        disabled={isUpdatingTicket}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <AlertCircle className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-xs">Select a ticket to review and resolve</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. KNOWLEDGE BASE MANAGER TAB */}
      {activeTab === 'kb' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search knowledge base articles..."
                value={kbSearch}
                onChange={(e) => setKbSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              onClick={handleOpenAddKb}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              New Knowledge Item
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-bold">Category</th>
                    <th className="py-3 px-4 font-bold">English Question & Answer</th>
                    <th className="py-3 px-4 font-bold">Tamil (தமிழ்) Question & Answer</th>
                    <th className="py-3 px-4 font-bold">Keywords</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kbItems
                    .filter(k => 
                      !kbSearch || 
                      k.question.toLowerCase().includes(kbSearch.toLowerCase()) || 
                      k.questionTa.includes(kbSearch) ||
                      k.keywords.some(kw => kw.toLowerCase().includes(kbSearch.toLowerCase()))
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 align-top">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                            {item.categoryLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 align-top max-w-xs">
                          <div className="font-bold text-slate-900">{item.question}</div>
                          <div className="text-slate-500 line-clamp-2 mt-1">{item.answer}</div>
                        </td>
                        <td className="py-3.5 px-4 align-top max-w-xs font-sans">
                          <div className="font-bold text-slate-900">{item.questionTa}</div>
                          <div className="text-slate-500 line-clamp-2 mt-1">{item.answerTa}</div>
                        </td>
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-wrap gap-1">
                            {item.keywords.slice(0, 3).map((kw, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 align-top text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditKb(item)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit item"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteKb(item.id)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Modal for Add / Edit Knowledge Item */}
      {isKbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingKbItem ? 'Edit Knowledge Base Item' : 'Create New Knowledge Base Item'}
              </h3>
              <button
                onClick={() => setIsKbModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKb} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category Key
                  </label>
                  <select
                    value={kbCategory}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setKbCategory(val);
                      const map: Record<string, string> = {
                        orders: 'Orders & Tracking',
                        refunds: 'Refunds & Returns',
                        shipping: 'Shipping & Delivery',
                        payments: 'Payment & Billing',
                        account: 'Account & Security',
                        general: 'General Inquiries'
                      };
                      setKbCategoryLabel(map[val] || 'General');
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="orders">orders</option>
                    <option value="refunds">refunds</option>
                    <option value="shipping">shipping</option>
                    <option value="payments">payments</option>
                    <option value="account">account</option>
                    <option value="general">general</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category Label
                  </label>
                  <input
                    type="text"
                    value={kbCategoryLabel}
                    onChange={(e) => setKbCategoryLabel(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Question (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Can I change my delivery address?"
                  value={kbQuestion}
                  onChange={(e) => setKbQuestion(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Question in Tamil (தமிழ் கேள்வி)
                </label>
                <input
                  type="text"
                  placeholder="எ.கா: டெலிவரி முகவரியை மாற்ற முடியுமா?"
                  value={kbQuestionTa}
                  onChange={(e) => setKbQuestionTa(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Verified Answer (English) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Official policy and guidelines..."
                  value={kbAnswer}
                  onChange={(e) => setKbAnswer(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Verified Answer in Tamil (தமிழ் விளக்கம்)
                </label>
                <textarea
                  rows={3}
                  placeholder="அதிகாரப்பூர்வ கொள்கை மற்றும் வழிகாட்டுதல்..."
                  value={kbAnswerTa}
                  onChange={(e) => setKbAnswerTa(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="address, delivery, change, dispatch"
                  value={kbKeywords}
                  onChange={(e) => setKbKeywords(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsKbModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingKb}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingKb ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
