'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface ProductSEO {
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  slug?: string
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  structuredData?: Record<string, any>
}

interface ProductSEOManagerProps {
  seo: ProductSEO
  onSEOChange: (seo: ProductSEO) => void
  productName: string
  productDescription: string
}

export function ProductSEOManager({ 
  seo, 
  onSEOChange, 
  productName, 
  productDescription 
}: ProductSEOManagerProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'advanced'>('basic')
  const [keywords, setKeywords] = useState<string>('')

  useEffect(() => {
    if (seo.metaKeywords) {
      setKeywords(seo.metaKeywords.join(', '))
    }
  }, [seo.metaKeywords])

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleAutoGenerate = () => {
    const generatedSlug = generateSlug(productName)
    const generatedMetaTitle = `${productName} | Premium Wine Collection`
    const generatedMetaDescription = productDescription.length > 160 
      ? productDescription.substring(0, 157) + '...'
      : productDescription

    onSEOChange({
      ...seo,
      slug: generatedSlug,
      metaTitle: generatedMetaTitle,
      metaDescription: generatedMetaDescription,
      ogTitle: generatedMetaTitle,
      ogDescription: generatedMetaDescription,
      twitterTitle: generatedMetaTitle,
      twitterDescription: generatedMetaDescription
    })
  }

  const handleKeywordsChange = (value: string) => {
    setKeywords(value)
    const keywordArray = value
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0)
    
    onSEOChange({
      ...seo,
      metaKeywords: keywordArray
    })
  }

  const generateStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": productName,
      "description": productDescription,
      "category": "Wine",
      "brand": {
        "@type": "Brand",
        "name": "Luxury Wine Collection"
      },
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/InStock",
        "priceCurrency": "USD"
      }
    }

    onSEOChange({
      ...seo,
      structuredData
    })
  }

  const getMetaTitleLength = () => seo.metaTitle?.length || 0
  const getMetaDescriptionLength = () => seo.metaDescription?.length || 0

  const tabs = [
    { id: 'basic', name: 'Basic SEO', icon: '🔍' },
    { id: 'social', name: 'Social Media', icon: '📱' },
    { id: 'advanced', name: 'Advanced', icon: '⚙️' }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">SEO & Metadata</h3>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleAutoGenerate}
          >
            Auto Generate
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={generateStructuredData}
          >
            Generate Schema
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-burgundy text-burgundy'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Basic SEO Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">URL Slug</label>
                <input
                  type="text"
                  value={seo.slug || ''}
                  onChange={(e) => onSEOChange({ ...seo, slug: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="product-url-slug"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /products/{seo.slug || 'product-slug'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Title
                  <span className={`ml-2 text-xs ${
                    getMetaTitleLength() > 60 ? 'text-red-500' : 
                    getMetaTitleLength() > 50 ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    ({getMetaTitleLength()}/60)
                  </span>
                </label>
                <input
                  type="text"
                  value={seo.metaTitle || ''}
                  onChange={(e) => onSEOChange({ ...seo, metaTitle: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Product Name | Premium Wine Collection"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optimal length: 50-60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Description
                  <span className={`ml-2 text-xs ${
                    getMetaDescriptionLength() > 160 ? 'text-red-500' : 
                    getMetaDescriptionLength() > 150 ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    ({getMetaDescriptionLength()}/160)
                  </span>
                </label>
                <textarea
                  value={seo.metaDescription || ''}
                  onChange={(e) => onSEOChange({ ...seo, metaDescription: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  rows={3}
                  placeholder="Brief description of the wine for search results"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optimal length: 150-160 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Meta Keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => handleKeywordsChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="wine, bordeaux, vintage, premium, luxury"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate keywords with commas. Current: {seo.metaKeywords?.length || 0} keywords
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Canonical URL</label>
                <input
                  type="url"
                  value={seo.canonicalUrl || ''}
                  onChange={(e) => onSEOChange({ ...seo, canonicalUrl: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="https://example.com/products/wine-name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use default product URL
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          {/* Open Graph */}
          <Card className="p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Open Graph (Facebook)</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">OG Title</label>
                <input
                  type="text"
                  value={seo.ogTitle || ''}
                  onChange={(e) => onSEOChange({ ...seo, ogTitle: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Title for social media sharing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">OG Description</label>
                <textarea
                  value={seo.ogDescription || ''}
                  onChange={(e) => onSEOChange({ ...seo, ogDescription: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  rows={2}
                  placeholder="Description for social media sharing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">OG Image URL</label>
                <input
                  type="url"
                  value={seo.ogImage || ''}
                  onChange={(e) => onSEOChange({ ...seo, ogImage: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="https://example.com/images/wine-social.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended size: 1200x630px
                </p>
              </div>
            </div>
          </Card>

          {/* Twitter */}
          <Card className="p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Twitter Cards</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Twitter Title</label>
                <input
                  type="text"
                  value={seo.twitterTitle || ''}
                  onChange={(e) => onSEOChange({ ...seo, twitterTitle: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Title for Twitter sharing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Twitter Description</label>
                <textarea
                  value={seo.twitterDescription || ''}
                  onChange={(e) => onSEOChange({ ...seo, twitterDescription: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  rows={2}
                  placeholder="Description for Twitter sharing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Twitter Image URL</label>
                <input
                  type="url"
                  value={seo.twitterImage || ''}
                  onChange={(e) => onSEOChange({ ...seo, twitterImage: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="https://example.com/images/wine-twitter.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended size: 1200x600px
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          <Card className="p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Structured Data (Schema.org)</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">JSON-LD Schema</label>
                <textarea
                  value={seo.structuredData ? JSON.stringify(seo.structuredData, null, 2) : ''}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      onSEOChange({ ...seo, structuredData: parsed })
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm font-mono text-sm"
                  rows={10}
                  placeholder="Structured data will appear here"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Valid JSON-LD structured data for search engines
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateStructuredData}
                >
                  Generate Product Schema
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (seo.structuredData) {
                      navigator.clipboard.writeText(JSON.stringify(seo.structuredData, null, 2))
                    }
                  }}
                >
                  Copy Schema
                </Button>
              </div>
            </div>
          </Card>

          {/* SEO Preview */}
          <Card className="p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Search Result Preview</h4>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                {seo.metaTitle || productName}
              </div>
              <div className="text-green-700 text-sm">
                https://example.com/products/{seo.slug || 'product-slug'}
              </div>
              <div className="text-gray-700 text-sm mt-1">
                {seo.metaDescription || productDescription.substring(0, 160)}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}