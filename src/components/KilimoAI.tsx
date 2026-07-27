import React, { useState, useRef, useEffect } from "react";
import { BrainCircuit, Send, Loader2, Sparkles, MessageSquare, Sprout, CheckCircle, ShieldAlert } from "lucide-react";

interface AIMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  createdAt: number;
}

// Simple custom Swahili formatter for basic markdown elements (bold, bullet points, numbered lists)
function SwahiliResponseFormatter({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2.5">
      {lines.map((line, idx) => {
        let cleanLine = line.trim();
        
        if (!cleanLine) {
          return <div key={idx} className="h-1.5" />;
        }

        // Check if list item
        if (cleanLine.startsWith("* ") || cleanLine.startsWith("- ")) {
          const content = cleanLine.substring(2);
          return (
            <li key={idx} className="list-disc ml-5 pl-1 text-slate-800 leading-relaxed text-xs">
              {renderBoldText(content)}
            </li>
          );
        }

        // Check if numbered list item
        if (/^\d+\.\s/.test(cleanLine)) {
          const content = cleanLine.replace(/^\d+\.\s/, "");
          const match = cleanLine.match(/^(\d+)\.\s/);
          const num = match ? match[1] : "1";
          return (
            <div key={idx} className="flex items-start space-x-2 text-xs text-slate-800 leading-relaxed pl-1">
              <span className="font-bold text-emerald-700 font-mono">{num}.</span>
              <span className="flex-1">{renderBoldText(content)}</span>
            </div>
          );
        }

        // Check if heading (starts with ### or ## or #)
        if (cleanLine.startsWith("#")) {
          const level = cleanLine.match(/^#+/)?.[0].length || 1;
          const content = cleanLine.replace(/^#+\s*/, "");
          const headingSize = level === 1 ? "text-base font-bold" : level === 2 ? "text-sm font-bold" : "text-xs font-bold";
          return (
            <h4 key={idx} className={`font-display text-emerald-900 pt-3 pb-1 ${headingSize}`}>
              {content}
            </h4>
          );
        }

        return (
          <p key={idx} className="text-xs text-slate-700 leading-relaxed">
            {renderBoldText(cleanLine)}
          </p>
        );
      })}
    </div>
  );
}

// Helper to parse double asterisks for bolding
function renderBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-extrabold text-slate-900 bg-amber-100/50 px-1 rounded">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

const PRESET_QUESTIONS = [
  {
    icon: "🍅",
    label: "Magonjwa ya Nyanya",
    prompt: "Naomba ushauri jinsi ya kutambua na kuzuia ugonjwa wa tunda kuoza chini (Blossom End Rot) au mnyauko kwenye nyanya na dawa gani za kutumia."
  },
  {
    icon: "🌽",
    label: "Kuzuia Wadudu wa Mahindi",
    prompt: "Mahindi yangu yanashambuliwa na viwavi jeshi (Fall Armyworm). Ni dawa gani bora na ya asili au ya kemikali ninayoweza kutumia kuzuia?"
  },
  {
    icon: "💧",
    label: "Muda bora wa kupanda",
    prompt: "Ni muda gani na msimu upi bora wa kupanda mpunga na mahindi kulingana na mabadiliko ya tabia nchi kwa mikoa ya nyanda za juu kusini na kati?"
  },
  {
    icon: "📈",
    label: "Bei za Mazao Sokoni",
    prompt: "Je, una ushauri gani kuhusu mwenendo wa bei za mazao kama maharagwe, mtama na korosho sokoni na mbinu gani mkulima anaweza kutumia kupata bei nzuri?"
  }
];

export default function KilimoAI() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "ai-welcome",
      sender: "ai",
      text: "Habari ya majukumu mkulima wa Afrika! Mimi ni **Mshauri wako wa Kilimo Tech** kutoka Kilimo Tech Africa.\n\nUnaweza kuniuliza maswali yoyote kuhusu:\n* Kupambana na wadudu na magonjwa ya mazao.\n* Uchaguzi wa mbegu bora na mbolea.\n* Ratiba bora ya kilimo kulingana na msimu.\n* Mbinu za kuongeza mavuno na kufikia soko la uhakika.\n\n_Niambie, unalima zao gani leo au una changamoto gani shambani kwako?_",
      createdAt: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setApiError("");
    const userPrompt = textToSend.trim();
    setInput("");

    // Append user message
    const userMsg: AIMessage = {
      id: "user-" + Date.now(),
      sender: "user",
      text: userPrompt,
      createdAt: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Hitilafu imetokea kwenye mfumo wa AI");
      }

      // Append AI message
      const aiMsg: AIMessage = {
        id: "ai-" + Date.now(),
        sender: "ai",
        text: data.text || "Samahani, sijapata jibu sahihi. Tafadhali jaribu tena baada ya muda kidogo.",
        createdAt: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (err: any) {
      console.error("AI Assistant Error:", err);
      setApiError(err.message || "Tafadhali kagua ikiwa GEMINI_API_KEY imewekwa vizuri kwenye Secrets.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="kilimo-ai-section" className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
      
      {/* Quick Suggestions Column (Left 4 cols) - Hidden on mobile */}
      <div className="hidden md:flex md:col-span-4 bg-white border-2 border-emerald-100 rounded-[2rem] p-6 flex-col space-y-4 shadow-md shadow-emerald-100/10 h-full overflow-y-auto">
        <div>
          <div className="flex items-center space-x-2 text-emerald-900">
            <BrainCircuit className="h-5 w-5 text-orange-500" />
            <h3 className="font-sans font-black text-sm">Maswali ya Haraka</h3>
          </div>
          <p className="text-[11px] text-emerald-800/70 mt-0.5 font-bold">Bonyeza kuuliza mshauri wa AI papo hapo</p>
        </div>

        <div className="space-y-3 flex-1">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.prompt)}
              disabled={isLoading}
              className="w-full text-left p-3.5 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-200 border-2 border-emerald-100/50 rounded-2xl transition-all duration-200 disabled:opacity-50 group flex items-start space-x-2.5 active:scale-98"
            >
              <span className="text-lg bg-white p-1 rounded-xl border border-emerald-100/70 shadow-sm">{q.icon}</span>
              <div className="flex-1">
                <span className="text-xs font-black text-emerald-950 block group-hover:text-emerald-800 transition-colors">{q.label}</span>
                <span className="text-[10px] text-emerald-800/80 font-semibold line-clamp-2 mt-0.5">{q.prompt}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="p-3.5 bg-orange-50 rounded-2xl border-2 border-orange-100 flex items-start space-x-2 text-[10px] text-orange-950 font-semibold">
          <Sparkles className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>AI Advisor</strong> inajifunza kutoka kwa vitabu vya kilimo vya Afrika Mashariki ili kukupa ushauri sahihi.
          </span>
        </div>
      </div>

      {/* Main Chat Feed (Right 8 cols) */}
      <div className="col-span-12 md:col-span-8 bg-white border-2 border-emerald-100 rounded-[2rem] flex flex-col h-full shadow-md shadow-emerald-100/10 overflow-hidden">
        
        {/* Advisor Header */}
        <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-500">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500 rounded-xl">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-sans font-black text-sm">Mshauri wa AI (Kilimo Tech)</h3>
              <p className="text-[11px] text-emerald-100 font-bold flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-400 mr-1.5 animate-pulse"></span>
                Inatumia Gemini 3.5 Flash — Kiswahili
              </p>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-emerald-50/15">
          
          {apiError && (
            <div className="p-4 bg-orange-50 text-orange-950 border-2 border-orange-100 rounded-2xl text-xs space-y-1">
              <div className="flex items-center space-x-2 font-black text-orange-600">
                <ShieldAlert className="h-4 w-4" />
                <span>Hitilafu Imegundulika</span>
              </div>
              <p>{apiError}</p>
              <p className="text-[10px] text-orange-800/80 italic font-bold">Hakikisha umeingiza Gemini API Key yako kwenye siri za AI Studio kisha uwashe dev server upya.</p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex space-x-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse space-x-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm shadow-sm ${
                  isMe ? "bg-orange-500 text-white font-black" : "bg-emerald-850 text-white"
                }`}>
                  {isMe ? "W" : <BrainCircuit className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl shadow-sm ${
                  isMe
                    ? "bg-orange-500 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border-2 border-emerald-100 rounded-tl-none"
                }`}>
                  <SwahiliResponseFormatter text={msg.text} />
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex space-x-3 max-w-[85%] mr-auto items-center">
              <div className="h-8 w-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
                <BrainCircuit className="h-4 w-4" />
              </div>
              <div className="bg-white text-emerald-950 border-2 border-emerald-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-2 text-xs font-bold">
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                <span>Mshauri anaandika ushauri wa kilimo...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="p-4 border-t-2 border-emerald-100 bg-white flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Uliza chochote mfano: Ni dawa gani inazuia kutu ya majani kwenye maharagwe?"
            className="flex-1 px-4 py-3.5 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-emerald-950 font-bold transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-emerald-100 text-white disabled:text-emerald-300 rounded-2xl transition-colors active:scale-95 shadow"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
