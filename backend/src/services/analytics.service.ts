import { logger } from '@/utils/logger'
import { monitoringService } from './monitoring.service'

// Analytics event types
interface AnalyticsEvent {
  event: string
  userId?: string
  sessionId?: string
  properties?: Record<string, any>
  timestamp: Date
}

// Conversion funnel stages
enum FunnelStage {
  VISIT = 'visit',
  PRODUCT_VIEW = 'product_view',
  ADD_TO_CART = 'add_to_cart',
  CHECKOUT_START = 'checkout_start',
  PAYMENT_INFO = 'payment_info',
  PURCHASE = 'purchase',
}

// E-commerce events
interface EcommerceEvent {
  event: string
  userId?: string
  value?: number
  currency?: string
  items?: Array<{
    id: string
    name: string
    category: string
    price: number
    quantity: number
  }>
  properties?: Record<string, any>
}

class AnalyticsService {
  private events: AnalyticsEvent[] = []
  private maxStoredEvents = 10000

  // Track page views
  trackPageView(path: string, userId?: string, properties?: Record<string, any>): void {
    this.trackEvent('page_view', userId, {
      path,
      ...properties,
    })
  }

  // Track user actions
  trackEvent(event: string, userId?: string, properties?: Record<string, any>): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      userId: userId || '',
      properties: properties || {},
      timestamp: new Date(),
    }

    this.events.push(analyticsEvent)
    this.trimEvents()

    // Send to monitoring service
    monitoringService.trackBusinessEvent(event, properties, userId)

    // Send to external analytics services
    this.sendToExternalServices(analyticsEvent)

    logger.info('Analytics event tracked', analyticsEvent)
  }

  // E-commerce specific tracking
  trackEcommerceEvent(ecommerceEvent: EcommerceEvent): void {
    const { event, userId, value, currency, items, properties } = ecommerceEvent

    this.trackEvent(event, userId, {
      value,
      currency,
      items,
      ...properties,
    })

    // Track revenue metrics
    if (value && ['purchase', 'refund'].includes(event)) {
      monitoringService.recordMetric('revenue', value, {
        event,
        currency: currency || 'USD',
      }, currency || 'USD')
    }
  }

  // Wine-specific analytics
  trackWineInteraction(action: string, wineId: string, userId?: string, properties?: Record<string, any>): void {
    this.trackEvent(`wine_${action}`, userId, {
      wineId,
      ...properties,
    })
  }

  // Crypto payment analytics
  trackCryptoPayment(currency: string, amount: number, userId?: string, properties?: Record<string, any>): void {
    this.trackEvent('crypto_payment', userId, {
      cryptoCurrency: currency,
      amount,
      ...properties,
    })

    monitoringService.recordMetric('crypto_payment_amount', amount, {
      currency,
    }, currency)
  }

  // User journey tracking
  trackFunnelStage(stage: FunnelStage, userId?: string, properties?: Record<string, any>): void {
    this.trackEvent(`funnel_${stage}`, userId, {
      stage,
      ...properties,
    })
  }

  // Search analytics
  trackSearch(query: string, results: number, userId?: string, properties?: Record<string, any>): void {
    this.trackEvent('search', userId, {
      query,
      results,
      ...properties,
    })
  }

  // Performance analytics
  trackPerformance(metric: string, value: number, properties?: Record<string, any>): void {
    this.trackEvent('performance', undefined, {
      metric,
      value,
      ...properties,
    })

    monitoringService.recordMetric(`frontend_${metric}`, value, properties)
  }

  // Error analytics
  trackError(error: string, userId?: string, properties?: Record<string, any>): void {
    this.trackEvent('error', userId, {
      error,
      ...properties,
    })
  }

  // Get analytics dashboard data
  getDashboardData(timeRange: number = 86400000): Record<string, any> { // 24 hours default
    const cutoff = Date.now() - timeRange
    const recentEvents = this.events.filter(e => e.timestamp.getTime() > cutoff)

    // Calculate key metrics
    const totalEvents = recentEvents.length
    const uniqueUsers = new Set(recentEvents.map(e => e.userId).filter(Boolean)).size
    const pageViews = recentEvents.filter(e => e.event === 'page_view').length

    // E-commerce metrics
    const purchases = recentEvents.filter(e => e.event === 'purchase')
    const totalRevenue = purchases.reduce((sum, event) => {
      return sum + (event.properties?.value || 0)
    }, 0)

    // Conversion funnel
    const funnelData = Object.values(FunnelStage).map(stage => ({
      stage,
      count: recentEvents.filter(e => e.event === `funnel_${stage}`).length,
    }))

    // Top products
    const productViews = recentEvents.filter(e => e.event === 'wine_view')
    const topProducts = this.getTopItems(productViews, 'wineId', 10)

    // Search queries
    const searches = recentEvents.filter(e => e.event === 'search')
    const topSearches = this.getTopItems(searches, 'query', 10)

    // Crypto payments
    const cryptoPayments = recentEvents.filter(e => e.event === 'crypto_payment')
    const cryptoRevenue = cryptoPayments.reduce((sum, event) => {
      return sum + (event.properties?.amount || 0)
    }, 0)

    return {
      overview: {
        totalEvents,
        uniqueUsers,
        pageViews,
        totalRevenue,
        cryptoRevenue,
      },
      funnel: funnelData,
      topProducts,
      topSearches,
      cryptoPayments: {
        count: cryptoPayments.length,
        revenue: cryptoRevenue,
        byCurrency: this.groupBy(cryptoPayments, 'cryptoCurrency'),
      },
    }
  }

  // Get conversion rates
  getConversionRates(timeRange: number = 86400000): Record<string, number> {
    const cutoff = Date.now() - timeRange
    const recentEvents = this.events.filter(e => e.timestamp.getTime() > cutoff)

    const visits = recentEvents.filter(e => e.event === 'funnel_visit').length
    const productViews = recentEvents.filter(e => e.event === 'funnel_product_view').length
    const addToCarts = recentEvents.filter(e => e.event === 'funnel_add_to_cart').length
    const checkouts = recentEvents.filter(e => e.event === 'funnel_checkout_start').length
    const purchases = recentEvents.filter(e => e.event === 'funnel_purchase').length

    return {
      visitToView: visits > 0 ? (productViews / visits) * 100 : 0,
      viewToCart: productViews > 0 ? (addToCarts / productViews) * 100 : 0,
      cartToCheckout: addToCarts > 0 ? (checkouts / addToCarts) * 100 : 0,
      checkoutToPurchase: checkouts > 0 ? (purchases / checkouts) * 100 : 0,
      overallConversion: visits > 0 ? (purchases / visits) * 100 : 0,
    }
  }

  // Get user cohort analysis
  getCohortAnalysis(timeRange: number = 2592000000): Record<string, any> { // 30 days default
    const cutoff = Date.now() - timeRange
    const recentEvents = this.events.filter(e => e.timestamp.getTime() > cutoff && e.userId)

    // Group users by first visit date
    const userFirstVisits = new Map<string, Date>()
    
    recentEvents.forEach(event => {
      if (event.userId && !userFirstVisits.has(event.userId)) {
        userFirstVisits.set(event.userId, event.timestamp)
      }
    })

    // Calculate retention by cohort
    const cohorts = new Map<string, Set<string>>()
    
    userFirstVisits.forEach((firstVisit, userId) => {
      if (firstVisit && userId) {
        const cohortKey = firstVisit.toISOString().split('T')[0] // YYYY-MM-DD
        if (cohortKey) {
          if (!cohorts.has(cohortKey)) {
            cohorts.set(cohortKey, new Set())
          }
          cohorts.get(cohortKey)!.add(userId)
        }
      }
    })

    return Array.from(cohorts.entries()).map(([date, users]) => ({
      date,
      size: users.size,
      users: Array.from(users),
    }))
  }

  // Private helper methods
  private trimEvents(): void {
    if (this.events.length > this.maxStoredEvents) {
      this.events.splice(0, this.events.length - this.maxStoredEvents)
    }
  }

  private getTopItems(events: AnalyticsEvent[], property: string, limit: number): Array<{ item: string; count: number }> {
    const counts = new Map<string, number>()
    
    events.forEach(event => {
      const item = event.properties?.[property]
      if (item) {
        counts.set(item, (counts.get(item) || 0) + 1)
      }
    })

    return Array.from(counts.entries())
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  private groupBy(events: AnalyticsEvent[], property: string): Record<string, number> {
    const groups: Record<string, number> = {}
    
    events.forEach(event => {
      const key = event.properties?.[property] || 'unknown'
      groups[key] = (groups[key] || 0) + 1
    })

    return groups
  }

  // External service integrations
  private async sendToExternalServices(event: AnalyticsEvent): Promise<void> {
    // Google Analytics 4
    if (process.env.GA4_ENABLED === 'true') {
      await this.sendToGA4(event)
    }

    // Mixpanel
    if (process.env.MIXPANEL_ENABLED === 'true') {
      await this.sendToMixpanel(event)
    }

    // Custom analytics endpoint
    if (process.env.CUSTOM_ANALYTICS_ENABLED === 'true') {
      await this.sendToCustomEndpoint(event)
    }
  }

  private async sendToGA4(event: AnalyticsEvent): Promise<void> {
    try {
      // Mock implementation - replace with actual GA4 Measurement Protocol
      logger.debug('Sending event to GA4', event)
    } catch (error) {
      logger.error('Failed to send event to GA4', { error, event })
    }
  }

  private async sendToMixpanel(event: AnalyticsEvent): Promise<void> {
    try {
      // Mock implementation - replace with actual Mixpanel SDK
      logger.debug('Sending event to Mixpanel', event)
    } catch (error) {
      logger.error('Failed to send event to Mixpanel', { error, event })
    }
  }

  private async sendToCustomEndpoint(event: AnalyticsEvent): Promise<void> {
    try {
      // Mock implementation - replace with actual custom analytics endpoint
      logger.debug('Sending event to custom endpoint', event)
    } catch (error) {
      logger.error('Failed to send event to custom endpoint', { error, event })
    }
  }
}

export const analyticsService = new AnalyticsService()
export { FunnelStage }