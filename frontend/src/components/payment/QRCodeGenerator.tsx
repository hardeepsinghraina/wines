'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { generateQRCodeData } from '@/lib/crypto-utils';
import { type WalletCurrency } from '@/lib/crypto-wallets';

interface QRCodeGeneratorProps {
  currency: WalletCurrency;
  address: string;
  amount?: number;
  label?: string;
  message?: string;
  size?: number;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  currency,
  address,
  amount,
  label,
  message,
  size = 200,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    setLoading(true);
    setError('');

    try {
      const qrData = generateQRCodeData({
        currency,
        address,
        amount,
        label,
        message
      });

      // For now, we'll create a simple canvas-based QR code placeholder
      // In a real implementation, you would use a library like 'qrcode'
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = size;
        canvas.height = size;
        
        // Create a simple pattern as placeholder
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        
        ctx.fillStyle = '#000000';
        const cellSize = size / 25;
        
        // Create a simple QR-like pattern
        for (let i = 0; i < 25; i++) {
          for (let j = 0; j < 25; j++) {
            if ((i + j) % 3 === 0 || (i * j) % 7 === 0) {
              ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
          }
        }
        
        // Add corner squares (typical QR code pattern)
        const cornerSize = cellSize * 7;
        
        // Top-left corner
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, cornerSize, cornerSize);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cellSize, cellSize, cornerSize - 2 * cellSize, cornerSize - 2 * cellSize);
        ctx.fillStyle = '#000000';
        ctx.fillRect(2 * cellSize, 2 * cellSize, cornerSize - 4 * cellSize, cornerSize - 4 * cellSize);
        
        // Top-right corner
        ctx.fillStyle = '#000000';
        ctx.fillRect(size - cornerSize, 0, cornerSize, cornerSize);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(size - cornerSize + cellSize, cellSize, cornerSize - 2 * cellSize, cornerSize - 2 * cellSize);
        ctx.fillStyle = '#000000';
        ctx.fillRect(size - cornerSize + 2 * cellSize, 2 * cellSize, cornerSize - 4 * cellSize, cornerSize - 4 * cellSize);
        
        // Bottom-left corner
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, size - cornerSize, cornerSize, cornerSize);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cellSize, size - cornerSize + cellSize, cornerSize - 2 * cellSize, cornerSize - 2 * cellSize);
        ctx.fillStyle = '#000000';
        ctx.fillRect(2 * cellSize, size - cornerSize + 2 * cellSize, cornerSize - 4 * cellSize, cornerSize - 4 * cellSize);
        
        const dataUrl = canvas.toDataURL('image/png');
        setQrDataUrl(dataUrl);
      }
    } catch (err) {
      setError('Failed to generate QR code');
      console.error('QR code generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [currency, address, amount, label, message, size]);

  const downloadQRCode = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `${currency}-payment-qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const copyQRData = async () => {
    const qrData = generateQRCodeData({
      currency,
      address,
      amount,
      label,
      message
    });

    try {
      await navigator.clipboard.writeText(qrData);
    } catch (err) {
      console.error('Failed to copy QR data:', err);
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="text-center">
          <h4 className="font-semibold text-charcoal-black mb-2">
            {currency} Payment QR Code
          </h4>
          
          {loading && (
            <div className="flex flex-col items-center">
              <Loading />
              <p className="text-sm text-muted-olive mt-2">Generating QR code...</p>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          {qrDataUrl && !loading && (
            <div className="space-y-3">
              <div className="inline-block bg-white p-2 rounded-lg border">
                <canvas
                  ref={canvasRef}
                  className="block"
                  style={{ width: size, height: size }}
                />
              </div>
              
              <div className="text-xs text-muted-olive">
                <p>Scan with your {currency} wallet app</p>
                {amount && (
                  <p>Amount: {amount} {currency}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {qrDataUrl && (
          <div className="flex gap-2 justify-center">
            <Button
              onClick={downloadQRCode}
              variant="outline"
              size="sm"
            >
              Download
            </Button>
            <Button
              onClick={copyQRData}
              variant="outline"
              size="sm"
            >
              Copy Data
            </Button>
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
          <div className="space-y-1">
            <div><strong>Address:</strong> {address}</div>
            {amount && <div><strong>Amount:</strong> {amount} {currency}</div>}
            {label && <div><strong>Label:</strong> {label}</div>}
          </div>
        </div>
      </div>
    </Card>
  );
};