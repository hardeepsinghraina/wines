'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { orderApi } from '@/lib/api';
import type { Order } from '../../../../types/order';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { OrderReceipt } from '@/components/order/OrderReceipt';
import { OrderTrackingDisplay } from '@/components/order/OrderTrackingDisplay';
import { OrderActions } from '@/components/order/OrderActions';



export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.orderId as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchOrder();
  }, [orderId, isAuthenticated, router]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use centralized API client
      const response: any = await orderApi.getById(orderId);
      
      // Handle different response formats
      const orderData: Order = response.data || response;
      setOrder(orderData);
    } catch (err: any) {
      // Enhanced error handling for specific status codes
      if (err.response?.status === 404) {
        setError('Order not found. The order you\'re looking for doesn\'t exist or may have been deleted.');
      } else if (err.response?.status === 403) {
        setError('Permission denied. You don\'t have permission to view this order.');
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Failed to load order details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdated = async (updatedOrder: Order) => {
    try {
      setOrder(updatedOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    const is404 = error.includes('not found') || error.includes('doesn\'t exist');
    const is403 = error.includes('Permission denied') || error.includes('permission');
    const isNetwork = error.includes('connect') || error.includes('internet');

    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              {is404 ? 'Order Not Found' : is403 ? 'Access Denied' : 'Error Loading Order'}
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isNetwork && (
                <Button onClick={fetchOrder} variant="primary">
                  Retry
                </Button>
              )}
              <Button onClick={() => router.push('/account/orders')} variant={isNetwork ? 'secondary' : 'primary'}>
                View All Orders
              </Button>
              {!is404 && !is403 && (
                <Button onClick={() => router.back()} variant="ghost">
                  Go Back
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-600 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => router.push('/account/orders')}>
              View All Orders
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          ← Back to Orders
        </Button>
        <h1 className="text-3xl font-bold text-charcoal-black">
          Order #{order.orderNumber}
        </h1>
        <p className="text-muted-olive mt-2">
          Placed on {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <OrderReceipt 
            orderId={order.id} 
            orderNumber={order.orderNumber}
          />
          <OrderTrackingDisplay orderId={order.id} />
        </div>

        {/* Order Actions Sidebar */}
        <div className="space-y-6">
          <OrderActions 
            order={order} 
            onOrderUpdated={handleOrderUpdated}
          />
        </div>
      </div>
    </div>
  );
}