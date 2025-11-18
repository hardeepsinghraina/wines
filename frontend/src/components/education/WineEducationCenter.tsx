'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface EducationTopic {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  content: string[];
}

const educationTopics: EducationTopic[] = [
  {
    id: 'wine-basics',
    title: 'Wine Fundamentals',
    description: 'Essential knowledge about wine types, production, and characteristics',
    level: 'Beginner',
    duration: '15 min read',
    content: [
      'Understanding wine types: Red, White, Rosé, and Sparkling',
      'Basic wine production process from grape to bottle',
      'Key wine characteristics: Body, tannins, acidity, and sweetness',
      'Reading wine labels and understanding appellations',
      'Proper wine storage fundamentals'
    ]
  },
  {
    id: 'tasting-techniques',
    title: 'Wine Tasting Techniques',
    description: 'Professional wine tasting methods and sensory evaluation',
    level: 'Intermediate',
    duration: '20 min read',
    content: [
      'The five S\'s of wine tasting: See, Swirl, Smell, Sip, Savor',
      'Identifying aromas and flavors in wine',
      'Understanding wine structure and balance',
      'Taking proper tasting notes',
      'Developing your palate through practice'
    ]
  },
  {
    id: 'wine-regions',
    title: 'World Wine Regions',
    description: 'Explore major wine regions and their signature styles',
    level: 'Intermediate',
    duration: '25 min read',
    content: [
      'Old World vs New World wine regions',
      'French wine regions: Bordeaux, Burgundy, Champagne, Rhône',
      'Italian wine regions: Tuscany, Piedmont, Veneto',
      'New World regions: Napa Valley, Barossa Valley, Mendoza',
      'Climate and terroir influence on wine character'
    ]
  },
  {
    id: 'wine-investment',
    title: 'Wine as Investment',
    description: 'Understanding wine collecting and investment strategies',
    level: 'Advanced',
    duration: '30 min read',
    content: [
      'Factors that determine wine investment potential',
      'Building a balanced wine portfolio',
      'Understanding wine market trends and pricing',
      'Proper storage for investment wines',
      'When to buy, hold, and sell investment wines'
    ]
  }
];

export function WineEducationCenter() {
  const [selectedTopic, setSelectedTopic] = useState<EducationTopic | null>(null);
  const [filter, setFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

  const filteredTopics = educationTopics.filter(
    topic => filter === 'All' || topic.level === filter
  );

  if (selectedTopic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button 
          onClick={() => setSelectedTopic(null)}
          className="mb-6"
        >
          ← Back to Learning Center
        </Button>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
              selectedTopic.level === 'Beginner' ? 'bg-green-100 text-green-800' :
              selectedTopic.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {selectedTopic.level}
            </span>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{selectedTopic.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{selectedTopic.description}</p>
            <p className="text-sm text-gray-500">{selectedTopic.duration}</p>
          </div>

          <Card className="p-8">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold mb-6">What You'll Learn</h2>
              <ul className="space-y-3">
                {selectedTopic.content.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Ready to Continue Learning?</h3>
                <p className="text-gray-600 mb-4">
                  This is a comprehensive overview. For detailed lessons and interactive content, 
                  consider exploring our wine pairing guides and vintage information pages.
                </p>
                <div className="flex gap-4">
                  <Button onClick={() => setSelectedTopic(null)}>
                    Explore More Topics
                  </Button>
                  <Button variant="outline">
                    Wine Pairing Guide
                  </Button>
                </div>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Wine Education Center</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Expand your wine knowledge with our comprehensive learning resources. 
          From basics to advanced topics, discover the world of wine at your own pace.
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-center gap-4">
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
            <Button
              key={level}
              variant={filter === level ? 'primary' : 'outline'}
              onClick={() => setFilter(level)}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => (
          <Card key={topic.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                topic.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                topic.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {topic.level}
              </span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{topic.title}</h3>
              <p className="text-gray-600 mb-3">{topic.description}</p>
              <p className="text-sm text-gray-500">{topic.duration}</p>
            </div>
            
            <Button 
              onClick={() => setSelectedTopic(topic)}
              className="w-full"
            >
              Start Learning
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Card className="p-8 bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="text-2xl font-semibold mb-4">Looking for More?</h2>
          <p className="text-gray-600 mb-6">
            Explore our specialized guides and interactive tools to deepen your wine expertise.
          </p>
          <div className="flex justify-center gap-4">
            <Button>Wine Pairing Guide</Button>
            <Button variant="outline">Vintage Information</Button>
            <Button variant="outline">Storage Tips</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}