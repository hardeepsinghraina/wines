import { Metadata } from 'next';
import { WinePairingGuide } from '@/components/education/WinePairingGuide';

export const metadata: Metadata = {
  title: 'Wine Pairing Guide | Luxury Wine Platform',
  description: 'Expert wine and food pairing recommendations to enhance your dining experience.',
  keywords: 'wine pairing, food and wine, wine matching, dining, culinary',
};

export default function WinePairingPage() {
  return <WinePairingGuide />;
}