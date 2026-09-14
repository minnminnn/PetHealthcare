"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  FileHeart,
  MapPin,
  Search,
  ShieldCheck,
  Siren,
  Star,
} from "lucide-react";
import { Link } from "@/lib/navigation";
import {
  HOME_CLINICS,
  HOME_CONTENT,
  HOME_FEATURES,
  HOME_STACK_LAYERS,
  type HomeLocale,
} from "@/lib/homepage-design";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const JOURNEY_IMAGES = [
  "/images/petcare-consultation.webp",
  "/images/petcare-passport.webp",
  "/images/petcare-hero.webp",
] as const;

const JOURNEY_ICONS = [Search, FileHeart, Siren] as const;

const JOURNEY_COPY = {
  vi: [
    {
      title: "Tìm nơi phù hợp, không chỉ nơi gần nhất.",
      body: "So sánh chuyên môn, giờ mở cửa và đánh giá cộng đồng trước khi đặt lịch.",
      link: "Khám phá phòng khám",
      href: "/clinics" as const,
    },
    {
      title: "Mang theo toàn bộ lịch sử, không cần giấy tờ.",
      body: "Hộ chiếu số giúp bác sĩ hiểu nhanh vaccine, đơn thuốc và lần khám trước.",
      link: "Xem hồ sơ thú cưng",
      href: "/dashboard/owner" as const,
    },
    {
      title: "Biết phải làm gì khi từng phút đều đáng giá.",
      body: "Tìm phòng khám đang trực và nhận hướng dẫn sơ cứu ban đầu trong một thao tác.",
      link: "Mở hỗ trợ khẩn cấp",
      href: "/emergency" as const,
    },
  ],
  en: [
    {
      title: "Find the right place, not only the nearest one.",
      body: "Compare expertise, opening hours, and community feedback before you book.",
      link: "Explore clinics",
      href: "/clinics" as const,
    },
    {
      title: "Carry the full history without the paperwork.",
      body: "A digital passport gives vets quick context on vaccines, prescriptions, and past visits.",
      link: "View pet records",
      href: "/dashboard/owner" as const,
    },
    {
      title: "Know what to do when every minute counts.",
      body: "Find an open clinic and get immediate first-aid guidance in one action.",
      link: "Open emergency help",
      href: "/emergency" as const,
    },
  ],
} as const;

const MARQUEE_COPY = {
  vi: [
    "Phòng khám",
    "Hộ chiếu số",
    "Tư vấn trực tuyến",
    "Nhắc lịch",
    "Hiến máu",
    "Hỗ trợ khẩn cấp",
  ],
  en: [
    "Clinics",
    "Digital passport",
    "Tele-vet",
    "Reminders",
    "Blood donation",
    "Emergency help",
  ],
} as const;

