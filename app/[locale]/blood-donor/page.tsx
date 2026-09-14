import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";
import type { Locale } from "@/i18n";
import {
  Droplets, Heart, ChevronRight, MapPin, Phone,
  CheckCircle2, Clock, AlertTriangle, ArrowRight,
  Users, PawPrint, Shield, Award, Info,
} from "lucide-react";

interface PageProps {
  params: { locale: string };
}

const BLOOD_TYPES = [
  {
    type: "DEA 1.1+",
    species: "Chó",
    description: "Phổ biến nhất ở chó. Người cho và người nhận phải cùng nhóm.",
    color: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
    donors: 42,
  },
  {
    type: "DEA 1.1−",
    species: "Chó",
    description: "Nhóm máu phổ biến thứ hai. Có thể cho tất cả chó nhận.",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    donors: 28,
  },
  {
    type: "Type A",
    species: "Mèo",
    description: "Chiếm ~99% mèo châu Á. Truyền máu nhóm B gây phản ứng nguy hiểm.",
    color: "bg-pink-100 text-pink-700 border-pink-200",
    dot: "bg-pink-500",
    donors: 61,
  },
  {
    type: "Type B",
    species: "Mèo",
    description: "Hiếm hơn, gặp ở Persian, British Shorthair. Cần quản lý cẩn thận.",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
    donors: 14,
  },
];

const RECENT_REQUESTS = [
  {
    id: "r1",
    species: "Chó",
    bloodType: "DEA 1.1−",
    location: "Q.7, TP.HCM",
    urgency: "high",
    postedAt: "30 phút trước",
    emoji: "🐶",
  },
  {
    id: "r2",
    species: "Mèo",
    bloodType: "Type B",
    location: "Tân Bình, TP.HCM",
    urgency: "medium",
    postedAt: "2 giờ trước",
    emoji: "🐱",
  },
  {
    id: "r3",
    species: "Chó",
    bloodType: "DEA 1.1+",
    location: "Hà Nội",
    urgency: "low",
    postedAt: "5 giờ trước",
    emoji: "🐕",
  },
];

const ELIGIBILITY = [
  { icon: "✅", text: "Cân nặng ≥ 25 kg (chó) hoặc ≥ 3.5 kg (mèo)" },
  { icon: "✅", text: "Từ 1 đến 8 tuổi, khỏe mạnh, đã tiêm phòng đầy đủ" },
  { icon: "✅", text: "Không mắc bệnh truyền nhiễm hoặc ký sinh trùng máu" },
  { icon: "✅", text: "Không nhận truyền máu trong 3 tháng gần nhất" },
  { icon: "✅", text: "Hematocrit ≥ 40% (chó), ≥ 35% (mèo)" },
  { icon: "❌", text: "Không dùng thuốc chống đông máu hoặc kháng viêm NSAIDs" },
];

const STATS = [
  { value: "300+", label: "Thú cưng hiến máu", icon: PawPrint, color: "text-pink-600" },
  { value: "1,200+", label: "Ca phẫu thuật được cứu", icon: Heart, color: "text-red-600" },
  { value: "45", label: "Phòng khám liên kết", icon: MapPin, color: "text-primary-600" },
  { value: "24/7", label: "Hỗ trợ khẩn cấp", icon: Clock, color: "text-amber-600" },
];

