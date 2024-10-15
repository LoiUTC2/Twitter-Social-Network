import React, { useState } from 'react';
import { BsTwitterX } from 'react-icons/bs';
import { AiFillHome } from "react-icons/ai";
import { AiOutlineSearch } from "react-icons/ai";
import { BsBell } from "react-icons/bs";
import { SlEnvolopeLetter } from "react-icons/sl";
import { IoListSharp } from "react-icons/io5";
import { PiBookmarkSimple } from "react-icons/pi";
import { BsFillPeopleFill } from "react-icons/bs";
import { BsPerson } from "react-icons/bs";
import { CiCircleMore } from "react-icons/ci";
import { MdWorkspacePremium } from "react-icons/md";
import styles from './Navbar.css';
import { useNavigate, useNavigation } from 'react-router-dom';
import { BsThreeDots } from "react-icons/bs";
import axiosClient from '../../authenticate/authenticationConfig';
const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("twitter-user")) ?? navigate('login');
    const [showSectionLogout, setShowSectioLogout] = useState(false);
    const handleLogout = ()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("twitter-user");
        setShowSectioLogout(false);
        navigate('/login')
    }
    const handleTransToMessages = async() => {
         await axiosClient.get('/chat')
        .then(response => {
          let data = response.data.data;
          // Lấy ID của người nhận đầu tiên
          if (data.length > 0) {
            navigate(`/messages/${data[0]._id}`);
          }
        })
    }
    return (
        <div className='homepage-navbar'>
            <div className='navbar-content'>
                <div className='navbar-icon'>
                    <BsTwitterX style={{ margin: 'auto', width: '30', height: '30', maxHeight: '400px', color: 'white' }} />
                </div>
                <nav>
                    <ul>
                        <li onClick={() => navigate("/")}><AiFillHome /><span>Home</span></li>
                        <li><AiOutlineSearch /><span>Explore</span></li>
                        <li onClick={() => navigate("/notifications")}><BsBell /><span>Notifications</span></li>
                        <li onClick={() => handleTransToMessages()}><SlEnvolopeLetter /><span>Messages</span></li>
                        <li onClick={() => navigate("")}><IoListSharp /><span>Lists</span></li>
                        <li onClick={() => navigate("")}><PiBookmarkSimple /><span>Bookmarks</span></li>
                        <li onClick={() => navigate("")}><BsTwitterX /><span>Communities</span></li>
                        <li onClick={() => navigate("")}><MdWorkspacePremium /><span>Premium</span></li>
                        <li onClick={() => navigate(`/profile/${user._id}`)}>< BsPerson /><span>Profile</span></li>
                        <li onClick={() => navigate("")}><CiCircleMore /><span>More</span></li>
                    </ul>
                </nav>
                <div
                    style={{
                        border: '2px solid #007bff',
                        borderRadius: '30px',
                        width: '160px',
                        height: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        backgroundColor: '#1e9be3',
                    }}
                >
                    POST
                </div>
                <div className='navbar-userInfo'>
                    <img src={!!user?.avatar ? user.avatar : 'https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' } alt='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' />
                    <div className='navbar-userinfo-name'>
                        <span>{user?.displayName}</span>
                        <span>@{user?.username}</span>
                    </div>
                    <div className='logout-section'>
                        <BsThreeDots onClick={()=>setShowSectioLogout(!showSectionLogout)}/>
                        { showSectionLogout &&
                            <div className='logout' >
                            <span>Add an existing account</span>
                            <span onClick={handleLogout}>Log out @{ user?.username}</span>
                        </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Navbar;
