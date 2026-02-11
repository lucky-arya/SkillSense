import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { aiService } from '../services/api/ai.service';
import { useAuth } from '../context/AuthContext';
import { TypingMessage } from '../components/TypingMessage';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

let msgId = 0;

export default function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: ++msgId,
      role: 'assistant',
      content: `Hi${user?.name ? ` ${user.name}` : ''}! 👋 I'm **SkillSense AI**, your personal career advisor.\n\nI can help you with:\n- 🎯 Career advice and planning\n- 📚 Skill development strategies\n- 💼 Interview preparation tips\n- 📝 Resume improvement suggestions\n- 🗺️ Learning path recommendations\n\nHow can I help you today?`,
    },
  ]);
  const [latestAssistantId, setLatestAssistantId] = useState<number>(1);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const userMsgObj: Message = { id: ++msgId, role: 'user', content: userMsg };
    setMessages((prev) => [...prev, userMsgObj]);
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

      const result = await aiService.chat({
        message: userMsg,
        conversationHistory: history,
        userContext: { name: user?.name },
      });

      const newId = ++msgId;
      setMessages((prev) => [...prev, { id: newId, role: 'assistant', content: result.reply }]);
      setLatestAssistantId(newId);
    } catch {
      const errId = ++msgId;
      setMessages((prev) => [
        ...prev,
        { id: errId, role: 'assistant', content: 'Sorry, I wasn\'t able to respond right now. This could be a temporary issue — please try sending your message again.' },
      ]);
      setLatestAssistantId(errId);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const newId = ++msgId;
    setMessages([{ id: newId, role: 'assistant', content: 'Chat cleared! How can I help you?' }]);
    setLatestAssistantId(newId);
  };

  const quickActions = [
    'How should I prepare for a frontend developer interview?',
    'What skills should I learn for machine learning?',
    'Review my resume for a software engineering role',
    'Create a 3-month learning plan for React',
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Bot className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">AI Career Assistant</h1>
            <p className="text-sm text-gray-400">Ask anything about careers, skills, interviews</p>
          </div>
        </div>
        <button onClick={clearChat} className="text-sm text-gray-400 hover:text-red-400 flex items-center gap-1 transition-colors">
          <Trash2 size={14} /> Clear
        </button>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'assistant' ? 'bg-blue-500/20' : 'bg-slate-700'
            }`}>
              {msg.role === 'assistant'
                ? <Sparkles size={16} className="text-blue-400" />
                : <User size={16} className="text-gray-300" />
              }
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-gray-200 border border-slate-700'
            }`}>
              {msg.role === 'assistant' ? (
                <TypingMessage
                  content={msg.content}
                  animate={msg.id === latestAssistantId}
                />
              ) : (
                msg.content
              )}
            </div>
          </motion.div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Sparkles size={16} className="text-blue-400" />
            </div>
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {quickActions.map((qa, i) => (
            <button
              key={i}
              onClick={() => setInput(qa)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-gray-300 px-3 py-1.5 rounded-full border border-slate-700 hover:border-blue-500/50 transition-all"
            >
              {qa}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 mt-3">
        <input
          className="flex-1 bg-slate-800 border border-slate-700 text-gray-100 placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          placeholder="Ask me anything about your career..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
}
