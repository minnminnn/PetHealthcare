"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Coffee,
  FlaskConical,
  HeartPulse,
  Info,
  Leaf,
  Package,
  PawPrint,
  Pill,
  Search,
  ShieldAlert,
  Stethoscope,
  Syringe,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/lib/navigation";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Locale = "vi" | "en";
type DrugStatus = "safe" | "caution" | "avoid";

interface Category {
  id: string;
  label: Record<Locale, string>;
  icon: LucideIcon;
}

interface Drug {
  id: string;
  name: string;
  category: string;
  description: Record<Locale, string>;
  species: string[];
  dosage: Record<Locale, string>;
  status: DrugStatus;
  icon: LucideIcon;
}

const CATEGORIES: Category[] = [
  { id: "all", label: { vi: "Tất cả", en: "All" }, icon: Package },
  { id: "antibiotic", label: { vi: "Kháng sinh", en: "Antibiotics" }, icon: Pill },
  { id: "antiparasitic", label: { vi: "Chống ký sinh", en: "Antiparasitic" }, icon: Leaf },
  { id: "supplement", label: { vi: "Bổ sung", en: "Supplements" }, icon: FlaskConical },
  { id: "toxic", label: { vi: "Cần tránh", en: "Avoid" }, icon: ShieldAlert },
];

const DRUGS: Drug[] = [
  {
    id: "d1",
    name: "Amoxicillin",
    category: "antibiotic",
    description: {
      vi: "Kháng sinh penicillin phổ rộng, thường được kê cho nhiễm khuẩn da, tai và đường hô hấp.",
      en: "A broad-spectrum penicillin antibiotic commonly prescribed for skin, ear, and respiratory infections.",
    },
    species: ["dog", "cat"],
    dosage: { vi: "10-20 mg/kg mỗi 8-12 giờ", en: "10-20 mg/kg every 8-12 hours" },
    status: "safe",
    icon: Pill,
  },
  {
    id: "d2",
    name: "Ivermectin",
    category: "antiparasitic",
    description: {
      vi: "Thuốc chống ký sinh trùng phổ rộng. Có thể nguy hiểm với chó mang đột biến gen MDR1.",
      en: "A broad antiparasitic medicine. It can be dangerous for dogs carrying an MDR1 gene mutation.",
    },
    species: ["dog", "cat", "rabbit"],
    dosage: { vi: "Theo chỉ dẫn bác sĩ", en: "Only as directed by a veterinarian" },
    status: "caution",
    icon: ShieldAlert,
  },
  {
    id: "d3",
    name: "Paracetamol (Acetaminophen)",
    category: "toxic",
    description: {
      vi: "Cực độc với mèo và có thể gây tổn thương gan nghiêm trọng. Không tự ý sử dụng cho thú cưng.",
      en: "Extremely toxic to cats and capable of causing severe liver damage. Never give it without veterinary direction.",
    },
    species: ["cat"],
    dosage: { vi: "Không dùng", en: "Do not use" },
    status: "avoid",
    icon: XCircle,
  },
  {
    id: "d4",
    name: "Omega-3 (DHA/EPA)",
    category: "supplement",
    description: {
      vi: "Bổ sung acid béo hỗ trợ da, lông, tim mạch và khớp khi dùng đúng loại và đúng liều.",
      en: "A fatty-acid supplement that supports skin, coat, heart, and joint health when correctly formulated and dosed.",
    },
    species: ["dog", "cat"],
    dosage: { vi: "20-55 mg/kg/ngày EPA và DHA", en: "20-55 mg/kg daily of EPA and DHA" },
    status: "safe",
    icon: HeartPulse,
  },
  {
    id: "d5",
    name: "Metronidazole",
    category: "antibiotic",
    description: {
      vi: "Được dùng cho một số nhiễm khuẩn kỵ khí và ký sinh trùng đường ruột theo chẩn đoán thú y.",
      en: "Used for certain anaerobic infections and intestinal parasites after a veterinary diagnosis.",
    },
    species: ["dog", "cat"],
    dosage: { vi: "10-15 mg/kg mỗi 12 giờ", en: "10-15 mg/kg every 12 hours" },
    status: "safe",
    icon: Syringe,
  },
  {
    id: "d6",
    name: "Ibuprofen (Advil)",
    category: "toxic",
    description: {
      vi: "Độc với chó và mèo. Có thể gây loét dạ dày, suy thận và biến chứng đe dọa tính mạng.",
      en: "Toxic to dogs and cats. It can cause stomach ulcers, kidney failure, and life-threatening complications.",
    },
    species: ["dog", "cat"],
    dosage: { vi: "Không dùng", en: "Do not use" },
    status: "avoid",
    icon: XCircle,
  },
];

