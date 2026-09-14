import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
// ✅ Use next-intl Link — locale prefix is injected automatically
import { Link } from "@/lib/navigation";
import {
  ArrowRight, MapPin, Stethoscope, Shield, Clock,
  Star, ChevronRight, PawPrint, Zap, Users, Activity
} from "lucide-react";
import { SmartSearchBar } from "@/components/search/SmartSearchBar";
import type { Locale } from "@/i18n";

interface PageProps {
  params: { locale: string };
}

const STATS = [
  { label: "Phòng khám", value: "500+", icon: MapPin, color: "text-primary-600" },
  { label: "Bác sĩ thú y", value: "1,200+", icon: Stethoscope, color: "text-secondary-600" },
  { label: "Thú cưng", value: "50,000+", icon: PawPrint, color: "text-amber-500" },
  { label: "Ca cứu thành công", value: "98%", icon: Activity, color: "text-green-600" },
];

const FEATURES = [
  {
    icon: MapPin,
    title: "Tìm kiếm thông minh",
    description: "Tìm phòng khám gần nhất theo bán kính với thuật toán địa lý PostGIS, hỗ trợ tiếng Việt không dấu.",
    color: "bg-primary-100 text-primary-600",
    gradient: "from-primary-500 to-primary-700",
  },
  {
    icon: Shield,
    title: "Hộ chiếu thú y số",
    description: "Mã QR riêng cho từng thú cưng. Bác sĩ quét để xem toàn bộ lịch sử bệnh án, vaccine, đơn thuốc.",
    color: "bg-secondary-100 text-secondary-600",
    gradient: "from-secondary-500 to-secondary-700",
  },
  {
    icon: Zap,
    title: "SOS khẩn cấp 24/7",
    description: "Một chạm kích hoạt hỗ trợ khẩn cấp, hiển thị 3 phòng khám gần nhất đang trực và AI sơ cứu.",
    color: "bg-red-100 text-red-600",
    gradient: "from-red-500 to-red-700",
  },
  {
    icon: Clock,
    title: "Nhắc nhở tự động",
    description: "Hệ thống tự động tính lịch tiêm phòng, tẩy giun, thuốc phòng ve bọ chét và gửi thông báo.",
    color: "bg-amber-100 text-amber-600",
    gradient: "from-amber-500 to-amber-700",
  },
  {
    icon: Users,
    title: "Mạng lưới hiến máu",
    description: "Kết nối thú cưng hiến máu tình nguyện với phòng khám trong tình huống khẩn cấp theo nhóm máu.",
    color: "bg-pink-100 text-pink-600",
    gradient: "from-pink-500 to-pink-700",
  },
  {
    icon: Stethoscope,
    title: "Tư vấn trực tuyến",
    description: "Đặt lịch tư vấn video 1-1 với bác sĩ thú y. Thanh toán qua VNPAY, MoMo hoặc thẻ quốc tế.",
    color: "bg-violet-100 text-violet-600",
    gradient: "from-violet-500 to-violet-700",
  },
];

const TRUSTED_CLINICS = [
  { name: "Phòng khám Quốc Tế Hà Nội", rating: 4.9, reviews: 842, isExotic: true, is24h: true },
  { name: "Animal Care Center HCM", rating: 4.8, reviews: 1203, isExotic: false, is24h: true },
  { name: "PetVet Đà Nẵng", rating: 4.7, reviews: 456, isExotic: true, is24h: false },
];

