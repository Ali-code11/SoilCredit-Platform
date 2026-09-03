'use client';
import { useState, useEffect } from 'react';
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

  // Scroll to section if hash is in URL
  useEffect(() => {
    const resetToken = new URLSearchParams(window.location.search).get('resetToken');
    if (resetToken) setAuth({ open: true, mode: 'reset' });
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

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
