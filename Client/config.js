
const SERVER_CONFIG = {
    SERVER_IP: "192.168.1.102", 
    PORT: 5000,
};

const SERVER_URL = `http://${SERVER_CONFIG.SERVER_IP}:${SERVER_CONFIG.PORT}`;

window.AppConfig = {
    getServerUrl: () => SERVER_URL,
    getApiUrl: (endpoint) => SERVER_URL + endpoint,
    getSocketUrl: () => SERVER_URL,
};

console.log("Client kết nối tới:", SERVER_URL);
