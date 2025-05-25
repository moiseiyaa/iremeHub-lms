"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/forgotpassword', authController_1.forgotPassword);
router.put('/resetpassword/:resettoken', authController_1.resetPassword);
// Protected routes
router.use(auth_1.protect);
router.post('/refresh-token', authController_1.refreshToken);
router.get('/me', authController_1.getMe);
router.get('/logout', authController_1.logout);
router.put('/updatedetails', authController_1.updateDetails);
router.post('/updatedetails', authController_1.updateDetails);
router.put('/updatepassword', authController_1.updatePassword);
router.post('/updatepassword', authController_1.updatePassword);
router.put('/updateavatar', authController_1.updateAvatar);
// Admin routes
router.use('/users', (0, auth_1.authorize)('admin'));
router.get('/users', authController_1.getAllUsers);
router.get('/users/:id', authController_1.getUser);
router.put('/users/:id/role', authController_1.updateUserRole);
router.delete('/users/:id', authController_1.deleteUser);
exports.default = router;
