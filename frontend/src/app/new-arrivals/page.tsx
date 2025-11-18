import { Metadata } from 'next';
import { NewArrivals } from '@/components/product/NewArrivals';

export const metadata: Metadata = {
  title: 'New Arrivals | Luxury Wine Platform',
  description: 'Discover the latest additions to our luxury wine collection. Premium wines from renowned producers.',
  keywords: 'new wines, latest arrivals, premium wines, luxury collection, wine releases',
};

export default function NewArrivalsPage() {
  return <NewArrivals />;
}