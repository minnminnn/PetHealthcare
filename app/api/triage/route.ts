import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { type NextRequest } from "next/server";

export const runtime = "edge";
export const maxDuration = 30;

const SYSTEM_PROMPT = `Bạn là trợ lý sơ cứu thú y khẩn cấp AI được tích hợp trong ứng dụng PetCare Vietnam.

NHIỆM VỤ: Cung cấp hướng dẫn sơ cứu NGAY LẬP TỨC cho chủ thú cưng khi họ cần trợ giúp khẩn cấp.

QUY TẮC TUYỆT ĐỐI:
1. Luôn nhắc người dùng ĐẾN PHÒNG KHÁM THÚ Y NGAY LẬP TỨC — đây là ưu tiên số 1.
2. Cung cấp hướng dẫn sơ cứu cụ thể, rõ ràng, theo từng bước.
3. KHÔNG chẩn đoán bệnh hoặc kê đơn thuốc.
4. Sử dụng ngôn ngữ bình dân, dễ hiểu, không dùng thuật ngữ y khoa phức tạp.
5. Luôn hỏi về loài (chó, mèo, thỏ...) nếu chưa biết, vì sơ cứu khác nhau theo loài.
6. Nếu tình trạng CỰC KỲ nguy hiểm (ngưng thở, co giật, chảy máu nặng) — NGẮN GỌN và CHỈ DẪN NGAY.

ĐỊNH DẠNG ĐẦU RA:
- Dùng **bold** cho các bước quan trọng
- Dùng emoji để phân biệt mức độ khẩn cấp: 🚨 (cực khẩn), ⚠️ (cảnh báo), ✅ (an toàn)
- Liệt kê theo số thứ tự rõ ràng
- Kết thúc luôn nhắc đến phòng khám thú y

TUYÊN BỐ MIỄN TRỪ: Đây là hướng dẫn sơ cứu tạm thời, không thay thế chuyên môn bác sĩ thú y.`;

export async function POST(req: NextRequest) {
  const { message, history } = (await req.json()) as {
    message: string;
    history: Array<{ role: "user" | "assistant"; content: string }>;
  };

  const result = await streamText({
    model: google("gemini-1.5-flash"),
    system: SYSTEM_PROMPT,
    messages: [
      ...history.slice(-6).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ],
    temperature: 0.3,
    maxTokens: 800,
  });

  return result.toTextStreamResponse();
}
