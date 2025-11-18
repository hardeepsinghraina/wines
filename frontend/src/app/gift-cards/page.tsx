import { Metadata } from 'next';
import { GiftCards } from '@/components/product/GiftCards';

export const metadata: Metadata = {
  title: 'Gift Cards | Luxury Wine Platform',
  description: 'Perfect gifts for wine lovers. Purchase and redeem gift cards for our luxury wine collection.',
  keywords: 'wine gift cards, wine gifts, gift certificates, wine presents, luxury gifts',
};

export default function GiftCardsPage() {
  return <GiftCards />;
}