export function HomeExperience({ locale }: { locale: HomeLocale }) {
  const root = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [clinicIndex, setClinicIndex] = useState(0);
  const copy = HOME_CONTENT[locale];
  const journey = JOURNEY_COPY[locale];
  const clinic = HOME_CLINICS[clinicIndex];

  useGSAP(
    () => {
      if (reduceMotion) return;

      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      gsap.fromTo(
        "[data-hero-copy] > *",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
        },
      );

      const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]");
      cards.forEach((card, index) => {
        const image = card.querySelector<HTMLElement>("[data-story-image]");

        if (image) {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "bottom 15%",
                scrub: 0.8,
              },
            })
            .fromTo(
              image,
              { scale: 0.8, opacity: 0.35 },
              { scale: 1, opacity: 1, ease: "none" },
            )
            .to(image, { scale: 1.03, opacity: 0.25, ease: "none" });
        }

        if (isMobile || index === cards.length - 1) return;

        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cards[cards.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });

        gsap.to(card, {
          scale: 0.92,
          opacity: 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: cards[index + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    },
    { scope: root, dependencies: [reduceMotion], revertOnUpdate: true },
  );

  const changeClinic = (direction: -1 | 1) => {
    setClinicIndex(
      (current) =>
        (current + direction + HOME_CLINICS.length) % HOME_CLINICS.length,
    );
  };

  return (
    <main
      ref={root}
      className="w-full max-w-full overflow-x-hidden bg-[#f3f3f0] text-[#20211f] dark:bg-[#171816] dark:text-[#f1f1ed]"
    >
      <section className="relative flex min-h-[100dvh] items-center overflow-hidden px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <Image
          src="/images/petcare-hero.webp"
          alt={
            locale === "vi"
              ? "Chủ nuôi thư giãn cùng chó và mèo tại nhà"
              : "A pet owner relaxing at home with a dog and cat"
          }
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,20,18,.52)_0%,rgba(19,20,18,.38)_42%,rgba(19,20,18,.88)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,transparent_0%,rgba(18,19,17,.2)_46%,rgba(18,19,17,.72)_100%)]" />

        <div
          data-hero-copy
          className="relative mx-auto flex w-full max-w-6xl flex-col items-center text-center text-[#f7f7f2]"
        >
          <h1 className="max-w-6xl text-balance text-[clamp(3rem,6.2vw,6.4rem)] font-medium leading-[0.96] tracking-[-0.055em] text-inherit">
            {copy.heroTitle}
          </h1>
          <p className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-[#e3e3dc] sm:text-lg">
            {copy.heroDescription}
          </p>
          <div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/register"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#d85f53] px-6 font-bold text-[#1a1b19] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ee786c] active:translate-y-px sm:w-auto"
            >
              {copy.primaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/clinics"
              className="inline-flex min-h-12 w-full items-center justify-center whitespace-nowrap rounded-xl border border-white/40 bg-[#20211f]/45 px-6 font-bold text-[#f7f7f2] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-[#20211f]/70 active:translate-y-px sm:w-auto"
            >
              {copy.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-28 md:py-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-4xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-[#20211f] dark:text-[#f1f1ed] sm:text-6xl lg:text-7xl">
            {copy.interestTitle}
            <span className="mx-2 inline-block h-[.72em] w-[1.35em] overflow-hidden rounded-full align-baseline sm:mx-3">
              <Image
                src="/images/petcare-passport.webp"
                alt=""
                width={180}
                height={96}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#676964] dark:text-[#b7b8b2]">
            {copy.interestDescription}
          </p>

          <div className="mt-16 grid grid-flow-dense grid-cols-1 gap-3 md:grid-cols-12 md:grid-rows-2">
            <article className="group relative min-h-[34rem] overflow-hidden rounded-2xl md:col-span-7 md:row-span-2">
              <Image
                src="/images/petcare-consultation.webp"
                alt={HOME_FEATURES[0].title[locale]}
                fill
                sizes="(min-width: 768px) 58vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161714]/90 via-[#161714]/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-[#f5f5ef] sm:p-9">
                <MapPin
                  className="mb-5 h-7 w-7 text-[#ef7569]"
                  aria-hidden="true"
                />
                <h3 className="max-w-md text-3xl font-medium leading-tight tracking-[-0.03em] text-inherit sm:text-4xl">
                  {HOME_FEATURES[0].title[locale]}
                </h3>
                <p className="mt-3 max-w-md text-[#d4d5cf]">
                  {HOME_FEATURES[0].description[locale]}
                </p>
              </div>
            </article>

            <article className="group relative min-h-64 overflow-hidden rounded-2xl bg-[#d85f53] p-7 text-[#1b1c1a] md:col-span-5 md:row-span-1 sm:p-9">
              <FileHeart className="h-7 w-7" aria-hidden="true" />
              <h3 className="mt-10 max-w-md text-3xl font-medium leading-tight tracking-[-0.03em] text-inherit">
                {HOME_FEATURES[1].title[locale]}
              </h3>
              <p className="mt-3 max-w-md text-[#1b1c1a]">
                {HOME_FEATURES[1].description[locale]}
              </p>
              <CircleCheck
                className="absolute -bottom-6 -right-4 h-36 w-36 text-[#bb493f]/35 transition-transform duration-700 group-hover:rotate-6 group-hover:scale-105"
                strokeWidth={1}
                aria-hidden="true"
              />
            </article>

            <article className="group relative min-h-64 overflow-hidden rounded-2xl bg-[#252624] p-7 text-[#f5f5ef] md:col-span-5 md:row-span-1 sm:p-9">
              <Siren className="h-7 w-7 text-[#ef7569]" aria-hidden="true" />
              <h3 className="mt-10 max-w-md text-3xl font-medium leading-tight tracking-[-0.03em] text-inherit">
                {HOME_FEATURES[2].title[locale]}
              </h3>
              <p className="mt-3 max-w-md text-[#bfc0ba]">
                {HOME_FEATURES[2].description[locale]}
              </p>
              <Clock3
                className="absolute -bottom-7 -right-4 h-36 w-36 text-white/5 transition-transform duration-700 group-hover:rotate-6 group-hover:scale-105"
                strokeWidth={1}
                aria-hidden="true"
              />
            </article>
          </div>
        </div>
      </section>

      <div
        className="overflow-hidden border-y border-[#d7d7d1] py-5 dark:border-white/10"
        aria-hidden="true"
      >
        <div className="home-marquee flex w-max gap-10 whitespace-nowrap text-2xl font-medium tracking-[-0.03em] text-[#4b4d48] dark:text-[#c8c9c2]">
          {[...MARQUEE_COPY[locale], ...MARQUEE_COPY[locale]].map(
            (item, index) => (
              <span
                key={`${item}-${index}`}
                className="flex items-center gap-10"
              >
                {item}
                <span className="text-[#d85f53]">/</span>
              </span>
            ),
          )}
        </div>
      </div>

      <section className="pt-28 md:pt-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-4xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.045em] text-[#20211f] dark:text-[#f1f1ed] sm:text-6xl lg:text-7xl">
            {copy.desireTitle}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#676964] dark:text-[#b7b8b2]">
            {copy.desireDescription}
          </p>
        </div>

        <div className="relative mt-16">
          {journey.map((item, index) => {
            const JourneyIcon = JOURNEY_ICONS[index];

            return (
              <article
                key={item.title}
                data-stack-card
                style={{ zIndex: HOME_STACK_LAYERS[index] }}
                className="relative isolate flex min-h-[100dvh] items-center bg-[#f3f3f0] px-4 py-12 dark:bg-[#171816] sm:px-6 md:py-16 lg:px-8"
              >
                <div className="mx-auto grid w-full max-w-7xl gap-8 overflow-hidden rounded-2xl bg-[#242523] p-3 text-[#f5f5ef] md:grid-cols-[1.05fr_.95fr] md:p-4">
                  <div className="flex min-h-[28rem] flex-col justify-between p-6 sm:p-10 lg:p-14">
                    <JourneyIcon
                      className="h-8 w-8 text-[#ef7569]"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="max-w-xl text-balance text-4xl font-medium leading-[1.04] tracking-[-0.04em] text-inherit sm:text-5xl">
                        {item.title}
                      </h3>
                      <p className="mt-5 max-w-md text-lg leading-relaxed text-[#bfc0ba]">
                        {item.body}
                      </p>
                      <Link
                        href={item.href}
                        className="mt-8 inline-flex items-center gap-2 whitespace-nowrap font-bold text-[#f2f2ed] transition-colors hover:text-[#ef7569]"
                      >
                        {item.link}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                  <div className="group relative min-h-[26rem] overflow-hidden rounded-xl md:min-h-[32rem]">
                    <Image
                      data-story-image
                      src={JOURNEY_IMAGES[index]}
                      alt={item.title}
                      fill
                      sizes="(min-width: 768px) 48vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="py-28 md:py-40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 md:grid-cols-[1fr_1.1fr] lg:px-8">
          <div>
            <h2 className="max-w-2xl text-balance text-4xl font-medium leading-[1.04] tracking-[-0.04em] text-[#20211f] dark:text-[#f1f1ed] sm:text-6xl">
              {copy.clinicTitle}
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[#676964] dark:text-[#b7b8b2]">
              {copy.clinicDescription}
            </p>
          </div>

          <div className="flex min-h-80 flex-col justify-between rounded-2xl bg-[#deded8] p-7 dark:bg-[#242523] sm:p-10">
            <div className="flex items-center justify-between">
              <ShieldCheck
                className="h-8 w-8 text-[#d85f53]"
                aria-hidden="true"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => changeClinic(-1)}
                  aria-label={
                    locale === "vi" ? "Phòng khám trước" : "Previous clinic"
                  }
                  className="grid h-11 w-11 place-items-center rounded-xl border border-[#a9aaa4] transition hover:-translate-y-0.5 hover:border-[#d85f53] hover:text-[#d85f53] active:translate-y-px dark:border-white/20"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => changeClinic(1)}
                  aria-label={
                    locale === "vi" ? "Phòng khám tiếp theo" : "Next clinic"
                  }
                  className="grid h-11 w-11 place-items-center rounded-xl border border-[#a9aaa4] transition hover:-translate-y-0.5 hover:border-[#d85f53] hover:text-[#d85f53] active:translate-y-px dark:border-white/20"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div key={clinic.name} className="animate-fade-in">
              <div className="flex items-center gap-2 text-[#d85f53]">
                <Star className="h-5 w-5 fill-current" aria-hidden="true" />
                <span className="text-2xl font-bold text-[#20211f] dark:text-[#f1f1ed]">
                  {clinic.rating}
                </span>
                <span className="text-sm text-[#676964] dark:text-[#b7b8b2]">
                  ({clinic.reviews})
                </span>
              </div>
              <h3 className="mt-5 max-w-lg text-3xl font-medium leading-tight tracking-[-0.03em] dark:text-[#f1f1ed]">
                {clinic.name}
              </h3>
              <Link
                href="/clinics"
                className="mt-7 inline-flex items-center gap-2 whitespace-nowrap font-bold hover:text-[#b9473e] dark:hover:text-[#ef7569]"
              >
                {copy.secondaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#222321] px-4 py-12 text-[#f1f1ed] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-2xl bg-[#d85f53] px-6 py-16 text-[#1b1c1a] sm:px-10 md:py-24 lg:px-16">
          <h2 className="max-w-4xl text-balance text-4xl font-medium leading-[1] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            {copy.footerTitle}
          </h2>
          <p className="mt-6 max-w-xl text-lg text-[#1b1c1a]">
            {copy.footerDescription}
          </p>
          <Link
            href="/register"
            className="mt-9 inline-flex min-h-12 items-center gap-2 whitespace-nowrap rounded-xl bg-[#1d1e1c] px-6 font-bold text-[#f5f5ef] transition hover:-translate-y-0.5 hover:bg-[#30312e] active:translate-y-px"
          >
            {copy.footerCta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mx-auto mt-12 grid max-w-7xl gap-8 border-t border-white/10 pt-8 sm:grid-cols-[1fr_auto_auto]">
          <div>
            <p className="text-xl font-bold">PetCare</p>
            <p className="mt-2 max-w-xs text-sm text-[#aeb0aa]">
              {locale === "vi"
                ? "Sức khỏe thú cưng, được giữ gọn và rõ ràng."
                : "Pet health, kept simple and clear."}
            </p>
          </div>
          <Link
            href="/clinics"
            className="text-sm text-[#c9cac3] transition hover:text-[#ef7569]"
          >
            {copy.secondaryCta}
          </Link>
          <Link
            href="/tele-vet"
            className="text-sm text-[#c9cac3] transition hover:text-[#ef7569]"
          >
            {locale === "vi" ? "Tư vấn trực tuyến" : "Tele-vet"}
          </Link>
        </div>
      </footer>
    </main>
  );
}
