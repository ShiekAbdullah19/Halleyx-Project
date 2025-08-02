import validator from "validator";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import userModel from "../models/userModel.js";
import userActivityModel from "../models/userActivityModel.js";
import crypto from 'crypto';

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Log login activity
            await userActivityModel.create({
                userId: user._id,
                email: user.email,
                eventType: 'login',
                timestamp: new Date()
            });

            const token = createToken(user._id);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Route for user register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // checking user already exists or not
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }

        // validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        });

        const user = await newUser.save();

        // Log signup activity
        await userActivityModel.create({
            userId: user._id,
            email: user.email,
            eventType: 'signup',
            timestamp: new Date()
        });

        const token = createToken(user._id);

        res.json({ success: true, token });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
 
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const logoutUser = async (req, res) => {
    try {
        const { userId, email } = req.body;

        if (!userId || !email) {
            return res.status(400).json({ success: false, message: "Missing userId or email" });
        }

        await userActivityModel.create({
            userId,
            email,
            eventType: 'logout',
            timestamp: new Date()
        });

        res.json({ success: true, message: "Logout event recorded" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getCustomerActivity = async (req, res) => {
    try {
        // Fetch all user activity events (login, logout, signup)
        const activities = await userActivityModel.find().sort({ timestamp: -1 });

        console.log("Fetched user activities:", activities);

        // For each activity, fetch user details (name)
        const detailedActivities = [];

        for (const activity of activities) {
            const user = await userModel.findById(activity.userId);
            if (user) {
                detailedActivities.push({
                    userId: activity.userId,
                    name: user.name,
                    eventType: activity.eventType,
                    timestamp: activity.timestamp
                });
            }
        }

        console.log("Detailed activities to return:", detailedActivities);

        res.json({
            success: true,
            data: detailedActivities
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

import fs from 'fs';
import path from 'path';

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await userModel.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({
            success: true,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email,
            username: user.username || '',
            profilePicture: user.profilePicture || ''
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { firstName, lastName, username } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.username = username || user.username;

        await user.save();

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const uploadProfileAvatar = async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            // Delete uploaded file if user not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Optionally delete old profile picture file if exists
        if (user.profilePicture) {
            const oldPath = path.join(process.cwd(), user.profilePicture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Save new profile picture path (relative to project root or public folder)
        user.profilePicture = req.file.path;
        await user.save();

        res.json({ success: true, filePath: user.profilePicture });
    } catch (error) {
        console.error('Error uploading profile avatar:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const changeUserPassword = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

import mongoose from 'mongoose';

// List customers with search and filter
export const listCustomers = async (req, res) => {
    try {
        const { search = '', status } = req.query;

        // Build query object
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            if (status.toLowerCase() === 'active') {
                query.isActive = true;
            } else if (status.toLowerCase() === 'inactive' || status.toLowerCase() === 'blocked') {
                query.isActive = false;
            }
        }

        const customers = await userModel.find(query).select('-password').sort({ name: 1 });

        res.json({ success: true, data: customers });
    } catch (error) {
        console.error('Error listing customers:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update customer profile fields and portal access
export const updateCustomer = async (req, res) => {
    try {
        const { userId, firstName, lastName, email, isActive } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (email !== undefined) user.email = email;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        res.json({ success: true, message: 'Customer updated successfully' });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reset customer password with autogenerated temporary password
export const resetCustomerPassword = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate temporary password
        const tempPassword = crypto.randomBytes(6).toString('hex');

        // Hash temporary password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        user.password = hashedPassword;
        await user.save();

        // Optionally, send tempPassword via email here or return to admin
        res.json({ success: true, tempPassword, message: 'Temporary password generated' });
    } catch (error) {
        console.error('Error resetting customer password:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Impersonate customer - issue token for customer session
export const impersonateCustomer = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Create token for impersonation session
        const token = createToken(user._id);

        // Log impersonation event
        await userActivityModel.create({
            userId: req.user?.id || 'admin', // admin id or placeholder
            email: req.user?.email || 'admin@example.com',
            eventType: 'impersonate',
            timestamp: new Date()
        });

        res.json({ success: true, token, message: 'Impersonation token generated' });
    } catch (error) {
        console.error('Error impersonating customer:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await userModel.deleteOne({ _id: userId });

        res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        console.error('Error deleting customer:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { loginUser, registerUser, adminLogin, logoutUser, getCustomerActivity }
