import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Package,
  RotateCcw,
  CreditCard,
  Truck,
  UserCheck,
  Globe
} from 'lucide-react';
import { KnowledgeItem, Language } from '../types';
import { api } from '../services/api';

interface KnowledgeBaseViewProps {
  language: Language;
  onAskInChat: (query: string) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  language,
  onAskInChat,
}) => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [displayLanguage, setDisplayLanguage] = useState<'both' | 'en' | 'ta'>('both');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  const loadKnowledgeBase = async () => {
    try {
      setIsLoading(true);
      const data = await api.getKnowledgeBase();
      setItems(data);
      if (data.length > 0) {
        setExpandedId(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load KB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: language === 'ta' ? 'அனைத்தும்' : 'All Categories', icon: BookOpen },
    { id: 'orders', label: language === 'ta' ? 'ஆர்டர்கள்' : 'Orders & Tracking', icon: Package },
    { id: 'refunds', label: language === 'ta' ? 'ரீஃபண்ட் & திரும்புதல்' : 'Refunds & Returns', icon: RotateCcw },
    { id: 'shipping', label: language === 'ta' ? 'ஷிப்பிங்' : 'Shipping & Delivery', icon: Truck },
    { id: 'payments', label: language === 'ta' ? 'கட்டணம்' : 'Payment & Billing', icon: CreditCard },
    { id: 'account', label: language === 'ta' ? 'கணக்கு' : 'Account & Security', icon: UserCheck },
  ];

  const filteredItems = items.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      item.question.toLowerCase().includes(q) ||
      item.questionTa.includes(searchTerm) ||
      item.answer.toLowerCase().includes(q) ||
      item.answerTa.includes(searchTerm) ||
      item.keywords.some(k => k.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Hero Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          {language === 'ta' ? 'சரிபார்க்கப்பட்ட நிறுவனக் கொள்கைகள்' : 'Verified Knowledge Repository'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {language === 'ta' ? 'அறிவுத் தளம் & அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Knowledge Base & Policy Center'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {language === 'ta'
            ? 'அனைத்து தயாரிப்புகள், ஷிப்பிங், ரீஃபண்ட் கொள்கைகள் மற்றும் கட்டண வழிகாட்டிகள் இங்கே உள்ளன.'
            : 'Explore verified official documentation, shipping guidelines, refund rules, and payment procedures.'}
        </p>

        {/* Search Bar */}
        <div className="mt-6 relative max-w-xl mx-auto">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'ta'
                ? 'கேள்விகள், முக்கிய வார்த்தைகள் அல்லது தலைப்புகளைத் தேடுங்கள்...'
                : 'Search questions, policy rules, or keywords (e.g., refund, UPI, 30 days)...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Category Pills & Language Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Display language toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-end sm:self-auto">
          <button
            onClick={() => setDisplayLanguage('both')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              displayLanguage === 'both' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            {language === 'ta' ? 'இரண்டும்' : 'Both (EN+TA)'}
          </button>
          <button
            onClick={() => setDisplayLanguage('en')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              displayLanguage === 'en' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setDisplayLanguage('ta')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              displayLanguage === 'ta' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            தமிழ்
          </button>
        </div>

      </div>

      {/* Knowledge Items Accordion List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700">
              {language === 'ta' ? 'முடிவுகள் எதுவும் இல்லை' : 'No articles matched your criteria'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ta' ? 'வேறு தேடல் சொற்களை முயற்சிக்கவும்' : 'Try searching for other keywords like refund, order, or shipping'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all overflow-hidden"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-5 flex items-start justify-between cursor-pointer hover:bg-slate-50/70 transition-colors gap-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-blue-200">
                      Q
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                          {item.categoryLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                      
                      {/* Questions */}
                      {(displayLanguage === 'both' || displayLanguage === 'en') && (
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {item.question}
                        </h3>
                      )}
                      {(displayLanguage === 'both' || displayLanguage === 'ta') && (
                        <h4 className="text-sm font-medium text-slate-700 leading-snug mt-0.5">
                          {item.questionTa}
                        </h4>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-slate-400 mt-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {/* Expanded Answer Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/40">
                    <div className="space-y-4">
                      
                      {/* English Answer */}
                      {(displayLanguage === 'both' || displayLanguage === 'en') && (
                        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                          <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-blue-700">
                            <span>🇬🇧 English Answer:</span>
                          </div>
                          <p className="text-sm text-slate-800 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      )}

                      {/* Tamil Answer */}
                      {(displayLanguage === 'both' || displayLanguage === 'ta') && (
                        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                          <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-blue-700">
                            <span>🇮🇳 தமிழ் விளக்கம் (Tamil Answer):</span>
                          </div>
                          <p className="text-sm text-slate-800 leading-relaxed font-sans">
                            {item.answerTa}
                          </p>
                        </div>
                      )}

                      {/* Keywords & Ask in Chat Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          {item.keywords.map((kw, kwIdx) => (
                            <span
                              key={kwIdx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => onAskInChat(item.question)}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          {language === 'ta' ? 'இதைப் பற்றி AI-யிடம் கேட்க' : 'Ask AI In Live Chat'}
                        </button>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
