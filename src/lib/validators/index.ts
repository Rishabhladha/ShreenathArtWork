import { z } from 'zod';

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[0-9+ -]{10,15}$/, 'Please enter a valid phone number').optional().or(z.literal('')),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const customOrderSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number'),
  medium: z.string().optional(),
  dimensions: z.string().optional(),
  budget: z.string().optional(),
  description: z.string().min(15, 'Please describe your artwork request in detail (at least 15 characters)'),
  referenceImageUrl: z.string().url().optional().or(z.literal('')),
});

export const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID required'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(5, 'Review must be at least 5 characters').max(1000),
});

export const couponApplySchema = z.object({
  code: z.string().trim().min(2, 'Coupon code is too short').toUpperCase(),
  subtotal: z.number().int().nonnegative(),
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, 'Product ID required'),
  variantId: z.string().min(1, 'Variant ID required'),
  quantity: z.number().int().positive('Quantity must be greater than zero').max(99, 'Quantity exceeds maximum limit'),
});

export const checkoutItemsSchema = z.array(checkoutItemSchema).min(1, 'Cart is empty');

export const checkoutAddressSchema = z.object({
  customerName: z.string().min(2, 'Full name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(10, 'Valid 10-digit mobile number required'),
  addressLine1: z.string().min(4, 'Address line 1 is required'),
  addressLine2: z.string().optional().nullable().or(z.literal('')),
  landmark: z.string().optional().nullable().or(z.literal('')),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(6, 'Valid 6-digit Indian PIN code required'),
  orderNotes: z.string().max(500).optional().nullable().or(z.literal('')),
  paymentMethod: z.enum(['ONLINE', 'COD']),
  couponCode: z.string().optional().nullable().or(z.literal('')),
  agreeToTerms: z.boolean().optional().default(true),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile number required').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, 'Size is required'),
  frame: z.string().min(1, 'Frame option is required'),
  price: z.number().int().positive('Price must be greater than zero'),
  mrp: z.number().int().positive().optional().nullable(),
  sku: z.string().min(2, 'SKU is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  isDefault: z.boolean().default(false),
});

export const productSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  slug: z.string().min(3, 'Slug is required'),
  description: z.string().min(10, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  medium: z.string().min(2, 'Medium is required'),
  dimensions: z.string().min(2, 'Dimensions are required'),
  careInstructions: z.string().optional(),
  tags: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  images: z.array(
    z.object({
      id: z.string().optional(),
      url: z.string().min(1),
      altText: z.string(),
      displayOrder: z.number().int().default(0),
      isPrimary: z.boolean().default(false),
    })
  ).default([]),
  variants: z.array(productVariantSchema).min(1, 'At least one variant is required'),
});

export const couponSchema = z.object({
  code: z.string().min(2).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(['PERCENT', 'FLAT']),
  discountValue: z.number().int().positive('Discount value must be positive'),
  minOrderValue: z.number().int().nonnegative().default(0),
  maxDiscount: z.number().int().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum(['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']),
  note: z.string().optional(),
  courierName: z.string().optional(),
  trackingNumber: z.string().optional(),
});

