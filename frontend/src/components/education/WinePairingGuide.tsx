'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface PairingCategory {
  id: string;
  name: string;
  description: string;
  pairings: Pairing[];
}

interface Pairing {
  wine: string;
  wineType: string;
  food: string;
  description: string;
  tips: string[];
}

const pairingCategories: PairingCategory[] = [
  {
    id: 'red-wines',
    name: 'Red Wine Pairings',
    description: 'Classic and modern pairings for red wines',
    pairings: [
      {
        wine: 'Cabernet Sauvignon',
        wineType: 'Full-bodied Red',
        food: 'Grilled Steak & Red Meat',
        description: 'The bold tannins and rich fruit flavors complement the protein and fat in red meat.',
        tips: [
          'Choose well-marbled cuts for best pairing',
          'Grilled or roasted preparation enhances the match',
          'Add herbs like rosemary or thyme'
        ]
      },
      {
        wine: 'Pinot Noir',
        wineType: 'Light-bodied Red',
        food: 'Roasted Chicken & Salmon',
        description: 'Elegant and versatile, pairs beautifully with lighter proteins and earthy flavors.',
        tips: [
          'Works well with mushroom-based dishes',
          'Try with duck or game birds',
          'Complement with cherry or berry sauces'
        ]
      },
      {
        wine: 'Chianti Classico',
        wineType: 'Medium-bodied Red',
        food: 'Pasta with Tomato Sauce',
        description: 'High acidity cuts through rich tomato sauces and complements Italian herbs.',
        tips: [
          'Perfect with aged cheeses like Parmigiano',
          'Enhance with fresh basil and oregano',
          'Try with pizza margherita'
        ]
      }
    ]
  },
  {
    id: 'white-wines',
    name: 'White Wine Pairings',
    description: 'Refreshing combinations for white wines',
    pairings: [
      {
        wine: 'Chardonnay',
        wineType: 'Full-bodied White',
        food: 'Lobster & Creamy Seafood',
        description: 'Rich, buttery wines complement the sweetness and richness of shellfish.',
        tips: [
          'Oak-aged Chardonnay works best',
          'Add butter or cream-based sauces',
          'Try with roasted chicken or pork'
        ]
      },
      {
        wine: 'Sauvignon Blanc',
        wineType: 'Light-bodied White',
        food: 'Goat Cheese & Fresh Herbs',
        description: 'Crisp acidity and herbaceous notes create perfect harmony with tangy cheeses.',
        tips: [
          'Excellent with salads and light appetizers',
          'Pair with citrus-based dishes',
          'Try with sushi or raw preparations'
        ]
      },
      {
        wine: 'Riesling',
        wineType: 'Aromatic White',
        food: 'Spicy Asian Cuisine',
        description: 'Natural sweetness balances heat while acidity cleanses the palate.',
        tips: [
          'Works with Thai, Indian, and Chinese food',
          'Balance spice levels with wine sweetness',
          'Try with fruit-based desserts'
        ]
      }
    ]
  },
  {
    id: 'sparkling-wines',
    name: 'Sparkling Wine Pairings',
    description: 'Celebratory pairings for bubbles',
    pairings: [
      {
        wine: 'Champagne',
        wineType: 'Sparkling',
        food: 'Oysters & Caviar',
        description: 'Effervescence and acidity enhance briny, oceanic flavors.',
        tips: [
          'Serve both wine and food well-chilled',
          'Try with other raw shellfish',
          'Perfect for special occasions'
        ]
      },
      {
        wine: 'Prosecco',
        wineType: 'Sparkling',
        food: 'Prosciutto & Melon',
        description: 'Light, fruity bubbles complement salty-sweet combinations.',
        tips: [
          'Great for aperitifs and light appetizers',
          'Try with fresh fruit and soft cheeses',
          'Perfect for brunch pairings'
        ]
      }
    ]
  }
];

export function WinePairingGuide() {
  const [selectedCategory, setSelectedCategory] = useState<string>('red-wines');
  const [searchTerm, setSearchTerm] = useState('');

  const currentCategory = pairingCategories.find(cat => cat.id === selectedCategory);
  
  const filteredPairings = currentCategory?.pairings.filter(pairing =>
    pairing.wine.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pairing.food.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Wine Pairing Guide</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover the perfect wine and food combinations to elevate your dining experience. 
          Our expert recommendations will help you create memorable meals.
        </p>
      </div>

      <div className="mb-8">
        <div className="max-w-md mx-auto mb-6">
          <input
            type="text"
            placeholder="Search wines or foods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex justify-center gap-4 flex-wrap">
          {pairingCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {currentCategory && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-center mb-2">{currentCategory.name}</h2>
          <p className="text-gray-600 text-center">{currentCategory.description}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPairings.map((pairing, index) => (
          <Card key={index} className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{pairing.wine}</h3>
                <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded">
                  {pairing.wineType}
                </span>
              </div>
              <h4 className="text-lg font-medium text-gray-700 mb-3">{pairing.food}</h4>
              <p className="text-gray-600 mb-4">{pairing.description}</p>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Pairing Tips:</h5>
              <ul className="space-y-1">
                {pairing.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="text-sm text-gray-600 flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      {filteredPairings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No pairings found matching your search.</p>
        </div>
      )}

      <div className="mt-12">
        <Card className="p-8 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Pairing Principles</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-semibold mb-2">Complement</h3>
                <p className="text-sm text-gray-600">
                  Match similar flavors and intensities. Light wines with delicate dishes, bold wines with robust flavors.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Contrast</h3>
                <p className="text-sm text-gray-600">
                  Use opposing elements to create balance. Sweet wines with spicy food, acidic wines with rich dishes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Regional</h3>
                <p className="text-sm text-gray-600">
                  Traditional pairings from the same region often work beautifully together through centuries of evolution.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}