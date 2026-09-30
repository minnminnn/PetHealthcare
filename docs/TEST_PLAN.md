# Kiểm thử và kịch bản bảo vệ

## Điều kiện

Dùng database thử nghiệm, hai chủ nuôi A/B, hai phòng khám X/Y, bác sĩ X và tài khoản SYSTEM_ADMIN. Có ít nhất một thú cưng của A từng đặt lịch ở cả X/Y. Không dùng email/số điện thoại thật để gửi thử tự động.

## Test case

| ID | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| AUTH-01 | Đăng ký, đăng nhập chủ nuôi mới | Vào dashboard, chưa có thú cưng, có đường dẫn thêm hồ sơ |
| AUTH-02 | Khóa tài khoản đang đăng nhập rồi gọi API/dashboard | Không còn truy cập dữ liệu bảo vệ |
| AUTH-03 | Gọi API bằng tài khoản khác vai trò | Trả UNAUTHORIZED/FORBIDDEN, không ghi dữ liệu |
| PET-01 | Thêm thú cưng kèm cân nặng, tải lại | Hồ sơ và lần cân đầu tiên tồn tại cùng nhau |
| PET-02 | Chủ B thử sửa thú cưng của A | Bị từ chối |
| BOOK-01 | Chọn thú cưng, phòng khám, thời gian tương lai | Tạo PENDING; chủ và phòng khám đều nhìn thấy |
| BOOK-02 | Chọn ngày quá khứ/thời lượng âm/bác sĩ khác phòng khám | Bị từ chối |
| BOOK-03 | Gửi đồng thời hai lịch trùng cho cùng pet/bác sĩ | Chỉ một lịch được lưu; yêu cầu còn lại nhận CONFLICT |
| BOOK-04 | Phòng X đổi trạng thái lịch tại Y của cùng thú cưng | Bị từ chối |
| BOOK-05 | PENDING → CONFIRMED → IN_PROGRESS → COMPLETED | Thành công; chủ nuôi không hủy lịch COMPLETED |
| MED-01 | Bác sĩ mở hồ sơ từ hàng đợi, thêm kết quả khám | Chủ nuôi thấy kết quả sau tải lại |
| MED-02 | Thêm tệp vào hồ sơ của phòng khám khác | Bị từ chối |
| REM-01 | Tạo nhắc IN_APP sau 2 phút, bật worker | Một thông báo xuất hiện sau đến hạn, không gửi sớm |
| REM-02 | Tắt/xóa nhắc trước hạn | Worker không gửi |
| REM-03 | Giả lập email trả HTTP 500 | Không đánh dấu sent; worker retry |
| REM-04 | Chạy lại cùng sự kiện nhắc | Không tạo thông báo trùng; recurrence không nhân đôi |
| ADMIN-01 | Đăng ký dạng phòng khám; admin duyệt | Tạo phòng khám, cập nhật role; không có cấp quyền trước duyệt |
| ADMIN-02 | Duyệt một yêu cầu hai lần | Lần thứ hai nhận CONFLICT |
| DONOR-01 | Chủ đăng ký; phòng khám đã có quan hệ bệnh nhân sàng lọc | Ban đầu PENDING_REVIEW, sau xét duyệt mới tham gia ghép yêu cầu |
| DONOR-02 | Tạo yêu cầu đúng loài/nhóm máu/thành phố | Người đăng ký phù hợp có yêu cầu trong dashboard |
| DONOR-03 | Chủ rút đồng ý / tài khoản khác trả lời yêu cầu | Không tiếp tục truy cập hoặc sửa yêu cầu trái quyền |
| UI-01 | Các màn hình ở 390px và 1440px, vi/en | Không tràn ngang, form và nút có nhãn, trạng thái tải/lỗi/rỗng rõ ràng |
| SETUP-01 | Clone mới, npm ci, migration database trống, build | Có thể dựng lại bằng README |

Đây là **kế hoạch kiểm thử**, không phải tuyên bố tất cả các trường hợp đã chạy. Xem output của `npm test`, CI và biên bản demo để ghi nhận kết quả thực tế. Test API hiện dùng mock; BOOK-03 cần PostgreSQL thật.

## Demo 8–10 phút

1. Đăng ký chủ mới, thêm thú cưng và cân nặng.
2. Đặt lịch tại phòng khám có bác sĩ đã duyệt.
3. Đổi sang tài khoản phòng khám, xác nhận lịch, tiếp nhận khám.
4. Mở hộ chiếu, nhập kết quả, hoàn thành lịch.
5. Trở về chủ nuôi, xem hồ sơ và lịch sử, in hộ chiếu.
6. Tạo nhắc IN_APP gần hạn, cho worker chạy và xem thông báo.
7. Trình bày thử nghiệm trái quyền X/Y và kết quả từ chối.
8. Nêu rõ phần chưa triển khai: video, thanh toán, QR chia sẻ, push/SMS, upload.
