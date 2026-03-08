import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Salam! 🏔️ I'm your Indus Tours travel assistant. Ask me about destinations, tours, hotels, or help planning your Northern Pakistan adventure!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Fetch context data
      const [toursRes, destsRes, dealsRes] = await Promise.all([
        supabase.from('tours').select('title, description, price, discount_price, duration, difficulty').eq('is_active', true).limit(20),
        supabase.from('destinations').select('name, description, best_time, location').limit(20),
        supabase.from('deals').select('title, description, discount_percent, code, valid_until').eq('is_active', true).limit(10),
      ]);

      const context = `
Available Tours: ${JSON.stringify(toursRes.data || [])}
Destinations: ${JSON.stringify(destsRes.data || [])}
Active Deals: ${JSON.stringify(dealsRes.data || [])}
Company: Indus Tours Pakistan, based in Islamabad, specializing in Northern Pakistan tours.
Contact: WhatsApp +92-XXX-XXXXXXX, Email admin@industours.pk
`;

      const response = await supabase.functions.invoke('ai-chatbot', {
        body: {
          messages: [...messages, { role: 'user', content: userMsg }],
          context,
        },
      });

      if (response.data?.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't process that. Please try again or contact us on WhatsApp!" }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection issue. Please try again!" }]);
    }
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform animate-bounce"
        aria-label="Open AI Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-50 w-[360px] h-[500px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <div>
            <p className="font-bold text-sm">Indus AI Assistant</p>
            <p className="text-[10px] opacity-80">Always ready to help 🏔️</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/20 rounded p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-muted text-foreground rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-accent" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 items-center">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about tours, destinations..."
            className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-2 ring-primary/30"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-50 hover:scale-105 transition-transform"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
