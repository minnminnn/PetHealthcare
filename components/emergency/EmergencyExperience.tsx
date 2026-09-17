"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  AlertTriangle,
  ArrowRight,
  Bone,
  Brain,
  ChevronRight,
  Clock3,
  Droplets,
  HeartPulse,
  MapPin,
  MessageCircle,
  PackageOpen,
  Phone,
  ShieldAlert,
  Siren,
  Thermometer,
  Wind,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/lib/navigation";
import { api } from "@/trpc/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Locale = "vi" | "en";

interface FirstAidTip {
  id: string;
  icon: LucideIcon;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  action: Record<Locale, string>;
}

const FIRST_AID_TIPS: FirstAidTip[] = [
  {
    id: "bleeding",
    icon: Droplets,
    title: { vi: "Chảy máu", en: "Bleeding" },
    description: {
      vi: "Ép liên tục bằng vải sạch và hạn chế di chuyển.",
      en: "Apply continuous pressure with a clean cloth and limit movement.",
    },
    action: {
      vi: "Không nhấc vải lên để kiểm tra liên tục. Đưa thú cưng đến phòng khám ngay.",
      en: "Do not repeatedly lift the cloth to check. Travel to a clinic immediately.",
    },
  },
  {
    id: "poison",
    icon: PackageOpen,
    title: { vi: "Nghi ngộ độc", en: "Possible poisoning" },
    description: {
      vi: "Giữ lại bao bì hoặc mẫu chất mà thú cưng đã tiếp xúc.",
      en: "Keep the packaging or a sample of the substance involved.",
    },
    action: {
      vi: "Không tự gây nôn hoặc cho ăn. Gọi phòng khám để nhận hướng dẫn ngay.",
      en: "Do not induce vomiting or give food. Call a clinic for immediate guidance.",
    },
  },
  {
    id: "breathing",
    icon: Wind,
    title: { vi: "Khó thở", en: "Breathing difficulty" },
    description: {
      vi: "Tháo vòng cổ, giữ cổ thẳng và tránh đè lên lồng ngực.",
      en: "Remove the collar, keep the neck straight, and avoid chest pressure.",
    },
    action: {
      vi: "Giữ môi trường thoáng và di chuyển đến phòng khám ngay lập tức.",
      en: "Keep the area ventilated and travel to a clinic immediately.",
    },
  },
  {
    id: "fracture",
    icon: Bone,
    title: { vi: "Chấn thương", en: "Trauma or fracture" },
    description: {
      vi: "Hạn chế cử động và di chuyển trên bề mặt phẳng, chắc chắn.",
      en: "Limit movement and transport on a flat, firm surface.",
    },
    action: {
      vi: "Không cố nắn lại xương hoặc ép thú cưng đứng dậy.",
      en: "Do not straighten a limb or force your pet to stand.",
    },
  },
  {
    id: "heat",
    icon: Thermometer,
    title: { vi: "Quá nóng", en: "Heat illness" },
    description: {
      vi: "Đưa thú cưng đến nơi mát và dùng nước mát, không dùng nước đá.",
      en: "Move your pet to a cool area and use cool water, not ice.",
    },
    action: {
      vi: "Làm mát nhẹ ở bàn chân và bụng trong khi đến phòng khám.",
      en: "Cool the paws and abdomen gently while travelling to a clinic.",
    },
  },
  {
    id: "seizure",
    icon: Brain,
    title: { vi: "Co giật", en: "Seizure" },
    description: {
      vi: "Dọn vật cứng xung quanh và ghi lại thời gian co giật.",
      en: "Clear hard objects nearby and record how long the seizure lasts.",
    },
    action: {
      vi: "Không giữ chặt hoặc đưa tay vào miệng. Gọi phòng khám ngay.",
      en: "Do not restrain your pet or put a hand in the mouth. Call a clinic now.",
    },
  },
];

