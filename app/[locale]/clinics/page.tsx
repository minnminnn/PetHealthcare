import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";
import type { Locale } from "@/i18n";
import {
  MapPin, Star, Clock, Phone, ChevronRight,
  Search, SlidersHorizontal, CheckCircle2, Filter,
  Zap, PawPrint,
} from "lucide-react";

interface PageProps {
  params: { locale: string };
}

const SAMPLE_CLINICS = [
  {
    id: "1",
    name: "Phòng khám Quốc Tế Sài Gòn Pet",
    address: "45 Nguyễn Thị Minh Khai, Q.1, TP.HCM",
    rating: 4.9,
    reviews: 1203,
    distance: 0.8,
    is24h: true,
    isVerified: true,
    isExotic: true,
    status: "available",
    phone: "028 3823 xxxx",
    image: "🏥",
  },
  {
    id: "2",
    name: "Animal Care Center Hà Nội",
    address: "12 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội",
    rating: 4.8,
    reviews: 842,
    distance: 1.4,
    is24h: true,
    isVerified: true,
    isExotic: false,
    status: "emergency",
    phone: "024 3828 xxxx",
    image: "🏨",
  },
  {
    id: "3",
    name: "PetVet Đà Nẵng",
    address: "78 Lê Duẩn, Hải Châu, Đà Nẵng",
    rating: 4.7,
    reviews: 456,
    distance: 2.1,
    is24h: false,
    isVerified: true,
    isExotic: true,
    status: "busy",
    phone: "0236 382 xxxx",
    image: "🏪",
  },
  {
    id: "4",
    name: "Phòng khám Thú Y Hòa Bình",
    address: "234 Cách Mạng Tháng 8, Q.3, TP.HCM",
    rating: 4.6,
    reviews: 318,
    distance: 3.0,
    is24h: false,
    isVerified: false,
    isExotic: false,
    status: "available",
    phone: "028 3957 xxxx",
    image: "🏬",
  },
];

const STATUS_CONFIG = {
  available: { label: "Đang mở cửa", color: "bg-green-100 text-green-700 border-green-200" },
  emergency: { label: "Trực 24/7",   color: "bg-red-100 text-red-700 border-red-200" },
  busy:      { label: "Đang đông",   color: "bg-amber-100 text-amber-700 border-amber-200" },
  closed:    { label: "Đóng cửa",    color: "bg-slate-100 text-slate-500 border-slate-200" },
} as const;

const SPECIES_TABS = ["Tất cả", "Chó", "Mèo", "Chim", "Bò sát", "Thú ngoại lai"];

export default function ClinicsPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale as Locale);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-primary-200 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Phòng khám</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <span className="text-primary-100 text-sm font-medium uppercase tracking-widest">
                  Mạng lưới phòng khám
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                Tìm Phòng Khám
                <br />
                <span className="text-primary-200">Thú Y Uy Tín</span>
              </h1>
              <p className="text-primary-100 text-lg max-w-xl">
                500+ phòng khám được xác minh trên toàn quốc. Lọc theo khoảng cách, loài và dịch vụ.
              </p>
            </div>

            {/* Stat chips */}
            <div className="grid grid-cols-3 gap-3 lg:w-72">
              {[
                { value: "500+", label: "Phòng khám" },
                { value: "24/7", label: "Trực cấp cứu" },
                { value: "98%", label: "Hài lòng" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20"
                >
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-primary-200 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-8 bg-white rounded-2xl p-1.5 flex gap-2 shadow-2xl max-w-3xl">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                id="clinic-search"
                type="text"
                placeholder="Tìm phòng khám theo tên, địa chỉ, chuyên khoa..."
                className="w-full text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
              />
            </div>
            <button id="clinic-search-btn" className="btn-medical px-6 py-2.5 text-sm">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">

        {/* Filter bar */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <PawPrint className="w-4 h-4" /> Loài:
              </span>
              {SPECIES_TABS.map((tab) => (
                <button
                  key={tab}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    tab === "Tất cả"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 sm:ml-auto flex-shrink-0">
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <SlidersHorizontal className="w-4 h-4" /> Lọc thêm
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4" /> Sắp xếp
              </button>
            </div>
          </div>
        </div>

        {/* Status pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all hover:scale-105 ${cfg.color}`}
            >
              <span className="w-2 h-2 rounded-full bg-current opacity-70" />
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        <p className="text-sm text-slate-500 mb-4 font-medium">
          Tìm thấy <span className="text-primary-600 font-bold">{SAMPLE_CLINICS.length}</span> phòng khám
        </p>

        {/* Clinic cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {SAMPLE_CLINICS.map((clinic) => {
            const status = STATUS_CONFIG[clinic.status as keyof typeof STATUS_CONFIG];
            return (
              <div key={clinic.id} className="card-base p-5 group shadow-none hover:shadow-none">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl">
                    {clinic.image}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + status */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="font-bold text-slate-800 text-base leading-tight truncate">
                        {clinic.name}
                      </h2>
                      <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Address */}
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                      <span className="truncate">{clinic.address}</span>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {clinic.isVerified && (
                        <span className="badge-verified">
                          <CheckCircle2 className="w-3 h-3" /> Đã xác minh
                        </span>
                      )}
                      {clinic.is24h && (
                        <span className="badge-emergency">
                          <Clock className="w-3 h-3" /> 24/7
                        </span>
                      )}
                      {clinic.isExotic && (
                        <span className="badge-exotic">
                          <Zap className="w-3 h-3" /> Thú ngoại lai
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {clinic.rating}
                          <span className="text-slate-400 font-normal">
                            ({clinic.reviews})
                          </span>
                        </span>
                        <span className="text-primary-600 font-medium">
                          {clinic.distance} km
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`tel:${clinic.phone}`}
                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Gọi điện"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <Link
                          href={`/clinics/${clinic.id}`}
                          className="btn-medical py-1.5 px-3 text-xs"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map placeholder */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-none overflow-hidden mb-10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              Bản đồ phòng khám
            </h2>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              Đang tích hợp OpenStreetMap
            </span>
          </div>
          <div className="h-64 bg-gradient-to-br from-slate-50 to-primary-50 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-primary-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium">Bản đồ tương tác sẽ xuất hiện ở đây</p>
            <p className="text-slate-400 text-xs">Tích hợp Leaflet + OpenStreetMap + PostGIS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
