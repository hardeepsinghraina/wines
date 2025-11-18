import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

interface DashboardStats {
  totalProducts: number
  activeUsers: number
  ordersToday: number
  revenue: number
  cryptoRevenue: number
  conversionRate: number
  avgOrderValue: number
  customerSatisfaction: number
  systemUptime: number
  responseTime: number
}

interface RecentActivity {
  id: string
  type: 'order' | 'user' | 'product' | 'payment'
  message: string
  timestamp: Date
  status: 'success' | 'warning' | 'error'
}

interface Alert {
  id: string
  type: 'inventory' | 'system' | 'payment' | 'security'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
}

interface SalesData {
  date: string
  revenue: number
  orders: number
  cryptoRevenue: number
  conversionRate: number
}

interface UserActivityData {
  activeUsers: number
  newUsers: number
  returningUsers: number
  sessionDuration: number
  bounceRate: number
  topPages: Array<{ page: string; views: number }>
  usersByCountry: Array<{ country: string; users: number }>
}

interface InventoryAlert {
  id: string
  productId: string
  productName: string
  currentStock: number
  minimumStock: number
  status: 'low' | 'out_of_stock' | 'overstocked'
  lastUpdated: Date
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  uptime: number
  responseTime: number
  errorRate: number
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
  services: Array<{
    name: string
    status: 'online' | 'offline' | 'degraded'
    responseTime: number
  }>
}

interface RevenueData {
  totalRevenue: number
  cryptoRevenue: number
  fiatRevenue: number
  revenueByMonth: Array<{
    month: string
    total: number
    crypto: number
    fiat: number
  }>
  revenueByProduct: Array<{
    productId: string
    productName: string
    revenue: number
    orders: number
  }>
  paymentMethods: Array<{
    method: string
    revenue: number
    percentage: number
  }>
}

interface CustomerBehavior {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  customerLifetimeValue: number
  averageOrderValue: number
  purchaseFrequency: number
  topProducts: Array<{
    productId: string
    productName: string
    purchases: number
    revenue: number
  }>
  customerSegments: Array<{
    segment: string
    count: number
    revenue: number
  }>
}

interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  errorRate: number
  throughput: number
  availability: number
  cacheHitRate: number
  databasePerformance: {
    queryTime: number
    connectionPool: number
    slowQueries: number
  }
  frontendMetrics: {
    firstContentfulPaint: number
    largestContentfulPaint: number
    cumulativeLayoutShift: number
  }
}

interface RealTimeAnalytics {
  currentVisitors: number
  pageViews: number
  uniqueVisitors: number
  bounceRate: number
  averageSessionDuration: number
  topPages: Array<{
    page: string
    views: number
    uniqueViews: number
  }>
  trafficSources: Array<{
    source: string
    visitors: number
    percentage: number
  }>
  conversions: {
    rate: number
    total: number
    value: number
  }
}

class AdminPanelApiClient {
  private baseURL: string
  private accessToken: string | null = null

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/admin`
    
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('admin_access_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.data || data
  }

  // Dashboard Overview APIs
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats')
  }

  async getRecentActivity(): Promise<RecentActivity[]> {
    return this.request<RecentActivity[]>('/dashboard/activity')
  }

  async getAlerts(): Promise<Alert[]> {
    return this.request<Alert[]>('/dashboard/alerts')
  }

  // Sales Performance APIs
  async getSalesData(timeRange: string = '30d'): Promise<SalesData[]> {
    return this.request<SalesData[]>(`/sales/performance?timeRange=${timeRange}`)
  }

  async getSalesChartData(timeRange: string = '30d'): Promise<{
    revenue: SalesData[]
    orders: SalesData[]
    conversion: SalesData[]
  }> {
    return this.request(`/sales/charts?timeRange=${timeRange}`)
  }

  // User Activity APIs
  async getUserActivityData(timeRange: string = '24h'): Promise<UserActivityData> {
    return this.request<UserActivityData>(`/users/activity?timeRange=${timeRange}`)
  }

  async getUserEngagementMetrics(): Promise<{
    dailyActiveUsers: number
    weeklyActiveUsers: number
    monthlyActiveUsers: number
    sessionDuration: number
    pagesPerSession: number
  }> {
    return this.request('/users/engagement')
  }

  // Inventory APIs
  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    return this.request<InventoryAlert[]>('/inventory/alerts')
  }

  async getStockLevels(): Promise<Array<{
    productId: string
    productName: string
    currentStock: number
    reservedStock: number
    availableStock: number
    reorderPoint: number
    status: 'in_stock' | 'low_stock' | 'out_of_stock'
  }>> {
    return this.request('/inventory/levels')
  }

  // System Health APIs
  async getSystemHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>('/system/health')
  }

  async getSystemMetrics(): Promise<{
    cpu: number
    memory: number
    disk: number
    network: number
    uptime: number
  }> {
    return this.request('/system/metrics')
  }

  // Revenue Tracking APIs
  async getRevenueData(timeRange: string = '30d'): Promise<RevenueData> {
    return this.request<RevenueData>(`/revenue/data?timeRange=${timeRange}`)
  }

  async getFinancialReports(type: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<{
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    revenueGrowth: number
    profitMargin: number
  }> {
    return this.request(`/revenue/reports?type=${type}`)
  }

  // Customer Behavior APIs
  async getCustomerBehavior(timeRange: string = '30d'): Promise<CustomerBehavior> {
    return this.request<CustomerBehavior>(`/customers/behavior?timeRange=${timeRange}`)
  }

  async getCustomerSegmentation(): Promise<Array<{
    segment: string
    count: number
    revenue: number
    averageOrderValue: number
    purchaseFrequency: number
  }>> {
    return this.request('/customers/segmentation')
  }

  // Performance Metrics APIs
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return this.request<PerformanceMetrics>('/performance/metrics')
  }

  async getApplicationHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Array<{
      name: string
      status: 'pass' | 'fail' | 'warn'
      responseTime: number
      message?: string
    }>
  }> {
    return this.request('/performance/health')
  }

  // Real-time Analytics APIs
  async getRealTimeAnalytics(): Promise<RealTimeAnalytics> {
    return this.request<RealTimeAnalytics>('/analytics/realtime')
  }

  async getAnalyticsReports(timeRange: string = '7d'): Promise<{
    pageViews: number
    uniqueVisitors: number
    bounceRate: number
    conversionRate: number
    averageSessionDuration: number
    topPages: Array<{ page: string; views: number }>
    topReferrers: Array<{ referrer: string; visitors: number }>
  }> {
    return this.request(`/analytics/reports?timeRange=${timeRange}`)
  }

  // Notification APIs
  async getNotifications(): Promise<Array<{
    id: string
    type: 'info' | 'warning' | 'error' | 'success'
    title: string
    message: string
    timestamp: Date
    read: boolean
  }>> {
    return this.request('/notifications')
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    })
  }

  // Export APIs
  async exportData(type: 'sales' | 'users' | 'products' | 'orders', format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/export/${type}?format=${format}`, {
      headers: {
        ...(this.accessToken && { Authorization: `Bearer ${this.accessToken}` }),
      },
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Export failed')
    }

    return response.blob()
  }
}

export const adminPanelApi = new AdminPanelApiClient()
export type {
  DashboardStats,
  RecentActivity,
  Alert,
  SalesData,
  UserActivityData,
  InventoryAlert,
  SystemHealth,
  RevenueData,
  CustomerBehavior,
  PerformanceMetrics,
  RealTimeAnalytics
}