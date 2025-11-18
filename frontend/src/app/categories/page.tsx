import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wine Categories | Luxury Wine Collection',
  description: 'Browse our wine categories including Bordeaux, Burgundy, Champagne, and more premium wine regions.',
  keywords: 'wine categories, bordeaux wine, burgundy wine, champagne, wine regions, luxury wine types',
};

import React from 'react'
import { Card } from '@/components/ui/Card'
import { CategoryCard } from '@/components/categories/CategoryCard'
import { ContactExpertButton } from '@/components/categories/ContactExpertButton'

const categories = [
  {
    id: 'bordeaux',
    name: 'Bordeaux',
    description: 'Premium wines from the prestigious Bordeaux region',
    image: '/images/categories/bordeaux.jpg',
    wineCount: 156,
    featured: true,
    regions: ['Left Bank', 'Right Bank', 'Entre-Deux-Mers']
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    description: 'Elegant Pinot Noir and Chardonnay from Burgundy',
    image: '/images/categories/burgundy.jpg',
    wineCount: 89,
    featured: true,
    regions: ['Côte d\'Or', 'Chablis', 'Beaujolais']
  },
  {
    id: 'champagne',
    name: 'Champagne',
    description: 'Luxury sparkling wines from the Champagne region',
    image: '/images/categories/champagne.jpg',
    wineCount: 67,
    featured: true,
    regions: ['Reims', 'Épernay', 'Aÿ']
  },
  {
    id: 'rhone',
    name: 'Rhône Valley',
    description: 'Bold and expressive wines from the Rhône Valley',
    image: '/images/categories/rhone-valley.jpg',
    wineCount: 78,
    featured: true,
    regions: ['Northern Rhône', 'Southern Rhône']
  },
  {
    id: 'tuscany',
    name: 'Tuscany',
    description: 'Iconic Italian wines including Chianti and Super Tuscans',
    image: '/images/categories/tuscany.jpg',
    wineCount: 134,
    featured: false,
    regions: ['Chianti Classico', 'Montalcino', 'Bolgheri']
  },
  {
    id: 'napa-valley',
    name: 'Napa Valley',
    description: 'World-class Cabernet Sauvignon from California',
    image: '/images/categories/napa-valley.jpg',
    wineCount: 89,
    featured: false,
    regions: ['Oakville', 'Rutherford', 'Stags Leap']
  },
  {
    id: 'world-wines',
    name: 'World Wines',
    description: 'Exceptional wines from around the globe',
    image: '/images/categories/world-wines.jpg',
    wineCount: 234,
    featured: false,
    regions: ['Italy', 'Spain', 'Australia', 'New Zealand']
  },
  {
    id: 'specialty-collections',
    name: 'Specialty Collections',
    description: 'Rare and exclusive wine collections',
    image: '/images/categories/specialty.jpg',
    wineCount: 45,
    featured: false,
    regions: ['Vintage Collections', 'Limited Editions', 'NFT Wines']
  }
]

export default function CategoriesPage() {
  const featuredCategories = categories.filter(cat => cat.featured)
  const otherCategories = categories.filter(cat => !cat.featured)

  return (
    <div className="min-h-screen bg-cream-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-charcoal-black mb-4">Wine Categories</h1>
          <p className="text-xl text-muted-olive max-w-3xl mx-auto">
            Explore our curated selection of premium wines from the world's most renowned regions
          </p>
        </div>

        {/* Featured Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-charcoal-black mb-8">Featured Collections</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredCategories.map((category) => (
              <CategoryCard key={category.id} category={category} featured={true} />
            ))}
          </div>
        </div>

        {/* Other Categories */}
        <div>
          <h2 className="text-2xl font-semibold text-charcoal-black mb-8">All Collections</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {otherCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="p-12 bg-gradient-to-r from-burgundy to-deep-burgundy text-white">
            <h2 className="text-3xl font-bold mb-4">Can't Find What You're Looking For?</h2>
            <p className="text-xl mb-8 opacity-90">
              Our wine experts are here to help you discover the perfect bottle
            </p>
            <ContactExpertButton />
          </Card>
        </div>
      </div>
    </div>
  )
}