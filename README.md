# Jacob Mini Site

Website tĩnh tối giản cho `bosua.site`, deploy bằng Cloudflare Workers Static Assets.

## File
- `index.html`: trang chủ, thời tiết hiện tại, dự báo 3 ngày, biểu đồ nhiệt độ theo giờ và độ cao vị trí.
- `about.html`, `random.html`, `game.html`, `holidays.html`, `404.html`: các trang phụ.
- `style.css`, `script.js`: giao diện và chức năng.
- `wrangler.jsonc`: giữ nguyên tên Worker `thang-mini-site` để không làm thay đổi cấu hình domain hiện tại.

## Cập nhật
Giải nén ZIP và tải các file bên trong thư mục này lên repository GitHub `sh7ng/thang-mini-site`, giữ nguyên cấu trúc file ở thư mục gốc repository rồi commit lên `main`. Cloudflare sẽ tự deploy nếu đã bật tích hợp GitHub.

Thời tiết lấy từ Open-Meteo, không cần API key. Trình duyệt sẽ hỏi quyền vị trí; nếu không được cấp quyền, trang dùng Hà Nội làm vị trí mặc định và ghi chú rõ điều đó. Độ cao là giá trị ước tính theo dữ liệu địa hình của Open-Meteo. Không có analytics hoặc tracking được thêm vào.
