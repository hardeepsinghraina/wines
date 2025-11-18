'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { type Product, type CreateProductData } from '@/lib/admin-product-api'

interface ProductFormProps {
  product?: Product
  onSubmit: (data: CreateProductData) => void
  onCancel: () => void
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    producer: product?.producer || '',
    region: product?.region || '',
    vintage: product?.vintage || 2020,
    category: product?.category || '',
    description: product?.description || '',
    tastingNotes: product?.tastingNotes || '',
    alcoholContent: product?.alcoholContent || 13.5,
    bottleSize: product?.bottleSize || '750ml',
    sku: product?.sku || '',
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    isNftAvailable: product?.isNftAvailable ?? false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Producer</label>
          <input
            type="text"
            value={formData.producer}
            onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Region</label>
          <input
            type="text"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Vintage</label>
          <input
            type="number"
            min="1900"
            max="2030"
            value={formData.vintage}
            onChange={(e) => setFormData({ ...formData, vintage: parseInt(e.target.value) || 2020 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          >
            <option value="">Select Category</option>
            <option value="bordeaux">Bordeaux</option>
            <option value="burgundy">Burgundy</option>
            <option value="champagne">Champagne</option>
            <option value="rhone-valley">Rhône Valley</option>
            <option value="world-wines">World Wines</option>
            <option value="specialty-collections">Specialty Collections</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Alcohol Content (%)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="20"
            value={formData.alcoholContent}
            onChange={(e) => setFormData({ ...formData, alcoholContent: parseFloat(e.target.value) || 13.5 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bottle Size</label>
          <select
            value={formData.bottleSize}
            onChange={(e) => setFormData({ ...formData, bottleSize: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          >
            <option value="375ml">375ml</option>
            <option value="750ml">750ml</option>
            <option value="1.5L">1.5L</option>
            <option value="3L">3L</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tasting Notes</label>
        <textarea
          value={formData.tastingNotes}
          onChange={(e) => setFormData({ ...formData, tastingNotes: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">Featured</label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isNftAvailable"
            checked={formData.isNftAvailable}
            onChange={(e) => setFormData({ ...formData, isNftAvailable: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="isNftAvailable" className="text-sm font-medium text-gray-700">NFT Available</label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {product ? 'Update' : 'Create'} Product
        </Button>
      </div>
    </form>
  )
}