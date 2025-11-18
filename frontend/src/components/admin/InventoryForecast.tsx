'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Loading } from '../ui/Loading'
import { useInventoryForecast } from '../../hooks/useInventoryForecast'

interface InventoryForecastProps {
  loading: boolean
}

export const InventoryForecast: React.FC<InventoryForecastProps> = ({
  loading: parentLoading
}) => {
  const [selectedWineId, setSelectedWineId] = useState<string>('')
  const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'QUARTERLY'>('MONTHLY')
  const [wines, setWines] = useState<Array<{ id: string; name: string; producer: string }>>([])

  const {
    forecast,
    loading: forecastLoading,
    error,
    generateForecast
  } = useInventoryForecast()

  // Mock wine data - in real app, this would come from an API
  useEffect(() => {
    // Simulate fetching wines
    setWines([
      { id: '1', name: 'Château Margaux 2015', producer: 'Château Margaux' },
      { id: '2', name: 'Dom Pérignon 2012', producer: 'Dom Pérignon' },
      { id: '3', name: 'Opus One 2018', producer: 'Opus One' },
      { id: '4', name: 'Screaming Eagle 2019', producer: 'Screaming Eagle' },
      { id: '5', name: 'Petrus 2016', producer: 'Petrus' }
    ])
  }, [])

  const handleGenerateForecast = () => {
    if (selectedWineId) {
      generateForecast(selectedWineId, period)
    }
  }

  const getRiskLevel = (risk: number) => {
    if (risk >= 0.8) return { level: 'High', color: 'text-red-600 bg-red-100' }
    if (risk >= 0.5) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-100' }
    if (risk >= 0.2) return { level: 'Low', color: 'text-blue-600 bg-blue-100' }
    return { level: 'Very Low', color: 'text-green-600 bg-green-100' }
  }

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return { level: 'High', color: 'text-green-600' }
    if (confidence >= 0.6) return { level: 'Medium', color: 'text-yellow-600' }
    return { level: 'Low', color: 'text-red-600' }
  }

  if (parentLoading) {
    return <Loading />
  }

  return (
    <div className="space-y-6">
      {/* Forecast Generator */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Inventory Forecast</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Product
            </label>
            <select
              value={selectedWineId}
              onChange={(e) => setSelectedWineId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a product...</option>
              {wines.map((wine) => (
                <option key={wine.id} value={wine.id}>
                  {wine.name} - {wine.producer}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forecast Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'WEEKLY' | 'MONTHLY' | 'QUARTERLY')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleGenerateForecast}
              disabled={!selectedWineId || forecastLoading}
              className="w-full"
            >
              {forecastLoading ? 'Generating...' : 'Generate Forecast'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Forecast Results */}
      {forecast && (
        <div className="space-y-6">
          {/* Forecast Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Forecast Results - {period.toLowerCase()} Period
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Confidence:</span>
                <span className={`text-sm font-medium ${getConfidenceLevel(forecast.confidence).color}`}>
                  {getConfidenceLevel(forecast.confidence).level} ({(forecast.confidence * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{forecast.predictedDemand}</div>
                <div className="text-sm text-blue-700">Predicted Demand</div>
                <div className="text-xs text-blue-500 mt-1">Units expected to sell</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{forecast.currentStock}</div>
                <div className="text-sm text-green-700">Current Stock</div>
                <div className="text-xs text-green-500 mt-1">Units available</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{forecast.recommendedOrderQty}</div>
                <div className="text-sm text-purple-700">Recommended Order</div>
                <div className="text-xs text-purple-500 mt-1">Units to order</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getRiskLevel(forecast.stockoutRisk).color.split(' ')[0]}`}>
                  {(forecast.stockoutRisk * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-700">Stockout Risk</div>
                <div className={`text-xs mt-1 ${getRiskLevel(forecast.stockoutRisk).color}`}>
                  {getRiskLevel(forecast.stockoutRisk).level} Risk
                </div>
              </div>
            </div>
          </Card>

          {/* Forecast Factors */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Forecast Factors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Seasonal Factor</span>
                  <span className="text-sm text-gray-900">{forecast.seasonalFactor.toFixed(2)}x</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, forecast.seasonalFactor * 50)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {forecast.seasonalFactor > 1 ? 'Above average seasonal demand' : 'Below average seasonal demand'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Trend Factor</span>
                  <span className="text-sm text-gray-900">{forecast.trendFactor.toFixed(2)}x</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, forecast.trendFactor * 50)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {forecast.trendFactor > 1 ? 'Increasing demand trend' : 'Decreasing demand trend'}
                </p>
              </div>
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              {forecast.stockoutRisk > 0.7 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <div className="text-red-500">🚨</div>
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      High stockout risk detected
                    </p>
                    <p className="text-xs text-red-600">
                      Consider expedited ordering or increasing safety stock levels
                    </p>
                  </div>
                </div>
              )}

              {forecast.recommendedOrderQty > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-500">📦</div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Recommended to order {forecast.recommendedOrderQty} units
                    </p>
                    <p className="text-xs text-blue-600">
                      This will maintain optimal stock levels for the {period.toLowerCase()} period
                    </p>
                  </div>
                </div>
              )}

              {forecast.seasonalFactor > 1.2 && (
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="text-yellow-500">🌟</div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Peak seasonal demand expected
                    </p>
                    <p className="text-xs text-yellow-600">
                      Consider increasing marketing efforts and ensuring adequate stock
                    </p>
                  </div>
                </div>
              )}

              {forecast.confidence < 0.6 && (
                <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                  <div className="text-orange-500">⚠️</div>
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      Low forecast confidence
                    </p>
                    <p className="text-xs text-orange-600">
                      Limited historical data available. Monitor closely and adjust as needed
                    </p>
                  </div>
                </div>
              )}

              {forecast.stockoutRisk < 0.2 && forecast.currentStock > forecast.predictedDemand * 2 && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="text-green-500">✅</div>
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Excellent stock position
                    </p>
                    <p className="text-xs text-green-600">
                      Current stock levels are well-positioned to meet demand
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Forecast Methodology */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Forecast Methodology</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Data Sources:</strong> Historical sales data, seasonal patterns, and trend analysis
              </p>
              <p>
                <strong>Algorithm:</strong> Time series analysis with seasonal and trend adjustments
              </p>
              <p>
                <strong>Factors Considered:</strong> Seasonal variations, sales trends, and historical demand patterns
              </p>
              <p>
                <strong>Confidence Level:</strong> Based on data quality, historical accuracy, and pattern consistency
              </p>
            </div>
          </Card>
        </div>
      )}

      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2">
            <div className="text-red-500">❌</div>
            <div>
              <p className="text-sm font-medium text-red-800">Forecast Generation Failed</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {!forecast && !error && !forecastLoading && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-4">🔮</div>
            <h3 className="text-lg font-medium mb-2">Generate Your First Forecast</h3>
            <p>Select a product and period above to generate demand forecasts and inventory recommendations.</p>
          </div>
        </Card>
      )}
    </div>
  )
}