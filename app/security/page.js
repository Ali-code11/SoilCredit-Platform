import LegalPage from '@/components/legal/LegalPage';

export const metadata = {
  title: 'Security',
  description: 'A factual overview of account security, access controls, infrastructure, and vulnerability reporting at SoilCredit.',
  alternates: { canonical: '/security' },
};

export default function SecurityPage() {
  return <LegalPage pageKey="security" />;
}
