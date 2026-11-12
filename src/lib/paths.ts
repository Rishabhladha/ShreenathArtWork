/**
 * Shreenath Art Work - Centralized Path & Navigation System
 *
 * Provides a single, type-safe source of truth for all application URLs,
 * query parameters, navigation breadcrumbs, and API endpoints.
 * Replaces scattered magic strings with autocompleted, refactor-safe functions.
 */

export interface CatalogFilterParams {
  category?: string;
  search?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc' | string;
  page?: number | string;
  minPrice?: number | string;
  maxPrice?: number | string;
  inStock?: boolean | string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

/**
 * Builds a query string from a key-value object, stripping out empty/null/undefined values.
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Main application routes and path generators
 */
export const PATHS = {
  // Public Storefront
  home: '/',
  
  catalog: (filters?: CatalogFilterParams): string => {
    if (!filters) return '/catalog';
    return `/catalog${buildQueryString(filters as Record<string, unknown>)}`;
  },

  category: (categorySlug: string): string => {
    return `/catalog?category=${encodeURIComponent(categorySlug)}`;
  },

  product: (slug: string): string => {
    return `/product/${encodeURIComponent(slug)}`;
  },

  customOrder: '/custom-order',
  cart: '/cart',
  checkout: '/checkout',
  
  orderConfirmed: (orderId: string): string => {
    return `/checkout/order-confirmed?orderId=${encodeURIComponent(orderId)}`;
  },

  trackOrder: (orderNumber?: string): string => {
    if (!orderNumber) return '/track-order';
    return `/track-order?orderNumber=${encodeURIComponent(orderNumber)}`;
  },

  // Customer Account
  account: {
    root: '/account/profile',
    login: (callbackUrl?: string): string => {
      if (!callbackUrl) return '/account/login';
      return `/account/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    },
    profile: '/account/profile',
    orders: '/account/orders',
    wishlist: '/account/wishlist',
    forgotPassword: '/account/forgot-password',
    register: '/account/register',
  },

  // Information & Legal
  info: {
    about: '/about',
    contact: '/contact',
    faq: '/faq',
    shippingReturns: '/shipping-returns',
    privacy: '/privacy',
    terms: '/terms',
  },

  // Admin Portal
  admin: {
    dashboard: '/admin',
    login: (callbackUrl?: string, error?: string): string => {
      const params: Record<string, string> = {};
      if (callbackUrl) params.callbackUrl = callbackUrl;
      if (error) params.error = error;
      return `/admin/login${buildQueryString(params)}`;
    },
    products: '/admin/products',
    productNew: '/admin/products/new',
    productEdit: (id: string): string => `/admin/products/${encodeURIComponent(id)}`,
    categories: '/admin/categories',
    orders: '/admin/orders',
    orderDetail: (id: string): string => `/admin/orders/${encodeURIComponent(id)}`,
    payments: '/admin/payments',
    customers: '/admin/customers',
    customerDetail: (id: string): string => `/admin/customers/${encodeURIComponent(id)}`,
    activity: '/admin/activity',
    inventory: '/admin/inventory',
    coupons: '/admin/coupons',
    reviews: '/admin/reviews',
    enquiries: '/admin/enquiries',
    newsletter: '/admin/newsletter',
    settings: '/admin/settings',
    auditLog: '/admin/audit-log',
  },

  // API Endpoints
  api: {
    account: {
      register: '/api/account/register',
    },
    contact: '/api/contact',
    customOrder: '/api/custom-order',
    newsletter: '/api/newsletter',
    coupon: {
      validate: '/api/coupon/validate',
    },
    reviews: '/api/reviews',
    settings: '/api/settings',
    upload: '/api/upload',
    payments: {
      createOrder: '/api/payments/create-order',
      verify: '/api/payments/verify',
      fail: '/api/payments/fail',
      webhook: '/api/payments/webhook',
      simulateSignature: '/api/payments/simulate-signature',
    },
    admin: {
      products: '/api/admin/products',
      product: (id: string): string => `/api/admin/products/${encodeURIComponent(id)}`,
      categories: '/api/admin/categories',
      orders: '/api/admin/orders',
      order: (id: string): string => `/api/admin/orders/${encodeURIComponent(id)}`,
      coupons: '/api/admin/coupons',
      customer: (id: string): string => `/api/admin/customers/${encodeURIComponent(id)}`,
      settings: '/api/admin/settings',
    },
  },
} as const;

/**
 * Determines whether a given navigation item is currently active.
 *
 * @param currentPathname - Current pathname from `usePathname()` or `request.nextUrl.pathname`
 * @param targetPath - The target URL path to compare against
 * @param exact - Whether to require an exact match (defaults to false for prefixes unless target is '/')
 */
export function isPathActive(
  currentPathname: string,
  targetPath: string,
  exact = false
): boolean {
  if (!currentPathname || !targetPath) return false;
  
  // Clean paths to ignore query strings or hashes
  const cleanCurrent = currentPathname.split('?')[0].split('#')[0];
  const cleanTarget = targetPath.split('?')[0].split('#')[0];

  if (cleanTarget === '/' || exact) {
    return cleanCurrent === cleanTarget;
  }

  return cleanCurrent === cleanTarget || cleanCurrent.startsWith(`${cleanTarget}/`);
}

/**
 * Builds breadcrumb navigation trails based on the current pathname and optional metadata.
 */
export function buildProductBreadcrumbs(params: {
  productTitle: string;
  categoryName?: string;
  categorySlug?: string;
}): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: PATHS.home },
    { label: 'Catalog', href: PATHS.catalog() },
  ];

  if (params.categoryName && params.categorySlug) {
    items.push({
      label: params.categoryName,
      href: PATHS.category(params.categorySlug),
    });
  }

  items.push({
    label: params.productTitle,
    isCurrent: true,
  });

  return items;
}

/**
 * Builds standard breadcrumbs for admin pages.
 */
export function buildAdminBreadcrumbs(
  section: { label: string; href?: string },
  subSection?: { label: string; isCurrent?: boolean }
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: 'Admin', href: PATHS.admin.dashboard },
    {
      label: section.label,
      href: subSection ? section.href : undefined,
      isCurrent: !subSection,
    },
  ];

  if (subSection) {
    items.push({
      label: subSection.label,
      isCurrent: true,
    });
  }

  return items;
}
