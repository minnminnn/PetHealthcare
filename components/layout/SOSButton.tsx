"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle,
  Bot,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Send,
  X,
} from "lucide-react";
import { api } from "@/trpc/react";

export function SOSButton() {
  const t = useTranslations("sos");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showTriageChat, setShowTriageChat] = useState(false);

  const { data: nearbyClinics, isLoading: clinicsLoading } =
    api.emergency.getNearestClinics.useQuery(
      { lat: coords?.lat ?? 0, lng: coords?.lng ?? 0 },
      { enabled: Boolean(coords) },
    );

  const closeModal = () => setIsModalOpen(false);

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
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setGeoError(t("geoError"));
        setIsLocating(false);
        setCoords(null);
      },
      { timeout: 8000, maximumAge: 60000 },
    );
  };

  useEffect(() => {
    if (!isModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  const panelMotion = reduceMotion
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 28, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 18, scale: 0.98 },
      };

  return (
    <>
      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 sm:bottom-6 sm:right-6">
        <motion.button
          id="sos-emergency-btn"
          type="button"
          onClick={handleSOSClick}
          whileHover={reduceMotion ? undefined : { y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          aria-label={t("button")}
          className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#8f342e] bg-[#b9473e] px-3.5 text-sm font-semibold text-[#fff9f7] shadow-[0_12px_30px_rgba(99,35,30,0.24)] outline-none transition-colors hover:bg-[#a13d35] focus-visible:ring-2 focus-visible:ring-[#b9473e] focus-visible:ring-offset-2 sm:px-4"
        >
          <AlertTriangle
            className="h-[18px] w-[18px]"
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="hidden whitespace-nowrap sm:inline">
            {t("button")}
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.button
              type="button"
              aria-label={t("close")}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-50 cursor-default bg-[#151614]/72 backdrop-blur-[2px]"
            />

            <motion.section
              {...panelMotion}
              transition={{ type: "spring", damping: 28, stiffness: 360 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="sos-dialog-title"
              className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-[#f8f8f5] text-[#20211f] shadow-[0_28px_80px_rgba(16,17,15,0.34)] dark:border-white/10 dark:bg-[#20211f] dark:text-[#f1f1ed] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[440px]"
            >
              <div className="h-1 shrink-0 bg-[#b9473e] dark:bg-[#ef7569]" />

              <header className="shrink-0 border-b border-black/10 px-5 pb-4 pt-5 dark:border-white/10 sm:px-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eee0dc] text-[#b9473e] dark:bg-[#3c2926] dark:text-[#ef7569]">
                    <AlertTriangle
                      className="h-5 w-5"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2
                      id="sos-dialog-title"
                      className="text-lg font-semibold leading-tight tracking-[-0.025em] sm:text-xl dark:text-[#f1f1ed]"
                    >
                      {t("title")}
                    </h2>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs leading-5 text-[#686963] dark:text-[#b6b7b2]">
                      <LocateFixed
                        className="h-3.5 w-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      {isLocating
                        ? t("locating")
                        : coords
                          ? t("located")
                          : t("subtitle")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label={t("close")}
                    className="-mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 text-[#686963] transition-colors hover:bg-black/[0.04] hover:text-[#20211f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9473e] dark:border-white/10 dark:text-[#b6b7b2] dark:hover:bg-white/[0.06] dark:hover:text-[#f1f1ed]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div
                  role="tablist"
                  aria-label={t("modeLabel")}
                  className="mt-5 grid grid-cols-2 rounded-xl bg-black/[0.045] p-1 dark:bg-white/[0.06]"
                >
                  <ModeButton
                    active={!showTriageChat}
                    onClick={() => setShowTriageChat(false)}
                    icon={Navigation}
                    label={t("clinicsTab")}
                  />
                  <ModeButton
                    active={showTriageChat}
                    onClick={() => setShowTriageChat(true)}
                    icon={Bot}
                    label={t("triageTab")}
                  />
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                {!showTriageChat ? (
                  <div className="space-y-3">
                    {(isLocating || clinicsLoading) && <ClinicSkeleton />}

                    {geoError && !clinicsLoading && (
                      <div className="flex gap-3 rounded-xl border border-[#b9473e]/25 bg-[#eee0dc] p-4 text-sm leading-6 text-[#7c302b] dark:bg-[#3c2926] dark:text-[#f2aaa3]">
                        <AlertTriangle
                          className="mt-0.5 h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                        <p>{geoError}</p>
                      </div>
                    )}

                    {!isLocating &&
                      !clinicsLoading &&
                      nearbyClinics?.map((clinic) => (
                        <motion.article
                          key={clinic.id}
                          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border border-black/10 bg-white/55 p-4 dark:border-white/10 dark:bg-white/[0.035]"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 text-[#b9473e] dark:border-white/10 dark:text-[#ef7569]">
                              <MapPin className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="text-sm font-semibold leading-5">
                                  {clinic.name}
                                </h3>
                                <span className="shrink-0 text-xs font-semibold text-[#686963] dark:text-[#b6b7b2]">
                                  {t("distance", {
                                    distance: clinic.distanceKm,
                                  })}
                                </span>
                              </div>
                              <p className="mt-1 text-xs leading-5 text-[#686963] dark:text-[#b6b7b2]">
                                {clinic.address}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                            <a
                              href={clinic.callUrl}
                              className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#b9473e] px-4 text-sm font-semibold text-[#fff9f7] transition-colors hover:bg-[#a13d35] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9473e] dark:bg-[#ef7569] dark:text-[#151614]"
                            >
                              <Phone className="h-4 w-4" aria-hidden="true" />
                              {t("call")}
                            </a>
                            <a
                              href={clinic.mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-black/10 px-4 text-sm font-semibold transition-colors hover:bg-black/[0.04] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9473e] dark:border-white/10 dark:hover:bg-white/[0.06]"
                            >
                              <Navigation
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                              {t("directions")}
                            </a>
                          </div>
                        </motion.article>
                      ))}

                    {nearbyClinics?.length === 0 &&
                      !isLocating &&
                      !clinicsLoading && (
                        <div className="px-5 py-10 text-center">
                          <MapPin
                            className="mx-auto h-6 w-6 text-[#b9473e] dark:text-[#ef7569]"
                            aria-hidden="true"
                          />
                          <h3 className="mt-4 text-sm font-semibold">
                            {t("emptyTitle")}
                          </h3>
                          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#686963] dark:text-[#b6b7b2]">
                            {t("emptyBody")}
                          </p>
                        </div>
                      )}
                  </div>
                ) : (
                  <AITriagePanel
                    coords={coords}
                    locale={locale === "en" ? "en" : "vi"}
                  />
                )}
              </div>
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Navigation;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#b9473e] ${
        active
          ? "bg-[#f8f8f5] text-[#20211f] shadow-[0_1px_2px_rgba(32,33,31,0.08)] dark:bg-[#343531] dark:text-[#f1f1ed]"
          : "text-[#686963] hover:text-[#20211f] dark:text-[#b6b7b2] dark:hover:text-[#f1f1ed]"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

function ClinicSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1].map((item) => (
        <div
          key={item}
          className="rounded-xl border border-black/10 p-4 dark:border-white/10"
        >
          <div className="flex gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-black/[0.06] motion-reduce:animate-none dark:bg-white/[0.08]" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 w-3/5 animate-pulse rounded bg-black/[0.07] motion-reduce:animate-none dark:bg-white/[0.09]" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-black/[0.05] motion-reduce:animate-none dark:bg-white/[0.07]" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="h-11 animate-pulse rounded-xl bg-black/[0.06] motion-reduce:animate-none dark:bg-white/[0.08]" />
            <div className="h-11 animate-pulse rounded-xl bg-black/[0.04] motion-reduce:animate-none dark:bg-white/[0.06]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AITriagePanel({
  coords,
  locale,
}: {
  coords: { lat: number; lng: number } | null;
  locale: "vi" | "en";
}) {
  const t = useTranslations("sos");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([{ role: "assistant", content: t("triageIntro") }]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const requestController = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      requestController.current?.abort();
    },
    [],
  );

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((current) => [
      ...current,
      { role: "user", content: userMessage },
    ]);
    setIsStreaming(true);

    try {
      requestController.current?.abort();
      const controller = new AbortController();
      requestController.current = controller;
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          locale,
          location: coords
            ? { latitude: coords.lat, longitude: coords.lng }
            : undefined,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`PetCare AI request failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      setMessages((current) => [
        ...current,
        { role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });

        setMessages((current) => {
          const updated = [...current];
          updated[updated.length - 1] = {
            role: "assistant",
            content: accumulated,
          };
          return updated;
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessages((current) => [
        ...current,
        { role: "assistant", content: t("triageError") },
      ]);
    } finally {
      requestController.current = null;
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex min-h-[360px] flex-col">
      <div className="mb-3 flex gap-2.5 rounded-xl border border-[#b9473e]/20 bg-[#eee0dc] p-3 text-xs leading-5 text-[#7c302b] dark:bg-[#3c2926] dark:text-[#f2aaa3]">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>{t("triageWarning")}</p>
      </div>

      <div
        className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
        aria-live="polite"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] whitespace-pre-line rounded-xl px-3.5 py-2.5 text-sm leading-6 ${
                message.role === "user"
                  ? "bg-[#b9473e] text-[#fff9f7] dark:bg-[#ef7569] dark:text-[#151614]"
                  : "border border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/[0.04]"
              }`}
            >
              {message.role === "assistant" && (
                <Bot
                  className="mr-1.5 inline h-3.5 w-3.5 text-[#b9473e] dark:text-[#ef7569]"
                  aria-hidden="true"
                />
              )}
              <AIMessageContent content={message.content} />
              {isStreaming &&
                index === messages.length - 1 &&
                message.role === "assistant" && (
                  <span className="ml-1 inline-block h-3.5 w-1 animate-pulse rounded-sm bg-[#b9473e] motion-reduce:animate-none dark:bg-[#ef7569]" />
                )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-black/10 pt-4 dark:border-white/10">
        <label htmlFor="sos-triage-input" className="text-xs font-semibold">
          {t("triagePrompt")}
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="sos-triage-input"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && sendMessage()}
            placeholder={t("inputPlaceholder")}
            disabled={isStreaming}
            maxLength={4000}
            className="min-w-0 flex-1 rounded-xl border border-black/15 bg-white/60 px-3.5 py-2.5 text-sm outline-none placeholder:text-[#777872] focus:border-[#b9473e] focus:ring-2 focus:ring-[#b9473e]/15 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/15 dark:bg-white/[0.04] dark:placeholder:text-[#92938d]"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            aria-label={t("send")}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#b9473e] text-[#fff9f7] transition-colors hover:bg-[#a13d35] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9473e] disabled:cursor-not-allowed disabled:opacity-45 dark:bg-[#ef7569] dark:text-[#151614]"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AIMessageContent({ content }: { content: string }) {
  return (
    <>
      {content.split("\n").map((line, lineIndex) => (
        <span key={`${lineIndex}-${line.slice(0, 12)}`} className="block min-h-3">
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={partIndex}>{part.slice(2, -2)}</strong>
            ) : (
              part
            ),
          )}
        </span>
      ))}
    </>
  );
}
