const Notification = require('../model/Notification ');
const {wss,userConnection} = require('../config/webSocketConfig')
const { WebSocket } = require('ws');
const formatResponse = require('../common/ResponseFormat');
const asyncHandle = require('express-async-handler')

const createNotification = async (notificationData) => {
    try {
        const tweetId = notificationData?.tweetId;
        
        const existingNotification = await Notification.findOne({ tweetId: tweetId });
        console.log('check in notify')
        if (existingNotification && existingNotification.content != notificationData.content) {
            // Nếu đã tồn tại, cập nhật nội dung thông báo
            existingNotification.content = notificationData.content;
            await existingNotification.save();
        } else {
            // Nếu không tồn tại, tạo mới thông báo
            await Notification.create(notificationData);
        }
        
        const notifyData = {
            type: "Notify",
            content: notificationData.content,
            userId: notificationData.userId.toString()
        }
        
        // Gửi thông báo tới tất cả kết nối WebSocket
        userConnection.forEach(connection => {
            if (connection.readyState === WebSocket.OPEN) {
                connection.send(JSON.stringify(notifyData));
            }
        });
    } catch (error) {
        throw error;
    }
};

const getNotificationById = async (notificationId) => {
    try {
        const notification = await Notification.findById(notificationId);
        return notification;
    } catch (error) {
        throw error;
    }
};

const getNotificationsByUser = asyncHandle(async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ userId: userId })
            .populate('userId', '_id, displayName')
            .populate('tweetId', 'images,_id')
            .skip(skip)
            .limit(limit)
            .sort({created_at:1});

        const totalNotifications = await Notification.countDocuments({ userId: userId });

        res.status(200).json({
            data: notifications,
            isSuccess: true,
            total: totalNotifications,
            page,
            limit
        });
    } catch (error) {
        throw error;
    }
});


//update đã đọc
const markNotificationAsRead = async (notificationId) => {
    try {
        const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
        return notification;
    } catch (error) {
        throw error;
    }
};


const deleteNotification = async (notificationId) => {
    try {
        const result = await Notification.findByIdAndDelete(notificationId);
        return result;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createNotification,
    getNotificationById,
    getNotificationsByUser,
    markNotificationAsRead,
    deleteNotification
};
