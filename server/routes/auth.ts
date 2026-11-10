import express, { Router } from 'express';
import {
  register,
  login,
  getMe,
  logout,
  getAllUsers,
  getUser,
  updateUserRole,
  deleteUser,
  updateDetails,
  updatePassword,
  refreshToken,
  updateAvatar,
  forgotPassword,
  resetPassword
} from '../controllers/authController';
import { protect, authorize } from '../middleware/auth';
import { limitLogin, limitRegistration, limitRecovery, limitRefresh } from '../middleware/authRateLimit';

const router: Router = express.Router();

// Public routes
router.post('/register', limitRegistration, register);
router.post('/login', limitLogin, login);
router.post('/forgotpassword', limitRecovery, forgotPassword);
router.put('/resetpassword/:resettoken', limitRecovery, resetPassword);

// Protected routes
// Clear the cookie even when a previous token is expired.
// Logout is a POST with an authenticated token; GET logout is removed
// to avoid sign-out via untrusted links.
router.post('/logout', protect, logout);
router.use(protect);
router.post('/refresh-token', limitRefresh, refreshToken);
router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.post('/updatedetails', updateDetails);
router.put('/updatepassword', updatePassword);
router.post('/updatepassword', updatePassword);
router.put('/updateavatar', updateAvatar);

// Admin routes
router.use('/users', authorize('admin'));
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router; 