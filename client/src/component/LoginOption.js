import React, { useState } from 'react';
import LoginModal from './LoginModal';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GrFacebookOption } from "react-icons/gr";
import { jwtDecode } from "jwt-decode";
import axiosClient from '../authenticate/authenticationConfig';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
function LoginOption() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [openModalType, setOpenModalType] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (credentialResponse) => {
    var obj = jwtDecode(credentialResponse.credential);
    var data = JSON.stringify(obj);
    var decodedData = JSON.parse(data);
    if (decodedData.email_verified == true) {
      try {
        const email = decodedData.email;
        const response = await axiosClient.post(`/authentication/login-by-email`, { email: email,userData:decodedData });
        if (response.data.isSuccess) {
          toast.success("Đăng nhập thành công");
          localStorage.setItem('twitter-user', JSON.stringify(response.data.data));
          navigate("/");
        } else {
          toast.error(response.errorMessage);
        }
      } catch (error) {
        toast.error(error.response?.data.errorMessage ?? "Unexpected error");
      }
    }
    const config = {
      method: 'POST',
      url: 'your backend server or endpoint',
      headers: {},
      // data: data
    }

  }
  const handleOpenModal = (type) => {
    if (type == 1)//Login
    {
      setOpenModalType(1);
    } else if (type == 2) //Register
    {
      setOpenModalType(2)
    }
    setIsModalVisible(!isModalVisible);
  }
  return (
    <>
      <div className='login-option-container'>
        <div className='option-list'>
          <div className='google-option single-option'>
            <GoogleOAuthProvider clientId="229032397059-dgh41gson2bbvek02roal9d15n8injg1.apps.googleusercontent.com" className='google-login-button'>
              <GoogleLogin
                onSuccess={handleLogin}
                onError={() => {
                }}
              />
            </GoogleOAuthProvider>
          </div>
          <div className='facebook-option single-option'>
            <GrFacebookOption /> &nbsp;     Đăng nhập với Facebook
          </div>
          <span className='text-or'>hoặc</span>
          <div className='single-option register-option'>
            <span onClick={() => handleOpenModal(2)}>Tạo tài khoản</span>
          </div>
          <span className='policy-register'>Khi đăng ký, bạn đã đồng ý với <a href="https://twitter.com/tos" rel="noopener noreferrer nofollow" target="_blank" role="link">Điều khoản Dịch vụ</a> và <a href="https://twitter.com/privacy" rel="noopener noreferrer nofollow" target="_blank" role="link">Chính sách Quyền riêng tư</a>, gồm cả <a href="https://help.twitter.com/rules-and-policies/twitter-cookies" rel="noopener noreferrer nofollow" target="_blank" role="link">Sử dụng Cookie</a>.</span>
          <div className='login-option'>
            <span>Đã có tài khoản?</span>
            <div className='single-option login-option-content register-option'>
              <span onClick={() => handleOpenModal(1)}>Đăng nhập</span>
            </div>
          </div>
        </div>
      </div>

      {isModalVisible && <LoginModal visible={isModalVisible} setVisible={setIsModalVisible} type={openModalType} />}
    </>
  );
}

export default LoginOption;
