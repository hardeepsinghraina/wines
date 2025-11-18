'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface VintageData {
  year: number;
  bordeaux: number;
  burgundy: number;
  champagne: number;
  napa: number;
  tuscany: number;
  notes: string;
}

interface RegionInfo {
  id: string;
  name: string;
  description: string;
  keyFactors: string[];
}

const vintageData: VintageData[] = [
  {
    year: 2020,
    bordeaux: 95,
    burgundy: 92,
    champagne: 88,
    napa: 94,
    tuscany: 90,
    notes: 'Exceptional year across most regions despite pandemic challenges. Great concentration and balance.'
  },
  {
    year: 2019,
    bordeaux: 88,
    burgundy: 95,
    champagne: 90,
    napa: 92,
    tuscany: 93,
    notes: 'Outstanding Burgundy vintage. Good to excellent across other regions with ideal growing conditions.'
  },
  {
    year: 2018,
    bordeaux: 92,
    burgundy: 85,
    champagne: 87,
    napa: 89,
    tuscany: 88,
    notes: 'Strong Bordeaux year with perfect ripening conditions. Variable results in other regions.'
  },
  {
    year: 2017,
    bordeaux: 85,
    burgundy: 88,
    champagne: 85,
    napa: 87,
    tuscany: 85,
    notes: 'Challenging year with weather issues in many regions. Some exceptional wines from top producers.'
  },
  {
    year: 2016,
    bordeaux: 94,
    burgundy: 90,
    champagne: 92,
    napa: 95,
    tuscany: 91,
    notes: 'Excellent vintage across the board. Ideal conditions produced wines of great depth and longevity.'
  },
  {
    year: 2015,
    bordeaux: 90,
    burgundy: 87,
    champagne: 89,
    napa: 93,
    tuscany: 89,
    notes: 'Very good year with warm, dry conditions. Particularly strong in Napa Valley.'
  },
  {
    year: 2014,
    bordeaux: 87,
    burgundy: 89,
    champagne: 86,
    napa: 88,
    tuscany: 87,
    notes: 'Good vintage with some regional variation. Elegant wines with good aging potential.'
  },
  {
    year: 2013,
    bordeaux: 82,
    burgundy: 85,
    champagne: 84,
    napa: 86,
    tuscany: 83,
    notes: 'Challenging vintage with difficult weather. Careful selection required.'
  },
  {
    year: 2012,
    bordeaux: 88,
    burgundy: 91,
    champagne: 87,
    napa: 90,
    tuscany: 88,
    notes: 'Very good year, particularly strong in Burgundy. Well-balanced wines with good structure.'
  },
  {
    year: 2010,
    bordeaux: 96,
    burgundy: 93,
    champagne: 94,
    napa: 94,
    tuscany: 92,
    notes: 'Legendary vintage across all major regions. Exceptional concentration and aging potential.'
  }
];

const regionInfo: RegionInfo[] = [
  {
    id: 'bordeaux',
    name: 'Bordeaux',
    description: 'Home to some of the world\'s most prestigious wines, Bordeaux produces primarily Cabernet Sauvignon and Merlot blends.',
    keyFactors: [
      'Atlantic climate influence',
      'Gravel and clay soils',
      'Blend-focused winemaking',
      'Long aging potential'
    ]
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    description: 'Famous for Pinot Noir and Chardonnay, Burgundy emphasizes terroir expression and single-vineyard wines.',
    keyFactors: [
      'Continental climate',
      'Limestone-rich soils',
      'Single-variety focus',
      'Terroir-driven approach'
    ]
  },
  {
    id: 'champagne',
    name: 'Champagne',
    description: 'The birthplace of sparkling wine, producing the world\'s most celebrated bubbles through traditional methods.',
    keyFactors: [
      'Cool climate conditions',
      'Chalk soils',
      'Traditional method production',
      'Blend of three grape varieties'
    ]
  },
  {
    id: 'napa',
    name: 'Napa Valley',
    description: 'California\'s premier wine region, known for powerful Cabernet Sauvignon and innovative winemaking.',
    keyFactors: [
      'Mediterranean climate',
      'Diverse soil types',
      'Modern winemaking techniques',
      'Consistent quality'
    ]
  },
  {
    id: 'tuscany',
    name: 'Tuscany',
    description: 'Italian region famous for Chianti and Super Tuscans, combining tradition with modern innovation.',
    keyFactors: [
      'Mediterranean climate',
      'Sangiovese grape focus',
      'Historic winemaking traditions',
      'Diverse appellations'
    ]
  }
];

