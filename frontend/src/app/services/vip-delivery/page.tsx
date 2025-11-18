import { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Truck, Shield, Clock, Globe, Star, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'VIP Delivery Service | Luxury Wine Collection',
  description: 'Premium wine delivery service with temperature control, insurance, and white-glove handling for your luxury wine purchases.',
};

export default function VIPDeliveryPage() {
  const deliveryFeatures = [
    {
      icon: Truck,
      title: 'White-Glove Delivery',
      description: 'Professional handling and delivery directly to your door with signature service.'
    },
    {
      icon: Shield,
      title: 'Full Insurance Coverage',
      description: 'Complete protection for your valuable wines during transit and delivery.'
    },
    {
      icon: Clock,
      title: 'Temperature Controlled',
      description: 'Climate-controlled vehicles maintain optimal temperature throughout delivery.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Worldwide delivery to over 50 countries with local expertise.'
    },
    {
      icon: Star,
      title: 'Concierge Service',
      description: 'Personal delivery coordinator for scheduling and special requirements.'
    },
    {
      icon: CheckCircle,
      title: 'Real-Time Tracking',
      description: 'Live GPS tracking and delivery updates via SMS and email.'
    }
  ];

  const deliveryOptions = [
    {
      name: 'Standard VIP',
      price: '$25',
      features: ['Temperature controlled', 'Insurance included', 'Signature required', '3-5 business days'],
      popular: false
    },
    {
      name: 'Express VIP',
      price: '$45',
      features: ['Next-day delivery', 'Premium packaging', 'SMS tracking', 'Concierge service'],
      popular: true
    },
    {
      name: 'Ultra VIP',
      price: '$95',
      features: ['Same-day delivery', 'Personal sommelier', 'Custom timing', 'Cellar placement'],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-burgundy to-purple-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">VIP Delivery Service</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Premium wine delivery with white-glove service, temperature control, and complete insurance coverage
            </p>
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Schedule Delivery
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose VIP Delivery?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your precious wines deserve the highest level of care and protection during delivery
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {deliveryFeatures.map((feature, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <feature.icon className="w-12 h-12 text-burgundy mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Delivery Options */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Delivery Options</h2>
            <p className="text-xl text-gray-600">Choose the service level that matches your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {deliveryOptions.map((option, index) => (
              <Card key={index} className={`p-8 text-center relative ${option.popular ? 'border-2 border-burgundy' : ''}`}>
                {option.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-burgundy text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{option.name}</h3>
                <div className="text-4xl font-bold text-burgundy mb-6">{option.price}</div>
                <ul className="space-y-3 mb-8">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${option.popular ? 'bg-burgundy hover:bg-burgundy-dark' : ''}`}
                  variant={option.popular ? 'primary' : 'outline'}
                >
                  Select Plan
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Simple, secure, and professional delivery process</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Order Placed', description: 'Complete your wine purchase with VIP delivery selected' },
            { step: '2', title: 'Preparation', description: 'Wines are carefully packaged in temperature-controlled containers' },
            { step: '3', title: 'In Transit', description: 'Real-time tracking and climate monitoring throughout journey' },
            { step: '4', title: 'Delivered', description: 'White-glove delivery with signature confirmation' }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-burgundy text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-burgundy text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for VIP Treatment?</h2>
          <p className="text-xl mb-8 opacity-90">
            Experience the ultimate in wine delivery service
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Browse Wines
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-burgundy">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}