const TOXIC_FOODS = [
  {
    name: { vi: "Sô-cô-la", en: "Chocolate" },
    effect: {
      vi: "Theobromine và caffeine có thể gây tim nhanh, run và co giật",
      en: "Theobromine and caffeine can cause rapid heart rate, tremors, and seizures",
    },
    icon: CircleAlert,
  },
  {
    name: { vi: "Hành và tỏi", en: "Onion and garlic" },
    effect: {
      vi: "Có thể phá hủy hồng cầu và gây thiếu máu",
      en: "Can damage red blood cells and cause anemia",
    },
    icon: Leaf,
  },
  {
    name: { vi: "Nho và nho khô", en: "Grapes and raisins" },
    effect: {
      vi: "Có thể gây tổn thương thận nghiêm trọng, đặc biệt ở chó",
      en: "Can cause severe kidney injury, especially in dogs",
    },
    icon: AlertTriangle,
  },
  {
    name: { vi: "Bơ", en: "Avocado" },
    effect: {
      vi: "Có thể gây rối loạn tiêu hóa; đặc biệt nguy hiểm với một số loài vật nuôi",
      en: "Can cause digestive upset and is particularly dangerous to some pet species",
    },
    icon: ShieldAlert,
  },
  {
    name: { vi: "Caffeine", en: "Caffeine" },
    effect: {
      vi: "Có thể gây tim nhanh, bồn chồn, run và co giật",
      en: "Can cause rapid heart rate, restlessness, tremors, and seizures",
    },
    icon: Coffee,
  },
  {
    name: { vi: "Hạt mắc ca", en: "Macadamia nuts" },
    effect: {
      vi: "Có thể gây yếu cơ, nôn, sốt và run ở chó",
      en: "Can cause weakness, vomiting, fever, and tremors in dogs",
    },
    icon: Package,
  },

  // additional toxic foods
  {
    name: { vi: "Xylitol", en: "Xylitol" },
    effect: {
      vi: "Có thể gây hạ đường huyết nhanh và tổn thương gan ở chó",
      en: "Can cause rapid hypoglycemia and liver injury in dogs",
    },
    icon: CircleAlert,
  },
  {
    name: { vi: "Rượu và đồ uống có cồn", en: "Alcohol" },
    effect: {
      vi: "Có thể gây nôn, mất phối hợp, khó thở, hôn mê và tử vong",
      en: "Can cause vomiting, loss of coordination, breathing problems, coma, and death",
    },
    icon: ShieldAlert,
  },
  {
    name: { vi: "Bột men sống", en: "Raw yeast dough" },
    effect: {
      vi: "Có thể làm dạ dày phình to và tạo ra cồn trong đường tiêu hóa",
      en: "Can expand in the stomach and produce alcohol in the digestive tract",
    },
    icon: AlertTriangle,
  },
  {
    name: { vi: "Thực phẩm quá mặn", en: "Excessively salty foods" },
    effect: {
      vi: "Có thể gây rối loạn điện giải, run và co giật",
      en: "Can cause electrolyte imbalance, tremors, and seizures",
    },
    icon: CircleAlert,
  },
  {
    name: { vi: "Thịt và trứng sống", en: "Raw meat and eggs" },
    effect: {
      vi: "Có thể chứa vi khuẩn gây bệnh như Salmonella và E. coli",
      en: "May contain harmful bacteria such as Salmonella and E. coli",
    },
    icon: ShieldAlert,
  },
  {
    name: { vi: "Các loại hạt nhiều chất béo", en: "High-fat nuts" },
    effect: {
      vi: "Có thể gây nôn, tiêu chảy và viêm tụy",
      en: "Can cause vomiting, diarrhea, and potentially pancreatitis",
    },
    icon: Package,
  },
];

