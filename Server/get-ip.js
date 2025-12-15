// Script to help find your IP address for network configuration
const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Đang tìm địa chỉ IP của máy server...\n');

const interfaces = os.networkInterfaces();
let serverIP = null;
for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
        if (interface.family === 'IPv4' && !interface.internal) {
            serverIP = interface.address;
            console.log(`📍 ${name}: ${interface.address}`);
        }
    }
}

if (serverIP) {
    console.log(`\n✅ Địa chỉ IP máy server: ${serverIP}`);
    console.log(`\n📝 HƯỚNG DẪN CHO MÁY CLIENT:`);
    console.log(`   1. Mở file: Client/config.js`);
    console.log(`   2. Đổi SERVER_IP thành: "${serverIP}"`);
    console.log(`   3. Lưu file và chạy: node Server/server.js`);
    console.log(`   4. Truy cập: http://${serverIP}:5000\n`);
    
    // Tự động cập nhật file config.js cho client
    const configPath = path.join(__dirname, '../Client/config.js');
    const configContent = `const SERVER_CONFIG = {
        SERVER_IP: "${serverIP}",
        PORT: 5000,
        };

        const SERVER_URL = \`http://\${SERVER_CONFIG.SERVER_IP}:\${SERVER_CONFIG.PORT}\`;

        // Export configuration
        window.AppConfig = {
        getServerUrl: () => SERVER_URL,
        getApiUrl: (endpoint) => SERVER_URL + endpoint,
        getSocketUrl: () => SERVER_URL,

        // Helper to check configuration
        checkConfig: () => {
            console.log("✅ Server URL:", SERVER_URL);
        },
        };

        window.AppConfig.checkConfig();
        `;
    
    fs.writeFileSync(configPath, configContent, 'utf8');
    console.log(`✅ Đã tự động cập nhật Client/config.js với IP: ${serverIP}\n`);
    
} else {
    console.log('❌ Không tìm thấy địa chỉ IP mạng');
    console.log('\n💡 Kiểm tra:');
    console.log('   - Máy đã kết nối mạng chưa?');
    console.log('   - Thử chạy: ipconfig (Windows) hoặc ifconfig (Linux/Mac)');
}

console.log('===================================\n');