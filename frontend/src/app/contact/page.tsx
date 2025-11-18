'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Mail, Phone, MapPin, Clock, MessageCircle, HelpCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl('/api/contact/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit contact form')
      }

      setSubmitted(true)
      setErrors({})
    } catch (error) {
      console.error('Failed to submit contact form:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to submit form' })
    } finally {
      setLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'support@luxurywines.com',
      description: 'Get in touch via email for general inquiries'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+1 (555) 123-WINE',
      description: 'Speak with our wine experts directly'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '123 Wine Street, Napa Valley, CA',
      description: 'Our flagship tasting room and headquarters'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Mon-Fri: 9AM-6PM PST',
      description: 'Weekend support available via email'
    }
  ]

  const categories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'orders', label: 'Order Support' },
    { value: 'shipping', label: 'Shipping & Delivery' },
    { value: 'payments', label: 'Payment & Crypto' },
    { value: 'wine-advice', label: 'Wine Recommendations' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'partnership', label: 'Business Partnership' }
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream-white py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-charcoal-black mb-4">Message Sent Successfully!</h1>
            <p className="text-muted-olive mb-6">
              Thank you for contacting us. Our team will review your message and get back to you within 24 hours.
            </p>
            <Button onClick={() => setSubmitted(false)}>Send Another Message</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-charcoal-black mb-4">Contact Us</h1>
          <p className="text-xl text-muted-olive max-w-3xl mx-auto">
            Have questions about our wines, need help with an order, or want to learn more about cryptocurrency payments?
            We're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold text-charcoal-black mb-6">Get in Touch</h2>
            <div className="space-y-6">
              {contactInfo.map((info) => (
                <Card key={info.title} className="p-4">
                  <div className="flex items-start space-x-3">
                    <info.icon className="w-6 h-6 text-burgundy mt-1" />
                    <div>
                      <h3 className="font-semibold text-charcoal-black">{info.title}</h3>
                      <p className="text-burgundy font-medium">{info.details}</p>
                      <p className="text-sm text-muted-olive mt-1">{info.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* FAQ Link */}
            <Card className="p-6 mt-6 bg-burgundy text-white">
              <div className="flex items-center space-x-3 mb-3">
                <HelpCircle className="w-6 h-6" />
                <h3 className="font-semibold">Frequently Asked Questions</h3>
              </div>
              <p className="text-sm opacity-90 mb-4">
                Find quick answers to common questions about orders, shipping, and payments.
              </p>
              <Button variant="outline" size="sm" className="bg-white text-burgundy hover:bg-gray-100">
                View FAQ
              </Button>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-semibold text-charcoal-black mb-6">Send us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-black mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-burgundy focus:border-burgundy ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-black mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-burgundy focus:border-burgundy ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-black mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-burgundy focus:border-burgundy"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-black mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-burgundy focus:border-burgundy ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Brief description of your inquiry"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-black mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-burgundy focus:border-burgundy ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Please provide details about your inquiry..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                  )}
                </div>

                {errors.submit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-olive">
                    * Required fields. We'll respond within 24 hours.
                  </p>
                  <Button type="submit" size="lg" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>

        {/* Additional Support */}
        <div className="mt-16">
          <Card className="p-8 bg-gradient-to-r from-burgundy to-deep-burgundy text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Need Immediate Assistance?</h2>
            <p className="text-lg opacity-90 mb-6">
              For urgent matters or technical support, our team is available via live chat
            </p>
            <Button variant="outline" size="lg" className="bg-white text-burgundy hover:bg-gray-100">
              Start Live Chat
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}