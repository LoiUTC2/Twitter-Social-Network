const mongoose = require("mongoose");

const moment = require("moment-timezone")

const tweetSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    content: { type: String, required: true },
    image: [{ type: String }],
     //privacy: { type: Number, enum: Object.values(Privacys), default: Privacys.PRIVACY_PUBLIC }, // Trường privacy với giá trị enum,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], 
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    edit_history: [{
        // edit_id: { type: mongoose.Schema.Types.ObjectId, required: true },
        content: { type: String, required: true }, 
        updated_at: { type: Date, default: Date.now }, 
        images: [{ type: String }]
    }],
    isPin: { type: Boolean, default: false},
    isDelete: { type: Boolean, default: false },
    // created_at: { type: Date, default: () => moment.tz('Asia/Ho_Chi_Minh').toDate()},
    created_at: { type: Date, default: Date.now},

    updated_at: { type: Date},
});
const Privacys = {
    PRIVACY_PUBLIC: 1001,
    PRIVACY_FOLLOWERS: 1002,
    PRIVACY_PRIVATE: 1003
};
module.exports = mongoose.model('Tweet', tweetSchema)
