import { Metadata } from 'next';
import { WineStorageGuide } from '@/components/education/WineStorageGuide';

export const metadata: Metadata = {
  title: 'Wine Storage & Serving Tips | Luxury Wine Platform',
  description: 'Expert guidance on proper wine storage, serving temperatures, and preservation techniques.',
  keywords: 'wine storage, wine cellar, serving temperature, wine preservation, wine care',
};

export default function WineStoragePage() {
  return <WineStorageGuide />;
}