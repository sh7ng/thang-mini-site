# JACOB OS 2.0 — Future OS

Bản nâng cấp giao diện từ `jacob-mini-site-weather-elevation.zip` gốc. Website tĩnh, tương thích triển khai Cloudflare Workers Static Assets.

## Các tệp
- `index.html`: dashboard Future OS, đồng hồ, lời chào, workspace, thời tiết, dự báo 3 ngày, biểu đồ nhiệt độ theo giờ và độ cao.
- `about.html`, `random.html`, `game.html`, `holidays.html`, `404.html`: các trang phụ hiện có, dùng chung giao diện mới.
- `style.css`: giao diện Future OS, responsive, dark/light mode.
- `script.js`: logic hiện có cho đồng hồ, lời chào, thời tiết, biểu đồ, độ cao, ngày lễ, random và game.
- `wrangler.jsonc`: giữ nguyên Worker `thang-mini-site` và cấu hình assets gốc.

## Triển khai
1. Sao lưu repository GitHub hiện tại.
2. Giải nén ZIP này.
3. Upload các tệp bên trong thư mục ZIP vào thư mục gốc repository `sh7ng/thang-mini-site`, cho phép ghi đè các tệp trùng tên.
4. Giữ nguyên Worker `thang-mini-site`, domain `bosua.site` và thiết lập Cloudflare hiện có.
5. Commit lên nhánh `main`, chờ Cloudflare Pages/Workers build hoàn tất rồi kiểm tra website.

## Ghi chú
- Không thêm analytics, quảng cáo hoặc tracking.
- Thời tiết lấy từ Open-Meteo, không cần API key. Trình duyệt cần được cấp quyền vị trí; nếu từ chối, website dùng tọa độ Hà Nội làm mặc định.
- Độ cao được hiển thị từ trường elevation nếu API trả về.
- Giao diện ưu tiên dark mode lần đầu; lựa chọn dark/light được lưu trong localStorage.
- ZIP nền gốc không chứa `tem.html` hoặc trang iframe in tem. Nếu muốn giữ công cụ in tem, cần chép thêm `tem.html` (và trang iframe nếu đã tạo) vào thư mục gốc repo sau khi triển khai bản này.
