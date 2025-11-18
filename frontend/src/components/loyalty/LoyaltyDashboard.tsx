'use client';

import React, { useState, useEffect } from 'react';
import { UserLoyaltyStatus, LoyaltyTransaction, LoyaltyReward } from '../../types/affiliate';
import { affiliateApi } from '../../lib/affiliate-api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';

export const LoyaltyDashboard: React.FC = () => {
  const [loyaltyStatus, setLoyaltyStatus] = useState<UserLoyaltyStatus | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const [statusData, transactionsData, rewardsData] = await Promise.all([
        affiliateApi.getLoyaltyStatus(),
        affiliateApi.getLoyaltyTransactions(10),
        affiliateApi.getAvailableRewards()
      ]);
      
      setLoyaltyStatus(statusData);
      setTransactions(transactionsData);
      setRewards(rewardsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load loyalty data');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async (rewardId: string) => {
    try {
      await affiliateApi.redeemReward(rewardId);
      await fetchLoyaltyData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem reward');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE': return 'text-amber-600 bg-amber-100';
      case 'SILVER': return 'text-gray-600 bg-gray-100';
      case 'GOLD': return 'text-yellow-600 bg-yellow-100';
      case 'PLATINUM': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTierProgress = () => {
    if (!loyaltyStatus) return 0;
    const { totalSpent, nextTierSpent, benefits } = loyaltyStatus;
    const nextTierTotal = totalSpent + nextTierSpent;
    return nextTierTotal > 0 ? (totalSpent / nextTierTotal) * 100 : 100;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (!loyaltyStatus) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-charcoal-black mb-2">Unable to Load Loyalty Status</h2>
        <p className="text-gray-600 mb-4">{error || 'Please try again later'}</p>
        <Button onClick={fetchLoyaltyData}>Retry</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-black">Loyalty Program</h1>
          <p className="text-gray-600">Earn points and unlock exclusive benefits</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${getTierColor(loyaltyStatus.tier)}`}>
          {loyaltyStatus.tier} MEMBER
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Current Points</h3>
            <div className="w-12 h-12 bg-champagne-gold/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-champagne-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-champagne-gold mb-2">
            {loyaltyStatus.points.toLocaleString()}
          </div>
          <p className="text-sm text-gray-500">Available to redeem</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Total Spent</h3>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-charcoal-black mb-2">
            ${loyaltyStatus.totalSpent.toLocaleString()}
          </div>
          <p className="text-sm text-gray-500">Lifetime purchases</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Next Tier</h3>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          {loyaltyStatus.nextTierSpent > 0 ? (
            <>
              <div className="text-3xl font-bold text-charcoal-black mb-2">
                ${loyaltyStatus.nextTierSpent.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500">More to next tier</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-champagne-gold h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getTierProgress()}%` }}
                ></div>
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl font-bold text-purple-600 mb-2">MAX</div>
              <p className="text-sm text-gray-500">Highest tier achieved</p>
            </>
          )}
        </Card>
      </div>

      {/* Tier Benefits */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Your {loyaltyStatus.tier} Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-champagne-gold mb-1">
              {loyaltyStatus.benefits.pointsMultiplier}x
            </div>
            <div className="text-sm text-gray-600">Points Multiplier</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-champagne-gold mb-1">
              {loyaltyStatus.benefits.discountPercentage}%
            </div>
            <div className="text-sm text-gray-600">Member Discount</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-champagne-gold mb-1">
              ${loyaltyStatus.benefits.freeShippingThreshold}
            </div>
            <div className="text-sm text-gray-600">Free Shipping</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-champagne-gold mb-1">
              {loyaltyStatus.benefits.exclusiveAccess ? '✓' : '✗'}
            </div>
            <div className="text-sm text-gray-600">Exclusive Access</div>
          </div>
        </div>
      </Card>

      {/* Available Rewards */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Available Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.slice(0, 6).map((reward) => (
            <div key={reward.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-charcoal-black mb-2">{reward.name}</h4>
              <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-champagne-gold">
                  {reward.pointsCost} pts
                </span>
                <Button
                  size="sm"
                  disabled={loyaltyStatus.points < reward.pointsCost}
                  onClick={() => handleRedeemReward(reward.id)}
                >
                  Redeem
                </Button>
              </div>
            </div>
          ))}
        </div>
        {rewards.length > 6 && (
          <div className="text-center mt-4">
            <Button variant="outline">View All Rewards</Button>
          </div>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
              <div>
                <div className="font-medium text-charcoal-black">{transaction.description}</div>
                <div className="text-sm text-gray-500">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className={`font-semibold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.points > 0 ? '+' : ''}{transaction.points} pts
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};