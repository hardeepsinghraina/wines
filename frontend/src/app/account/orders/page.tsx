'use client'

// Disable SSR for this page to avoid prerendering issues
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import Link from 'next/link'
import { Package, Eye, Download, RefreshCw } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  date: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  currency: string
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    image?: string
  }>
  shippingAddress: {
    name: string
    address: string
    city: string
    country: string
  }
  trackingNumber?: string
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const ordersPerPage = 10

  useEffect(() => {
    fetchOrders(1)
  }, [filter])

  const handlePageChange = (page: number) => {
    fetchOrders(page)
  }

  const fetchOrders = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ordersPerPage.toString(),
        ...(filter !== 'all' && { status: filter })
      })
      
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl(`/api/orders?${params}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      
      const data = await response.json()
      setOrders(data.data?.orders || [])
      setTotalPages(data.data?.totalPages || 1)
      setTotalOrders(data.data?.total || 0)
      setCurrentPage(page)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      // Keep empty array on error
      setOrders([])
      setTotalPages(1)
      setTotalOrders(0)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  )

  if (!user) {
    return <Loading />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-charcoal-black mb-2">Order History</h1>
        <p className="text-muted-olive">Track and manage your wine orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'pending', label: 'Pending' },
              { key: 'shipped', label: 'Shipped' },
              { key: 'delivered', label: 'Delivered' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-burgundy text-burgundy'
                    : 'border-transparent text-muted-olive hover:text-charcoal-black hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filteredOrders.length === 0 ? (
        <Card className="text-center py-16">
          <Package className="w-16 h-16 text-muted-olive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-charcoal-black mb-2">No Orders Found</h2>
          <p className="text-muted-olive mb-6">
            {filter === 'all' 
              ? "You haven't placed any orders yet." 
              : `No ${filter} orders found.`}
          </p>
          <Link href="/products">
            <Button>Start Shopping</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-charcoal-black">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-muted-olive">
                    Placed on {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-lg font-bold text-charcoal-black mt-1">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-charcoal-black mb-2">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-olive">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-medium">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-charcoal-black mb-2">Shipping Address</h4>
                    <div className="text-sm text-muted-olive">
                      <p>{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                    </div>
                    {order.trackingNumber && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-olive">Tracking: {order.trackingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-4 pt-4 border-t">
                  <Link href={`/account/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  {order.status === 'shipped' && (
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Track Package
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Invoice
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(
                      totalPages - 4,
                      currentPage - 2
                    )) + i;
                    
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm rounded-md transition-colors ${
                          pageNum === currentPage
                            ? 'bg-burgundy text-white'
                            : 'text-charcoal-black hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          
          {/* Results info */}
          {totalOrders > 0 && (
            <div className="text-center mt-4 text-sm text-muted-olive">
              Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} orders
            </div>
          )}
        </div>
      )}
    </div>
  )
}