export function VintageInformation() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(true);

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'bg-green-500';
    if (score >= 90) return 'bg-green-400';
    if (score >= 85) return 'bg-yellow-400';
    if (score >= 80) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getScoreText = (score: number) => {
    if (score >= 95) return 'Exceptional';
    if (score >= 90) return 'Excellent';
    if (score >= 85) return 'Very Good';
    if (score >= 80) return 'Good';
    return 'Fair';
  };

  if (selectedRegion) {
    const region = regionInfo.find(r => r.id === selectedRegion);
    if (!region) return null;

    return (
      <div className="container mx-auto px-4 py-8">
        <Button 
          onClick={() => setSelectedRegion(null)}
          className="mb-6"
        >
          ← Back to Vintage Charts
        </Button>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{region.name}</h1>
          <p className="text-xl text-gray-600 mb-8">{region.description}</p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Key Factors</h2>
              <ul className="space-y-3">
                {region.keyFactors.map((factor, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Recent Vintages</h2>
              <div className="space-y-3">
                {vintageData.slice(0, 5).map((vintage) => {
                  const score = vintage[selectedRegion as keyof VintageData] as number;
                  return (
                    <div key={vintage.year} className="flex items-center justify-between">
                      <span className="font-medium">{vintage.year}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getScoreColor(score)}`}></div>
                        <span className="text-sm">{score}/100</span>
                        <span className="text-xs text-gray-500">{getScoreText(score)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Vintage Notes</h2>
            <div className="space-y-4">
              {vintageData.slice(0, 5).map((vintage) => (
                <div key={vintage.year} className="border-l-4 border-purple-200 pl-4">
                  <h3 className="font-semibold text-lg">{vintage.year}</h3>
                  <p className="text-gray-600">{vintage.notes}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Vintage Information</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore vintage quality ratings and detailed information for major wine regions. 
          Make informed decisions about when to drink or cellar your wines.
        </p>
      </div>

      <div className="mb-8 flex justify-center gap-4">
        <Button
          variant={showChart ? 'primary' : 'outline'}
          onClick={() => setShowChart(true)}
        >
          Vintage Chart
        </Button>
        <Button
          variant={!showChart ? 'primary' : 'outline'}
          onClick={() => setShowChart(false)}
        >
          Region Details
        </Button>
      </div>

      {showChart ? (
        <div className="mb-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 text-center">Vintage Quality Chart</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Year</th>
                    <th className="text-center py-3 px-4">Bordeaux</th>
                    <th className="text-center py-3 px-4">Burgundy</th>
                    <th className="text-center py-3 px-4">Champagne</th>
                    <th className="text-center py-3 px-4">Napa Valley</th>
                    <th className="text-center py-3 px-4">Tuscany</th>
                  </tr>
                </thead>
                <tbody>
                  {vintageData.map((vintage) => (
                    <tr key={vintage.year} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{vintage.year}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getScoreColor(vintage.bordeaux)}`}></div>
                          <span>{vintage.bordeaux}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getScoreColor(vintage.burgundy)}`}></div>
                          <span>{vintage.burgundy}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getScoreColor(vintage.champagne)}`}></div>
                          <span>{vintage.champagne}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getScoreColor(vintage.napa)}`}></div>
                          <span>{vintage.napa}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getScoreColor(vintage.tuscany)}`}></div>
                          <span>{vintage.tuscany}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>95-100 Exceptional</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span>90-94 Excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span>85-89 Very Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <span>80-84 Good</span>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regionInfo.map((region) => (
            <Card key={region.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{region.name}</h3>
              <p className="text-gray-600 mb-4">{region.description}</p>
              <Button 
                onClick={() => setSelectedRegion(region.id)}
                className="w-full"
              >
                View Details
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}