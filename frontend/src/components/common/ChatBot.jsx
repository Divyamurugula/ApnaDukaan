import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const QUICK_REPLIES = [
  'Show fresh vegetables',
  'Suggest dairy products',
  'Find grocery shops',
  'Best rated products',
  'Show bakery items',
];

const ChatBot = () => {
  const { user } = useAuth();
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! 👋 I'm ApnaBot. I can help you find fresh products from local shops near you. What are you looking for today?",
      products: [],
    },
  ]);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: msg, products: [] }]);
    setLoading(true);

    try {
      const { data } = await api.post('/chatbot/chat', { message: msg });

      // Parse products from reply if any structured data comes back
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply,
          products: data.products || [],
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: "Sorry, I'm having trouble right now 😅 Please browse our Shops page to find what you need!",
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Works for both logged-in and guest users
  // Guest users get a prompt to login for personalized results
  const handleOpen = () => setOpen(true);

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110"
        aria-label="Open chat"
      >
        {open
          ? <FiX size={22} />
          : (
            <div className="relative">
              <FiMessageCircle size={22} />
              {/* Pulse animation */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full" />
            </div>
          )
        }
      </button>

      {/* ── Chat Window ── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <FiMessageCircle className="text-white" size={18} />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">ApnaBot</p>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                <p className="text-green-100 text-xs">AI Shopping Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* Bot avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                    <span className="text-xs">🤖</span>
                  </div>
                )}

                <div className="max-w-[80%]">
                  {/* Message bubble */}
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-green-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100'
                  }`}>
                    {msg.text}
                  </div>

                  {/* Product cards if any */}
                  {msg.products?.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.products.map((p, j) => (
                        <Link
                          key={j}
                          to={`/products/${p._id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-sm border border-gray-100 hover:border-green-300 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt={p.productName} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{p.productName}</p>
                            <p className="text-xs text-gray-500 truncate">{p.shop?.shopName}</p>
                          </div>
                          <p className="text-xs font-bold text-green-700 flex-shrink-0">
                            ₹{p.discountedPrice || p.price}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-2">
                  <span className="text-xs">🤖</span>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick Replies — show only at start */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-hide">
              {QUICK_REPLIES.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex-shrink-0 text-xs bg-white border border-green-200 text-green-700 px-3 py-1.5 rounded-full hover:bg-green-50 transition-colors whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <FiSend size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;