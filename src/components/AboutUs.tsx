import React from 'react';
import { motion } from 'motion/react';
import { Target, Users, Zap, ShieldCheck } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <section id="about" className="py-16 space-y-12">
      <div className="max-w-4xl mx-auto space-y-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-game-accent/10 border border-game-accent/20 mb-4"
        >
          <Users className="w-4 h-4 text-game-accent" />
          <span className="text-xs font-mono uppercase tracking-widest text-game-accent italic">The Mission</span>
        </motion.div>
        
        <h2 className="text-3xl md:text-5xl font-display uppercase italic text-white tracking-tighter">
          Level Up Your <span className="text-game-accent">Social Game</span> with INDTA
        </h2>
        
        <p className="text-gray-400 text-lg leading-relaxed max-w-3xl mx-auto">
          Welcome to <span className="text-white font-bold">INDTA Gaming Captions Generator</span>—the ultimate power-up for your digital presence. 
          In the fast-paced world of gaming, your gameplay speaks for itself, but your captions are what truly capture the crowd.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto px-4">
        <div className="space-y-6 text-gray-400 text-sm sm:text-base leading-relaxed">
          <p>
            Whether you're pulling off a clutch 1v4 in <strong>Free Fire</strong>, dominating the final zone in <strong>BGMI</strong>, 
            or securing a chicken dinner in <strong>PUBG</strong>, your highlights deserve more than just a generic description. 
            At INDTA, we've harnessed advanced Artificial Intelligence to help gamers bridge the gap between epic gameplay and viral fame.
          </p>
          <p>
            Our mission is direct: to eliminate the friction of content creation. No more staring at a blank screen 
            wondering what to write. With just a few inputs, INDTA delivers high-engagement, viral-ready captions 
            and trending hashtags tailored specifically for the gaming community.
          </p>
          <p className="border-l-2 border-game-accent pl-6 py-2 italic bg-game-accent/5 rounded-r-2xl">
            "We believe every gamer has a story to tell, and we’re here to provide the perfect words to tell it."
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {[
            { 
              icon: <Zap className="w-5 h-5 text-yellow-400" />, 
              title: "AI Precision", 
              desc: "Context-aware hooks trained on thousands of viral gaming trends." 
            },
            { 
              icon: <Target className="w-5 h-5 text-red-500" />, 
              title: "Niche Focused", 
              desc: "Optimized specifically for Free Fire, BGMI, and PUBG Mobile algorithms." 
            },
            { 
              icon: <Users className="w-5 h-5 text-blue-400" />, 
              title: "Multi-Lingual", 
              desc: "Mastery in Bengali, Hindi, Hinglish, and English to connect locally." 
            },
            { 
              icon: <ShieldCheck className="w-5 h-5 text-green-400" />, 
              title: "Trustworthy", 
              desc: "A project by IndtaNews, dedicated to providing free tools for gamers." 
            }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ x: 10, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex items-start gap-4 transition-all"
            >
              <div className="p-2 rounded-lg bg-black/20">
                {item.icon}
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-tight mb-1">{item.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto text-center pt-8 border-t border-white/5 mt-12">
        <p className="text-gray-500 text-sm italic">
          Join the revolution. Turn your highlights into trends. Grow your presence with the words you deserve.
        </p>
      </div>
    </section>
  );
};
