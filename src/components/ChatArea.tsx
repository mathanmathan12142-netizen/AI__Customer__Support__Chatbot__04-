import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  RefreshCw,
  Package,
  RotateCcw,
  CreditCard,
  UserCheck,
  Headphones,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { ChatMessage, ChatSession, Language } from '../types';

interface ChatAreaProps {
  session: ChatSession | null;
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  language: Language;
  onOpenTicket: () => void;
  onClearChat: () => void;
  onRecordFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
  errorMessage: string | null;
  onRetry: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  session,
  onSendMessage,
  isLoading,
  language,
  onOpenTicket,
  onClearChat,
  onRecordFeedback,
  errorMessage,
  onRetry,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick Questions configuration
  const quickQuestions = language === 'ta' ? [
    { label: "📦 ஆர்டர் கண்காணிப்பு (#ORD-10294)", prompt: "எனது ஆர்டர் #ORD-10294 நிலையை அறிய விரும்புகிறேன்", icon: Package },
    { label: "🔄 ரீஃபண்ட் கொள்கை", prompt: "உங்கள் பணத்தைத் திரும்பப் பெறுதல் (ரீஃபண்ட்) கொள்கை என்ன?", icon: RotateCcw },
    { label: "💳 கட்டணச் சிக்கல்கள்", prompt: "எனது கணக்கிலிருந்து பணம் பிடிக்கப்பட்டது, ஆனால் ஆர்டர் ஆகவில்லை", icon: CreditCard },
    { label: "🔐 கடவுச்சொல் மீட்டமைப்பு", prompt: "எனது கணக்கின் கடவுச்சொல்லை எவ்வாறு மாற்றுவது?", icon: UserCheck },
    { label: "🎧 மனித ஆதரவு", prompt: "நான் ஒரு மனித வாடிக்கையாளர் சேவை அதிகாரியுடன் பேச வேண்டும்", icon: Headphones },
  ] : [
    { label: "📦 Track Order (#ORD-10294)", prompt: "Can you track my order #ORD-10294?", icon: Package },
    { label: "🔄 Refund Policy", prompt: "What is your refund and return policy?", icon: RotateCcw },
    { label: "💳 Payment Issues", prompt: "My money was deducted but order failed. What should I do?", icon: CreditCard },
    { label: "🔐 Account Help", prompt: "How do I reset my account password or update details?", icon: UserCheck },
    { label: "🎧 Contact Support", prompt: "I would like to speak with a human support agent.", icon: Headphones },
  ];

  // Helper to format messages (bold text, bullets, paragraphs)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-2" />;
          
          // Check for bullet point
          const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('* ');
          const formattedLine = line.replace(/^\s*[•\-\*]\s*/, '');

