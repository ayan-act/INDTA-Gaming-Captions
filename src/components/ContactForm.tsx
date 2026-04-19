import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mail, User, MessageSquare, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface ContactFormProps {
  onBack: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;

    setIsSending(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSent(true);
        toast.success('Message sent! We\'ll be in touch soon.', {
          style: {
            background: '#15151a',
            color: '#fff',
            border: '1px solid #ff0055',
          },
          iconTheme: {
            primary: '#ff0055',
            secondary: '#fff',
          },
        });
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message', {
        style: {
          background: '#15151a',
          color: '#fff',
          border: '1px solid #ef4444',
        },
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-xl mx-auto"
    >
      <Toaster position="top-right" />
      
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-mono uppercase tracking-widest">Back to Generator</span>
      </button>

      <div className="bg-game-card/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-game-accent/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight text-white mb-3">
              Get in <span className="text-game-accent">Touch</span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Found a bug or have a suggestion? We're all ears. Drop us a line and let's level up together.
            </p>
          </header>

          <AnimatePresence mode="wait">
            {!isSent ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 ml-1">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Alex Hunter"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-game-accent/50 focus:ring-1 focus:ring-game-accent/50 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      required
                      type="email"
                      placeholder="alex@gaming.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-game-accent/50 focus:ring-1 focus:ring-game-accent/50 transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500 ml-1">Your Message</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-6 w-4 h-4 text-gray-500" />
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us what's on your mind..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-game-accent/50 focus:ring-1 focus:ring-game-accent/50 transition-all resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSending}
                  type="submit"
                  className="w-full bg-game-accent text-white font-display uppercase tracking-widest py-4 rounded-2xl shadow-[0_0_20px_-5px_rgba(255,0,85,0.5)] hover:shadow-[0_0_25px_-5px_rgba(255,0,85,0.6)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-game-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 text-game-accent">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-display uppercase text-white mb-2">Message Received</h3>
                <p className="text-gray-400 text-sm mb-8">Our team will process your transmission and get back to you across the frequency soon.</p>
                <button 
                  onClick={() => setIsSent(false)}
                  className="text-game-accent border border-game-accent/30 px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest hover:bg-game-accent/10 transition-all"
                >
                  Send Another
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-4">Direct Frequency</p>
            <a 
              href="mailto:contact@indtanews.com"
              className="group inline-flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/5 hover:border-game-accent/20 transition-all"
            >
              <div className="p-2 bg-gray-800 rounded-lg text-gray-400 group-hover:text-game-accent transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors tracking-tight">contact@indtanews.com</span>
            </a>
          </footer>
        </div>
      </div>
    </motion.div>
  );
};
