import { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, User, Tag, Search, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Wine Blog | Luxury Wine Collection',
  description: 'Expert wine insights, tasting notes, investment advice, and industry news from our team of sommeliers and wine professionals.',
};

export default function BlogPage() {
  const featuredPost = {
    title: 'The Rise of Wine NFTs: Digital Certificates for Physical Bottles',
    excerpt: 'Exploring how blockchain technology is revolutionizing wine authentication and creating new investment opportunities in the luxury wine market.',
    author: 'Sarah Mitchell',
    date: '2024-03-15',
    category: 'Technology',
    image: '/images/blog/wine-nft-featured.jpg',
    readTime: '8 min read'
  };

  const blogPosts = [
    {
      title: 'Bordeaux 2020: A Vintage Worth the Investment',
      excerpt: 'Our comprehensive analysis of the 2020 Bordeaux vintage and why it represents exceptional value for collectors.',
      author: 'James Rodriguez',
      date: '2024-03-12',
      category: 'Investment',
      image: '/images/blog/bordeaux-2020.jpg',
      readTime: '6 min read'
    },
    {
      title: 'Cryptocurrency and Wine: The Perfect Pairing',
      excerpt: 'How digital currencies are transforming luxury wine purchases and what it means for collectors.',
      author: 'Michael Chen',
      date: '2024-03-10',
      category: 'Crypto',
      image: '/images/blog/crypto-wine.jpg',
      readTime: '5 min read'
    },
    {
      title: 'Burgundy Harvest Report: Climate Change Impact',
      excerpt: 'An in-depth look at how changing weather patterns are affecting Burgundy wine production.',
      author: 'Emma Thompson',
      date: '2024-03-08',
      category: 'Industry',
      image: '/images/blog/burgundy-harvest.jpg',
      readTime: '7 min read'
    },
    {
      title: 'Wine Storage: Temperature and Humidity Best Practices',
      excerpt: 'Essential guidelines for preserving your wine collection and maximizing aging potential.',
      author: 'David Wilson',
      date: '2024-03-05',
      category: 'Education',
      image: '/images/blog/wine-storage.jpg',
      readTime: '4 min read'
    },
    {
      title: 'Champagne Investment Guide: Dom Pérignon vs Krug',
      excerpt: 'Comparing two prestigious Champagne houses from an investment perspective.',
      author: 'Sophie Laurent',
      date: '2024-03-03',
      category: 'Investment',
      image: '/images/blog/champagne-investment.jpg',
      readTime: '9 min read'
    },
    {
      title: 'Sustainable Winemaking: The Future is Green',
      excerpt: 'How leading wineries are adopting sustainable practices and what it means for wine quality.',
      author: 'Robert Green',
      date: '2024-03-01',
      category: 'Sustainability',
      image: '/images/blog/sustainable-wine.jpg',
      readTime: '6 min read'
    }
  ];

  const categories = [
    { name: 'All Posts', count: 156 },
    { name: 'Investment', count: 42 },
    { name: 'Education', count: 38 },
    { name: 'Technology', count: 24 },
    { name: 'Industry', count: 31 },
    { name: 'Crypto', count: 18 },
    { name: 'Sustainability', count: 15 }
  ];

  const popularPosts = [
    'Wine as an Alternative Investment: 2024 Guide',
    'Understanding Wine Futures: Bordeaux En Primeur',
    'Decanting 101: When and How to Decant Wine',
    'The Complete Guide to Wine Tasting',
    'Building Your First Wine Collection'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-burgundy to-purple-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Wine Blog</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Expert insights, investment advice, and industry news from our team of wine professionals
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Button className="bg-white text-burgundy hover:bg-gray-100 rounded-l-none">
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Post */}
            <Card className="mb-12 overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="h-64 md:h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Featured Image</span>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-4">
                    <span className="bg-burgundy text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                    <span className="ml-3 text-sm text-gray-500">{featuredPost.readTime}</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{featuredPost.title}</h2>
                  <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <User className="w-4 h-4 mr-1" />
                    <span className="mr-4">{featuredPost.author}</span>
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                  </div>
                  <Button>Read Full Article</Button>
                </div>
              </div>
            </Card>

            {/* Blog Posts Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {blogPosts.map((post, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Article Image</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                        {post.category}
                      </span>
                      <span className="ml-3 text-sm text-gray-500">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{post.title}</h3>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <User className="w-4 h-4 mr-1" />
                      <span className="mr-4">{post.author}</span>
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <Button variant="outline" size="sm">Read More</Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button size="lg">Load More Articles</Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Categories */}
            <Card className="p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Categories</h3>
              <ul className="space-y-2">
                {categories.map((category, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="flex justify-between items-center py-2 text-gray-700 hover:text-burgundy transition-colors"
                    >
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-500">({category.count})</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Popular Posts */}
            <Card className="p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-burgundy" />
                Popular Posts
              </h3>
              <ul className="space-y-3">
                {popularPosts.map((post, index) => (
                  <li key={index}>
                    <a 
                      href="#" 
                      className="text-gray-700 hover:text-burgundy transition-colors text-sm leading-relaxed"
                    >
                      {post}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Newsletter Signup */}
            <Card className="p-6 bg-burgundy text-white">
              <h3 className="text-xl font-semibold mb-4">Stay Updated</h3>
              <p className="mb-4 opacity-90">
                Get the latest wine insights and investment tips delivered to your inbox.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-3 py-2 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Button className="w-full bg-white text-burgundy hover:bg-gray-100">
                  Subscribe
                </Button>
              </div>
            </Card>

            {/* Tags */}
            <Card className="p-6 mt-8">
              <h3 className="text-xl font-semibold mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Bordeaux', 'Investment', 'Burgundy', 'Champagne', 'NFT', 'Crypto',
                  'Vintage', 'Tasting', 'Collection', 'Storage', 'Auction', 'Rare Wines'
                ].map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-burgundy hover:text-white cursor-pointer transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-burgundy text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Contribute?</h2>
          <p className="text-xl mb-8 opacity-90">
            Share your wine expertise with our community of collectors and enthusiasts
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Submit Article
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-burgundy">
              Contact Editorial Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}