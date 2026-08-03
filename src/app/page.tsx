'use client';
import { useState } from 'react';
import Auth from '@/components/Auth';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Layers, Palette } from 'lucide-react';

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#050608] text-slate-200 font-sans selection:bg-red-500/30">
      {/* Navbar */}
      <nav className="fixed w-full z-50 px-8 py-6 flex items-center justify-between">
        <h1 className="font-bold text-xl tracking-tight text-white">Creator<span className="text-red-500 italic">Studio</span></h1>
        <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all">
            Accéder à l'espace
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="px-4 py-1.5 rounded-full bg-red-950 text-red-400 text-xs font-bold uppercase tracking-wider mb-6 inline-block border border-red-900/50">
                Pour les créateurs Faceless
            </span>
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter mb-8 max-w-4xl mx-auto leading-[1.1] text-white">
                Éditez avec <span className="text-red-500 italic">précision</span>, <br />sans complexité.
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                Une suite d'outils ultra-spécialisés pour rationaliser votre production, structurer vos scripts et sublimer vos visuels.
            </p>
            <button onClick={() => setIsAuthModalOpen(true)} className="group px-10 py-5 rounded-2xl bg-white text-[#050608] font-semibold text-lg hover:bg-slate-200 transition-all shadow-xl flex items-center gap-2 mx-auto">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-8 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
            { icon: Zap, title: "Production Rapide", desc: "Des outils pensés pour les chaînes à haut volume." },
            { icon: Layers, title: "Flux Structuré", desc: "De l'idée au montage, tout est centralisé." },
            { icon: Palette, title: "Design Uniforme", desc: "Une charte visuelle forte pour votre identité." }
        ].map((f, i) => (
            <div key={i} className="p-8 rounded-3xl bg-[#0a0c10] border border-slate-800 hover:border-red-900/50 transition-colors">
                <f.icon className="w-10 h-10 text-red-500 mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
        ))}
      </section>

      {isAuthModalOpen && <Auth theme="dark" onClose={() => setIsAuthModalOpen(false)} />}
    </main>
  );
}
