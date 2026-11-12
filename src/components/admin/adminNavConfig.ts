import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  CreditCard,
  Users,
  Activity,
  Warehouse,
  Tag,
  MessageSquare,
  MailQuestion,
  Mail,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { PATHS } from '@/lib/paths';

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: 'Core & Insights',
    items: [
      { href: PATHS.admin.dashboard, label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: PATHS.admin.activity, label: 'Activity & Funnel', icon: Activity },
      { href: PATHS.admin.auditLog, label: 'Audit Trail', icon: ShieldCheck },
    ],
  },
  {
    title: 'Art Catalog',
    items: [
      { href: PATHS.admin.products, label: 'Artworks & Products', icon: Package },
      { href: PATHS.admin.categories, label: 'Categories & Series', icon: Layers },
      { href: PATHS.admin.inventory, label: 'Inventory & Stock', icon: Warehouse },
    ],
  },
  {
    title: 'Commerce & Sales',
    items: [
      { href: PATHS.admin.orders, label: 'Orders & Shipments', icon: ShoppingBag },
      { href: PATHS.admin.payments, label: 'Payments & Refunds', icon: CreditCard },
      { href: PATHS.admin.coupons, label: 'Discount Coupons', icon: Tag },
    ],
  },
  {
    title: 'Collectors & Relations',
    items: [
      { href: PATHS.admin.customers, label: 'Customer Accounts', icon: Users },
      { href: PATHS.admin.enquiries, label: 'Inquiries & Commissions', icon: MailQuestion },
      { href: PATHS.admin.reviews, label: 'Reviews Moderation', icon: MessageSquare },
      { href: PATHS.admin.newsletter, label: 'Newsletter Subscribers', icon: Mail },
    ],
  },
  {
    title: 'System',
    items: [
      { href: PATHS.admin.settings, label: 'Gallery Settings', icon: Settings },
    ],
  },
];