          // Parse markdown-like bold text **bold**
          const parts = formattedLine.split(/(\*\*[^*]+\*\*)/g);
          const parsedElements = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          });

          if (isBullet) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-blue-500 font-bold leading-none mt-1.5">•</span>
                <span>{parsedElements}</span>
              </div>
            );
          }

          return <p key={idx}>{parsedElements}</p>;
        })}
      </div>
    );
  };

  const messages = session?.messages || [];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-50/50">
      
      {/* Top Header of Active Chat */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 truncate">
              {session?.title || (language === 'ta' ? 'வாடிக்கையாளர் ஆதரவு அரட்டை' : 'Customer Support Assistant')}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {language === 'ta' ? 'செயலில் உள்ளது' : 'Online & Ready'}
              </span>
              <span>•</span>
              <span className="uppercase font-semibold">{language === 'ta' ? 'தமிழ்' : 'English'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearChat}
            disabled={messages.length <= 1}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
            title={language === 'ta' ? 'அரட்டையை அழிக்கவும்' : 'Clear Chat'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenTicket}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Headphones className="w-3.5 h-3.5 text-blue-600" />
            {language === 'ta' ? 'நேரடி அதிகாரி' : 'Escalate to Agent'}
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        
        {/* Quick Questions Pill Bar */}
        <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/90 shadow-xs mb-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            {language === 'ta' ? 'விரைவு கேள்விகள்' : 'Popular Quick Inquiries'}
          </p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, index) => {
              const Icon = q.icon;
              return (
                <button
                  key={index}
                  onClick={() => onSendMessage(q.prompt)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-medium shadow-2xs hover:shadow-xs transition-all active:scale-97 disabled:opacity-50"
                >
                  <Icon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{q.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Message List */}
        {messages.map((message) => {
          const isUser = message.role === 'user';
          const isAssistant = message.role === 'assistant';

          return (
            <div
              key={message.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[78%]`}>
                
                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl shadow-xs transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  {isUser ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    renderFormattedContent(message.content)
                  )}

                  {/* Grounded KB Badge */}
                  {isAssistant && message.groundedKBIds && message.groundedKBIds.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-blue-600 font-medium">
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      <span>
                        {language === 'ta'
                          ? 'சரிபார்க்கப்பட்ட கொள்கை ஆவணங்களின் அடிப்படையில் பதிலளிக்கப்பட்டது'
                          : 'Verified from Knowledge Base & Company Policy'}
                      </span>
                    </div>
                  )}

                  {/* Action buttons embedded in message */}
                  {isAssistant && message.suggestedActions && message.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                      {message.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => {
                            if (action.action === 'open_ticket') {
                              onOpenTicket();
                            } else if (action.payload) {
                              onSendMessage(action.payload);
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer under bubble: Timestamp, Copy, Thumbs */}
                <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-slate-400">
                  <span>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {isAssistant && (
                    <>
                      <span>•</span>
                      <button
                        onClick={() => handleCopy(message.content, message.id)}
                        className="hover:text-slate-600 transition-colors"
                        title="Copy text"
                      >
                        {copiedId === message.id ? (
                          <span className="flex items-center gap-0.5 text-emerald-600">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      <button
                        onClick={() => onRecordFeedback(message.id, 'like')}
                        className={`hover:text-blue-600 transition-colors ${message.feedback === 'like' ? 'text-blue-600 font-bold' : ''}`}
                        title="Helpful response"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onRecordFeedback(message.id, 'dislike')}
                        className={`hover:text-red-600 transition-colors ${message.feedback === 'dislike' ? 'text-red-600 font-bold' : ''}`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>

              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-xl mr-auto justify-start">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 typing-dot"></span>
                <span className="w-2 h-2 rounded-full bg-blue-600 typing-dot"></span>
                <span className="w-2 h-2 rounded-full bg-blue-600 typing-dot"></span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {language === 'ta' ? 'OmniSupport சிந்திக்கிறது...' : 'OmniSupport is thinking...'}
              </span>
            </div>
          </div>
        )}

        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700 shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={onRetry}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-red-300 rounded-md text-red-700 font-semibold hover:bg-red-100 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              {language === 'ta' ? 'மீண்டும் முயற்சி' : 'Retry'}
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Container */}
      <div className="p-4 bg-white border-t border-slate-200/90 shadow-md">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 max-w-4xl mx-auto">
          <div className="relative flex-1 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                language === 'ta'
                  ? 'உங்கள் கேள்வியைத் தட்டச்சு செய்யவும் (எ.கா: #ORD-10294 அல்லது பணத்தைத் திரும்பப் பெறுதல்)...'
                  : 'Type your message (e.g. tracking #ORD-10294 or refund policy)...'
              }
              className="w-full py-3 pl-4 pr-10 text-sm bg-transparent border-0 focus:outline-hidden resize-none max-h-32 text-slate-800 placeholder-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="h-11 w-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between max-w-4xl mx-auto mt-2 text-[11px] text-slate-400 px-1">
          <span>
            {language === 'ta'
              ? 'Enter: அனுப்பு | Shift + Enter: புதிய வரி'
              : 'Press Enter to send, Shift + Enter for new line'}
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-500" />
            {language === 'ta' ? 'தமிழ் & ஆங்கிலம் ஆதரிக்கப்படுகிறது' : 'Grounded AI with Tamil & English'}
          </span>
        </div>
      </div>

    </div>
  );
};
