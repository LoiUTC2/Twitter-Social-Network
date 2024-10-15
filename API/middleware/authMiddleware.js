const jwt = require('jsonwebtoken');
const formatResponse = require('../common/ResponseFormat');
const User = require('../model/User');
const { connectRedis, addUserToListOnline } = require('../config/redisConfig'); 

const secretKey = process.env.JWT_CODE;


const authenticationToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let decodedToken;
    if (!token) {
        return res.status(401).json(formatResponse(null, false, "Không tồn tại token xác thực người dùng."));
    }
    try {
        decodedToken = await jwt.verify(token, secretKey);
        req.user = { 
            userId: decodedToken.userId,
            email: decodedToken.email,
            displayName:decodedToken.displayName
        }; 
        addUserToListOnline(decodedToken.userId);
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            decodedToken = jwt.decode(token);
            try {
                if (!decodedToken || !decodedToken?.userId) {
                    return res.status(401).json(formatResponse(null, false, "Xác thực người dùng thất bại. Thông tin không hợp lệ"));
                }
                const user = await User.findOne({ _id: decodedToken?.userId });

                if (!user || !user.refreshToken) {
                    return res.status(401).json(formatResponse(null, false, "Xác thực người dùng thất bại. Không tìm thấy người dùng."));
                }
                //Kiểm tra refresh token còn hạn hay không
                jwt.verify(user.refreshToken, secretKey);

                const newAccessToken = jwt.sign({ userId: user._id, email: user.email,displayName:user.displayName }, secretKey, { expiresIn: '15m' });
                const userResponse = {
                    userId: user._id.toString(),
                    email: user.email,
                    displayName:user.displayName
                }
                // Gửi access token mới trong header
                res.setHeader('Authorization', `Bearer ${newAccessToken}`);
                req.user = {
                    userId: user._id.toString(),
                    email: user.email,
                    displayName:user.displayName
                }
                addUserToListOnline( user._id.toString());
                next();
            } catch (error) {
                console.log(error)
                return res.status(403).json(formatResponse(null, false, "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại"));
            }
        } else {
            return res.status(403).json(formatResponse(null, false, "Access token không hợp lệ!!"));
        }
    }
}

//Hàm mỗi lần req qua sẽ lưu thông tin người dùng đó vào list user online(redis) nếu như xác thực thành công
// const addUserToListOnline = (userId) => {
//     try {
//         const redisClient = connectRedis();
        
//         // Thêm ID người dùng vào danh sách thành viên trực tuyến với thời gian tồn tại là 3 phút
//         redisClient.sadd("online-users", userId, (err, reply) => {
//             if (err) {
//                 console.error('Error adding user to online list:', err);
//                 return res.status(500).json({ error: 'Failed to add user to online list' });
//             } else {
//                 redisClient.expire("online-users", 180); 
//                 next();
//             }
//         });
//     } catch (error) {
//         console.error('Error add user to list online:', error);
//     }
// }

module.exports = authenticationToken;
