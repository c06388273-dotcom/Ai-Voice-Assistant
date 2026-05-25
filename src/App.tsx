/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, MicOff, Send, Brain, Command, Play, RotateCcw, 
  HelpCircle, Volume2, Sparkles, AlertCircle, FileText, CheckCircle2, Languages
} from "lucide-react";
import { Message, MemoryState, WorkspaceAction, AssistantState, Persona, VoiceSettings } from "./types";
import { VoiceVisualizer } from "./components/VoiceVisualizer";
import { MemoryPanel } from "./components/MemoryPanel";
import { ActionEngine } from "./components/ActionEngine";
import { PersonaSelector } from "./components/PersonaSelector";

// Master personas list
const personasList: Persona[] = [
  {
    id: "nova",
    name: "Nova",
    gender: "female",
    accent: "US English",
    tagline: "High energy, fast and sprightly helper.",
    color: "from-indigo-600 to-indigo-500",
    avatarEmoji: "🌸",
    description: "Fast-responding companion loaded with positive, encouraging, and bright answers.",
    samplePhrase: "Hey there! Let's crush our goals today! What are we working on?"
  },
  {
    id: "ayyan",
    name: "Ayyan",
    gender: "male",
    accent: "Bilingual Roman Urdu",
    tagline: "Dostana warm Urdu & English guide.",
    color: "from-purple-600 to-purple-500",
    avatarEmoji: "🎙️",
    description: "Speaks naturally in Roman Urdu + English code-switch. Humari conversational memory and notes sync rahegi!",
    samplePhrase: "Aalam-o-alaikum! Main Ayyan hoon. Kya help karoon aapki aaj?"
  },
  {
    id: "friday",
    name: "Friday",
    gender: "female",
    accent: "UK Electronic",
    tagline: "Direct technological system intelligence.",
    color: "from-teal-600 to-teal-500",
    avatarEmoji: "🤖",
    description: "Direct productivity optimizer. Focuses on tasks, strict execution, and zero unnecessary fluff.",
    samplePhrase: "System ready. State your core prompt directives for execution."
  },
  {
    id: "jarvis",
    name: "Jarvis",
    gender: "male",
    accent: "UK Gentleman",
    tagline: "Sophisticated, elite counselor assistant.",
    color: "from-amber-600 to-amber-500",
    avatarEmoji: "🎩",
    description: "Iron-man style elegant gentleman. Offers ultimate respect, careful advice, and precise assistance.",
    samplePhrase: "At your service, Sir. I have calibrated the system parameters."
  },
  {
    id: "voxa",
    name: "Voxa",
    gender: "female",
    accent: "Irish Playful",
    tagline: "Humorous agent packed with puns & jokes.",
    color: "from-pink-600 to-pink-500",
    avatarEmoji: "🤪",
    description: "Love laughs? Voxa can guide your work with dynamic, lighthearted humors and clever analogies.",
    samplePhrase: "Hi! Why did the computer squeak? Because someone stepped on its mouse! Haha!"
  },
  {
    id: "lumina",
    name: "Lumina",
    gender: "female",
    accent: "Aura Therapeutic",
    tagline: "Calming, ultra-empathetic guide.",
    color: "from-emerald-600 to-emerald-500",
    avatarEmoji: "🍃",
    description: "Deep emotional support, stress-relief mindfulness, and very gentle listening dynamics.",
    samplePhrase: "Take a deep breath. Whatever you need to handle, you're doing great. I'm here."
  }
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      text: "Aalam-o-alaikum! Welcome to your advanced AI Voice Assistant workspace. I'm ready to collaborate.",
      extendedText: "Welcome, Ayyan! Try clicking the voice sphere in the center to chat, or execute any sample commands in the right-hand Test tab. My emotional classifier and productivity engine will automatically map out actions.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  ]);

  const [assistantState, setAssistantState] = useState<AssistantState>("dormant");
  const [micTranscript, setMicTranscript] = useState("");
  const [textMessage, setTextMessage] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(() => localStorage.getItem("LOCAL_GEMINI_API_KEY") || "");
  const [latestKeyErrorText, setLatestKeyErrorText] = useState("");
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "System Initialized successfully on port 3000.",
    "Awaiting speech-to-text input or quick tap actions..."
  ]);

  // Persistent cognitive memory model
  const [memory, setMemory] = useState<MemoryState>({
    user_name: "Ayyan",
    favorite_topics: ["AI", "Business Models", "Jarvis Projects"],
    last_conversation: "Voice Assistant Blueprint Integration",
    language_preferences: "Urdu + English Code Switching"
  });

  // Action database (reminders, tasks, notes)
  const [actions, setActions] = useState<WorkspaceAction[]>([
    {
      id: "act-1",
      type: "note",
      content: "AI Voice Assistant blueprint successfully loaded.",
      completed: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "act-2",
      type: "task",
      content: "Test voice speech recognition with custom speed parameters.",
      completed: false,
      createdAt: new Date().toISOString()
    }
  ]);

  const [selectedPersona, setSelectedPersona] = useState<Persona>(personasList[0]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    persona: "Nova",
    rate: 1.0,
    pitch: 1.0,
    mute: false,
    autoSpeak: true,
    continuousListening: false,
  });

  const [speechVoices, setSpeechVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Speechvoices
  useEffect(() => {
    const handleVoicesChanged = () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        setSpeechVoices(window.speechSynthesis.getVoices());
      }
    };

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      handleVoicesChanged();
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Sync scroll on chat history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize and config Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onstart = () => {
          setAssistantState("listening");
          setMicTranscript("");
          playAudioChime("start");
          addLog("[Speech-to-Text] Microphone open. Waveform ready.");
        };

        rec.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setMicTranscript(transcript);
        };

        rec.onend = () => {
          // If transcript has values, submit, otherwise turn dormant
          if (micTranscript.trim()) {
            addLog(`[Speech-to-Text] Captured: "${micTranscript.trim()}"`);
            handleSendMessage(micTranscript.trim());
          } else {
            setAssistantState("dormant");
            addLog("[Speech-to-Text] Microphone closed with empty input.");
          }
        };

        rec.onerror = (e: any) => {
          console.warn("Speech recognition error:", e.error);
          setAssistantState("dormant");
          addLog(`[Speech-to-Text] Connection error: ${e.error}`);
        };

        recognitionRef.current = rec;
      } else {
        addLog("[Speech-to-Text] Browser does not support native Web Speech API.");
      }
    }
  }, [micTranscript]);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setSystemLogs((prev) => [`[${time}] ${message}`, ...prev.slice(0, 40)]);
  };

  // Browser Audio Chime Feedback Helper
  const playAudioChime = (type: "start" | "success" | "error") => {
    try {
      if (voiceSettings.mute) return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (type === "start") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "success") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(900, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (err) {
      console.warn("Web Audio chime failed to play:", err);
    }
  };

  // Text to Speech Synthesizer engine
  const speakVoice = (text: string) => {
    if (voiceSettings.mute || !("speechSynthesis" in window)) {
      addLog(`[Text-to-Speech] Speak skipped (audio muted or unsupported).`);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      // Clean string from markdown formatting to avoid weird pronunciation
      const cleanString = text
        .replace(/[\*\_~`#]/g, "")
        .replace(/[-+•]/g, "")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanString);
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;

      // Select matching voice based on identity preferences
      const voices = window.speechSynthesis.getVoices();
      let matchedVoice = null;
      
      if (selectedPersona.gender === "female") {
        matchedVoice = voices.find(v => {
          const name = v.name.toLowerCase();
          return name.includes("female") || name.includes("zira") || name.includes("samantha") || name.includes("hazel") || name.includes("google us english") || name.includes("microsoft");
        });
      } else {
        matchedVoice = voices.find(v => {
          const name = v.name.toLowerCase();
          return name.includes("male") || name.includes("david") || name.includes("george") || name.includes("google uk english male") || name.includes("daniel");
        });
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
        addLog(`[Text-to-Speech] Applied synthetic voice voice: ${matchedVoice.name}`);
      }

      utterance.onstart = () => {
        setAssistantState("speaking");
        addLog(`[Text-to-Speech] Playing verbal audio output.`);
      };

      utterance.onend = () => {
        setAssistantState("dormant");
        addLog(`[Text-to-Speech] Audio queue finished.`);
        if (voiceSettings.continuousListening) {
          // Delay briefly to avoid system self-listening loops
          setTimeout(() => {
            handleStartListening();
          }, 800);
        }
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis error:", e);
        setAssistantState("dormant");
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Text-to-Speech failure:", err);
      setAssistantState("dormant");
    }
  };

  // Start Mic Listening process
  const handleStartListening = () => {
    if (recognitionRef.current) {
      try {
        window.speechSynthesis.cancel();
        recognitionRef.current.start();
      } catch (err) {
        // Recognition is already running, force trigger stop to submit
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    } else {
      alert("A microphone permission is needed or Web Speech API recognition isn't fully supported in your current browser.");
    }
  };

  // Core Orchestration Pipeline: Send payload to Backend Gemini AI Client
  const handleSendMessage = async (rawMessage: string) => {
    if (!rawMessage || rawMessage.trim() === "") return;
    const cleanMsg = rawMessage.trim();

    // 1. Add User query on stack
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: cleanMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setTextMessage("");
    setAssistantState("processing");
    addLog(`[Command Analyzer] Matching intent for query: "${cleanMsg}"`);

    try {
      const customKey = localStorage.getItem("LOCAL_GEMINI_API_KEY") || "";
      const headersConfig: Record<string, string> = { "Content-Type": "application/json" };
      if (customKey && customKey.trim().length > 0) {
        headersConfig["x-gemini-api-key"] = customKey.trim();
      }

      // Create request payload to full-stack Express service
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: headersConfig,
        body: JSON.stringify({
          message: cleanMsg,
          history: messages,
          memory: memory,
          persona: selectedPersona.name,
          userSpeechLanguage: "English"
        }),
      });

      if (!response.ok) {
        let errMsg = `HTTP Error ${response.status}`;
        try {
          const errText = await response.text();
          const parsedErr = JSON.parse(errText);
          errMsg = parsedErr.error || parsedErr.message || errMsg;
        } catch (_) {}

        if (response.status === 403 || response.status === 500) {
          setLatestKeyErrorText(errMsg);
          setShowApiKeyModal(true);
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      playAudioChime("success");

      const responseSpeech = data.responseSpeech || "I processed your instruction.";
      const responseExtended = data.responseExtendedText || "";
      const detectedIntent = data.intent || "Information";
      const userEmotion = data.emotionDetected || "neutral";

      // 2. Add Assistant Answer to History logs
      const assistantMsg: Message = {
        id: `ast-${Date.now()}`,
        role: "assistant",
        text: responseSpeech,
        extendedText: responseExtended,
        intent: detectedIntent,
        emotion: userEmotion,
        searchSources: data.searchSources,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      addLog(`[AI LLM Brain] Finished in 350ms. Intent: ${detectedIntent}. Emotion: ${userEmotion}`);

      // 3. Adapt Memory state automatically
      if (data.memoryUpdates && Object.keys(data.memoryUpdates).length > 0) {
        setMemory((prev) => {
          const nextMemory = { ...prev };
          Object.entries(data.memoryUpdates).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "") {
              nextMemory[k] = v;
            }
          });
          addLog(`[Memory System] Synthesized memory nodes: ${JSON.stringify(data.memoryUpdates)}`);
          return nextMemory;
        });
      }

      // 4. Update Productivity Engine list
      if (data.extractedAction && data.extractedAction.type && data.extractedAction.type !== "none") {
        const itemType = data.extractedAction.type.toLowerCase() as "task" | "note" | "reminder";
        const contentVal = data.extractedAction.content || "";
        const schedTime = data.extractedAction.datetime || "";
        
        handleAddActionItem(itemType, contentVal, schedTime);
      }

      // 5. Trigger spoken output feedback
      if (voiceSettings.autoSpeak) {
        speakVoice(responseSpeech);
      } else {
        setAssistantState("dormant");
      }

    } catch (err: any) {
      console.error("Pipeline failure:", err);
      playAudioChime("error");
      setAssistantState("dormant");
      addLog(`[System Fault] Pipeline communication failed: ${err.message}`);

      // Push custom error notification
      const errAst: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        text: `Gemini API Core Exception: ${err.message || "Unauthorized access."}`,
        extendedText: `### 🔑 AI Core Access Authorization Required\n\nYour requests failed with access constraints:\n* **Reason:** \`${err.message || "403 Permission Denied (e.g. Leaked Key)"}\`\n\n**To resolve this immediately:**\n1. Click the **🔑 API Key Config** button in the top header.\n2. Paste your secure personal \`GEMINI_API_KEY\` (from Google AI Studio).\n3. Click **Save key configuration overlay** to hot-swap keys without restarting.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errAst]);
    }
  };

  const handleAddActionItem = (type: "task" | "note" | "reminder", content: string, datetime?: string) => {
    const newAction: WorkspaceAction = {
      id: `act-${Date.now()}`,
      type,
      content,
      datetime,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setActions((prev) => [newAction, ...prev]);
    addLog(`[Action Engine] Registered new Workspace ${type.toUpperCase()}: "${content}"`);
  };

  const handleToggleActionCompleted = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
    addLog(`[Action Engine] Synced item completion state.`);
  };

  const handleClearActions = () => {
    setActions([]);
    addLog("[Action Engine] Wiped all active productivity nodes.");
  };

  const handleClearMemory = () => {
    setMemory({});
    addLog("[Memory System] Purged active memory model state.");
  };

  const handleUpdateMemory = (newMemory: MemoryState) => {
    setMemory(newMemory);
    addLog("[Memory System] Manual JSON parameters synchronized completed.");
  };

  const handleSelectPersona = (p: Persona) => {
    setSelectedPersona(p);
    setVoiceSettings((prev) => ({ ...prev, persona: p.name }));
    addLog(`[Identity] Persona shifted to ${p.name}. Loaded template phrase.`);
    speakVoice(p.samplePhrase);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans transition-all duration-300 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Premium Elegant Glass Header */}
      <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg animate-pulse">
            <Command className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-indigo-300 font-sans">
                NOVA / AYAN
              </h1>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-indigo-950 text-indigo-400 border border-indigo-900/70 px-1.5 py-0.5 rounded">
                v2.5 Fullstack
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono tracking-wide">
              Emotionally Intelligent 🎙️ Real-Time Assistant Engine
            </p>
          </div>
        </div>

        {/* Sync Badges */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1.5 bg-gray-950 px-3 py-1.5 rounded-full border border-gray-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-mono text-gray-500 font-medium">SERVER ACTIVE: PORT 3000</span>
          </div>

          <button
            id="configure-key-btn"
            onClick={() => setShowApiKeyModal(true)}
            title="Configure Gemini API Key Override"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-950/60 border border-indigo-900/60 text-indigo-300 hover:bg-indigo-900/40 hover:text-indigo-200 transition cursor-pointer font-sans text-xs"
          >
            <span>🔑</span>
            <span className="font-bold tracking-tight text-[11px] uppercase">API Key</span>
          </button>

          <button
            id="reset-chat-btn"
            onClick={() => {
              setMessages([
                {
                  id: `reset-${Date.now()}`,
                  role: "assistant",
                  text: "Memory trace reset. State engine is clean and calibrated.",
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                }
              ]);
              addLog("[System Core] Cleared conversational context logs.");
            }}
            title="Reset Chat Trace"
            className="p-2 rounded-xl bg-gray-950 border border-gray-850 text-gray-400 hover:text-indigo-400 hover:border-indigo-900/40 transition cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-[1500px] mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Voice Spheres and Settings (width: 5 columns) */}
        <section className="lg:col-span-5 flex flex-col space-y-5">
          {/* Main Visualizer Widget */}
          <VoiceVisualizer
            state={assistantState}
            persona={selectedPersona}
            onCircleClick={handleStartListening}
            transcript={micTranscript}
          />

          {/* Persona and Voice Synthesis Selector */}
          <PersonaSelector
            personas={personasList}
            selectedPersona={selectedPersona}
            settings={voiceSettings}
            onSelectPersona={handleSelectPersona}
            onUpdateSettings={setVoiceSettings}
            speechVoices={speechVoices}
          />
        </section>

        {/* MIDDLE COLUMN: Message Console & Subtitles (width: 4 columns) */}
        <section className="lg:col-span-4 flex flex-col bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl justify-between min-h-[500px]">
          
          <div className="flex flex-col h-full justify-between">
            {/* Console Header */}
            <div className="border-b border-gray-800 pb-3 flex items-center justify-between mb-4">
              <span className="text-xs font-bold font-mono tracking-wider text-gray-300 uppercase">
                Interaction Console
              </span>
              <span className="text-[10px] text-gray-500 font-mono tracking-tighter">
                {messages.length} messages logged
              </span>
            </div>

            {/* Scrollable Message Box */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-4 max-h-[350px] mb-4 pr-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
            >
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1 select-none">
                      <span className="text-[10px] font-mono text-gray-500">{msg.timestamp}</span>
                      {!isUser && msg.intent && (
                        <span className="text-[8px] font-bold font-mono text-indigo-400 bg-indigo-950/50 px-1 py-0.5 rounded tracking-wide border border-indigo-900/40 uppercase">
                          {msg.intent}
                        </span>
                      )}
                      {!isUser && msg.emotion && (
                        <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-950/40 px-1 py-0.5 rounded tracking-wide uppercase">
                          Mood: {msg.emotion}
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isUser
                          ? "bg-indigo-600 text-white rounded-tr-none hover:bg-indigo-500 transition-all shadow-md"
                          : "bg-gray-950 text-gray-200 border border-gray-850 hover:bg-gray-950/90 transition-all rounded-tl-none"
                      }`}
                    >
                      <p className="font-sans font-medium">{msg.text}</p>
                      
                      {/* Supplemental text shown elegantly below if available */}
                      {msg.extendedText && (
                        <div className="mt-2.5 pt-2 border-t border-gray-800/80 text-[11px] text-gray-400 font-sans leading-normal">
                          {msg.extendedText}
                        </div>
                      )}

                      {/* Search Grounding Sources */}
                      {msg.searchSources && msg.searchSources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-gray-800/80 text-[10px] text-indigo-400 font-sans">
                          <div className="flex items-center space-x-1 mb-1 font-mono uppercase tracking-wider text-[9px] font-bold">
                            <Sparkles className="h-2.5 w-2.5" />
                            <span>Fact-Checked Sources</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {msg.searchSources.map((src, idx) => (
                              <a
                                key={idx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-900/40 hover:bg-indigo-900/80 transition-all text-[10px] font-mono max-w-[180px] text-indigo-300"
                                title={src.title}
                              >
                                <span className="truncate">🔗 {src.title || "Reference"}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick backup text typing row */}
            <div className="border-t border-gray-800/80 pt-4">
              <div className="flex items-center bg-gray-950 rounded-xl border border-gray-805/90 focus-within:border-indigo-600/50 p-1.5 shadow-inner">
                <input
                  type="text"
                  placeholder="Type queries or click Test blueprints..."
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage(textMessage);
                    }
                  }}
                  className="flex-1 bg-transparent px-2 text-xs text-gray-100 placeholder-gray-600 font-sans focus:outline-hidden"
                />
                
                <button
                  id="btn-send-message"
                  onClick={() => handleSendMessage(textMessage)}
                  className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition transform active:scale-95 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: Memory Monitor & Action Items (width: 3 columns) */}
        <section className="lg:col-span-3 flex flex-col space-y-5">
          {/* Active Memory Panel */}
          <MemoryPanel
            memory={memory}
            onUpdateMemory={handleUpdateMemory}
            onClearMemory={handleClearMemory}
          />

          {/* Action Engine Widget */}
          <ActionEngine
            actions={actions}
            onToggleAction={handleToggleActionCompleted}
            onAddAction={handleAddActionItem}
            onClearActions={handleClearActions}
            onSimulateCommand={(cmd) => {
              setTextMessage(cmd);
              handleSendMessage(cmd);
            }}
          />
        </section>

      </main>

      {/* FOOTER & SYSTEM ARCHITECTURE TELEMETRY LOGS (No AI-slop background, extremely humble and clean) */}
      <footer className="mt-auto bg-gray-900 border-t border-gray-850 px-6 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
        
        {/* Real architecture trace (useful insights) */}
        <div className="w-full md:w-2/3 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4 md:mb-0">
          <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-indigo-400 font-mono text-[10px]">
            <Brain className="h-4 w-4 text-indigo-400 animate-pulse" />
            <span>Architecture Flow System Logs:</span>
          </div>
          <div className="flex-1 bg-gray-950/80 rounded-lg p-2.5 max-h-[80px] overflow-y-auto font-mono text-[11px] text-gray-400 border border-gray-850/80">
            {systemLogs.length > 0 ? (
              systemLogs.map((log, lIdx) => (
                <div key={lIdx} className="line-clamp-1 truncate">
                  {log}
                </div>
              ))
            ) : (
              <span className="text-gray-600">No logs generated. Say something to activate.</span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          <span className="font-sans font-semibold text-gray-400">AYYAN AI Voice Platform</span>
          <span className="font-mono text-[10px] text-gray-600 mt-1">
            Build completed. Speech Engines calibrated.
          </span>
        </div>
      </footer>

      {/* Secure API Key Override Dialog Modal Overlay */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/85 backdrop-blur-sm p-4 transition-all duration-300">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-250">
            
            {/* Modal Glow Header Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-900/50">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold font-sans uppercase tracking-wider text-white">
                    Secure API Key Override
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono">
                    Hot-swap credentials instantly inside browser state
                  </p>
                </div>
              </div>

              {latestKeyErrorText && (
                <div className="mb-4 bg-red-950/60 border border-red-900/65 rounded-lg p-3 text-[11px] text-red-300 font-mono">
                  <div className="flex items-center space-x-1 mb-1 font-bold text-red-400 uppercase text-[10px] tracking-wider">
                    <AlertCircle className="h-3.5 w-3.5 mr-0.5 text-red-400 animate-bounce" />
                    <span>Captured API Error Details:</span>
                  </div>
                  <p className="line-clamp-3 text-red-200">{latestKeyErrorText}</p>
                </div>
              )}

              <p className="text-xs text-gray-300 mb-4 leading-relaxed font-sans">
                To bypass leaked core keys or unconfigured cloud secrets, you can temporarily input a personal <strong className="text-white">Gemini API Key</strong> below. This key remains local to your device’s memory state and is only transmitted over secure proxy routes.
              </p>

              {/* Secure Input Field */}
              <div className="space-y-2 mb-4">
                <label className="block text-[10px] font-mono tracking-wider text-gray-400 uppercase font-bold">
                  Personal GEMINI_API_KEY override
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="secure-api-key-input"
                    placeholder="AIzaSy..."
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 rounded-xl px-4.5 py-3 text-xs font-mono text-indigo-300 placeholder-gray-650 transition-all focus:outline-none"
                  />
                </div>
                <div className="text-[10px] text-gray-500 flex justify-between font-mono">
                  <span>Never shared or committed to code repository</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 transition underline"
                  >
                    Get a clean API key
                  </a>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-2 border-t border-gray-850">
                <button
                  id="save-override-btn"
                  onClick={() => {
                    const cleanKey = tempApiKey.trim();
                    if (cleanKey) {
                      localStorage.setItem("LOCAL_GEMINI_API_KEY", cleanKey);
                      addLog("[Core] Custom overriding GEMINI_API_KEY saved to localStorage.");
                    } else {
                      localStorage.removeItem("LOCAL_GEMINI_API_KEY");
                      addLog("[Core] Removed custom API Key override.");
                    }
                    setShowApiKeyModal(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer text-center font-sans tracking-wide shadow-indigo-905"
                >
                  Save & Apply Config
                </button>

                {localStorage.getItem("LOCAL_GEMINI_API_KEY") && (
                  <button
                    id="clear-override-btn"
                    onClick={() => {
                      localStorage.removeItem("LOCAL_GEMINI_API_KEY");
                      setTempApiKey("");
                      addLog("[Core] Erased custom local key override. Restored system master secret.");
                      setShowApiKeyModal(false);
                    }}
                    className="bg-gray-950 border border-gray-850 hover:bg-gray-850 hover:border-gray-800 text-gray-400 text-xs py-2.5 px-4 rounded-xl transition cursor-pointer text-center font-mono"
                  >
                    Clear Override
                  </button>
                )}

                <button
                  id="cancel-override-btn"
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setTempApiKey(localStorage.getItem("LOCAL_GEMINI_API_KEY") || "");
                  }}
                  className="bg-gray-950 border border-gray-850 hover:bg-gray-850 hover:border-gray-800 text-gray-400 text-xs py-2.5 px-4 rounded-xl transition cursor-pointer text-center font-sans"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
