import React, { useEffect, useState } from 'react'
import MessageList from '../component/MessageList'
import MessageContent from '../component/messageContent'
import axiosClient from '../authenticate/authenticationConfig';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function MessagePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");
  if (!token) {
    navigate('/login')
  }
  const userId = jwtDecode(token).userId;

  const [messages, setMessages] = useState([]);
  const [defaultReceiverId, setDefaultReceiverId] = useState(null);
  const fetchData = async () => {
    await axiosClient.get('/chat')
    .then(response => {
      let data = response.data.data;
      
      setMessages(data);
      // Lấy ID của người nhận đầu tiên
      if (data.length > 0) {
        setDefaultReceiverId(data[0]._id);
      }
    })
    .catch(error => {
      console.error('Error fetching messages:', error);
    });
  }

  useEffect( () => {
    // Gọi API để lấy toàn bộ tin nhắn
    fetchData()
  }, []); // Thực hiện gọi API khi component được render lần đầu tiên

  //reset message
  const resetData = () => {
    fetchData()
  }
  const changeReceiverId = (id) => {
    //setDefaultReceiverId(id);
    navigate(`/messages/${id}`)
  }
  return (
    <div className='message-page-container'>
      <div className='list-user-container'>
        {/* Truyền dữ liệu tin nhắn vào MessageList */}
        <MessageList messages={messages} userId={userId} changeReceiverId={ changeReceiverId} />
      </div>
      <div className='message-content-container'>
        {/* Truyền ID của người nhận mặc định vào MessageContent */}
        <MessageContent receiverId={id} resetData={resetData}  />
      </div>
    </div>
  );
}
export default MessagePage
