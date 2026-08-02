'use client';
import { useState } from 'react';
import Auth from '@/components/Auth';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <main className="h-screen w-screen bg-slate-50 text-slate-900 font-sans p-4 flex flex-col items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
            <div className="mx-auto p-4 rounded-3xl bg-white border border-slate-200 shadow-2xl w-fit">
                <LayoutGrid className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="font-bold text-5xl tracking-tighter">Creator<span className="text-red-500 italic">Studio</span></h1>
            <p className="text-slate-500 max-w-sm mx-auto">La boîte à outils 100% locale pour vos projets vidéo.</p>
            <button onClick={() => setIsAuthModalOpen(true)} className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-xl">
                Connexion
            </button>
        </motion.div>
        {isAuthModalOpen && <Auth theme="light" onClose={() => setIsAuthModalOpen(false)} />}
    </main>
  );
}
