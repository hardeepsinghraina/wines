'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ClubTier {
  id: string;
  name: string;
  price: number;
  bottles: number;
  description: string;
  features: string[];
  popular?: boolean;
  savings: string;
}

interface Preference {
  id: string;
  label: string;
  options: string[];
}

const clubTiers: ClubTier[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    price: 89,
    bottles: 2,
    description: 'Perfect for discovering new wines and regions',
    savings: 'Save 15%',
    features: [
      '2 carefully selected bottles monthly',
      'Tasting notes and pairing suggestions',
      'Access to member-only wines',
      'Free shipping on club orders',
      '10% discount on additional purchases'
    ]
  },
  {
    id: 'connoisseur',
    name: 'Connoisseur',
    price: 179,
    bottles: 4,
    description: 'Curated selection for the discerning wine lover',
    popular: true,
    savings: 'Save 20%',
    features: [
      '4 premium bottles monthly',
      'Detailed tasting notes and stories',
      'Exclusive access to limited releases',
      'Free shipping worldwide',
      '15% discount on additional purchases',
      'Quarterly virtual tasting events',
      'Wine storage recommendations'
    ]
  },
  {
    id: 'collector',
    name: 'Collector',
    price: 349,
    bottles: 6,
    description: 'Ultra-premium wines for serious collectors',
    savings: 'Save 25%',
    features: [
      '6 exceptional bottles monthly',
      'Rare and allocated wines',
      'Personal sommelier consultation',
      'Priority access to new releases',
      'Free expedited shipping',
      '20% discount on additional purchases',
      'Monthly virtual tastings with winemakers',
      'Cellar management advice',
      'Investment wine recommendations'
    ]
  }
];

const preferences: Preference[] = [
  {
    id: 'wineType',
    label: 'Wine Preference',
    options: ['Red wines only', 'White wines only', 'Mixed selection', 'Sparkling focus', 'No preference']
  },
  {
    id: 'region',
    label: 'Regional Preference',
    options: ['Old World (Europe)', 'New World (Americas, Australia)', 'Mixed regions', 'Specific region', 'No preference']
  },
  {
    id: 'style',
    label: 'Style Preference',
    options: ['Bold & full-bodied', 'Light & elegant', 'Crisp & fresh', 'Rich & complex', 'Adventurous selection']
  },
  {
    id: 'budget',
    label: 'Price Range',
    options: ['Value wines ($15-30)', 'Premium wines ($30-60)', 'Luxury wines ($60-100)', 'Ultra-premium ($100+)', 'Mixed price points']
  }
];

