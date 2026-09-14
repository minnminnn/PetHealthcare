import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";
import type { Locale } from "@/i18n";
import {
  Video, ChevronRight, Star, Clock, CheckCircle2,
  Calendar, Shield, CreditCard, Mic, Monitor,
  UserCircle, Stethoscope, ArrowRight, PawPrint,
} from "lucide-react";

interface PageProps {
  params: { locale: string };
}

const VETS = [
  {
    id: "v1",
    name: "BS. Nguyễn Minh Tuấn",
    specialty: "Nội khoa & Tim mạch",
    experience: "12 năm",
    rating: 4.9,
    reviews: 634,
    price: 150000,
    available: true,
    nextSlot: "Hôm nay, 14:30",
    species: ["Chó", "Mèo"],
    languages: ["Tiếng Việt", "English"],
    avatar: "👨‍⚕️",
    verified: true,
  },
  {
    id: "v2",
    name: "BS. Trần Thị Lan Anh",
    specialty: "Thú ngoại lai & Da liễu",
    experience: "8 năm",
    rating: 4.8,
    reviews: 412,
    price: 180000,
    available: true,
    nextSlot: "Hôm nay, 16:00",
    species: ["Chim", "Bò sát", "Thỏ"],
    languages: ["Tiếng Việt"],
    avatar: "👩‍⚕️",
    verified: true,
  },
  {
    id: "v3",
    name: "BS. Lê Hồng Phúc",
    specialty: "Phẫu thuật & Chỉnh hình",
    experience: "15 năm",
    rating: 4.9,
    reviews: 891,
    price: 250000,
    available: false,
    nextSlot: "Ngày mai, 09:00",
    species: ["Chó", "Mèo"],
    languages: ["Tiếng Việt", "English"],
    avatar: "👨‍⚕️",
    verified: true,
  },
  {
    id: "v4",
    name: "BS. Phạm Thu Hiền",
    specialty: "Sản khoa & Sinh sản",
    experience: "6 năm",
    rating: 4.7,
    reviews: 267,
    price: 120000,
    available: true,
    nextSlot: "Hôm nay, 15:00",
    species: ["Chó", "Mèo"],
    languages: ["Tiếng Việt"],
    avatar: "👩‍⚕️",
    verified: false,
  },
];

const HOW_IT_WORKS = [
  { step: "01", icon: UserCircle, title: "Chọn bác sĩ", desc: "Lọc theo chuyên khoa, loài thú cưng và lịch trống." },
  { step: "02", icon: Calendar, title: "Đặt lịch hẹn", desc: "Chọn khung giờ phù hợp và đặt cọc phí tư vấn." },
  { step: "03", icon: CreditCard, title: "Thanh toán", desc: "VNPAY, MoMo, ZaloPay hoặc thẻ quốc tế Visa/MC." },
  { step: "04", icon: Video, title: "Tư vấn video", desc: "Kết nối trực tiếp qua video call HD với bác sĩ." },
];

const SPECIALTIES = [
  "Tất cả", "Nội khoa", "Ngoại khoa", "Da liễu", "Tim mạch",
  "Thú ngoại lai", "Sản khoa", "Nhãn khoa",
];

export default function TeleVetPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale as Locale);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-violet-700 via-purple-600 to-primary-600 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-2 text-violet-200 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Tư vấn online</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <span className="text-violet-100 text-sm font-medium uppercase tracking-widest">
                  Tele-Vet Platform
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                Tư Vấn Thú Y
                <br />
                <span className="text-violet-200">Trực Tuyến 1-1</span>
              </h1>
              <p className="text-violet-100 text-lg max-w-lg mb-6">
                Kết nối với bác sĩ thú y được chứng nhận qua video call HD. Tư vấn ngay từ nhà, không cần chờ đợi.
              </p>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                  <Shield className="w-4 h-4 text-violet-200" />
                  <span className="text-sm text-white font-medium">Bác sĩ được xác minh</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                  <Clock className="w-4 h-4 text-violet-200" />
                  <span className="text-sm text-white font-medium">Sẵn sàng trong 15 phút</span>
                </div>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                  <Monitor className="w-4 h-4 text-violet-200" />
                  <span className="text-sm text-white font-medium">HD Video &amp; Audio</span>
                </div>
              </div>
            </div>

            {/* How it works (small cards on hero) */}
            <div className="lg:w-80 grid grid-cols-2 gap-3">
              {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
                <div
                  key={step}
                  className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <div className="text-2xl font-black text-white/30 mb-1">{step}</div>
                  <Icon className="w-5 h-5 text-violet-200 mb-2" />
                  <div className="text-sm font-bold text-white mb-1">{title}</div>
                  <div className="text-xs text-violet-200 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">

        {/* Filter bar */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Specialty tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <Stethoscope className="w-4 h-4" /> Chuyên khoa:
              </span>
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    s === "Tất cả"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Species select */}
            <div className="sm:ml-auto flex items-center gap-2 flex-shrink-0">
              <PawPrint className="w-4 h-4 text-slate-400" />
              <select className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-violet-400 bg-white">
                <option>Tất cả loài</option>
                <option>Chó</option>
                <option>Mèo</option>
                <option>Chim</option>
                <option>Thú ngoại lai</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vet cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {VETS.map((vet) => (
            <div key={vet.id} className="card-base p-5 group">
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition-transform">
                  {vet.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Name + availability */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-slate-800 text-base">{vet.name}</h2>
                        {vet.verified && (
                          <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-violet-600 font-medium">{vet.specialty}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        vet.available
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      {vet.available ? "Sẵn sàng" : "Đang bận"}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-sm mb-2">
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {vet.rating}
                      <span className="text-slate-400 font-normal">({vet.reviews})</span>
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 text-xs">{vet.experience} kinh nghiệm</span>
                  </div>

                  {/* Species + languages */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {vet.species.map((s) => (
                      <span key={s} className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                        {s}
                      </span>
                    ))}
                    {vet.languages.map((l) => (
                      <span key={l} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {l}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {vet.nextSlot}
                      </div>
                      <div className="text-base font-bold text-primary-700">
                        {vet.price.toLocaleString("vi-VN")}₫
                        <span className="text-xs font-normal text-slate-500"> / buổi</span>
                      </div>
                    </div>
                    <button
                      id={`book-vet-${vet.id}`}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                        vet.available
                          ? "btn-medical"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                      disabled={!vet.available}
                    >
                      <Video className="w-3.5 h-3.5" />
                      {vet.available ? "Đặt lịch" : "Không khả dụng"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-violet-600 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white">
          <div className="p-3 bg-white/20 rounded-xl">
            <CreditCard className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-xl mb-1">Nhiều phương thức thanh toán</h2>
            <p className="text-primary-100 text-sm">
              VNPAY, MoMo, ZaloPay, Visa, Mastercard. Hoàn tiền 100% nếu bác sĩ hủy lịch.
            </p>
          </div>
          <div className="flex gap-2 text-2xl">
            {["💳", "📱", "🏦"].map((e) => (
              <span key={e} className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                {e}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
