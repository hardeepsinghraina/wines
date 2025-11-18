export interface AffiliateProgram {
  id: string;
  userId: string;
  affiliateCode: string;
  commissionRate: number; // Percentage (e.g., 5.5 for 5.5%)
  totalEarnings: number;
  totalReferrals: number;
  isActive: boolean;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AffiliateReferral {
  id: string;
  affiliateId: string;
  referredUserId: string;
  referralCode: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  firstPurchaseAmount?: number;
  commissionEarned?: number;
  referredAt: Date;
  confirmedAt?: Date;
}

export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  referralId: string;
  orderId: string;
  commissionAmount: number;
  commissionRate: number;
  orderAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  earnedAt: Date;
  paidAt?: Date;
}

export interface AffiliateStats {
  totalEarnings: number;
  pendingEarnings: number;
  totalReferrals: number;
  confirmedReferrals: number;
  conversionRate: number;
  averageOrderValue: number;
  thisMonthEarnings: number;
  thisMonthReferrals: number;
}

export interface LoyaltyTierBenefits {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  minSpent: number;
  pointsMultiplier: number;
  discountPercentage: number;
  freeShippingThreshold: number;
  exclusiveAccess: boolean;
  personalShopper: boolean;
  prioritySupport: boolean;
  birthdayBonus: number;
  welcomeBonus: number;
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  points: number;
  description: string;
  orderId?: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  rewardType: 'discount' | 'free_shipping' | 'product' | 'experience';
  rewardValue: number;
  isActive: boolean;
  validUntil?: Date;
  usageLimit?: number;
  usedCount: number;
  createdAt: Date;
}

export interface UserLoyaltyStatus {
  userId: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  points: number;
  totalSpent: number;
  nextTierSpent: number;
  nextTierPoints: number;
  joinedAt: Date;
  lastActivity: Date;
  benefits: LoyaltyTierBenefits;
}