export function WineClub() {
  const [selectedTier, setSelectedTier] = useState<string>('connoisseur');
  const [selectedPreferences, setSelectedPreferences] = useState<Record<string, string>>({});
  const [showSignup, setShowSignup] = useState(false);

  const handlePreferenceChange = (preferenceId: string, value: string) => {
    setSelectedPreferences(prev => ({
      ...prev,
      [preferenceId]: value
    }));
  };

  const selectedClub = clubTiers.find(tier => tier.id === selectedTier);

  if (showSignup) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button 
            onClick={() => setShowSignup(false)}
            className="mb-6"
          >
            ← Back to Wine Club
          </Button>
          
          <Card className="p-8">
            <h1 className="text-3xl font-bold text-center mb-6">Join the Wine Club</h1>
            
            {selectedClub && (
              <div className="mb-8 p-6 bg-purple-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">{selectedClub.name} Membership</h2>
                <div className="flex justify-between items-center">
                  <span>{selectedClub.bottles} bottles monthly</span>
                  <span className="text-2xl font-bold">${selectedClub.price}/month</span>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Customize Your Preferences</h3>
              
              {preferences.map((preference) => (
                <div key={preference.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {preference.label}
                  </label>
                  <div className="space-y-2">
                    {preference.options.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name={preference.id}
                          value={option}
                          checked={selectedPreferences[preference.id] === option}
                          onChange={(e) => handlePreferenceChange(preference.id, e.target.value)}
                          className="mr-3"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests or Allergies (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Any specific requests, allergies, or wines to avoid..."
                />
              </div>

              <div className="pt-6 border-t">
                <Button className="w-full text-lg py-3">
                  Start My Membership - ${selectedClub?.price}/month
                </Button>
                <p className="text-center text-sm text-gray-500 mt-2">
                  Cancel anytime. First shipment arrives within 5-7 business days.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Wine Club Membership</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Join thousands of wine enthusiasts who trust us to deliver exceptional wines to their door every month. 
          Discover new favorites and expand your palate with our expertly curated selections.
        </p>
      </div>

      {/* Hero Section */}
      <div className="mb-16">
        <Card className="p-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Why Join Our Wine Club?</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🍷</div>
                <div className="font-semibold">Expert Curation</div>
                <div className="text-sm opacity-90">Hand-selected by sommeliers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🌍</div>
                <div className="font-semibold">Global Selection</div>
                <div className="text-sm opacity-90">Wines from 15+ countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <div className="font-semibold">Member Savings</div>
                <div className="text-sm opacity-90">Up to 25% off retail prices</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📚</div>
                <div className="font-semibold">Education</div>
                <div className="text-sm opacity-90">Tasting notes & pairings</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Membership Tiers */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Choose Your Membership</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {clubTiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`p-6 relative cursor-pointer transition-all ${
                selectedTier === tier.id 
                  ? 'ring-2 ring-purple-500 shadow-lg' 
                  : 'hover:shadow-md'
              } ${tier.popular ? 'border-purple-500' : ''}`}
              onClick={() => setSelectedTier(tier.id)}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold text-purple-600 mb-1">${tier.price}</div>
                <div className="text-sm text-gray-500 mb-2">per month</div>
                <div className="text-lg font-medium text-gray-700">{tier.bottles} bottles</div>
                <div className="text-sm text-green-600 font-medium">{tier.savings}</div>
              </div>

              <p className="text-gray-600 text-center mb-6">{tier.description}</p>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-green-500 mr-2 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full ${selectedTier === tier.id ? '' : 'variant-outline'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTier(tier.id);
                  setShowSignup(true);
                }}
              >
                {selectedTier === tier.id ? 'Selected' : 'Select Plan'}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">1️⃣</span>
            </div>
            <h3 className="font-semibold mb-2">Choose Your Plan</h3>
            <p className="text-sm text-gray-600">Select the membership tier that fits your taste and budget</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">2️⃣</span>
            </div>
            <h3 className="font-semibold mb-2">Set Preferences</h3>
            <p className="text-sm text-gray-600">Tell us about your wine preferences and any restrictions</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">3️⃣</span>
            </div>
            <h3 className="font-semibold mb-2">Receive & Enjoy</h3>
            <p className="text-sm text-gray-600">Get your curated selection delivered monthly to your door</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">4️⃣</span>
            </div>
            <h3 className="font-semibold mb-2">Learn & Share</h3>
            <p className="text-sm text-gray-600">Rate wines and get personalized recommendations</p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">What Members Say</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
              <div>
                <div className="font-semibold">Sarah M.</div>
                <div className="text-sm text-gray-500">Connoisseur Member</div>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "The wine selection is incredible. I've discovered so many new favorites that I never would have found on my own. The tasting notes are spot-on!"
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
              <div>
                <div className="font-semibold">Michael R.</div>
                <div className="text-sm text-gray-500">Collector Member</div>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "As a serious collector, I appreciate the access to rare and allocated wines. The investment recommendations have been particularly valuable."
            </p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
              <div>
                <div className="font-semibold">Jennifer L.</div>
                <div className="text-sm text-gray-500">Explorer Member</div>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "Perfect for someone just getting into wine. The educational materials and pairing suggestions have taught me so much!"
            </p>
          </Card>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Can I skip a month or pause my membership?</h3>
            <p className="text-gray-600">Yes, you can skip any month or pause your membership at any time through your account dashboard. Just make sure to do so before the 15th of the month.</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">What if I don't like a wine?</h3>
            <p className="text-gray-600">We offer a satisfaction guarantee. If you're not happy with a selection, contact us and we'll make it right with a credit or replacement.</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Do you ship internationally?</h3>
            <p className="text-gray-600">Yes, we ship to most countries. International shipping rates and delivery times vary by location. Some restrictions may apply based on local laws.</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Can I change my membership tier?</h3>
            <p className="text-gray-600">Absolutely! You can upgrade or downgrade your membership at any time. Changes will take effect with your next shipment.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}