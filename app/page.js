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
import Team from '@/components/soilcredit/Team';
import FAQ from '@/components/soilcredit/FAQ';
import Footer from '@/components/soilcredit/Footer';

function App() {
  const [auth, setAuth] = useState({ open: false, mode: 'signup' });
  const [teamOpen, setTeamOpen] = useState(false);
  const openAuth = (mode = 'signup') => setAuth({ open: true, mode });
  const closeAuth = () => setAuth({ open: false, mode: auth.mode });
  const openTeam = () => setTeamOpen(true);
  const closeTeam = () => setTeamOpen(false);

  // Scroll to section if hash is in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        let targetId = hash.slice(1);
        try { targetId = decodeURIComponent(targetId); } catch {}
        if (targetId === 'team') {
          setTeamOpen(true);
          return;
        }
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  const marqueeLeft = ['LAND', 'DATA', 'AI', 'CARBON', 'CREDIT', 'FUTURE'];
  const marqueeRight = ['SOILCREDIT', 'TURNING LAND INTO VALUE', 'SATELLITE', 'MARKETPLACE'];

  return (
    <main className="site-shell relative bg-white text-slate-900">
      <Navbar onOpenAuth={openAuth} onOpenTeam={openTeam} />
      <Hero onOpenAuth={openAuth} />

      <div className="overflow-hidden border-y border-slate-200/80 bg-white">
        <div className="hero-marquee hero-marquee-left">
          <div className="hero-marquee-track">
            {[...marqueeLeft, ...marqueeLeft].map((item, idx) => (
              <span key={`${item}-${idx}`} className="hero-marquee-item">{item}</span>
            ))}
          </div>
        </div>
        <div className="hero-marquee hero-marquee-right">
          <div className="hero-marquee-track">
            {[...marqueeRight, ...marqueeRight].map((item, idx) => (
              <span key={`${item}-${idx}`} className="hero-marquee-item">{item}</span>
            ))}
          </div>
        </div>
      </div>

      <WhySoilCredit />
      <HowItWorks />
      <Features />
      <Calculator />
      <Marketplace onOpenAuth={openAuth} />
      <Team isOpen={teamOpen} onOpen={openTeam} onClose={closeTeam} />
      <FAQ />
      <Footer />
      <AuthModal open={auth.open} mode={auth.mode} onClose={closeAuth} />
    </main>
  );
}

export default App;