export default function BloodDonorPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale as Locale);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-red-700 via-pink-600 to-rose-500 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-2 text-red-200 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Hiến máu</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <span className="text-red-100 text-sm font-medium uppercase tracking-widest">
                  Pet Blood Donation Network
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                Hiến Máu Thú Cưng
                <br />
                <span className="text-red-200">Cứu Sống Bạn Bè</span>
              </h1>
              <p className="text-red-100 text-lg max-w-lg mb-6">
                Kết nối thú cưng hiến máu tình nguyện với các ca phẫu thuật khẩn cấp trong mạng lưới 45 phòng khám liên kết toàn quốc.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  id="register-donor-btn"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all hover:scale-105 shadow-xl"
                >
                  <Heart className="w-5 h-5" />
                  Đăng ký hiến máu
                </button>
                <button
                  id="request-blood-btn"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white border-2 border-white/40 rounded-xl font-bold hover:bg-white/30 transition-all"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Yêu cầu máu khẩn cấp
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="lg:w-72 grid grid-cols-2 gap-3">
              {STATS.map(({ value, label, icon: Icon, color }) => (
                <div
                  key={label}
                  className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center"
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} style={{ color: "white" }} />
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-xs text-red-200 mt-0.5 leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">

        {/* Urgent requests */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Yêu cầu máu khẩn cấp</h2>
                <p className="text-sm text-slate-500">Đang cần máu tại các phòng khám</p>
              </div>
            </div>
            <span className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-full font-bold animate-pulse border border-red-200">
              {RECENT_REQUESTS.length} ca cần máu
            </span>
          </div>

          <div className="space-y-3">
            {RECENT_REQUESTS.map((req) => (
              <div
                key={req.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] ${
                  req.urgency === "high"
                    ? "bg-red-50 border-red-200"
                    : req.urgency === "medium"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <span className="text-3xl">{req.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-bold text-slate-800">
                      {req.species} — Nhóm máu{" "}
                      <span className="text-red-600">{req.bloodType}</span>
                    </span>
                    {req.urgency === "high" && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                        Khẩn cấp
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {req.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {req.postedAt}
                    </span>
                  </div>
                </div>
                <button
                  id={`respond-request-${req.id}`}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    req.urgency === "high"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-primary-600 hover:bg-primary-700 text-white"
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  Hỗ trợ
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Blood types */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-red-500" />
            Nhóm máu thú cưng
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BLOOD_TYPES.map((bt) => (
              <div key={`${bt.type}-${bt.species}`} className={`card-base p-5 border-t-4 border-t-current`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-3 h-3 rounded-full ${bt.dot}`} />
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full border ${bt.color}`}>
                    {bt.type}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium mb-2">{bt.species}</div>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">{bt.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary-500" />
                  <span className="font-bold text-primary-700">{bt.donors}</span>
                  <span className="text-slate-500">người cho đang đăng ký</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary-600" />
              Tiêu chí thú cưng hiến máu
            </h2>
            <div className="space-y-3">
              {ELIGIBILITY.map((e) => (
                <div key={e.text} className="flex items-start gap-3 text-sm">
                  <span className="text-lg leading-none flex-shrink-0 mt-0.5">{e.icon}</span>
                  <span className={e.icon === "❌" ? "text-red-600" : "text-slate-700"}>
                    {e.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Register CTA */}
          <div className="bg-gradient-to-br from-red-600 to-pink-600 rounded-2xl p-6 text-white">
            <div className="p-3 bg-white/20 rounded-xl w-fit mb-4">
              <Award className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Đăng ký ngay hôm nay</h2>
            <p className="text-red-100 text-sm mb-6 leading-relaxed">
              Mỗi lần hiến máu của thú cưng bạn có thể cứu sống đến 3 thú cưng khác.
              Đây là nghĩa cử cao đẹp nhất mà bạn và thú cưng có thể làm.
            </p>
            <div className="space-y-3 mb-6">
              {[
                "Nhận giấy chứng nhận và huy hiệu tình nguyện",
                "Khám sức khỏe miễn phí trước mỗi lần hiến",
                "Ưu tiên được hỗ trợ khi cần máu",
              ].map((b) => (
                <div key={b} className="flex items-center gap-2 text-sm text-red-100">
                  <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
                  {b}
                </div>
              ))}
            </div>
            <button
              id="register-donor-cta-btn"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all"
            >
              <Heart className="w-5 h-5" />
              Đăng ký hiến máu
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-10 flex gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 leading-relaxed">
            Mọi quy trình hiến máu được thực hiện bởi bác sĩ thú y có chuyên môn tại phòng khám liên kết. 
            PetCare Vietnam không trực tiếp thu thập máu. Chúng tôi là cầu nối kết nối cộng đồng.
          </p>
        </div>
      </div>
    </div>
  );
}
