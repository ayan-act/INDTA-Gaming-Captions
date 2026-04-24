/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Gamepad2, 
  Flame, 
  Copy, 
  Check, 
  RotateCw, 
  RotateCcw,
  Share2, 
  Youtube,
  Twitter, 
  Facebook, 
  Instagram,
  Terminal,
  Trophy,
  Sparkles,
  HelpCircle,
  Zap,
  BookOpen,
  Info,
  ListChecks,
  ChevronDown,
  Mail,
  Send,
  User,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast, { Toaster } from 'react-hot-toast';
import { AboutUs } from "./components/AboutUs";
import { ContactForm } from "./components/ContactForm";

const GAMES = ["Free Fire", "BGMI", "PUBG", "Valorant", "Minecraft", "GTA V", "Call of Duty"];
const MOODS = [
  { id: "funny", label: "Funny", emoji: "😂" },
  { id: "attitude", label: "Attitude", emoji: "🔥" },
  { id: "pro", label: "Pro", emoji: "🎯" },
  { id: "savage", label: "Savage", emoji: "😈" },
  { id: "emotional", label: "Emotional", emoji: "🥺" },
];
const PLATFORMS = [
  { id: "Instagram", icon: Instagram },
  { id: "YouTube", icon: Youtube },
  { id: "Facebook", icon: Facebook },
];
const LANGUAGES = ["Hinglish", "Bengali", "Hindi", "English"];

