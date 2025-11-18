import { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Download, ExternalLink, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Press & Media | Luxury Wine Collection',
  description: 'Latest news, press releases, and media resources for Luxury Wine Collection. Download press kits and contact our media team.',
};

export default function PressPage() {
  const pressReleases = [
    {
      date: '2024-03-15',
      title: 'Luxury Wine Collection Launches Revolutionary NFT Wine Certificates',
      excerpt: 'First-of-its-kind blockchain-verified wine authenticity system now available for premium collections.',
      category: 'Product Launch'
    },
    {
      date: '2024-02-28',
      title: 'Partnership with Leading Bordeaux Châteaux Expands Premium Selection',
      excerpt: 'Exclusive agreements with five First Growth estates bring rare vintages to cryptocurrency market.',
      category: 'Partnership'
    },
    {
      date: '2024-02-10',
      title: 'Company Achieves $50M in Cryptocurrency Wine Sales Milestone',
      excerpt: 'Platform processes record-breaking volume as crypto adoption grows in luxury goods sector.',
      category: 'Milestone'
    },
    {
      date: '2024-01-22',
      title: 'Global Expansion: VIP Delivery Now Available in 25 New Countries',
      excerpt: 'Temperature-controlled shipping network extends reach to emerging luxury markets worldwide.',
      category: 'Expansion'
    },
    {
      date: '2024-01-08',
      title: 'Award-Winning Sommelier Team Joins as Wine Curation Experts',
      excerpt: 'Three Master Sommeliers bring decades of experience to enhance collection quality.',
      category: 'Team'
    }
  ];

  const mediaKit = [
    {
      title: 'Company Logo Pack',
      description: 'High-resolution logos in various formats (PNG, SVG, EPS)',
      fileSize: '2.3 MB'
    },
    {
      title: 'Executive Photos',
      description: 'Professional headshots of leadership team',
      fileSize: '8.7 MB'
    },
    {
      title: 'Product Images',
      description: 'High-quality wine and platform screenshots',
      fileSize: '15.2 MB'
    },
    {
      title: 'Company Fact Sheet',
      description: 'Key statistics, milestones, and company information',
      fileSize: '1.1 MB'
    },
    {
      title: 'Brand Guidelines',
      description: 'Complete brand identity and usage guidelines',
      fileSize: '4.8 MB'
    }
  ];

  const mediaContacts = [
    {
      name: 'Sarah Mitchell',
      title: 'Head of Communications',
      email: 'press@luxurywine.com',
      phone: '+1 (555) 123-4567'
    },
    {
      name: 'David Chen',
      title: 'PR Manager',
      email: 'media@luxurywine.com',
      phone: '+1 (555) 123-4568'
    }
  ];

  const awards = [
    {
      year: '2024',
      award: 'Best Luxury E-commerce Platform',
      organization: 'Digital Commerce Awards'
    },
    {
      year: '2024',
      award: 'Innovation in Cryptocurrency Payments',
      organization: 'FinTech Excellence Awards'
    },
    {
      year: '2023',
      award: 'Wine Retailer of the Year',
      organization: 'International Wine Challenge'
    },
    {
      year: '2023',
      award: 'Best Customer Experience',
      organization: 'Luxury Lifestyle Awards'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-burgundy to-purple-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Press & Media</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Latest news, press releases, and media resources for journalists and industry professionals
            </p>
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Download Media Kit
            </Button>
          </div>
        </div>
      </div>

      {/* Latest News */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest News</h2>
          <p className="text-xl text-gray-600">Recent press releases and company announcements</p>
        </div>

        <div className="space-y-6 max-w-4xl mx-auto">
          {pressReleases.map((release, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500">
                      {new Date(release.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="ml-4 px-2 py-1 bg-burgundy text-white text-xs rounded-full">
                      {release.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{release.title}</h3>
                  <p className="text-gray-600 mb-4">{release.excerpt}</p>
                </div>
                <div className="mt-4 lg:mt-0 lg:ml-6 flex gap-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Read More
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Media Kit */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Media Kit</h2>
            <p className="text-xl text-gray-600">Download high-quality assets and company information</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {mediaKit.map((item, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-3">{item.description}</p>
                <p className="text-sm text-gray-500 mb-4">{item.fileSize}</p>
                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Company Stats */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Company at a Glance</h2>
          <p className="text-xl text-gray-600">Key facts and figures</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-burgundy mb-2">$100M+</div>
            <div className="text-lg font-semibold mb-2">Total Sales</div>
            <p className="text-gray-600">Since launch in 2022</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-burgundy mb-2">50K+</div>
            <div className="text-lg font-semibold mb-2">Customers</div>
            <p className="text-gray-600">Across 45 countries</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-burgundy mb-2">10K+</div>
            <div className="text-lg font-semibold mb-2">Wine SKUs</div>
            <p className="text-gray-600">Premium selections</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-4xl font-bold text-burgundy mb-2">8</div>
            <div className="text-lg font-semibold mb-2">Cryptocurrencies</div>
            <p className="text-gray-600">Payment options</p>
          </Card>
        </div>
      </div>

      {/* Awards */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Awards & Recognition</h2>
            <p className="text-xl text-gray-600">Industry accolades and achievements</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {awards.map((award, index) => (
              <Card key={index} className="p-6 flex items-center">
                <div className="w-16 h-16 bg-burgundy text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">
                  {award.year}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{award.award}</h3>
                  <p className="text-gray-600">{award.organization}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Media Contacts */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Media Contacts</h2>
          <p className="text-xl text-gray-600">Get in touch with our communications team</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {mediaContacts.map((contact, index) => (
            <Card key={index} className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">{contact.name}</h3>
              <p className="text-gray-600 mb-4">{contact.title}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <Mail className="w-4 h-4 text-burgundy mr-2" />
                  <a href={`mailto:${contact.email}`} className="text-burgundy hover:underline">
                    {contact.email}
                  </a>
                </div>
                <p className="text-gray-600">{contact.phone}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-burgundy text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Media Inquiries</h2>
          <p className="text-xl mb-8 opacity-90">
            Need additional information or want to schedule an interview?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Contact Press Team
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-burgundy">
              Download Full Media Kit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}