'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { X, Edit, AlertTriangle } from 'lucide-react';

import type { Order } from '../../types/order';
import { OrderStatus } from '../../types/order';

interface OrderActionsProps {
  order: Order;
  onOrderUpdated: (updatedOrder: Order) => void;
}

export function OrderActions({ order, onOrderUpdated }: OrderActionsProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [modifyNotes, setModifyNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const canCancel = [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status);
  const canModify = order.status === OrderStatus.PENDING;

  const handleCancelOrder = async () => {
    setLoading(true);
    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl(`/api/orders/${order.id}/cancel`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ reason: cancelReason })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      const data = await response.json();
      onOrderUpdated(data.data);
      setShowCancelModal(false);
      setCancelReason('');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModifyOrder = async () => {
    setLoading(true);
    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl(`/api/orders/${order.id}/modify`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ notes: modifyNotes })
      });

      if (!response.ok) {
        throw new Error('Failed to modify order');
      }

      const data = await response.json();
      onOrderUpdated(data.data);
      setShowModifyModal(false);
      setModifyNotes('');
    } catch (error) {
      console.error('Error modifying order:', error);
      alert('Failed to modify order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!canCancel && !canModify) {
    return null;
  }

  return (
    <>
      <div className="flex space-x-3">
        {canModify && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowModifyModal(true)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Modify Order
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCancelModal(true)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel Order
          </Button>
        )}
      </div>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-md">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Are you sure you want to cancel this order?</h4>
              <p className="text-sm text-red-700 mt-1">
                This action cannot be undone. If payment has been processed, a refund will be initiated.
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-charcoal-black mb-2">Order Summary</h4>
            <div className="text-sm text-muted-olive space-y-1">
              <p><strong>Order:</strong> #{order.orderNumber}</p>
              <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
              <p><strong>Items:</strong> {order.items.length} item(s)</p>
            </div>
          </div>

          <div>
            <label htmlFor="cancelReason" className="block text-sm font-medium text-charcoal-black mb-2">
              Reason for cancellation (optional)
            </label>
            <textarea
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
              placeholder="Please let us know why you're cancelling this order..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              disabled={loading}
            >
              Keep Order
            </Button>
            <Button
              onClick={handleCancelOrder}
              disabled={loading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {loading ? 'Cancelling...' : 'Cancel Order'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modify Order Modal */}
      <Modal
        isOpen={showModifyModal}
        onClose={() => setShowModifyModal(false)}
        title="Modify Order"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="font-medium text-blue-800">Limited Modifications Available</h4>
            <p className="text-sm text-blue-700 mt-1">
              You can only modify orders that haven't been confirmed yet. For significant changes, 
              please contact customer service.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-charcoal-black mb-2">Order Summary</h4>
            <div className="text-sm text-muted-olive space-y-1">
              <p><strong>Order:</strong> #{order.orderNumber}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <label htmlFor="modifyNotes" className="block text-sm font-medium text-charcoal-black mb-2">
              Special instructions or notes
            </label>
            <textarea
              id="modifyNotes"
              value={modifyNotes}
              onChange={(e) => setModifyNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
              placeholder="Add any special instructions for your order..."
            />
          </div>

          <div className="text-sm text-muted-olive">
            <p>
              <strong>Note:</strong> For address changes, quantity modifications, or item changes, 
              please contact our customer service team at support@luxurywines.com or +1 (555) 123-4567.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowModifyModal(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleModifyOrder}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Order'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}