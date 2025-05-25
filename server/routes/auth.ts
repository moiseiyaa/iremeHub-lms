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

const router: Router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes
router.use(protect);
router.post('/refresh-token', refreshToken);
router.get('/me', getMe);
router.get('/logout', logout);
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