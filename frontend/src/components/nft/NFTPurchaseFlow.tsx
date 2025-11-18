'use client';

import React, { useState, useEffect } from 'react';
import { WineNFT, NFTPurchaseRequest, BlockchainTransaction } from '../../types/nft';
import { Button } from '../ui/Button';

import { Modal } from '../ui/Modal';
import { Loading } from '../ui/Loading';
import { nftApi } from '../../lib/nft-api';

interface NFTPurchaseFlowProps {
  nft: WineNFT;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (transaction: BlockchainTransaction) => void;
}

export const NFTPurchaseFlow: React.FC<NFTPurchaseFlowProps> = ({
  nft,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<'wallet' | 'payment' | 'processing' | 'success' | 'error'>('wallet');
  const [walletAddress, setWalletAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'fiat'>('crypto');
  const [currency, setCurrency] = useState('ETH');
  const [amount, setAmount] = useState(0);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<BlockchainTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transactionId) {
      const pollTransaction = async () => {
        try {
          const tx = await nftApi.getTransactionStatus(transactionId);
          setTransaction(tx);
          
          if (tx.status === 'confirmed') {
            setStep('success');
            onSuccess?.(tx);
          } else if (tx.status === 'failed') {
            setStep('error');
            setError('Transaction failed on blockchain');
          }
        } catch (err) {
          console.error('Error polling transaction:', err);
        }
      };

      const interval = setInterval(pollTransaction, 5000);
      return () => clearInterval(interval);
    }
  }, [transactionId, onSuccess]);

  const handleConnectWallet = async () => {
    try {
      // In a real implementation, this would connect to MetaMask or other wallets
      // For now, we'll simulate wallet connection
      const mockAddress = '0x742d35Cc6634C0532925a3b8D4C9db96590b5b8c';
      setWalletAddress(mockAddress);
      setStep('payment');
    } catch (err) {
      setError('Failed to connect wallet');
      setStep('error');
    }
  };

  const handlePurchase = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setStep('processing');

    try {
      const purchaseRequest: NFTPurchaseRequest = {
        wineId: nft.wineId,
        collectionId: nft.id, // This should be collection ID, but using NFT ID for demo
        buyerAddress: walletAddress,
        paymentMethod,
        currency,
        amount
      };

      const result = await nftApi.purchaseNFT(purchaseRequest);
      setTransactionId(result.transactionId);

      if (result.paymentUrl && paymentMethod === 'fiat') {
        window.open(result.paymentUrl, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase NFT');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('wallet');
    setWalletAddress('');
    setTransactionId(null);
    setTransaction(null);
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetFlow();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Purchase Wine NFT">
      <div className="space-y-6">
        {/* NFT Preview */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <img
            src={nft.metadata.image}
            alt={nft.metadata.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-charcoal-black">{nft.metadata.name}</h3>
            <p className="text-sm text-gray-600">Token #{nft.tokenId}</p>
          </div>
        </div>

        {/* Step Content */}
        {step === 'wallet' && (
          <WalletConnectionStep
            onConnect={handleConnectWallet}
            loading={loading}
          />
        )}

        {step === 'payment' && (
          <PaymentStep
            walletAddress={walletAddress}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            currency={currency}
            setCurrency={setCurrency}
            amount={amount}
            setAmount={setAmount}
            onPurchase={handlePurchase}
            loading={loading}
          />
        )}

        {step === 'processing' && (
          <ProcessingStep
            transaction={transaction}
            transactionId={transactionId}
          />
        )}

        {step === 'success' && transaction && (
          <SuccessStep
            transaction={transaction}
            nft={nft}
            onClose={handleClose}
          />
        )}

        {step === 'error' && (
          <ErrorStep
            error={error}
            onRetry={() => setStep('wallet')}
            onClose={handleClose}
          />
        )}
      </div>
    </Modal>
  );
};

const WalletConnectionStep: React.FC<{
  onConnect: () => void;
  loading: boolean;
}> = ({ onConnect, loading }) => (
  <div className="text-center space-y-4">
    <div className="text-gray-500 mb-4">
      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
    <p className="text-gray-600">Connect your crypto wallet to purchase this Wine NFT</p>
    <Button onClick={onConnect} disabled={loading} className="w-full">
      {loading ? <Loading size="sm" /> : 'Connect Wallet'}
    </Button>
  </div>
);

const PaymentStep: React.FC<{
  walletAddress: string;
  paymentMethod: 'crypto' | 'fiat';
  setPaymentMethod: (method: 'crypto' | 'fiat') => void;
  currency: string;
  setCurrency: (currency: string) => void;
  amount: number;
  setAmount: (amount: number) => void;
  onPurchase: () => void;
  loading: boolean;
}> = ({
  walletAddress,
  paymentMethod,
  setPaymentMethod,
  currency,
  setCurrency,
  amount,
  setAmount,
  onPurchase,
  loading
}) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Connected Wallet
      </label>
      <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm">
        {walletAddress}
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Payment Method
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setPaymentMethod('crypto')}
          className={`p-3 rounded-lg border text-sm font-medium ${
            paymentMethod === 'crypto'
              ? 'border-champagne-gold bg-champagne-gold/10 text-champagne-gold'
              : 'border-gray-300 text-gray-700'
          }`}
        >
          Cryptocurrency
        </button>
        <button
          onClick={() => setPaymentMethod('fiat')}
          className={`p-3 rounded-lg border text-sm font-medium ${
            paymentMethod === 'fiat'
              ? 'border-champagne-gold bg-champagne-gold/10 text-champagne-gold'
              : 'border-gray-300 text-gray-700'
          }`}
        >
          Fiat Currency
        </button>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Currency
      </label>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-gold focus:border-transparent"
      >
        {paymentMethod === 'crypto' ? (
          <>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="USDC">USD Coin (USDC)</option>
          </>
        ) : (
          <>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
          </>
        )}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Amount
      </label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(parseFloat(e.target.value))}
        placeholder="Enter amount"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-champagne-gold focus:border-transparent"
      />
    </div>

    <Button onClick={onPurchase} disabled={loading || amount <= 0} className="w-full">
      {loading ? <Loading size="sm" /> : `Purchase for ${amount} ${currency}`}
    </Button>
  </div>
);

