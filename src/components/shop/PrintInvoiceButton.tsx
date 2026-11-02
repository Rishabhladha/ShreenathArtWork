'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export function PrintInvoiceButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Print Invoice</span>
    </button>
  );
}

