import React from 'react';
import { Bot, BookOpen, LifeBuoy, BarChart3, Globe, PlusCircle, Menu, X, Sparkles, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  activeTab: 'chat' | 'kb' | 'tickets' | 'admin';
  setActiveTab: (tab: 'chat' | 'kb' | 'tickets' | 'admin') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onOpenTicketModal: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  geminiConfigured: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  onOpenTicketModal,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  geminiConfigured,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => setActiveTab('chat')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-lg group-hover:text-blue-600 transition-colors">
                    OmniSupport<span className="text-blue-600 font-bold">.AI</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    <Sparkles className="w-3 h-3 mr-1 text-blue-600" />
                    Gemini 3.8
                  </span>
                </div>
                <p className="hidden sm:block text-xs text-slate-500">
                  {language === 'ta' ? 'அறிவார்ந்த வாடிக்கையாளர் சேவை' : 'Enterprise Customer Intelligence'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Bot className="w-4 h-4" />
              {language === 'ta' ? 'AI அரட்டை' : 'AI Chat'}
            </button>

            <button
              onClick={() => setActiveTab('kb')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'kb'
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              {language === 'ta' ? 'அறிவுத் தளம்' : 'Knowledge Base'}
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'tickets'
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <LifeBuoy className="w-4 h-4" />
              {language === 'ta' ? 'மனித ஆதரவு' : 'Human Support'}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {language === 'ta' ? 'நிர்வாக பலகை' : 'Admin Portal'}
            </button>
          </nav>

          {/* Right Actions: Language Switcher & New Ticket */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-100/90 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === 'ta'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="தமிழுக்கு மாறவும் (Tamil)"
              >
                தமிழ்
              </button>
            </div>

            {/* Submit Ticket Action */}
            <button
              onClick={onOpenTicketModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === 'ta' ? 'டிக்கெட் திறக்க' : 'New Ticket'}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile subnavigation bar */}
      <div className="md:hidden flex border-t border-slate-200 bg-slate-50/90 px-3 py-1.5 overflow-x-auto justify-around">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md ${
            activeTab === 'chat' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('kb')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md ${
            activeTab === 'kb' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Knowledge
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md ${
            activeTab === 'tickets' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
          }`}
        >
          <LifeBuoy className="w-3.5 h-3.5" />
          Tickets
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md ${
            activeTab === 'admin' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Admin
        </button>
      </div>
    </header>
  );
};