const ProcessingStep: React.FC<{
  transaction: BlockchainTransaction | null;
  transactionId: string | null;
}> = ({ transaction, transactionId }) => (
  <div className="text-center space-y-4">
    <Loading size="lg" />
    <h3 className="text-lg font-semibold">Processing Transaction</h3>
    <p className="text-gray-600">
      Your NFT purchase is being processed on the blockchain. This may take a few minutes.
    </p>
    {transactionId && (
      <div className="text-sm text-gray-500">
        Transaction ID: {transactionId}
      </div>
    )}
    {transaction?.transactionHash && (
      <div className="text-sm text-gray-500">
        Blockchain TX: {transaction.transactionHash.slice(0, 10)}...
      </div>
    )}
  </div>
);

const SuccessStep: React.FC<{
  transaction: BlockchainTransaction;
  nft: WineNFT;
  onClose: () => void;
}> = ({ transaction, nft, onClose }) => (
  <div className="text-center space-y-4">
    <div className="text-green-500 mb-4">
      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-green-600">Purchase Successful!</h3>
    <p className="text-gray-600">
      Congratulations! You now own the {nft.metadata.name} Wine NFT.
    </p>
    <div className="bg-gray-50 p-4 rounded-lg text-sm">
      <div className="flex justify-between mb-2">
        <span>Transaction Hash:</span>
        <span className="font-mono">{transaction.transactionHash.slice(0, 10)}...</span>
      </div>
      <div className="flex justify-between">
        <span>Confirmations:</span>
        <span>{transaction.confirmations}</span>
      </div>
    </div>
    <Button onClick={onClose} className="w-full">
      View My NFTs
    </Button>
  </div>
);

const ErrorStep: React.FC<{
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}> = ({ error, onRetry, onClose }) => (
  <div className="text-center space-y-4">
    <div className="text-red-500 mb-4">
      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-red-600">Purchase Failed</h3>
    <p className="text-gray-600">{error || 'An unexpected error occurred'}</p>
    <div className="flex gap-2">
      <Button variant="outline" onClick={onClose} className="flex-1">
        Cancel
      </Button>
      <Button onClick={onRetry} className="flex-1">
        Try Again
      </Button>
    </div>
  </div>
);