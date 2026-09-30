# Thiết kế hệ thống PetCare

## Phạm vi và vai trò

Chủ nuôi quản lý hồ sơ, lịch khám và đồng ý hiến máu. Bác sĩ ghi hồ sơ lâm sàng cho bệnh nhân có quan hệ với phòng khám. Quản trị phòng khám quản lý lịch, trạng thái và bác sĩ thuộc đơn vị. Quản trị hệ thống xét duyệt đơn đăng ký phòng khám.

## Kiến trúc

```mermaid
flowchart LR
  Browser[Trình duyệt vi/en] --> Next[Next.js App Router]
  Next --> Auth[Auth.js: xác thực và kiểm tra tài khoản]
  Next --> API[tRPC + Zod + phân quyền]
  API --> Prisma[Prisma]
  Prisma --> DB[(PostgreSQL)]
  Inngest[Inngest worker] --> DB
  Inngest --> Email[Resend: tùy chọn]
  Next --> AI[Groq: tùy chọn]
  Next --> Maps[Mapbox: tùy chọn]
```

## ERD rút gọn

```mermaid
erDiagram
  User ||--o{ Pet : owns
  User ||--o| Clinic : administers
  User ||--o| Vet : has_profile
  Clinic ||--o{ Vet : employs
  Pet ||--o{ Appointment : has
  Clinic ||--o{ Appointment : receives
  Vet o|--o{ Appointment : assigned
  Pet ||--o{ MedicalRecord : has
  Clinic o|--o{ MedicalRecord : records
  Pet ||--o{ Vaccination : receives
  Pet ||--o{ Prescription : has
  Pet ||--o{ WeightRecord : tracks
  Pet ||--o{ Reminder : schedules
  User ||--o{ Notification : receives
  Pet ||--o| BloodDonorProfile : volunteers
  Clinic ||--o{ BloodRequest : requests
  BloodRequest ||--o{ DonationAlert : creates
  BloodDonorProfile ||--o{ DonationAlert : receives
```

Schema chính xác, đầy đủ khóa và chỉ mục nằm trong `prisma/schema.prisma` và migration baseline.

## Trình tự đặt lịch

```mermaid
sequenceDiagram
  actor Owner as Chủ nuôi
  participant UI as Giao diện
  participant API as tRPC
  participant DB as PostgreSQL
  Owner->>UI: Chọn pet, clinic, bác sĩ và giờ
  UI->>API: appointments.book
  API->>API: Kiểm tra phiên, ngày, thời lượng
  API->>DB: Transaction Serializable
  API->>DB: Kiểm tra sở hữu và bác sĩ thuộc clinic
  API->>DB: Kiểm tra khoảng giờ giao nhau
  alt Không trùng
    API->>DB: Tạo lịch PENDING
    API-->>UI: Thành công
  else Trùng hoặc xung đột đồng thời
    API-->>UI: CONFLICT
  end
```

## Ràng buộc nghiệp vụ

- Lịch hẹn bắt đầu trong tương lai; thời lượng nguyên 15–180 phút.
- Trùng giờ được xét cho cùng thú cưng hoặc bác sĩ được chỉ định. Chưa triển khai mô hình số phòng/giường và năng lực tiếp nhận chung của phòng khám.
- Luồng trạng thái: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED; PENDING/CONFIRMED có thể hủy; CONFIRMED có thể đánh dấu vắng.
- API đổi trạng thái kiểm tra clinic của lịch, không suy ra từ lịch sử khám của pet.
- Nhắc lịch lặp tạo lần tiếp theo ở thời điểm tương lai, không gửi dồn mọi lần quá hạn khi worker được khởi động lại.
- Đăng ký hiến máu là hồ sơ chờ sàng lọc. Ghép nhóm máu trong phần mềm chỉ giúp điều phối; quyết định lâm sàng nằm ở phòng khám.

Đây là tài liệu kỹ thuật của mã nguồn, chưa thay thế báo cáo học thuật theo biểu mẫu của trường. Phần tổng quan nghiên cứu, khảo sát người dùng, phân công nhóm và nhận xét giảng viên cần dữ liệu thực tế của nhóm.
