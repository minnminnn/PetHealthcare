'use client'

import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  isLoading?: boolean
}

export function SubmitButton({
  children,
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`w-full h-12 rounded-[10px] bg-[#D85F53] hover:bg-[#B9473E] dark:bg-[#EF7569] dark:hover:bg-[#F18A80] text-[#1A1B19] dark:text-[#1A1B19] font-semibold text-[15px] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed hover:disabled:translate-y-0 hover:translate-y-px flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
