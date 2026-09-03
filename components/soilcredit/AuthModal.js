'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Leaf, User, Building2, Loader2, CheckCircle2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useLang, useAuth } from '@/lib/providers';

export default function AuthModal({ open, mode, onClose }) {
  const { t } = useLang();
  const { login } = useAuth();
  const [tab, setTab] = useState(mode || 'signup');
  const [role, setRole] = useState('landowner');
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (open && mode) setTab(mode);
    const token = new URLSearchParams(window.location.search).get('resetToken');
    if (token) setResetToken(token);
  }, [open, mode]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      if (tab === 'forgot') {
        const r = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email }) });
        const d = await r.json();
        if (!d.ok) setErr(d.error || 'Reset request failed'); else { setNotice(`${d.message}${d.resetUrl ? `: ${d.resetUrl}` : ''}`); setTab('reset'); }
      } else if (tab === 'reset') {
        const r = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: resetToken, password: form.password }) });
        const d = await r.json();
        if (!d.ok) setErr(d.error || 'Password reset failed'); else { setNotice(d.message); setTab('login'); setForm((f) => ({ ...f, password: '' })); }
      } else if (tab === 'signup') {
        const r = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, role }) });
        const d = await r.json();
        if (!d.ok) setErr(d.error || 'Signup failed'); else { setNotice(`${t('auth.verifyEmail')}${d.verificationUrl ? `: ${d.verificationUrl}` : ''}`); setTab('login'); }
      } else {
        const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, password: form.password }) });
        const d = await r.json();
        if (!d.ok) setErr(d.error || 'Login failed'); else { login(d.token, d.user); onClose?.(); window.location.href = '/dashboard'; }
      }
    } catch { setErr('Network error'); }
    setLoading(false);
  };

  const changeTab = (nextTab) => { setErr(''); setNotice(''); setTab(nextTab); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ y: 40, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 relative">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center"><Leaf className="h-5 w-5 text-white" strokeWidth={2.5} /></div>
                <span className="font-display font-bold text-lg text-gradient-blue">SoilCredit</span>
              </div>
              <button onClick={onClose} className="absolute top-5 right-5 h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"><X className="h-4 w-4" /></button>
              <div className="flex gap-1 mt-4 p-1 bg-slate-100 rounded-xl">
                <button onClick={() => changeTab('signup')} className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition ${tab==='signup' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>{t('auth.signup')}</button>
                <button onClick={() => changeTab('login')} className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition ${tab==='login' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>{t('auth.login')}</button>
              </div>
            </div>

            <form onSubmit={submit} className="px-6 py-5 space-y-4">
              {(tab === 'forgot' || tab === 'reset') && <button type="button" onClick={() => changeTab('login')} className="flex items-center gap-1 text-[12px] text-slate-500 hover:text-blue-600"><ArrowLeft className="h-3.5 w-3.5" />{t('auth.backToLogin')}</button>}
              {tab === 'signup' && (
                <div>
                  <label className="text-[12.5px] font-medium text-slate-600 mb-2 block">{t('auth.role')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <RolePick active={role==='landowner'} onClick={() => setRole('landowner')} icon={User} title={t('auth.landowner')} hint={t('auth.landownerHint')} />
                    <RolePick active={role==='company'} onClick={() => setRole('company')} icon={Building2} title={t('auth.company')} hint={t('auth.companyHint')} />
                  </div>
                </div>
              )}

              {tab === 'forgot' && (
                <div><label className="text-[12.5px] font-medium text-slate-600 mb-1 block">{t('auth.email')}</label><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required className="field" placeholder="you@earth.co" /></div>
              )}
              {tab === 'signup' && (
                <div>
                  <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">{t('auth.name')}</label>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} required className="field" placeholder="Ada Lovelace" />
                </div>
              )}
              {tab === 'signup' && role === 'company' && (
                <div>
                  <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">{t('auth.companyName')}</label>
                  <input value={form.company} onChange={(e) => set('company', e.target.value)} className="field" placeholder="Acme ESG Corp." />
                </div>
              )}
              {tab !== 'forgot' && tab !== 'reset' && <div>
                <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">{t('auth.email')}</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required className="field" placeholder="you@earth.co" />
              </div>}
              {(tab === 'login' || tab === 'signup' || tab === 'reset') && <div>
                <label className="text-[12.5px] font-medium text-slate-600 mb-1 block">{t('auth.password')}</label>
                <div className="relative"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={6} className="field pr-10" placeholder="••••••••" /><button type="button" aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
              </div>}

              {tab === 'reset' && <div><label className="text-[12.5px] font-medium text-slate-600 mb-1 block">{t('auth.resetToken')}</label><input value={resetToken} onChange={(e) => setResetToken(e.target.value)} required className="field" placeholder="reset token" /></div>}

              {err && <div className="text-[12.5px] text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{err}</div>}
              {notice && <div className="text-[12.5px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 break-words">{notice}</div>}

              <button type="submit" disabled={loading} className="w-full btn-primary rounded-xl py-3 text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {tab === 'signup' ? t('auth.submitSignup') : tab === 'forgot' ? t('auth.sendReset') : tab === 'reset' ? t('auth.resetPassword') : t('auth.submitLogin')}
              </button>

              {tab === 'login' && <button type="button" onClick={() => changeTab('forgot')} className="w-full text-center text-[12.5px] text-blue-600 hover:text-blue-700">{t('auth.forgotPassword')}</button>}

              <div className="text-center text-[12.5px] text-slate-500">
                {tab === 'signup' ? (<button type="button" onClick={() => changeTab('login')} className="hover:text-blue-600">{t('auth.switchToLogin')}</button>) : (tab === 'login' ? <button type="button" onClick={() => changeTab('signup')} className="hover:text-blue-600">{t('auth.switchToSignup')}</button> : null)}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RolePick({ active, onClick, icon: Icon, title, hint }) {
  return (
    <button type="button" onClick={onClick}
      className={`text-left p-3 rounded-xl border-2 transition ${active ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${active ? 'bg-gradient-to-br from-blue-500 to-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}><Icon className="h-4 w-4" /></div>
      <div className="font-semibold text-[13px] text-slate-900">{title}</div>
      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{hint}</div>
    </button>
  );
}
