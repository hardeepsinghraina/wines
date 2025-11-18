'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { CheckCircle, Circle, Package, Truck, MapPin, Clock } from 'lucide-react';

interface TrackingEvent {
  timestamp: Date;
  status: string;
  location?: string;
  description: string;
}

interface OrderTrackingTimelineProps {
  orderId: string;
  orderStatus: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  className?: string;
}

export function OrderTrackingTimeline({ 
  orderId, 
  orderStatus, 
  trackingNumber, 
  estimatedDelivery,
  className 
}: OrderTrackingTimelineProps) {
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trackingNumber) {
      fetchTrackingEvents();
    }
  }, [trackingNumber]);

  const fetchTrackingEvents = async () => {
    if (!trackingNumber) return;
    
    setLoading(true);
    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl(`/api/orders/${orderId}/tracking`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrackingEvents(data.data?.trackingEvents || []);
      }
    } catch (error) {
      console.error('Error fetching tracking events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'PENDING', label: 'Order Placed', icon: Circle },
      { key: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle },
      { key: 'PROCESSING', label: 'Processing', icon: Package },
      { key: 'SHIPPED', label: 'Shipped', icon: Truck },
      { key: 'DELIVERED', label: 'Delivered', icon: MapPin }
    ];

    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(orderStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const steps = getStatusSteps();

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="font-heading text-lg font-semibold text-charcoal-black mb-4">
        Order Progress
      </h3>

      {/* Status Timeline */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-100 text-green-600' 
                    : step.current
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  step.completed || step.current ? 'text-charcoal-black' : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
                {step.current && (
                  <p className="text-xs text-muted-olive mt-1">
                    Current status
                  </p>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-px h-8 ml-4 ${
                  step.completed ? 'bg-green-200' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Tracking Number */}
      {trackingNumber && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-black">Tracking Number</p>
              <p className="text-sm text-muted-olive font-mono">{trackingNumber}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(trackingNumber)}
              className="text-xs text-burgundy hover:text-burgundy-dark"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Estimated Delivery */}
      {estimatedDelivery && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">Estimated Delivery</p>
              <p className="text-sm text-blue-700">{estimatedDelivery}</p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Tracking Events */}
      {trackingEvents.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-charcoal-black mb-3">Tracking Details</h4>
          <div className="space-y-3">
            {trackingEvents.map((event, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal-black">{event.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-muted-olive">
                      {new Date(event.timestamp).toLocaleDateString()} at{' '}
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                    {event.location && (
                      <p className="text-xs text-muted-olive">• {event.location}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-olive">Loading tracking information...</p>
        </div>
      )}
    </Card>
  );
}