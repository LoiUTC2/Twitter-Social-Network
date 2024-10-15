const express = require('express');
const router = express.Router();
const {registerUser,loginUser,sendPasswordByEmail,authenticateOTP,confirmResetPassword, upload,loginByEmail} = require("../controllers/AuthController");
const uploadImage = require('../middleware/UploadImageMiddleware');

router.post("/register", registerUser); //Đăng kí user
router.post("/login", loginUser);
router.post("/login-by-email", loginByEmail);
router.post("/forgot-password", sendPasswordByEmail);
router.post("/authenticate-otp", authenticateOTP);
router.post("/confirm-reset-password", confirmResetPassword);
router.post("/upload", uploadImage.array('image'),upload);

module.exports = router;