export default function HomePage({ params: { locale } }: PageProps) {
  setRequestLocale(locale as Locale);
  const t = useTranslations();

  return (
    <div className="min-h-screen">

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION                                                       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-secondary-900 pt-16">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary-600/20 rounded-full blur-3xl animate-float [animation-delay:1.5s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />
          {/* Grid overlay */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-primary-200 font-medium">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Nền tảng sức khỏe thú cưng #1 Việt Nam
            </div>

            {/* Main heading */}
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Chăm sóc thú cưng{" "}
              <span className="bg-gradient-to-r from-primary-300 to-secondary-300 bg-clip-text text-transparent">
                toàn diện
              </span>
              {" "}chỉ trong một ứng dụng
            </h1>

            <p className="text-xl text-primary-200 leading-relaxed max-w-2xl mx-auto">
              Tìm phòng khám thú y uy tín, lưu trữ hồ sơ y tế số, đặt lịch tư vấn trực tuyến
              và nhận hỗ trợ khẩn cấp 24/7 — mọi lúc, mọi nơi.
            </p>

            {/* Smart Search */}
            <div className="max-w-2xl mx-auto animate-fade-in">
              <SmartSearchBar locale={locale as Locale} />
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="btn-medical text-base px-8 py-4 text-lg"
              >
                Bắt đầu miễn phí
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/clinics"
                className="flex items-center gap-2 text-primary-200 hover:text-white font-medium transition-colors"
              >
                Khám phá phòng khám
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative h-16">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full">
            <path d="M0 64L60 56C120 48 240 32 360 24C480 16 600 16 720 21.3C840 27 960 37 1080 42.7C1200 48 1320 48 1380 48L1440 48V64H1380C1320 64 1200 64 1080 64C960 64 840 64 720 64C600 64 480 64 360 64C240 64 120 64 60 64H0Z" fill="#FFFFFF"/>
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* STATS                                                              */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <div key={i} className="stat-card group hover:shadow-medical transition-all duration-300">
                <stat.icon className={`w-8 h-8 mb-3 ${stat.color} group-hover:scale-110 transition-transform`} />
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* FEATURES                                                           */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-background-secondary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Mọi thứ bạn cần cho{" "}
              <span className="text-gradient-medical">sức khỏe thú cưng</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Từ tìm kiếm phòng khám đến hộ chiếu y tế số — nền tảng đầy đủ nhất cho chủ nuôi thú cưng Việt Nam.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="card-base p-6 group cursor-default"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* TRUSTED CLINICS PREVIEW                                            */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Phòng khám tin cậy</h2>
              <p className="text-slate-600 mt-2">Được xác minh và đánh giá bởi cộng đồng</p>
            </div>
            <Link
              href="/clinics"
              className="btn-outline hidden sm:inline-flex"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRUSTED_CLINICS.map((clinic, i) => (
              <div key={i} className="card-base p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-medical flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 text-sm truncate">{clinic.name}</h4>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-slate-700">{clinic.rating}</span>
                      <span className="text-xs text-slate-400">({clinic.reviews} đánh giá)</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {clinic.is24h && <span className="badge-emergency">24/7</span>}
                  {clinic.isExotic && <span className="badge-exotic">🦜 Exotic</span>}
                  <span className="badge-verified">✓ Đã xác minh</span>
                </div>
                <Link
                  href="/clinics"
                  className="btn-outline text-sm justify-center py-2"
                >
                  Đặt lịch khám
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link href="/clinics" className="btn-outline">
              Xem tất cả phòng khám
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* CTA BANNER                                                         */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-800 to-secondary-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Bắt đầu chăm sóc thú cưng thông minh hơn ngay hôm nay
          </h2>
          <p className="text-primary-200 text-lg mb-8">
            Miễn phí 100% cho chủ thú cưng. Không cần thẻ tín dụng.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="btn-medical text-base px-8 py-4 bg-white text-primary-700 hover:bg-primary-50 shadow-xl"
            >
              Tạo tài khoản miễn phí
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/clinics"
              className="flex items-center justify-center gap-2 text-white/80 hover:text-white font-medium transition-colors py-4"
            >
              Tìm phòng khám gần bạn →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                             */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-medical flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-white font-bold text-lg">PetCare</span>
                  <div className="text-[10px] text-primary-400 font-medium">VIETNAM</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                Nền tảng sức khỏe thú cưng toàn diện đầu tiên tại Việt Nam.
              </p>
            </div>
            {[
              { title: "Dịch vụ", links: ["Tìm phòng khám", "Tư vấn online", "Hộ chiếu thú y", "Hiến máu"] },
              { title: "Hỗ trợ", links: ["Trung tâm trợ giúp", "Liên hệ", "Chính sách bảo mật", "Điều khoản"] },
              { title: "Đối tác", links: ["Đăng ký phòng khám", "API cho nhà phát triển", "Báo chí & Truyền thông"] },
            ].map((col) => (
              <div key={col.title}>
                <h6 className="text-white font-semibold mb-4">{col.title}</h6>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 mt-10 pt-6 text-center text-sm">
            © {new Date().getFullYear()} PetCare Vietnam. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
