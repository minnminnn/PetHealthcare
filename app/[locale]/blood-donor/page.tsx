import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  FileHeart,
  HeartHandshake,
  PhoneCall,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import type { Locale } from "@/i18n";
import { Link } from "@/lib/navigation";

interface PageProps {
  params: { locale: string };
}

const COPY = {
  en: {
    eyebrow: "PET BLOOD DONATION",
    title: "Donors change outcomes.",
    intro:
      "Learn what donation involves, review your pet's health record and connect with a veterinary clinic.",
    check: "Check eligibility",
    urgent: "Emergency guidance",
    imageAlt: "A pet owner at home with a dog and cat",
    strip: [
      "Clinic led process",
      "Compatibility testing required",
      "Owner consent at every step",
    ],
    responseEyebrow: "WHEN BLOOD IS NEEDED",
    responseTitle: "Start with a veterinary team, not a public match.",
    responseBody:
      "Blood collection and transfusion require examination, blood typing and clinical supervision. A clinic can confirm urgency and coordinate a compatible donor safely.",
    emergencyTitle: "Is your pet in immediate danger?",
    emergencyBody:
      "Use the emergency guide while you contact the nearest veterinary clinic.",
    emergencyCta: "Open emergency guide",
    clinicTitle: "Need a clinic to coordinate care?",
    clinicBody: "Find a nearby veterinary service and call before travelling.",
    clinicCta: "Find a clinic",
    groupsEyebrow: "COMPATIBILITY",
    groupsTitle: "Blood type is only the beginning.",
    groupsBody:
      "A veterinary team must type and crossmatch blood before a transfusion. Breed or appearance cannot confirm compatibility.",
    dog: "Dogs",
    cat: "Cats",
    dogTypes: [
      {
        name: "DEA 1 positive",
        body: "A common canine blood type. Compatibility still requires clinical testing.",
      },
      {
        name: "DEA 1 negative",
        body: "Often prioritised for donor programs, subject to full screening and crossmatching.",
      },
    ],
    catTypes: [
      {
        name: "Type A",
        body: "Common in many cat populations. It is not safely interchangeable with Type B.",
      },
      {
        name: "Type B",
        body: "Less common overall. Correct typing and crossmatching are especially important.",
      },
    ],
    eligibilityEyebrow: "DONOR READINESS",
    eligibilityTitle: "Let the clinic make the final call.",
    eligibilityBody:
      "These are useful starting points, but requirements differ by species, clinic and patient history.",
    requirements: [
      "Healthy adult with a calm temperament",
      "Current preventive care and vaccination history",
      "No known blood borne or infectious disease",
      "No recent transfusion, pregnancy or major illness",
      "Suitable weight, blood count and examination result",
    ],
    recordsTitle: "Bring a complete health record",
    recordsBody:
      "Keep vaccination dates, medicines, recent illness and prior transfusions in your pet passport so the veterinary team can screen safely.",
    recordsCta: "Review pet passport",
    noteTitle: "Important",
    noteBody:
      "PetCare does not collect, store or transfuse blood. All donor screening and procedures must be completed by a qualified veterinary team.",
  },
  vi: {
    eyebrow: "HIẾN MÁU THÚ CƯNG",
    title: "Nguồn máu thay đổi kết quả.",
    intro:
      "Tìm hiểu quy trình, kiểm tra hồ sơ sức khỏe và kết nối với phòng khám thú y.",
    check: "Kiểm tra điều kiện",
    urgent: "Hướng dẫn khẩn cấp",
    imageAlt: "Chủ nuôi ở nhà cùng chó và mèo",
    strip: [
      "Thực hiện tại phòng khám",
      "Bắt buộc kiểm tra tương thích",
      "Luôn cần sự đồng ý của chủ nuôi",
    ],
    responseEyebrow: "KHI CẦN TRUYỀN MÁU",
    responseTitle: "Bắt đầu với bác sĩ thú y, không tự ghép nguồn máu.",
    responseBody:
      "Lấy máu và truyền máu cần khám, định nhóm máu và giám sát lâm sàng. Phòng khám sẽ xác định mức độ khẩn cấp và điều phối nguồn máu tương thích an toàn.",
    emergencyTitle: "Thú cưng đang nguy kịch?",
    emergencyBody:
      "Mở hướng dẫn sơ cứu trong lúc liên hệ phòng khám thú y gần nhất.",
    emergencyCta: "Mở hướng dẫn khẩn cấp",
    clinicTitle: "Cần phòng khám điều phối?",
    clinicBody: "Tìm cơ sở thú y gần bạn và gọi trước khi di chuyển.",
    clinicCta: "Tìm phòng khám",
    groupsEyebrow: "TƯƠNG THÍCH",
    groupsTitle: "Nhóm máu chỉ là bước đầu.",
    groupsBody:
      "Bác sĩ cần định nhóm và thử phản ứng chéo trước khi truyền. Giống hoặc ngoại hình không thể xác định tương thích.",
    dog: "Chó",
    cat: "Mèo",
    dogTypes: [
      {
        name: "DEA 1 dương tính",
        body: "Một nhóm máu phổ biến ở chó. Vẫn cần kiểm tra tương thích tại phòng khám.",
      },
      {
        name: "DEA 1 âm tính",
        body: "Thường được ưu tiên trong chương trình hiến máu, sau khi sàng lọc đầy đủ.",
      },
    ],
    catTypes: [
      {
        name: "Nhóm A",
        body: "Phổ biến trong nhiều quần thể mèo. Không thể thay thế an toàn cho nhóm B.",
      },
      {
        name: "Nhóm B",
        body: "Ít phổ biến hơn. Việc định nhóm và thử phản ứng chéo đặc biệt quan trọng.",
      },
    ],
    eligibilityEyebrow: "SẴN SÀNG HIẾN MÁU",
    eligibilityTitle: "Hãy để phòng khám đưa ra kết luận.",
    eligibilityBody:
      "Đây là những tiêu chí tham khảo. Yêu cầu cụ thể tùy theo loài, phòng khám và tiền sử sức khỏe.",
    requirements: [
      "Trưởng thành, khỏe mạnh và có tính khí ổn định",
      "Có lịch tiêm phòng và phòng bệnh đầy đủ",
      "Không có bệnh truyền nhiễm hoặc bệnh lây qua đường máu",
      "Không mới truyền máu, mang thai hoặc mắc bệnh nặng",
      "Đạt cân nặng, chỉ số máu và kết quả khám phù hợp",
    ],
    recordsTitle: "Mang theo hồ sơ sức khỏe đầy đủ",
    recordsBody:
      "Lưu ngày tiêm phòng, thuốc đang dùng, bệnh gần đây và lịch sử truyền máu trong hộ chiếu thú cưng để bác sĩ sàng lọc an toàn.",
    recordsCta: "Xem hộ chiếu thú cưng",
    noteTitle: "Lưu ý quan trọng",
    noteBody:
      "PetCare không trực tiếp thu thập, lưu trữ hoặc truyền máu. Mọi bước sàng lọc và thực hiện phải do đội ngũ thú y có chuyên môn phụ trách.",
  },
} as const;

