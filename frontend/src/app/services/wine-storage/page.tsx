import { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Thermometer, Shield, Eye, Zap, Building, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Professional Wine Storage | Luxury Wine Collection',
  description: 'Secure, climate-controlled wine storage facilities with 24/7 monitoring, insurance, and concierge services.',
};

export default function WineStoragePage() {
  const storageFeatures = [
    {
      icon: Thermometer,
      title: 'Climate Control',
      description: 'Precise temperature (55°F) and humidity (70%) control for optimal wine preservation.'
    },
    {
      icon: Shield,
      title: 'Security & Insurance',
      description: 'State-of-the-art security systems with full insurance coverage for your collection.'
    },
    {
      icon: Eye,
      title: '24/7 Monitoring',
      description: 'Continuous monitoring of environmental conditions and security systems.'
    },
    {
      icon: Zap,
      title: 'Backup Systems',
      description: 'Redundant power and cooling systems ensure uninterrupted protection.'
    },
    {
      icon: Building,
      title: 'Premium Facilities',
      description: 'Purpose-built wine storage facilities in prime locations worldwide.'
    },
    {
      icon: Users,
      title: 'Concierge Service',
      description: 'Personal wine concierge for inventory management and delivery coordination.'
    }
  ];

  const storagePlans = [
    {
      name: 'Personal Cellar',
      capacity: '50 bottles',
      price: '$89/month',
      features: ['Climate controlled', 'Basic insurance', 'Online inventory', 'Quarterly reports'],
      popular: false
    },
    {
      name: 'Collector\'s Vault',
      capacity: '200 bottles',
      price: '$299/month',
      features: ['Premium location', 'Full insurance', 'Concierge service', 'Monthly reports', 'Tasting access'],
      popular: true
    },
    {
      name: 'Master Collection',
      capacity: '500+ bottles',
      price: '$749/month',
      features: ['Private room', 'White-glove service', 'Investment tracking', 'Weekly reports', 'VIP events'],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 to-burgundy text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Professional Wine Storage</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Preserve and protect your wine collection in our state-of-the-art, climate-controlled facilities
            </p>
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Tour Our Facilities
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Professional Storage?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Proper storage is essential for maintaining and enhancing the value of your wine collection
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {storageFeatures.map((feature, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <feature.icon className="w-12 h-12 text-burgundy mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Storage Plans */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Storage Plans</h2>
            <p className="text-xl text-gray-600">Choose the perfect storage solution for your collection</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {storagePlans.map((plan, index) => (
              <Card key={index} className={`p-8 text-center relative ${plan.popular ? 'border-2 border-burgundy' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-burgundy text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-lg text-gray-600 mb-4">{plan.capacity}</div>
                <div className="text-4xl font-bold text-burgundy mb-6">{plan.price}</div>
                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <div className="w-2 h-2 bg-burgundy rounded-full mr-3"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-burgundy hover:bg-burgundy-dark' : ''}`}
                  variant={plan.popular ? 'primary' : 'outline'}
                >
                  Select Plan
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Facility Tour */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Facilities</h2>
          <p className="text-xl text-gray-600">State-of-the-art wine storage designed for perfection</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-6">Optimal Storage Conditions</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-burgundy rounded-full mr-4"></div>
                <span><strong>Temperature:</strong> Maintained at 55°F (13°C) ±1°</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-burgundy rounded-full mr-4"></div>
                <span><strong>Humidity:</strong> Controlled at 70% ±5%</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-burgundy rounded-full mr-4"></div>
                <span><strong>Light:</strong> UV-filtered LED lighting only</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-burgundy rounded-full mr-4"></div>
                <span><strong>Vibration:</strong> Isolated from external disturbances</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-burgundy rounded-full mr-4"></div>
                <span><strong>Air Quality:</strong> HEPA filtration system</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-64 rounded-lg flex items-center justify-center border border-gray-300">
            <div className="text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm font-medium">Climate-Controlled Storage Facility</p>
              <p className="text-xs mt-1">Professional wine preservation environment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Additional Services</h2>
            <p className="text-xl text-gray-600">Complete wine collection management</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Inventory Management', description: 'Digital catalog with detailed records' },
              { title: 'Valuation Services', description: 'Professional appraisals and market analysis' },
              { title: 'Collection Consulting', description: 'Expert advice on acquisitions and sales' },
              { title: 'Event Access', description: 'Exclusive tastings and wine events' }
            ].map((service, index) => (
              <Card key={index} className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-burgundy text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Protect Your Investment</h2>
          <p className="text-xl mb-8 opacity-90">
            Give your wines the professional care they deserve
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Schedule Tour
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-burgundy">
              Get Quote
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}