import React from 'react';
import Link from 'next/link';
import { PATHS } from '@/lib/paths';
import { formatPrice } from '@/lib/money';
import {
  Tag,
  Package,
  Layers,
  ShoppingBag,
  User,
  Settings,
  Star,
  ExternalLink,
} from 'lucide-react';

interface FormattedAudit {
  headline: string;
  chips: Array<{ label: string; value: string }>;
  entityLabel: string;
  entityLink?: string;
  actionBadge: { label: string; colorClass: string };
}

/**
 * Translates raw audit log database records into elegant, human-readable
 * presentation items instead of raw JSON dumps.
 */
export function formatAuditEntry(
  entity: string,
  entityId: string | null,
  action: string,
  detailsRaw: string | null
): FormattedAudit {
  let parsed: Record<string, unknown> = {};
  if (detailsRaw) {
    try {
      parsed = JSON.parse(detailsRaw);
    } catch {
      parsed = { note: detailsRaw };
    }
  }

  // 1. Action Badge Styling
  let actionLabel = action.replace(/_/g, ' ');
  let colorClass = 'bg-[#FAF6EF] text-[#262320] border-[#E2DACD]';

  if (action.includes('CREATE') || action.includes('ADD') || action.includes('PAID') || action.includes('APPROVE')) {
    actionLabel = action.replace('CREATE_', '').replace('ADD_', '').replace('MARK_', '') + ' CREATED';
    if (action === 'MARK_COD_PAID') actionLabel = 'PAID ON DELIVERY';
    if (action === 'APPROVE_REVIEW') actionLabel = 'REVIEW APPROVED';
    colorClass = 'bg-[#EAF3EB] text-[#2A5C38] border-[#B7D8BD]';
  } else if (action.includes('UPDATE') || action.includes('ADJUST') || action.includes('TOGGLE')) {
    actionLabel = action.replace('UPDATE_', '').replace('ADJUST_', '') + ' UPDATED';
    colorClass = 'bg-[#FAF1E8] text-[#A85A32] border-[#DEC99C]';
  } else if (action.includes('DELETE') || action.includes('REMOVE') || action.includes('CANCEL')) {
    actionLabel = action.replace('DELETE_', '') + ' REMOVED';
    colorClass = 'bg-[#FAF0F0] text-[#8C2B2B] border-[#D9B5B5]';
  } else if (action.includes('REFUND')) {
    actionLabel = 'REFUND ISSUED';
    colorClass = 'bg-[#F5EEF8] text-[#6B2D82] border-[#D8BFD8]';
  }

  // 2. Entity Links & Names
  let entityLabel = entity;
  let entityLink: string | undefined;

  switch (entity.toLowerCase()) {
    case 'product':
      entityLabel = 'Artwork Painting';
      if (entityId) entityLink = PATHS.admin.productEdit(entityId);
      break;
    case 'order':
      entityLabel = 'Customer Order';
      if (entityId) entityLink = PATHS.admin.orderDetail(entityId);
      break;
    case 'category':
      entityLabel = 'Collection Category';
      entityLink = PATHS.admin.categories;
      break;
    case 'coupon':
      entityLabel = 'Discount Coupon';
      entityLink = PATHS.admin.coupons;
      break;
    case 'inventory':
      entityLabel = 'Stock Inventory';
      entityLink = PATHS.admin.inventory;
      break;
    case 'customer':
      entityLabel = 'Collector Account';
      if (entityId) entityLink = PATHS.admin.customerDetail(entityId);
      break;
    case 'review':
      entityLabel = 'Artwork Review';
      entityLink = PATHS.admin.reviews;
      break;
    case 'settings':
      entityLabel = 'Storefront Settings';
      entityLink = PATHS.admin.settings;
      break;
    default:
      entityLabel = entity;
  }

  // 3. Extract Human-Friendly Headline and Chips
  let headline = `${entityLabel} modification logged`;
  const chips: Array<{ label: string; value: string }> = [];

  // Product specific
  if (parsed.title) {
    headline = `Artwork: "${parsed.title}"`;
  }
  if (parsed.slug) {
    chips.push({ label: 'Slug', value: String(parsed.slug) });
  }

  // Order specific
  if (parsed.oldStatus && parsed.newStatus) {
    headline = `Fulfillment status advanced: ${parsed.oldStatus} → ${parsed.newStatus}`;
  }
  if (parsed.trackingNumber) {
    chips.push({ label: 'Waybill', value: String(parsed.trackingNumber) });
  }
  if (parsed.amount) {
    chips.push({ label: 'Amount', value: formatPrice(Number(parsed.amount)) });
  }
  if (parsed.reason) {
    chips.push({ label: 'Reason', value: String(parsed.reason) });
  }

  // Inventory specific
  if (parsed.sku) {
    chips.push({ label: 'SKU', value: String(parsed.sku) });
  }
  if (parsed.oldStock !== undefined && parsed.newStock !== undefined) {
    headline = `Stock updated for SKU ${parsed.sku || ''}: ${parsed.oldStock} → ${parsed.newStock} units`;
  }

  // Category specific
  if (parsed.name) {
    headline = `Category: "${parsed.name}"`;
  }
  if (parsed.deletedName) {
    headline = `Deleted category: "${parsed.deletedName}"`;
  }

  // Coupon specific
  if (parsed.code) {
    headline = `Coupon code: "${parsed.code}"`;
  }
  if (parsed.discount) {
    chips.push({ label: 'Discount', value: `${parsed.discount}%` });
  }

  // Settings specific
  if (Array.isArray(parsed.fieldsUpdated)) {
    headline = `Store settings updated (${parsed.fieldsUpdated.length} fields)`;
    chips.push({ label: 'Fields', value: parsed.fieldsUpdated.join(', ') });
  }

  // Generic fallback if no specific keys matched
  if (chips.length === 0 && Object.keys(parsed).length > 0) {
    Object.entries(parsed).forEach(([k, v]) => {
      if (k === 'title' || k === 'name' || k === 'note') return;
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        chips.push({ label: k, value: String(v) });
      }
    });
  }

  return {
    headline,
    chips,
    entityLabel,
    entityLink,
    actionBadge: { label: actionLabel, colorClass },
  };
}

