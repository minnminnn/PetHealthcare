"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Phone, Skull, FlaskConical } from "lucide-react";

interface ToxicSubstance {
  id: string;
  name: string;
  toxicFor: string[];
  severity: "mild" | "moderate" | "severe" | "lethal";
  symptoms: string[];
  firstAidSteps: string[];
  antidote: string | null;
}

interface ToxicAlertModalProps {
  substance: ToxicSubstance | null;
  species?: string;
  onClose: () => void;
}

const SEVERITY_CONFIG = {
  lethal: {
    color: "bg-red-700",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    label: "CỰC ĐỘC — GÂY TỬ VONG",
    icon: Skull,
    pulse: true,
  },
  severe: {
    color: "bg-orange-600",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    label: "NGUY HIỂM — Độc tính cao",
    icon: AlertTriangle,
    pulse: true,
  },
  moderate: {
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    label: "THẬN TRỌNG — Độc tính vừa",
    icon: AlertTriangle,
    pulse: false,
  },
  mild: {
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "NHẸ — Cần theo dõi",
    icon: FlaskConical,
    pulse: false,
  },
};

const SPECIES_LABELS: Record<string, string> = {
  CAT: "Mèo",
  DOG: "Chó",
  RABBIT: "Thỏ",
  HAMSTER: "Hamster",
  BIRD: "Chim",
  REPTILE: "Bò sát",
};

export function ToxicAlertModal({ substance, species, onClose }: ToxicAlertModalProps) {
  if (!substance) return null;

  const config = SEVERITY_CONFIG[substance.severity] ?? SEVERITY_CONFIG.moderate;
  const SeverityIcon = config.icon;

  const speciesLabels = substance.toxicFor.map((s) => SPECIES_LABELS[s] ?? s).join(", ");

  return (
    <AnimatePresence>
      {substance && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: "spring", damping: 22, stiffness: 350 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 sm:w-[540px] z-50 bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Alert Header */}
            <div className={`${config.color} p-6 flex-shrink-0`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center ${config.pulse ? "animate-pulse-dot" : ""}`}>
                    <SeverityIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-white/80 text-xs font-semibold tracking-widest uppercase">
                      ⚠ CẢNH BÁO ĐỘC CHẤT
                    </div>
                    <h2 className="text-white font-bold text-xl mt-0.5">{substance.name}</h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* Severity + Species Banner */}
              <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-2xl p-4`}>
                <div className={`font-bold text-sm ${config.textColor} mb-1`}>
                  {config.label}
                </div>
                <p className={`text-sm font-semibold ${config.textColor}`}>
                  Tuyệt đối chống chỉ định cho: <span className="underline">{speciesLabels}</span>
                </p>
                {species && (
                  <p className={`text-xs mt-1 ${config.textColor} opacity-80`}>
                    Đặc biệt nguy hiểm cho: <strong>{SPECIES_LABELS[species] ?? species}</strong>
                  </p>
                )}
              </div>

              {/* Symptoms */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center text-red-600 text-xs">!</span>
                  Triệu chứng ngộ độc
                </h3>
                <ul className="space-y-1.5">
                  {substance.symptoms.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">▸</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* First Aid Steps */}
              <div>
                <h3 className="font-bold text-slate-800 mb-2.5 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 text-xs">✓</span>
                  Hướng dẫn sơ cứu khẩn cấp
                </h3>
                <ol className="space-y-2">
                  {substance.firstAidSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-slate-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Antidote */}
              {substance.antidote && (
                <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-4">
                  <div className="text-xs font-semibold text-secondary-700 uppercase tracking-wide mb-1">
                    Thuốc giải độc
                  </div>
                  <p className="text-sm text-slate-700">{substance.antidote}</p>
                </div>
              )}

              {/* Legal disclaimer */}
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 leading-relaxed">
                ⚠️ Thông tin chỉ mang tính tham khảo sơ cứu. Đây không phải tư vấn y tế chuyên nghiệp.
                Luôn liên hệ bác sĩ thú y ngay lập tức trong mọi trường hợp ngộ độc nghi ngờ.
              </div>
            </div>

            {/* CTA Footer */}
            <div className="flex-shrink-0 p-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => window.location.href = "tel:1900xxxx"}
                className="flex-1 btn-emergency text-sm justify-center"
              >
                <Phone className="w-4 h-4" />
                Gọi cấp cứu thú y
              </button>
              <button onClick={onClose} className="flex-1 btn-outline text-sm justify-center">
                Đóng
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
