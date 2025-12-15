const SERVER_CONFIG = {
        SERVER_IP: "192.168.1.106",
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
            console.log("✅ Server URL:", SERVER_URL);
        },
        };

        window.AppConfig.checkConfig();
        