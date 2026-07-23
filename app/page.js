'use client';
import Navbar from '@/components/soilcredit/Navbar';
import Hero from '@/components/soilcredit/Hero';
import About from '@/components/soilcredit/About';
import HowItWorks from '@/components/soilcredit/HowItWorks';
import Features from '@/components/soilcredit/Features';
import Calculator from '@/components/soilcredit/Calculator';
import Marketplace from '@/components/soilcredit/Marketplace';
import Dashboard from '@/components/soilcredit/Dashboard';
import MapSection from '@/components/soilcredit/MapSection';
import Partners from '@/components/soilcredit/Partners';
import Testimonials from '@/components/soilcredit/Testimonials';
import FAQ from '@/components/soilcredit/FAQ';
import Contact from '@/components/soilcredit/Contact';
import Footer from '@/components/soilcredit/Footer';

function App() {
  return (
    <main className="relative bg-[#04140D] text-white">
      <Navbar />
      <Hero />
      <Partners />
      <About />
      <HowItWorks />
      <Features />
      <Calculator />
      <Marketplace />
      <Dashboard />
      <MapSection />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}

export default App;
