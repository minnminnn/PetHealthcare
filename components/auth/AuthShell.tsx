"use client";

import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";

interface AuthShellProps {
  children: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  tagline?: ReactNode;
  contentClassName?: string;
}

export function AuthShell({
  children,
  imageSrc = "/images/petcare-consultation.png",
  imageAlt = "PetCare consultation",
  tagline = "Chăm sóc rõ ràng, từ lần khám đầu tiên.",
  contentClassName = "max-w-md",
}: AuthShellProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-[100dvh] bg-[#F3F3F0] text-[#20211F] dark:bg-[#171816] dark:text-[#F1F1ED]">
      <div className="mx-auto flex min-h-[100dvh] max-w-7xl gap-8 px-5 py-5 sm:px-8 lg:px-10 lg:py-10 2xl:px-0">
        {/* Visual panel - hidden on mobile, 44% on desktop */}
        <div className="relative hidden flex-1 flex-col lg:flex">
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
        <div className="flex w-full items-center justify-center py-7 sm:py-12 lg:flex-1 lg:py-0">
          <div
            className={`w-full ${contentClassName} transition-all duration-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            style={{
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Mobile-only brand mark */}
            <div className="mb-8 text-sm font-semibold tracking-tight lg:hidden">
              PetCare
            </div>

            {/* Form content */}
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
