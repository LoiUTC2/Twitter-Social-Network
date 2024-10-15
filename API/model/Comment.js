const mongoose = require("mongoose");

//const commentSchema = mongoose.model('Comment', new mongoose.Schema({
const commentSchema = new mongoose.Schema({

    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tweet_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Tweet', required: true },
    content: { type: String, required: true },
    image: [{type: String}],
    likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    comment_reply: [{
        user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
        content: {type: String, require: true},
        image: [{type: String}],
        likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        edit_history: [{
            content: { type: String, required: true }, 
            images: [{ type: String }],
            updated_at: { type: Date, default: Date.now }, 
        }],
        create_at: {type: Date, default: Date.now},
        updated_at: {type: Date},

    }],
    edit_history: [{
        content: { type: String, required: true }, 
        updated_at: { type: Date, default: Date.now }, 
        images: [{ type: String }]
    }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date }
});

module.exports = mongoose.model('Comment', commentSchema)
