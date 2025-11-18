'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface GiftCardOption {
  id: string;
  amount: number;
  popular?: boolean;
  bonus?: number;
}

interface GiftCardForm {
  amount: number;
  customAmount: string;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  message: string;
  deliveryDate: string;
  design: string;
}

const giftCardOptions: GiftCardOption[] = [
  { id: 'gc-50', amount: 50 },
  { id: 'gc-100', amount: 100, popular: true },
  { id: 'gc-250', amount: 250, bonus: 25 },
  { id: 'gc-500', amount: 500, bonus: 75 },
  { id: 'gc-1000', amount: 1000, bonus: 200 },
  { id: 'gc-custom', amount: 0 }
];

const giftCardDesigns = [
  { id: 'classic', name: 'Classic Elegance', preview: '🍷' },
  { id: 'modern', name: 'Modern Luxury', preview: '✨' },
  { id: 'vintage', name: 'Vintage Collection', preview: '🏛️' },
  { id: 'celebration', name: 'Celebration', preview: '🎉' },
  { id: 'seasonal', name: 'Seasonal', preview: '🎄' }
];

export function GiftCards() {
  const [activeTab, setActiveTab] = useState<'purchase' | 'redeem'>('purchase');
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [redeemCode, setRedeemCode] = useState('');
  const [form, setForm] = useState<GiftCardForm>({
    amount: 100,
    customAmount: '',
    recipientName: '',
    recipientEmail: '',
    senderName: '',
    message: '',
    deliveryDate: '',
    design: 'classic'
  });

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setForm(prev => ({ ...prev, amount }));
  };

  const handleFormChange = (field: keyof GiftCardForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePurchase = () => {
    // Handle gift card purchase
    console.log('Purchasing gift card:', form);
  };

  const handleRedeem = () => {
    // Handle gift card redemption
    console.log('Redeeming gift card:', redeemCode);
  };

  const selectedOption = giftCardOptions.find(option => option.amount === selectedAmount);
  const finalAmount = selectedAmount === 0 ? parseFloat(form.customAmount) || 0 : selectedAmount;
  const bonusAmount = selectedOption?.bonus || 0;
  const totalValue = finalAmount + bonusAmount;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Wine Gift Cards</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          The perfect gift for wine enthusiasts. Give the gift of choice with our luxury wine gift cards.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8 flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('purchase')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'purchase'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Purchase Gift Card
          </button>
          <button
            onClick={() => setActiveTab('redeem')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'redeem'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Redeem Gift Card
          </button>
        </div>
      </div>

      {activeTab === 'purchase' ? (
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Gift Card Configuration */}
            <div>
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Choose Amount</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {giftCardOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAmountSelect(option.amount)}
                      className={`p-4 border-2 rounded-lg text-center transition-colors relative ${
                        selectedAmount === option.amount
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.popular && (
                        <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                      <div className="font-semibold">
                        {option.amount === 0 ? 'Custom' : `$${option.amount}`}
                      </div>
                      {option.bonus && (
                        <div className="text-sm text-green-600">+${option.bonus} bonus</div>
                      )}
                    </button>
                  ))}
                </div>

                {selectedAmount === 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Amount ($25 minimum)
                    </label>
                    <input
                      type="number"
                      min="25"
                      value={form.customAmount}
                      onChange={(e) => handleFormChange('customAmount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter amount"
                    />
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Choose Design</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {giftCardDesigns.map((design) => (
                      <button
                        key={design.id}
                        onClick={() => handleFormChange('design', design.id)}
                        className={`p-3 border-2 rounded-lg text-center transition-colors ${
                          form.design === design.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{design.preview}</div>
                        <div className="text-xs">{design.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient Name
                      </label>
                      <input
                        type="text"
                        value={form.recipientName}
                        onChange={(e) => handleFormChange('recipientName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter recipient name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient Email
                      </label>
                      <input
                        type="email"
                        value={form.recipientEmail}
                        onChange={(e) => handleFormChange('recipientEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter recipient email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={form.senderName}
                      onChange={(e) => handleFormChange('senderName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personal Message (Optional)
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => handleFormChange('message', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add a personal message..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={form.deliveryDate}
                      onChange={(e) => handleFormChange('deliveryDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank to send immediately
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Gift Card Preview & Summary */}
            <div>
              <Card className="p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-6">Gift Card Preview</h2>
                
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg mb-6">
                  <div className="text-center">
                    <div className="text-3xl mb-2">
                      {giftCardDesigns.find(d => d.id === form.design)?.preview}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Wine Gift Card</h3>
                    <div className="text-2xl font-bold">${finalAmount}</div>
                    {bonusAmount > 0 && (
                      <div className="text-sm opacity-90">+ ${bonusAmount} bonus value</div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="text-sm">
                      <div>To: {form.recipientName || 'Recipient Name'}</div>
                      <div>From: {form.senderName || 'Your Name'}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Gift Card Value:</span>
                    <span>${finalAmount}</span>
                  </div>
                  {bonusAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Bonus Value:</span>
                      <span>+${bonusAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-3">
                    <span>Total Value:</span>
                    <span>${totalValue}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>You Pay:</span>
                    <span>${finalAmount}</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePurchase}
                  className="w-full"
                  disabled={!finalAmount || finalAmount < 25}
                >
                  Purchase Gift Card
                </Button>
              </Card>

              <Card className="p-6 bg-blue-50">
                <h3 className="font-semibold mb-3">Gift Card Benefits</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• No expiration date</li>
                  <li>• Can be used for any purchase</li>
                  <li>• Instant digital delivery</li>
                  <li>• Transferable to others</li>
                  <li>• Remaining balance carries over</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Redeem Gift Card</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gift Card Code
              </label>
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center font-mono"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                maxLength={19}
              />
            </div>

            <Button 
              onClick={handleRedeem}
              className="w-full mb-4"
              disabled={!redeemCode || redeemCode.length < 16}
            >
              Check Balance & Redeem
            </Button>

            <div className="text-center text-sm text-gray-500">
              <p>Enter your gift card code to check balance and apply to your account.</p>
            </div>
          </Card>

          <Card className="p-6 mt-6 bg-gray-50">
            <h3 className="font-semibold mb-3">Need Help?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Gift card codes are case-insensitive</p>
              <p>• Codes are 16 characters long (XXXX-XXXX-XXXX-XXXX)</p>
              <p>• Check your email for the gift card details</p>
              <p>• Contact support if you're having issues</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}