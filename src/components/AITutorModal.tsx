import React, { useState, useRef, useEffect } from 'react';
import { Subject } from '../types';
import { 
  X, 
  Send, 
  Sparkles, 
  BrainCircuit, 
  User, 
  Loader2, 
  Lightbulb, 
  RotateCcw,
  Copy,
  Check,
  BookOpen
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialSubjectId?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  subjects,
  initialSubjectId,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || ''
  );
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your **AI StudyMate Socratic Academic Tutor**.\n\nAsk me any concept, homework question, formula derivation, or confusing lecture topic. I will break it down intuitively step-by-step!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialSubjectId) setSelectedSubjectId(initialSubjectId);
  }, [initialSubjectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const newMsgs: Message[] = [...messages, { role: 'user', content: textToSend.trim() }];
    setMessages(newMsgs);
    setInputQuery('');
    setIsLoading(true);

    try {
      const reply = await api.askAITutor({
        message: textToSend.trim(),
        currentSubject: selectedSubject ? `${selectedSubject.code}: ${selectedSubject.name}` : 'General Academic Subject',
        currentTopic: selectedSubject?.topics[0] || 'General',
        history: newMsgs.slice(0, -1).map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          content: m.content,
        })),
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Sorry, I encountered an error answering your question: ${err.message || 'Network error'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[650px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Socratic AI Study Tutor</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Gemini 3.7
                </span>
              </div>
              <p className="text-xs text-slate-500">Step-by-step conceptual guidance & homework helper</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => {
            const isAI = msg.role === 'assistant';

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 relative group ${
                    isAI
                      ? 'bg-slate-50 border border-slate-200 text-slate-800'
                      : 'bg-indigo-600 text-white rounded-br-none'
                  }`}
                >
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {isAI && (
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded border border-slate-200 shadow-2xs"
                      title="Copy response"
                    >
                      {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span>Thinking and structuring response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Inspiration Chips */}
        <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-semibold shrink-0">Try asking:</span>
          <button
            onClick={() => handleSendMessage(`Explain the core intuition of ${selectedSubject?.topics[0] || 'this topic'} with a simple metaphor.`)}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 shrink-0 transition-colors"
          >
            💡 Intuitive Metaphor
          </button>
          <button
            onClick={() => handleSendMessage(`Give me a step-by-step example problem and solution for ${selectedSubject?.topics[0] || 'the current chapter'}.`)}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 shrink-0 transition-colors"
          >
            📝 Step-by-Step Problem
          </button>
          <button
            onClick={() => handleSendMessage(`What are the top 3 common exam traps students make in ${selectedSubject?.name || 'this course'}?`)}
            className="px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg text-slate-700 shrink-0 transition-colors"
          >
            ⚠️ Common Exam Pitfalls
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder={`Ask a question about ${selectedSubject?.code || 'your course'}...`}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputQuery.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
