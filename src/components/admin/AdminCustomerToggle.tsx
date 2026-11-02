'use client';

import React, { useState } from 'react';

export function AdminCustomerToggle({
  customerId,
  initialActive,
}: {
  customerId: string;
  initialActive: boolean;
}) {
  const [isActive, setIsActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        setIsActive(!isActive);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`px-2 py-0.5 text-[10px] rounded-sm font-semibold border transition-colors ${
        isActive
          ? 'bg-[#EAE2D5] text-[#2A5C38] border-[#D1C6B4] hover:bg-[#FAF0F0] hover:text-[#8C2B2B]'
          : 'bg-[#FAF0F0] text-[#8C2B2B] border-[#D9B5B5] hover:bg-[#EAE2D5] hover:text-[#2A5C38]'
      }`}
    >
      {isActive ? 'Active (Click to Disable)' : 'Disabled (Click to Enable)'}
    </button>
  );
}

