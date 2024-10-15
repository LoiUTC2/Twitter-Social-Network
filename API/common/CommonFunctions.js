const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_CODE;

const generateRefreshToken = (user) => {
    const token = jwt.sign(user, secretKey, { expiresIn: '15d' });
    return token;
};

const generateAccessToken = (user) => {
    const token = jwt.sign( user , secretKey, { expiresIn: '15m' });
    return token;
};
const generateToken = (userInfo) => {
    const refeshToken = jwt.sign(userInfo, secretKey, { expiresIn: '7d' });
    const accessToken = jwt.sign(userInfo, secretKey, { expiresIn: '15m' });
    return { refeshToken, accessToken };
}

module.exports = {
    generateRefreshToken,
    generateAccessToken
};
