'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface ProductVariant {
  id?: string
  name: string
  sku: string
  attributes: Record<string, string>
  priceModifier: number
  stockQuantity: number
  isActive: boolean
}

interface ProductVariantManagerProps {
  variants: ProductVariant[]
  onVariantsChange: (variants: ProductVariant[]) => void
  baseProductSku: string
}

const VARIANT_ATTRIBUTES = {
  bottleSize: {
    name: 'Bottle Size',
    options: ['375ml', '750ml', '1.5L', '3L', '6L', '9L', '12L']
  },
  packaging: {
    name: 'Packaging',
    options: ['Single Bottle', '2-Pack', '3-Pack', '6-Pack', '12-Pack', 'Case (12)', 'Wooden Box']
  },
  condition: {
    name: 'Condition',
    options: ['Perfect', 'Excellent', 'Very Good', 'Good', 'Fair']
  },
  provenance: {
    name: 'Provenance',
    options: ['Domaine Direct', 'Négociant', 'Private Cellar', 'Restaurant', 'Auction']
  },
  storage: {
    name: 'Storage History',
    options: ['Professional Cellar', 'Temperature Controlled', 'Home Cellar', 'Unknown']
  }
}

export function ProductVariantManager({ 
  variants, 
  onVariantsChange, 
  baseProductSku 
}: ProductVariantManagerProps) {
  const [showAddVariant, setShowAddVariant] = useState(false)
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({
    name: '',
    sku: '',
    attributes: {},
    priceModifier: 0,
    stockQuantity: 0,
    isActive: true
  })

  const generateVariantSku = (attributes: Record<string, string>) => {
    const attributeCode = Object.entries(attributes)
      .map(([key, value]) => {
        const shortKey = key.substring(0, 2).toUpperCase()
        const shortValue = value.replace(/[^A-Z0-9]/gi, '').substring(0, 3).toUpperCase()
        return `${shortKey}${shortValue}`
      })
      .join('-')
    
    return `${baseProductSku}-${attributeCode}`
  }

  const generateVariantName = (attributes: Record<string, string>) => {
    return Object.entries(attributes)
      .map(([key, value]) => `${VARIANT_ATTRIBUTES[key as keyof typeof VARIANT_ATTRIBUTES]?.name || key}: ${value}`)
      .join(', ')
  }

  const handleAddVariant = () => {
    if (!newVariant.name || !newVariant.sku) return

    const variant: ProductVariant = {
      name: newVariant.name,
      sku: newVariant.sku,
      attributes: newVariant.attributes || {},
      priceModifier: newVariant.priceModifier || 0,
      stockQuantity: newVariant.stockQuantity || 0,
      isActive: newVariant.isActive ?? true
    }

    onVariantsChange([...variants, variant])
    setNewVariant({
      name: '',
      sku: '',
      attributes: {},
      priceModifier: 0,
      stockQuantity: 0,
      isActive: true
    })
    setShowAddVariant(false)
  }

  const handleUpdateVariant = (index: number, updates: Partial<ProductVariant>) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], ...updates }
    onVariantsChange(newVariants)
  }

  const handleRemoveVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index)
    onVariantsChange(newVariants)
  }

  const handleAttributeChange = (key: string, value: string) => {
    const newAttributes = { ...newVariant.attributes, [key]: value }
    const generatedName = generateVariantName(newAttributes)
    const generatedSku = generateVariantSku(newAttributes)
    
    setNewVariant({
      ...newVariant,
      attributes: newAttributes,
      name: generatedName,
      sku: generatedSku
    })
  }

  const handleVariantAttributeChange = (index: number, key: string, value: string) => {
    const variant = variants[index]
    const newAttributes = { ...variant.attributes, [key]: value }
    const generatedName = generateVariantName(newAttributes)
    const generatedSku = generateVariantSku(newAttributes)
    
    handleUpdateVariant(index, {
      attributes: newAttributes,
      name: generatedName,
      sku: generatedSku
    })
  }

  const getTotalVariantStock = () => {
    return variants.reduce((total, variant) => total + variant.stockQuantity, 0)
  }

  const getActiveVariantsCount = () => {
    return variants.filter(variant => variant.isActive).length
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
          <p className="text-sm text-gray-600">
            Manage different versions of this product (sizes, packaging, conditions)
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddVariant(true)}
        >
          Add Variant
        </Button>
      </div>

      {/* Variant Summary */}
      {variants.length > 0 && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{variants.length}</div>
              <div className="text-sm text-gray-600">Total Variants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{getActiveVariantsCount()}</div>
              <div className="text-sm text-gray-600">Active Variants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{getTotalVariantStock()}</div>
              <div className="text-sm text-gray-600">Total Stock</div>
            </div>
          </div>
        </Card>
      )}

      {variants.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No product variants configured</p>
          <p className="text-sm text-gray-400 mt-1">
            Variants allow you to offer different sizes, packaging, or conditions of the same wine
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddVariant(true)}
            className="mt-2"
          >
            Create First Variant
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{variant.name}</h4>
                    <p className="text-sm text-gray-600">SKU: {variant.sku}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      variant.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {variant.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => handleRemoveVariant(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price Modifier</label>
                    <div className="mt-1 relative">
                      <input
                        type="number"
                        step="0.01"
                        value={variant.priceModifier}
                        onChange={(e) => handleUpdateVariant(index, { priceModifier: parseFloat(e.target.value) || 0 })}
                        className="block w-full rounded-md border-gray-300 shadow-sm pr-8"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <span className="text-gray-500 text-sm">$</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={variant.stockQuantity}
                      onChange={(e) => handleUpdateVariant(index, { stockQuantity: parseInt(e.target.value) || 0 })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={variant.isActive.toString()}
                      onChange={(e) => handleUpdateVariant(index, { isActive: e.target.value === 'true' })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Actions</label>
                    <div className="mt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newStock = prompt('Enter new stock quantity:', variant.stockQuantity.toString())
                          if (newStock && !isNaN(parseInt(newStock))) {
                            handleUpdateVariant(index, { stockQuantity: parseInt(newStock) })
                          }
                        }}
                      >
                        Update Stock
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Variant Attributes */}
                <div className="border-t pt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Attributes</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(VARIANT_ATTRIBUTES).map(([key, config]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700">{config.name}</label>
                        <select
                          value={variant.attributes[key] || ''}
                          onChange={(e) => handleVariantAttributeChange(index, key, e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        >
                          <option value="">Select {config.name}</option>
                          {config.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Variant Form */}
      {showAddVariant && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="text-md font-medium text-gray-900 mb-3">Add New Variant</h4>
          
          {/* Variant Attributes */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(VARIANT_ATTRIBUTES).map(([key, config]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700">{config.name}</label>
                  <select
                    value={newVariant.attributes?.[key] || ''}
                    onChange={(e) => handleAttributeChange(key, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Select {config.name}</option>
                    {config.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Generated Name and SKU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Generated Name</label>
                <input
                  type="text"
                  value={newVariant.name || ''}
                  onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Will be generated from attributes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Generated SKU</label>
                <input
                  type="text"
                  value={newVariant.sku || ''}
                  onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Will be generated from attributes"
                />
              </div>
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price Modifier ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newVariant.priceModifier || ''}
                  onChange={(e) => setNewVariant({ ...newVariant, priceModifier: parseFloat(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Additional cost (+) or discount (-) compared to base price
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Stock</label>
                <input
                  type="number"
                  min="0"
                  value={newVariant.stockQuantity || ''}
                  onChange={(e) => setNewVariant({ ...newVariant, stockQuantity: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddVariant(false)
                setNewVariant({
                  name: '',
                  sku: '',
                  attributes: {},
                  priceModifier: 0,
                  stockQuantity: 0,
                  isActive: true
                })
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddVariant}
              disabled={!newVariant.name || !newVariant.sku}
            >
              Add Variant
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}