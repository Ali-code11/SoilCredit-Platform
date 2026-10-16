'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const openAuth = (mode = 'signup') => setAuth({ open: true, mode });
  const closeAuth = () => setAuth({ open: false, mode: auth.mode });

  // Scroll to section if hash is in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        let targetId = hash.slice(1);
        try { targetId = decodeURIComponent(targetId); } catch {}
        if (targetId === 'team') {
          router.replace('/about#team');
          return;
        }
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [router]);

  const marqueeLeft = ['LAND', 'DATA', 'AI', 'CARBON', 'CREDIT', 'FUTURE'];
  const marqueeRight = ['SOILCREDIT', 'TURNING LAND INTO VALUE', 'SATELLITE', 'MARKETPLACE'];

  return (
    <main className="site-shell relative bg-white text-slate-900">
      <Navbar onOpenAuth={openAuth} />
      <Hero onOpenAuth={openAuth} />

      <div className="overflow-hidden border-y border-slate-200/80 bg-white">
        <div className="hero-marquee hero-marquee-left">
          <div className="hero-marquee-track">
            {[0, 1].map((copy) => (
              <div key={copy} className="hero-marquee-group" aria-hidden={copy === 1}>
                {marqueeLeft.map((item, idx) => <span key={`${item}-${idx}`} className="hero-marquee-item">{item}</span>)}
              </div>
            ))}
          </div>
        </div>
        <div className="hero-marquee hero-marquee-right">
          <div className="hero-marquee-track">
            {[0, 1].map((copy) => (
              <div key={copy} className="hero-marquee-group" aria-hidden={copy === 1}>
                {marqueeRight.map((item, idx) => <span key={`${item}-${idx}`} className="hero-marquee-item">{item}</span>)}
              </div>
            ))}
          </div>
        </div>
      </div>

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
