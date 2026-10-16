'use client';

import { useEffect, useState } from 'react';
import { ArrowDownRight, Database, Leaf, Sprout } from 'lucide-react';
import { useLang } from '@/lib/providers';
import AuthModal from '@/components/soilcredit/AuthModal';
import Footer from '@/components/soilcredit/Footer';
import Navbar from '@/components/soilcredit/Navbar';
import Team from '@/components/soilcredit/Team';

const videoSource = process.env.NEXT_PUBLIC_ABOUT_VIDEO_SRC || '/videos/about-landscape.mp4';
const VIDEO_SRC = videoSource?.startsWith('/') && !videoSource.startsWith('//') && /\.mp4(?:$|\?)/i.test(videoSource) ? videoSource : '';

const THEME_ICONS = [Database, Sprout, Leaf];

export default function AboutPage() {
  const { lang, languageReady, t } = useLang();
  const [auth, setAuth] = useState({ open: false, mode: 'signup' });
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const about = t('aboutPage');

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setMotionAllowed(!preference.matches);
    updatePreference();
    preference.addEventListener?.('change', updatePreference);
    return () => preference.removeEventListener?.('change', updatePreference);
  }, []);

  useEffect(() => {
    if (!languageReady || !about || typeof about === 'string') return;
    const timeout = window.setTimeout(() => {
      document.title = `${about.metadataTitle} | SoilCredit`;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.setAttribute('content', about.metadataDescription);
      const openGraphTitle = document.querySelector('meta[property="og:title"]');
      if (openGraphTitle) openGraphTitle.setAttribute('content', `${about.metadataTitle} | SoilCredit`);
      const openGraphDescription = document.querySelector('meta[property="og:description"]');
      if (openGraphDescription) openGraphDescription.setAttribute('content', about.metadataDescription);
      const openGraphLocale = document.querySelector('meta[property="og:locale"]');
      if (openGraphLocale) openGraphLocale.setAttribute('content', lang === 'az' ? 'az_AZ' : 'en_US');
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [about, lang, languageReady]);

  if (!about || typeof about === 'string') return null;

  return (
    <main className="scroll-smooth bg-white text-slate-900 motion-reduce:scroll-auto">
      <Navbar onOpenAuth={(mode = 'signup') => setAuth({ open: true, mode })} />

      <section aria-labelledby="about-hero-title" className="relative isolate flex min-h-[82svh] items-center overflow-hidden bg-[#10261d] pt-20 sm:min-h-[760px]">
        <div
          className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_75%_18%,rgba(151,190,121,0.62),transparent_35%),radial-gradient(ellipse_at_15%_85%,rgba(24,83,63,0.92),transparent_52%),linear-gradient(130deg,#182e25_5%,#416247_50%,#a5b184_100%)]"
          role={!VIDEO_SRC || videoFailed || !motionAllowed ? 'img' : undefined}
          aria-label={!VIDEO_SRC || videoFailed || !motionAllowed ? about.videoFallback : undefined}
        />
        {VIDEO_SRC && motionAllowed && !videoFailed ? (
          <video
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            src={VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            onError={() => setVideoFailed(true)}
          />
        ) : null}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/75 via-slate-950/45 to-slate-950/15" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-slate-950/45 to-transparent" aria-hidden="true" />

        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="max-w-3xl text-white">
            <p className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200 sm:text-sm">
              <span className="h-px w-8 bg-emerald-300" aria-hidden="true" />
              {about.eyebrow}
            </p>
            <h1 id="about-hero-title" className="font-display text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              {about.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
              {about.heroDescription}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#mission" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f8fafc] px-5 py-3 text-center text-sm font-semibold text-blue-900 shadow-lg shadow-black/10 transition hover:bg-[#eff6ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                {about.exploreMission}
                <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href="#team" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/45 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                {about.meetTeam}
              </a>
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 right-6 hidden items-center gap-2 text-xs font-medium tracking-wide text-white/70 md:flex" aria-hidden="true">
          <span className="h-px w-8 bg-white/50" />
          SOILCREDIT
        </div>
      </section>

      <section aria-labelledby="about-soilcredit-title" className="relative overflow-hidden py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[0.75fr_1.25fr] md:items-start lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-800 dark:text-blue-300">{about.eyebrow}</p>
            <h2 id="about-soilcredit-title" className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              {about.aboutTitle}
            </h2>
          </div>
          <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            {about.aboutDescription}
          </p>
        </div>
      </section>

      <section id="mission" aria-labelledby="mission-title" className="scroll-mt-20 border-y border-slate-100 bg-[#f7faf8] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-800">
                <Leaf className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 id="mission-title" className="mt-5 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {about.missionTitle}
              </h2>
            </div>
            <div>
              <p className="text-lg leading-8 text-slate-700 sm:text-xl sm:leading-9">{about.missionDescription}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {about.themes.map((theme, index) => {
                  const Icon = THEME_ICONS[index];
                  return (
                    <article key={theme.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.28)]">
                      <Icon className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                      <h3 className="mt-4 font-display text-base font-semibold leading-snug text-slate-900">{theme.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{theme.description}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Team />
      <Footer />
      <AuthModal open={auth.open} mode={auth.mode} onClose={() => setAuth((current) => ({ ...current, open: false }))} />
    </main>
  );
}
