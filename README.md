# PetCare

Ứng dụng quản lý chăm sóc thú cưng, hồ sơ sức khỏe và lịch khám. Next.js 14 / React / TypeScript / tRPC / Prisma / PostgreSQL. Giao diện `/vi` và `/en`.

## Chạy trên máy mới

Yêu cầu Node.js 20+, npm và PostgreSQL 16 (hoặc Docker Compose).

```bash
npm ci
cp .env.example .env
# Nếu chưa có PostgreSQL:
docker compose up -d db
```

Cấu hình tối thiểu trong `.env`:

```dotenv
DATABASE_URL=postgresql://petcare:petcare_local_only@localhost:5432/petcare
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=<chuỗi-ngẫu-nhiên-riêng-tối-thiểu-32-ký-tự>
```

Sinh secret bằng `openssl rand -base64 32`. Để trống các khóa dịch vụ chưa sử dụng. Không bật `SKIP_ENV_VALIDATION` trong môi trường chạy ứng dụng.

Với **cơ sở dữ liệu mới, trống**:

```bash
npm run db:deploy
npm run dev
```

Mở `http://localhost:3000/vi`. Không cần Google, AI, Mapbox hay email để đăng ký bằng email/mật khẩu và quản lý hồ sơ/lịch khám.

### Cơ sở dữ liệu đã có từ phiên bản dùng db push

Migration `20260930000000_baseline` mô tả schema hiện tại. **Không chạy lại lệnh tạo bảng lên database đã có bảng**. Sao lưu trước, đối chiếu schema bằng `prisma migrate diff`, và chỉ khi schema khớp mới đánh dấu baseline đã áp dụng:

```bash
npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma --script
npx prisma migrate resolve --applied 20260930000000_baseline
```

`DATABASE_URL` trong lệnh đầu cần được export trong shell; tệp `.env` không tự export biến cho shell. Không dùng `migrate reset` cho dữ liệu đang sử dụng. Các index tìm kiếm bổ sung trong baseline cần được tạo riêng nếu database cũ chưa có; chúng không nằm trong phần so sánh Prisma datamodel.

## Tài khoản và dữ liệu demo

Đăng ký chủ nuôi tại `/vi/register`. Tài khoản mới có thể tự thêm thú cưng tại `/vi/dashboard/pets`.

Tạo quản trị viên đầu tiên: đặt `ADMIN_EMAIL` và `ADMIN_PASSWORD` (12–72 ký tự) trong `.env`, chạy `npm run db:admin`, sau đó xóa hai biến này. Lệnh chỉ tạo tài khoản mới, không nâng quyền hoặc đổi mật khẩu tài khoản đã có.

Dữ liệu mô phỏng:

```bash
npm run db:demo
npm run db:demo -- --apply
npm run db:demo -- --verify
```

Đọc [hướng dẫn demo](prisma/demo/README.md). Các tài khoản demo và mật khẩu được lưu cục bộ trong tệp bị Git bỏ qua. Không nạp dữ liệu mô phỏng vào hệ thống thật. `db:seed` là bộ seed cũ, có mật khẩu cố định; chỉ dùng trên database thử nghiệm riêng, không dùng để triển khai.

## Các luồng hiện có

- Chủ nuôi: đăng ký → thêm thú cưng → mở hộ chiếu → cập nhật thông tin/cân nặng → đặt/hủy lịch → tạo/tắt nhắc lịch → đọc thông báo.
- Phòng khám: xem hàng đợi theo ngày (giờ Việt Nam), xác nhận/tiếp nhận/hoàn thành lịch, mở hồ sơ ghi kết quả/tiêm chủng/đơn thuốc, thêm bác sĩ từ tài khoản đã đăng ký.
- Quản trị hệ thống: duyệt/từ chối yêu cầu cấp quyền phòng khám và tạo thông tin phòng khám khi duyệt.
- Hiến máu: chủ nuôi đăng ký/rút đồng ý, phòng khám sàng lọc hồ sơ bệnh nhân, tạo yêu cầu, chủ nuôi phản hồi và phòng khám xem người chấp nhận.
- Phòng khám và bác sĩ hiển thị từ database đã duyệt. Thư viện thuốc lấy dữ liệu `Drug` từ database; dữ liệu trống được hiển thị rõ, không thay bằng thuốc mẫu.

## Dịch vụ tùy chọn

- Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Nút Google chỉ xuất hiện khi provider được cấu hình.
- AI: `GROQ_API_KEY`, tùy chọn `GROQ_MODEL`. Khi thiếu khóa, endpoint trả lỗi dịch vụ chưa cấu hình.
- Bản đồ/địa chỉ: `NEXT_PUBLIC_MAPBOX_TOKEN`, tùy chọn `MAPBOX_ACCESS_TOKEN`.
- Nhắc lịch: chạy Inngest Dev Server bằng `npx inngest-cli@latest dev -u http://localhost:3000/api/inngest` ở terminal riêng. Khi triển khai, kết nối Inngest với `/api/inngest` và cấu hình event/signing keys. Worker quét mỗi phút, chỉ xử lý nhắc lịch đang bật, chưa gửi và đã đến hạn. Không có worker thì nhắc lịch vẫn được lưu nhưng chưa được gửi.
- Email: thêm `RESEND_API_KEY` và `RESEND_FROM_EMAIL` là địa chỉ thuộc miền đã xác minh. Email lỗi không được đánh dấu đã gửi; worker thử lại. Kiểm tra trên hộp thư thử nghiệm riêng trước khi dùng thật.

Không gửi email/SMS hoặc chạy worker trong bộ unit/API test. Video, thanh toán, push/SMS, chia sẻ QR có thời hạn và upload tệp trực tiếp vẫn chưa được triển khai. Đặt lịch hiện hỗ trợ khám tại phòng khám và tái khám. Tài liệu đính kèm hiện nhận URL.

## Kiểm tra và build

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

`npm test` gồm kiểm thử domain, phân quyền và tRPC qua database giả lập; không thay thế kiểm thử tích hợp PostgreSQL hay kiểm thử trình duyệt. Workflow CI dựng database trống, áp dụng migration và chạy các kiểm tra trên. Kịch bản kiểm tra thủ công: [docs/TEST_PLAN.md](docs/TEST_PLAN.md).

## Tài liệu

- [Tổng quan và giới hạn](APPLICATION_OVERVIEW.md)
- [Thiết kế hệ thống và sơ đồ](docs/ARCHITECTURE.md)
- [Kịch bản kiểm thử và demo](docs/TEST_PLAN.md)

Không commit `.env`, mật khẩu demo hoặc dữ liệu bệnh án thật. Migration được lưu trong Git để tái lập cấu trúc database.