export default function App() {
  const [game, setGame] = useState(GAMES[0]);
  const [mood, setMood] = useState(MOODS[1].id);
  const [platform, setPlatform] = useState(PLATFORMS[0].id);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [description, setDescription] = useState("");
  const [currentView, setCurrentView] = useState<"generator" | "contact">("generator");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "contact") {
      setCurrentView("contact");
    }
  }, []);
  const [result, setResult] = useState<{
    shortCaptions: string[];
    longCaption: string;
    hashtags: string;
  } | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setContactStatus('success');
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => setContactStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to send message. Please try again later.");
      setContactStatus('idle');
    }
  };

  const resetGenerator = () => {
    setGame(GAMES[0]);
    setMood(MOODS[1].id);
    setPlatform(PLATFORMS[0].id);
    setLanguage(LANGUAGES[0]);
    setDescription("");
    setResult(null);
  };

  const generateCaptions = async () => {
    setLoading(true);
    setResult(null);

    try {
      const selectedMood = MOODS.find(m => m.id === mood)?.label || mood;

      const prompt = `
You are an expert social media gaming content writer.
Task: Generate HIGH-ENGAGEMENT captions and hashtags for a gaming post.

Game: ${game}
Mood: ${selectedMood}
Platform: ${platform}
${description ? `Context about the post: ${description}` : ""}

Requirements:
1. 3 short captions (max 10 words each).
2. 1 long caption: Must be a short, engaging STORYTELLING style (4-6 lines). Use a strong hook at the start, very short sentences, and a clear call-to-action (CTA) at the end. Avoid long paragraphs.
3. Exactly 8 to 10 high-quality, relevant, and trending hashtags (total count MUST be between 8 and 10).

Language: ${language}.
Tone: Energetic, Gen-Z friendly.

IMPORTANT: You MUST respond ONLY with a JSON object in the following format:
{
  "shortCaptions": ["string", "string", "string"],
  "longCaption": "string",
  "hashtags": "string (space separated hashtags, exactly 8-10 tags)"
}
`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed");
      }

      setResult(data.result);

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="min-h-screen bg-game-bg text-gray-100 font-sans selection:bg-game-accent selection:text-white overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-game-accent rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
      </div>

      <Toaster position="top-right" />

      {/* Navigation */}
      <nav className="relative z-20 max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <motion.a 
          href="/" 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 group"
        >
          <div className="p-2 bg-game-accent rounded-lg shadow-[0_0_15px_-3px_rgba(255,78,0,0.5)]">
            <Gamepad2 className="w-5 h-5 text-white" />
          </div>
          <span className="hidden sm:inline font-display uppercase tracking-tighter text-white group-hover:text-game-accent transition-colors">INDTA</span>
        </motion.a>
        
        <div className="flex items-center gap-6 sm:gap-8">
          {[
            { name: 'Home', action: () => setCurrentView('generator') },
            { name: 'About', path: '/about' },
            { name: 'Contact', path: '/contact' },
            { name: 'Privacy', path: '/privacy-policy' }
          ].map((link) => (
            link.path ? (
              <motion.a
                key={link.name}
                href={link.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
              >
                {link.name}
              </motion.a>
            ) : (
              <motion.button
                key={link.name}
                onClick={link.action}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] transition-colors ${
                  (link.name === 'Home' && currentView === 'generator') || (link.name === 'Contact' && currentView === 'contact')
                  ? 'text-white underline underline-offset-4 decoration-game-accent' 
                  : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
              </motion.button>
            )
          ))}
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {currentView === "contact" ? (
          <main key="contact" className="relative z-10 max-w-4xl mx-auto px-6 py-24">
            <ContactForm onBack={() => setCurrentView("generator")} />
          </main>
        ) : (
          <motion.div
            key="generator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-game-accent/10 border border-game-accent/20"
          >
            <Gamepad2 className="w-8 h-8 text-game-accent" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-tighter mb-4 text-white break-words">
            INDTA <span className="text-game-accent">Gaming</span> Captions
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Best gaming captions & hashtags for Free Fire, BGMI & more. Boost your posts instantly.
          </p>
        </header>

        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8">
          {/* Controls */}
          <section className="space-y-6">
            <div className="bg-game-card border border-white/5 rounded-3xl p-6 shadow-2xl">
              <div className="space-y-6">
                {/* Post Description */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3 block">Post Description (Optional)</label>
                  <textarea 
                    placeholder="Describe your video/image (e.g. clutch moment, headshot, funny fail...)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full py-3 px-4 rounded-xl text-sm bg-white/5 border border-white/10 text-gray-200 placeholder:text-gray-600 focus:border-game-accent outline-none transition-all resize-none"
                  />
                </div>

                {/* Language Select */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3 block">Output Language</label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full py-3 px-4 rounded-xl text-sm bg-white/5 border border-white/10 text-gray-200 focus:border-game-accent outline-none transition-all appearance-none cursor-pointer"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang} className="bg-game-card text-white">
                          {lang}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Game Select */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3 block">Select Game</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GAMES.slice(0, 4).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGame(g)}
                        className={`py-2 px-3 rounded-xl text-sm transition-all border ${
                          game === g 
                          ? "bg-game-accent border-game-accent text-white shadow-lg shadow-game-accent/20" 
                          : "bg-white/5 border-white/10 hover:border-white/20 text-gray-400"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                    <div className="col-span-2">
                       <input 
                        type="text"
                        placeholder="Other game..."
                        value={GAMES.includes(game) ? "" : game}
                        onChange={(e) => setGame(e.target.value)}
                        className="w-full py-2 px-4 rounded-xl text-sm bg-white/5 border border-white/10 text-gray-200 placeholder:text-gray-600 focus:border-game-accent outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Mood Select */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3 block">Mood Vibe</label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMood(m.id)}
                        className={`py-2 px-4 rounded-full text-sm flex items-center gap-2 transition-all border ${
                          mood === m.id 
                          ? "bg-white text-black border-white font-bold" 
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        <span>{m.emoji}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform */}
                <div>
                  <label className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-3 block">Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map((p) => {
                      const Icon = p.icon;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setPlatform(p.id)}
                          className={`flex flex-col items-center gap-2 py-3 rounded-2xl transition-all border ${
                            platform === p.id 
                            ? "bg-game-accent/20 border-game-accent text-game-accent" 
                            : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-[10px] uppercase font-bold">{p.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={generateCaptions}
                    disabled={loading}
                    className="flex-1 py-4 rounded-2xl bg-game-accent text-white font-display uppercase italic tracking-wider shadow-xl shadow-game-accent/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                  >
                    {loading ? (
                      <RotateCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Flame className="w-6 h-6 fill-current" />
                        {result ? "REGENERATE" : "GENERATE"}
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetGenerator}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    title="Reset All"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-center text-gray-500">
                  Unlimited AI Generations Powered by INDTA
                </p>
              </div>
            </div>

            {/* Desktop-only Mini Banner */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden lg:block mt-6"
                >
                  <a
                    href="https://www.indtanews.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-5 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5 hover:border-blue-500/50 transition-all text-center relative overflow-hidden"
                  >
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400 group-hover:text-blue-400 transition-colors">
                        More Captions & Hashtags Available
                      </p>
                      <p className="text-sm font-display uppercase italic text-white flex items-center gap-2">
                        Visit: <span className="text-blue-400 group-hover:underline">www.indtanews.com</span>
                        <motion.span
                          animate={{ x: [0, 3, 0] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          👉
                        </motion.span>
                      </p>
                    </div>
                    {/* Minimal Glow */}
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Sparkles className="w-8 h-8 text-blue-400" />
                    </div>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Result */}
          <section className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Short Captions */}
                  <div className="bg-game-card border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4">
                      <Terminal className="w-12 h-12 text-white/5 rotate-12" />
                    </div>
                    <h3 className="text-sm font-mono uppercase text-game-accent mb-4 tracking-tighter flex items-center gap-2">
                      <Trophy className="w-4 h-4" /> Short & Viral
                    </h3>
                    <div className="space-y-3">
                      {result.shortCaptions.map((cap, idx) => (
                        <motion.div 
                          key={idx} 
                          whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => copyToClipboard(cap, `short-${idx}`)}
                          className="flex items-center justify-between gap-4 p-3 bg-white/5 rounded-xl border border-white/5 group/cap cursor-pointer transition-all"
                        >
                          <p className="text-gray-200 text-sm sm:text-base leading-snug">{cap}</p>
                          <div className="p-2 text-gray-400 group-hover/cap:text-game-accent transition-colors shrink-0">
                            {copiedSection === `short-${idx}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Long Caption */}
                  <motion.div 
                    whileHover={{ scale: 1.005, backgroundColor: "rgba(255, 255, 255, 0.02)" }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => copyToClipboard(result.longCaption, 'long')}
                    className="bg-game-card border border-white/10 rounded-3xl p-6 cursor-pointer transition-all group/long"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <h3 className="text-sm font-mono uppercase text-gray-400 tracking-tighter flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-game-accent" /> Storytelling Caption
                      </h3>
                      <button 
                        className="flex items-center gap-2 text-xs text-gray-500 group-hover/long:text-white transition-colors self-start sm:self-auto bg-white/5 sm:bg-transparent px-3 py-1 sm:p-0 rounded-full border border-white/5 sm:border-0"
                      >
                         {copiedSection === 'long' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                         {copiedSection === 'long' ? 'Copied' : 'Copy Long'}
                      </button>
                    </div>
                    <p className="text-gray-300 leading-relaxed italic text-lg">
                      "{result.longCaption}"
                    </p>
                  </motion.div>

                  {/* Hashtags */}
                  <div className="bg-game-card border border-white/10 rounded-3xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <h3 className="text-sm font-mono uppercase text-blue-400 tracking-tighter flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Trending Tags
                      </h3>
                      <button 
                        onClick={() => copyToClipboard(result.hashtags, 'tags')}
                        className="text-xs text-blue-400/60 hover:text-blue-400 uppercase font-bold self-start sm:self-auto bg-blue-400/5 sm:bg-transparent px-3 py-1 sm:p-0 rounded-full border border-blue-400/10 sm:border-0"
                      >
                        {copiedSection === 'tags' ? 'Copied!' : 'Copy All'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags.split(' ').map((tag, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(tag, `tag-${i}`)}
                          className={`text-xs px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                            copiedSection === `tag-${i}` 
                              ? 'text-game-accent bg-game-accent/10 border-game-accent/30' 
                              : 'text-gray-500 bg-white/5 border-white/5 hover:text-white hover:bg-white/10 hover:border-white/10'
                          }`}
                        >
                          {copiedSection === `tag-${i}` ? 'Copied!' : tag}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* CTA Banner */}
                  <motion.a
                    href="https://www.indtanews.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative block w-full mt-10 overflow-hidden rounded-[2rem] border border-blue-500/30 bg-[#050505] p-8 text-center shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]"
                  >
                    {/* Background Glows */}
                    <div className="absolute top-0 left-1/4 w-1/2 h-full bg-blue-600/10 blur-[60px] pointer-events-none" />
                    <div className="absolute bottom-0 right-1/4 w-1/2 h-full bg-purple-600/10 blur-[60px] pointer-events-none" />
                    
                    {/* Floating Icons */}
                    <div className="absolute top-4 left-6 opacity-20 group-hover:opacity-40 transition-opacity">
                      <Gamepad2 className="w-10 h-10 text-blue-400 rotate-[-15deg]" />
                    </div>
                    <div className="absolute bottom-4 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
                      <Flame className="w-10 h-10 text-game-accent rotate-[15deg]" />
                    </div>
                    <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-10">
                      <Sparkles className="w-16 h-16 text-white" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Flame className="w-6 h-6 text-game-accent fill-game-accent" />
                        <h4 className="text-xl md:text-2xl font-display uppercase italic tracking-tighter text-white">
                          More Captions & Hashtags Available
                        </h4>
                      </div>
                      <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-3xl bg-white/5 border border-white/10 px-4 py-2 sm:px-6 sm:py-2 group-hover:bg-game-accent group-hover:border-game-accent transition-all duration-300 max-w-full">
                        <span className="text-[10px] sm:text-sm font-mono uppercase tracking-widest text-gray-400 group-hover:text-white">
                          Visit:
                        </span>
                        <span className="text-sm sm:text-lg font-bold text-blue-400 group-hover:text-white break-all">
                          www.indtanews.com
                        </span>
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="hidden sm:inline"
                        >
                          👉
                        </motion.span>
                      </div>
                    </div>

                    {/* Futuristic Border Accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-br-xl" />
                  </motion.a>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                  <Flame className="w-16 h-16 text-gray-700 mb-6" />
                  <h3 className="text-xl font-display uppercase italic text-gray-600">Waiting for the spark</h3>
                  <p className="text-gray-600 text-sm mt-2">Select your game and mood to generate content that pops.</p>
                </div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* Resources & Info Section */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-20 space-y-20 border-t border-white/5">
        
        {/* Impact Stats Section */}
        <div className="pb-12 border-b border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Generations', value: '1.2M+' },
                { label: 'Happy Gamers', value: '500K+' },
                { label: 'Platforms', value: 'All' },
              ].map(stat => (
                <div key={stat.label} className="text-center p-6 bg-game-card/30 rounded-3xl border border-white/5 hover:border-game-accent/30 transition-colors group">
                  <div className="text-3xl font-display text-white group-hover:text-game-accent transition-colors">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
          </div>
        </div>

        {/* About & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-display uppercase tracking-tighter text-white">
              <span className="text-game-accent">INDTA</span> GAMING CAPTIONS
            </h2>
            <p className="space-y-4">
              <span className="block text-white font-medium text-xl leading-snug">
                Welcome to <span className="text-game-accent">INDTA</span> Gaming Captions Generator, your ultimate boost for going viral 🚀
              </span>
              <span className="block text-gray-400 leading-relaxed text-base italic border-l-2 border-game-accent/30 pl-4">
                In today’s fast-paced gaming world, your gameplay shows skill, but your captions create impact and grab attention.
              </span>
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.indtanews.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-mono uppercase tracking-widest text-blue-400 transition-all"
              >
                <BookOpen className="w-4 h-4" /> Official Website
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
              <Zap className="w-8 h-8 text-game-accent" />
              <h4 className="text-white font-bold uppercase text-xs tracking-widest">Boost Reach</h4>
              <p className="text-gray-500 text-xs">Proprietary hashtag algorithms.</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
              <Trophy className="w-8 h-8 text-blue-400" />
              <h4 className="text-white font-bold uppercase text-xs tracking-widest">Pro Tone</h4>
              <p className="text-gray-500 text-xs">Tailored for serious content creators.</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
              <RotateCw className="w-8 h-8 text-purple-400" />
              <h4 className="text-white font-bold uppercase text-xs tracking-widest">Sync Speed</h4>
              <p className="text-gray-500 text-xs">Instant generation on any device.</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-3">
              <Share2 className="w-8 h-8 text-green-400" />
              <h4 className="text-white font-bold uppercase text-xs tracking-widest">Social Ready</h4>
              <p className="text-gray-500 text-xs">Multi-platform optimized output.</p>
            </div>
          </div>
        </div>

        {/* About Us Section */}
        <AboutUs />

        {/* How to Use & Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8 bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-game-accent/10 border border-game-accent/20 text-game-accent text-[10px] font-mono uppercase font-bold tracking-widest">
                Guide
              </div>
              <h3 className="text-2xl font-display uppercase text-white">How to Start</h3>
            </div>
            <div className="space-y-6">
              {[
                { step: '01', title: 'Select Language', desc: 'Choose from Bengali, Hindi, English, or Hinglish.' },
                { step: '02', title: 'Pick Your Game', desc: 'Select from popular titles like Free Fire, BGMI, or Valorant.' },
                { step: '03', title: 'Set the Mood', desc: 'Choose from Attitude, Funny, or Savage to match your clip.' },
                { step: '04', title: 'Generate & Copy', desc: 'Generate instantly and click anywhere to copy to clipboard.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <span className="text-game-accent font-mono text-lg font-bold opacity-40 group-hover:opacity-100 transition-opacity">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-10 text-left">
            <div className="flex gap-3.5 items-start bg-white/[0.02] p-6 rounded-3xl border border-white/5">
               <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
                 <ListChecks className="w-5 h-5 text-blue-400" />
               </div>
               <div className="space-y-6 pt-1">
                 <h3 className="text-xl font-display uppercase text-white leading-tight tracking-tight">Features</h3>
                 <ul className="space-y-5">
                   {[
                     { t: 'AI-Powered Captions', d: 'Context-aware captions in Bengali, Hindi, English, and Hinglish.' },
                     { t: 'Viral Hashtags', d: 'Trending tags extracted from current social data.' },
                     { t: 'One-Tap Copy', d: 'Fully interactive cards for ultra-fast workflow.' }
                   ].map((feat, idx) => (
                     <li key={idx} className="group">
                       <p className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors uppercase tracking-tight">{feat.t}</p>
                       <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">{feat.d}</p>
                     </li>
                   ))}
                 </ul>
               </div>
            </div>

            <div className="flex gap-3.5 items-start bg-white/[0.02] p-6 rounded-3xl border border-white/5">
               <div className="p-2.5 bg-game-accent/10 rounded-xl border border-game-accent/20 shrink-0">
                 <Sparkles className="w-5 h-5 text-game-accent" />
               </div>
               <div className="space-y-6 pt-1">
                 <h3 className="text-xl font-display uppercase text-white leading-tight tracking-tight">Your Benefits</h3>
                 <ul className="space-y-5">
                   {[
                     { t: 'Save Serious Time', d: 'Go from clip to post in under 30 seconds.' },
                     { t: 'Boost Performance', d: 'AI-optimized hooks to keep people watching.' },
                     { t: 'Professional Look', d: 'Expert-level writing for your gaming profile.' }
                   ].map((ben, idx) => (
                     <li key={idx} className="group">
                       <p className="text-white font-bold text-sm group-hover:text-game-accent transition-colors uppercase tracking-tight">{ben.t}</p>
                       <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">{ben.d}</p>
                     </li>
                   ))}
                 </ul>
               </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-display uppercase text-white">Frequently Asked</h3>
            <p className="text-gray-500 text-sm">Everything you need to know about the tool.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { q: 'Is it free to use?', a: 'Absolutely. We provide unlimited high-quality generation for all gamers without any hidden costs or login requirements.' },
              { q: 'Which apps is it for?', a: 'Our captions and hashtags are optimized for Instagram Reels, YouTube Shorts, Facebook Gaming, and TikTok.' },
              { q: 'Which languages are supported?', a: 'We currently support Bengali, Hindi, English, and Hinglish for all caption types.' },
              { q: 'What is Hinglish?', a: 'It is the standard for viral gaming content in India, blending Hindi and English seamlessly in Latin script.' }
            ].map((faq, idx) => (
              <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-white/10 transition-colors">
                <h4 className="text-white font-bold text-sm mb-3 flex items-start gap-2">
                  <span className="text-game-accent shrink-0">Q.</span> {faq.q}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Us */}
        <div className="max-w-3xl mx-auto space-y-12 pt-20">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-display uppercase text-white flex items-center justify-center gap-3">
              Contact Us
            </h3>
            <p className="text-gray-500 text-sm">Have a suggestion or found a bug? Drop us a line.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-game-accent transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full py-4 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-gray-600 focus:border-game-accent transition-all outline-none"
                />
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  required
                  placeholder="Email Address"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full py-4 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-gray-600 focus:border-blue-400 transition-all outline-none"
                />
              </div>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-5 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                <MessageSquare className="w-4 h-4" />
              </div>
              <textarea 
                required
                rows={4}
                placeholder="How can we help?"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full py-4 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-gray-600 focus:border-purple-400 transition-all outline-none resize-none"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={contactStatus !== 'idle'}
              className="w-full py-4 bg-game-accent hover:bg-game-accent/90 disabled:opacity-50 text-white font-display uppercase italic tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3"
            >
              {contactStatus === 'idle' && (
                <>
                  <Send className="w-4 h-4" /> Send Message
                </>
              )}
              {contactStatus === 'sending' && (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" /> Transmitting...
                </>
              )}
              {contactStatus === 'success' && (
                <>
                  <Check className="w-4 h-4" /> Mission Accomplished!
                </>
              )}
            </motion.button>
          </form>
        </div>

        </section>
      </motion.div>
    )}
  </AnimatePresence>

    {/* Stats Counter (Dummy) */}
      <footer className="max-w-4xl mx-auto px-6 pb-8 mt-8">
        <div className="text-center">
          <p className="text-[10px] text-white opacity-40 tracking-widest uppercase">
            © 2026 The Indtanews. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
