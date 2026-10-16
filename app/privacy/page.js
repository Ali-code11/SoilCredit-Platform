import LegalPage from '@/components/legal/LegalPage';

export const metadata = {
  title: 'Privacy Policy',
  description: 'How SoilCredit collects, uses, stores, and protects personal information when you use the platform.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return <LegalPage pageKey="privacy" />;
}
