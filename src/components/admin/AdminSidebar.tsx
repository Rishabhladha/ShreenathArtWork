'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { Role } from '@prisma/client';
import { PATHS, isPathActive } from '@/lib/paths';

interface AdminSidebarProps {
  role?: Role;
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();

  // If on admin login page, hide sidebar
  if (pathname === PATHS.admin.login()) {
    return null;
  }

  const navItems = [
    { href: PATHS.admin.dashboard, label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: PATHS.admin.products, label: 'Products & Artworks', icon: Package },
    { href: PATHS.admin.categories, label: 'Categories', icon: Layers },
    { href: PATHS.admin.orders, label: 'Orders & Shipments', icon: ShoppingBag },
    { href: PATHS.admin.payments, label: 'Payments & Refunds', icon: CreditCard },
    { href: PATHS.admin.customers, label: 'Customers', icon: Users },
    { href: PATHS.admin.activity, label: 'Activity & Funnel', icon: Activity },
    { href: PATHS.admin.inventory, label: 'Inventory & Stock', icon: Warehouse },
    { href: PATHS.admin.coupons, label: 'Discount Coupons', icon: Tag },
    { href: PATHS.admin.reviews, label: 'Reviews Moderation', icon: MessageSquare },
    { href: PATHS.admin.enquiries, label: 'Inquiries & Commissions', icon: MailQuestion },
    { href: PATHS.admin.newsletter, label: 'Newsletter Subscribers', icon: Mail },
    { href: PATHS.admin.settings, label: 'Gallery Settings', icon: Settings },
    { href: PATHS.admin.auditLog, label: 'Audit Trail', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-[#FAF7F2] border-r border-[#E2DACD] flex flex-col shrink-0 overflow-y-auto hidden md:flex">
      <div className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = isPathActive(pathname, item.href, item.exact);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-sm transition-colors ${
                isActive
                  ? 'bg-[#262320] text-[#FAF6EF]'
                  : 'text-[#5C554C] hover:text-[#262320] hover:bg-[#F4EFE6]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto p-4 border-t border-[#ECE5DA] text-[11px] text-[#8A8175]">
        <p>SHREENATH ART WORK</p>
        <p className="mt-0.5">Nathdwara, Rajasthan 313301</p>
      </div>
    </aside>
  );
}
