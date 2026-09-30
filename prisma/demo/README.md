# Bộ dữ liệu demo PetCare

- `clinics.json`: 24 phòng khám hư cấu tại Hà Nội, TP. Hồ Chí Minh, Đà Nẵng, Hải Phòng, Cần Thơ, Huế, Nha Trang và Đà Lạt; mỗi thành phố 3 phòng khám.
- `owners.json`: 17 tài khoản chủ nuôi, mỗi người 2 thú cưng; tổng cộng 34 thú cưng thuộc đủ 10 loài trong hệ thống.
- Mỗi thú cưng có 4 lần cân, 2 hồ sơ khám, 1 đơn thuốc minh họa không có thuốc/liều thật, 3 lịch hẹn và 2 nhắc lịch trong ứng dụng.
- Chó/mèo có thêm 2 hồ sơ tiêm chủng giả lập và hồ sơ hiến máu ở trạng thái chờ duyệt. Các loài khác không được gán lịch tiêm giả như chó/mèo.
- Mỗi phòng khám có 1 tài khoản quản trị kiêm hồ sơ bác sĩ; 24 tài khoản này bổ sung ngoài 17 chủ nuôi.
- Phòng khám có tiền tố `[DEMO]`, địa chỉ/tọa độ mô phỏng, không có số điện thoại thật hay đánh giá giả. Cờ `isVerified` được mô phỏng để hiển thị trên giao diện. Chúng bị loại khỏi ngữ cảnh gợi ý phòng khám của chatbot.
- Email dùng miền `.test`, không phải hộp thư thật. Không gửi email/SMS, không tạo lịch gửi ngoài ứng dụng, không đặt lịch thực tế.

## Cách sử dụng

```bash
npm run db:demo
npm run db:demo -- --apply
npm run db:demo -- --verify
```

Lệnh đầu chỉ kiểm tra tệp, không kết nối database. `--apply` thêm dữ liệu vào database được cấu hình trong `.env`. Không chạy seed demo trên website đang phục vụ người dùng thật. Script từ chối ghi khi `NODE_ENV=production`.

Mật khẩu ngẫu nhiên được tạo một lần, lưu trong `prisma/demo/credentials.local.json`; danh sách tài khoản và mật khẩu đăng nhập nằm ở `docs/demo-accounts.local.md`. Hai tệp này bị loại khỏi Git. Đăng nhập bằng email/mật khẩu tại `/vi/login`, không dùng Google. Giữ tệp mật khẩu khi chạy lại.

Script dùng ID ổn định với tiền tố `petcare-demo-`. Chạy lại không nhân đôi, không đổi mật khẩu và không xóa dữ liệu hiện có. Tên, số năm kinh nghiệm, mô tả và chuyên môn của hồ sơ bác sĩ demo được đồng bộ khi chạy lại; các dữ liệu khác đang có được giữ nguyên. Nếu lỗi giữa chừng, chạy lại để hoàn tất.

Ngày lịch sử/lịch hẹn được tính theo thời điểm tạo bộ demo lần đầu. Tất cả dữ liệu y tế chỉ minh họa giao diện, không phải hướng dẫn điều trị.
