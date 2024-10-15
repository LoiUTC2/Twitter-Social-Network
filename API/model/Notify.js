const { Schema } = mongoose;

const notificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    content: { type: String, required: true }, 
    createdAt: { type: Date, default: Date.now }, 
    read: { type: Boolean, default: false },
    relateTo: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    tweetId:{ type: Schema.Types.ObjectId, ref: 'Tweet' }, 
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
