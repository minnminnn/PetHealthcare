import { setRequestLocale } from "next-intl/server";
import { Link } from "@/lib/navigation";
import type { Locale } from "@/i18n";
import {
  FlaskConical, Search, ChevronRight, AlertTriangle,
  CheckCircle2, Info, BookOpen, PawPrint, Filter,
  Pill, ShieldAlert, Leaf, Package,
} from "lucide-react";

interface PageProps {
  params: { locale: string };
}

const CATEGORIES = [
  { id: "all", label: "Tất cả", icon: Package },
  { id: "antibiotic", label: "Kháng sinh", icon: Pill },
  { id: "antiparasitic", label: "Chống ký sinh trùng", icon: Leaf },
  { id: "supplement", label: "Thực phẩm bổ sung", icon: FlaskConical },
  { id: "toxic", label: "Chất độc cần tránh", icon: ShieldAlert },
];

const SAMPLE_DRUGS = [
  {
    id: "d1",
    name: "Amoxicillin",
    category: "antibiotic",
    description: "Kháng sinh phổ rộng nhóm penicillin, thường dùng cho nhiễm khuẩn da, tai, đường hô hấp.",
    species: ["Chó", "Mèo"],
    dosage: "10–20 mg/kg mỗi 8–12 giờ",
    safe: true,
    emoji: "💊",
  },
  {
    id: "d2",
    name: "Ivermectin",
    category: "antiparasitic",
    description: "Thuốc chống ký sinh trùng phổ rộng. NGUY HIỂM với một số giống chó mang gen MDR1.",
    species: ["Chó", "Mèo", "Thỏ"],
    dosage: "Theo chỉ dẫn bác sĩ",
    safe: null,
    emoji: "⚠️",
  },
  {
    id: "d3",
    name: "Paracetamol (Acetaminophen)",
    category: "toxic",
    description: "CỰC KỲ ĐỘC với mèo. Gây tổn thương gan và tử vong ngay cả ở liều nhỏ. Không bao giờ dùng.",
    species: ["Mèo"],
    dosage: "KHÔNG DÙNG",
    safe: false,
    emoji: "☠️",
  },
  {
    id: "d4",
    name: "Omega-3 (DHA/EPA)",
    category: "supplement",
    description: "Bổ sung acid béo, hỗ trợ sức khỏe da, lông, tim mạch và khớp cho thú cưng.",
    species: ["Chó", "Mèo"],
    dosage: "20–55 mg/kg/ngày EPA+DHA",
    safe: true,
    emoji: "🐟",
  },
  {
    id: "d5",
    name: "Metronidazole",
    category: "antibiotic",
    description: "Điều trị nhiễm khuẩn kỵ khí và ký sinh trùng đường ruột (Giardia, Trichomonas).",
    species: ["Chó", "Mèo"],
    dosage: "10–15 mg/kg mỗi 12 giờ",
    safe: true,
    emoji: "💉",
  },
  {
    id: "d6",
    name: "Ibuprofen (Advil)",
    category: "toxic",
    description: "Cực độc với chó và mèo. Gây loét dạ dày, suy thận, và tử vong. Không bao giờ dùng.",
    species: ["Chó", "Mèo"],
    dosage: "KHÔNG DÙNG",
    safe: false,
    emoji: "🚫",
  },
];

const TOXIC_FOODS = [
  { emoji: "🍫", name: "Chocolate", effect: "Độc tố theobromine gây co giật" },
  { emoji: "🧅", name: "Hành & Tỏi", effect: "Phá hủy hồng cầu (thiếu máu)" },
  { emoji: "🍇", name: "Nho & Nho khô", effect: "Suy thận cấp, nguy hiểm tính mạng" },
  { emoji: "🥑", name: "Bơ (Avocado)", effect: "Persin gây nôn, tiêu chảy, khó thở" },
  { emoji: "☕", name: "Caffeine", effect: "Tim đập nhanh, co giật, tử vong" },
  { emoji: "🌰", name: "Mắc ca", effect: "Yếu cơ, nôn, sốt, run rẩy" },
];

export default function PharmacyPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale as Locale);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-teal-700 via-secondary-600 to-primary-600 pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-2 text-teal-200 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Dược phẩm</span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <span className="text-teal-100 text-sm font-medium uppercase tracking-widest">
              Thư viện dược phẩm thú y
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
            Tra Cứu Thuốc &
            <br />
            <span className="text-teal-200">Cảnh Báo Độc Tố</span>
          </h1>
          <p className="text-teal-100 text-lg max-w-xl mb-8">
            Thư viện 1,000+ dược phẩm thú y. Tra cứu liều dùng, tác dụng phụ và danh sách chất cấm theo loài.
          </p>

          {/* Search */}
          <div className="bg-white rounded-2xl p-1.5 flex gap-2 shadow-2xl max-w-2xl">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                id="pharmacy-search"
                type="text"
                placeholder="Tìm thuốc, hoạt chất, thực phẩm nguy hiểm..."
                className="w-full text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
              />
            </div>
            <button id="pharmacy-search-btn" className="btn-medical px-6 py-2.5 text-sm">
              Tra cứu
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            <span className="font-bold">Lưu ý:</span> Thông tin chỉ mang tính tham khảo.
            Luôn tham khảo bác sĩ thú y có chuyên môn trước khi sử dụng bất kỳ loại thuốc nào.
          </p>
        </div>

        {/* Category tabs + Filter */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    id === "all"
                      ? "bg-secondary-600 text-white shadow-sm"
                      : id === "toxic"
                      ? "bg-slate-100 text-red-600 hover:bg-red-50"
                      : "bg-slate-100 text-slate-600 hover:bg-secondary-50 hover:text-secondary-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <div className="sm:ml-auto flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                <PawPrint className="w-4 h-4" />
              </span>
              <select className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:border-secondary-400 bg-white">
                <option>Tất cả loài</option>
                <option>Chó</option>
                <option>Mèo</option>
                <option>Chim</option>
                <option>Thỏ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Drug cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {SAMPLE_DRUGS.map((drug) => (
            <div
              key={drug.id}
              className={`card-base p-5 border-l-4 ${
                drug.safe === false
                  ? "border-l-red-500 bg-red-50/30"
                  : drug.safe === null
                  ? "border-l-amber-400"
                  : "border-l-green-400"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-2xl">{drug.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h2 className="font-bold text-slate-800">{drug.name}</h2>
                    {drug.safe === false && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold border border-red-200">
                        ☠️ CẤM DÙNG
                      </span>
                    )}
                    {drug.safe === true && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold border border-green-200">
                        ✓ An toàn
                      </span>
                    )}
                    {drug.safe === null && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                        ⚠️ Thận trọng
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {drug.species.map((s) => (
                      <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed mb-3">{drug.description}</p>

              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <BookOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-500 font-medium">Liều dùng: </span>
                <span className={`text-xs font-bold ${drug.safe === false ? "text-red-600" : "text-slate-700"}`}>
                  {drug.dosage}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Toxic Foods */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-red-100 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="font-bold text-red-800 text-lg">Thực phẩm tuyệt đối không cho thú cưng ăn</h2>
              <p className="text-sm text-red-600">Những thứ phổ biến trong bếp nhà bạn nhưng có thể gây tử vong</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TOXIC_FOODS.map((food) => (
              <div
                key={food.name}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-red-200"
              >
                <span className="text-2xl">{food.emoji}</span>
                <div>
                  <div className="font-bold text-red-800 text-sm">{food.name}</div>
                  <div className="text-xs text-red-600">{food.effect}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
