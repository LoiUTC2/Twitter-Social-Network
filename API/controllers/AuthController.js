//Controller xử lí người dùng đăng nhập, xác thực người dùng
const User = require('../model/User');
const asyncHandle = require('express-async-handler');
const { generateRefreshToken, generateAccessToken } = require("../common/CommonFunctions");
const formatResponse = require('../common/ResponseFormat');
const { connectRedis } = require('../config/redisConfig');
const { sendEmail } = require('../config/sendMailConfig');
const jwt = require('jsonwebtoken');
const { uploadImage } = require('../config/cloudinaryConfig');
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const redisClient = connectRedis();
const secretKey = process.env.JWT_CODE;

const registerUser = asyncHandle(async (req, res) => {
    const email = req.body.email;
    const username = req.body.username;

    const existData = await User.findOne({ email: email } || { username: username });
    if (existData) {
        return res.status(400).json(formatResponse(null, false, "Register failed!! Try again with other username or email."));
    }
    const newUser = await User.create(req.body);
    return res.status(200).json(formatResponse(null, true, null));
});
const loginUser = asyncHandle(async (req, res) => {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });
    if (!findUser) {
        res.status(403).json(formatResponse(null, false, "Không tìm thấy người dùng."));
    };
    if (findUser && (await findUser.isPasswordMatched(password))) {
        const encodeData = {
            userId: findUser._id,
            email: findUser.email,
            displayName: findUser.displayName
        }
        const refeshToken = generateRefreshToken(encodeData);
        const accessToken = generateAccessToken(encodeData);

        const updateUser = await User.findByIdAndUpdate(findUser._id, { refreshToken: refeshToken }, { new: true });
        const responseData = {
            _id: findUser?._id,
            username: findUser?.username ?? "",
            displayName: findUser?.displayName ?? "",
            email: findUser?.email ?? "",
            mobile: findUser?.mobile ?? "",
            token: accessToken,
            avatar:findUser?.avatar ?? ""
        }
        res.status(200).json(formatResponse(responseData, true, "Đăng nhập thành công"));
    } else {
        res.status(403).json(formatResponse(null, false, "Mật khẩu không hợp lệ. Vui lòng thử lại."));
    }
});
const loginByEmail = asyncHandle(async (req, res) => {
    const { email, userData } = req.body;
    const findUser = await User.findOne({ email: email });
    if (!findUser) {
        const newUserInfo = {
            username: userData?.email.replace('@gmail.com', ''),
            avatar: userData.picture,
            displayName: userData?.name,
            password: ' ',
            email: userData?.email,
        }
        await User.create(newUserInfo).then((result, err) => {
            if (!err) {
                res.status(200).json(formatResponse(result, true, "Đăng nhập thành công"));

            }
        })
        res.status(403).json(formatResponse(null, false, "Tài khoản không tồn tại. Vui lòng thử lại."));
    }
    else {
        const encodeData = {
            userId: findUser._id.toString(),
            email: findUser.email,
            displayName: findUser.displayName
        }
        const refeshToken = generateRefreshToken(encodeData);
        const accessToken = generateAccessToken(encodeData);

        const updateUser = await User.findByIdAndUpdate(findUser._id, { refreshToken: refeshToken }, { new: true });
        const responseData = {
            _id: findUser?._id,
            username: findUser?.username ?? "",
            displayName: findUser?.displayName ?? "",
            email: findUser?.email ?? "",
            mobile: findUser?.mobile ?? "",
            token: accessToken,
            avatar:findUser?.avatar ?? ""
        }
        res.status(200).json(formatResponse(responseData, true, "Đăng nhập thành công"));
    }
});
const sendPasswordByEmail = asyncHandle(async (req, res) => {
    const { email } = req.body;
    const findUser = await User.findOne({ email });
    if (!findUser) {
        res.status(403).json(formatResponse(null, false, "Không tìm thấy người dùng."));
        return;
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetPasswordData = {
        userId: findUser._id,
        resetCode: resetCode
    };

    const success = await setKeyValue(`reset_password_code_${findUser._id}`, JSON.stringify(resetPasswordData));

    if (success) {
        console.log('Reset password code set successfully');
        const sendEmailPayload = {
            resetCode: resetCode,
            to: findUser.email
        };
        sendEmail(sendEmailPayload, (info) => {
            if (info && info.accepted.length > 0) {
                res.status(200).json(formatResponse(null, true, "Gửi mã OTP thành công."));
            } else {
                res.status(400).json(formatResponse(null, true, "Gửi mã OTP thất bại."));
            }
        });

    } else {
        console.error('Failed to set reset password code');
        res.status(500).json(formatResponse(null, false, "Đã xảy ra lỗi khi gửi mã đặt lại mật khẩu."));
    }
});

// API xác thực OTP
const authenticateOTP = asyncHandle(async (req, res) => {
    const { email, code } = req.body;

    try {
        const user = await User.findOne({ email });

        // Kiểm tra xem người dùng có tồn tại không
        if (!user) {
            return res.status(403).json(formatResponse(null, false, "Không tìm thấy người dùng."));
        }
        // Lấy giá trị reset code từ Redis
        const resetCodeData = await getKeyValue(`reset_password_code_${user._id}`);
        // Kiểm tra xem có tồn tại reset code trong Redis không
        if (!resetCodeData) {
            return res.status(403).json(formatResponse(null, false, "Mã OTP đã hết hạn. Vui lòng thử lại"));
        }
        const dataFromRedis = JSON.parse(resetCodeData);
        console.log("dataFromRedis,", dataFromRedis)
        console.log(code, dataFromRedis.resetCode);
        if (dataFromRedis.resetCode != code)
            return res.status(400).json(formatResponse(null, false, "Mã OTP không hợp lệ. Vui lòng thử lại"));

        const tokenResetPassword = jwt.sign({ id: user._id, resetCode: code }, secretKey, { expiresIn: '3m' });
        await setKeyValue(`confirm_otp_${user._id}`, tokenResetPassword);

        // Trả về thành công nếu mã OTP hợp lệ
        return res.status(200).json(formatResponse({ token: tokenResetPassword }, true, "Xác thực OTP thành công."));

    } catch (error) {
        console.error("Error authenticating OTP:", error);
        return res.status(500).json(formatResponse(null, false, "Đã xảy ra lỗi khi xác thực OTP."));
    }
});

// API xác nhận đổi mật khẩu
const confirmResetPassword = asyncHandle(async (req, res) => {
    const { email, newPassword, token } = req.body;

    try {
        const user = await User.findOne({ email: email });
        jwt.verify(token, secretKey, async (err, decoded) => {
            if (err) {
                return res.status(400).json(formatResponse(null, false, "Phiên thay đổi mật khẩu hết hạn. Vui lòng thử lại"));
            } else {
                // Kiểm tra xem người dùng có tồn tại không
                if (!user) {
                    return res.status(403).json(formatResponse(null, false, "Không tìm thấy người dùng."));
                }
                //Lấy thông tin dưới cache
                const tokenConfirmPasswordFromRedis = await getKeyValue(`confirm_otp_${decoded.id}`);
                if (!tokenConfirmPasswordFromRedis) {
                    return res.status(400).json(formatResponse(null, false, "Mã OTP hết hạn. Vui lòng thử lại"));
                }

                const executeChangePassword = await jwt.verify(tokenConfirmPasswordFromRedis, secretKey, async (err, decoded) => {
                    if (err) {
                        return res.status(400).json(formatResponse(null, false, "Token gửi xác thực thay đổi mật khẩu không hợp lệ. Vui lòng thử lại"));
                    }
                    //Lấy lại mã OTP để xác thực một lần nữa
                    const resetCodeData = await getKeyValue(`reset_password_code_${user._id}`);

                    if (!resetCodeData) {
                        return res.status(400).json(formatResponse(null, false, "Phiên thay đổi mật khẩu hết hạn. Vui lòng thử lại"));
                    }
                    const dataFromRedis = JSON.parse(resetCodeData);

                    if (decoded.resetCode != dataFromRedis.resetCode) {
                        return res.status(400).json(formatResponse(null, false, "Cập nhật mật khẩu thất bại. Vui lòng thử lại"));
                    }
                })

                // Cập nhật mật khẩu của người dùng
                // const updateResult = await user.updateUserPassword(newPassword);
                const filter = { _id: user._id };
                const salt = await bcrypt.genSaltSync(10);
                const update = {
                    $set: {
                        password: await bcrypt.hash(newPassword, salt)
                    }
                }
                const result = await User.findOneAndUpdate(filter, update);

                // if (updateResult.isSuccess) {
                if (result) {
                    // Xóa reset code từ Redis sau khi sử dụng
                    await redisClient.del(`reset_password_code_${user._id}`);

                    return res.status(200).json(formatResponse(null, true, "Cập nhật mật khẩu thành công."));
                }
                return res.status(400).json(formatResponse(null, false, "Cập nhật mật khẩu thất bại"));
            }
        });


    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json(formatResponse(null, false, "Đã xảy ra lỗi khi đặt lại mật khẩu."));
    }
});




const setKeyValue = async (key, value) => {
    try {
        // Đặt giá trị của key-value
        await redisClient.set(key, value);

        // Đặt thời gian sống cho key là 3 phút (180 giây)
        await redisClient.expire(key, 180);

        console.log(`Key ${key} set successfully`);
        return true;
    } catch (error) {
        console.error(`Error setting key ${key}:`, error);
        return false;
    }
};
const getKeyValue = async (key) => {
    try {
        const result = await redisClient.get(key);
        return result;
    } catch (err) {
        console.log("Get key value failed. Err:", err);
        return false;
    }
}
const upload = asyncHandle(async (req, res) => {
    const data = await uploadImage(req.files);
    return res.status(200).json(data)

});
module.exports = { registerUser, loginUser, sendPasswordByEmail, authenticateOTP, confirmResetPassword, upload, loginByEmail }