const asyncHandle = require('express-async-handler');
const nodemailer = require("nodemailer");
const sendEmail = asyncHandle(async (data, callback) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_NAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    let subjectHTML = `Đây là mã OTP của bạn, chỉ có hạn trong 3 phút: <strong>${data.resetCode}</strong>`;

    let info = await transporter.sendMail({
        from: '"Twitter"', 
        to: data.to, 
        subject: "Reset password OTP", 
        text: "", 
        html: `
            <div style="color: #333; font-size: 16px;">
                <p>Xin chào,</p>
                <p><span style="font-weight: bold; ">${subjectHTML}</span></p>
                <p>Vui lòng nhập mã này trên trang web để đặt lại mật khẩu của bạn.</p>
            </div>
        `,
    });

    callback(info); 
});
module.exports = { sendEmail }