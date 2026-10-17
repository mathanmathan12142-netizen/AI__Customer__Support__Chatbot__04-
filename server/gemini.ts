import { GoogleGenAI } from '@google/genai';
import { storage, ChatMessage } from './storage.js';

const apiKey = process.env.GEMINI_API_KEY;

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export interface GenerateChatResponseParams {
  sessionId: string;
  userMessage: string;
  language: 'en' | 'ta';
  history: ChatMessage[];
}

export interface ChatResponseResult {
  text: string;
  groundedKBIds: string[];
  suggestedActions?: Array<{ label: string; action: string; payload?: string }>;
  isEscalated?: boolean;
}

export async function generateSupportResponse(
  params: GenerateChatResponseParams
): Promise<ChatResponseResult> {
  const { userMessage, language, history } = params;

  // 1. Check if user is asking for order tracking
  const orderMatch = userMessage.match(/\b(ORD-\d{4,6}|\d{5})\b/i);
  let orderData = null;
  if (orderMatch) {
    orderData = storage.lookupOrder(orderMatch[0]);
  }

  // 2. Retrieve relevant knowledge base items
  const allKB = storage.getKnowledgeBase();
  const matchedKB = storage.searchKnowledgeBase(userMessage, language);
  const relevantKB = matchedKB.length > 0 ? matchedKB.slice(0, 4) : allKB.slice(0, 5);
  const groundedKBIds = relevantKB.map(k => k.id);

  // Detect if user is asking to speak with a human or escalate
  const escalateTerms = ['human', 'agent', 'representative', 'person', 'supervisor', 'escalate', 'complain', 'மனித', 'அதிகாரி', 'உதவியாளர்', 'பேச'];
  const wantsHuman = escalateTerms.some(term => userMessage.toLowerCase().includes(term));

  // Build the Knowledge Base Context String
  const kbContext = relevantKB.map(item => `
[Article ID: ${item.id}] [Category: ${item.categoryLabel}]
English Question: ${item.question}
English Answer: ${item.answer}
Tamil Question: ${item.questionTa}
Tamil Answer: ${item.answerTa}
`).join('\n---\n');

  // Build the system instruction
  const systemInstruction = `You are "OmniSupport AI", an intelligent, empathetic, and professional customer support assistant for an e-commerce platform.
Your primary role is to assist customers accurately with Orders, Shipping, Returns, Refunds, Payment issues, and Account support.

CORE RULES:
1. Grounded Accuracy: Answer strictly based on the Knowledge Base provided below and verified facts. NEVER invent discounts, fake return policies, or false order details.
2. If the user's question cannot be answered from the provided knowledge base and cannot be resolved, politely say that you do not have that specific information and offer to create a Human Support Ticket.
3. Multilingual Capability: The conversation language requested is "${language === 'ta' ? 'Tamil (தமிழ்)' : 'English'}".
   - If language is Tamil or the user writes in Tamil, respond in natural, professional Tamil (தமிழ்).
   - If language is English, respond in clear, courteous English.
4. Order Tracking:
   ${orderData ? `FOUND REAL-TIME ORDER RECORD:
   Order ID: ${orderData.orderId}
   Customer: ${orderData.customerName}
   Items: ${orderData.items.join(', ')}
   Total: ${orderData.total}
   Status: ${orderData.status}
   Carrier: ${orderData.carrier} (Tracking: ${orderData.trackingNumber})
   Estimated Delivery: ${orderData.estimatedDelivery}
   Destination: ${orderData.destination}
   Include this accurate info in your response!` : 'If the user mentions an order number but no record exists, advise them to check the Order ID format (e.g. #ORD-10294 or #ORD-98234) or submit a ticket.'}
5. Formatting: Use markdown (bold, bullet points) to make responses easy to scan. Keep answers concise, warm, and helpful.

KNOWLEDGE BASE:
${kbContext}
`;

  // Prepare recent conversation turns
  const recentTurns = history.slice(-6).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  // Add the current user message
  const contents = [
    ...recentTurns,
    {
      role: 'user',
      parts: [{ text: userMessage }]
    }
  ];

  // Try calling Gemini API if configured
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.3, // Low temperature for high accuracy & grounding
        }
      });

      const responseText = response.text || '';
      if (responseText.trim().length > 0) {
        return {
          text: responseText,
          groundedKBIds,
          isEscalated: wantsHuman,
          suggestedActions: wantsHuman ? [
            { label: language === 'ta' ? "📝 ஆதரவு படிவத்தை நிரப்பவும்" : "📝 Open Support Ticket", action: "open_ticket" },
            { label: language === 'ta' ? "📦 ஆர்டரைத் தேடுங்கள்" : "📦 Track Order", action: "track_order" }
          ] : [
            { label: language === 'ta' ? "🔄 ரீஃபண்ட் கொள்கை" : "🔄 Refund Policy", action: "refund_policy" },
            { label: language === 'ta' ? "🎧 மனித ஆதரவு" : "🎧 Speak to Human", action: "open_ticket" }
          ]
        };
      }
    } catch (err: any) {
      console.error('Error generating Gemini response, using grounded fallback:', err?.message || err);
    }
  }

  // Graceful Grounded Fallback (if Gemini key isn't provided or rate limit occurred)
  let fallbackText = '';
  if (orderData) {
    if (language === 'ta') {
      fallbackText = `உங்கள் ஆர்டர் **#${orderData.orderId}** குறித்த விவரங்கள் இதோ:\n\n• **வாடிக்கையாளர்:** ${orderData.customerName}\n• **பொருட்கள்:** ${orderData.items.join(', ')}\n• **நிலை:** 🚚 **${orderData.status}**\n• **கூரியர்:** ${orderData.carrier} (#${orderData.trackingNumber})\n• **எதிர்பார்க்கப்படும் டெலிவரி:** ${orderData.estimatedDelivery}\n• **முகவரி:** ${orderData.destination}`;
    } else {
      fallbackText = `Here are the tracking details for order **#${orderData.orderId}**:\n\n• **Customer:** ${orderData.customerName}\n• **Items:** ${orderData.items.join(', ')}\n• **Status:** 🚚 **${orderData.status}**\n• **Carrier:** ${orderData.carrier} (Tracking #${orderData.trackingNumber})\n• **Estimated Delivery:** ${orderData.estimatedDelivery}\n• **Destination:** ${orderData.destination}`;
    }
  } else if (matchedKB.length > 0) {
    const topMatch = matchedKB[0];
    fallbackText = language === 'ta' 
      ? `${topMatch.answerTa}\n\nமேலும் உதவி தேவைப்பட்டால், நீங்கள் எங்கள் மனித ஆதரவு அதிகாரியை அணுகலாம்.`
      : `${topMatch.answer}\n\nIf you need additional assistance with this, feel free to open a support ticket or ask follow-up questions.`;
  } else if (wantsHuman) {
    fallbackText = language === 'ta'
      ? `எங்கள் மனித ஆதரவு அதிகாரியைத் தொடர்பு கொள்ள நீங்கள் 'Support Ticket' படிவத்தை நிரப்பலாம். எங்கள் குழு 15-30 நிமிடங்களில் உங்களுக்கு பதிலளிக்கும்.`
      : `I'd be glad to connect you with our human support team! You can submit a ticket using the 'Contact Support' button above, and an agent will follow up promptly via email.`;
  } else {
    fallbackText = language === 'ta'
      ? `மன்னிக்கவும், உங்கள் குறிப்பிட்ட கேள்விக்கான தகவல் எங்கள் பொதுவான வழிகாட்டியில் இல்லை. துல்லியமான உதவி பெற, தயவுசெய்து எங்கள் மனித வாடிக்கையாளர் சேவைக்கு ஒரு ஆதரவு டிக்கெட்டைத் திறக்கவும் அல்லது உங்கள் ஆர்டர் எண்ணைக் குறிப்பிடவும்.`
      : `I don't have that exact information in our verified knowledge base. To ensure you receive 100% accurate assistance, please submit a Support Ticket with your account or order details, and our human support team will assist you immediately!`;
  }

  return {
    text: fallbackText,
    groundedKBIds,
    isEscalated: wantsHuman,
    suggestedActions: [
      { label: language === 'ta' ? "📝 ஆதரவு டிக்கெட்" : "📝 Open Ticket", action: "open_ticket" },
      { label: language === 'ta' ? "📦 ஆர்டர் கண்காணிப்பு" : "📦 Track Order", action: "track_order" }
    ]
  };
}
