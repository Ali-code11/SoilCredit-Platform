'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, Calculator, Orbit, Satellite, Blocks } from 'lucide-react';
import { useLang } from '@/lib/providers';

const flowSteps = ['LAND', 'SATELLITE', 'AI', 'CARBON', 'CREDIT', 'MARKET'];

export default function Hero({ onOpenAuth }) {
  const { t, lang } = useLang();
  const reducedMotion = useReducedMotion();
  const [showIntro, setShowIntro] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const magneticX = useMotionValue(0);
  const magneticY = useMotionValue(0);
  const smoothX = useSpring(magneticX, { stiffness: 220, damping: 18 });
  const smoothY = useSpring(magneticY, { stiffness: 220, damping: 18 });
  const { scrollY } = useScroll();
  const scrollYProgress = useTransform(scrollY, [0, 1000], [0, 1]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const fgY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const chainOpacity = useTransform(scrollYProgress, [0.28, 0.52, 0.78], [0, 0.4, 0]);
  const satelliteOpacity = useTransform(scrollYProgress, [0.56, 0.82, 1], [0, 0.42, 0.24]);

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
    { className: 'left-[8%] top-[18%]', delay: 0, duration: 7, size: 'h-3.5 w-3.5', color: 'bg-blue-300/80' },
    { className: 'left-[24%] top-[36%]', delay: 0.8, duration: 8.4, size: 'h-2.5 w-2.5', color: 'bg-blue-300/80' },
    { className: 'right-[18%] top-[28%]', delay: 1.3, duration: 9.2, size: 'h-3 w-3', color: 'bg-blue-200/80' },
    { className: 'right-[12%] bottom-[24%]', delay: 1.8, duration: 7.8, size: 'h-2.5 w-2.5', color: 'bg-blue-200/80' },
    { className: 'left-[52%] bottom-[20%]', delay: 0.6, duration: 8.8, size: 'h-2 w-2', color: 'bg-blue-300/80' }
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
    <section id="home" className="hero-section relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      <motion.div style={{ y: bgY }} className="absolute inset-0 topographic-surface opacity-60" />
      <motion.div style={{ y: midY }} className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.24),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.2),_transparent_30%)]" />
      <motion.div style={{ y: fgY }} className="hero-top-fade absolute inset-x-0 top-0 h-32" />
      {!reducedMotion && <div className="hero-journey" aria-hidden="true">
        <svg viewBox="0 0 900 360" className="hero-journey-lines" fill="none">
          <path d="M74 78 C170 130 225 198 330 200 S500 198 610 180 S755 142 835 100" />
          <path d="M384 200 L418 166 L452 200 L418 234 Z M418 166 V234 M384 200 H452" />
          <path d="M688 155 L735 128 M735 128 L766 143 M735 128 L741 96 M688 155 L681 181 M688 155 L712 180" />
          <path d="M659 144 L689 162 M718 111 L749 129" />
          <circle cx="418" cy="200" r="4" /><circle cx="384" cy="200" r="4" /><circle cx="452" cy="200" r="4" />
        </svg>
        <motion.div className="hero-journey-blocks" style={{ opacity: chainOpacity }}><Blocks /></motion.div>
        <motion.div className="hero-journey-satellite" style={{ opacity: satelliteOpacity }}><Satellite /></motion.div>
      </div>}
      <motion.div style={{ x: pointer.x * 18, y: pointer.y * 18 }} className="absolute left-[125%] top-[110%] h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-900/18 dark:border-white/15 lg:left-[115%] lg:top-[82%]" />
      <motion.div style={{ x: pointer.x * 24, y: pointer.y * 24 }} className="absolute left-[125%] top-[110%] h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-700/16 dark:border-emerald-300/14 lg:left-[115%] lg:top-[82%]" />
      <motion.div style={{ x: pointer.x * 18, y: pointer.y * 12 }} className="absolute -left-20 bottom-8 h-72 w-72 rounded-full bg-blue-500/15 blur-[100px] dark:bg-blue-500/10" />
      <motion.div style={{ x: pointer.x * -18, y: pointer.y * -12 }} className="absolute -right-16 top-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-[110px] dark:bg-emerald-500/10" />

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
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto flex max-w-max flex-wrap items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-slate-700 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-white/80">
          <span className="rounded bg-blue-500/10 px-2 py-1 text-[9px] font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">{lang.toUpperCase()}</span>
          <span>{t('hero.pill')}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200"><Sparkles className="h-3 w-3" /> {t('hero.new')}</span>
        </motion.div>

        <div className="mt-8 flex justify-center">
          <div className="w-full max-w-4xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-5 flex items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-900/10 bg-white/70 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <Orbit className="h-5 w-5 text-blue-700 dark:text-blue-200" />
              </div>
              <span className="text-[12px] uppercase tracking-[0.28em] text-slate-600 dark:text-white/70">Satellite • AI • Carbon</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }} className="font-display text-[44px] font-bold leading-[0.95] tracking-[-0.06em] sm:text-[64px] lg:text-[78px]">
              {mainTitle.map((line, lineIndex) => (
                <motion.span
                  key={line}
                  initial={{ opacity: 0, y: 28, clipPath: 'inset(0 100% 0 0 round 18px)', filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0 round 18px)', filter: 'blur(0px)' }}
                  transition={{ delay: 0.1 + lineIndex * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={`block ${lineIndex === 1 ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-slate-900 bg-clip-text text-transparent dark:from-blue-200 dark:via-blue-100 dark:to-white' : 'text-slate-900 dark:text-white'}`}
                >
                  {line}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.6 }} className="mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed text-slate-600 dark:text-slate-300">
              {t('hero.subtitle')}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }} className="mt-9 flex flex-wrap items-center justify-center gap-3">
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
              <a href="#marketplace" className="inline-flex items-center gap-2 rounded-xl border border-slate-900/15 bg-white/70 px-6 py-3.5 text-[15px] font-semibold text-slate-800 transition hover:border-blue-500/40 hover:bg-blue-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-blue-300/40 dark:hover:bg-white/10">
                {t('hero.cta2')}
              </a>
              <a href="#calculator" className="inline-flex items-center gap-2 rounded-xl border border-slate-900/15 bg-white/70 px-6 py-3.5 text-[15px] font-semibold text-slate-800 transition hover:border-emerald-500/40 hover:bg-emerald-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-emerald-300/40 dark:hover:bg-white/10">
                <Calculator className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /> {t('hero.cta3')}
              </a>
            </motion.div>

          </div>

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
