import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  X,
  Sparkles,
  MessageSquare,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { aiApi } from '../services/api';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Namaste! I am your A+ Plane Campus Assistant. How can I help you today? You can ask about bus routes, hostel rooms, academic subjects, lost & found, or lodge a grievance.',
      quickLinks: [
        { label: 'Raise Grievance', to: '/student/raise-grievance' },
        { label: 'Bus Routes', to: '/bus' },
        { label: 'Hostel Portal', to: '/hostel' },
        { label: 'Campus Safety', to: '/her-voice' },
      ],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Initialize SpeechRecognition if supported by browser
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError('');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow access.');
        } else if (event.error !== 'no-speech') {
          setSpeechError('Speech input could not be recognized. Please try typing.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError('Voice input is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechError('');
      try {
        recognitionRef.current.start();
      } catch {
        recognitionRef.current.stop();
      }
    }
  };

  const handleSend = async (textToSend) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    const userMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setSpeechError('');

    try {
      const response = await aiApi.chat(messageText);

      const assistantMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: response.reply || 'Here is what I found regarding your campus query.',
        quickLinks: response.quickLinks || [],
        targetPath: response.targetPath,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'assistant',
          text: 'I am currently unable to query live campus services. You can navigate directly using the links below.',
          quickLinks: [
            { label: 'Bus Transit', to: '/bus' },
            { label: 'Hostel Portal', to: '/hostel' },
            { label: 'Lost & Found', to: '/lost-found' },
            { label: 'Raise Grievance', to: '/student/raise-grievance' },
          ],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLink = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating launcher trigger */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open A+ Plane Campus Assistant"
            className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-brand-700 via-brand-600 to-sky-400 text-white shadow-xl shadow-brand-500/30 transition-all duration-300 hover:scale-105 hover:shadow-brand-500/50 focus:outline-none focus:ring-4 focus:ring-brand-300"
          >
            <Bot className="h-7 w-7 transition-transform group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
            </span>
          </button>
        )}
      </div>

      {/* Chat Window modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[580px] w-[90vw] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-brand-700 to-brand-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">Campus Assistant</h3>
                <p className="text-[11px] text-brand-100 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-emerald-300" /> Online · AI & Voice Powered
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex flex-col max-w-[85%]',
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                )}
              >
                <div
                  className={cn(
                    'rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm shadow-xs',
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs'
                  )}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Quick action buttons */}
                {msg.quickLinks && msg.quickLinks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.quickLinks.map((link, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickLink(link.to)}
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50/90 px-2.5 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
                      >
                        {link.label}
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}

                <span className="mt-1 text-[10px] text-slate-400 px-1">{msg.time}</span>
              </div>
            ))}

            {loading && (
              <div className="mr-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand-600" />
                Thinking & retrieving information…
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Voice indicator / error alert */}
          {speechError && (
            <div className="bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800 border-t border-amber-200">
              {speechError}
            </div>
          )}

          {isListening && (
            <div className="bg-red-50 px-3 py-1.5 text-[11px] text-red-700 border-t border-red-200 flex items-center justify-between animate-pulse">
              <span className="flex items-center gap-1.5 font-semibold">
                <Mic className="h-3.5 w-3.5 text-red-600" /> Listening to your microphone…
              </span>
              <button
                type="button"
                onClick={toggleListening}
                className="text-xs text-red-600 font-bold underline"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                'rounded-xl p-2 transition-colors',
                isListening
                  ? 'bg-red-600 text-white animate-bounce'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-brand-600'
              )}
              title={isListening ? 'Stop recording' : 'Speak your question'}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? 'Listening…' : 'Ask about bus, hostel, grievance…'}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-xl bg-brand-600 p-2 text-white transition-opacity disabled:opacity-40 hover:bg-brand-700"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
