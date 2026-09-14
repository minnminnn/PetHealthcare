'use client'

import { Eye, EyeOff } from 'lucide-react'
import { InputHTMLAttributes, useState } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  showPasswordToggle?: boolean
  showError?: boolean
}

export function FormInput({
  label,
  error,
  showPasswordToggle = false,
  showError = true,
  type = 'text',
  className = '',
  ...props
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-semibold mb-2 text-[#20211F] dark:text-[#F1F1ED]"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={inputType}
          className={`w-full h-12 px-3.5 rounded-[10px] border border-[#D1D2CC] dark:border-white/14 bg-white dark:bg-[#242523] text-[#20211F] dark:text-[#F1F1ED] placeholder-[#676964] dark:placeholder-[#B7B8B2] transition-colors duration-150 text-[15px] font-medium focus:outline-none focus:border-[#D85F53] focus:ring-3 focus:ring-[#D85F53]/30 dark:focus:border-[#EF7569] dark:focus:ring-[#EF7569]/30 ${
          error
            ? 'border-[#DC2626] dark:border-[#F87171] focus:border-[#DC2626] focus:ring-[#DC2626]/30 dark:focus:border-[#F87171] dark:focus:ring-[#F87171]/30'
            : ''
        } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />

        {/* Password visibility toggle */}
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#676964] dark:text-[#B7B8B2] hover:text-[#20211F] dark:hover:text-[#F1F1ED] transition-colors p-1"
            aria-label={
              showPassword ? 'Hide password' : 'Show password'
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>

      {error && showError && (
        <p
          id={`${props.id}-error`}
          className="mt-2 text-sm font-normal text-[#DC2626] dark:text-[#F87171]"
        >
          {error}
        </p>
      )}
    </div>
  )
}
