const mongoose = require("mongoose");

const notificationSchema = mongoose.model('Notification', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, //Thông báo đến(chủ account)
    content: { type: String, required: true },
    read: { type: Boolean, default: false }, // Đánh dấu đã đọc hay chưa
    created_at: { type: Date, default: Date.now },
    relateTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //Người liên quan(người tương tác)
    tweetId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Tweet' } //bài viết tương tác(nếu có)
}));
module.exports = notificationSchema;