const COPY = {
  vi: {
    home: "Trang chủ",
    page: "Khẩn cấp",
    eyebrow: "Hỗ trợ khẩn cấp 24/7",
    title: "Giữ bình tĩnh. Hành động ngay.",
    description: "Gọi hỗ trợ, tìm phòng khám đang trực và làm theo hướng dẫn tạm thời.",
    callHotline: "Gọi 1800 599 990",
    findClinic: "Tìm phòng khám",
    bentoTitle: "Ưu tiên an toàn khi di chuyển",
    bentoBody: "Giữ thú cưng yên, đảm bảo đường thở thông thoáng và gọi trước cho phòng khám.",
    noMedicineTitle: "Không dùng thuốc của người",
    noMedicineBody: "Một số thuốc phổ biến có thể gây độc nghiêm trọng cho thú cưng.",
    bringTitle: "Mang theo thông tin liên quan",
    bringBody: "Đem theo bao bì thuốc, chất nghi độc và hồ sơ điều trị nếu có.",
    clinicsTitle: "Phòng khám cấp cứu gần bạn",
    clinicsBody: "Thông tin chờ chỉ để tham khảo. Hãy gọi để xác nhận trước khi đến.",
    clinicsEmpty: "Cho phép truy cập vị trí để tìm phòng khám cấp cứu 24/7 đã xác minh gần bạn.",
    locating: "Đang xác định vị trí…",
    locationError: "Không thể truy cập vị trí. Hãy kiểm tra quyền vị trí trên trình duyệt.",
    open: "Đang trực",
    callNow: "Gọi ngay",
    directions: "Chỉ đường",
    guideTitle: "Sơ cứu trong lúc chờ hỗ trợ",
    guideBody: "Chọn tình trạng gần nhất và thực hiện các bước an toàn cơ bản.",
    temporary: "Hướng dẫn tạm thời",
    warningTitle: "Đây không phải chẩn đoán thú y",
    warningBody: "Nếu thú cưng bất tỉnh, khó thở, chảy máu nhiều hoặc nghi ngộ độc, hãy gọi và đến phòng khám ngay.",
    assistantTitle: "Cần hướng dẫn theo tình trạng cụ thể?",
    assistantBody: "Mô tả triệu chứng để nhận hướng dẫn sơ cứu trong khi bạn liên hệ phòng khám.",
    assistantCta: "Mở trợ lý sơ cứu",
  },
  en: {
    home: "Home",
    page: "Emergency",
    eyebrow: "Emergency support 24/7",
    title: "Stay calm. Act now.",
    description: "Call for help, find an open clinic, and follow temporary first-aid guidance.",
    callHotline: "Call 1800 599 990",
    findClinic: "Find a clinic",
    bentoTitle: "Prioritise safe transport",
    bentoBody: "Keep your pet still, maintain a clear airway, and call the clinic before travelling.",
    noMedicineTitle: "Do not give human medicine",
    noMedicineBody: "Some common medicines can be severely toxic to pets.",
    bringTitle: "Bring relevant information",
    bringBody: "Take medicine packaging, suspected toxins, and treatment records with you.",
    clinicsTitle: "Emergency clinics near you",
    clinicsBody: "Wait information is indicative only. Call the clinic to confirm before travelling.",
    clinicsEmpty: "Share your location to find the nearest verified 24/7 emergency clinics.",
    locating: "Finding your location…",
    locationError: "We could not access your location. Check your browser location permission.",
    open: "On duty",
    callNow: "Call now",
    directions: "Directions",
    guideTitle: "First aid while help is on the way",
    guideBody: "Choose the closest situation and follow the basic safety steps.",
    temporary: "Temporary guidance",
    warningTitle: "This is not a veterinary diagnosis",
    warningBody: "If your pet is unconscious, struggling to breathe, bleeding heavily, or possibly poisoned, call and travel immediately.",
    assistantTitle: "Need guidance for a specific situation?",
    assistantBody: "Describe the symptoms for first-aid guidance while you contact a clinic.",
    assistantCta: "Open first-aid assistant",
  },
} as const;

