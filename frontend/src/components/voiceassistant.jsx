import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Bot, Sparkles, Send, Volume2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader } from './ui/Card';
import Button from './ui/Button';
import { aiApi } from '../services/api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { cn } from '../utils/cn';

export default function VoiceAssistant() {
  useDocumentTitle('Campus Voice Assistant');

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your A+ Plane campus voice assistant. You can speak or type to check bus schedules, hostel vacancies, syllabus details, or student complaints.',
      quickLinks: [
        { label: 'Check Bus Routes', to: '/bus' },
        { label: 'Hostel Portal', to: '/hostel' },
        { label: 'Academic Syllabus', to: '/subjects' },
        { label: 'Campus Safety', to: '/her-voice' },
      ],
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speechError, setSpeechError] = useState('');

  const recognitionRef = useRef(null);
  const navigate = useNavigate();

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
          handleAsk(transcript);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in browser settings.');
        } else if (event.error !== 'no-speech') {
          setSpeechError('Could not process speech. Please type your query.');
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
      setSpeechError('Speech recognition is not supported in this browser. Please type in the box below.');
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

  const handleAsk = async (queryText) => {
    const text = (queryText || input).trim();
    if (!text || loading) return;

    const userMessage = { sender: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.chat(text);
      const assistantMessage = {
        sender: 'assistant',
        text: res.reply,
        quickLinks: res.quickLinks || [],
        targetPath: res.targetPath,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Read aloud if SpeechSynthesis is supported
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(res.reply);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I could not connect to campus AI services right now. Please explore your campus portal directly.',
          quickLinks: [
            { label: 'Bus Services', to: '/bus' },
            { label: 'Hostel Portal', to: '/hostel' },
            { label: 'My Complaints', to: '/student/complaints' },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Campus Voice & AI Assistant</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ask questions naturally with your microphone or type your request below.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Voice control Card */}
        <Card className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="relative">
            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                'flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition-all duration-300',
                isListening
                  ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200'
                  : 'bg-brand-600 text-white hover:bg-brand-700 hover:scale-105'
              )}
            >
              {isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
            </button>
            {isListening && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
              </span>
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isListening ? 'Listening…' : 'Tap to Speak'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {isListening
                ? 'Speak clearly into your microphone'
                : 'Supports English & campus queries'}
            </p>
          </div>

          {speechError && (
            <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800 border border-amber-200">
              {speechError}
            </p>
          )}

          <div className="w-full pt-4 border-t border-slate-100 text-left">
            <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Try saying:</p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li
                className="cursor-pointer hover:text-brand-600"
                onClick={() => handleAsk('What bus routes are running today?')}
              >
                • “What bus routes are running today?”
              </li>
              <li
                className="cursor-pointer hover:text-brand-600"
                onClick={() => handleAsk('How do I apply for a hostel room?')}
              >
                • “How do I apply for a hostel room?”
              </li>
              <li
                className="cursor-pointer hover:text-brand-600"
                onClick={() => handleAsk('How do I raise a grievance?')}
              >
                • “How do I raise a grievance?”
              </li>
              <li
                className="cursor-pointer hover:text-brand-600"
                onClick={() => handleAsk('I lost my student ID card')}
              >
                • “I lost my student ID card”
              </li>
            </ul>
          </div>
        </Card>

        {/* Conversation transcript Card */}
        <Card className="flex flex-col justify-between md:col-span-2 min-h-[460px] p-6">
          <CardHeader
            title="Assistant Conversation"
            description="Live interactive Q&A powered by campus services"
          />

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[360px] pr-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex flex-col max-w-[85%]',
                  m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                )}
              >
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    m.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-br-xs'
                      : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                  )}
                >
                  {m.text}
                </div>

                {m.quickLinks && m.quickLinks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {m.quickLinks.map((ql, qlIdx) => (
                      <button
                        key={qlIdx}
                        type="button"
                        onClick={() => navigate(ql.to)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
                      >
                        {ql.label} <ArrowRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="mr-auto rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-500">
                Processing campus query…
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question here…"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Button type="submit" disabled={!input.trim() || loading} icon={Send}>
              Send
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
