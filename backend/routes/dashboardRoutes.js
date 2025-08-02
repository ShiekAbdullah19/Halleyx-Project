import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';

// Assuming you have middleware for authentication (protect) and admin role check (admin)
// Using adminAuth to be consistent with other admin routes
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

router.route('/stats').get(adminAuth, getDashboardStats);

export default router;