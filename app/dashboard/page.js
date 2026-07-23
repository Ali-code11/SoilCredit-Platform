'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useLang } from '@/lib/providers';
import Navbar from '@/components/soilcredit/Navbar';
import LandownerDashboard from '@/components/dashboard/LandownerDashboard';
import CompanyDashboard from '@/components/dashboard/CompanyDashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [authModal, setAuthModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [loading, user, router]);

  if (loading || !user) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onOpenAuth={() => {}} />
      <div className="pt-24 pb-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="text-[13px] text-slate-500">{t('dash.welcome')},</div>
          <div className="font-display font-bold text-3xl md:text-4xl text-slate-900">{user.name}{user.company ? <span className="text-slate-400 font-normal text-xl md:text-2xl ml-2">· {user.company}</span> : null}</div>
          <div className="mt-1 inline-flex text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white">{user.role}</div>
        </div>
        {user.role === 'landowner' ? <LandownerDashboard /> : <CompanyDashboard />}
      </div>
    </div>
  );
}
