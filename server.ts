import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from './server/storage.js';
import { generateSupportResponse, ai } from './server/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// API Routes

// Health check & status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    geminiConfigured: !!ai,
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString()
  });
});

// 1. Chat & Conversations
app.get('/api/conversations', (req: Request, res: Response) => {
  try {
    const sessions = storage.getAllSessions();
    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch conversations' });
  }
});

app.get('/api/conversations/:id', (req: Request, res: Response) => {
  try {
    const session = storage.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(session);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch conversation' });
  }
});

app.post('/api/conversations', (req: Request, res: Response) => {
  try {
    const { language = 'en', title } = req.body;
    const session = storage.createSession(language, title);
    res.status(201).json(session);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create conversation' });
  }
});

app.delete('/api/conversations/:id', (req: Request, res: Response) => {
  try {
    const success = storage.deleteSession(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete conversation' });
  }
});

app.post('/api/conversations/:id/feedback', (req: Request, res: Response) => {
  try {
    const { messageId, feedback } = req.body;
    if (!messageId || !feedback) {
      return res.status(400).json({ error: 'messageId and feedback are required' });
    }
    const success = storage.updateMessageFeedback(req.params.id, messageId, feedback);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to record feedback' });
  }
});

// Send Chat Message endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { sessionId, message, language = 'en' } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    let session = sessionId ? storage.getSession(sessionId) : null;
    if (!session) {
      session = storage.createSession(language);
    }

    // Append user message
    const userMsgResult = storage.appendMessage(session.id, {
      role: 'user',
      content: message.trim(),
      language
    });

    if (!userMsgResult) {
      return res.status(500).json({ error: 'Failed to record user message' });
    }

    // Call Gemini API
    const aiResult = await generateSupportResponse({
      sessionId: session.id,
      userMessage: message.trim(),
      language,
      history: userMsgResult.session.messages.slice(0, -1)
    });

    // Append assistant response
    const assistantMsgResult = storage.appendMessage(session.id, {
      role: 'assistant',
      content: aiResult.text,
      language,
      groundedKBIds: aiResult.groundedKBIds,
      suggestedActions: aiResult.suggestedActions
    });

    res.json({
      sessionId: session.id,
      userMessage: userMsgResult.message,
      assistantMessage: assistantMsgResult?.message,
      session: assistantMsgResult?.session || session
    });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({ error: err?.message || 'Failed to process chat message' });
  }
});

// 2. Knowledge Base CRUD
app.get('/api/knowledge-base', (req: Request, res: Response) => {
  try {
    const { query, category } = req.query;
    let items = storage.getKnowledgeBase();

    if (category && typeof category === 'string' && category !== 'all') {
      items = items.filter(k => k.category === category);
    }

    if (query && typeof query === 'string' && query.trim().length > 0) {
      const q = query.toLowerCase();
      items = items.filter(k => 
        k.question.toLowerCase().includes(q) ||
        k.questionTa.includes(query) ||
        k.answer.toLowerCase().includes(q) ||
        k.answerTa.includes(query) ||
        k.keywords.some(kw => kw.toLowerCase().includes(q))
      );
    }

    res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to retrieve knowledge base' });
  }
});

app.post('/api/knowledge-base', (req: Request, res: Response) => {
  try {
    const { category, categoryLabel, question, questionTa, answer, answerTa, keywords } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const newItem = storage.addKnowledgeItem({
      category: category || 'general',
      categoryLabel: categoryLabel || 'General Inquiries',
      question,
      questionTa: questionTa || question,
      answer,
      answerTa: answerTa || answer,
      keywords: Array.isArray(keywords) ? keywords : [question.slice(0, 15)]
    });

    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create knowledge base item' });
  }
});

app.put('/api/knowledge-base/:id', (req: Request, res: Response) => {
  try {
    const updated = storage.updateKnowledgeItem(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update item' });
  }
});

app.delete('/api/knowledge-base/:id', (req: Request, res: Response) => {
  try {
    const success = storage.deleteKnowledgeItem(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to delete item' });
  }
});

// 3. Support Tickets
app.get('/api/tickets', (req: Request, res: Response) => {
  try {
    const tickets = storage.getAllTickets();
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch tickets' });
  }
});

app.get('/api/tickets/:id', (req: Request, res: Response) => {
  try {
    const ticket = storage.getTicket(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch ticket' });
  }
});

app.post('/api/tickets', (req: Request, res: Response) => {
  try {
    const { name, email, category, priority = 'medium', subject, description, orderId, sourceSessionId } = req.body;
    if (!name || !email || !subject || !description) {
      return res.status(400).json({ error: 'Name, email, subject, and description are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const ticket = storage.createTicket({
      name,
      email,
      category: category || 'other',
      priority,
      subject,
      description,
      orderId,
      sourceSessionId
    });

    res.status(201).json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create support ticket' });
  }
});

app.patch('/api/tickets/:id', (req: Request, res: Response) => {
  try {
    const { status, note } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = storage.updateTicketStatus(req.params.id, status, note);
    if (!updated) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update ticket' });
  }
});

// 4. Order tracking lookup
app.get('/api/orders/:orderId', (req: Request, res: Response) => {
  try {
    const order = storage.lookupOrder(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: `Order ${req.params.orderId} not found` });
    }
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to lookup order' });
  }
});

// 5. Admin Analytics & Stats
app.get('/api/admin/stats', (req: Request, res: Response) => {
  try {
    const stats = storage.getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to calculate stats' });
  }
});

// Vite Middleware for Full-Stack development
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`> OmniSupport AI server listening at http://localhost:${port}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
