import { setRequestLocale } from "next-intl/server";
import { auth } from "@/server/auth";

import type { Locale } from "@/i18n";
import {
  Heart, Calendar, Bell, Droplets,
  PawPrint, ArrowRight, Clock, Shield
} from "lucide-react";
import { Link, redirect as i18nRedirect } from "@/lib/navigation";
import { MagnificationDock } from "@/components/dashboard/MagnificationDock";

interface PageProps {
  params: { locale: string };
}

export default async function OwnerDashboardPage({ params: { locale } }: PageProps) {
  setRequestLocale(locale as Locale);
  const session = await auth();

  if (!session?.user) {
    i18nRedirect("/login");
  }

  const dockItems = [
    {
      id: "pets",
      label: "Thú cưng của tôi",
      href: "/dashboard/owner/pets",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      id: "appointments",
      label: "Lịch hẹn",
      href: "/dashboard/owner/appointments",
      icon: <Calendar className="w-6 h-6" />,
      badge: 2,
    },
    {
      id: "reminders",
      label: "Nhắc nhở",
      href: "/dashboard/owner/reminders",
      icon: <Bell className="w-6 h-6" />,
      badge: 3,
    },
    {
      id: "blood",
      label: "Hiến máu",
      href: "/blood-donor",
      icon: <Droplets className="w-6 h-6" />,
    },
    {
      id: "passport",
      label: "Hộ chiếu thú y",
      href: "/dashboard/owner/pets",
      icon: <Shield className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-medical flex items-center justify-center shadow-medical">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? ""}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <PawPrint className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Xin chào, {session.user.name?.split(" ").pop()}! 👋
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Chăm sóc thú cưng của bạn thật tốt nhé hôm nay
              </p>
            </div>
          </div>
        </div>

        {/* 3D Magnification Dock */}
        <div className="flex justify-center mb-10">
          <MagnificationDock items={dockItems} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Thú cưng", value: "1", icon: Heart, color: "text-primary-600", bg: "bg-primary-100" },
            { label: "Lịch hẹn sắp tới", value: "1", icon: Calendar, color: "text-secondary-600", bg: "bg-secondary-100" },
            { label: "Nhắc nhở hôm nay", value: "0", icon: Bell, color: "text-amber-600", bg: "bg-amber-100" },
            { label: "Vaccine cần nhắc", value: "1", icon: Shield, color: "text-violet-600", bg: "bg-violet-100" },
          ].map((stat, i) => (
            <div key={i} className="card-base p-5">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* My Pets Section */}
          <div className="lg:col-span-2 card-base p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-800 text-lg">🐱 Thú cưng của tôi</h2>
              <Link href="/dashboard/owner/pets" className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1">
                Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-5 border border-primary-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-primary-200 flex items-center justify-center text-3xl shadow-sm">
                  🐱
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Kem</h3>
                  <p className="text-slate-500 text-sm">British Longhair · 2 tuổi</p>
                  <div className="flex gap-2 mt-2">
                    <span className="badge-verified">✓ Vaccine đầy đủ</span>
                    <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-2 py-0.5 rounded-full">❤ Hiến máu</span>
                  </div>
                </div>
              </div>
              <Link
                href="/dashboard/owner/pets"
                className="mt-4 w-full btn-medical text-sm justify-center block text-center"
              >
                Xem hồ sơ đầy đủ
              </Link>
            </div>
            <Link
              href="/dashboard/owner/pets/new"
              className="mt-3 w-full btn-outline text-sm justify-center block text-center"
            >
              + Thêm thú cưng mới
            </Link>
          </div>

          {/* Upcoming & Reminders */}
          <div className="space-y-5">
            {/* Next Appointment */}
            <div className="card-base p-5">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-secondary-600" />
                Lịch khám sắp tới
              </h3>
              <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-4">
                <div className="text-sm font-semibold text-slate-800">Khám định kỳ</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  20/09/2025 · 09:30
                </div>
                <div className="text-xs text-secondary-600 font-medium mt-2">
                  Phòng khám Quốc Tế Hà Nội
                </div>
              </div>
            </div>

            {/* Reminders */}
            <div className="card-base p-5">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Nhắc nhở sắp đến hạn
              </h3>
              <div className="space-y-2.5">
                {[
                  { label: "Nhỏ gáy phòng ve bọ chét", date: "14/10/2025", urgent: false },
                  { label: "Tẩy giun định kỳ", date: "14/12/2025", urgent: false },
                  { label: "Nhắc tiêm FVRCP hàng năm", date: "20/04/2026", urgent: false },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                      <span className="text-sm text-slate-700 truncate">{r.label}</span>
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0">{r.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
