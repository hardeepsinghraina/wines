'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Download, Printer, Mail } from 'lucide-react';

interface OrderReceiptProps {
  orderId: string;
  orderNumber: string;
  className?: string;
}

interface ReceiptData {
  id: string;
  orderNumber: string;
  receiptNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
  generatedAt: string;
  items: Array<{
    id: string;
    wineId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    wine: {
      name: string;
      producer: string;
      region: string;
      vintage: number;
    };
  }>;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  payments: Array<{
    method: string;
    status: string;
    amount: number;
  }>;
}

export function OrderReceipt({ orderId, orderNumber, className }: OrderReceiptProps) {
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const fetchReceiptData = async () => {
    setLoading(true);
    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl(`/api/orders/${orderId}/receipt`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch receipt data');
      }

      const data = await response.json();
      setReceiptData(data.data);
      setShowReceipt(true);
    } catch (error) {
      console.error('Error fetching receipt:', error);
      alert('Failed to load receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    if (!receiptData) {
      await fetchReceiptData();
      return;
    }

    // Generate HTML receipt
    const receiptHtml = generateReceiptHtml(receiptData);
    
    // Create and download as HTML file
    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptData.receiptNumber}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const printReceipt = () => {
    if (!receiptData) return;

    const receiptHtml = generateReceiptHtml(receiptData);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const emailReceipt = async () => {
    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl(`/api/orders/${orderId}/email-receipt`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to email receipt');
      }

      const result = await response.json();
      alert(result.message || 'Receipt has been sent to your email address.');
    } catch (error) {
      console.error('Error emailing receipt:', error);
      alert(error instanceof Error ? error.message : 'Failed to email receipt. Please try again.');
    }
  };

  const generateReceiptHtml = (receipt: ReceiptData): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${receipt.receiptNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #8B0000; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { color: #8B0000; font-size: 28px; font-weight: bold; margin: 0; }
          .receipt-title { font-size: 24px; margin: 20px 0 10px; }
          .receipt-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .section { margin: 30px 0; }
          .section-title { font-size: 18px; font-weight: bold; color: #8B0000; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
          .two-column { display: flex; justify-content: space-between; }
          .column { width: 48%; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f8f9fa; font-weight: bold; }
          .total-row { font-weight: bold; font-size: 16px; background: #f8f9fa; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="company-name">Luxury Wines</h1>
          <p>Premium Wine Collection</p>
          <h2 class="receipt-title">Receipt</h2>
        </div>

        <div class="receipt-info">
          <div class="two-column">
            <div class="column">
              <p><strong>Receipt Number:</strong> ${receipt.receiptNumber}</p>
              <p><strong>Order Number:</strong> ${receipt.orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(receipt.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="column">
              <p><strong>Receipt Date:</strong> ${new Date(receipt.generatedAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${receipt.status}</p>
              <p><strong>Total Amount:</strong> $${receipt.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Customer Information</h3>
          <p><strong>${receipt.user.firstName} ${receipt.user.lastName}</strong></p>
          <p>${receipt.user.email}</p>
        </div>

        <div class="section">
          <h3 class="section-title">Addresses</h3>
          <div class="two-column">
            <div class="column">
              <h4>Shipping Address</h4>
              <p>${receipt.shippingAddress.firstName} ${receipt.shippingAddress.lastName}</p>
              <p>${receipt.shippingAddress.street}</p>
              <p>${receipt.shippingAddress.city}, ${receipt.shippingAddress.state} ${receipt.shippingAddress.postalCode}</p>
              <p>${receipt.shippingAddress.country}</p>
            </div>
            <div class="column">
              <h4>Billing Address</h4>
              ${receipt.billingAddress ? `
                <p>${receipt.billingAddress.firstName} ${receipt.billingAddress.lastName}</p>
                <p>${receipt.billingAddress.street}</p>
                <p>${receipt.billingAddress.city}, ${receipt.billingAddress.state} ${receipt.billingAddress.postalCode}</p>
                <p>${receipt.billingAddress.country}</p>
              ` : '<p>Same as shipping address</p>'}
            </div>
          </div>
        </div>

        <div class="section">
          <h3 class="section-title">Items Ordered</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${receipt.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.wine.name}</strong><br>
                    <small>${item.wine.producer} • ${item.wine.vintage} • ${item.wine.region}</small>
                  </td>
                  <td>${item.quantity}</td>
                  <td>$${item.unitPrice.toFixed(2)}</td>
                  <td>$${item.totalPrice.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3 class="section-title">Order Summary</h3>
          <table>
            <tbody>
              <tr>
                <td>Subtotal</td>
                <td style="text-align: right;">$${receipt.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Shipping</td>
                <td style="text-align: right;">$${receipt.shippingCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Tax</td>
                <td style="text-align: right;">$${receipt.taxAmount.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>Total</td>
                <td style="text-align: right;">$${receipt.totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h3 class="section-title">Payment Information</h3>
          ${receipt.payments.map(payment => `
            <p><strong>Method:</strong> ${payment.method === 'CRYPTO' ? 'Cryptocurrency' : payment.method}</p>
            <p><strong>Status:</strong> ${payment.status}</p>
            <p><strong>Amount:</strong> $${payment.amount.toFixed(2)}</p>
          `).join('')}
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Questions? Contact us at support@luxurywines.com or +1 (555) 123-4567</p>
          <p>© 2024 Luxury Wines. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className={className}>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={downloadReceipt}
          disabled={loading}
        >
          <Download className="w-4 h-4 mr-1" />
          {loading ? 'Loading...' : 'Download'}
        </Button>
        
        {receiptData && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={printReceipt}
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={emailReceipt}
            >
              <Mail className="w-4 h-4 mr-1" />
              Email
            </Button>
          </>
        )}
      </div>

      {showReceipt && receiptData && (
        <Card className="mt-4 p-6">
          <div className="text-center border-b pb-4 mb-6">
            <h2 className="font-heading text-2xl font-bold text-burgundy">Luxury Wines</h2>
            <p className="text-muted-olive">Premium Wine Collection</p>
            <h3 className="text-xl font-semibold mt-4">Receipt</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-charcoal-black mb-2">Receipt Information</h4>
              <div className="text-sm space-y-1">
                <p><strong>Receipt #:</strong> {receiptData.receiptNumber}</p>
                <p><strong>Order #:</strong> {receiptData.orderNumber}</p>
                <p><strong>Date:</strong> {new Date(receiptData.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-charcoal-black mb-2">Customer</h4>
              <div className="text-sm space-y-1">
                <p><strong>{receiptData.user.firstName} {receiptData.user.lastName}</strong></p>
                <p>{receiptData.user.email}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-charcoal-black mb-3">Items</h4>
            <div className="space-y-2">
              {receiptData.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium">{item.wine.name}</p>
                    <p className="text-sm text-muted-olive">
                      {item.wine.producer} • {item.wine.vintage} • Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${receiptData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${receiptData.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${receiptData.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${receiptData.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}