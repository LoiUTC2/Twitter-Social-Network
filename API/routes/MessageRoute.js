const express = require('express');
const router = express.Router();
const { getAllMessages, getAllMessagesBetweenUsers, sendMessage, updateMessage } = require("../controllers/MessageController");
const UploadImageMiddleware = require('../middleware/UploadImageMiddleware');

// Định nghĩa các endpoints cho tin nhắn
router.get('/', getAllMessages); // Lấy toàn bộ tin nhắn của người dùng
router.get('/:otherUserId', getAllMessagesBetweenUsers); // Lấy toàn bộ tin nhắn giữa hai người dùng
router.post('/',UploadImageMiddleware.array('image'), sendMessage); // Gửi tin nhắn mới
router.put('/:id', updateMessage); // Cập nhật tin nhắn

module.exports = router;
