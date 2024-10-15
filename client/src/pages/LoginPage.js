import React, { useEffect, useState } from 'react';
import { BsTwitterX } from 'react-icons/bs';
import LoginOption from '../component/LoginOption';
import LoginModal from '../component/LoginModal';
import { useNavigate } from 'react-router-dom';
function LoginPage(props) {
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const isAuthentication = localStorage.getItem("token") ? true : false;

    useEffect(() => {
        if (!isAuthentication) {
            navigate('/login');
        } else {
            navigate('/');
        }
    }, [isAuthentication, navigate]);
    return (
        <>
            <div className='root-container'>
                <div className='login-page w-full h-full '>
                    <div className='login-logo w-full'>
                        <BsTwitterX style={{ width: '100%', height: '100%', maxHeight: '400px', color: '#ffffff' }} />
                    </div>
                    <div className='login-content'>
                        <div className='title-content'>
                            <span>Đang diễn ra ngay bây giờ</span>
                        </div>
                        <div className='title-content-down'>
                            <span>Tham gia ngay</span>
                        </div>
                        <div className='login-menu'>
                            <LoginOption/>
                       
                        </div>
                    </div>
                </div>
                <LoginModal/>
            </div>
        </>
    );
}

export default LoginPage;
