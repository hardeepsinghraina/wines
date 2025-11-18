import { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Leaf, Recycle, Truck, Zap, Droplets, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sustainability | Luxury Wine Collection',
  description: 'Our commitment to environmental sustainability, responsible sourcing, and supporting eco-friendly wine producers worldwide.',
};

export default function SustainabilityPage() {
  const sustainabilityInitiatives = [
    {
      icon: Leaf,
      title: 'Organic & Biodynamic Wines',
      description: 'Prioritizing wines from certified organic and biodynamic producers who practice sustainable viticulture.',
      impact: '60% of our collection'
    },
    {
      icon: Recycle,
      title: 'Sustainable Packaging',
      description: 'Using recycled materials, biodegradable packaging, and minimal waste in all shipments.',
      impact: '90% recyclable materials'
    },
    {
      icon: Truck,
      title: 'Carbon-Neutral Shipping',
      description: 'Offsetting all delivery emissions through verified carbon credit programs and green logistics.',
      impact: '100% carbon neutral'
    },
    {
      icon: Zap,
      title: 'Renewable Energy',
      description: 'Powering our facilities and blockchain operations with 100% renewable energy sources.',
      impact: '0 carbon footprint'
    },
    {
      icon: Droplets,
      title: 'Water Conservation',
      description: 'Supporting wineries that implement water-saving technologies and sustainable irrigation.',
      impact: '30% water reduction'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Investing in local communities and supporting fair trade practices in wine regions.',
      impact: '50+ communities'
    }
  ];

  const certifications = [
    {
      name: 'B Corp Certified',
      description: 'Meeting highest standards of social and environmental performance',
      year: '2023'
    },
    {
      name: 'Carbon Neutral Certified',
      description: 'Verified carbon neutrality across all operations',
      year: '2023'
    },
    {
      name: 'Sustainable Packaging Alliance',
      description: 'Member of global sustainable packaging initiative',
      year: '2022'
    },
    {
      name: 'Fair Trade Partner',
      description: 'Supporting fair trade practices in wine production',
      year: '2022'
    }
  ];

  const environmentalGoals = [
    {
      goal: 'Carbon Negative by 2025',
      progress: 75,
      description: 'Removing more carbon from atmosphere than we produce'
    },
    {
      goal: '100% Sustainable Sourcing',
      progress: 85,
      description: 'All wines from certified sustainable producers'
    },
    {
      goal: 'Zero Waste to Landfill',
      progress: 60,
      description: 'Eliminating all non-recyclable waste from operations'
    },
    {
      goal: '50% Renewable Packaging',
      progress: 40,
      description: 'Using renewable materials for all packaging'
    }
  ];

  const partnerProducers = [
    {
      name: 'Château Margaux',
      location: 'Bordeaux, France',
      certification: 'Organic & Biodynamic',
      initiative: 'Solar-powered winery, biodiversity preservation'
    },
    {
      name: 'Screaming Eagle',
      location: 'Napa Valley, USA',
      certification: 'Sustainable Practices',
      initiative: 'Water conservation, native habitat restoration'
    },
    {
      name: 'Penfolds',
      location: 'Barossa Valley, Australia',
      certification: 'Carbon Neutral',
      initiative: 'Renewable energy, waste reduction programs'
    },
    {
      name: 'Antinori',
      location: 'Tuscany, Italy',
      certification: 'Organic Certified',
      initiative: 'Traditional methods, soil health focus'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-800 to-burgundy text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Sustainability</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Committed to environmental stewardship and supporting sustainable wine production worldwide
            </p>
            <Button size="lg" className="bg-white text-green-800 hover:bg-gray-100">
              View Our Impact Report
            </Button>
          </div>
        </div>
      </div>

      {/* Our Commitment */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Environmental Commitment</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We believe luxury and sustainability go hand in hand. Every decision we make considers its impact on our planet.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sustainabilityInitiatives.map((initiative, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <initiative.icon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">{initiative.title}</h3>
              <p className="text-gray-600 mb-4">{initiative.description}</p>
              <div className="text-green-600 font-semibold">{initiative.impact}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Environmental Goals */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">2025 Environmental Goals</h2>
            <p className="text-xl text-gray-600">Ambitious targets for a sustainable future</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {environmentalGoals.map((goal, index) => (
              <Card key={index} className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">{goal.goal}</h3>
                  <span className="text-green-600 font-bold">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-600">{goal.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Certifications & Partnerships</h2>
          <p className="text-xl text-gray-600">Third-party verified sustainability credentials</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((cert, index) => (
            <Card key={index} className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                ✓
              </div>
              <h3 className="text-lg font-semibold mb-2">{cert.name}</h3>
              <p className="text-gray-600 mb-2">{cert.description}</p>
              <span className="text-green-600 font-medium">{cert.year}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* Partner Producers */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sustainable Partner Producers</h2>
            <p className="text-xl text-gray-600">Working with wineries committed to environmental stewardship</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {partnerProducers.map((producer, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-semibold mb-2">{producer.name}</h3>
                <p className="text-gray-600 mb-2">{producer.location}</p>
                <div className="flex items-center mb-3">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    {producer.certification}
                  </span>
                </div>
                <p className="text-gray-600">{producer.initiative}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Environmental Impact</h2>
          <p className="text-xl text-gray-600">Measurable results from our sustainability efforts</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">500T</div>
            <div className="text-lg font-semibold mb-2">CO₂ Offset</div>
            <p className="text-gray-600">Carbon removed annually</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">1M</div>
            <div className="text-lg font-semibold mb-2">Gallons Saved</div>
            <p className="text-gray-600">Water conservation impact</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">95%</div>
            <div className="text-lg font-semibold mb-2">Waste Diverted</div>
            <p className="text-gray-600">From landfills</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">200+</div>
            <div className="text-lg font-semibold mb-2">Sustainable Producers</div>
            <p className="text-gray-600">In our network</p>
          </Card>
        </div>
      </div>

      {/* Get Involved */}
      <div className="bg-green-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Involved</h2>
            <p className="text-xl text-gray-600">Join us in making a positive environmental impact</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <Leaf className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Choose Sustainable Wines</h3>
              <p className="text-gray-600 mb-4">Filter by organic, biodynamic, and sustainable certifications</p>
              <Button variant="outline">Browse Sustainable Wines</Button>
            </Card>
            <Card className="p-6 text-center">
              <Recycle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Recycle Packaging</h3>
              <p className="text-gray-600 mb-4">Return shipping materials through our recycling program</p>
              <Button variant="outline">Learn About Recycling</Button>
            </Card>
            <Card className="p-6 text-center">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Support Communities</h3>
              <p className="text-gray-600 mb-4">Contribute to our community development fund</p>
              <Button variant="outline">Make a Donation</Button>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sustainability is a Journey</h2>
          <p className="text-xl mb-8 opacity-90">
            Join us in creating a more sustainable future for wine and our planet
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-800 hover:bg-gray-100">
              Download Impact Report
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-800">
              Contact Sustainability Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}