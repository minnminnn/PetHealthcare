import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // ─── Medical Blue (Primary) ───────────────────────────────────────────
        primary: {
          DEFAULT: "#0284C7",
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E",
          950: "#082F49",
          foreground: "#FFFFFF",
        },
        // ─── Clinical Teal / Soft Mint (Secondary) ────────────────────────────
        secondary: {
          DEFAULT: "#0D9488",
          50: "#F0FDFA",
          100: "#CCFBF1",
          200: "#99F6E4",
          300: "#5EEAD4",
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
          700: "#0F766E",
          800: "#115E59",
          900: "#134E4A",
          foreground: "#FFFFFF",
        },
        // ─── Emergency Red ────────────────────────────────────────────────────
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        emergency: {
          DEFAULT: "#EF4444",
          dark: "#DC2626",
          light: "#FEE2E2",
        },
        // ─── Background Surfaces ──────────────────────────────────────────────
        background: "#FFFFFF",
        "background-secondary": "#F8FAFC",
        surface: "#F1F5F9",
        // ─── shadcn/ui semantic tokens ────────────────────────────────────────
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "70%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        "pulse-dot": {
          "0%": { transform: "scale(0.8)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(0.8)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px #0284C780" },
          "50%": { boxShadow: "0 0 20px #0284C7, 0 0 40px #0284C740" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-medical":
          "linear-gradient(135deg, #0284C7 0%, #0369A1 50%, #0D9488 100%)",
        "gradient-emergency":
          "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
        "gradient-surface":
          "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
        "gradient-card":
          "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)",
      },
      boxShadow: {
        medical: "0 4px 24px rgba(2, 132, 199, 0.15)",
        "medical-lg": "0 8px 40px rgba(2, 132, 199, 0.2)",
        emergency: "0 4px 24px rgba(239, 68, 68, 0.35)",
        card: "0 2px 16px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 8px 32px rgba(15, 23, 42, 0.12)",
        glass: "0 8px 32px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
