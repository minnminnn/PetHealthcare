"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Phone,
  Navigation,
  X,
  Loader2,
  Bot,
} from "lucide-react";
import { api } from "@/trpc/react";

interface NearbyClinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  status: string;
  distanceKm: number;
  mapsUrl: string;
  callUrl: string;
  logoUrl: string | null;
}

export function SOSButton() {
  const t = useTranslations("sos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showTriageChat, setShowTriageChat] = useState(false);

  // Query nearest emergency clinics once coords are available
  const { data: nearbyClinics, isLoading: clinicsLoading } =
    api.emergency.getNearestClinics.useQuery(
      { lat: coords?.lat ?? 0, lng: coords?.lng ?? 0 },
      { enabled: !!coords },
    );

  // Get user location when modal opens
  const handleSOSClick = () => {
    setIsModalOpen(true);
    setIsLocating(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError(t("geoError"));
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      () => {
        setGeoError(t("geoError"));
        setIsLocating(false);
        // Fallback to Hanoi center
        setCoords({ lat: 21.0285, lng: 105.8342 });
      },
      { timeout: 8000, maximumAge: 60000 },
    );
  };

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  return (
    <>
      {/* ── Floating SOS Button ─────────────────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        <motion.button
          onClick={handleSOSClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex h-12 w-12 items-center justify-center gap-2.5 rounded-xl bg-emergency text-sm font-bold text-white shadow-emergency transition-all duration-200 hover:shadow-xl sm:w-auto sm:px-5"
          aria-label="SOS Emergency"
          id="sos-emergency-btn"
        >
          {/* Pulse rings */}
          <span className="absolute inset-0 rounded-xl bg-emergency animate-pulse-ring opacity-60" />
          <span className="absolute inset-0 rounded-xl bg-emergency animate-pulse-ring opacity-40 [animation-delay:0.4s]" />

          {/* Icon + Label */}
          <div className="relative flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 animate-pulse-dot" />
            <span className="hidden tracking-wide sm:inline">SOS</span>
          </div>
        </motion.button>
      </div>

      {/* ── SOS Modal ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 24, stiffness: 400 }}
              className="fixed inset-x-4 bottom-4 sm:inset-auto sm:bottom-8 sm:right-8 sm:w-[420px] z-50 bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-emergency p-6 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <AlertTriangle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-xl leading-tight">
                        {t("title")}
                      </h2>
                      <p className="text-red-100 text-sm mt-0.5">
                        {isLocating
                          ? "Đang định vị..."
                          : coords
                            ? "Đã xác định vị trí"
                            : t("subtitle")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setShowTriageChat(false)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                      !showTriageChat
                        ? "bg-white text-red-600"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    <Navigation
                      className="mr-1.5 inline h-4 w-4"
                      aria-hidden="true"
                    />
                    Phòng khám
                  </button>
                  <button
                    onClick={() => setShowTriageChat(true)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                      showTriageChat
                        ? "bg-white text-red-600"
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    <Bot className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
                    AI Sơ cứu
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!showTriageChat ? (
                  <>
                    {/* Loading state */}
                    {(isLocating || clinicsLoading) && (
                      <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                        <p className="text-sm text-slate-500">{t("loading")}</p>
                      </div>
                    )}

                    {/* Geo error */}
                    {geoError && !clinicsLoading && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                        <AlertTriangle
                          className="mr-1.5 inline h-4 w-4"
                          aria-hidden="true"
                        />
                        {geoError}
                      </div>
                    )}

                    {/* Clinic cards */}
                    {nearbyClinics?.map((clinic, idx) => (
                      <motion.div
                        key={clinic.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-red-600">
                              #{idx + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-800 text-sm leading-tight">
                                {clinic.name}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {clinic.address}
                              </p>
                            </div>
                          </div>
                          <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold flex-shrink-0">
                            {clinic.distanceKm} km
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <a
                            href={clinic.callUrl}
                            className="flex-1 flex items-center justify-center gap-2 bg-emergency text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            Gọi ngay
                          </a>
                          <a
                            href={clinic.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors"
                          >
                            <Navigation className="w-4 h-4" />
                            Chỉ đường
                          </a>
                        </div>
                      </motion.div>
                    ))}

                    {nearbyClinics?.length === 0 && !clinicsLoading && (
                      <div className="text-center py-10 text-slate-500 text-sm">
                        <p>Không tìm thấy phòng khám 24/7 trong khu vực.</p>
                        <p className="mt-1">
                          Hãy gọi đường dây khẩn cấp thú y:{" "}
                          <strong>1900 xxxx</strong>
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <AITriagePanel />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── AI Triage Panel ─────────────────────────────────────────────────────────

function AITriagePanel() {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "Tôi là trợ lý sơ cứu khẩn cấp. Hãy mô tả tình trạng của thú cưng để tôi hướng dẫn bạn ngay.\n\n**Lưu ý:** Đây là hướng dẫn sơ cứu tạm thời. Hãy đến phòng khám thú y NGAY LẬP TỨC!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: messages }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: accumulated,
          };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "❌ Lỗi kết nối. Vui lòng gọi trực tiếp đến phòng khám khẩn cấp.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-[340px]">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-primary-600 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              }`}
            >
              {msg.role === "assistant" && (
                <Bot className="w-3.5 h-3.5 inline mr-1.5 text-primary-600 -mt-0.5" />
              )}
              {msg.content}
              {isStreaming &&
                idx === messages.length - 1 &&
                msg.role === "assistant" && (
                  <span className="inline-block w-1.5 h-4 bg-primary-400 ml-1 animate-pulse rounded-sm" />
                )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Mô tả tình trạng thú cưng..."
          className="flex-1 px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"
          disabled={isStreaming}
        />
        <button
          onClick={sendMessage}
          disabled={isStreaming || !input.trim()}
          className="px-4 py-2.5 bg-emergency text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-red-600 transition-colors"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
