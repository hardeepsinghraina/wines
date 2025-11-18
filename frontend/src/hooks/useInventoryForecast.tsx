'use client'

import { useState, useCallback } from 'react'

interface InventoryForecast {
  wineId: string
  period: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
  predictedDemand: number
  currentStock: number
  recommendedOrderQty: number
  stockoutRisk: number
  seasonalFactor: number
  trendFactor: number
  confidence: number
}

export const useInventoryForecast = () => {
  const [forecast, setForecast] = useState<InventoryForecast | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateForecast = useCallback(async (wineId: string, period: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY') => {
    setLoading(true)
    setError(null)

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API delay

      // Mock forecast data based on wine ID and period
      const mockForecast: InventoryForecast = {
        wineId,
        period,
        predictedDemand: period === 'WEEKLY' ? 8 : period === 'MONTHLY' ? 35 : 120,
        currentStock: 45,
        recommendedOrderQty: period === 'WEEKLY' ? 0 : period === 'MONTHLY' ? 15 : 80,
        stockoutRisk: period === 'WEEKLY' ? 0.1 : period === 'MONTHLY' ? 0.3 : 0.7,
        seasonalFactor: getCurrentSeasonalFactor(),
        trendFactor: 1.15, // 15% growth trend
        confidence: 0.78
      }

      setForecast(mockForecast)
    } catch (err) {
      setError('Failed to generate forecast')
      console.error('Error generating forecast:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const getCurrentSeasonalFactor = () => {
    const month = new Date().getMonth()
    // Wine sales typically higher in winter months (Nov-Feb)
    const seasonalFactors = [1.2, 1.1, 1.0, 0.9, 0.8, 0.8, 0.7, 0.8, 0.9, 1.0, 1.3, 1.4]
    return seasonalFactors[month]
  }

  return {
    forecast,
    loading,
    error,
    generateForecast
  }
}