'use client';
import { useState } from 'react';
import Auth from '@/components/Auth';
import { motion } from 'framer-motion';
import { LayoutGrid, ArrowRight, Zap, Layers, Palette } from 'lucide-react';

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-200">
      {/* Navbar */}
      <nav className="fixed w-full z-50 px-8 py-6 flex items-center justify-between">
        <h1 className="font-bold text-xl tracking-tight">Creator<span className="text-red-500 italic">Studio</span></h1>
        <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all">
            Accéder à l'espace
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="px-4 py-1.5 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider mb-6 inline-block">
                Pour les créateurs Faceless
            </span>
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter mb-8 max-w-4xl mx-auto leading-[1.1]">
                Éditez avec <span className="text-red-500 italic">précision</span>, <br />sans complexité inutile.
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                Une suite d'outils ultra-spécialisés pour rationaliser votre production, structurer vos scripts et sublimer vos visuels sans aucune courbe d'apprentissage.
            </p>
            <button onClick={() => setIsAuthModalOpen(true)} className="group px-10 py-5 rounded-2xl bg-red-600 text-white font-semibold text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-200 flex items-center gap-2 mx-auto">
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-8 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {[
            { icon: Zap, title: "Production Rapide", desc: "Des outils pensés pour les chaînes à haut volume de publication." },
            { icon: Layers, title: "Flux Structuré", desc: "Passez de l'idée au montage sans quitter votre espace de travail." },
            { icon: Palette, title: "Design Uniforme", desc: "Une charte visuelle forte pour identifier vos vidéos instantanément." }
        ].map((f, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-shadow">
                <f.icon className="w-10 h-10 text-red-500 mb-6" />
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
        ))}
      </section>

      {isAuthModalOpen && <Auth theme="light" onClose={() => setIsAuthModalOpen(false)} />}
    </main>
  );
}
