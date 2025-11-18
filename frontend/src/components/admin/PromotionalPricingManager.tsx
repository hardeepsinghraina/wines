'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Tag,
  Settings,
  BarChart3,
  Mail,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PromotionalAnalyticsDashboard } from '../promotional/PromotionalAnalyticsDashboard'
import { PromotionalPricingAPI } from '@/lib/promotional-pricing-api'
import {
  Promotion,
  DiscountCode,
  CreatePromotionRequest,
  CreateDiscountCodeRequest,
  PromotionType,
  DiscountType,
  CustomerTier
} from '../../../../shared/types/promotional-pricing'

export function PromotionalPricingManager() {
  const [activeTab, setActiveTab] = useState<'promotions' | 'discounts' | 'analytics'>('promotions')
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      // Mock data - in real implementation, fetch from API
      setPromotions([
        {
          id: 'promo-1',
          name: 'Premium Collection Flash Sale',
          description: '80% off all premium wines',
          type: 'flash_sale',
          discountType: 'percentage',
          discountValue: 80,
          applicableProducts: [],
          applicableCategories: [],
          customerTiers: ['bronze', 'silver', 'gold', 'platinum', 'vip'],
          currentUsageCount: 187,
          totalUsageLimit: 1000,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          isActive: true,
          bannerMessage: '🔥 80% OFF Premium Collection!',
          urgencyMessage: 'Limited time offer!',
          impressions: 15420,
          clicks: 2341,
          conversions: 187,
          revenue: 93500,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
      
      setDiscountCodes([
        {
          id: 'code-1',
          code: 'WELCOME10',
          name: 'Welcome Discount',
          description: '10% off for new customers',
          discountType: 'percentage',
          discountValue: 10,
          applicableProducts: [],
          applicableCategories: [],
          customerTiers: ['bronze', 'silver', 'gold', 'platinum', 'vip'],
          currentUsageCount: 45,
          totalUsageLimit: 100,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          isActive: true,
          usageCount: 45,
          revenue: 2250,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ])
    } catch (error) {
      console.error('Failed to load promotional data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePromotion = async (data: CreatePromotionRequest) => {
    try {
      await PromotionalPricingAPI.createPromotion(data)
      await loadData()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create promotion:', error)
    }
  }

  const handleCreateDiscountCode = async (data: CreateDiscountCodeRequest) => {
    try {
      await PromotionalPricingAPI.createDiscountCode(data)
      await loadData()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create discount code:', error)
    }
  }

  const handleViewAnalytics = (promotionId: string) => {
    setSelectedPromotionId(promotionId)
    setShowAnalyticsModal(true)
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Promotional Pricing Management
        </h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-burgundy hover:bg-burgundy/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'promotions', name: 'Promotions', icon: Tag },
            { id: 'discounts', name: 'Discount Codes', icon: Settings },
            { id: 'analytics', name: 'Analytics', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-burgundy text-burgundy'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'promotions' && (
        <PromotionsTab
          promotions={promotions}
          onViewAnalytics={handleViewAnalytics}
          onEdit={(id) => console.log('Edit promotion:', id)}
          onDelete={(id) => console.log('Delete promotion:', id)}
        />
      )}

      {activeTab === 'discounts' && (
        <DiscountCodesTab
          discountCodes={discountCodes}
          onEdit={(id) => console.log('Edit discount code:', id)}
          onDelete={(id) => console.log('Delete discount code:', id)}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsOverview promotions={promotions} />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePromotionModal
          onClose={() => setShowCreateModal(false)}
          onCreatePromotion={handleCreatePromotion}
          onCreateDiscountCode={handleCreateDiscountCode}
        />
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && selectedPromotionId && (
        <Modal
          isOpen={showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(false)}
          title="Promotional Analytics"
          size="xl"
        >
          <PromotionalAnalyticsDashboard promotionId={selectedPromotionId} />
        </Modal>
      )}
    </div>
  )
}

// Promotions tab component
interface PromotionsTabProps {
  promotions: Promotion[]
  onViewAnalytics: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

function PromotionsTab({ promotions, onViewAnalytics, onEdit, onDelete }: PromotionsTabProps) {
  return (
    <div className="space-y-4">
      {promotions.map((promotion) => (
        <div key={promotion.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {promotion.name}
                </h3>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${promotion.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                  }
                `}>
                  {promotion.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {promotion.discountValue}% OFF
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{promotion.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Impressions</p>
                    <p className="font-semibold">{promotion.impressions.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Conversions</p>
                    <p className="font-semibold">{promotion.conversions}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="font-semibold">${promotion.revenue.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Usage</p>
                    <p className="font-semibold">
                      {promotion.currentUsageCount}
                      {promotion.totalUsageLimit && `/${promotion.totalUsageLimit}`}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {promotion.startDate.toLocaleDateString()} - {promotion.endDate.toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onViewAnalytics(promotion.id)}
                variant="outline"
                size="sm"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                Analytics
              </Button>
              <Button
                onClick={() => onEdit(promotion.id)}
                variant="outline"
                size="sm"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => onDelete(promotion.id)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Discount codes tab component
interface DiscountCodesTabProps {
  discountCodes: DiscountCode[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

function DiscountCodesTab({ discountCodes, onEdit, onDelete }: DiscountCodesTabProps) {
  return (
    <div className="space-y-4">
      {discountCodes.map((code) => (
        <div key={code.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {code.code}
                </h3>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${code.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                  }
                `}>
                  {code.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                  {code.discountValue}% OFF
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{code.name}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Usage Count</p>
                  <p className="font-semibold">
                    {code.usageCount}
                    {code.totalUsageLimit && `/${code.totalUsageLimit}`}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Revenue Generated</p>
                  <p className="font-semibold">${code.revenue.toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Valid Until</p>
                  <p className="font-semibold">{code.endDate.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onEdit(code.id)}
                variant="outline"
                size="sm"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => onDelete(code.id)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Analytics overview component
function AnalyticsOverview({ promotions }: { promotions: Promotion[] }) {
  const totalRevenue = promotions.reduce((sum, p) => sum + p.revenue, 0)
  const totalConversions = promotions.reduce((sum, p) => sum + p.conversions, 0)
  const totalImpressions = promotions.reduce((sum, p) => sum + p.impressions, 0)
  const averageConversionRate = totalImpressions > 0 ? (totalConversions / totalImpressions) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Conversions</p>
              <p className="text-2xl font-bold text-gray-900">{totalConversions.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Impressions</p>
              <p className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</p>
            </div>
            <Eye className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{averageConversionRate.toFixed(1)}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      {promotions.length > 0 && (
        <PromotionalAnalyticsDashboard promotionId={promotions[0].id} />
      )}
    </div>
  )
}

// Create promotion modal component
interface CreatePromotionModalProps {
  onClose: () => void
  onCreatePromotion: (data: CreatePromotionRequest) => void
  onCreateDiscountCode: (data: CreateDiscountCodeRequest) => void
}

function CreatePromotionModal({ onClose, onCreatePromotion, onCreateDiscountCode }: CreatePromotionModalProps) {
  const [type, setType] = useState<'promotion' | 'discount'>('promotion')
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    type: 'flash_sale',
    discountType: 'percentage',
    discountValue: 10,
    customerTiers: ['bronze', 'silver', 'gold', 'platinum', 'vip'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      applicableProducts: [],
      applicableCategories: []
    }

    if (type === 'promotion') {
      onCreatePromotion(data)
    } else {
      onCreateDiscountCode({
        ...data,
        code: formData.code || formData.name.toUpperCase().replace(/\s+/g, '')
      })
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Create New Promotion" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setType('promotion')}
            className={`
              flex-1 p-4 rounded-lg border-2 text-center
              ${type === 'promotion' 
                ? 'border-burgundy bg-burgundy/5 text-burgundy' 
                : 'border-gray-200 text-gray-600'
              }
            `}
          >
            <Tag className="w-6 h-6 mx-auto mb-2" />
            <h3 className="font-medium">Promotion Campaign</h3>
            <p className="text-sm opacity-75">Site-wide promotional offers</p>
          </button>
          
          <button
            type="button"
            onClick={() => setType('discount')}
            className={`
              flex-1 p-4 rounded-lg border-2 text-center
              ${type === 'discount' 
                ? 'border-burgundy bg-burgundy/5 text-burgundy' 
                : 'border-gray-200 text-gray-600'
              }
            `}
          >
            <Settings className="w-6 h-6 mx-auto mb-2" />
            <h3 className="font-medium">Discount Code</h3>
            <p className="text-sm opacity-75">Specific coupon codes</p>
          </button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent"
              required
            />
          </div>

          {type === 'discount' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code
              </label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent"
                placeholder="AUTO-GENERATED"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Value
            </label>
            <input
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent"
              min="0"
              max="100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-transparent"
            rows={3}
            required
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-burgundy hover:bg-burgundy/90">
            Create {type === 'promotion' ? 'Promotion' : 'Discount Code'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}