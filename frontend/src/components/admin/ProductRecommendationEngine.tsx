'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface RecommendationRule {
  id?: string
  type: 'similar_products' | 'complementary' | 'upsell' | 'cross_sell' | 'frequently_bought'
  title: string
  description: string
  conditions: RecommendationCondition[]
  targetProducts: string[]
  priority: number
  isActive: boolean
}

interface RecommendationCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range'
  value: string | number | string[]
}

interface ProductRecommendationEngineProps {
  productId: string
  recommendations: RecommendationRule[]
  onRecommendationsChange: (recommendations: RecommendationRule[]) => void
  availableProducts: Array<{ id: string; name: string; category: string; price: number }>
}

const RECOMMENDATION_TYPES = [
  {
    type: 'similar_products',
    name: 'Similar Products',
    description: 'Products with similar characteristics'
  },
  {
    type: 'complementary',
    name: 'Complementary Items',
    description: 'Products that go well together'
  },
  {
    type: 'upsell',
    name: 'Upsell',
    description: 'Higher-priced alternatives'
  },
  {
    type: 'cross_sell',
    name: 'Cross-sell',
    description: 'Related products from different categories'
  },
  {
    type: 'frequently_bought',
    name: 'Frequently Bought Together',
    description: 'Products often purchased together'
  }
]

const CONDITION_FIELDS = [
  { field: 'category', name: 'Category' },
  { field: 'producer', name: 'Producer' },
  { field: 'region', name: 'Region' },
  { field: 'vintage', name: 'Vintage' },
  { field: 'price', name: 'Price' },
  { field: 'rating', name: 'Rating' },
  { field: 'alcohol_content', name: 'Alcohol Content' }
]

const OPERATORS = [
  { operator: 'equals', name: 'Equals' },
  { operator: 'contains', name: 'Contains' },
  { operator: 'greater_than', name: 'Greater Than' },
  { operator: 'less_than', name: 'Less Than' },
  { operator: 'in_range', name: 'In Range' }
]

