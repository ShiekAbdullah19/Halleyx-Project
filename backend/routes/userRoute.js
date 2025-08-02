import express from 'express';
import { loginUser, registerUser, adminLogin, logoutUser, getCustomerActivity, getUserProfile, updateUserProfile, uploadProfileAvatar, changeUserPassword, listCustomers, updateCustomer, resetCustomerPassword, impersonateCustomer, deleteCustomer } from '../controllers/userController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';
import upload from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);
userRouter.post('/logout', logoutUser);
userRouter.get('/customer-activity', adminAuth, getCustomerActivity);

// New routes for user profile management
userRouter.get('/profile', authUser, getUserProfile);

userRouter.get('/customers', adminAuth, listCustomers);
userRouter.put('/profile', authUser, updateUserProfile);
userRouter.post('/profile/avatar', authUser, upload.single('profileImage'), uploadProfileAvatar);
userRouter.put('/change-password', authUser, changeUserPassword);

// Admin routes for customer management
userRouter.put('/customers/update', adminAuth, updateCustomer);
userRouter.post('/customers/reset-password', adminAuth, resetCustomerPassword);
userRouter.post('/customers/impersonate', adminAuth, impersonateCustomer);
userRouter.delete('/customers/delete', adminAuth, deleteCustomer);

export default userRouter;
