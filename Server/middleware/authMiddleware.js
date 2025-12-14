const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "default_secret_key";

const AuthMiddleware = {
  verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Thiếu token!" });

    let token = authHeader;
    if (authHeader.startsWith("Bearer ")) token = authHeader.split(" ")[1];

    jwt.verify(token, SECRET, (err, payload) => {
      if (err) return res.status(403).json({ message: "Token không hợp lệ!" });
      req.user = payload; // payload chứa id và role
      next();
    });
  },

  authorizeRole(role) {
    return (req, res, next) => {
      if (!req.user) return res.status(401).json({ message: "Chưa xác thực!" });
      if (req.user.role !== role) {
        return res.status(403).json({ message: "Không có quyền truy cập!" });
      }
      next();
    };
  },
};

module.exports = AuthMiddleware;
