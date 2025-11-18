import { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Home, Truck, Zap, FileText, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Wine Insurance Services | Luxury Wine Collection',
  description: 'Comprehensive wine insurance coverage for your valuable collection, including storage, transit, and catastrophic loss protection.',
};

export default function InsurancePage() {
  const insuranceTypes = [
    {
      icon: Home,
      title: 'Collection Insurance',
      description: 'Comprehensive coverage for your entire wine collection against theft, damage, and loss.',
      coverage: 'Up to $10M'
    },
    {
      icon: Truck,
      title: 'Transit Insurance',
      description: 'Protection during shipping and transportation of wines worldwide.',
      coverage: 'Full replacement value'
    },
    {
      icon: Zap,
      title: 'Catastrophic Coverage',
      description: 'Protection against natural disasters, fire, flood, and other catastrophic events.',
      coverage: 'Market value replacement'
    },
    {
      icon: Shield,
      title: 'Authentication Insurance',
      description: 'Coverage against authenticity disputes and counterfeit wine purchases.',
      coverage: 'Purchase price refund'
    }
  ];

  const insurancePlans = [
    {
      name: 'Essential Coverage',
      value: 'Up to $50K',
      premium: '$299/year',
      features: ['Basic theft protection', 'Fire and flood coverage', 'Transit insurance', '24/7 claims support'],
      popular: false
    },
    {
      name: 'Premium Protection',
      value: 'Up to $250K',
      premium: '$899/year',
      features: ['Comprehensive coverage', 'Worldwide protection', 'Authentication guarantee', 'Expedited claims', 'Annual appraisal'],
      popular: true
    },
    {
      name: 'Collector\'s Elite',
      value: 'Up to $1M+',
      premium: '$2,499/year',
      features: ['Maximum coverage', 'White-glove claims service', 'Investment protection', 'Concierge support', 'Quarterly valuations'],
      popular: false
    }
  ];

  const claimsProcess = [
    {
      step: '1',
      title: 'Report Incident',
      description: 'Contact our 24/7 claims hotline or submit online claim form immediately.'
    },
    {
      step: '2',
      title: 'Documentation',
      description: 'Provide photos, receipts, and any relevant documentation of the loss.'
    },
    {
      step: '3',
      title: 'Assessment',
      description: 'Our wine experts assess the claim and determine coverage eligibility.'
    },
    {
      step: '4',
      title: 'Settlement',
      description: 'Receive compensation based on current market value or replacement cost.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-burgundy to-purple-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Wine Insurance</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Protect your valuable wine collection with comprehensive insurance coverage tailored for wine collectors
            </p>
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Get Quote
            </Button>
          </div>
        </div>
      </div>

      {/* Why Wine Insurance */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Wine Insurance?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Standard homeowner's insurance often provides inadequate coverage for wine collections
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-burgundy mb-2">$500-$2K</div>
            <div className="text-sm font-semibold mb-2">Typical Home Coverage</div>
            <p className="text-gray-600 text-sm">Standard homeowner's policy wine limit</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-burgundy mb-2">$50K+</div>
            <div className="text-sm font-semibold mb-2">Average Collection</div>
            <p className="text-gray-600 text-sm">Value of serious wine collections</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-burgundy mb-2">15%</div>
            <div className="text-sm font-semibold mb-2">Annual Appreciation</div>
            <p className="text-gray-600 text-sm">Average fine wine value increase</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-burgundy mb-2">24/7</div>
            <div className="text-sm font-semibold mb-2">Claims Support</div>
            <p className="text-gray-600 text-sm">Round-the-clock assistance</p>
          </Card>
        </div>
      </div>

      {/* Insurance Types */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Coverage Types</h2>
            <p className="text-xl text-gray-600">Comprehensive protection for every aspect of wine ownership</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {insuranceTypes.map((type, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <type.icon className="w-12 h-12 text-burgundy" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2">{type.title}</h3>
                    <p className="text-gray-600 mb-3">{type.description}</p>
                    <div className="text-burgundy font-semibold">{type.coverage}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Insurance Plans */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Insurance Plans</h2>
          <p className="text-xl text-gray-600">Choose the coverage level that protects your investment</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {insurancePlans.map((plan, index) => (
            <Card key={index} className={`p-8 text-center relative ${plan.popular ? 'border-2 border-burgundy' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-burgundy text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-lg text-gray-600 mb-2">{plan.value}</div>
              <div className="text-4xl font-bold text-burgundy mb-6">{plan.premium}</div>
              <ul className="space-y-3 mb-8 text-left">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Shield className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className={`w-full ${plan.popular ? 'bg-burgundy hover:bg-burgundy-dark' : ''}`}
                variant={plan.popular ? 'primary' : 'outline'}
              >
                Get Quote
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* What's Covered */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What's Covered</h2>
            <p className="text-xl text-gray-600">Comprehensive protection against various risks</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Theft & Burglary', description: 'Protection against theft from home or storage' },
              { title: 'Fire & Smoke Damage', description: 'Coverage for fire-related losses and smoke damage' },
              { title: 'Water Damage', description: 'Flood, burst pipes, and water-related incidents' },
              { title: 'Natural Disasters', description: 'Earthquakes, hurricanes, and other natural events' },
              { title: 'Transit Damage', description: 'Protection during shipping and transportation' },
              { title: 'Temperature Fluctuation', description: 'Damage from improper storage conditions' },
              { title: 'Breakage & Spillage', description: 'Accidental damage to bottles and contents' },
              { title: 'Market Depreciation', description: 'Protection against significant value drops' },
              { title: 'Authentication Issues', description: 'Coverage for counterfeit wine purchases' }
            ].map((coverage, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-semibold mb-2">{coverage.title}</h3>
                <p className="text-gray-600">{coverage.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Claims Process */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Claims Process</h2>
          <p className="text-xl text-gray-600">Simple, fast, and fair claims handling</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {claimsProcess.map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-burgundy text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Card className="p-8 bg-burgundy text-white inline-block">
            <Phone className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">24/7 Claims Hotline</h3>
            <p className="text-xl mb-4">1-800-WINE-CLAIM</p>
            <p className="opacity-90">Available anytime for immediate assistance</p>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-burgundy text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Protect Your Collection Today</h2>
          <p className="text-xl mb-8 opacity-90">
            Don't leave your valuable wine collection unprotected
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Get Free Quote
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-burgundy">
              Speak to Agent
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}