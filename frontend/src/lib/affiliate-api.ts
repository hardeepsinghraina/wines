import { api } from './api';
import {
  AffiliateProgram,
  AffiliateStats,
  AffiliateReferral,
  UserLoyaltyStatus,
  LoyaltyTransaction,
  LoyaltyReward
} from '../types/affiliate';

export const affiliateApi = {
  // Affiliate Program
  async createAffiliateProgram(): Promise<AffiliateProgram> {
    const response = await api.post('/affiliate/program');
    return (response as any).data.data;
  },

  async getAffiliateProgram(): Promise<AffiliateProgram> {
    const response = await api.get('/affiliate/program');
    return (response as any).data.data;
  },

  async getAffiliateStats(): Promise<AffiliateStats> {
    const response = await api.get('/affiliate/stats');
    return (response as any).data.data;
  },

  async getUserReferrals(): Promise<AffiliateReferral[]> {
    const response = await api.get('/affiliate/referrals');
    return (response as any).data.data;
  },

  async trackReferral(affiliateCode: string): Promise<AffiliateReferral> {
    const response = await api.post('/affiliate/track', { affiliateCode });
    return (response as any).data.data;
  },

  // Loyalty Program
  async getLoyaltyStatus(): Promise<UserLoyaltyStatus> {
    const response = await api.get('/affiliate/loyalty/status');
    return (response as any).data.data;
  },

  async getLoyaltyTransactions(limit?: number): Promise<LoyaltyTransaction[]> {
    const url = limit ? `/affiliate/loyalty/transactions?limit=${limit}` : '/affiliate/loyalty/transactions';
    const response = await api.get(url);
    return (response as any).data.data;
  },

  async getAvailableRewards(): Promise<LoyaltyReward[]> {
    const response = await api.get('/affiliate/loyalty/rewards');
    return (response as any).data.data;
  },

  async redeemReward(rewardId: string): Promise<{ transaction: LoyaltyTransaction; reward: LoyaltyReward }> {
    const response = await api.post(`/affiliate/loyalty/rewards/${rewardId}/redeem`);
    return (response as any).data.data;
  }
};