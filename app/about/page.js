import AboutPage from '@/components/soilcredit/AboutPage';

export const metadata = {
  title: 'About Us',
  description: 'Learn about SoilCredit, our mission, and the people working on environmental technology for more sustainable land management.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Us | SoilCredit',
    description: 'Learn about SoilCredit, our mission, and the people working on environmental technology for more sustainable land management.',
    url: '/about',
  },
};

export default function AboutRoute() {
  return <AboutPage />;
}
