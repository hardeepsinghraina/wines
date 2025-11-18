import { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Clock, CheckCircle, AlertCircle, Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund Policy | Luxury Wine Collection',
  description: 'Our comprehensive refund and return policy for wine purchases, including conditions, timeframes, and procedures.',
};

export default function RefundPolicyPage() {
  const refundConditions = [
    {
      icon: CheckCircle,
      title: 'Damaged or Defective Products',
      description: 'Full refund for wines damaged during shipping or with manufacturing defects.',
      timeframe: '30 days',
      coverage: '100% refund + shipping'
    },
    {
      icon: CheckCircle,
      title: 'Incorrect Orders',
      description: 'Wrong wine sent due to our error - full refund or exchange available.',
      timeframe: '30 days',
      coverage: '100% refund + return shipping'
    },
    {
      icon: CheckCircle,
      title: 'Authentication Issues',
      description: 'If wine authenticity is disputed and proven incorrect.',
      timeframe: '90 days',
      coverage: '100% refund + compensation'
    },
    {
      icon: AlertCircle,
      title: 'Change of Mind',
      description: 'Limited refunds for unopened wines in original condition.',
      timeframe: '14 days',
      coverage: '85% refund (15% restocking fee)'
    }
  ];

  const nonRefundableItems = [
    'Opened or consumed wines',
    'Wines purchased more than 90 days ago',
    'Custom or personalized wine selections',
    'Wines damaged due to improper storage',
    'Digital products (NFTs, certificates)',
    'Gift cards and store credit',
    'Wines purchased during final sale events',
    'Wines with broken or missing original seals'
  ];

  const refundProcess = [
    {
      step: '1',
      title: 'Contact Support',
      description: 'Reach out within the applicable timeframe with order details and reason for return.'
    },
    {
      step: '2',
      title: 'Return Authorization',
      description: 'Receive RMA number and detailed return instructions from our team.'
    },
    {
      step: '3',
      title: 'Package & Ship',
      description: 'Carefully package wines in original containers and ship using provided label.'
    },
    {
      step: '4',
      title: 'Inspection',
      description: 'Our team inspects returned items to verify condition and eligibility.'
    },
    {
      step: '5',
      title: 'Refund Processing',
      description: 'Approved refunds processed within 5-10 business days to original payment method.'
    }
  ];

  const cryptoRefundInfo = [
    {
      currency: 'Bitcoin (BTC)',
      processing: '1-3 business days',
      fees: 'Network fees apply'
    },
    {
      currency: 'Ethereum (ETH)',
      processing: '1-2 business days',
      fees: 'Gas fees apply'
    },
    {
      currency: 'Stablecoins (USDC/USDT)',
      processing: '1-2 business days',
      fees: 'Minimal network fees'
    },
    {
      currency: 'Other Cryptocurrencies',
      processing: '2-5 business days',
      fees: 'Variable network fees'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-burgundy to-purple-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Refund Policy</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Your satisfaction is our priority. Learn about our comprehensive refund and return policy.
            </p>
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Contact Support
            </Button>
          </div>
        </div>
      </div>

      {/* Policy Overview */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Refund Conditions</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We offer different refund terms based on the reason for return and product condition
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {refundConditions.map((condition, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <condition.icon className={`w-8 h-8 flex-shrink-0 ${
                  condition.icon === CheckCircle ? 'text-green-500' : 'text-orange-500'
                }`} />
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-2">{condition.title}</h3>
                  <p className="text-gray-600 mb-3">{condition.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {condition.timeframe}
                    </span>
                    <span className="text-sm font-medium text-burgundy">
                      {condition.coverage}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Refund Process */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Request a Refund</h2>
            <p className="text-xl text-gray-600">Simple steps to process your return</p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {refundProcess.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-burgundy text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Non-Refundable Items */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Non-Refundable Items</h2>
          <p className="text-xl text-gray-600">Items that cannot be returned or refunded</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {nonRefundableItems.map((item, index) => (
            <Card key={index} className="p-4 text-center">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <span className="text-sm text-gray-700">{item}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* Cryptocurrency Refunds */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cryptocurrency Refunds</h2>
            <p className="text-xl text-gray-600">Processing times and fees for crypto refunds</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {cryptoRefundInfo.map((crypto, index) => (
              <Card key={index} className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-3">{crypto.currency}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Processing:</span>
                    <br />
                    {crypto.processing}
                  </div>
                  <div>
                    <span className="font-medium">Fees:</span>
                    <br />
                    {crypto.fees}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 max-w-3xl mx-auto">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Important Note on Crypto Refunds</h3>
                  <p className="text-blue-800 text-sm">
                    Cryptocurrency refunds are processed at the current market rate, not the original purchase rate. 
                    Network fees are deducted from the refund amount. For large refunds, we may process in multiple 
                    transactions to ensure security.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Special Circumstances */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Special Circumstances</h2>
          <p className="text-xl text-gray-600">Additional refund considerations</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6">
            <Shield className="w-12 h-12 text-burgundy mb-4" />
            <h3 className="text-xl font-semibold mb-3">Wine Insurance Claims</h3>
            <p className="text-gray-600">
              For insured shipments, insurance claims may be processed instead of direct refunds. 
              We'll guide you through the process.
            </p>
          </Card>
          <Card className="p-6">
            <Clock className="w-12 h-12 text-burgundy mb-4" />
            <h3 className="text-xl font-semibold mb-3">Vintage Variations</h3>
            <p className="text-gray-600">
              Minor vintage variations (within 1-2 years) are not grounds for refund unless 
              specifically guaranteed at purchase.
            </p>
          </Card>
          <Card className="p-6">
            <CheckCircle className="w-12 h-12 text-burgundy mb-4" />
            <h3 className="text-xl font-semibold mb-3">Bulk Orders</h3>
            <p className="text-gray-600">
              Orders over $10,000 may have extended return periods and special handling procedures. 
              Contact our VIP team for details.
            </p>
          </Card>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-burgundy text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Need Help with a Return?</h2>
            <p className="text-xl opacity-90">Our customer service team is here to assist you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="p-8 text-center bg-white text-gray-900">
              <Mail className="w-12 h-12 text-burgundy mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">For non-urgent refund requests</p>
              <a href="mailto:returns@luxurywine.com" className="text-burgundy font-medium">
                returns@luxurywine.com
              </a>
              <p className="text-sm text-gray-500 mt-2">Response within 24 hours</p>
            </Card>
            <Card className="p-8 text-center bg-white text-gray-900">
              <Phone className="w-12 h-12 text-burgundy mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-4">For urgent refund issues</p>
              <a href="tel:+1-800-WINE-HELP" className="text-burgundy font-medium">
                1-800-WINE-HELP
              </a>
              <p className="text-sm text-gray-500 mt-2">Mon-Fri 9AM-6PM PST</p>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Start Return Request
            </Button>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            This refund policy was last updated on March 1, 2024. We reserve the right to modify 
            this policy at any time with notice to customers.
          </p>
        </div>
      </div>
    </div>
  );
}