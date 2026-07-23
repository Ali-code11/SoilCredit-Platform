'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Menu, X, Globe, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useLang, useAuth } from '@/lib/providers';
import Link from 'next/link';

export default function Navbar({ onOpenAuth }) {
  const { lang, setLang, t } = useLang();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: t('nav.home'), href: '#home' },
    { label: t('nav.why'), href: '#why' },
    { label: t('nav.how'), href: '#how' },
    { label: t('nav.calc'), href: '#calculator' },
    { label: t('nav.market'), href: '#marketplace' },
    { label: t('nav.faq'), href: '#faq' },
  ];

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_2px_20px_-8px_rgba(15,23,42,0.08)]' : 'bg-transparent'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Leaf className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-[22px] text-gradient-blue">SoilCredit</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {links.map((l) => (
                <a key={l.label} href={l.href} className="px-3 py-2 text-[14px] font-medium text-slate-600 hover:text-blue-600 transition">{l.label}</a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* Language switch */}
              <div className="hidden sm:flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5">
                <Globe className="h-3.5 w-3.5 text-slate-500" />
                <button onClick={() => setLang('en')} className={`text-[12px] font-semibold px-1.5 rounded ${lang==='en' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>EN</button>
                <span className="text-slate-300">/</span>
                <button onClick={() => setLang('az')} className={`text-[12px] font-semibold px-1.5 rounded ${lang==='az' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>AZ</button>
              </div>

              {user ? (
                <div className="relative">
                  <button onClick={() => setMenu(m => !m)} className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 hover:border-blue-200 transition">
                    <span className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">{(user.name||'?').slice(0,2).toUpperCase()}</span>
                    <span className="max-w-[110px] truncate">{user.name}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <AnimatePresence>
                    {menu && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl p-2">
                        <div className="px-3 py-2 border-b border-slate-100">
                          <div className="text-[13px] font-semibold text-slate-900 truncate">{user.name}</div>
                          <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                          <div className="mt-1 inline-flex text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{user.role}</div>
                        </div>
                        <Link href="/dashboard" onClick={() => setMenu(false)} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 rounded-lg"><LayoutDashboard className="h-4 w-4" /> {t('nav.dashboard')}</Link>
                        <button onClick={() => { setMenu(false); logout(); }} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-rose-600 hover:bg-rose-50 rounded-lg"><LogOut className="h-4 w-4" /> {t('nav.logout')}</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <button onClick={() => onOpenAuth?.('login')} className="hidden sm:inline-flex text-[13.5px] font-medium text-slate-600 hover:text-slate-900 px-3 py-2 transition">{t('nav.login')}</button>
                  <button onClick={() => onOpenAuth?.('signup')} className="btn-primary inline-flex items-center rounded-xl px-4 py-2 text-[13.5px] font-semibold">{t('nav.signup')}</button>
                </>
              )}

              <button onClick={() => setOpen(true)} className="lg:hidden ml-1 p-2 rounded-lg border border-slate-200 bg-white">
                <Menu className="h-5 w-5 text-slate-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 260 }}
              className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center"><Leaf className="h-4 w-4 text-white" strokeWidth={2.5} /></div><span className="font-display font-bold text-lg text-gradient-blue">SoilCredit</span></div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg border border-slate-200"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex flex-col gap-1">
                {links.map((l) => (
                  <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700">{l.label}</a>
                ))}
                <div className="flex items-center gap-2 px-4 py-3"><span className="text-[12px] text-slate-500">Language:</span>
                  <button onClick={() => setLang('en')} className={`text-[12px] font-semibold px-2 py-1 rounded ${lang==='en' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>EN</button>
                  <button onClick={() => setLang('az')} className={`text-[12px] font-semibold px-2 py-1 rounded ${lang==='az' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>AZ</button>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
                  {user ? (<>
                    <Link href="/dashboard" onClick={() => setOpen(false)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-center">{t('nav.dashboard')}</Link>
                    <button onClick={() => { setOpen(false); logout(); }} className="w-full px-4 py-3 rounded-xl border border-rose-200 text-rose-600">{t('nav.logout')}</button>
                  </>) : (<>
                    <button onClick={() => { setOpen(false); onOpenAuth?.('login'); }} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700">{t('nav.login')}</button>
                    <button onClick={() => { setOpen(false); onOpenAuth?.('signup'); }} className="w-full btn-primary px-4 py-3 rounded-xl font-semibold">{t('nav.signup')}</button>
                  </>)}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
