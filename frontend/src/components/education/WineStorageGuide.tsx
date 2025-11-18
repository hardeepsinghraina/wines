'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface StorageSection {
  id: string;
  title: string;
  icon: string;
  content: {
    overview: string;
    tips: string[];
    details?: string[];
  };
}

interface ServingTemp {
  wineType: string;
  temperature: string;
  celsius: string;
  notes: string;
}

const storageSections: StorageSection[] = [
  {
    id: 'temperature',
    title: 'Temperature Control',
    icon: '🌡️',
    content: {
      overview: 'Consistent temperature is the most critical factor in wine storage. Fluctuations can damage wine quality.',
      tips: [
        'Maintain 55°F (13°C) for optimal long-term storage',
        'Avoid temperature fluctuations greater than 5°F',
        'Never store wine above 70°F (21°C)',
        'Cooler is better than warmer for aging'
      ],
      details: [
        'Temperature fluctuations cause wine to expand and contract, potentially pushing cork out',
        'High temperatures accelerate aging and can cook the wine',
        'Consistent cool temperatures preserve wine\'s complexity and aging potential'
      ]
    }
  },
  {
    id: 'humidity',
    title: 'Humidity Management',
    icon: '💧',
    content: {
      overview: 'Proper humidity prevents cork drying and maintains wine quality during storage.',
      tips: [
        'Maintain 60-70% relative humidity',
        'Use humidifier if environment is too dry',
        'Ensure good air circulation to prevent mold',
        'Monitor with hygrometer regularly'
      ],
      details: [
        'Low humidity dries out corks, allowing air to enter and spoil wine',
        'High humidity can promote mold growth on labels and corks',
        'Proper humidity keeps corks elastic and maintains seal'
      ]
    }
  },
  {
    id: 'light',
    title: 'Light Protection',
    icon: '🔆',
    content: {
      overview: 'Light, especially UV rays, can degrade wine and cause premature aging.',
      tips: [
        'Store in complete darkness when possible',
        'Use UV-filtering glass for wine displays',
        'Avoid fluorescent and direct sunlight',
        'Keep wines in original boxes for protection'
      ],
      details: [
        'UV light breaks down compounds in wine, creating off-flavors',
        'Even artificial light can damage wine over time',
        'Dark bottles provide some protection but not complete'
      ]
    }
  },
  {
    id: 'position',
    title: 'Storage Position',
    icon: '📐',
    content: {
      overview: 'Proper positioning keeps corks moist and prevents oxidation.',
      tips: [
        'Store bottles horizontally to keep cork moist',
        'Slight downward angle is acceptable',
        'Sparkling wines can be stored upright short-term',
        'Avoid frequent movement and vibration'
      ],
      details: [
        'Horizontal storage keeps wine in contact with cork',
        'Moist cork maintains proper seal against oxidation',
        'Vertical storage for extended periods can dry out cork'
      ]
    }
  }
];

const servingTemperatures: ServingTemp[] = [
  {
    wineType: 'Light White Wines',
    temperature: '45-50°F',
    celsius: '7-10°C',
    notes: 'Sauvignon Blanc, Pinot Grigio, Albariño'
  },
  {
    wineType: 'Full-bodied White Wines',
    temperature: '50-55°F',
    celsius: '10-13°C',
    notes: 'Chardonnay, White Burgundy, Viognier'
  },
  {
    wineType: 'Sparkling Wines',
    temperature: '40-45°F',
    celsius: '4-7°C',
    notes: 'Champagne, Prosecco, Cava'
  },
  {
    wineType: 'Light Red Wines',
    temperature: '55-60°F',
    celsius: '13-15°C',
    notes: 'Pinot Noir, Beaujolais, Light Chianti'
  },
  {
    wineType: 'Medium Red Wines',
    temperature: '60-65°F',
    celsius: '15-18°C',
    notes: 'Merlot, Sangiovese, Côtes du Rhône'
  },
  {
    wineType: 'Full-bodied Red Wines',
    temperature: '65-68°F',
    celsius: '18-20°C',
    notes: 'Cabernet Sauvignon, Syrah, Barolo'
  },
  {
    wineType: 'Dessert Wines',
    temperature: '45-50°F',
    celsius: '7-10°C',
    notes: 'Port, Sauternes, Ice Wine'
  }
];

export function WineStorageGuide() {
  const [activeSection, setActiveSection] = useState<string>('temperature');
  const [showServing, setShowServing] = useState(false);

  const currentSection = storageSections.find(section => section.id === activeSection);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Wine Storage & Serving Guide</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Learn the essential principles of wine storage and serving to preserve and enhance your wine collection.
        </p>
      </div>

      <div className="mb-8 flex justify-center gap-4">
        <Button
          variant={!showServing ? 'primary' : 'outline'}
          onClick={() => setShowServing(false)}
        >
          Storage Guide
        </Button>
        <Button
          variant={showServing ? 'primary' : 'outline'}
          onClick={() => setShowServing(true)}
        >
          Serving Temperatures
        </Button>
      </div>

      {!showServing ? (
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Storage Factors</h2>
              <div className="space-y-2">
                {storageSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-purple-100 text-purple-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{section.icon}</span>
                      <span className="font-medium">{section.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {currentSection && (
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{currentSection.icon}</span>
                  <h2 className="text-3xl font-bold text-gray-900">{currentSection.title}</h2>
                </div>
                
                <p className="text-lg text-gray-600 mb-6">{currentSection.content.overview}</p>
                
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Key Tips</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {currentSection.content.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {currentSection.content.details && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Why It Matters</h3>
                    <div className="space-y-3">
                      {currentSection.content.details.map((detail, index) => (
                        <p key={index} className="text-gray-600 border-l-4 border-purple-200 pl-4">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Optimal Serving Temperatures</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Wine Type</th>
                    <th className="text-center py-3 px-4">Temperature (°F)</th>
                    <th className="text-center py-3 px-4">Temperature (°C)</th>
                    <th className="text-left py-3 px-4">Examples</th>
                  </tr>
                </thead>
                <tbody>
                  {servingTemperatures.map((temp, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4 font-medium">{temp.wineType}</td>
                      <td className="py-4 px-4 text-center font-mono">{temp.temperature}</td>
                      <td className="py-4 px-4 text-center font-mono">{temp.celsius}</td>
                      <td className="py-4 px-4 text-gray-600">{temp.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Serving Tips</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Chilling Methods</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Refrigerator: 2-4 hours for whites</li>
                    <li>• Ice bucket: 15-20 minutes</li>
                    <li>• Freezer: 30 minutes (emergency only)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Warming Methods</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Room temperature: 30-60 minutes</li>
                    <li>• Gentle warming: Hold bowl of glass</li>
                    <li>• Never use microwave or hot water</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="mt-12">
        <Card className="p-8 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Storage Solutions</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-semibold mb-2">Wine Refrigerator</h3>
                <p className="text-sm text-gray-600">
                  Ideal for short to medium-term storage with precise temperature control and UV protection.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Wine Cellar</h3>
                <p className="text-sm text-gray-600">
                  Perfect for long-term aging with natural temperature stability and humidity control.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Wine Closet</h3>
                <p className="text-sm text-gray-600">
                  Convert existing space with proper insulation, cooling, and humidity management.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}