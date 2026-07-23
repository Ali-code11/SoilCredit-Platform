import './globals.css';
import { Providers } from '@/lib/providers';

export const metadata = {
  title: 'SoilCredit — Turn Your Land Into Carbon Credits',
  description: 'SoilCredit uses AI and satellite imagery to certify unused lands in Azerbaijan and sell carbon credits to ESG companies.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-900 selection:bg-blue-100 selection:text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
