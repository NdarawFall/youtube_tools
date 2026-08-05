'use client';
import { useState, useEffect } from 'react';
import Auth from '@/components/Auth';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { ArrowRight, LayoutDashboard, ListTodo, Video, Type, CheckCircle2, Film } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login'|'signup-avatar'>('login');
  const [session, setSession] = useState<any>(null);

  const openLogin = () => { setAuthInitialMode('login'); setIsAuthModalOpen(true); };
  const openSignup = () => { setAuthInitialMode('signup-avatar'); setIsAuthModalOpen(true); };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-[#050608] text-slate-200 font-sans selection:bg-red-500/30 overflow-x-hidden relative">
      
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 -left-1/4 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#050608]/0 to-transparent blur-[120px]"></div>
        <div className="absolute bottom-0 -right-1/4 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-[#050608]/0 to-transparent blur-[120px]"></div>
        <motion.div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}
          animate={{ backgroundPosition: ['0px 0px', '64px 64px'] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Navbar */}
      <nav className="fixed w-full z-50 px-8 py-6 flex items-center justify-between backdrop-blur-md border-b border-white/5 bg-[#050608]/50">
        <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-red-500" />
            Creator<span className="text-red-500 italic">Studio</span>
        </h1>
        {session ? (
            <Link href="/dashboard" className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
                Accéder à l'espace
            </Link>
        ) : (
            <div className="flex items-center gap-2">
                <button onClick={openLogin} className="px-5 py-2.5 rounded-full text-slate-300 text-sm font-semibold hover:text-white transition-colors">
                    Connexion
                </button>
                <button onClick={openSignup} className="px-5 py-2.5 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20">
                    S'inscrire
                </button>
            </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 text-center z-10 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl flex flex-col items-center">
            
            <motion.span 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="px-4 py-1.5 rounded-full bg-red-950/40 text-red-400 text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border border-red-900/50 backdrop-blur-sm"
            >
                <CheckCircle2 className="w-4 h-4" /> La suite ultime pour YouTubeurs
            </motion.span>
            
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-[1.1] text-white">
                Pilotez votre chaîne <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 italic">avec précision.</span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                De l'idée brillante à la publication finale. Un studio tout-en-un conçu spécifiquement pour les créateurs de contenu exigeants (Faceless & Classique) qui veulent industrialiser leur production.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
                {session ? (
                    <Link href="/dashboard" className="group px-8 py-4 rounded-2xl bg-white text-[#050608] font-bold text-lg hover:bg-slate-200 transition-all shadow-xl shadow-white/10 flex items-center gap-3 w-full sm:w-auto justify-center">
                        Ouvrir le Studio
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                ) : (
                    <>
                        <button onClick={openSignup} className="group px-8 py-4 rounded-2xl bg-white text-[#050608] font-bold text-lg hover:bg-slate-200 transition-all shadow-xl shadow-white/10 flex items-center gap-3 w-full sm:w-auto justify-center">
                            Commencer gratuitement
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={openLogin} className="px-8 py-4 rounded-2xl bg-[#0a0c10] text-white font-semibold text-lg hover:bg-slate-900 border border-slate-800 transition-all w-full sm:w-auto text-center">
                            Se connecter
                        </button>
                    </>
                )}
                <a href="#features" className="px-8 py-4 rounded-2xl bg-transparent text-slate-400 font-medium text-sm hover:text-white transition-colors w-full sm:w-auto text-center">
                    Découvrir les outils ↓
                </a>
            </div>
        </motion.div>
      </section>

      {/* Visual Showcase (Kanban Mockup) */}
      <section className="relative px-8 pb-32 z-10">
        <motion.div 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1 }}
            className="max-w-5xl mx-auto rounded-3xl bg-[#0a0c10]/80 border border-slate-800 p-2 backdrop-blur-xl shadow-2xl shadow-red-900/10"
        >
            <div className="rounded-2xl border border-slate-800/50 bg-[#050608] overflow-hidden flex flex-col h-[400px]">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-[#0a0c10]">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 p-6 grid grid-cols-3 gap-6 overflow-hidden opacity-80 pointer-events-none">
                    {/* Fake Kanban Columns */}
                    <div className="flex flex-col gap-3">
                        <div className="text-sm font-bold text-slate-400 mb-2">💡 Idée</div>
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm">Pourquoi l'IA va tout changer</div>
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm">Top 10 astuces Next.js</div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="text-sm font-bold text-slate-400 mb-2">📝 Script en cours</div>
                        <div className="p-4 rounded-xl bg-slate-900 border border-red-900/50 text-sm">Documentaire : L'histoire de Supabase</div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="text-sm font-bold text-slate-400 mb-2">🚀 Prêt à publier</div>
                        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm">Mon setup de code (2026)</div>
                    </div>
                </div>
            </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-8 border-t border-white/5 bg-gradient-to-b from-[#050608] to-[#0a0c10] z-10 relative">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">L'arsenal du <span className="text-red-500">créateur</span></h2>
                <p className="text-slate-400 text-lg">Ne perdez plus de temps entre 10 applications différentes.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { icon: LayoutDashboard, title: "YouTube Kanban", desc: "Le cœur de votre chaîne. Organisez vos vidéos par statut (Idée, Script, Montage, Publication) grâce à un tableau intuitif en glisser-déposer." },
                    { icon: ListTodo, title: "Todo List Intégrée", desc: "Gardez le cap avec une liste de tâches globale. Cochez ce qui est fait, réorganisez vos priorités en un clin d'œil." },
                    { icon: Video, title: "Extraction de Frames", desc: "Besoin d'une miniature ? Importez votre vidéo et extrayez instantanément la première ou dernière frame en haute qualité." }
                ].map((f, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="p-8 rounded-3xl bg-[#0a0c10] border border-slate-800 hover:border-red-900/50 transition-colors shadow-2xl group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <f.icon className="w-7 h-7 text-red-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4">{f.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-24 px-8 relative z-10 bg-[#050608]">
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Comment ça <span className="text-red-500 italic">marche ?</span></h2>
                <p className="text-slate-400 text-lg">Un processus fluide, de la conception à la mise en ligne.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 relative">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-red-900/0 via-red-500/20 to-red-900/0 -z-10"></div>
                {[
                    { step: "01", title: "Centralisez", desc: "Notez toutes vos idées de vidéos dans le Kanban. Fini les post-its perdus ou les blocs-notes éparpillés." },
                    { step: "02", title: "Produisez", desc: "Faites glisser vos cartes étape par étape : Script, Voix-Off, Montage. Suivez votre progression visuellement." },
                    { step: "03", title: "Extrayez & Publiez", desc: "Générez vos miniatures grâce à l'extracteur de frames intégré. Votre vidéo est prête à exploser l'algorithme." }
                ].map((s, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                        key={i} className="flex flex-col items-center text-center relative"
                    >
                        <div className="w-16 h-16 rounded-full bg-[#0a0c10] border-2 border-red-500/30 text-red-500 flex items-center justify-center text-2xl font-black mb-6 shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]">
                            {s.step}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-24 px-8 border-t border-white/5 bg-[#0a0c10] z-10 relative">
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Fait pour les <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Créateurs Ambitieux</span></h2>
            <p className="text-slate-400 text-lg mb-12">
                Que vous soyez un créateur "Faceless" gérant plusieurs chaînes automatisées, ou un YouTubeur classique cherchant à structurer sa production hebdomadaire, CreatorStudio est le tableau de bord qu'il vous manquait.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <span className="px-6 py-3 rounded-full bg-slate-900 border border-slate-800 text-sm font-medium">Chaînes d'automatisation</span>
                <span className="px-6 py-3 rounded-full bg-slate-900 border border-slate-800 text-sm font-medium">Créateurs Solo</span>
                <span className="px-6 py-3 rounded-full bg-slate-900 border border-slate-800 text-sm font-medium">Monteurs Vidéos freelances</span>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-white/5 bg-[#050608] text-center text-slate-500 text-sm relative z-10">
          <p>© {new Date().getFullYear()} CreatorStudio. Tous droits réservés.</p>
      </footer>

      {isAuthModalOpen && <Auth theme="dark" initialMode={authInitialMode} onClose={() => setIsAuthModalOpen(false)} />}
    </main>
  );
}
