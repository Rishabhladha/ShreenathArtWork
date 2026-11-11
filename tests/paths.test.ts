import { describe, it, expect } from 'vitest';
import {
  PATHS,
  buildQueryString,
  isPathActive,
  buildProductBreadcrumbs,
  buildAdminBreadcrumbs,
} from '../src/lib/paths';

describe('Centralized Path System (PATHS)', () => {
  describe('buildQueryString', () => {
    it('returns empty string for empty object', () => {
      expect(buildQueryString({})).toBe('');
    });

    it('strips null, undefined, and empty string values', () => {
      const qs = buildQueryString({
        category: 'pichwai',
        search: '',
        page: undefined,
        minPrice: null,
        sort: 'newest',
      });
      expect(qs).toBe('?category=pichwai&sort=newest');
    });

    it('encodes special characters in query values', () => {
      const qs = buildQueryString({
        search: 'gold & silver leaf',
      });
      expect(qs).toBe('?search=gold+%26+silver+leaf');
    });
  });

  describe('Shop Route Generation', () => {
    it('generates root path', () => {
      expect(PATHS.home).toBe('/');
    });

    it('generates base catalog path when no filters passed', () => {
      expect(PATHS.catalog()).toBe('/catalog');
    });

    it('generates catalog path with filtered query params', () => {
      expect(
        PATHS.catalog({
          category: 'pichwai',
          sort: 'price-asc',
          page: 2,
        })
      ).toBe('/catalog?category=pichwai&sort=price-asc&page=2');
    });

    it('generates category shortcut URL', () => {
      expect(PATHS.category('festival-and-utsav')).toBe('/catalog?category=festival-and-utsav');
    });

    it('encodes product slug properly', () => {
      expect(PATHS.product('shreenathji-kamal-talai')).toBe('/product/shreenathji-kamal-talai');
      expect(PATHS.product('art/special#1')).toBe('/product/art%2Fspecial%231');
    });

    it('generates order confirmed and track order paths', () => {
      expect(PATHS.orderConfirmed('ord_12345')).toBe('/checkout/order-confirmed?orderId=ord_12345');
      expect(PATHS.trackOrder()).toBe('/track-order');
      expect(PATHS.trackOrder('SAW-2026-999')).toBe('/track-order?orderNumber=SAW-2026-999');
    });

    it('generates account routes and callbackUrl login paths', () => {
      expect(PATHS.account.profile).toBe('/account/profile');
      expect(PATHS.account.orders).toBe('/account/orders');
      expect(PATHS.account.wishlist).toBe('/account/wishlist');
      expect(PATHS.account.forgotPassword).toBe('/account/forgot-password');
      expect(PATHS.account.login()).toBe('/account/login');
      expect(PATHS.account.login('/checkout')).toBe('/account/login?callbackUrl=%2Fcheckout');
    });

    it('generates static info pages', () => {
      expect(PATHS.info.about).toBe('/about');
      expect(PATHS.info.contact).toBe('/contact');
      expect(PATHS.info.faq).toBe('/faq');
      expect(PATHS.info.shippingReturns).toBe('/shipping-returns');
      expect(PATHS.info.privacy).toBe('/privacy');
      expect(PATHS.info.terms).toBe('/terms');
    });
  });

  describe('Admin Route Generation', () => {
    it('generates admin navigation paths', () => {
      expect(PATHS.admin.dashboard).toBe('/admin');
      expect(PATHS.admin.products).toBe('/admin/products');
      expect(PATHS.admin.productNew).toBe('/admin/products/new');
      expect(PATHS.admin.productEdit('prod_123')).toBe('/admin/products/prod_123');
      expect(PATHS.admin.categories).toBe('/admin/categories');
      expect(PATHS.admin.orders).toBe('/admin/orders');
      expect(PATHS.admin.orderDetail('ord_456')).toBe('/admin/orders/ord_456');
      expect(PATHS.admin.payments).toBe('/admin/payments');
      expect(PATHS.admin.settings).toBe('/admin/settings');
    });

    it('generates admin login with callback and error queries', () => {
      expect(PATHS.admin.login()).toBe('/admin/login');
      expect(PATHS.admin.login('/admin/orders')).toBe('/admin/login?callbackUrl=%2Fadmin%2Forders');
      expect(PATHS.admin.login('/admin', 'unauthorized')).toBe(
        '/admin/login?callbackUrl=%2Fadmin&error=unauthorized'
      );
    });
  });

  describe('API Route Generation', () => {
    it('generates valid API endpoints', () => {
      expect(PATHS.api.contact).toBe('/api/contact');
      expect(PATHS.api.upload).toBe('/api/upload');
      expect(PATHS.api.payments.createOrder).toBe('/api/payments/create-order');
      expect(PATHS.api.payments.verify).toBe('/api/payments/verify');
      expect(PATHS.api.admin.product('p123')).toBe('/api/admin/products/p123');
      expect(PATHS.api.admin.order('o456')).toBe('/api/admin/orders/o456');
    });
  });

  describe('isPathActive Helper', () => {
    it('correctly identifies exact matches', () => {
      expect(isPathActive('/', '/')).toBe(true);
      expect(isPathActive('/catalog', '/')).toBe(false);
      expect(isPathActive('/catalog', '/catalog')).toBe(true);
      expect(isPathActive('/catalog', '/catalog', true)).toBe(true);
    });

    it('matches sub-paths when exact is false', () => {
      expect(isPathActive('/admin/products/new', '/admin/products')).toBe(true);
      expect(isPathActive('/admin/products', '/admin/products')).toBe(true);
      expect(isPathActive('/admin/products/new', '/admin/products', true)).toBe(false);
    });

    it('ignores query parameters during match comparison', () => {
      expect(isPathActive('/catalog?category=pichwai', '/catalog')).toBe(true);
      expect(isPathActive('/catalog?page=2', '/catalog', true)).toBe(true);
    });
  });

  describe('Breadcrumb Builders', () => {
    it('builds product breadcrumbs with category', () => {
      const crumbs = buildProductBreadcrumbs({
        productTitle: 'Kamal Talai Pichwai',
        categoryName: 'Pichwai',
        categorySlug: 'pichwai',
      });

      expect(crumbs).toEqual([
        { label: 'Home', href: '/' },
        { label: 'Catalog', href: '/catalog' },
        { label: 'Pichwai', href: '/catalog?category=pichwai' },
        { label: 'Kamal Talai Pichwai', isCurrent: true },
      ]);
    });

    it('builds product breadcrumbs without category fallback', () => {
      const crumbs = buildProductBreadcrumbs({
        productTitle: 'Custom Portrait',
      });

      expect(crumbs).toEqual([
        { label: 'Home', href: '/' },
        { label: 'Catalog', href: '/catalog' },
        { label: 'Custom Portrait', isCurrent: true },
      ]);
    });

    it('builds admin breadcrumbs for top section and detail page', () => {
      const crumbs = buildAdminBreadcrumbs(
        { label: 'Orders', href: PATHS.admin.orders },
        { label: 'Order #SAW-1001' }
      );

      expect(crumbs).toEqual([
        { label: 'Admin', href: '/admin' },
        { label: 'Orders', href: '/admin/orders', isCurrent: false },
        { label: 'Order #SAW-1001', isCurrent: true },
      ]);
    });
  });
});
