import { Metadata } from 'next';
import { SalePage } from '@/components/product/SalePage';

export const metadata: Metadata = {
  title: 'Sale & Clearance | Luxury Wine Platform',
  description: 'Discover exceptional wines at reduced prices. Limited-time offers on premium selections.',
  keywords: 'wine sale, clearance wines, discounted wines, wine deals, special offers',
};

export default function Sale() {
  return <SalePage />;
}