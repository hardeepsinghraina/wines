import { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Clock, DollarSign, Users, Heart, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers | Luxury Wine Collection',
  description: 'Join our team of wine enthusiasts and technology innovators. Explore career opportunities in the luxury wine and cryptocurrency space.',
};

export default function CareersPage() {
  const openPositions = [
    {
      title: 'Senior Wine Curator',
      department: 'Wine Operations',
      location: 'Napa Valley, CA',
      type: 'Full-time',
      salary: '$85,000 - $120,000',
      description: 'Lead our wine selection process and build relationships with premium wineries worldwide.'
    },
    {
      title: 'Blockchain Developer',
      department: 'Technology',
      location: 'Remote',
      type: 'Full-time',
      salary: '$120,000 - $180,000',
      description: 'Develop and maintain our cryptocurrency payment systems and NFT marketplace.'
    },
    {
      title: 'Customer Experience Manager',
      department: 'Customer Success',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$70,000 - $95,000',
      description: 'Ensure exceptional customer experiences and manage VIP client relationships.'
    },
    {
      title: 'Digital Marketing Specialist',
      department: 'Marketing',
      location: 'Remote',
      type: 'Full-time',
      salary: '$60,000 - $85,000',
      description: 'Drive digital marketing campaigns and grow our online presence in the luxury market.'
    },
    {
      title: 'Sommelier',
      department: 'Wine Operations',
      location: 'Multiple Locations',
      type: 'Full-time',
      salary: '$55,000 - $75,000',
      description: 'Provide expert wine guidance and conduct tastings for our premium clientele.'
    },
    {
      title: 'Logistics Coordinator',
      department: 'Operations',
      location: 'Los Angeles, CA',
      type: 'Full-time',
      salary: '$50,000 - $65,000',
      description: 'Manage global wine shipments and coordinate with our VIP delivery partners.'
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance, dental, vision, and wellness programs.'
    },
    {
      icon: DollarSign,
      title: 'Competitive Compensation',
      description: 'Market-leading salaries, equity options, and performance bonuses.'
    },
    {
      icon: Clock,
      title: 'Work-Life Balance',
      description: 'Flexible hours, remote work options, and generous PTO policy.'
    },
    {
      icon: Users,
      title: 'Professional Growth',
      description: 'Learning stipends, conference attendance, and career development programs.'
    },
    {
      icon: Zap,
      title: 'Innovation Culture',
      description: 'Work with cutting-edge technology in the luxury wine and crypto space.'
    },
    {
      icon: Heart,
      title: 'Wine Perks',
      description: 'Employee wine allowance, exclusive tastings, and industry events.'
    }
  ];

  const companyValues = [
    {
      title: 'Excellence',
      description: 'We strive for perfection in everything we do, from wine curation to customer service.'
    },
    {
      title: 'Innovation',
      description: 'We embrace new technologies and creative solutions to enhance the wine experience.'
    },
    {
      title: 'Authenticity',
      description: 'We are genuine in our passion for wine and transparent in our business practices.'
    },
    {
      title: 'Community',
      description: 'We build lasting relationships with our team, customers, and wine partners.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-burgundy to-purple-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Join Our Team</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Be part of the future of luxury wine commerce, where tradition meets innovation
            </p>
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              View Open Positions
            </Button>
          </div>
        </div>
      </div>

      {/* Company Culture */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Work With Us?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join a passionate team that's revolutionizing the luxury wine industry with cutting-edge technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <benefit.icon className="w-12 h-12 text-burgundy mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-xl text-gray-600">Discover your next career opportunity</p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {openPositions.map((position, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{position.title}</h3>
                    <p className="text-gray-600 mb-4">{position.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {position.department}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {position.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {position.type}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {position.salary}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <Button>Apply Now</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Company Values */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
          <p className="text-xl text-gray-600">The principles that guide everything we do</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {companyValues.map((value, index) => (
            <Card key={index} className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-3 text-burgundy">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Team Stats */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-xl text-gray-600">Diverse professionals united by passion for wine and innovation</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-burgundy mb-2">50+</div>
              <div className="text-lg font-semibold mb-2">Team Members</div>
              <p className="text-gray-600">Across 12 countries</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-burgundy mb-2">15</div>
              <div className="text-lg font-semibold mb-2">Wine Experts</div>
              <p className="text-gray-600">Including 5 Master Sommeliers</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-burgundy mb-2">8</div>
              <div className="text-lg font-semibold mb-2">Tech Specialists</div>
              <p className="text-gray-600">Blockchain and crypto experts</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-burgundy mb-2">95%</div>
              <div className="text-lg font-semibold mb-2">Retention Rate</div>
              <p className="text-gray-600">Employee satisfaction</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Application Process */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Process</h2>
          <p className="text-xl text-gray-600">Simple steps to join our team</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: '1', title: 'Apply Online', description: 'Submit your application and resume through our careers portal' },
            { step: '2', title: 'Initial Review', description: 'Our HR team reviews your application and qualifications' },
            { step: '3', title: 'Interview Process', description: 'Video interviews with hiring managers and team members' },
            { step: '4', title: 'Welcome Aboard', description: 'Receive offer and begin your journey with us' }
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
          <h2 className="text-3xl font-bold mb-4">Ready to Join Us?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start your career in the exciting world of luxury wine and technology
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Browse Jobs
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-burgundy">
              Contact HR
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}