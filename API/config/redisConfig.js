const redis = require("redis");

let redisClient;

const connectRedis = () => {
    if (!redisClient) {
        redisClient = redis.createClient({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT 
        });

        redisClient.on('error', function (err) {
            console.log('Error connect ' + JSON.stringify(err));
        });

        redisClient.on('connect', function() {
            console.log('Connected to Redis successfully');
        });

        redisClient.on('end', function() {
            console.log('Connection to Redis has been closed');
        });
    }
    return redisClient;
}

const addUserToListOnline = async (userId) => {
    try {
        // Thêm userId vào Redis với hạn sống là 3 phút
        await redisClient.set(`online-user:${userId}`, 'true');
        await redisClient.expire(`online-user:${userId}`, 180);

    } catch (error) {
        console.error('Error adding user to online list:', error);
    }
}

const getUsersOnline = async () => {
    try {
        // Lấy danh sách các key bắt đầu bằng 'online-user:'
        const keys = await redisClient.KEYS("online-user:*");

        // Lấy danh sách userId từ các key
        const userIds = keys.map(key => key.split(':')[1]);
        return userIds;
    } catch (error) {
        console.error('Error retrieving online users:', error);
        throw error;
    }
}
module.exports = { connectRedis, addUserToListOnline, getUsersOnline };

