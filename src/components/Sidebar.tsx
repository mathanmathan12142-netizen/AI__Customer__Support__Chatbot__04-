import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Search, CheckCircle2, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { ChatSession, Language } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  language: Language;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  language,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.messages.some(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return language === 'ta' ? 'சமீபத்தில்' : 'Just now';
      if (diffHours < 24) return `${diffHours}h ${language === 'ta' ? 'முன்பு' : 'ago'}`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return language === 'ta' ? 'நேற்று' : 'Yesterday';
      return `${diffDays}d ${language === 'ta' ? 'முன்பு' : 'ago'}`;
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 z-40 w-72 sm:w-80 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* New Chat Button */}
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={() => {
              onNewSession();
              if (isOpenMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            {language === 'ta' ? 'புதிய அரட்டை தொடங்கு' : 'New Conversation'}
          </button>

          {/* Search chats */}
          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'ta' ? 'அரட்டைகளைத் தேடுங்கள்...' : 'Search conversation history...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {language === 'ta' ? 'உரையாடல் வரலாறு' : 'Chat History'} ({filteredSessions.length})
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 px-4 text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-xs">
                {searchTerm
                  ? (language === 'ta' ? 'பொருந்தும் அரட்டைகள் இல்லை' : 'No matching chats found')
                  : (language === 'ta' ? 'உரையாடல்கள் எதுவும் இல்லை' : 'No previous conversations')}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (isOpenMobile) onCloseMobile();
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition-all ${
                    isActive
                      ? 'bg-blue-50/80 border border-blue-200 text-blue-900 shadow-xs'
                      : 'hover:bg-slate-100/70 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 pr-6">
                    <MessageSquare className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${isActive ? 'text-blue-950' : 'text-slate-800'}`}>
                        {session.title || (language === 'ta' ? 'உரையாடல்' : 'Conversation')}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                        <span>{formatTime(session.updatedAt)}</span>
                        <span>•</span>
                        <span className="uppercase font-semibold">{session.language}</span>
                        <span>•</span>
                        <span>{session.messages.length} msgs</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all shrink-0 absolute right-2"
                    title={language === 'ta' ? 'நீக்கு' : 'Delete chat'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Engine Status / Confidence Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-800">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              {language === 'ta'
                ? 'சரிபார்க்கப்பட்ட நிறுவன கொள்கைகளின் அடிப்படையில் மட்டுமே பதிலளிக்கிறது.'
                : 'Responses strictly grounded in verified company knowledge base.'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
