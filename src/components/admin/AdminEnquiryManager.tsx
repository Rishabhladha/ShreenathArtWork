'use client';

import React, { useState } from 'react';
import { ContactMessage, CustomOrderRequest, InquiryStatus } from '@prisma/client';

export function AdminEnquiryManager({
  messages,
  customOrders,
}: {
  messages: ContactMessage[];
  customOrders: CustomOrderRequest[];
}) {
  const [tab, setTab] = useState<'contact' | 'custom'>('custom');
  const [itemsList, setItemsList] = useState({ contact: messages, custom: customOrders });
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleUpdate = async (type: 'contact' | 'custom_order', id: string, newStatus: InquiryStatus) => {
    setSavingId(id);
    try {
      const res = await fetch('/api/admin/enquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, status: newStatus }),
      });
      if (res.ok) {
        if (type === 'custom_order') {
          setItemsList((prev) => ({
            ...prev,
            custom: prev.custom.map((i) => (i.id === id ? { ...i, status: newStatus } : i)),
          }));
        } else {
          setItemsList((prev) => ({
            ...prev,
            contact: prev.contact.map((i) => (i.id === id ? { ...i, status: newStatus } : i)),
          }));
        }
      }
    } catch {
      alert('Error updating status');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-[#E2DACD] text-xs">
        <button
          type="button"
          onClick={() => setTab('custom')}
          className={`py-2 px-4 border-b-2 font-medium transition-colors ${
            tab === 'custom'
              ? 'border-[#262320] text-[#262320] font-semibold'
              : 'border-transparent text-[#8A8175] hover:text-[#262320]'
          }`}
        >
          Custom Commission Requests ({itemsList.custom.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('contact')}
          className={`py-2 px-4 border-b-2 font-medium transition-colors ${
            tab === 'contact'
              ? 'border-[#262320] text-[#262320] font-semibold'
              : 'border-transparent text-[#8A8175] hover:text-[#262320]'
          }`}
        >
          Contact Messages ({itemsList.contact.length})
        </button>
      </div>

      {tab === 'custom' && (
        <div className="space-y-4">
          {itemsList.custom.length === 0 ? (
            <p className="text-xs text-[#8A8175] text-center py-8">
              No custom commission requests received yet.
            </p>
          ) : (
            itemsList.custom.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#ECE5DA] pb-3">
                  <div>
                    <span className="font-serif font-bold text-base text-[#262320]">
                      {item.name}
                    </span>
                    <p className="text-[11px] text-[#5C554C]">
                      Phone: <a href={`tel:${item.phone}`} className="text-[#C47820] font-medium">{item.phone}</a>{' '}
                      | Email: {item.email}
                    </p>
                    <p className="text-[10px] text-[#8A8175]">
                      Received on {new Date(item.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-sm font-semibold border ${
                        item.status === 'NEW'
                          ? 'bg-[#FDF4E7] text-[#94601A] border-[#EAD5B8]'
                          : item.status === 'IN_PROGRESS'
                          ? 'bg-[#EAE2D5] text-[#262320] border-[#D1C6B4]'
                          : 'bg-[#FAF6EF] text-[#8A8175] border-[#ECE5DA]'
                      }`}
                    >
                      {item.status}
                    </span>
                    <select
                      value={item.status}
                      onChange={(e) => handleUpdate('custom_order', item.id, e.target.value as InquiryStatus)}
                      disabled={savingId === item.id}
                      className="px-2 py-1 text-[11px] bg-white border border-[#E2DACD] rounded-sm text-[#262320]"
                    >
                      <option value="NEW">New</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#5C554C]">
                  <div>
                    <span className="text-[#8A8175] block">Medium:</span>
                    <span>{item.medium || 'Traditional stone pigments'}</span>
                  </div>
                  <div>
                    <span className="text-[#8A8175] block">Dimensions:</span>
                    <span>{item.dimensions || 'Standard sanctum size'}</span>
                  </div>
                  <div>
                    <span className="text-[#8A8175] block">Budget:</span>
                    <span>{item.budget || 'Open / Discussion'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#ECE5DA]">
                  <p className="text-[#5C554C] leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'contact' && (
        <div className="space-y-4">
          {itemsList.contact.length === 0 ? (
            <p className="text-xs text-[#8A8175] text-center py-8">
              No contact messages received yet.
            </p>
          ) : (
            itemsList.contact.map((msg) => (
              <div
                key={msg.id}
                className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#ECE5DA] pb-3">
                  <div>
                    <span className="font-serif font-bold text-base text-[#262320]">
                      {msg.name}
                    </span>
                    <p className="text-[11px] text-[#5C554C]">
                      Email: {msg.email} {msg.phone ? `| Phone: ${msg.phone}` : ''}
                    </p>
                    <p className="text-[10px] text-[#8A8175]">
                      Subject: <strong>{msg.subject}</strong> | Received on{' '}
                      {new Date(msg.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={msg.status}
                      onChange={(e) => handleUpdate('contact', msg.id, e.target.value as InquiryStatus)}
                      disabled={savingId === msg.id}
                      className="px-2 py-1 text-[11px] bg-white border border-[#E2DACD] rounded-sm text-[#262320]"
                    >
                      <option value="NEW">New</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <p className="text-[#5C554C] leading-relaxed whitespace-pre-line">
                    {msg.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

