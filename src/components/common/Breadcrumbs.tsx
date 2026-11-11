import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbItem } from '@/lib/paths';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs text-[#8A8175] gap-1.5 flex-wrap ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#B8A898] shrink-0" />}
            {item.href && !item.isCurrent && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[#262320] transition-colors focus-ring rounded-xs"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="text-[#262320] font-medium truncate max-w-[200px] sm:max-w-xs"
                aria-current={item.isCurrent || isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
