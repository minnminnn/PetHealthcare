export type HomeLocale = "vi" | "en";

type LocalizedText = Record<HomeLocale, string>;

export const HOME_CONTENT = {
  vi: {
    heroTitle: "Mọi điều thú cưng cần, trong một nhịp chăm sóc.",
    heroDescription:
      "Tìm bác sĩ, lưu hồ sơ và nhận hỗ trợ khẩn cấp trong một nơi rõ ràng.",
    primaryCta: "Đăng ký",
    secondaryCta: "Tìm phòng khám",
    interestTitle: "Chăm sóc không nên rời rạc.",
    interestDescription:
      "PetCare nối những việc quan trọng thành một trải nghiệm dễ hiểu và luôn sẵn sàng.",
    desireTitle: "Từ điều nhỏ đến lúc cần gấp.",
    desireDescription:
      "Mỗi công cụ được thiết kế để bạn hành động nhanh và bác sĩ có đủ thông tin.",
    clinicTitle: "Những địa chỉ được cộng đồng tin chọn.",
    clinicDescription:
      "Tìm lựa chọn phù hợp, xem đánh giá và đặt lịch ngay khi bạn sẵn sàng.",
    footerTitle: "Chăm sóc tốt bắt đầu từ hôm nay.",
    footerDescription:
      "Tạo hồ sơ đầu tiên và giữ mọi thông tin quan trọng trong tầm tay.",
    footerCta: "Đăng ký",
  },
  en: {
    heroTitle: "Everything your pet needs, in one rhythm of care.",
    heroDescription:
      "Find vets, keep records, and get urgent help in one clear place.",
    primaryCta: "Sign Up",
    secondaryCta: "Find a clinic",
    interestTitle: "Care should not feel fragmented.",
    interestDescription:
      "PetCare connects the important moments into one clear experience that is always ready.",
    desireTitle: "For small moments and urgent ones.",
    desireDescription:
      "Each tool helps you act quickly and gives your vet the context they need.",
    clinicTitle: "Places the community trusts.",
    clinicDescription:
      "Compare suitable options, review feedback, and book when you are ready.",
    footerTitle: "Better care starts today.",
    footerDescription:
      "Create your first profile and keep every important detail within reach.",
    footerCta: "Sign Up",
  },
} as const;

export const HOME_FEATURES: ReadonlyArray<{
  key: "clinics" | "passport" | "emergency";
  title: LocalizedText;
  description: LocalizedText;
  accent: "coral";
}> = [
  {
    key: "clinics",
    title: { vi: "Tìm đúng nơi chăm sóc", en: "Find the right care" },
    description: {
      vi: "Lọc phòng khám theo vị trí, nhu cầu và thời gian hoạt động.",
      en: "Filter clinics by location, need, and opening hours.",
    },
    accent: "coral",
  },
  {
    key: "passport",
    title: { vi: "Một hồ sơ luôn theo cùng", en: "One record that travels" },
    description: {
      vi: "Lịch sử khám, vaccine và đơn thuốc được giữ gọn trong hộ chiếu số.",
      en: "Visits, vaccines, and prescriptions stay together in a digital passport.",
    },
    accent: "coral",
  },
  {
    key: "emergency",
    title: {
      vi: "Hỗ trợ khi từng phút quan trọng",
      en: "Help when minutes matter",
    },
    description: {
      vi: "Kết nối nhanh với phòng khám đang trực và hướng dẫn sơ cứu ban đầu.",
      en: "Reach an open clinic quickly and get immediate first-aid guidance.",
    },
    accent: "coral",
  },
];

export const HOME_BENTO_LAYOUT = [
  { key: "clinics", columns: 7, rows: 2 },
  { key: "passport", columns: 5, rows: 1 },
  { key: "emergency", columns: 5, rows: 1 },
] as const;

export const HOME_STACK_LAYERS = [1, 2, 3] as const;

export const HOME_CLINICS = [
  { name: "Phòng khám Quốc Tế Hà Nội", rating: "4.9", reviews: "842" },
  { name: "Animal Care Center HCM", rating: "4.8", reviews: "1,203" },
  { name: "PetVet Đà Nẵng", rating: "4.7", reviews: "456" },
] as const;
