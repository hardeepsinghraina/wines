import { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DollarSign, Users, TrendingUp, Gift, Star, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Affiliate Program | Luxury Wine Collection',
  description: 'Join our affiliate program and earn commissions promoting premium wines. Competitive rates, marketing support, and exclusive benefits.',
};

export default function AffiliatePage() {
  const programBenefits = [
    {
      icon: DollarSign,
      title: 'Competitive Commissions',
      description: 'Earn up to 15% commission on all referred sales with performance bonuses.',
      highlight: 'Up to 15%'
    },
    {
      icon: Users,
      title: 'Dedicated Support',
      description: 'Personal affiliate manager and 24/7 support team to help you succeed.',
      highlight: '24/7 Support'
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Analytics',
      description: 'Advanced dashboard with detailed performance metrics and earnings tracking.',
      highlight: 'Live Tracking'
    },
    {
      icon: Gift,
      title: 'Marketing Materials',
      description: 'Professional banners, product images, and promotional content provided.',
      highlight: 'Free Assets'
    },
    {
      icon: Star,
      title: 'Exclusive Access',
      description: 'Early access to new products, special promotions, and VIP events.',
      highlight: 'VIP Access'
    },
    {
      icon: CheckCircle,
      title: 'Fast Payments',
      description: 'Monthly payments via PayPal, bank transfer, or cryptocurrency.',
      highlight: 'Monthly Payouts'
    }
  ];

  const commissionTiers = [
    {
      tier: 'Bronze',
      sales: '$0 - $5,000',
      commission: '8%',
      bonus: 'Welcome bonus',
      features: ['Basic marketing materials', 'Monthly payments', 'Email support']
    },
    {
      tier: 'Silver',
      sales: '$5,001 - $15,000',
      commission: '10%',
      bonus: 'Performance bonus',
      features: ['Premium marketing kit', 'Priority support', 'Quarterly bonuses'],
      popular: true
    },
    {
      tier: 'Gold',
      sales: '$15,001 - $50,000',
      commission: '12%',
      bonus: 'VIP rewards',
      features: ['Custom landing pages', 'Dedicated manager', 'Event invitations']
    },
    {
      tier: 'Platinum',
      sales: '$50,000+',
      commission: '15%',
      bonus: 'Elite benefits',
      features: ['White-label options', 'Co-marketing opportunities', 'Exclusive products']
    }
  ];

  const idealAffiliates = [
    {
      type: 'Wine Bloggers',
      description: 'Content creators with wine-focused audiences',
      potential: 'High conversion rates from engaged readers'
    },
    {
      type: 'Sommeliers',
      description: 'Wine professionals with industry credibility',
      potential: 'Expert recommendations drive premium sales'
    },
    {
      type: 'Crypto Influencers',
      description: 'Cryptocurrency and blockchain enthusiasts',
      potential: 'Perfect match for our crypto payment focus'
    },
    {
      type: 'Luxury Lifestyle',
      description: 'High-end lifestyle and luxury goods promoters',
      potential: 'Audience aligned with premium wine market'
    },
    {
      type: 'Food & Beverage',
      description: 'Culinary content creators and food enthusiasts',
      potential: 'Natural fit for wine and food pairing content'
    },
    {
      type: 'Investment Advisors',
      description: 'Financial advisors and investment professionals',
      potential: 'Wine as alternative investment opportunity'
    }
  ];

  const marketingTools = [
    'High-resolution product images',
    'Professional banner ads (multiple sizes)',
    'Email templates and newsletters',
    'Social media content and graphics',
    'Product comparison charts',
    'Wine education materials',
    'Seasonal promotional campaigns',
    'Custom landing pages',
    'Video content and tutorials',
    'Mobile-optimized materials'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-burgundy to-purple-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Affiliate Program</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Partner with us and earn generous commissions promoting the world's finest wines to crypto enthusiasts
            </p>
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Join Now - It's Free
            </Button>
          </div>
        </div>
      </div>

      {/* Program Benefits */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Join Our Program?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Industry-leading commissions, premium products, and comprehensive support for your success
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programBenefits.map((benefit, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <benefit.icon className="w-12 h-12 text-burgundy mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-gray-600 mb-4">{benefit.description}</p>
              <div className="text-burgundy font-bold text-lg">{benefit.highlight}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Commission Structure */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Commission Structure</h2>
            <p className="text-xl text-gray-600">Earn more as you grow - performance-based tier system</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {commissionTiers.map((tier, index) => (
              <Card key={index} className={`p-6 text-center relative ${tier.popular ? 'border-2 border-burgundy' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-burgundy text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-burgundy">{tier.tier}</h3>
                <div className="text-sm text-gray-600 mb-3">{tier.sales}</div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{tier.commission}</div>
                <div className="text-sm text-green-600 font-medium mb-4">{tier.bonus}</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Ideal Affiliates */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Perfect for These Audiences</h2>
          <p className="text-xl text-gray-600">Who succeeds best in our affiliate program</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {idealAffiliates.map((affiliate, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3 text-burgundy">{affiliate.type}</h3>
              <p className="text-gray-600 mb-3">{affiliate.description}</p>
              <div className="text-sm text-green-600 font-medium">{affiliate.potential}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Marketing Tools */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Marketing Tools & Resources</h2>
            <p className="text-xl text-gray-600">Everything you need to promote effectively</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {marketingTools.map((tool, index) => (
              <Card key={index} className="p-4 text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <span className="text-gray-700">{tool}</span>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Success Stories</h2>
          <p className="text-xl text-gray-600">Real results from our top affiliates</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-burgundy mb-2">$25K</div>
            <div className="text-lg font-semibold mb-2">Monthly Earnings</div>
            <p className="text-gray-600">"Wine blogger with 50K followers"</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-burgundy mb-2">$18K</div>
            <div className="text-lg font-semibold mb-2">Monthly Earnings</div>
            <p className="text-gray-600">"Crypto influencer promoting luxury goods"</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-burgundy mb-2">$12K</div>
            <div className="text-lg font-semibold mb-2">Monthly Earnings</div>
            <p className="text-gray-600">"Sommelier with restaurant partnerships"</p>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to start earning</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Sign Up', description: 'Complete our simple application form and get approved within 24 hours' },
              { step: '2', title: 'Get Links', description: 'Access your unique affiliate links and marketing materials' },
              { step: '3', title: 'Promote', description: 'Share wines with your audience using our proven marketing tools' },
              { step: '4', title: 'Earn', description: 'Receive monthly commission payments for all successful referrals' }
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
      </div>

      {/* FAQ */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              question: 'How much can I earn?',
              answer: 'Top affiliates earn $10,000+ monthly. Your earnings depend on your audience size, engagement, and promotion efforts.'
            },
            {
              question: 'When do I get paid?',
              answer: 'Commissions are paid monthly, 30 days after the end of each month. Minimum payout is $100.'
            },
            {
              question: 'What marketing support do you provide?',
              answer: 'We provide banners, product images, email templates, landing pages, and dedicated affiliate manager support.'
            },
            {
              question: 'Can I promote on social media?',
              answer: 'Yes! We encourage social media promotion and provide optimized content for all major platforms.'
            }
          ].map((faq, index) => (
            <Card key={index} className="p-6">
              <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-burgundy text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful affiliates promoting premium wines
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Apply Now - Free
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-burgundy">
              Contact Affiliate Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}