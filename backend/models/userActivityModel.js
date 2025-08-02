import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    email: { type: String, required: true },
    eventType: { type: String, enum: ['login', 'logout'], required: true },
    timestamp: { type: Date, default: Date.now }
});

const userActivityModel = mongoose.models.userActivity || mongoose.model('userActivity', userActivitySchema);

export default userActivityModel;
