const SERVER_CONFIG = {
  // Example: const SERVER_IP = '192.168.1.106';
  // Contact the server administrator for the correct IP
  SERVER_IP: "192.168.1.106", // <-- CHANGE THIS VALUE!
  PORT: 5000,
};

const SERVER_URL = `http://${SERVER_CONFIG.SERVER_IP}:${SERVER_CONFIG.PORT}`;

// Export configuration
window.AppConfig = {
  getServerUrl: () => SERVER_URL,
  getApiUrl: (endpoint) => SERVER_URL + endpoint,
  getSocketUrl: () => SERVER_URL,

  // Helper to check configuration
  checkConfig: () => {
    if (SERVER_CONFIG.SERVER_IP === "localhost") {
      console.warn("⚠️ WARNING: SERVER_IP is set to localhost");
      console.warn("   This only works on the server machine");
      console.warn(
        "   Client machines must change SERVER_IP to server's IP address"
      );
    }
  },
};

// Auto-check configuration on load
window.AppConfig.checkConfig();
