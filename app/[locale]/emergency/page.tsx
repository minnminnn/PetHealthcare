import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";
import type { Locale } from "@/i18n";
import {
  AlertTriangle, Phone, MapPin, ChevronRight, Clock,
  Siren, Zap, HeartPulse, Navigation, MessageSquare,
  CheckCircle2, ArrowRight,
} from "lucide-react";

interface PageProps {
  params: { locale: string };
}

const EMERGENCY_CLINICS = [
  {
    id: "e1",
    name: "Phòng khám Quốc Tế Sài Gòn Pet",
    phone: "028 3823 0000",
    address: "45 Nguyễn Thị Minh Khai, Q.1, TP.HCM",
    distance: 0.8,
    waitTime: "< 5 phút",
    isOpen: true,
  },
  {
    id: "e2",
    name: "Animal Emergency Center HCM",
    phone: "028 6250 0000",
    address: "160 Phan Đình Phùng, Phú Nhuận, TP.HCM",
    distance: 1.5,
    waitTime: "10–15 phút",
    isOpen: true,
  },
  {
    id: "e3",
    name: "Pet SOS 24H Bình Thạnh",
    phone: "028 3516 0000",
    address: "72 Đinh Bộ Lĩnh, Bình Thạnh, TP.HCM",
    distance: 2.3,
    waitTime: "15–20 phút",
    isOpen: true,
  },
];

const FIRST_AID_TIPS = [
  {
    icon: "🩸",
    title: "Chảy máu",
    desc: "Ép chặt vết thương bằng vải sạch. Không tháo ra cho đến khi đến phòng khám.",
    urgency: "high",
  },
  {
    icon: "☠️",
    title: "Nuốt phải độc tố",
    desc: "Không gây nôn nếu không có chỉ dẫn bác sĩ. Giữ mẫu chất đã nuốt nếu có.",
    urgency: "high",
  },
  {
    icon: "💨",
    title: "Khó thở",
    desc: "Giữ thú cưng ở tư thế thoải mái, không thắt cổ. Di chuyển ngay lập tức.",
    urgency: "high",
  },
  {
    icon: "🦴",
    title: "Gãy xương",
    desc: "Cố định chi bằng tấm phẳng. Không cố nắn lại. Hạn chế cử động.",
    urgency: "medium",
  },
  {
    icon: "🌡️",
    title: "Sốt cao",
    desc: "Làm mát bằng khăn ướt ở nách và háng. Không dùng thuốc người.",
    urgency: "medium",
  },
  {
    icon: "😵",
    title: "Co giật",
    desc: "Dọn đồ vật xung quanh. Không giữ miệng. Ghi lại thời gian co giật.",
    urgency: "medium",
  },
];

export default function EmergencyPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale as Locale);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Emergency Hero ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-red-700 via-red-600 to-orange-500 py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-red-200 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Khẩn cấp</span>
          </div>

          {/* Pulsing alert badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span className="text-white text-sm font-bold tracking-wide">ĐƯỜNG DÂY KHẨN CẤP 24/7</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Hỗ Trợ Khẩn Cấp
            <br />
            <span className="text-red-200">Thú Cưng 24/7</span>
          </h1>
          <p className="text-red-100 text-lg max-w-2xl mb-8">
            Trong tình huống khẩn cấp, mỗi giây đều quý giá. Gọi ngay đường dây hỗ trợ hoặc tìm phòng khám gần nhất.
          </p>

          {/* Big call button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="tel:1800599990"
              id="emergency-call-btn"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-red-600 rounded-2xl font-bold text-lg shadow-2xl hover:bg-red-50 transition-all hover:scale-105 active:scale-95"
            >
              <Phone className="w-6 h-6" />
              1800 599 990
              <span className="text-sm font-normal text-red-400">Miễn phí</span>
            </a>
            <button
              id="emergency-locate-btn"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm text-white border-2 border-white/40 rounded-2xl font-bold text-lg hover:bg-white/30 transition-all"
            >
              <Navigation className="w-6 h-6" />
              Tìm phòng khám gần nhất
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">

        {/* Nearest clinics */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-6 mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-red-100 rounded-xl">
              <Siren className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Phòng khám cấp cứu gần bạn</h2>
              <p className="text-sm text-slate-500">Đang trực 24/7 — Dữ liệu thời gian thực</p>
            </div>
          </div>

          <div className="space-y-3">
            {EMERGENCY_CLINICS.map((clinic, i) => (
              <div
                key={clinic.id}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50/30 transition-all group"
              >
                {/* Rank */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                  i === 0 ? "bg-red-500" : i === 1 ? "bg-orange-500" : "bg-amber-500"
                }`}>
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-slate-800 truncate">{clinic.name}</h3>
                    {clinic.isOpen && (
                      <span className="flex-shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                        Đang mở
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary-400" />
                      {clinic.distance} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      Chờ: {clinic.waitTime}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <a
                    href={`tel:${clinic.phone}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-xl transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Gọi ngay
                  </a>
                  <Link
                    href={`/clinics/${clinic.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Chỉ đường
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Triage CTA */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-xl mb-1">Trợ lý sơ cứu AI</h2>
              <p className="text-violet-100 text-sm">
                Mô tả tình trạng của thú cưng và nhận hướng dẫn sơ cứu tức thì trong khi chờ đến phòng khám.
              </p>
            </div>
            <button
              id="ai-triage-btn"
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-white text-violet-700 rounded-xl font-bold hover:bg-violet-50 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Hỏi AI ngay
            </button>
          </div>
        </div>

        {/* First aid tips */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-amber-100 rounded-xl">
              <HeartPulse className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Hướng dẫn sơ cứu nhanh</h2>
              <p className="text-sm text-slate-500">Những bước cơ bản để ổn định tình trạng thú cưng</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FIRST_AID_TIPS.map((tip) => (
              <div
                key={tip.title}
                className={`card-base p-5 border-l-4 ${
                  tip.urgency === "high" ? "border-l-red-400" : "border-l-amber-400"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{tip.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-800">{tip.title}</h3>
                      {tip.urgency === "high" && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                          Nguy cấp
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warning banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-10 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-800 mb-1">Lưu ý quan trọng</h3>
            <p className="text-sm text-amber-700 leading-relaxed">
              Các hướng dẫn sơ cứu chỉ mang tính tạm thời. Hãy đưa thú cưng đến phòng khám thú y có chuyên môn
              càng sớm càng tốt. Không tự ý cho thuốc dành cho người.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
