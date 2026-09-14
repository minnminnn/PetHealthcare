"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import {
  PawPrint,
  Shield,
  Cpu,
  Weight,
  Calendar,
  Droplets,
  Heart,
  Download,
  Share2,
  QrCode,
} from "lucide-react";

interface PetPassportProps {
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    color: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    isNeutered: boolean;
    microchipId: string | null;
    passportNumber: string;
    avatarUrl: string | null;
    bloodType: string;
    weight: number | null;
    vaccinations: Array<{
      vaccineName: string;
      administeredAt: Date;
      nextDueAt: Date | null;
    }>;
    owner: { name: string | null } | null;
  };
  baseUrl?: string;
}

const SPECIES_EMOJI: Record<string, string> = {
  CAT: "🐱",
  DOG: "🐶",
  BIRD: "🦜",
  RABBIT: "🐰",
  HAMSTER: "🐹",
  REPTILE: "🦎",
  FISH: "🐟",
  OTHER: "🐾",
};

const BLOOD_TYPE_DISPLAY: Record<string, string> = {
  FELINE_A: "Nhóm A (Mèo)",
  FELINE_B: "Nhóm B (Mèo)",
  FELINE_AB: "Nhóm AB (Mèo)",
  DEA1_POSITIVE: "DEA 1+ (Chó)",
  DEA1_NEGATIVE: "DEA 1- (Chó)",
  UNKNOWN: "Chưa xác định",
};

function getAge(dob: Date | null): string {
  if (!dob) return "Không rõ";
  const now = new Date();
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  if (months < 12) return `${months} tháng tuổi`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} năm ${rem} tháng` : `${years} tuổi`;
}

export function PetPassport({
  pet,
  baseUrl = "https://petcare.vn",
}: PetPassportProps) {
  const passportRef = useRef<HTMLDivElement>(null);
  const passportUrl = `${baseUrl}/passport/${pet.passportNumber}`;

  const handleDownload = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Hộ chiếu thú y — ${pet.name}`,
        text: `Xem hồ sơ y tế của ${pet.name}`,
        url: passportUrl,
      });
    } else {
      await navigator.clipboard.writeText(passportUrl);
      alert("Đã sao chép liên kết!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Action buttons */}
      <div className="flex gap-3 mb-4">
        <button onClick={handleDownload} className="btn-outline text-sm gap-2">
          <Download className="w-4 h-4" /> In / PDF
        </button>
        <button onClick={handleShare} className="btn-outline text-sm gap-2">
          <Share2 className="w-4 h-4" /> Chia sẻ
        </button>
      </div>

      {/* Passport Card */}
      <div
        ref={passportRef}
        className="bg-white rounded-3xl border-2 border-primary-200 shadow-medical-lg overflow-hidden passport-print"
      >
        {/* Header bar */}
        <div className="bg-gradient-medical px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white/80 text-xs font-medium tracking-widest uppercase">
                Pet Medical Passport
              </div>
              <div className="text-white font-bold text-lg">Hộ Chiếu Thú Y</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/70 text-xs">VIỆT NAM</div>
            <div className="text-white/90 text-xs font-mono mt-1">
              {pet.passportNumber}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-8">
          <div className="flex gap-6 items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-2xl bg-primary-100 border-4 border-primary-200 flex items-center justify-center overflow-hidden">
                {pet.avatarUrl ? (
                  <img
                    src={pet.avatarUrl}
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">
                    {SPECIES_EMOJI[pet.species] ?? "🐾"}
                  </span>
                )}
              </div>
              {pet.isNeutered && (
                <div
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-secondary-500 rounded-full flex items-center justify-center border-2 border-white"
                  title="Đã triệt sản"
                >
                  <span className="text-white text-xs font-bold">♾</span>
                </div>
              )}
            </div>

            {/* Pet Info */}
            <div className="flex-1 space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">{pet.name}</h2>
              <div className="text-slate-500 font-medium">
                {SPECIES_EMOJI[pet.species]} {pet.breed ?? pet.species} ·{" "}
                {pet.color ?? ""}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                {[
                  {
                    icon: Calendar,
                    label: "Tuổi",
                    value: getAge(pet.dateOfBirth),
                  },
                  {
                    icon: Weight,
                    label: "Cân nặng",
                    value: pet.weight ? `${pet.weight} kg` : "Chưa cập nhật",
                  },
                  {
                    icon: Droplets,
                    label: "Nhóm máu",
                    value: BLOOD_TYPE_DISPLAY[pet.bloodType] ?? pet.bloodType,
                  },
                  {
                    icon: Heart,
                    label: "Giới tính",
                    value:
                      pet.gender === "male"
                        ? "Đực"
                        : pet.gender === "female"
                          ? "Cái"
                          : "Không rõ",
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <div>
                      <div className="text-xs text-slate-500 leading-none">
                        {label}
                      </div>
                      <div className="text-sm font-semibold text-slate-800 mt-0.5">
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Microchip */}
          {pet.microchipId && (
            <div className="mt-5 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
              <Cpu className="w-5 h-5 text-secondary-600" />
              <div>
                <div className="text-xs text-slate-500">Số Microchip</div>
                <div className="font-mono font-semibold text-slate-800 text-sm tracking-wider">
                  {pet.microchipId}
                </div>
              </div>
              <Shield className="w-4 h-4 text-secondary-500 ml-auto" />
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200 my-6" />

          {/* Vaccination summary */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-600" />
              Lịch tiêm chủng ({pet.vaccinations.length} mũi)
            </h3>
            <div className="space-y-2">
              {pet.vaccinations.slice(0, 3).map((vax, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary-500" />
                    <span className="text-slate-700 font-medium">
                      {vax.vaccineName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>
                      {new Date(vax.administeredAt).toLocaleDateString("vi-VN")}
                    </span>
                    {vax.nextDueAt && (
                      <span
                        className={`font-medium ${
                          new Date(vax.nextDueAt) < new Date()
                            ? "text-red-500"
                            : "text-green-600"
                        }`}
                      >
                        Nhắc:{" "}
                        {new Date(vax.nextDueAt).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {pet.vaccinations.length > 3 && (
                <p className="text-xs text-primary-600 font-medium">
                  + {pet.vaccinations.length - 3} mũi khác...
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-slate-200 my-6" />

          {/* QR Code + Owner */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-slate-500 mb-1">Chủ nuôi</div>
              <div className="font-semibold text-slate-800">
                {pet.owner?.name ?? "Không rõ"}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <QRCodeSVG
                value={passportUrl}
                size={80}
                level="M"
                includeMargin={false}
                fgColor="#0369A1"
                bgColor="#FFFFFF"
              />
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <QrCode className="w-3 h-3" />
                Quét để xem hồ sơ
              </div>
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border-t border-primary-100 px-8 py-3">
          <div className="flex items-center justify-between text-xs text-primary-700">
            <span className="font-medium">🐾 PetCare Vietnam — petcare.vn</span>
            <span className="font-mono opacity-70">{pet.passportNumber}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