export function EmergencyExperience({ locale }: { locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [activeTip, setActiveTip] = useState(FIRST_AID_TIPS[0].id);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const copy = COPY[locale];
  const selectedTip =
    FIRST_AID_TIPS.find((tip) => tip.id === activeTip) ?? FIRST_AID_TIPS[0];
  const SelectedIcon = selectedTip.icon;
  const emergencyClinics = api.emergency.getNearestClinics.useQuery(
    { lat: coords?.lat ?? 0, lng: coords?.lng ?? 0, radiusKm: 50 },
    { enabled: coords !== null, staleTime: 30_000 },
  );

  const findNearbyClinics = () => {
    setLocationError("");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: position }) => {
        setCoords({ lat: position.latitude, lng: position.longitude });
        setIsLocating(false);
        window.setTimeout(
          () => document.getElementById("emergency-clinics")?.scrollIntoView({ behavior: "smooth" }),
          100,
        );
      },
      () => {
        setLocationError(copy.locationError);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 },
    );
  };

  // useGSAP(
  //   () => {
  //     if (reduceMotion) return;

  //     gsap.fromTo(
  //       "[data-emergency-hero] > *",
  //       { opacity: 0, y: 24 },
  //       { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, ease: "power3.out" },
  //     );

  //     gsap.fromTo(
  //       "[data-emergency-image]",
  //       { scale: 0.82, opacity: 0.45 },
  //       {
  //         scale: 1,
  //         opacity: 1,
  //         ease: "none",
  //         scrollTrigger: {
  //           trigger: "[data-safety-grid]",
  //           start: "top 90%",
  //           end: "bottom 30%",
  //           scrub: 0.8,
  //         },
  //       },
  //     );

  //   },
  //   { scope: root, dependencies: [reduceMotion], revertOnUpdate: true },
  // );

  const openAssistant = () => {
    document.getElementById("sos-emergency-btn")?.click();
  };

  return (
    <main
      ref={root}
      className="w-full max-w-full overflow-x-hidden bg-[#f3f3f0] text-[#20211f] dark:bg-[#171816] dark:text-[#f1f1ed]"
    >
      <section className="px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto min-h-[calc(100dvh-7rem)] max-w-7xl overflow-hidden rounded-2xl bg-[#deded8] dark:bg-[#242523]">
          <div className="grid min-h-[inherit] lg:grid-cols-[1.05fr_.95fr]">
            <div
              data-emergency-hero
              className="flex flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12"
            >
              {/* <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-2 text-sm text-[#676964] dark:text-[#b7b8b2]"
              >
                <Link
                  href="/"
                  className="transition-colors hover:text-[#b9473e] dark:hover:text-[#ef7569]"
                >
                  {copy.home}
                </Link>
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                <span className="font-semibold text-[#20211f] dark:text-[#f1f1ed]">
                  {copy.page}
                </span>
              </nav> */}

              <div className="my-14 lg:my-10">
                <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-[#b9473e] dark:text-[#ef7569]">
                  {copy.eyebrow}
                </p>
                <h1 className="max-w-5xl text-balance text-[clamp(2.75rem,5.2vw,5rem)] font-medium leading-[0.98] tracking-[-0.055em] text-[#20211f] dark:text-[#f1f1ed]">
                  {copy.title}
                </h1>
                <p className="mt-6 max-w-lg text-base leading-relaxed text-[#5d5f59] dark:text-[#c6c7c0] sm:text-lg">
                  {copy.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href="tel:1800599990"
                  id="emergency-call-btn"
                  className="inline-flex min-h-14 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-[#d85f53] px-6 text-base font-bold text-[#1a1b19]  transition hover:-translate-y-0.5 hover:bg-[#ef7569] active:translate-y-px"
                >
                  <Phone className="h-5 w-5" strokeWidth={1.9} />
                  {copy.callHotline}
                </a>
                <button
                  type="button"
                  onClick={findNearbyClinics}
                  disabled={isLocating}
                  className="inline-flex min-h-14 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl border border-[#a9aaa4] px-6 text-base font-bold text-[#393a37] transition hover:border-[#b9473e] hover:text-[#b9473e] active:translate-y-px dark:border-white/20 dark:text-[#e7e7e2] dark:hover:border-[#ef7569] dark:hover:text-[#ef7569]"
                >
                  {isLocating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <MapPin className="h-5 w-5" strokeWidth={1.9} />
                  )}
                  {isLocating ? copy.locating : copy.findClinic}
                </button>
              </div>
              {locationError && (
                <p className="mt-3 text-sm font-semibold text-[#b9473e] dark:text-[#ef7569]">
                  {locationError}
                </p>
              )}
            </div>

            <div className="group relative min-h-[28rem] overflow-hidden lg:m-3 lg:min-h-0 lg:rounded-xl">
              <Image
                src="/images/petcare-consultation.png"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#20211f]/15" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 md:py-36 lg:px-8">
        <div
          data-safety-grid
          className="mx-auto grid max-w-7xl grid-flow-dense gap-3 md:grid-cols-12 md:grid-rows-2"
        >
          <article className="group relative min-h-[34rem] overflow-hidden rounded-2xl md:col-span-7 md:row-span-2">
            <Image
              data-emergency-image
              src="/images/petcare-consultation.webp"
              alt=""
              fill
              sizes="(min-width: 768px) 58vw, 100vw"
              className="object-cover scale-105"
            />
            <div className="absolute inset-0 bg-[#20211f]/55" />
            <div className="absolute inset-x-0 bottom-0 max-w-xl p-7 text-[#f1f1ed] sm:p-10">
              <HeartPulse className="h-8 w-8 text-[#ef7569]" strokeWidth={1.7} />
              <h2 className="mt-6 text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-[#f1f1ed]">
                {copy.bentoTitle}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#d1d2cc]">
                {copy.bentoBody}
              </p>
            </div>
          </article>

          <article className="flex min-h-[16rem] flex-col justify-between rounded-2xl bg-[#d85f53] p-7 text-[#1a1b19] md:col-span-5 md:row-span-1 sm:p-9">
            <ShieldAlert className="h-7 w-7" strokeWidth={1.8} />
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#1a1b19]">
                {copy.noMedicineTitle}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#351311]">
                {copy.noMedicineBody}
              </p>
            </div>
          </article>

          <article className="flex min-h-[16rem] flex-col justify-between rounded-2xl bg-[#242523] p-7 text-[#f1f1ed] md:col-span-5 md:row-span-1 sm:p-9">
            <PackageOpen className="h-7 w-7 text-[#ef7569]" strokeWidth={1.8} />
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#f1f1ed]">
                {copy.bringTitle}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-[#b7b8b2]">
                {copy.bringBody}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section
        id="emergency-clinics"
        className="scroll-mt-24 px-4 py-24 sm:px-6 md:py-36 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <h2 className="max-w-4xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-[#20211f] dark:text-[#f1f1ed] sm:text-6xl">
            {copy.clinicsTitle}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#676964] dark:text-[#b7b8b2]">
            {copy.clinicsBody}
          </p>

          <div className="mt-12 border-t border-[#c4c5be] dark:border-white/15">
            {emergencyClinics.isFetching && (
              <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-[#676964] dark:text-[#b7b8b2]">
                <Loader2 className="h-5 w-5 animate-spin text-[#b9473e] dark:text-[#ef7569]" />
                {copy.locating}
              </div>
            )}
            {!emergencyClinics.isFetching && (emergencyClinics.data?.length ?? 0) === 0 && (
              <div className="py-12 text-sm leading-6 text-[#676964] dark:text-[#b7b8b2]">
                {copy.clinicsEmpty}
              </div>
            )}
            {emergencyClinics.data?.map((clinic) => (
              <article
                key={clinic.id}
                className="group grid gap-6 border-b border-[#c4c5be] py-7 dark:border-white/15 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#47735e] dark:text-[#8fc3aa]">
                      <Siren className="h-3.5 w-3.5" strokeWidth={1.8} />
                      {copy.open}
                    </span>
                    <span className="text-xs text-[#74766f] dark:text-[#92948d]">
                      {clinic.distanceKm?.toLocaleString(
                        locale === "vi" ? "vi-VN" : "en-US",
                      )}{" "}
                      km
                    </span>
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#20211f] transition-colors group-hover:text-[#b9473e] dark:text-[#f1f1ed] dark:group-hover:text-[#ef7569]">
                    {clinic.name}
                  </h3>
                  <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-[#676964] dark:text-[#b7b8b2]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.7} />
                    {clinic.address}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 md:justify-end">
                  <Link
                    href={`/clinics?q=${encodeURIComponent(clinic.name)}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#b4b6af] px-4 text-sm font-bold text-[#393a37] transition hover:border-[#b9473e] hover:text-[#b9473e] active:translate-y-px dark:border-white/20 dark:text-[#d6d7d0] dark:hover:border-[#ef7569] dark:hover:text-[#ef7569]"
                  >
                    <MapPin className="h-4 w-4" strokeWidth={1.8} />
                    {copy.directions}
                  </Link>
                  <a
                    href={`tel:${clinic.phone.replace(/\s/g, "")}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#20211f] px-4 text-sm font-bold text-[#f5f5ef] transition hover:-translate-y-0.5 hover:bg-[#353633] active:translate-y-px dark:bg-[#d85f53] dark:text-[#1a1b19] dark:hover:bg-[#ef7569]"
                  >
                    <Phone className="h-4 w-4" strokeWidth={1.8} />
                    {copy.callNow}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-24 sm:px-6 md:py-32 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-[minmax(18rem,.78fr)_minmax(0,1.22fr)] lg:gap-16">
          <div data-guidance-intro className="h-fit lg:sticky lg:top-28 lg:pt-2">
            <h2 className="max-w-xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-[#20211f] dark:text-[#f1f1ed] sm:text-6xl">
              {copy.guideTitle}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#676964] dark:text-[#b7b8b2]">
              {copy.guideBody}
            </p>

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#d85f53]/35 bg-[#ffe4df] p-4 text-[#632c29] dark:bg-[#d85f53]/10 dark:text-[#f19a90]">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
              <div>
                <p className="text-sm font-bold">{copy.warningTitle}</p>
                <p className="mt-1 text-sm leading-relaxed">{copy.warningBody}</p>
              </div>
            </div>
          </div>

          <div data-guidance-list>
            <div
              role="tablist"
              aria-label={copy.guideTitle}
              className="flex snap-x gap-2 overflow-x-auto pb-3"
            >
              {FIRST_AID_TIPS.map((tip) => {
                const Icon = tip.icon;
                const active = tip.id === activeTip;

                return (
                  <button
                    key={tip.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTip(tip.id)}
                    className={`inline-flex min-h-12 shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-xl border px-4 text-sm font-bold transition active:translate-y-px ${
                      active
                        ? "border-[#20211f] bg-[#20211f] text-[#f5f5ef] dark:border-[#ef7569] dark:bg-[#ef7569] dark:text-[#1a1b19]"
                        : "border-[#c4c5be] text-[#5d5f59] hover:border-[#b9473e] hover:text-[#b9473e] dark:border-white/15 dark:text-[#c6c7c0] dark:hover:border-[#ef7569] dark:hover:text-[#ef7569]"
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
                    {tip.title[locale]}
                  </button>
                );
              })}
            </div>

            <div
              role="tabpanel"
              className="mt-5 min-h-[29rem] rounded-2xl bg-[#242523] p-7 text-[#f1f1ed] sm:p-10 lg:p-12"
            >
              <div className="flex h-full min-h-[23rem] flex-col justify-between">
                <SelectedIcon className="h-10 w-10 text-[#ef7569]" strokeWidth={1.5} />

                <div>
                  <p className="text-sm font-bold text-[#ef7569]">{copy.temporary}</p>
                  <h3 className="mt-4 text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-[#f1f1ed] sm:text-5xl">
                    {selectedTip.title[locale]}
                  </h3>
                  <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#d1d2cc]">
                    {selectedTip.description[locale]}
                  </p>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-[#b7b8b2]">
                    {selectedTip.action[locale]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-28 pt-16 sm:px-6 md:pb-40 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-2xl bg-[#d85f53] px-6 py-12 text-[#1a1b19] sm:px-10 md:grid-cols-[1fr_auto] md:items-end md:px-14 md:py-16">
          <div>
            <MessageCircle className="h-8 w-8" strokeWidth={1.7} />
            <h2 className="mt-8 max-w-3xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-[#1a1b19] sm:text-6xl">
              {copy.assistantTitle}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#351311]">
              {copy.assistantBody}
            </p>
          </div>
          <button
            type="button"
            id="ai-triage-btn"
            onClick={openAssistant}
            className="inline-flex min-h-14 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#20211f] px-6 text-sm font-bold text-[#f5f5ef] transition hover:-translate-y-0.5 hover:bg-[#353633] active:translate-y-px"
          >
            {copy.assistantCta}
            <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      </section>
    </main>
  );
}
