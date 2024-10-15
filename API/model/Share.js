const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
    sweet_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Tweet', require: true},
    content: {type: String, require: true},
    // image: [{type: String}],
    likes: [{type:mongoose.Schema.Types.ObjectId, ref: 'User'}],
    comments: [{type:mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    shares: [],
    edit_history: [{
        // edit_id: { type: mongoose.Schema.Types.ObjectId, required: true },
        content: { type: String }, // Nội dung cũ của bài viết
        updated_at: { type: Date, default: Date.now }, // Ngày giờ chỉnh sửa
        images: [{ type: String }]
    }],
    isPin: { type: Boolean, default: false},
    isDelete: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Share', shareSchema)
