'use client'

import Image from 'next/image'
import { ReactNode, useEffect, useState } from 'react'

interface AuthShellProps {
  children: ReactNode
  imageSrc?: string
  imageAlt?: string
  tagline?: ReactNode
}

export function AuthShell({
  children,
  imageSrc = '/images/petcare-consultation.png',
  imageAlt = 'PetCare consultation',
  tagline = 'Chăm sóc rõ ràng, từ lần khám đầu tiên.',
}: AuthShellProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="min-h-screen bg-[#F3F3F0] dark:bg-[#171816] text-[#20211F] dark:text-[#F1F1ED]">
      <div className="flex min-h-screen max-w-7xl mx-auto gap-6 lg:gap-8">
        {/* Visual panel - hidden on mobile, 44% on desktop */}
        <div className="hidden lg:flex flex-col flex-1 relative">
          <div className="relative flex-1 rounded-2xl overflow-hidden">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover"
              priority
            />
            {/* Subtle dark overlay for text contrast */}
            <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />

            {/* Content positioned at top-left and bottom */}
            <div className="absolute inset-0 flex flex-col justify-between p-8">
              {/* Top - Brand mark */}
              <div className="text-sm font-semibold text-white drop-shadow-md">
                PetCare
              </div>

              {/* Bottom - Tagline */}
              <div className="text-base font-normal text-white drop-shadow-md leading-relaxed">
                {tagline}
              </div>
            </div>
          </div>
        </div>

        {/* Form panel - 100% on mobile, 56% on desktop */}
        <div className="w-full lg:flex-1 flex items-center justify-center py-16 lg:py-0">
          <div
            className={`w-full max-w-md transition-all duration-300 ${
              mounted
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
            }`}
            style={{
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Mobile-only brand mark */}
            <div className="lg:hidden mb-8 text-sm font-semibold">PetCare</div>

            {/* Form content */}
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
