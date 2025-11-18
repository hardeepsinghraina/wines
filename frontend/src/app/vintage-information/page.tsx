import { Metadata } from 'next';
import { VintageInformation } from '@/components/education/VintageInformation';

export const metadata: Metadata = {
  title: 'Vintage Information & Charts | Luxury Wine Platform',
  description: 'Comprehensive vintage charts and information for major wine regions and producers.',
  keywords: 'wine vintage, vintage chart, wine years, wine aging, vintage quality',
};

export default function VintageInformationPage() {
  return <VintageInformation />;
}