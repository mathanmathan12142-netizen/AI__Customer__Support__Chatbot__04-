import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Tag,
  Mail,
  User,
  FileText,
  Package,
  MessageSquare,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { SupportTicket, Language } from '../types';
import { api } from '../services/api';

interface SupportTicketViewProps {
  language: Language;
  onNavigateToChat: () => void;
  defaultOrderId?: string;
  sourceSessionId?: string;
}

export const SupportTicketView: React.FC<SupportTicketViewProps> = ({
  language,
  onNavigateToChat,
  defaultOrderId = '',
  sourceSessionId,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'track'>('create');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('orders');
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
  const [orderId, setOrderId] = useState(defaultOrderId);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);

  // Tracking State
  const [lookupQuery, setLookupQuery] = useState('');
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoadingTickets(true);
      const data = await api.getTickets();
      setTicketsList(data);
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
    } catch (err: any) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError(language === 'ta' ? 'தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்' : 'Please enter your name');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError(language === 'ta' ? 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்' : 'Please provide a valid email address');
      return;
    }
    if (!subject.trim()) {
      setFormError(language === 'ta' ? 'சிக்கலின் சுருக்கத்தை உள்ளிடவும்' : 'Please enter a ticket subject');
      return;
    }
    if (!description.trim() || description.length < 10) {
      setFormError(language === 'ta' ? 'தயவுசெய்து சிக்கலை விளக்கமாக உள்ளிடவும் (குறைந்தது 10 எழுத்துகள்)' : 'Please describe your issue with at least 10 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      const newTicket = await api.createTicket({
        name,
        email,
        category,
        priority,
        subject,
        description,
        orderId: orderId.trim() || undefined,
        sourceSessionId,
      });

      setCreatedTicket(newTicket);
      await loadTickets();
      // Reset form
      setName('');
      setEmail('');
      setSubject('');
      setDescription('');
      setOrderId('');
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTickets = ticketsList.filter(t => 
    t.ticketNumber.toLowerCase().includes(lookupQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(lookupQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(lookupQuery.toLowerCase()) ||
    (t.orderId && t.orderId.toLowerCase().includes(lookupQuery.toLowerCase()))
  );

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            {language === 'ta' ? 'திறந்துள்ளது' : 'Open'}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            {language === 'ta' ? 'செயலாக்கத்தில்' : 'In Progress'}
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            {language === 'ta' ? 'தீர்க்கப்பட்டது' : 'Resolved'}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: SupportTicket['priority']) => {
    const colors = {
      low: 'bg-slate-100 text-slate-700 border-slate-200',
      medium: 'bg-blue-50 text-blue-700 border-blue-200',
      high: 'bg-orange-50 text-orange-700 border-orange-200',
      urgent: 'bg-red-50 text-red-700 border-red-200 font-bold',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Hero Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-3">
          <LifeBuoy className="w-3.5 h-3.5" />
          {language === 'ta' ? '24/7 மனித ஆதரவு மையம்' : '24/7 Human Support Desk'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {language === 'ta' ? 'மனித வாடிக்கையாளர் சேவை ஆதரவு' : 'Human Support & Escalation Hub'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {language === 'ta'
            ? 'எங்கள் வாடிக்கையாளர் ஆதரவு வல்லுநர்கள் 15-30 நிமிடங்களில் உங்களுக்கு தீர்வு வழங்குவார்கள்.'
            : 'When automated AI answers are not enough, connect directly with our human specialists for complex escalations.'}
        </p>

        {/* Tab Switcher */}
        <div className="mt-6 inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('create')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'create'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ta' ? 'புதிய டிக்கெட் சமர்ப்பிக்க' : 'Submit Support Ticket'}
          </button>
          <button
            onClick={() => setActiveSubTab('track')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'track'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ta' ? 'டிக்கெட் நிலையை அறிய' : 'Track Existing Tickets'} ({ticketsList.length})
          </button>
        </div>
      </div>

      {/* View 1: Create Ticket */}
      {activeSubTab === 'create' && (
        <div className="max-w-3xl mx-auto">
          
          {/* Success Banner if Ticket Created */}
          {createdTicket && (
            <div className="mb-6 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-emerald-950">
                    {language === 'ta' ? 'டிக்கெட் வெற்றிகரமாக உருவாக்கப்பட்டது!' : 'Support Ticket Submitted Successfully!'}
                  </h3>
                  <p className="text-sm text-emerald-800 mt-1">
                    {language === 'ta'
                      ? `உங்கள் குறிப்பு எண்: `
                      : `Your reference code is `}
                    <strong className="font-extrabold text-emerald-950 underline">{createdTicket.ticketNumber}</strong>.
                    {' '}{language === 'ta'
                      ? 'உறுதிப்படுத்தல் மின்னஞ்சல் உங்கள் இன்பாக்ஸுக்கு அனுப்பப்பட்டுள்ளது.'
                      : 'A confirmation notice has been dispatched to your email.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setSelectedTicket(createdTicket);
                        setActiveSubTab('track');
                        setCreatedTicket(null);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                    >
                      {language === 'ta' ? 'டிக்கெட்டைக் கண்காணிக்கவும்' : 'Track This Ticket'}
                    </button>
                    <button
                      onClick={onNavigateToChat}
                      className="px-4 py-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg transition-colors"
                    >
                      {language === 'ta' ? 'அரட்டைக்குத் திரும்பு' : 'Back to AI Chat'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
            {formError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {language === 'ta' ? 'உங்கள் பெயர் *' : 'Full Name *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {language === 'ta' ? 'மின்னஞ்சல் முகவரி *' : 'Email Address *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Category and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {language === 'ta' ? 'சிக்கலின் வகை *' : 'Issue Category *'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="orders">{language === 'ta' ? 'ஆர்டர்கள் & டெலிவரி' : 'Orders & Delivery'}</option>
                    <option value="refunds">{language === 'ta' ? 'ரீஃபண்ட் & திரும்புதல்' : 'Refunds & Returns'}</option>
                    <option value="shipping">{language === 'ta' ? 'ஷிப்பிங் & கட்டணம்' : 'Shipping & Tracking'}</option>
                    <option value="payments">{language === 'ta' ? 'கட்டண சிக்கல்கள்' : 'Payments & Billing'}</option>
                    <option value="account">{language === 'ta' ? 'கணக்கு & பாதுகாப்பு' : 'Account & Security'}</option>
                    <option value="technical">{language === 'ta' ? 'தொழில்நுட்ப கோளாறு' : 'Technical Issue'}</option>
                    <option value="other">{language === 'ta' ? 'பிற கோரிக்கைகள்' : 'Other'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    {language === 'ta' ? 'முன்னுரிமை *' : 'Priority Level *'}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="low">Low (Standard inquiry)</option>
                    <option value="medium">Medium (Requires attention)</option>
                    <option value="high">High (Time sensitive)</option>
                    <option value="urgent">Urgent (Payment / delivery blocker)</option>
                  </select>
                </div>
              </div>

              {/* Order ID (Optional with quick samples) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {language === 'ta' ? 'ஆர்டர் எண் (விருப்பத்தேர்வு)' : 'Order ID (Optional)'}
                  </label>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="text-[11px] text-slate-400">Sample:</span>
                    <button
                      type="button"
                      onClick={() => setOrderId('ORD-10294')}
                      className="text-blue-600 hover:underline font-mono text-[11px]"
                    >
                      #ORD-10294
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setOrderId('ORD-98234')}
                      className="text-blue-600 hover:underline font-mono text-[11px]"
                    >
                      #ORD-98234
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Package className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. ORD-10294"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {language === 'ta' ? 'சிக்கலின் சுருக்கம் *' : 'Subject Summary *'}
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder={
                      language === 'ta'
                        ? 'எ.கா: ஆர்டர் #ORD-10294 டெலிவரியில் தாமதம்'
                        : 'e.g. Shipment stuck in transit for order #ORD-10294'
                    }
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {language === 'ta' ? 'விரிவான விவரங்கள் *' : 'Detailed Description *'}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={
                    language === 'ta'
                      ? 'உங்கள் சிக்கல், பரிவர்த்தனை ஐடி அல்லது நீங்கள் சந்தித்த பிழையை விளக்கமாக குறிப்பிடவும்...'
                      : 'Please provide full context, transaction references, or any error messages you received...'
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isSubmitting
                  ? (language === 'ta' ? 'சமர்ப்பிக்கப்படுகிறது...' : 'Submitting Ticket...')
                  : (language === 'ta' ? 'ஆதரவு டிக்கெட்டைச் சமர்ப்பிக்கவும்' : 'Submit Support Ticket')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View 2: Track Existing Tickets */}
      {activeSubTab === 'track' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Ticket List */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col h-[600px]">
            <div className="mb-3 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'ta' ? 'டிக்கெட் ஐடி அல்லது மின்னஞ்சல் தேடு...' : 'Search by TKT #, email or subject...'}
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <LifeBuoy className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">
                    {language === 'ta' ? 'டிக்கெட்டுகள் எதுவும் கிடைக்கவில்லை' : 'No support tickets found'}
                  </p>
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const isSelected = selectedTicket?.id === ticket.id;
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-extrabold text-blue-700">
                          {ticket.ticketNumber}
                        </span>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {ticket.subject}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {ticket.description}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                        <span>{ticket.name}</span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Ticket Detail View */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between h-[600px] overflow-y-auto">
            {selectedTicket ? (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        {selectedTicket.ticketNumber}
                      </span>
                      {getPriorityBadge(selectedTicket.priority)}
                    </div>
                    {getStatusBadge(selectedTicket.status)}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-3">
                    {selectedTicket.subject}
                  </h3>

                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                    <div>
                      <strong className="text-slate-700">Customer:</strong> {selectedTicket.name} ({selectedTicket.email})
                    </div>
                    {selectedTicket.orderId && (
                      <div>
                        <strong className="text-slate-700">Order Ref:</strong> #{selectedTicket.orderId}
                      </div>
                    )}
                    <div>
                      <strong className="text-slate-700">Submitted:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {language === 'ta' ? 'சிக்கல் விளக்கம்' : 'Issue Description'}
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Resolution / Admin Notes timeline */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    {language === 'ta' ? 'அதிகாரியின் பதில் குறிப்புகள்' : 'Human Specialist Updates & Resolution'}
                  </h4>

                  {selectedTicket.adminNotes && selectedTicket.adminNotes.length > 0 ? (
                    <div className="space-y-2">
                      {selectedTicket.adminNotes.map((note, idx) => (
                        <div key={idx} className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950">
                          <div className="font-semibold text-blue-800 mb-0.5 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            OmniSupport Escalation Team
                          </div>
                          <p>{note}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 text-center">
                      <Clock className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                      {language === 'ta'
                        ? 'உங்கள் டிக்கெட் எங்கள் வரிசையில் உள்ளது. அதிகாரி விரைவில் பதிலளிப்பார்.'
                        : 'Your ticket is in queue. Our support specialist is actively reviewing this inquiry.'}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <LifeBuoy className="w-12 h-12 mb-3 opacity-30 text-slate-400" />
                <p className="text-sm font-semibold">
                  {language === 'ta' ? 'விவரங்களைக் காண ஒரு டிக்கெட்டைத் தேர்ந்தெடுக்கவும்' : 'Select a ticket on the left to inspect updates'}
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