export default function BloodDonorPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale as Locale);
  const copy = COPY[locale === "vi" ? "vi" : "en"];

  return (
    <main className="min-h-screen overflow-hidden bg-[#efefeb] text-[#20211f] dark:bg-[#151614] dark:text-[#f1f1ed]">
      <section className="px-4 pb-10 pt-28 sm:px-6 sm:pb-14 lg:px-8 lg:pt-32">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
          <div className="max-w-xl">
            <p className="mb-5 text-xs font-semibold tracking-[0.2em] text-[#b9473e] dark:text-[#ef7569]">
              {copy.eyebrow}
            </p>
            <h1 className="max-w-[14ch] text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl dark:text-[#f1f1ed]">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#62635f] dark:text-[#b6b7b2] sm:text-lg">
              {copy.intro}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#eligibility"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#b9473e] px-5 text-sm font-semibold text-[#f8f8f5] transition-colors hover:bg-[#9f3e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9473e] focus-visible:ring-offset-2 dark:bg-[#ef7569] dark:text-[#151614] dark:hover:bg-[#f08b82]"
              >
                {copy.check}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/emergency"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#ccccc5] px-5 text-sm font-semibold transition-colors hover:bg-[#f8f8f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b9473e] dark:border-[#3b3c38] dark:hover:bg-[#20211f]"
              >
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                {copy.urgent}
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#deded8] dark:bg-[#20211f]">
            <Image
              src="/images/petcare-hero.webp"
              alt={copy.imageAlt}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 55vw, 100vw"
            />
          </div>
        </div>
      </section>

      <section
        className="border-y border-[#d9d9d2] px-4 dark:border-[#30312e] sm:px-6 lg:px-8"
        aria-label="Donation standards"
      >
        <div className="mx-auto grid max-w-7xl divide-y divide-[#d9d9d2] sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-[#30312e]">
          {[ShieldCheck, Droplets, HeartHandshake].map((Icon, index) => (
            <div
              key={copy.strip[index]}
              className="flex items-center gap-3 py-5 sm:px-5 sm:first:pl-0"
            >
              <Icon
                className="h-5 w-5 text-[#b9473e] dark:text-[#ef7569]"
                aria-hidden="true"
              />
              <span className="text-sm font-medium">{copy.strip[index]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#b9473e] dark:text-[#ef7569]">
                {copy.responseEyebrow}
              </p>
              <h2 className="mt-4 max-w-[13ch] text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl dark:text-[#f1f1ed]">
                {copy.responseTitle}
              </h2>
            </div>
            <div className="lg:pt-8">
              <p className="max-w-2xl text-base leading-7 text-[#62635f] dark:text-[#b6b7b2]">
                {copy.responseBody}
              </p>
              <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-[#d9d9d2] bg-[#d9d9d2] dark:border-[#30312e] dark:bg-[#30312e] md:grid-cols-2">
                <ActionPanel
                  icon={PhoneCall}
                  title={copy.emergencyTitle}
                  body={copy.emergencyBody}
                  href="/emergency"
                  cta={copy.emergencyCta}
                  urgent
                />
                <ActionPanel
                  icon={Stethoscope}
                  title={copy.clinicTitle}
                  body={copy.clinicBody}
                  href="/clinics"
                  cta={copy.clinicCta}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20  dark:text-[#f1f1ed]  sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#ef7569] dark:text-[#b9473e]">
                {copy.groupsEyebrow}
              </p>
              <h2 className="mt-4 max-w-[12ch] text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl dark:text-[#f1f1ed]">
                {copy.groupsTitle}
              </h2>
              <p className="mt-6 max-w-md text-sm leading-6  dark:text-[#b6b7b2] text-[#62635f]">
                {copy.groupsBody}
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <BloodGroup species={copy.dog} entries={copy.dogTypes} />
              <BloodGroup species={copy.cat} entries={copy.catTypes} />
            </div>
          </div>
        </div>
      </section>

      <section
        id="eligibility"
        className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#b9473e] dark:text-[#ef7569]">
                {copy.eligibilityEyebrow}
              </p>
              <h2 className="mt-4 max-w-[13ch] text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl dark:text-[#f1f1ed]">
                {copy.eligibilityTitle}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#62635f] dark:text-[#b6b7b2]">
                {copy.eligibilityBody}
              </p>
              <ul className="mt-8 space-y-4">
                {copy.requirements.map((requirement) => (
                  <li
                    key={requirement}
                    className="flex items-start gap-3 text-sm leading-6"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#b9473e] dark:text-[#ef7569]"
                      aria-hidden="true"
                    />
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#d9d9d2] bg-[#f8f8f5] dark:border-[#30312e] dark:bg-[#20211f]">
              <div className="relative aspect-[16/10]">
                <Image
                  src="/images/petcare-passport.webp"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 48vw, 100vw"
                />
              </div>
              <div className="p-6 sm:p-8">
                <FileHeart
                  className="h-6 w-6 text-[#b9473e] dark:text-[#ef7569]"
                  aria-hidden="true"
                />
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] dark:text-[#f1f1ed]">
                  {copy.recordsTitle}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#62635f] dark:text-[#b6b7b2]">
                  {copy.recordsBody}
                </p>
                <Link
                  href="/dashboard/pets"
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#20211f] px-4 text-sm font-semibold text-[#f8f8f5] transition-colors hover:bg-[#b9473e] dark:bg-[#ef7569] dark:text-[#151614] dark:hover:bg-[#f08b82]"
                >
                  {copy.recordsCta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-4 rounded-2xl border border-[#d9d9d2] bg-[#f8f8f5] p-6 dark:border-[#30312e] dark:bg-[#20211f] sm:p-8">
          <ClipboardCheck
            className="mt-0.5 h-6 w-6 shrink-0 text-[#b9473e] dark:text-[#ef7569]"
            aria-hidden="true"
          />
          <div>
            <h2 className="font-semibold dark:text-[#f1f1ed]">
              {copy.noteTitle}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-[#62635f] dark:text-[#b6b7b2]">
              {copy.noteBody}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function ActionPanel({
  icon: Icon,
  title,
  body,
  href,
  cta,
  urgent = false,
}: {
  icon: typeof PhoneCall;
  title: string;
  body: string;
  href: "/emergency" | "/clinics";
  cta: string;
  urgent?: boolean;
}) {
  return (
    <article className="flex min-h-64 flex-col bg-[#f8f8f5] p-6 dark:bg-[#20211f] sm:p-8">
      <Icon
        className={`h-6 w-6 ${urgent ? "text-[#b9473e] dark:text-[#ef7569]" : "text-[#62635f] dark:text-[#b6b7b2]"}`}
        aria-hidden="true"
      />
      <h3 className="mt-8 text-xl font-semibold tracking-[-0.025em] dark:text-[#f1f1ed]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#62635f] dark:text-[#b6b7b2]">
        {body}
      </p>
      <Link
        href={href}
        className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-[#b9473e] dark:text-[#ef7569]"
      >
        {cta}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

function BloodGroup({
  species,
  entries,
}: {
  species: string;
  entries: readonly { readonly name: string; readonly body: string }[];
}) {
  return (
    <article className="rounded-2xl border dark:border-[#30312e] border-[#d9d9d2] p-6 sm:p-7">
      <div className="flex items-center gap-3">
        <Droplets
          className="h-5 w-5 text-[#ef7569] dark:text-[#b9473e]"
          aria-hidden="true"
        />
        <h3 className="text-lg font-semibold dark:text-[#f1f1ed]">{species}</h3>
      </div>
      <div className="mt-7 divide-y dark:divide-[#30312e] divide-[#d9d9d2]">
        {entries.map((entry) => (
          <div key={entry.name} className="py-5 first:pt-0 last:pb-0">
            <p className="font-semibold ">{entry.name}</p>
            <p className="mt-2 text-sm leading-6 text-[#b6b7b2] dark:text-[#62635f]">
              {entry.body}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
