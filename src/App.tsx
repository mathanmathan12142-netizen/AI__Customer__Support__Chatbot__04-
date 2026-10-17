import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { SupportTicketView } from './components/SupportTicketView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatSession, Language } from './types';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'kb' | 'tickets' | 'admin'>('chat');
  const [language, setLanguage] = useState<Language>('en');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(true);

  // Load initial sessions & system health
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const [health, conversationList] = await Promise.all([
        api.getHealth().catch(() => ({ geminiConfigured: true })),
        api.getConversations().catch(() => [] as ChatSession[])
      ]);

      if (health) {
        setGeminiConfigured(health.geminiConfigured);
      }

      setSessions(conversationList);
      if (conversationList.length > 0) {
        setActiveSessionId(conversationList[0].id);
      } else {
        // Auto-create initial session
        const fresh = await api.createConversation(language);
        setSessions([fresh]);
        setActiveSessionId(fresh.id);
      }
    } catch (err: any) {
      console.error('Failed to initialize app:', err);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  // Create new session
  const handleNewSession = async () => {
    try {
      const newSession = await api.createConversation(language);
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Failed to create new session:', err);
    }
  };

  // Delete session
  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteConversation(id);
      const remaining = sessions.filter(s => s.id !== id);
      setSessions(remaining);
      if (activeSessionId === id) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        } else {
          handleNewSession();
        }
      }
    } catch (err: any) {
      console.error('Failed to delete session:', err);
    }
  };

  // Send message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setErrorMessage(null);
    setLastFailedMessage(null);

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      const fresh = await api.createConversation(language);
      setSessions(prev => [fresh, ...prev]);
      targetSessionId = fresh.id;
      setActiveSessionId(fresh.id);
    }

    // Optimistically append user message to local state
    const optimisticUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user' as const,
      content: text,
      timestamp: new Date().toISOString(),
      language
    };

    setSessions(prev => prev.map(s => {
      if (s.id === targetSessionId) {
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          messages: [...s.messages, optimisticUserMsg]
        };
      }
      return s;
    }));

    try {
      setIsLoading(true);
      const result = await api.sendMessage(targetSessionId, text, language);
      
      // Update with server authoritative session
      setSessions(prev => prev.map(s => s.id === result.session.id ? result.session : s));
      setActiveSessionId(result.session.id);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err?.message || (language === 'ta' ? 'செய்தியை செயலாக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Failed to send message. Please retry.'));
      setLastFailedMessage(text);
    } finally {
      setIsLoading(false);
    }
  };

  // Record feedback
  const handleRecordFeedback = async (messageId: string, feedback: 'like' | 'dislike') => {
    if (!activeSessionId) return;
    try {
      await api.recordFeedback(activeSessionId, messageId, feedback);
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === messageId ? { ...m, feedback } : m)
          };
        }
        return s;
      }));
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  // Clear chat
  const handleClearChat = async () => {
    if (!activeSessionId) return;
    if (confirm(language === 'ta' ? 'இந்த உரையாடலை அழிக்க விரும்புகிறீர்களா?' : 'Clear all messages in this conversation?')) {
      handleNewSession();
    }
  };

  // Ask from knowledge base
  const handleAskInChat = (query: string) => {
    setActiveTab('chat');
    handleSendMessage(query);
  };

  // Open ticket modal / tab
  const handleOpenTicket = () => {
    setActiveTab('tickets');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        onOpenTicketModal={handleOpenTicket}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        geminiConfigured={geminiConfigured}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* View 1: Chatbot (Sidebar + Chat Area) */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex overflow-hidden">
            <Sidebar
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={(id) => setActiveSessionId(id)}
              onNewSession={handleNewSession}
              onDeleteSession={handleDeleteSession}
              language={language}
              isOpenMobile={isMobileSidebarOpen}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />

            <ChatArea
              session={activeSession}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              language={language}
              onOpenTicket={handleOpenTicket}
              onClearChat={handleClearChat}
              onRecordFeedback={handleRecordFeedback}
              errorMessage={errorMessage}
              onRetry={() => {
                if (lastFailedMessage) handleSendMessage(lastFailedMessage);
              }}
            />
          </div>
        )}

        {/* View 2: Knowledge Base */}
        {activeTab === 'kb' && (
          <div className="flex-1 overflow-y-auto">
            <KnowledgeBaseView
              language={language}
              onAskInChat={handleAskInChat}
            />
          </div>
        )}

        {/* View 3: Support Tickets */}
        {activeTab === 'tickets' && (
          <div className="flex-1 overflow-y-auto">
            <SupportTicketView
              language={language}
              onNavigateToChat={() => setActiveTab('chat')}
              sourceSessionId={activeSessionId || undefined}
            />
          </div>
        )}

        {/* View 4: Admin Dashboard */}
        {activeTab === 'admin' && (
          <div className="flex-1 overflow-y-auto">
            <AdminDashboard
              language={language}
            />
          </div>
        )}

      </main>

    </div>
  );
}