const SPECIES = ["all", "dog", "cat", "rabbit"] as const;

const COPY = {
  vi: {
    home: "Trang chủ",
    page: "Dược phẩm",
    heroTitle: "Tra cứu thuốc. Tránh độc tố.",
    heroBody: "Thông tin rõ ràng để bạn đặt đúng câu hỏi trước khi dùng thuốc cho thú cưng.",
    searchPlaceholder: "Tìm thuốc hoặc hoạt chất",
    search: "Tra cứu",
    safetyTitle: "Bắt đầu bằng sự an toàn",
    safetyBody: "Thư viện giúp bạn hiểu thông tin, không thay thế chẩn đoán hoặc đơn thuốc từ bác sĩ thú y.",
    dosageTitle: "Liều dùng cần đúng ngữ cảnh",
    dosageBody: "Cân nặng, giống, tuổi và bệnh nền đều có thể thay đổi chỉ định.",
    humanTitle: "Thuốc của người không mặc định an toàn",
    humanBody: "Một số thuốc phổ biến có thể gây độc nặng cho chó và mèo.",
    catalogTitle: "Thư viện tham khảo",
    catalogBody: "Lọc theo nhóm thuốc và loài để xem thông tin phù hợp hơn.",
    allSpecies: "Tất cả loài",
    species: { all: "Tất cả loài", dog: "Chó", cat: "Mèo", rabbit: "Thỏ" },
    statuses: { safe: "Dùng theo chỉ định", caution: "Cần thận trọng", avoid: "Không sử dụng" },
    dosage: "Liều tham khảo",
    results: "kết quả",
    emptyTitle: "Không tìm thấy mục phù hợp",
    emptyBody: "Thử từ khóa ngắn hơn hoặc chọn lại bộ lọc.",
    clear: "Xóa bộ lọc",
    poisonTitle: "Những thứ quen thuộc có thể gây độc",
    poisonBody: "Nếu thú cưng đã ăn phải, hãy gọi phòng khám và mang theo bao bì hoặc mẫu còn lại.",
    guidanceTitle: "Ba nguyên tắc khi tra cứu thuốc",
    guidance: [
      { title: "Xác nhận hoạt chất", body: "Tên thương mại có thể khác nhau. Hãy kiểm tra hoạt chất và nồng độ trên bao bì." },
      { title: "Không tự quy đổi liều", body: "Liều của người hoặc của một loài khác không thể áp dụng trực tiếp cho thú cưng." },
      { title: "Gọi ngay khi có phản ứng", body: "Nôn, run, khó thở hoặc lừ đừ sau khi dùng thuốc cần được xử lý khẩn cấp." },
    ],
    previous: "Trước",
    next: "Tiếp",
    ctaTitle: "Chưa chắc thuốc có an toàn?",
    ctaBody: "Mang bao bì thuốc và thông tin cân nặng của thú cưng đến bác sĩ thú y.",
    findClinic: "Tìm phòng khám",
    emergency: "Hỗ trợ khẩn cấp",
    warning: "Thông tin trên trang chỉ mang tính tham khảo. Luôn hỏi bác sĩ thú y trước khi dùng thuốc.",
  },
  en: {
    home: "Home",
    page: "Pharmacy",
    heroTitle: "Check medicines. Avoid toxins.",
    heroBody: "Clear reference information helps you ask the right questions before giving your pet medicine.",
    searchPlaceholder: "Search a medicine or ingredient",
    search: "Search",
    safetyTitle: "Start with safety",
    safetyBody: "This library helps you understand information. It does not replace a veterinary diagnosis or prescription.",
    dosageTitle: "Dosage needs context",
    dosageBody: "Weight, breed, age, and existing conditions can all change a veterinary direction.",
    humanTitle: "Human medicine is not automatically safe",
    humanBody: "Several common medicines can cause severe poisoning in dogs and cats.",
    catalogTitle: "Reference library",
    catalogBody: "Filter by medicine group and species to narrow the information.",
    allSpecies: "All species",
    species: { all: "All species", dog: "Dogs", cat: "Cats", rabbit: "Rabbits" },
    statuses: { safe: "Use as directed", caution: "Use with caution", avoid: "Do not use" },
    dosage: "Reference dosage",
    results: "results",
    emptyTitle: "No matching entries",
    emptyBody: "Try a shorter search term or clear one of the filters.",
    clear: "Clear filters",
    poisonTitle: "Familiar foods can be toxic",
    poisonBody: "If your pet has eaten one, call a clinic and keep any packaging or remaining sample.",
    guidanceTitle: "Three rules for medicine searches",
    guidance: [
      { title: "Confirm the active ingredient", body: "Brand names vary. Check the active ingredient and concentration on the package." },
      { title: "Never convert a dose yourself", body: "A human dose or a dose for another species cannot be applied directly to your pet." },
      { title: "Call when a reaction begins", body: "Vomiting, tremors, breathing trouble, or lethargy after medicine needs urgent help." },
    ],
    previous: "Previous",
    next: "Next",
    ctaTitle: "Not sure a medicine is safe?",
    ctaBody: "Take the packaging and your pet's current weight to a veterinarian.",
    findClinic: "Find a clinic",
    emergency: "Emergency help",
    warning: "This page is for reference only. Always ask a veterinarian before giving medicine.",
  },
} as const;

