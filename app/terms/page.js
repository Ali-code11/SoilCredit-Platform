import LegalPage from '@/components/legal/LegalPage';

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms for using SoilCredit accounts, land tools, estimates, listings, and marketplace features.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return <LegalPage pageKey="terms" />;
}
