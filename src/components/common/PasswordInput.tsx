'use client';

import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', error, label, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="space-y-1 w-full">
        {label && (
          <label className="block text-xs font-medium text-[#5C554C]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            {...props}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`w-full pr-10 pl-3 py-2 text-xs bg-white border border-[#E2DACD] rounded-sm focus-ring text-[#262320] transition-colors ${
              error ? 'border-red-400 focus:border-red-500' : ''
            } ${className}`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 p-1.5 text-[#8A8175] hover:text-[#262320] focus-ring rounded-xs transition-colors flex items-center justify-center min-h-[32px] min-w-[32px]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4 text-[#A85A32]" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {error && <p className="text-[11px] text-[#8C2B2B]">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
