# Hướng dẫn cài đặt cho MÁY CLIENT

## Bước 1: Cấu hình IP Server

1. Mở file `Client/config.js`
2. Tìm dòng này:
   ```javascript
   SERVER_IP: 'localhost',  // <-- CHANGE THIS VALUE!
   ```
3. **Thay 'localhost' bằng IP của máy chủ**

### Ví dụ:
```javascript
SERVER_IP: '192.168.1.106',  // IP của máy chủ
```

## Bước 2: Mở ứng dụng

1. Mở file `Client/index.html` trong trình duyệt
2. Hoặc dùng web server:
   ```bash
   cd Client
   # Python
   python -m http.server 3000

   # Hoặc Node.js
   npx serve -s . -l 3000
   ```
3. Truy cập: `http://localhost:3000`

## Tìm IP của máy chủ

1. Hỏi người quản trị server
2. Hoặc xem file `Server/.env` của máy chủ
3. Hoặc chạy `ipconfig` trên Windows

## Kiểm tra kết nối

- Mở Console (F12) của trình duyệt
- Nếu thấy warning: "SERVER_IP is set to localhost"
- → Bạn cần sửa file `config.js`

## Lưu ý quan trọng

- Chỉ cần sửa **1 lần** trong file `config.js`
- IP phải khớp với IP của máy chủ
- Cùng mạng LAN mới kết nối được

## Lỗi thường gặp

1. "Cannot connect to server"
   - Kiểm tra lại IP trong `config.js`
   - Đảm bảo server đang chạy

2. "localhost" warning
   - Sửa `SERVER_IP` từ 'localhost' thành IP thật

3. "Network error"
   - Kiểm tra firewall
   - Đảm bảo cùng mạng WiFi

---

**Sau khi cấu hình xong, bạn có thể sử dụng bình thường!**