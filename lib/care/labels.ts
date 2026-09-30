export const speciesLabels: Record<string, [string, string]> = {
  DOG: ["Chó", "Dog"],
  CAT: ["Mèo", "Cat"],
  BIRD: ["Chim", "Bird"],
  RABBIT: ["Thỏ", "Rabbit"],
  HAMSTER: ["Hamster", "Hamster"],
  REPTILE: ["Bò sát", "Reptile"],
  FISH: ["Cá", "Fish"],
  FERRET: ["Chồn", "Ferret"],
  GUINEA_PIG: ["Chuột lang", "Guinea pig"],
  OTHER: ["Khác", "Other"],
};
export const statusLabels: Record<string, [string, string]> = {
  PENDING: ["Chờ xác nhận", "Pending"],
  CONFIRMED: ["Đã xác nhận", "Confirmed"],
  IN_PROGRESS: ["Đang khám", "In progress"],
  COMPLETED: ["Hoàn thành", "Completed"],
  CANCELLED: ["Đã hủy", "Cancelled"],
  NO_SHOW: ["Vắng mặt", "No show"],
};
export const reminderLabels: Record<string, [string, string]> = {
  VACCINATION: ["Tiêm chủng", "Vaccination"],
  DEWORMING: ["Tẩy giun", "Deworming"],
  FLEA_TICK_PREVENTION: ["Phòng ve rận", "Flea prevention"],
  HEALTH_CHECKUP: ["Khám sức khỏe", "Health check"],
  DENTAL_CLEANING: ["Vệ sinh răng", "Dental cleaning"],
  MEDICATION: ["Dùng thuốc", "Medication"],
  GROOMING: ["Chăm sóc lông", "Grooming"],
  CUSTOM: ["Khác", "Other"],
};
export function localDateTime(value: string): Date {
  return new Date(value);
}
export function formatCareDate(value: Date | string, vi: boolean) {
  return new Intl.DateTimeFormat(vi ? "vi-VN" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}
