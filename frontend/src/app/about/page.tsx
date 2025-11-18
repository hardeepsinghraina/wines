import React from 'react'
import { Metadata } from 'next'
import { Card } from '@/components/ui/Card'
import Image from 'next/image'
import { Award, Globe, Shield, Zap } from 'lucide-react'
import { ExploreCollectionButton, AboutCTAButtons } from '@/components/about/AboutClient'

export const metadata: Metadata = {
  title: 'About Us | Luxury Wine Collection',
  description: 'Learn about our mission to provide premium wines with secure cryptocurrency payments and global delivery.',
  keywords: 'about luxury wine, wine company, cryptocurrency wine store, premium wine collection',
};

export default function AboutPage() {
  const features = [
    {
      icon: Globe,
      title: 'Global Wine Selection',
      description: 'Curated wines from the world\'s most prestigious regions and producers'
    },
    {
      icon: Zap,
      title: 'Cryptocurrency Payments',
      description: 'Seamless payments with Bitcoin, Ethereum, and other major cryptocurrencies'
    },
    {
      icon: Shield,
      title: 'Secure & Insured',
      description: 'All shipments are fully insured with premium packaging and tracking'
    },
    {
      icon: Award,
      title: 'Expert Curation',
      description: 'Every bottle is selected by our team of certified wine experts'
    }
  ]

  const team = [
    {
      name: 'Alexandre Dubois',
      role: 'Master Sommelier & Founder',
      image: '/images/team/alexandre.jpg',
      bio: 'With over 20 years in the wine industry, Alexandre brings unparalleled expertise in wine selection and curation.'
    },
    {
      name: 'Sarah Chen',
      role: 'Blockchain Technology Lead',
      image: '/images/team/sarah.jpg',
      bio: 'Former blockchain engineer at leading fintech companies, Sarah ensures secure and seamless crypto transactions.'
    },
    {
      name: 'Marco Rossi',
      role: 'Wine Acquisition Director',
      image: '/images/team/marco.jpg',
      bio: 'Marco maintains relationships with top wineries worldwide, securing exclusive access to rare vintages.'
    }
  ]

  return (
    <div className="min-h-screen bg-cream-white">
      {/* Hero Section */}
      <div className="relative py-24 bg-gradient-to-r from-burgundy to-deep-burgundy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">About Our Wine Collection</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              We're revolutionizing the luxury wine market by combining centuries-old winemaking traditions 
              with cutting-edge blockchain technology, making exceptional wines accessible to crypto enthusiasts worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-charcoal-black mb-6">Our Mission</h2>
              <p className="text-lg text-muted-olive mb-6">
                To bridge the gap between traditional wine collecting and the digital economy, 
                offering wine enthusiasts and crypto investors a premium platform to discover, 
                purchase, and own exceptional wines using cryptocurrency.
              </p>
              <p className="text-lg text-muted-olive mb-8">
                We believe that great wine should be accessible to everyone, regardless of their 
                preferred payment method. Our platform combines the security and innovation of 
                blockchain technology with the timeless appeal of fine wine.
              </p>
              <ExploreCollectionButton />
            </div>
            <div className="relative">
              <Image
                src="/images/about/wine-cellar.jpg"
                alt="Wine cellar"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal-black mb-4">Why Choose Us</h2>
            <p className="text-xl text-muted-olive">
              We're not just another wine retailer - we're pioneers in luxury wine e-commerce
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6 text-center">
                <feature.icon className="w-12 h-12 text-burgundy mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-charcoal-black mb-3">{feature.title}</h3>
                <p className="text-muted-olive">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal-black mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-olive">
              Passionate experts combining wine knowledge with blockchain innovation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <Card key={member.name} className="p-6 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-burgundy/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-burgundy">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-charcoal-black mb-1">{member.name}</h3>
                <p className="text-burgundy font-medium mb-3">{member.role}</p>
                <p className="text-muted-olive text-sm">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-burgundy to-deep-burgundy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-lg opacity-90">Premium Wines</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">Wine Regions</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-lg opacity-90">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">7</div>
              <div className="text-lg opacity-90">Cryptocurrencies</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="p-12">
            <h2 className="text-3xl font-bold text-charcoal-black mb-4">Ready to Start Your Wine Journey?</h2>
            <p className="text-xl text-muted-olive mb-8">
              Join thousands of wine enthusiasts who trust us for their luxury wine purchases
            </p>
            <AboutCTAButtons />
          </Card>
        </div>
      </div>
    </div>
  )
}