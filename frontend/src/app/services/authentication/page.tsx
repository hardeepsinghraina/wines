import { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Search, Award, FileText, Eye, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Wine Authentication Services | Luxury Wine Collection',
  description: 'Professional wine authentication and verification services to ensure the authenticity and provenance of your valuable wine collection.',
};

export default function AuthenticationPage() {
  const authenticationServices = [
    {
      icon: Search,
      title: 'Provenance Verification',
      description: 'Comprehensive research and documentation of wine origin and ownership history.'
    },
    {
      icon: Award,
      title: 'Expert Certification',
      description: 'Authentication by certified wine experts and master sommeliers.'
    },
    {
      icon: FileText,
      title: 'Documentation',
      description: 'Detailed certificates with blockchain-verified authenticity records.'
    },
    {
      icon: Eye,
      title: 'Physical Inspection',
      description: 'Thorough examination of bottles, labels, corks, and packaging.'
    },
    {
      icon: Shield,
      title: 'Fraud Protection',
      description: 'Advanced techniques to detect counterfeits and altered wines.'
    },
    {
      icon: CheckCircle,
      title: 'Market Validation',
      description: 'Verification against known market standards and databases.'
    }
  ];

  const authenticationPackages = [
    {
      name: 'Basic Authentication',
      price: '$150',
      timeframe: '5-7 days',
      features: ['Visual inspection', 'Label verification', 'Basic provenance check', 'Digital certificate'],
      popular: false
    },
    {
      name: 'Premium Verification',
      price: '$350',
      timeframe: '10-14 days',
      features: ['Comprehensive inspection', 'Expert evaluation', 'Detailed provenance research', 'Blockchain certificate', 'Market valuation'],
      popular: true
    },
    {
      name: 'Master Authentication',
      price: '$750',
      timeframe: '21-30 days',
      features: ['Master sommelier review', 'Scientific analysis', 'Complete history research', 'Insurance documentation', 'Investment grade certificate'],
      popular: false
    }
  ];

  const authenticationProcess = [
    {
      step: '1',
      title: 'Submission',
      description: 'Submit your wine details and high-resolution photos through our secure portal.'
    },
    {
      step: '2',
      title: 'Initial Review',
      description: 'Our experts conduct preliminary assessment and determine authentication approach.'
    },
    {
      step: '3',
      title: 'Detailed Analysis',
      description: 'Comprehensive examination including provenance research and physical inspection.'
    },
    {
      step: '4',
      title: 'Expert Verification',
      description: 'Final review by certified wine experts and master sommeliers.'
    },
    {
      step: '5',
      title: 'Certification',
      description: 'Receive detailed authentication certificate with blockchain verification.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-burgundy to-purple-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Wine Authentication</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Verify the authenticity and provenance of your valuable wines with our expert authentication services
            </p>
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Start Authentication
            </Button>
          </div>
        </div>
      </div>

      {/* Why Authentication Matters */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Authentication Matters</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            With the rise of wine counterfeiting, professional authentication protects your investment and ensures authenticity
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-burgundy mb-2">$1.3B</div>
            <div className="text-lg font-semibold mb-2">Annual Counterfeit Market</div>
            <p className="text-gray-600">Estimated value of fake wines sold globally each year</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-burgundy mb-2">20%</div>
            <div className="text-lg font-semibold mb-2">Suspected Fakes</div>
            <p className="text-gray-600">Percentage of rare wines that may be counterfeit</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-burgundy mb-2">99.8%</div>
            <div className="text-lg font-semibold mb-2">Accuracy Rate</div>
            <p className="text-gray-600">Our authentication success rate with expert verification</p>
          </Card>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Authentication Services</h2>
            <p className="text-xl text-gray-600">Comprehensive verification using advanced techniques and expert knowledge</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {authenticationServices.map((service, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <service.icon className="w-12 h-12 text-burgundy mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Authentication Packages */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Authentication Packages</h2>
          <p className="text-xl text-gray-600">Choose the level of verification that matches your needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {authenticationPackages.map((pkg, index) => (
            <Card key={index} className={`p-8 text-center relative ${pkg.popular ? 'border-2 border-burgundy' : ''}`}>
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-burgundy text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
              <div className="text-4xl font-bold text-burgundy mb-2">{pkg.price}</div>
              <div className="text-gray-600 mb-6">{pkg.timeframe}</div>
              <ul className="space-y-3 mb-8 text-left">
                {pkg.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className={`w-full ${pkg.popular ? 'bg-burgundy hover:bg-burgundy-dark' : ''}`}
                variant={pkg.popular ? 'primary' : 'outline'}
              >
                Select Package
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Process Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Authentication Process</h2>
            <p className="text-xl text-gray-600">Our systematic approach ensures thorough and accurate verification</p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {authenticationProcess.map((item, index) => (
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

      {/* Red Flags Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Common Red Flags</h2>
          <p className="text-xl text-gray-600">Signs that may indicate a wine needs authentication</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            'Unusually low price for rare vintage',
            'Poor label quality or printing',
            'Incorrect bottle shape or color',
            'Missing or suspicious provenance',
            'Damaged or replaced cork',
            'Inconsistent vintage information',
            'Seller reluctant to provide details',
            'No original packaging or documentation'
          ].map((flag, index) => (
            <Card key={index} className="p-4 text-center">
              <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                !
              </div>
              <p className="text-sm">{flag}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-burgundy text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Protect Your Wine Investment</h2>
          <p className="text-xl mb-8 opacity-90">
            Ensure authenticity and peace of mind with professional authentication
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Submit for Authentication
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-burgundy">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}