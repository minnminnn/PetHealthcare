"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";
import Link from "next/link";

export interface DockItem {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number;
}

interface MagnificationDockProps {
  items: DockItem[];
  className?: string;
}

const MAGNIFICATION = 2.5; // max scale factor
const DISTANCE = 80;       // px influence radius

export function MagnificationDock({ items, className = "" }: MagnificationDockProps) {
  const mouseX = useMotionValue(Infinity);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => { mouseX.set(Infinity); setHoveredId(null); }}
      className={`flex items-end justify-center gap-3 px-6 py-4 
        bg-white/80 backdrop-blur-xl border border-slate-200/60 
        rounded-2xl shadow-glass ${className}`}
    >
      {items.map((item) => (
        <DockIcon
          key={item.id}
          item={item}
          mouseX={mouseX}
          isHovered={hoveredId === item.id}
          onHover={(id) => setHoveredId(id)}
        />
      ))}
    </motion.div>
  );
}

interface DockIconProps {
  item: DockItem;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}

function DockIcon({ item, mouseX, isHovered, onHover }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Smooth spring physics for fluid animation
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(
    distance,
    [-DISTANCE * 1.5, 0, DISTANCE * 1.5],
    [44, 44 * MAGNIFICATION, 44]
  );

  const heightTransform = useTransform(
    distance,
    [-DISTANCE * 1.5, 0, DISTANCE * 1.5],
    [44, 44 * MAGNIFICATION, 44]
  );

  // 3D lift effect on hover
  const yTransform = useTransform(
    distance,
    [-DISTANCE, 0, DISTANCE],
    [0, -16, 0]
  );

  const width = useSpring(widthTransform, { mass: 0.08, stiffness: 600, damping: 28 });
  const height = useSpring(heightTransform, { mass: 0.08, stiffness: 600, damping: 28 });
  const y = useSpring(yTransform, { mass: 0.08, stiffness: 600, damping: 28 });

  const content = (
    <motion.div
      ref={ref}
      style={{ width, height, y }}
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
      onClick={item.onClick}
      className="relative flex items-center justify-center 
        bg-gradient-to-br from-slate-50 to-slate-100 
        border border-slate-200 rounded-2xl cursor-pointer
        hover:border-primary-300 hover:from-primary-50 hover:to-primary-100
        transition-colors duration-150 group
        shadow-card hover:shadow-medical"
      whileTap={{ scale: 0.92 }}
    >
      {/* Icon */}
      <div className="text-slate-600 group-hover:text-primary-700 transition-colors">
        {item.icon}
      </div>

      {/* Badge */}
      {item.badge !== undefined && item.badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emergency text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
          {item.badge > 9 ? "9+" : item.badge}
        </span>
      )}

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 4, scale: 0.92 }}
        animate={isHovered ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 4, scale: 0.92 }}
        transition={{ duration: 0.12 }}
        className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none z-10"
      >
        {item.label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </motion.div>
    </motion.div>
  );

  if (item.href) {
    return <Link href={item.href}>{content}</Link>;
  }

  return content;
}
