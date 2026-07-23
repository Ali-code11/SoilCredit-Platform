'use client';
import { useState } from 'react';
import Navbar from '@/components/soilcredit/Navbar';
import AuthModal from '@/components/soilcredit/AuthModal';
import Hero from '@/components/soilcredit/Hero';
import WhySoilCredit from '@/components/soilcredit/WhySoilCredit';
import HowItWorks from '@/components/soilcredit/HowItWorks';
import Features from '@/components/soilcredit/Features';
import Calculator from '@/components/soilcredit/Calculator';
import Marketplace from '@/components/soilcredit/Marketplace';
import FAQ from '@/components/soilcredit/FAQ';
import Footer from '@/components/soilcredit/Footer';

function App() {
  const [auth, setAuth] = useState({ open: false, mode: 'signup' });
  const openAuth = (mode = 'signup') => setAuth({ open: true, mode });
  const closeAuth = () => setAuth({ open: false, mode: auth.mode });

  return (
    <main className="relative bg-white text-slate-900">
      <Navbar onOpenAuth={openAuth} />
      <Hero onOpenAuth={openAuth} />
      <WhySoilCredit />
      <HowItWorks />
      <Features />
      <Calculator />
      <Marketplace onOpenAuth={openAuth} />
      <FAQ />
      <Footer />
      <AuthModal open={auth.open} mode={auth.mode} onClose={closeAuth} />
    </main>
  );
}

export default App;
