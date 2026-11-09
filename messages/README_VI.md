# Tin nhắn gia đình Web — bosua.site/messages

Ứng dụng tĩnh chạy trực tiếp trong Cloudflare Worker assets, không cần build Node/Vite. Giữ nguyên Worker `thang-mini-site` và toàn bộ website hiện tại.

## Tương thích Android

Đọc/ghi đúng cấu trúc:
- `users/{uid}`: hồ sơ và `familyId`
- `families/{familyId}/members/{uid}`: thành viên, vai trò ADMIN/MEMBER
- `families/{familyId}/messages/{messageId}`: `senderUid`, `senderName`, `text`, `createdAt` (milliseconds), `recipientUids`, `scope` (`FAMILY`/`DIRECT`), tùy chọn `latitude`, `longitude`

Chat nhóm và chat riêng dùng đúng các truy vấn Android đang sử dụng. Các tin nhắn cũ vẫn hiển thị. Tệp ảnh là phần mở rộng mới `imageUrl`, vị trí dùng chính hai trường Android đã có.

## Cần cấu hình một lần trong Firebase

1. Mở https://console.firebase.google.com/project/familycalendar-7afb6/settings/general
2. Trong **Your apps**, bấm **Add app → Web**. Đặt tên `bosua-messages`, không cần bật Firebase Hosting.
3. Lấy `appId` của Web app, thay `REPLACE_WITH_FIREBASE_WEB_APP_ID` trong `firebase-config.js`. Giữ nguyên projectId `familycalendar-7afb6`.
4. Firebase Console → Authentication → Sign-in method: bật Email/Password (nếu chưa bật).
5. Firebase Console → Authentication → Settings → Authorized domains: bảo đảm có `bosua.site`.
6. Firebase Console → Project settings → Cloud Messaging → Web Push certificates: tạo/chép VAPID public key vào `vapidKey` trong `firebase-config.js`.
7. Thay cùng Web App `appId` trong `firebase-config-sw.js`.
8. Firebase Storage: nếu muốn gửi ảnh, triển khai `storage.rules` ở thư mục này bằng `firebase deploy --only storage`. Nếu chưa bật Storage, chat chữ và chia sẻ vị trí vẫn hoạt động.
9. Để nhận Web Push khi trình duyệt chạy nền/đóng tab, sao lưu rồi cập nhật `firebase/functions/src/index.ts` bằng `functions-index-webpush.ts` (file này giữ nguyên các trigger lịch và tin nhắn, chỉ bổ sung gửi đến `webFcmToken`), sau đó chạy `firebase deploy --only functions` trong thư mục Firebase hiện tại. Trường `webFcmToken` riêng biệt, không ghi đè `fcmToken` Android.

## Triển khai lên GitHub/Cloudflare

Sao chép nguyên thư mục `messages/` vào thư mục gốc repo `sh7ng/thang-mini-site`. Không ghi đè `wrangler.jsonc`, không xóa file hiện tại. Cloudflare Worker assets đang dùng thư mục gốc nên đường dẫn `/messages/` sẽ được phục vụ tự động sau lần deploy.

## Thông báo

- Khi người dùng bấm **Thông báo**, trình duyệt xin quyền và lưu token riêng `webFcmToken` trên hồ sơ thành viên.
- Web Push nền cần VAPID key và cập nhật/deploy Cloud Functions theo bước 9 ở trên. Không ghi đè `fcmToken` Android.

## Lưu ý bảo mật

Ứng dụng sử dụng Firebase Auth và Firestore Rules hiện có. Không nới lỏng Firestore Rules để khắc phục lỗi. Tính năng ảnh cần Storage Rules riêng. Dữ liệu vị trí chỉ được gửi sau thao tác xác nhận và quyền định vị của trình duyệt.
