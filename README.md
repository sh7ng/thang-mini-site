# Thắng — Một góc nhỏ trên Internet

Website tĩnh bằng HTML/CSS/JavaScript, không framework, không database.

## Tính năng

- Lời chào ngẫu nhiên mỗi lần mở trang
- Đồng hồ realtime
- Ngày hiện tại
- Thời tiết qua Open-Meteo, không cần API key
- Dark mode
- Animation nhẹ
- Mini game đoán số
- Random page
- About page
- Custom 404
- Responsive mobile
- Không quảng cáo
- Không analytics/tracking

## Chạy thử trên máy

Có thể mở `index.html` trực tiếp, nhưng để tính năng thời tiết hoạt động ổn định nên chạy qua một local server.

Ví dụ nếu đã có Python:

```bash
python -m http.server 8000
```

Sau đó mở:

http://localhost:8000

## Đưa lên Cloudflare Pages

1. Tạo repository GitHub và upload toàn bộ các file.
2. Vào Cloudflare Dashboard → Workers & Pages → Create → Pages.
3. Kết nối repository.
4. Framework preset: None.
5. Build command: để trống.
6. Build output directory: `/`
7. Deploy.

Website không cần build.

## Tên miền

Sau khi deploy, vào project Cloudflare Pages → Custom domains → Add custom domain và nhập tên miền của bạn.

## Ghi chú về thời tiết

Website dùng Open-Meteo. Nếu người dùng cho phép vị trí, trang sẽ dùng vị trí gần đúng của trình duyệt. Nếu không, mặc định hiển thị Bắc Ninh.

Không có API key.
