import './globals.css';

export const metadata = {
  title: 'SoilCredit — AI + Satellite Carbon Credits for a Regenerative Planet',
  description: 'SoilCredit connects landowners with ESG investors through AI, satellite technology, and verified carbon credit calculations. Turn your land into climate impact.',
  keywords: 'carbon credits, ESG, climate tech, satellite monitoring, AI carbon, soil carbon, green finance, blockchain verification',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-[#04140D] text-white overflow-x-hidden selection:bg-emerald-400/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
