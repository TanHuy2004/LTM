const express = require('express');
const router = express.Router();

const RegisterController = require('../controllers/registerController');
const LoginController = require('../controllers/LoginController');
const Auth = require('../middleware/authMiddleware');

// PUBLIC
router.post('/register', RegisterController.create);
router.post('/login', LoginController.login);

// PROTECTED
router.get('/users', Auth.verifyToken, Auth.authorizeRole("Admin"), RegisterController.getAll);
router.get("/users/status",Auth.verifyToken,Auth.authorizeRole("Admin"),RegisterController.getAllWithStatus);
router.get('/users/:id', Auth.verifyToken, RegisterController.getById);
router.put('/users/:id', Auth.verifyToken, RegisterController.update);
router.delete('/users/:id', Auth.verifyToken, Auth.authorizeRole("Admin"), RegisterController.delete);
router.get('/total', Auth.verifyToken, Auth.authorizeRole("Admin"), RegisterController.getTotalUser);
router.get('/users/unusual-logins', Auth.verifyToken, Auth.authorizeRole("Admin"), LoginController.login);
module.exports = router;
