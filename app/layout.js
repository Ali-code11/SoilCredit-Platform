import './globals.css';
import { Providers } from '@/lib/providers';

export const metadata = {
  metadataBase: new URL('https://soilcredit.net'),
  title: {
    default: 'SoilCredit | AI-Powered Land and Carbon Credits',
    template: '%s | SoilCredit',
  },
  description: 'SoilCredit uses AI and satellite imagery to help measure land carbon potential and connect verified carbon credits with sustainability-focused companies.',
  applicationName: 'SoilCredit',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'SoilCredit',
    title: 'SoilCredit | AI-Powered Land and Carbon Credits',
    description: 'AI and satellite-powered tools for measuring land carbon potential and building a more sustainable future.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'SoilCredit | AI-Powered Land and Carbon Credits',
    description: 'AI and satellite-powered tools for measuring land carbon potential and building a more sustainable future.',
  },
  verification: {
    google: "DhuRRBhIM2rtc37SheTfQnsql1vEMrTk8Hsv723mRO0",
  },
  icons: {
    icon: '/soilfaviconblue.png',
    shortcut: '/soilfaviconblue.png',
  },
};



export default function RootLayout({ children }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'SoilCredit',
        url: 'https://soilcredit.net/',
        description: 'AI and satellite-powered tools for measuring land carbon potential and building a more sustainable future.',
      },
      {
        '@type': 'Organization',
        name: 'SoilCredit',
        url: 'https://soilcredit.net/',
        logo: 'https://soilcredit.net/soilfaviconblue.png',
      },
    ],
  };

  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-900 selection:bg-blue-100 selection:text-slate-900">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
