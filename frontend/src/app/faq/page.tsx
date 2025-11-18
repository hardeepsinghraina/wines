'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  // Wine & Products
  {
    id: '1',
    category: 'Wine & Products',
    question: 'How do you verify the authenticity of your wines?',
    answer: 'Each bottle includes a blockchain-secured digital certificate accessible through a unique QR code. This tamper-proof system verifies the wine\'s origin, age, and ownership history.'
  },
  {
    id: '2',
    category: 'Wine & Products',
    question: 'What is a digital wine certificate?',
    answer: 'It\'s a tamper-proof NFT-based record verifying the wine\'s origin, age, and ownership history. This blockchain technology ensures authenticity and provides a complete provenance trail.'
  },
  {
    id: '3',
    category: 'Wine & Products',
    question: 'How should I store my wines after delivery?',
    answer: 'Store wines in a cool, dark place at 55-60°F (13-15°C) with 70% humidity. Keep bottles on their side to keep corks moist. Avoid temperature fluctuations and direct sunlight.'
  },
  {
    id: '4',
    category: 'Wine & Products',
    question: 'Do you offer wine recommendations?',
    answer: 'Yes! Our certified sommeliers provide personalized recommendations based on your preferences, occasion, and budget. Contact us for expert wine advice.'
  },

  // Payments & Crypto
  {
    id: '5',
    category: 'Payments & Crypto',
    question: 'What cryptocurrencies do you accept?',
    answer: 'We accept Bitcoin (BTC), Ethereum (ETH), and USDT TRC20. Payments are made directly to our secure wallet addresses with QR codes for easy mobile payments.'
  },
  {
    id: '6',
    category: 'Payments & Crypto',
    question: 'How do cryptocurrency payments work?',
    answer: 'Select crypto payment at checkout, choose your currency, and send the exact amount to our provided wallet address. We monitor blockchain transactions for payment confirmation.'
  },
  {
    id: '7',
    category: 'Payments & Crypto',
    question: 'Are crypto payments secure?',
    answer: 'Yes, cryptocurrency payments are highly secure. We use read-only wallet addresses and blockchain verification. All transactions are recorded on the blockchain for transparency.'
  },
  {
    id: '8',
    category: 'Payments & Crypto',
    question: 'What if I send the wrong amount?',
    answer: 'Contact us immediately if you send an incorrect amount. We can help resolve payment discrepancies, though blockchain transactions cannot be reversed.'
  },

  // Shipping & Delivery
  {
    id: '9',
    category: 'Shipping & Delivery',
    question: 'Do you ship internationally?',
    answer: 'Yes, we offer global VIP delivery with full insurance. Shipping costs and delivery times vary by location. All shipments include premium packaging and tracking.'
  },
  {
    id: '10',
    category: 'Shipping & Delivery',
    question: 'How long does delivery take?',
    answer: 'Delivery times vary by location: 2-3 days for domestic, 5-7 days for international express, and 7-14 days for standard international shipping.'
  },
  {
    id: '11',
    category: 'Shipping & Delivery',
    question: 'Is shipping insured?',
    answer: 'Yes, all shipments are fully insured against damage or loss. We use premium packaging designed specifically for wine transport.'
  },
  {
    id: '12',
    category: 'Shipping & Delivery',
    question: 'Can I track my order?',
    answer: 'Yes, you\'ll receive tracking information once your order ships. You can monitor your package through our order tracking system or the carrier\'s website.'
  },

  // Orders & Account
  {
    id: '13',
    category: 'Orders & Account',
    question: 'How can I track my order status?',
    answer: 'Log into your account and visit the Order History page to see real-time status updates, tracking information, and delivery estimates for all your orders.'
  },
  {
    id: '14',
    category: 'Orders & Account',
    question: 'Can I modify or cancel my order?',
    answer: 'Orders can be modified or cancelled within 1 hour of placement. After processing begins, changes may not be possible. Contact us immediately for assistance.'
  },
  {
    id: '15',
    category: 'Orders & Account',
    question: 'What is your return policy?',
    answer: 'We accept returns within 30 days for unopened bottles in original packaging. Damaged or defective items are replaced immediately. Contact us to initiate a return.'
  },
  {
    id: '16',
    category: 'Orders & Account',
    question: 'How do I create an account?',
    answer: 'Click "Register" in the top menu, provide your email and create a password. Account creation is free and gives you access to order tracking, recommendations, and exclusive offers.'
  },

  // Technical & Support
  {
    id: '17',
    category: 'Technical & Support',
    question: 'I\'m having trouble with the website. What should I do?',
    answer: 'Try refreshing the page or clearing your browser cache. If issues persist, contact our technical support team through the contact form or live chat.'
  },
  {
    id: '18',
    category: 'Technical & Support',
    question: 'How do I contact customer support?',
    answer: 'You can reach us through our contact form, live chat, or email at support@luxurywines.com. We respond within 24 hours and offer priority support for VIP customers.'
  },
  {
    id: '19',
    category: 'Technical & Support',
    question: 'Do you offer phone support?',
    answer: 'Yes, call us at +1 (555) 123-WINE during business hours (Mon-Fri, 9AM-6PM PST) to speak directly with our wine experts and support team.'
  },
  {
    id: '20',
    category: 'Technical & Support',
    question: 'What are your business hours?',
    answer: 'Our customer support is available Monday-Friday, 9AM-6PM PST. Email support is monitored 24/7, and we offer weekend support via email for urgent matters.'
  }
]

const categories = [
  'All',
  'Wine & Products',
  'Payments & Crypto',
  'Shipping & Delivery',
  'Orders & Account',
  'Technical & Support'
]

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                  <Skeleton className="h-5 w-5" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-charcoal-black mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-olive max-w-2xl mx-auto">
            Find answers to common questions about our wines, payments, shipping, and more.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-olive w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-burgundy focus:border-burgundy"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-burgundy text-white'
                    : 'bg-white text-muted-olive hover:bg-burgundy/10 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-3/4" />
                    </div>
                    <Skeleton className="h-5 w-5" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredFAQs.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-olive mb-4">No FAQs found matching your search.</p>
              <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
            </Card>
          ) : (
            filteredFAQs.map((faq) => (
              <Card key={faq.id} className="overflow-hidden">
                <button
                  onClick={() => toggleExpanded(faq.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-burgundy font-medium mb-1">
                        {faq.category}
                      </div>
                      <h3 className="text-lg font-semibold text-charcoal-black">
                        {faq.question}
                      </h3>
                    </div>
                    {expandedItems.includes(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-muted-olive ml-4" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-olive ml-4" />
                    )}
                  </div>
                </button>
                
                {expandedItems.includes(faq.id) && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <p className="text-muted-olive leading-relaxed pt-4">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Contact CTA */}
        <Card className="p-8 bg-gradient-to-r from-burgundy to-deep-burgundy text-white text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-lg opacity-90 mb-6">
            Our expert team is here to help with any questions about wines, orders, or payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button variant="outline" size="lg" className="bg-white text-burgundy hover:bg-gray-100">
                Contact Support
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Start Live Chat
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}