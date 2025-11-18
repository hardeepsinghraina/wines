'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface ProductPrice {
  id?: string
  currency: string
  price: number
  isActive: boolean
  discountPercentage?: number
  discountStartDate?: string
  discountEndDate?: string
}

interface ProductPricingManagerProps {
  prices: ProductPrice[]
  onPricesChange: (prices: ProductPrice[]) => void
}

const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
  { code: 'USDT', name: 'Tether', symbol: '₮' },
  { code: 'USDC', name: 'USD Coin', symbol: '$' }
]

export function ProductPricingManager({ prices, onPricesChange }: ProductPricingManagerProps) {
  const [showAddPrice, setShowAddPrice] = useState(false)
  const [newPrice, setNewPrice] = useState<Partial<ProductPrice>>({
    currency: 'USD',
    price: 0,
    isActive: true,
    discountPercentage: 0
  })

  const handleAddPrice = () => {
    if (!newPrice.currency || !newPrice.price) return

    const price: ProductPrice = {
      currency: newPrice.currency,
      price: newPrice.price,
      isActive: newPrice.isActive ?? true,
      discountPercentage: newPrice.discountPercentage || 0,
      discountStartDate: newPrice.discountStartDate,
      discountEndDate: newPrice.discountEndDate
    }

    onPricesChange([...prices, price])
    setNewPrice({
      currency: 'USD',
      price: 0,
      isActive: true,
      discountPercentage: 0
    })
    setShowAddPrice(false)
  }

  const handleUpdatePrice = (index: number, updates: Partial<ProductPrice>) => {
    const newPrices = [...prices]
    newPrices[index] = { ...newPrices[index], ...updates }
    onPricesChange(newPrices)
  }

  const handleRemovePrice = (index: number) => {
    const newPrices = prices.filter((_, i) => i !== index)
    onPricesChange(newPrices)
  }

  const getDiscountedPrice = (price: ProductPrice) => {
    if (!price.discountPercentage || price.discountPercentage <= 0) return price.price
    return price.price * (1 - price.discountPercentage / 100)
  }

  const isDiscountActive = (price: ProductPrice) => {
    if (!price.discountPercentage || price.discountPercentage <= 0) return false
    
    const now = new Date()
    const startDate = price.discountStartDate ? new Date(price.discountStartDate) : null
    const endDate = price.discountEndDate ? new Date(price.discountEndDate) : null
    
    if (startDate && now < startDate) return false
    if (endDate && now > endDate) return false
    
    return true
  }

  const getCurrencySymbol = (currencyCode: string) => {
    return SUPPORTED_CURRENCIES.find(c => c.code === currencyCode)?.symbol || currencyCode
  }

  const getAvailableCurrencies = () => {
    const usedCurrencies = prices.map(p => p.currency)
    return SUPPORTED_CURRENCIES.filter(c => !usedCurrencies.includes(c.code))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Pricing & Discounts</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddPrice(true)}
          disabled={getAvailableCurrencies().length === 0}
        >
          Add Price
        </Button>
      </div>

      {prices.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No prices configured</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddPrice(true)}
            className="mt-2"
          >
            Add First Price
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {prices.map((price, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <select
                    value={price.currency}
                    onChange={(e) => handleUpdatePrice(index, { currency: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value={price.currency}>
                      {getCurrencySymbol(price.currency)} {price.currency}
                    </option>
                    {getAvailableCurrencies().map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Base Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price.price}
                    onChange={(e) => handleUpdatePrice(index, { price: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Discount %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={price.discountPercentage || 0}
                    onChange={(e) => handleUpdatePrice(index, { discountPercentage: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Final Price</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    <span className="font-medium">
                      {getCurrencySymbol(price.currency)}{getDiscountedPrice(price).toFixed(2)}
                    </span>
                    {isDiscountActive(price) && (
                      <span className="ml-2 text-sm text-green-600">(Active Discount)</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`active-${index}`}
                    checked={price.isActive}
                    onChange={(e) => handleUpdatePrice(index, { isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`active-${index}`} className="text-sm text-gray-700">
                    Active
                  </label>
                </div>

                <div>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => handleRemovePrice(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              {/* Discount Date Range */}
              {(price.discountPercentage || 0) > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Discount Start Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={price.discountStartDate || ''}
                        onChange={(e) => handleUpdatePrice(index, { discountStartDate: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Discount End Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={price.discountEndDate || ''}
                        onChange={(e) => handleUpdatePrice(index, { discountEndDate: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add New Price Form */}
      {showAddPrice && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="text-md font-medium text-gray-900 mb-3">Add New Price</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                value={newPrice.currency || ''}
                onChange={(e) => setNewPrice({ ...newPrice, currency: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">Select Currency</option>
                {getAvailableCurrencies().map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newPrice.price || ''}
                onChange={(e) => setNewPrice({ ...newPrice, price: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Discount %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newPrice.discountPercentage || ''}
                onChange={(e) => setNewPrice({ ...newPrice, discountPercentage: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddPrice(false)
                setNewPrice({
                  currency: 'USD',
                  price: 0,
                  isActive: true,
                  discountPercentage: 0
                })
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddPrice}
              disabled={!newPrice.currency || !newPrice.price}
            >
              Add Price
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}