/**
 * React Component for rendering formatted audit row cells.
 */
export function AuditDetailCell({
  entity,
  entityId,
  action,
  detailsRaw,
}: {
  entity: string;
  entityId: string | null;
  action: string;
  detailsRaw: string | null;
}) {
  const formatted = formatAuditEntry(entity, entityId, action, detailsRaw);

  return (
    <div className="space-y-1.5 py-1">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[#262320] text-xs">
          {formatted.headline}
        </span>
        {formatted.entityLink && (
          <Link
            href={formatted.entityLink}
            className="text-[#A85A32] hover:text-[#8F4824] inline-flex items-center text-[10px] gap-0.5"
            title="Inspect entity"
          >
            <span>View</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        )}
      </div>

      {formatted.chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {formatted.chips.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] bg-white border border-[#E2DACD] text-[#5C554C]"
            >
              <strong className="text-[#262320] mr-1">{c.label}:</strong> {c.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Formats telemetry event metadata for the Activity Feed
 */
export function formatActivityMetadata(eventType: string, metadataRaw: string | null) {
  if (!metadataRaw) return null;

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(metadataRaw);
  } catch {
    return <span className="text-[11px] text-[#5C554C]">{metadataRaw}</span>;
  }

  const chips: Array<{ label: string; value: string }> = [];

  if (parsed.title) chips.push({ label: 'Artwork', value: String(parsed.title) });
  if (parsed.slug) chips.push({ label: 'Slug', value: String(parsed.slug) });
  if (parsed.email) chips.push({ label: 'Email', value: String(parsed.email) });
  if (parsed.orderNumber) chips.push({ label: 'Order', value: String(parsed.orderNumber) });
  if (parsed.price) chips.push({ label: 'Price', value: formatPrice(Number(parsed.price)) });
  if (parsed.size) chips.push({ label: 'Size', value: String(parsed.size) });

  // Generic fallback if none of above
  if (chips.length === 0) {
    Object.entries(parsed).forEach(([k, v]) => {
      if (typeof v === 'string' || typeof v === 'number') {
        chips.push({ label: k, value: String(v) });
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {chips.map((c, idx) => (
        <span
          key={idx}
          className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] bg-white border border-[#ECE5DA] text-[#5C554C]"
        >
          <strong className="text-[#262320] mr-1">{c.label}:</strong> {c.value}
        </span>
      ))}
    </div>
  );
}
