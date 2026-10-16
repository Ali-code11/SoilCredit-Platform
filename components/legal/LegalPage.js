'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Mail } from 'lucide-react';
import Navbar from '@/components/soilcredit/Navbar';
import Footer from '@/components/soilcredit/Footer';
import AuthModal from '@/components/soilcredit/AuthModal';
import { useLang } from '@/lib/providers';

const contactEmail = 'soilcreditazerbaijan@gmail.com';

export default function LegalPage({ pageKey }) {
  const { lang, languageReady, t } = useLang();
  const [auth, setAuth] = useState({ open: false, mode: 'signup' });
  const page = t(`legal.pages.${pageKey}`);

  useEffect(() => {
    if (!languageReady || !page || typeof page === 'string') return;
    const timeout = window.setTimeout(() => {
      document.title = `${page.title} | SoilCredit`;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.setAttribute('content', page.description);
      const openGraphTitle = document.querySelector('meta[property="og:title"]');
      if (openGraphTitle) openGraphTitle.setAttribute('content', page.title);
      const openGraphDescription = document.querySelector('meta[property="og:description"]');
      if (openGraphDescription) openGraphDescription.setAttribute('content', page.description);
      const openGraphLocale = document.querySelector('meta[property="og:locale"]');
      if (openGraphLocale) openGraphLocale.setAttribute('content', lang === 'az' ? 'az_AZ' : 'en_US');
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [lang, languageReady, page]);

  if (!page || typeof page === 'string') return null;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar onOpenAuth={(mode = 'signup') => setAuth({ open: true, mode })} />
      <article className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <nav aria-label={t('legal.breadcrumb')} className="mb-8 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-700">{t('legal.home')}</Link>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span>{t('legal.breadcrumb')}</span>
        </nav>

        <header className="border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">{t('legal.breadcrumb')}</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">{page.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{page.description}</p>
          <p className="mt-4 text-sm text-slate-500">{t('legal.lastUpdated')}</p>
        </header>

        {page.notice ? (
          <aside className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-900">
            {page.notice}
          </aside>
        ) : null}

        <div className="mt-8 space-y-8">
          {page.sections.map((section) => (
            <section key={section.heading} className="scroll-mt-24">
              <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">{section.heading}</h2>
              <div className="mt-3 space-y-4 text-[15px] leading-7 text-slate-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-slate-900">{t('legal.contactLabel')}</h2>
          <a href={`mailto:${contactEmail}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {contactEmail}
          </a>
        </aside>
      </article>
      <Footer />
      <AuthModal open={auth.open} mode={auth.mode} onClose={() => setAuth((current) => ({ ...current, open: false }))} />
    </main>
  );
}
