# Jacob Mini Site

Website cá nhân tối giản, chạy bằng HTML/CSS/JavaScript thuần và Cloudflare Workers Static Assets.

## Có gì mới

- Đổi toàn bộ nhận diện hiển thị từ Jacob → Jacob.
- Trang `/holidays.html`: đếm ngược đến các ngày lễ chính thức của Việt Nam.
- Trang chủ có thời tiết hiện tại + dự báo 3 ngày sắp tới.
- Không quảng cáo, không analytics, không tracking.
- Responsive cho điện thoại.
- Đồng hồ realtime, lời chào ngẫu nhiên, dark mode và mini game.

## Deploy

Push toàn bộ các file lên GitHub. Cloudflare sẽ tự deploy theo `wrangler.jsonc`.

Không cần `_headers`.
