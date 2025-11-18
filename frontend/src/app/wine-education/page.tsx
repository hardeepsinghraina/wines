import { Metadata } from 'next';
import { WineEducationCenter } from '@/components/education/WineEducationCenter';

export const metadata: Metadata = {
  title: 'Wine Education & Learning Center | Luxury Wine Platform',
  description: 'Comprehensive wine education resources, guides, and learning materials for wine enthusiasts and collectors.',
  keywords: 'wine education, wine learning, wine knowledge, wine basics, wine appreciation',
};

export default function WineEducationPage() {
  return <WineEducationCenter />;
}