const STATUS_STYLE: Record<DrugStatus, string> = {
  safe: "text-[#2f6454] dark:text-[#82c8ae]",
  caution: "text-[#9b542d] dark:text-[#e3a477]",
  avoid: "text-[#b9473e] dark:text-[#ef7569]",
};

const STATUS_ICON: Record<DrugStatus, LucideIcon> = {
  safe: CheckCircle2,
  caution: AlertTriangle,
  avoid: XCircle,
};

export function PharmacyExperience({ locale }: { locale: Locale }) {
  const root = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [species, setSpecies] = useState<(typeof SPECIES)[number]>("all");
  const [activeFood, setActiveFood] = useState(TOXIC_FOODS[0].name.en.toLowerCase());
  const [guideIndex, setGuideIndex] = useState(0);
  const copy = COPY[locale];

  const filteredDrugs = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(locale);

    return DRUGS.filter((drug) => {
      const matchesQuery =
        !normalizedQuery ||
        `${drug.name} ${drug.description[locale]}`.toLocaleLowerCase(locale).includes(normalizedQuery);
      const matchesCategory = category === "all" || drug.category === category;
      const matchesSpecies = species === "all" || drug.species.includes(species);
      return matchesQuery && matchesCategory && matchesSpecies;
    });
  }, [category, locale, query, species]);

  useGSAP(
    () => {
      if (reduceMotion) return;

      gsap.fromTo(
        "[data-pharmacy-hero] > *",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.75, stagger: 0.1, ease: "power3.out" },
      );

      gsap.utils.toArray<HTMLElement>("[data-drug-card]").forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 52 + index * 4, scale: 0.94 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%", once: true },
          },
        );
      });

      const marquee = gsap.to("[data-toxic-track]", {
        xPercent: -50,
        duration: 28,
        repeat: -1,
        ease: "none",
      });

      return () => marquee.kill();
    },
    { scope: root, dependencies: [reduceMotion], revertOnUpdate: true },
  );

  const runSearch = () => {
    document.getElementById("medicine-catalog")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setSpecies("all");
  };

  return (
    <main
      ref={root}
      className="w-full max-w-full overflow-x-hidden bg-[#f3f3f0] text-[#20211f] dark:bg-[#171816] dark:text-[#f1f1ed]"
    >
      <section className="px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div
          data-pharmacy-hero-shell
          className="relative mx-auto flex min-h-[calc(100dvh-7rem)] max-w-7xl items-center justify-center overflow-hidden rounded-2xl bg-[#20211f] px-6 py-16 text-center text-[#f1f1ed] sm:px-10"
        >
          <Image
            data-hero-image
            src="/images/petcare-consultation.webp"
            alt="Veterinarian discussing treatment with a pet owner"
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover opacity-40 grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-[#171816]/70" aria-hidden="true" />

          <div data-pharmacy-hero className="relative mx-auto flex w-full max-w-5xl flex-col items-center">
            {/* <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm font-medium text-[#d6d7d0]">
              <Link href="/" className="transition-colors hover:text-[#ef7569]">
                {copy.home}
              </Link>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <span className="text-[#f1f1ed]">{copy.page}</span>
            </nav> */}

            <h1 className="max-w-5xl text-[clamp(2.75rem,7vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-[#f1f1ed]">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#d6d7d0] sm:text-lg">{copy.heroBody}</p>

            <form
              className="mt-9 grid w-full max-w-2xl gap-2 rounded-2xl border border-white/15 bg-[#f3f3f0]/95 p-2 text-left shadow-[0_24px_80px_rgba(0,0,0,.28)] backdrop-blur-sm sm:grid-cols-[1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                runSearch();
              }}
            >
              <label htmlFor="pharmacy-search" className="sr-only">{copy.searchPlaceholder}</label>
              <div className="flex min-w-0 items-center gap-3 px-3">
                <Search className="h-5 w-5 flex-none text-[#676964]" aria-hidden="true" />
                <input
                  id="pharmacy-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  type="search"
                  placeholder={copy.searchPlaceholder}
                  className="min-h-12 w-full bg-transparent text-sm font-medium text-[#20211f] outline-none placeholder:text-[#676964] focus-visible:ring-0"
                />
              </div>
              <button
                id="pharmacy-search-btn"
                type="submit"
                className="min-h-12 whitespace-nowrap rounded-xl bg-[#d85f53] px-6 text-sm font-bold text-[#1a1b19] transition duration-300 hover:bg-[#ef7569] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d85f53]"
              >
                {copy.search}
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 md:py-32 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-flow-dense gap-3 md:grid-cols-12 md:grid-rows-2">
          <article className="relative min-h-[30rem] overflow-hidden rounded-2xl bg-[#20211f] p-7 text-[#f1f1ed] md:col-span-7 md:row-span-2 md:p-10">
            <Image
              src="/images/petcare-passport.webp"
              alt="Pet owner reviewing health information"
              fill
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover opacity-35 grayscale transition-transform duration-700 ease-out hover:scale-105"
            />
            <div className="absolute inset-0 bg-[#171816]/55" aria-hidden="true" />
            <div className="relative flex h-full max-w-md flex-col justify-end">
              <Stethoscope className="mb-auto h-8 w-8 text-[#ef7569]" aria-hidden="true" />
              <h2 className="text-4xl font-semibold tracking-[-0.045em] text-[#f1f1ed] sm:text-5xl">{copy.safetyTitle}</h2>
              <p className="mt-4 text-base leading-7 text-[#d6d7d0]">{copy.safetyBody}</p>
            </div>
          </article>

          <article className="rounded-2xl bg-[#deded8] p-7 md:col-span-5 md:row-span-1 md:p-8 dark:bg-[#242523]">
            <BookOpen className="h-7 w-7 text-[#b9473e] dark:text-[#ef7569]" aria-hidden="true" />
            <h3 className="mt-10 text-2xl font-semibold tracking-[-0.035em] text-[#20211f] dark:text-[#f1f1ed]">{copy.dosageTitle}</h3>
            <p className="mt-3 max-w-md leading-7 text-[#5d5f59] dark:text-[#c6c7c0]">{copy.dosageBody}</p>
          </article>

          <article className="rounded-2xl border border-[#d85f53]/35 bg-[#d85f53]/10 p-7 md:col-span-5 md:row-span-1 md:p-8 dark:bg-[#d85f53]/15">
            <ShieldAlert className="h-7 w-7 text-[#b9473e] dark:text-[#ef7569]" aria-hidden="true" />
            <h3 className="mt-10 text-2xl font-semibold tracking-[-0.035em] text-[#20211f] dark:text-[#f1f1ed]">{copy.humanTitle}</h3>
            <p className="mt-3 max-w-md leading-7 text-[#5d5f59] dark:text-[#c6c7c0]">{copy.humanBody}</p>
          </article>
        </div>
      </section>

      <section id="medicine-catalog" className="scroll-mt-24 px-4 py-24 sm:px-6 md:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-semibold tracking-[-0.05em] text-[#20211f] sm:text-6xl dark:text-[#f1f1ed]">{copy.catalogTitle}</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#5d5f59] dark:text-[#c6c7c0]">{copy.catalogBody}</p>
          </div>

          <div className="mt-12 rounded-2xl border border-[#d1d2cc] bg-[#e8e8e3] p-3 dark:border-white/10 dark:bg-[#20211f]">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="flex gap-2 overflow-x-auto pb-1 xl:flex-wrap xl:overflow-visible xl:pb-0">
                {CATEGORIES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCategory(id)}
                    className={`flex min-h-11 flex-none items-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-bold transition duration-300 active:scale-[0.98] ${
                      category === id
                        ? "bg-[#20211f] text-[#f1f1ed] dark:bg-[#f1f1ed] dark:text-[#20211f]"
                        : "text-[#4b4d48] hover:bg-[#deded8] hover:text-[#b9473e] dark:text-[#d6d7d0] dark:hover:bg-white/10 dark:hover:text-[#ef7569]"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label[locale]}
                  </button>
                ))}
              </div>

              <div className="xl:ml-auto">
                <label htmlFor="species-filter" className="sr-only">{copy.allSpecies}</label>
                <div className="flex min-h-11 items-center gap-2 rounded-xl border border-[#c6c7c0] bg-[#f3f3f0] px-3 dark:border-white/15 dark:bg-[#242523]">
                  <PawPrint className="h-4 w-4 text-[#676964] dark:text-[#b7b8b2]" aria-hidden="true" />
                  <select
                    id="species-filter"
                    value={species}
                    onChange={(event) => setSpecies(event.target.value as (typeof SPECIES)[number])}
                    className="min-h-10 bg-transparent pr-5 text-sm font-bold text-[#30312e] outline-none dark:text-[#f1f1ed]"
                  >
                    {SPECIES.map((item) => (
                      <option key={item} value={item} className="bg-[#f3f3f0] text-[#20211f]">{copy.species[item]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center gap-3 text-sm font-medium text-[#676964] dark:text-[#b7b8b2]">
            <span>{filteredDrugs.length} {copy.results}</span>
            <span className="h-px flex-1 bg-[#d1d2cc] dark:bg-white/10" aria-hidden="true" />
          </div>

          {filteredDrugs.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {filteredDrugs.map((drug) => {
                const DrugIcon = drug.icon;
                const StatusIcon = STATUS_ICON[drug.status];
                return (
                  <article
                    data-drug-card
                    key={drug.id}
                    className="group overflow-hidden rounded-2xl border border-[#d1d2cc] bg-[#e8e8e3] p-6 transition-colors duration-300 hover:border-[#d85f53]/55 dark:border-white/10 dark:bg-[#20211f] dark:hover:border-[#d85f53]/60 sm:p-8"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-[#deded8] text-[#b9473e] transition-transform duration-700 ease-out group-hover:scale-105 dark:bg-[#2b2c29] dark:text-[#ef7569]">
                        <DrugIcon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <span className={`flex items-center gap-2 text-xs font-bold ${STATUS_STYLE[drug.status]}`}>
                        <StatusIcon className="h-4 w-4" aria-hidden="true" />
                        {copy.statuses[drug.status]}
                      </span>
                    </div>

                    <h3 className="mt-8 text-2xl font-semibold tracking-[-0.035em] text-[#20211f] dark:text-[#f1f1ed]">{drug.name}</h3>
                    <p className="mt-3 min-h-14 text-sm leading-6 text-[#5d5f59] dark:text-[#c6c7c0]">{drug.description[locale]}</p>

                    <div className="mt-7 grid gap-5 border-t border-[#d1d2cc] pt-5 dark:border-white/10 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div>
                        <p className="text-xs font-bold text-[#676964] dark:text-[#b7b8b2]">{copy.dosage}</p>
                        <p className={`mt-1 text-sm font-bold ${STATUS_STYLE[drug.status]}`}>{drug.dosage[locale]}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {drug.species.map((item) => (
                          <span key={item} className="rounded-lg bg-[#deded8] px-2.5 py-1 text-xs font-bold text-[#4b4d48] dark:bg-white/10 dark:text-[#d6d7d0]">
                            {copy.species[item as keyof typeof copy.species]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-[#d1d2cc] bg-[#e8e8e3] px-6 py-16 text-center dark:border-white/10 dark:bg-[#20211f]">
              <Search className="mx-auto h-8 w-8 text-[#b9473e] dark:text-[#ef7569]" aria-hidden="true" />
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-[#20211f] dark:text-[#f1f1ed]">{copy.emptyTitle}</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5d5f59] dark:text-[#c6c7c0]">{copy.emptyBody}</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-7 whitespace-nowrap rounded-xl bg-[#20211f] px-5 py-3 text-sm font-bold text-[#f1f1ed] transition hover:bg-[#b9473e] active:scale-[0.98] dark:bg-[#f1f1ed] dark:text-[#20211f] dark:hover:bg-[#ef7569]"
              >
                {copy.clear}
              </button>
            </div>
          )}

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#d85f53]/35 bg-[#d85f53]/10 p-5 text-sm leading-6 text-[#76382f] dark:text-[#f0a096]">
            <Info className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
            <p>{copy.warning}</p>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="overflow-hidden border-y border-[#d85f53]/35 bg-[#d85f53] py-4 text-[#1a1b19]">
          <div data-toxic-track className="flex w-max items-center">
            {[...TOXIC_FOODS, ...TOXIC_FOODS].map((food, index) => (
              <span key={`${food.name.en}-${index}`} className="flex items-center whitespace-nowrap px-6 text-sm font-bold sm:px-9">
                <ShieldAlert className="mr-3 h-4 w-4" aria-hidden="true" />
                {food.name[locale]}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-[#20211f] sm:text-6xl dark:text-[#f1f1ed]">{copy.poisonTitle}</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#5d5f59] dark:text-[#c6c7c0]">{copy.poisonBody}</p>

          <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:h-[20rem] lg:flex-row">
            {TOXIC_FOODS.slice(0, 6).map((food) => {
              const FoodIcon = food.icon;
              const isActive = activeFood === food.name.en.toLowerCase();
              return (
                <button
                  key={food.name.en}
                  type="button"
                  onClick={() => setActiveFood(food.name.en.toLowerCase())}
                  onMouseEnter={() => setActiveFood(food.name.en.toLowerCase())}
                  className={`group min-h-52 w-full overflow-hidden rounded-2xl border p-5 text-left transition-[flex,background-color,border-color] duration-700 ease-out active:scale-[0.99] sm:min-h-60 sm:p-6 lg:min-h-0 lg:min-w-0 lg:w-auto ${
                    isActive
                      ? "flex-[2.4] border-[#d85f53]/50 bg-[#d85f53] text-[#1a1b19]"
                      : "flex-1 border-[#d1d2cc] bg-[#deded8] text-[#20211f] dark:border-white/10 dark:bg-[#242523] dark:text-[#f1f1ed]"
                  }`}
                >
                  <div className="flex h-full flex-col">
                    <FoodIcon className="h-7 w-7 transition-transform duration-700 ease-out group-hover:scale-105" aria-hidden="true" />
                    <div className="pt-10">
                      <h3 className={`font-semibold tracking-[-0.035em] ${isActive ? "text-3xl text-[#1a1b19]" : "text-lg text-inherit"}`}>{food.name[locale]}</h3>
                      <p className={`mt-3 max-w-xs text-sm leading-6 transition-opacity duration-500 ${isActive ? "opacity-85" : "lg:opacity-0"}`}>{food.effect[locale]}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-6 lg:flex lg:h-[20rem] lg:flex-row">
            {TOXIC_FOODS.slice(6).map((food) => {
              const FoodIcon = food.icon;
              const isActive = activeFood === food.name.en.toLowerCase();
              return (
                <button
                  key={food.name.en}
                  type="button"
                  onClick={() => setActiveFood(food.name.en.toLowerCase())}
                  onMouseEnter={() => setActiveFood(food.name.en.toLowerCase())}
                  className={`group min-h-52 w-full overflow-hidden rounded-2xl border p-5 text-left transition-[flex,background-color,border-color] duration-700 ease-out active:scale-[0.99] sm:min-h-60 sm:p-6 lg:min-h-0 lg:min-w-0 lg:w-auto ${
                    isActive
                      ? "flex-[2.4] border-[#d85f53]/50 bg-[#d85f53] text-[#1a1b19]"
                      : "flex-1 border-[#d1d2cc] bg-[#deded8] text-[#20211f] dark:border-white/10 dark:bg-[#242523] dark:text-[#f1f1ed]"
                  }`}
                >
                  <div className="flex h-full flex-col">
                    <FoodIcon className="h-7 w-7 transition-transform duration-700 ease-out group-hover:scale-105" aria-hidden="true" />
                    <div className="pt-10">
                      <h3 className={`font-semibold tracking-[-0.035em] ${isActive ? "text-3xl text-[#1a1b19]" : "text-lg text-inherit"}`}>{food.name[locale]}</h3>
                      <p className={`mt-3 max-w-xs text-sm leading-6 transition-opacity duration-500 ${isActive ? "opacity-85" : "lg:opacity-0"}`}>{food.effect[locale]}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 md:py-32 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:gap-20">
          <div>
            <h2 className="text-4xl font-semibold tracking-[-0.05em] text-[#20211f] sm:text-6xl dark:text-[#f1f1ed]">{copy.guidanceTitle}</h2>
            <div className="mt-8 flex gap-2">
              <button
                type="button"
                onClick={() => setGuideIndex((current) => (current - 1 + copy.guidance.length) % copy.guidance.length)}
                className="grid h-12 w-12 place-items-center rounded-xl border border-[#c6c7c0] text-[#30312e] transition hover:border-[#d85f53] hover:text-[#b9473e] active:scale-[0.98] dark:border-white/15 dark:text-[#f1f1ed] dark:hover:text-[#ef7569]"
                aria-label={copy.previous}
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setGuideIndex((current) => (current + 1) % copy.guidance.length)}
                className="grid h-12 w-12 place-items-center rounded-xl bg-[#20211f] text-[#f1f1ed] transition hover:bg-[#b9473e] active:scale-[0.98] dark:bg-[#f1f1ed] dark:text-[#20211f] dark:hover:bg-[#ef7569]"
                aria-label={copy.next}
              >
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="relative min-h-[26rem]">
            {copy.guidance.map((item, index) => {
              const distance = (index - guideIndex + copy.guidance.length) % copy.guidance.length;
              return (
                <article
                  key={item.title}
                  aria-hidden={distance !== 0}
                  className="absolute inset-x-0 top-0 rounded-2xl border border-[#d1d2cc] bg-[#deded8] p-8 transition-all duration-700 ease-out dark:border-white/10 dark:bg-[#242523] sm:p-12"
                  style={{
                    transform: `translateY(${distance * 18}px) scale(${1 - distance * 0.035})`,
                    opacity: distance === 0 ? 1 : Math.max(0.2, 0.55 - distance * 0.14),
                    zIndex: copy.guidance.length - distance,
                  }}
                >
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#d85f53] text-[#1a1b19]">
                    <BookOpen className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-20 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-[#20211f] sm:text-5xl dark:text-[#f1f1ed]">{item.title}</h3>
                  <p className="mt-5 max-w-xl text-base leading-7 text-[#5d5f59] dark:text-[#c6c7c0]">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-28 pt-24 sm:px-6 md:pb-36 md:pt-32 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 rounded-2xl bg-[#20211f] px-6 py-12 text-[#f1f1ed] sm:px-10 md:grid-cols-[1fr_auto] md:items-end md:px-14 md:py-16">
          <div>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-[#f1f1ed] sm:text-6xl">{copy.ctaTitle}</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#c6c7c0]">{copy.ctaBody}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/clinics"
              className="inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#d85f53] px-5 text-sm font-bold text-[#1a1b19] transition hover:bg-[#ef7569] active:scale-[0.98]"
            >
              {copy.findClinic}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/emergency"
              className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-xl border border-white/25 px-5 text-sm font-bold text-[#f1f1ed] transition hover:border-[#ef7569] hover:text-[#ef7569] active:scale-[0.98]"
            >
              {copy.emergency}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
