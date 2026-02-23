import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";

interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
  time: string;
}

const QUICK_REPLIES = [
  "How to get PM-KISAN?",
  "My crop has a disease",
  "Marketplace help",
  "Weather advisory",
  "Contact field agent",
];

const BOT_RESPONSES: Record<string, string> = {
  "How to get PM-KISAN?": "To register for PM-KISAN:\n1. Visit pmkisan.gov.in\n2. Click 'New Farmer Registration'\n3. Enter your Aadhaar number\n4. Fill in land details\n5. Submit and track status.\n\nNeed help with any step?",
  "My crop has a disease": "I can help! Please:\n1. Go to the 'Scan' tab\n2. Take a photo of the affected leaf\n3. Our AI will diagnose the disease\n4. You'll get organic & chemical treatments\n\nWould you like me to guide you there?",
  "Marketplace help": "In the Marketplace you can:\n• List your produce with price\n• See fair price bands from nearby mandis\n• Chat or call buyers directly\n• Pay/receive via UPI (GPay, PhonePe)\n\nWhat would you like to do?",
  "Weather advisory": "Current weather data is shown on your Home screen. The AI advisory automatically adjusts recommendations based on:\n• Temperature & heat stress\n• Rain forecast\n• Wind speed\n\nCheck your weekly plan for detailed guidance!",
  "Contact field agent": "Your nearest field agent is:\n📞 Rajesh Kumar — Coimbatore District\nPhone: +91 98765 43210\n\nYou can also visit the nearest Krishi Vigyan Kendra (KVK) for in-person support.",
};

const DEFAULT_RESPONSE = "Thank you for your message! A support agent will respond shortly. In the meantime, try our quick options below for instant help.";

export function HelpdeskChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "வணக்கம்! Welcome to AgroConnect support. How can I help you today? Choose a quick option or type your question.",
      sender: "bot",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const addMessage = (text: string, sender: "user" | "bot") => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        text,
        sender,
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
      },
    ]);
  };

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    addMessage(msg, "user");
    setInput("");

    setTimeout(() => {
      const response = BOT_RESPONSES[msg] || DEFAULT_RESPONSE;
      addMessage(response, "bot");
    }, 800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-farm/15 border border-farm/30">
          <Bot size={18} className="text-farm" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">Help & Support</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-farm" />
            <p className="text-[10px] font-mono text-foreground-muted">Online — Instant replies</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} fade-in`}>
            <div className="flex items-end gap-2 max-w-[85%]">
              {msg.sender === "bot" && (
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 bg-farm/15">
                  <Bot size={12} className="text-farm" />
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.sender === "user"
                    ? "bg-farm text-primary-foreground rounded-br-sm"
                    : "bg-surface-elevated text-foreground border border-surface-border rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === "user" && (
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 bg-market/15">
                  <User size={12} className="text-market" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick replies */}
      <div className="flex gap-2 overflow-x-auto py-3 -mx-1 px-1 scrollbar-hide">
        {QUICK_REPLIES.map((qr) => (
          <button
            key={qr}
            onClick={() => handleSend(qr)}
            className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all bg-surface-elevated text-foreground border border-surface-border"
          >
            {qr}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-1">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3.5 rounded-2xl text-sm outline-none bg-surface-elevated border border-surface-border text-foreground"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all disabled:opacity-30 bg-farm text-primary-foreground"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
