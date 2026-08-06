'use client';
import { useState, useEffect } from 'react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { supabase } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, Video } from 'lucide-react';
import Link from 'next/link';

const PAIN_POINTS = [
  {
    emoji: '🗂️',
    title: 'Des idées partout, nulle part',
    desc: "Notes, Google Docs, mémos vocaux... vos idées de vidéos sont éparpillées et finissent par mourir dans l'oubli.",
  },
  {
    emoji: '🔄',
    title: 'Un flux de travail inexistant',
    desc: "Impossible de savoir où en est chaque vidéo. Script fini ? Voix enregistrée ? Montage commencé ? Le chaos règne.",
  },
  {
    emoji: '📉',
    title: 'La régularité, un calvaire',
    desc: "Sans système, la constance est un effort. Vous publiez par à-coups, l'algorithme ne vous suit plus, les vues s'effondrent.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

export default function LandingPage() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="bg-[#050608] text-slate-200 font-sans overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[#050608]/70 backdrop-blur-xl border-b border-white/[0.04]">
        <span className="flex items-center gap-2 font-black text-lg tracking-tight text-white select-none">
          <Video className="w-8 h-8 text-red-500" />
          Creator<span className="text-red-500 italic">Studio</span>
        </span>
        {session ? (
          <Link href="/dashboard" className="px-5 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all">
            Mon espace →
          </Link>
        ) : (
          <GoogleSignInButton label="Se connecter" variant="outline" className="px-5 py-2 rounded-full text-sm" />
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-red-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-orange-500/5 rounded-full blur-[100px]" />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '3rem 3rem' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-8">
          <motion.div
            initial="hidden" animate="show"
            className="flex flex-col items-center gap-6"
          >
            <motion.span
              variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-500/20 bg-red-500/5 text-red-400 text-xs font-bold uppercase tracking-widest"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Pour les créateurs Faceless
            </motion.span>

            <motion.h1
              variants={fadeUp} custom={1}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.0] text-white"
            >
              Créer sans système,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-500 via-orange-400 to-red-600">
                {"c'est perdre du temps."}
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp} custom={2}
              className="max-w-xl text-lg md:text-xl text-slate-400 leading-relaxed"
            >
              Les créateurs de contenu anonymes qui réussissent ont tous un point commun&nbsp;: un
              <span className="text-slate-200 font-medium"> processus clair</span>. CreatorStudio est le tableau de bord
              conçu pour transformer votre chaos créatif en <span className="text-slate-200 font-medium">machine de production</span>.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              {session ? (
                <Link href="/dashboard" className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#050608] font-bold text-base hover:bg-slate-100 transition-all shadow-2xl">
                  Accéder au Studio <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <GoogleSignInButton label="Démarrer gratuitement" className="px-8 py-4 rounded-2xl text-base" />
              )}
            </motion.div>
          </motion.div>

          {/* No scroll indicator */}
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section id="problem" className="py-28 px-6 md:px-12 relative">
        <div className="max-w-2xl mx-auto bg-amber-950/20 border border-amber-900/50 p-6 rounded-2xl mb-16 text-center">
            <p className="text-amber-500 font-semibold">⚠️ Attention : Expérience optimisée</p>
            <p className="text-slate-400 text-sm mt-2">Pour une utilisation optimale de CreatorStudio, veuillez utiliser un ordinateur ou une tablette. L&apos;interface n&apos;est pas adaptée aux smartphones.</p>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.p
              initial="hidden" whileInView="show" viewport={{ once: true }}
              variants={fadeUp}
              className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4"
            >Le problème</motion.p>
            <motion.h2
              initial="hidden" whileInView="show" viewport={{ once: true }}
              variants={fadeUp} custom={1}
              className="text-4xl md:text-5xl font-black tracking-tight text-white"
            >
              Vous créez du contenu.<br />
              <span className="text-slate-500">Pas des systèmes.</span>
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PAIN_POINTS.map((p, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={fadeUp} custom={i * 0.15}
                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] hover:border-red-500/20 hover:bg-white/[0.04] transition-all duration-500"
              >
                <div className="text-4xl mb-6">{p.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-3">{p.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="py-28 px-6 md:px-12 border-t border-white/[0.04] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-red-600/8 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.p
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={fadeUp}
            className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4"
          >La solution</motion.p>
          <motion.h2
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={fadeUp} custom={1}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-8 leading-[1.1]"
          >
            Un seul endroit.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
              Tout votre workflow.
            </span>
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={fadeUp} custom={2}
            className="text-lg text-slate-400 leading-relaxed mb-12 max-w-2xl mx-auto"
          >
            {"CreatorStudio centralise chaque étape de votre production — de l'étincelle initiale à la vidéo publiée — dans un espace pensé exclusivement pour les créateurs anonymes qui veulent scaler sans se noyer."}
          </motion.p>

          {/* Quote / Statement */}
          <motion.blockquote
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={fadeUp} custom={3}
            className="relative px-10 py-8 rounded-3xl bg-white/[0.03] border border-white/[0.08]"
          >
            <div className="text-5xl text-red-500/30 font-serif absolute top-4 left-6 leading-none select-none">{"\""}</div>
            <p className="text-xl md:text-2xl font-semibold text-slate-200 italic leading-relaxed">
              {"Les meilleures chaînes Faceless ne gagnent pas parce qu'elles ont plus de talent."}
              {"Elles gagnent parce qu'elles ont un meilleur système."}
            </p>
          </motion.blockquote>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 px-6 md:px-12 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.p
              initial="hidden" whileInView="show" viewport={{ once: true }}
              variants={fadeUp}
              className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4"
            >Comment ça marche</motion.p>
            <motion.h2
              initial="hidden" whileInView="show" viewport={{ once: true }}
              variants={fadeUp} custom={1}
              className="text-4xl md:text-5xl font-black tracking-tight text-white"
            >Simple. Rapide. Efficace.</motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
            {[
              { n: '01', title: 'Capturez', desc: "Dès qu'une idée surgit, elle a une place. Fini le Post-it oublié au fond d'un tiroir." },
              { n: '02', title: 'Organisez', desc: "Visualisez votre pipeline de A à Z. Sachez exactement où en est chaque projet, en un coup d'œil." },
              { n: '03', title: 'Publiez', desc: "Avancez à votre rythme, sans friction. Votre seul travail : créer. Le reste, c'est nous." },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="show" viewport={{ once: true }}
                variants={fadeUp} custom={i * 0.2}
                className="flex flex-col items-center text-center gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0a0c10] border border-red-500/20 text-red-500 text-xl font-black flex items-center justify-center shadow-[0_0_40px_-8px_rgba(239,68,68,0.25)] relative z-10">
                  {s.n}
                </div>
                <h3 className="text-xl font-bold text-white">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-6 md:px-12 border-t border-white/[0.04] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-red-600/10 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.h2
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={fadeUp}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1]"
          >
            Votre prochain niveau<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">commence ici.</span>
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={fadeUp} custom={1}
            className="text-lg text-slate-500 mb-10"
          >
            Gratuit. Sans carte bancaire. Prêt en 60 secondes.
          </motion.p>
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={fadeUp} custom={2}
          >
            {session ? (
              <Link href="/dashboard" className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-[#050608] font-black text-lg hover:bg-slate-100 transition-all shadow-2xl shadow-white/10">
                Ouvrir le Studio <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <GoogleSignInButton
                label="Créer mon espace gratuit"
                className="px-10 py-5 rounded-2xl text-lg shadow-white/10"
              />
            )}
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-white/[0.04] flex items-center justify-between text-slate-600 text-xs">
        <span className="font-bold text-slate-500">Creator<span className="text-red-700 italic">Studio</span></span>
        <span>© {new Date().getFullYear()} — Tous droits réservés</span>
      </footer>
    </main>
  );
}
