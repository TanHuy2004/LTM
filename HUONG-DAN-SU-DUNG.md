# HƯỚNG DẪN SỬ DỤNG - BÀI TẬP MẠNG MÁY TÍNH

## 📋 Yêu cầu
- Node.js đã cài đặt
- Các máy trong cùng mạng LAN
- SQL Server đã cài đặt và cấu hình

## 🖥️ HƯỚNG DẪN CHO MÁY SERVER

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Cấu hình database
Mở file `Server/.env` và điều chỉnh thông tin database:
```
DB_NAME=LTM
DB_USER=sa
DB_PASSWORD=123456
DB_HOST=DUONGTANHUY
```

### Bước 3: Khởi động server (Cách nhanh)
```bash
start.bat
```
Hoặc thủ công:
```bash
node Server/get-ip.js
node Server/server.js
```

Script sẽ:
- Tự động tìm địa chỉ IP của máy server
- Cập nhật file `Client/config.js` với IP đúng
- Khởi động server
- Hiển thị URL để các máy client truy cập

## 💻 HƯỚNG DẪN CHO MÁY CLIENT

### Cách 1: Tự động (Khuyến nghị)
1. Copy toàn bộ thư mục dự án sang máy client
2. Hỏi máy server lấy địa chỉ IP (ví dụ: `192.168.1.100`)
3. Chạy lệnh:
```bash
node Server/get-ip.js
```
4. Mở file `Client/config.js` và sửa `SERVER_IP` thành IP của máy server
5. Chạy:
```bash
node Server/server.js
```
6. Mở trình duyệt: `http://localhost:5000`

### Cách 2: Thủ công
1. Copy toàn bộ thư mục dự án sang máy client
2. Mở file `Client/config.js`
3. Sửa dòng:
```javascript
SERVER_IP: "192.168.1.100",  // Thay bằng IP của máy server
```
4. Lưu file
5. Chạy: `node Server/server.js`
6. Mở trình duyệt: `http://localhost:5000`

## 🔍 Kiểm tra kết nối

### Trên máy server:
```bash
ipconfig  # Windows
ifconfig  # Linux/Mac
```
Tìm địa chỉ IPv4 (thường dạng 192.168.x.x hoặc 10.x.x.x)

### Trên máy client:
```bash
ping <IP_CUA_MAY_SERVER>
```
Nếu ping thành công → Có thể kết nối

## ⚠️ Xử lý lỗi thường gặp

### Lỗi: "Cannot connect to server"
- Kiểm tra máy server đã chạy chưa
- Kiểm tra IP trong `Client/config.js` có đúng không
- Kiểm tra firewall có chặn port 5000 không

### Lỗi: "Database connection failed"
- Kiểm tra SQL Server đã chạy chưa
- Kiểm tra thông tin trong `Server/.env`
- Kiểm tra user có quyền truy cập database không

### Lỗi: "Port 5000 already in use"
- Đóng ứng dụng đang dùng port 5000
- Hoặc đổi PORT trong `Server/.env`

## 📝 Lưu ý
- Tất cả máy phải trong cùng mạng LAN
- Máy server phải chạy trước khi máy client kết nối
- Mỗi lần đổi mạng, cần chạy lại `node Server/get-ip.js`
