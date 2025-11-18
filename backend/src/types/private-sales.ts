export interface PrivateSale {
  id: string;
  wineId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  maxQuantity: number;
  soldQuantity: number;
  price: number;
  currency: string;
  eligibilityCriteria: EligibilityCriteria;
  isActive: boolean;
  isExclusive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EligibilityCriteria {
  minSpent?: number;
  loyaltyTier?: string[];
  inviteOnly?: boolean;
  whitelistedUsers?: string[];
  minAccountAge?: number; // in days
  previousPurchases?: number;
}

export interface PrivateSaleAccess {
  id: string;
  userId: string;
  privateSaleId: string;
  accessGranted: boolean;
  accessReason: string;
  grantedAt: Date;
  expiresAt?: Date;
}

export interface PrivateSalePurchase {
  id: string;
  userId: string;
  privateSaleId: string;
  wineId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  purchasedAt: Date;
}

export interface UserEligibilityStatus {
  isEligible: boolean;
  reasons: string[];
  missingCriteria: string[];
  userStats: {
    totalSpent: number;
    loyaltyTier: string;
    accountAge: number;
    previousPurchases: number;
  };
}