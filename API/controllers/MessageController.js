const Message = require('../model/Message');
const asyncHandle = require('express-async-handler')
const formatResponse = require('../common/ResponseFormat');
const { isObjectIdOrHexString, default: mongoose } = require('mongoose');
const { ObjectId } = require('mongodb');
const { WebSocket } = require('ws');
// API để lấy toàn bộ tin nhắn của người dùng (mỗi tin nhắn bao gồm tên người gửi và tin nhắn cuối cùng)
const getAllMessages = asyncHandle(async (req, res) => {
    try {
        const user_id = req.user.userId;
        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderID: new ObjectId(user_id) },
                        { receiverID: new ObjectId(user_id) }
                    ]
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { receiverID: '$receiverID', senderID: '$senderID' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$_id', '$$receiverID'] },
                                        { $eq: ['$_id', '$$senderID'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'userInfo'
                }
            },
            {
                $group: {
                    _id: { $cond: [{ $eq: ['$receiverID', new ObjectId(user_id)] }, '$senderID', '$receiverID'] },
                    lastMessage: { $last: '$$ROOT' },
                    userInfo: { $first: '$userInfo' }
                }
            },
            {
                $project: {
                    'lastMessage.senderID': 1,
                    'lastMessage.receiverID': 1,
                    'lastMessage.content': 1,
                    'lastMessage.createdAt': 1,
                    'userInfo.username': 1,
                    'userInfo.displayName': 1,
                    'userInfo._id': 1,
                    'userInfo.avatar':1
                }
            },
            {
                $sort: { _id: -1 }
            },
        ]);

        res.status(200).json(formatResponse(messages, true, null));
    } catch (error) {
        res.status(500).json(formatResponse(null, false, error.message));
    }
});
// API để lấy toàn bộ tin nhắn giữa hai người dùng (sắp xếp theo thời gian)
const getAllMessagesBetweenUsers = asyncHandle(async (req, res) => {
    try {
        const user_id = req.user.userId;
        const otherUserId = req.params.otherUserId;

        const messages = await Message.find({
            $or: [
                { senderID: user_id, receiverID: otherUserId },
                { senderID: otherUserId, receiverID: user_id }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(formatResponse(messages, true, null));
    } catch (error) {
        console.log(error)
        res.status(500).json(formatResponse(null, false, "Internal Server Error"));
    }
});

// API để gửi tin nhắn mới
const sendMessage = asyncHandle(async (message, userList) => {
    try {
        const { senderId, receiverId, content } = message;
        const newMessage = await Message.create({
            senderID: new mongoose.Types.ObjectId(senderId),
            receiverID: new mongoose.Types.ObjectId(receiverId),
            images:message.images,
            content,
            createdBy: new mongoose.Types.ObjectId(senderId)
        });

        // Lặp qua tất cả các kết nối người dùng và gửi tin nhắn mới
        userList.forEach(connection => {
            if (connection.readyState === WebSocket.OPEN) {
                connection.send(JSON.stringify(newMessage));
            }
        });

        return formatResponse(newMessage, true, "Message sent successfully");
    } catch (error) {
        console.error(error);
        //res.status(500).json(formatResponse(null, false, "Internal Server Error"));
    }
});

// API để cập nhật tin nhắn (chỉ của người dùng đang đăng nhập)
const updateMessage = asyncHandle(async (req, res) => {
    try {
        const messageId = req.params.id;
        const updateData = req.body;
        const user_id = req.user.userId;

        const updatedMessage = await Message.findOneAndUpdate({ _id: messageId, senderID: user_id }, updateData, { new: true });

        res.status(200).json(formatResponse(updatedMessage, true, "Message updated successfully"));
    } catch (error) {
        res.status(500).json(formatResponse(null, false, "Internal Server Error"));
    }
});

module.exports = { getAllMessages, getAllMessagesBetweenUsers, sendMessage, updateMessage };