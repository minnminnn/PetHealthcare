type LocationErrorCode =
  | "insecure"
  | "unsupported"
  | "denied"
  | "unavailable"
  | "timeout";

export class LocationError extends Error {
  constructor(public readonly code: LocationErrorCode) {
    super(code);
    this.name = "LocationError";
  }
}

export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && !window.isSecureContext) {
      reject(new LocationError("insecure"));
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new LocationError("unsupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      ({ code }) => {
        reject(new LocationError(
          code === 1 ? "denied" : code === 3 ? "timeout" : "unavailable",
        ));
      },
      // Nearby clinic search can use network positioning without waiting for GPS.
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 },
    );
  });
}

const MESSAGES = {
  vi: {
    insecure: "Trình duyệt yêu cầu kết nối an toàn để lấy vị trí. Hãy mở website bằng HTTPS, hoặc localhost nếu chạy trên máy này.",
    unsupported: "Trình duyệt này không hỗ trợ lấy vị trí. Hãy mở website bằng Chrome hoặc Safari.",
    denied: "Quyền vị trí đang bị chặn. Hãy cho phép vị trí trong cài đặt website và bật Dịch vụ định vị cho trình duyệt trong cài đặt thiết bị, rồi thử lại.",
    unavailable: "Thiết bị chưa xác định được vị trí. Hãy bật Dịch vụ định vị, kiểm tra Wi-Fi hoặc GPS rồi thử lại.",
    timeout: "Lấy vị trí quá thời gian chờ. Hãy kiểm tra Wi-Fi hoặc GPS rồi bấm lấy vị trí lần nữa.",
  },
  en: {
    insecure: "Location requires a secure connection. Open the website using HTTPS, or localhost when running on this device.",
    unsupported: "This browser does not support location. Open the website in Chrome or Safari.",
    denied: "Location access is blocked. Allow location in the website settings and enable Location Services for your browser in your device settings, then try again.",
    unavailable: "Your device could not determine its location. Enable Location Services, check Wi-Fi or GPS, and try again.",
    timeout: "Finding your location timed out. Check Wi-Fi or GPS, then try again.",
  },
} as const;

export function getLocationErrorMessage(error: unknown, locale: string) {
  const code = error instanceof LocationError ? error.code : "unavailable";
  return MESSAGES[locale === "vi" ? "vi" : "en"][code];
}