export function ProductRecommendationEngine({
  productId,
  recommendations,
  onRecommendationsChange,
  availableProducts
}: ProductRecommendationEngineProps) {
  const [showAddRule, setShowAddRule] = useState(false)
  const [newRule, setNewRule] = useState<Partial<RecommendationRule>>({
    type: 'similar_products',
    title: '',
    description: '',
    conditions: [],
    targetProducts: [],
    priority: 1,
    isActive: true
  })

  const handleAddRule = () => {
    if (!newRule.title || !newRule.type) return

    const rule: RecommendationRule = {
      type: newRule.type as any,
      title: newRule.title,
      description: newRule.description || '',
      conditions: newRule.conditions || [],
      targetProducts: newRule.targetProducts || [],
      priority: newRule.priority || 1,
      isActive: newRule.isActive ?? true
    }

    onRecommendationsChange([...recommendations, rule])
    setNewRule({
      type: 'similar_products',
      title: '',
      description: '',
      conditions: [],
      targetProducts: [],
      priority: 1,
      isActive: true
    })
    setShowAddRule(false)
  }

  const handleUpdateRule = (index: number, updates: Partial<RecommendationRule>) => {
    const newRules = [...recommendations]
    newRules[index] = { ...newRules[index], ...updates }
    onRecommendationsChange(newRules)
  }

  const handleRemoveRule = (index: number) => {
    const newRules = recommendations.filter((_, i) => i !== index)
    onRecommendationsChange(newRules)
  }

  const handleAddCondition = (ruleIndex: number) => {
    const newCondition: RecommendationCondition = {
      field: 'category',
      operator: 'equals',
      value: ''
    }
    
    const newRules = [...recommendations]
    newRules[ruleIndex].conditions.push(newCondition)
    onRecommendationsChange(newRules)
  }

  const handleUpdateCondition = (
    ruleIndex: number, 
    conditionIndex: number, 
    updates: Partial<RecommendationCondition>
  ) => {
    const newRules = [...recommendations]
    newRules[ruleIndex].conditions[conditionIndex] = {
      ...newRules[ruleIndex].conditions[conditionIndex],
      ...updates
    }
    onRecommendationsChange(newRules)
  }

  const handleRemoveCondition = (ruleIndex: number, conditionIndex: number) => {
    const newRules = [...recommendations]
    newRules[ruleIndex].conditions.splice(conditionIndex, 1)
    onRecommendationsChange(newRules)
  }

  const getRecommendationTypeInfo = (type: string) => {
    return RECOMMENDATION_TYPES.find(t => t.type === type)
  }

  const getProductName = (productId: string) => {
    const product = availableProducts.find(p => p.id === productId)
    return product ? product.name : productId
  }

  const generateAutoRecommendations = async () => {
    // This would typically call an API to generate recommendations based on ML algorithms
    // For now, we'll create some basic rules
    const autoRules: RecommendationRule[] = [
      {
        type: 'similar_products',
        title: 'Similar Wines',
        description: 'Wines from the same region and category',
        conditions: [
          { field: 'category', operator: 'equals', value: 'current_category' },
          { field: 'region', operator: 'equals', value: 'current_region' }
        ],
        targetProducts: [],
        priority: 1,
        isActive: true
      },
      {
        type: 'upsell',
        title: 'Premium Alternatives',
        description: 'Higher-priced wines from the same producer',
        conditions: [
          { field: 'producer', operator: 'equals', value: 'current_producer' },
          { field: 'price', operator: 'greater_than', value: 'current_price' }
        ],
        targetProducts: [],
        priority: 2,
        isActive: true
      }
    ]

    onRecommendationsChange([...recommendations, ...autoRules])
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Recommendation Engine</h3>
          <p className="text-sm text-gray-600">
            Configure product recommendations and cross-selling rules
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={generateAutoRecommendations}
          >
            Auto Generate
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddRule(true)}
          >
            Add Rule
          </Button>
        </div>
      </div>

      {/* Recommendation Statistics */}
      <Card className="p-4 bg-purple-50 border-purple-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{recommendations.length}</div>
            <div className="text-sm text-gray-600">Total Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {recommendations.filter(r => r.isActive).length}
            </div>
            <div className="text-sm text-gray-600">Active Rules</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {recommendations.reduce((sum, r) => sum + r.targetProducts.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Target Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(recommendations.reduce((sum, r) => sum + r.priority, 0) / recommendations.length) || 0}
            </div>
            <div className="text-sm text-gray-600">Avg Priority</div>
          </div>
        </div>
      </Card>

      {recommendations.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No recommendation rules configured</p>
          <p className="text-sm text-gray-400 mt-1">
            Create rules to automatically suggest related products to customers
          </p>
          <div className="flex justify-center space-x-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={generateAutoRecommendations}
            >
              Auto Generate Rules
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddRule(true)}
            >
              Create Manual Rule
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {recommendations
            .sort((a, b) => b.priority - a.priority)
            .map((rule, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{rule.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rule.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {getRecommendationTypeInfo(rule.type)?.name}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          Priority: {rule.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => handleRemoveRule(index)}
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={rule.type}
                        onChange={(e) => handleUpdateRule(index, { type: e.target.value as any })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      >
                        {RECOMMENDATION_TYPES.map(type => (
                          <option key={type.type} value={type.type}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={rule.priority}
                        onChange={(e) => handleUpdateRule(index, { priority: parseInt(e.target.value) || 1 })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={rule.isActive.toString()}
                        onChange={(e) => handleUpdateRule(index, { isActive: e.target.value === 'true' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-sm font-medium text-gray-700">Conditions</h5>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddCondition(index)}
                      >
                        Add Condition
                      </Button>
                    </div>
                    
                    {rule.conditions.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No conditions set</p>
                    ) : (
                      <div className="space-y-2">
                        {rule.conditions.map((condition, conditionIndex) => (
                          <div key={conditionIndex} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <select
                              value={condition.field}
                              onChange={(e) => handleUpdateCondition(index, conditionIndex, { field: e.target.value })}
                              className="rounded border-gray-300"
                            >
                              {CONDITION_FIELDS.map(field => (
                                <option key={field.field} value={field.field}>
                                  {field.name}
                                </option>
                              ))}
                            </select>
                            
                            <select
                              value={condition.operator}
                              onChange={(e) => handleUpdateCondition(index, conditionIndex, { operator: e.target.value as any })}
                              className="rounded border-gray-300"
                            >
                              {OPERATORS.map(op => (
                                <option key={op.operator} value={op.operator}>
                                  {op.name}
                                </option>
                              ))}
                            </select>
                            
                            <input
                              type="text"
                              value={condition.value.toString()}
                              onChange={(e) => handleUpdateCondition(index, conditionIndex, { value: e.target.value })}
                              className="flex-1 rounded border-gray-300"
                              placeholder="Value"
                            />
                            
                            <Button
                              type="button"
                              size="sm"
                              variant="danger"
                              onClick={() => handleRemoveCondition(index, conditionIndex)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Target Products */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Target Products</h5>
                    {rule.targetProducts.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        Products will be automatically selected based on conditions
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {rule.targetProducts.map(productId => (
                          <span key={productId} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                            {getProductName(productId)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Add New Rule Form */}
      {showAddRule && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="text-md font-medium text-gray-900 mb-3">Add Recommendation Rule</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rule Title</label>
                <input
                  type="text"
                  value={newRule.title || ''}
                  onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="e.g., Similar Bordeaux Wines"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Recommendation Type</label>
                <select
                  value={newRule.type || ''}
                  onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  {RECOMMENDATION_TYPES.map(type => (
                    <option key={type.type} value={type.type}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={newRule.description || ''}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                rows={2}
                placeholder="Describe when this rule should be applied"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newRule.priority || 1}
                  onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) || 1 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="newRuleActive"
                  checked={newRule.isActive ?? true}
                  onChange={(e) => setNewRule({ ...newRule, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="newRuleActive" className="text-sm text-gray-700">
                  Active
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddRule(false)
                setNewRule({
                  type: 'similar_products',
                  title: '',
                  description: '',
                  conditions: [],
                  targetProducts: [],
                  priority: 1,
                  isActive: true
                })
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddRule}
              disabled={!newRule.title || !newRule.type}
            >
              Add Rule
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}