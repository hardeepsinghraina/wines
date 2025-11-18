import { Metadata } from 'next';
import { WineClub } from '@/components/product/WineClub';

export const metadata: Metadata = {
  title: 'Wine Club & Subscriptions | Luxury Wine Platform',
  description: 'Join our exclusive wine club for curated monthly selections and member benefits.',
  keywords: 'wine club, wine subscription, monthly wines, wine delivery, exclusive wines',
};

export default function WineClubPage() {
  return <WineClub />;
}