'use client'

import { Heart, Stethoscope } from 'lucide-react'

interface AccountType {
  id: string
  label: string
  description: string
  icon: React.ReactNode
}

interface AccountTypeSelectorProps {
  value: string
  onChange: (value: string) => void
  types: AccountType[]
}

export function AccountTypeSelector({
  value,
  onChange,
  types,
}: AccountTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      {types.map((type) => (
        <button
          key={type.id}
          type="button"
          onClick={() => onChange(type.id)}
          className={`p-4 rounded-[12px] border-2 transition-all duration-150 text-left ${
            value === type.id
              ? 'border-[#D85F53] dark:border-[#EF7569] bg-[#FFE4DF] dark:bg-[rgba(239,117,105,0.14)]'
              : 'border-[#D1D2CC] dark:border-white/14 hover:border-[#D85F53]/50 dark:hover:border-[#EF7569]/50'
          }`}
          aria-pressed={value === type.id}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex-shrink-0 ${
                value === type.id
                  ? 'text-[#D85F53] dark:text-[#EF7569]'
                  : 'text-[#676964] dark:text-[#B7B8B2]'
              }`}
            >
              {type.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-[#20211F] dark:text-[#F1F1ED]">
                {type.label}
              </div>
              <div className="text-xs text-[#676964] dark:text-[#B7B8B2] mt-1 line-clamp-2">
                {type.description}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
