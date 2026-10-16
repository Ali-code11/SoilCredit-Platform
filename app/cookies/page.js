import LegalPage from '@/components/legal/LegalPage';

export const metadata = {
  title: 'Cookie Policy',
  description: 'Cookies and browser storage used by SoilCredit, including authentication and interface preferences.',
  alternates: { canonical: '/cookies' },
};

export default function CookiesPage() {
  return <LegalPage pageKey="cookies" />;
}
