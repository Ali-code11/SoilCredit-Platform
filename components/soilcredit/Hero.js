'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, Calculator, Orbit, Activity } from 'lucide-react';
import { useLang } from '@/lib/providers';

const flowSteps = ['LAND', 'SATELLITE', 'AI', 'CARBON', 'CREDIT', 'MARKET'];

export default function Hero({ onOpenAuth }) {
  const { t, lang } = useLang();
  const reducedMotion = useReducedMotion();
  const [showIntro, setShowIntro] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const magneticX = useMotionValue(0);
  const magneticY = useMotionValue(0);
  const smoothX = useSpring(magneticX, { stiffness: 220, damping: 18 });
  const smoothY = useSpring(magneticY, { stiffness: 220, damping: 18 });
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const fgY = useTransform(scrollYProgress, [0, 1], [0, 220]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const seenIntro = window.localStorage.getItem('soilcredit-intro-seen');
    const shouldShowIntro = !seenIntro;
    setShowIntro(shouldShowIntro);

    if (!shouldShowIntro) return;

    const timer = setTimeout(() => {
      setShowIntro(false);
      window.localStorage.setItem('soilcredit-intro-seen', 'true');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') return;

    const handleMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      setPointer({ x, y });
    };

    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, [reducedMotion]);

  const floatingNodes = [
    { className: 'left-[8%] top-[18%]', delay: 0, duration: 7, size: 'h-3.5 w-3.5', color: 'bg-emerald-300/80' },
    { className: 'left-[24%] top-[36%]', delay: 0.8, duration: 8.4, size: 'h-2.5 w-2.5', color: 'bg-blue-300/80' },
    { className: 'right-[18%] top-[28%]', delay: 1.3, duration: 9.2, size: 'h-3 w-3', color: 'bg-emerald-200/80' },
    { className: 'right-[12%] bottom-[24%]', delay: 1.8, duration: 7.8, size: 'h-2.5 w-2.5', color: 'bg-blue-200/80' },
    { className: 'left-[52%] bottom-[20%]', delay: 0.6, duration: 8.8, size: 'h-2 w-2', color: 'bg-emerald-300/80' }
  ];

  const handleMagneticMove = (event) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    magneticX.set(offsetX * 0.18);
    magneticY.set(offsetY * 0.18);
  };

  const resetMagnetic = () => {
    magneticX.set(0);
    magneticY.set(0);
  };

  const mainTitle = [t('hero.title1'), t('hero.title2')];

  return (
    <section ref={heroRef} id="home" className="relative overflow-hidden bg-[#040b09] pt-28 pb-20 md:pt-36 md:pb-28 text-white">
      <motion.div style={{ y: bgY }} className="absolute inset-0 topographic-surface opacity-60" />
      <motion.div style={{ y: midY }} className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.15),_transparent_30%)]" />
      <motion.div style={{ y: fgY }} className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#020b09] to-transparent" />
      <motion.div style={{ x: pointer.x * 18, y: pointer.y * 18 }} className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <motion.div style={{ x: pointer.x * 24, y: pointer.y * 24 }} className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/10" />
      <motion.div style={{ x: pointer.x * 18, y: pointer.y * 12 }} className="absolute -left-20 bottom-8 h-72 w-72 rounded-full bg-blue-500/10 blur-[100px]" />
      <motion.div style={{ x: pointer.x * -18, y: pointer.y * -12 }} className="absolute -right-16 top-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-[110px]" />

      {!reducedMotion && floatingNodes.map((node, index) => (
        <motion.div
          key={index}
          className={`absolute ${node.className}`}
          animate={{ y: [0, -14, 0], x: [0, 10, 0], rotate: [0, 10, -6, 0] }}
          transition={{ duration: node.duration, delay: node.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className={`${node.size} ${node.color} rounded-full shadow-[0_0_18px_rgba(125,211,252,0.4)]`} />
        </motion.div>
      ))}

      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.65, ease: 'easeInOut' } }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020807]"
          >
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.55, ease: 'easeOut' }} className="text-center">
              <div className="text-[11px] uppercase tracking-[0.6em] text-white/50 mb-4">SoilCredit</div>
              <div className="space-y-3 text-[28px] font-semibold tracking-[-0.05em] text-white md:text-[42px]">
                {['LAND', 'DATA', 'AI', 'CARBON', 'CREDITS'].map((item, index) => (
                  <motion.div key={item} initial={{ opacity: 0, y: 12, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: index * 0.18, duration: 0.42 }}>
                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto flex max-w-max flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
          <span className="rounded bg-blue-500/15 px-2 py-1 text-[9px] font-bold text-blue-200">{lang.toUpperCase()}</span>
          <span>{t('hero.pill')}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-[9px] font-bold text-emerald-200"><Sparkles className="h-3 w-3" /> {t('hero.new')}</span>
        </motion.div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-5 flex items-center justify-center gap-2 lg:justify-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <Orbit className="h-5 w-5 text-emerald-300" />
              </div>
              <span className="text-[12px] uppercase tracking-[0.28em] text-white/70">Satellite • AI • Carbon</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }} className="font-display text-[44px] font-bold leading-[0.95] tracking-[-0.06em] sm:text-[64px] lg:text-[78px]">
              {mainTitle.map((line, lineIndex) => (
                <motion.span
                  key={line}
                  initial={{ opacity: 0, y: 28, clipPath: 'inset(0 100% 0 0 round 18px)', filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0 round 18px)', filter: 'blur(0px)' }}
                  transition={{ delay: 0.1 + lineIndex * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={`block ${lineIndex === 1 ? 'bg-gradient-to-r from-blue-300 via-emerald-200 to-emerald-400 bg-clip-text text-transparent' : 'text-white'}`}
                >
                  {line}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.6 }} className="mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed text-slate-300 lg:mx-0">
              {t('hero.subtitle')}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }} className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <motion.button
                onClick={() => onOpenAuth?.('signup')}
                onMouseMove={handleMagneticMove}
                onMouseLeave={resetMagnetic}
                style={{ x: smoothX, y: smoothY }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.985 }}
                className="btn-primary group inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-semibold"
              >
                {t('hero.cta1')}
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex">
                  <ArrowRight className="h-4 w-4 transition" strokeWidth={2.5} />
                </motion.span>
              </motion.button>
              <a href="#marketplace" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-[15px] font-semibold text-white transition hover:border-blue-300/40 hover:bg-white/10">
                {t('hero.cta2')}
              </a>
              <a href="#calculator" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-[15px] font-semibold text-white transition hover:border-emerald-300/40 hover:bg-white/10">
                <Calculator className="h-4 w-4 text-emerald-300" /> {t('hero.cta3')}
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.2em] text-slate-300 lg:justify-start">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400 dot-live" /> Verra VM0042</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-400" /> Gold Standard</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> ISO 14064-2</span>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18, duration: 0.8 }} className="relative mx-auto w-full max-w-[520px] lg:mx-0">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-blue-500/20 via-transparent to-emerald-500/15 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#071612]/80 p-5 shadow-[0_35px_100px_-30px_rgba(45,72,44,0.8)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/55">Field overview</div>
                  <div className="mt-2 font-display text-[26px] font-bold text-white">North Rift</div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200"><Activity className="h-3.5 w-3.5" /> Live</div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.2),_transparent_32%),linear-gradient(180deg,_rgba(17,24,39,0.8),_rgba(15,23,42,0.4))] p-4">
                <div className="terrain-visual relative h-[280px] overflow-hidden rounded-[1.25rem] border border-white/10">
                  <motion.div style={{ x: pointer.x * 18, y: pointer.y * 14 }} className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.2),_transparent_52%)]" />
                  <motion.div style={{ x: pointer.x * 12, y: pointer.y * 10 }} className="absolute inset-0 opacity-80" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-emerald-500/25 to-transparent" />
                  <div className="absolute left-6 top-16 h-20 w-20 rounded-full border border-blue-200/40 bg-blue-400/10 blur-sm" />
                  <div className="absolute right-10 top-12 h-24 w-24 rounded-full border border-emerald-200/40 bg-emerald-400/10 blur-sm" />
                  <motion.div className="absolute bottom-10 left-8 right-8 h-28 rounded-[1.5rem] border border-white/10 bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-blue-500/20" animate={{ y: [0, -10, 0], x: [0, 6, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} className="absolute right-10 top-10 h-14 w-14 rounded-full border border-dashed border-white/15" />
                  <div className="absolute right-10 top-10 h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
                  <div className="absolute left-16 top-16 h-2.5 w-2.5 rounded-full bg-blue-300 shadow-[0_0_18px_rgba(125,211,252,0.9)]" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/55">Land</div>
                  <div className="mt-2 font-display text-[22px] font-bold text-white">1,240</div>
                  <div className="text-[11px] text-slate-300">ha</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/55">Carbon</div>
                  <div className="mt-2 font-display text-[22px] font-bold text-white">46k</div>
                  <div className="text-[11px] text-slate-300">tCO₂e</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/55">Market</div>
                  <div className="mt-2 font-display text-[22px] font-bold text-white">$1.2M</div>
                  <div className="text-[11px] text-slate-300">value</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {flowSteps.map((step, index) => (
            <motion.div key={step} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.65 + index * 0.08, duration: 0.4 }} className="flow-node">
              {step}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
