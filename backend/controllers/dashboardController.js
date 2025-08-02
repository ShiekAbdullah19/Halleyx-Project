import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        
        // Counts all documents in the users collection, as the admin is not stored here.
        const customerCount = await User.countDocuments();

        // Aggregating order counts by status
        const orderStatusCounts = await Order.aggregate([
            {
                $group: {
                    _id: '$status', // Assuming your Order model has a 'status' field
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: '$count'
                }
            }
        ]);

        // Converting the array to an object for easier use on the frontend
        const orderStats = orderStatusCounts.reduce((acc, item) => {
            acc[item.status] = item.count;
            return acc;
        }, {});

        res.json({
            productCount,
            customerCount,
            orderStats
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server Error: Could not fetch dashboard statistics.' });
    }
};