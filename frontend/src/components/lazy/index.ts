import { createDynamicComponent } from '@/lib/performance';
import { Loading } from '@/components/ui/Loading';

// Lazy load heavy components that are not immediately visible
export const LazyProductFilters = createDynamicComponent(
  () => import('@/components/product/ProductFilters'),
  { loading: Loading, ssr: false }
);

export const LazyShoppingCart = createDynamicComponent(
  () => import('@/components/cart/ShoppingCart').then(mod => ({ default: mod.ShoppingCart })),
  { loading: Loading, ssr: false }
);

export const LazyPaymentSelector = createDynamicComponent(
  () => import('@/components/payment/PaymentSelector').then(mod => ({ default: mod.PaymentSelector })),
  { loading: Loading, ssr: false }
);

export const LazyCryptoPaymentFlow = createDynamicComponent(
  () => import('@/components/payment/CryptoPaymentFlow').then(mod => ({ default: mod.CryptoPaymentFlow })),
  { loading: Loading, ssr: false }
);



export const LazyUserDashboard = createDynamicComponent(
  () => import('@/components/account/UserDashboard').then(mod => ({ default: mod.UserDashboard })),
  { loading: Loading, ssr: false }
);

export const LazyNFTCollectionGrid = createDynamicComponent(
  () => import('@/components/nft/NFTCollectionGrid').then(mod => ({ default: mod.NFTCollectionGrid })),
  { loading: Loading, ssr: false }
);

export const LazyPrivateSalesGrid = createDynamicComponent(
  () => import('@/components/private-sales/PrivateSalesGrid').then(mod => ({ default: mod.PrivateSalesGrid })),
  { loading: Loading, ssr: false }
);

export const LazyProductManagement = createDynamicComponent(
  () => import('@/components/admin/ProductManagement').then(mod => ({ default: mod.ProductManagement })),
  { loading: Loading, ssr: false }
);

// Lazy load modal components
export const LazyModal = createDynamicComponent(
  () => import('@/components/ui/Modal'),
  { loading: () => null, ssr: false }
);

// Lazy load form components
export const LazyRegisterForm = createDynamicComponent(
  () => import('@/components/forms/RegisterForm').then(mod => ({ default: mod.RegisterForm })),
  { loading: Loading, ssr: false }
);

export const LazyForgotPasswordForm = createDynamicComponent(
  () => import('@/components/forms/ForgotPasswordForm').then(mod => ({ default: mod.ForgotPasswordForm })),
  { loading: Loading, ssr: false }
);

// Lazy load shipping components
export const LazyShippingMethodSelector = createDynamicComponent(
  () => import('@/components/shipping/ShippingMethodSelector').then(mod => ({ default: mod.ShippingMethodSelector })),
  { loading: Loading, ssr: false }
);

export const LazyTrackingDisplay = createDynamicComponent(
  () => import('@/components/shipping/TrackingDisplay').then(mod => ({ default: mod.TrackingDisplay })),
  { loading: Loading, ssr: false }
);