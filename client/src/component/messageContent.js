import React, { useEffect, useRef, useState } from 'react'
import { IoMdInformationCircleOutline } from "react-icons/io";
import { jwtDecode } from "jwt-decode";
import { CiImageOn } from "react-icons/ci";
import { AiOutlineFileGif } from "react-icons/ai";
import { AiOutlineUnorderedList } from "react-icons/ai";
import { AiOutlineSend } from "react-icons/ai";
import axiosClient from '../authenticate/authenticationConfig';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { useNavigate, useParams } from 'react-router-dom';
import { MdOutlineEmojiEmotions } from "react-icons/md";
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload } from 'antd';
import useWebSocket from '../authenticate/Websocket.config';
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// const client = new W3CWebSocket('ws://localhost:8080');
function MessageContent({ receiverId, resetData }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [userId, setUserId] = useState(null);
  const [messageSendContent, setMessageSendContent] = useState('');
  const [isChooseFile, setIsChooseFile] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messageDetailRef = useRef(null);
  const { client, isConnected } = useWebSocket('ws://localhost:8080');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');

    const userDecoded = jwtDecode(token);
    if (userDecoded) setUserId(userDecoded.userId);

    const fetchData = async () => {
      try {
        const userResponse = await axiosClient.get(`users/${id}`);
        setReceiver(userResponse.data.data);

        const messagesResponse = await axiosClient.get(`chat/${id}`);
        setMessages(messagesResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (receiverId) fetchData();
  }, [receiverId, navigate, id]);

  useEffect(() => {
    if (!client) return;

    const handleMessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, receivedMessage]);
    };

    client.onmessage = handleMessage;

    return () => {
      client.onmessage = null;
    };
  }, [client]);

  useEffect(() => {
    resetData()
    messageDetailRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (messageSendContent.trim()) {
      const message = {
        content: messageSendContent,
        senderId: userId,
        receiverId: id,
        images: fileList.length ? fileList.map((x) => x.thumbUrl) : [],
        type: 'chat',
      };

      await client.send(JSON.stringify(message));
      setMessageSendContent('');
      setFileList([]);
    }
  };

  const toggleEmojiPicker = () => setShowEmojiPicker((prev) => !prev);

  const addEmoji = (emoji) => {
    setMessageSendContent((prev) => prev + emoji.native);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && messageSendContent.trim()) {
      sendMessage();
    }
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const uploadButton = (
    <button
      style={{ border: 0, background: 'none' }}
      type="button"
    >
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return messages && (
    <div className='message-content'>
      <div style={{ minHeight: '92%', overflow: 'auto' }}>
        <div className='message-info'>
          <div className='message-content-header'>
            <span>{receiver && receiver.displayName}</span>
            <span>
              <IoMdInformationCircleOutline />
            </span>
          </div>
          <div className='message-content-userinfo'>
            <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' />
            <span id='message-userinfo-username'>{receiver && receiver.displayName}</span>
            <span id='message-userinfo-displayname'>{receiver && receiver.userName}</span>
            <span id='message-userinfo-jointime'>{receiver && "Joined July 2020 - 0 Followers"}</span>
          </div>
        </div>
        <div className='message-detail' >
          {/* Hiển thị tin nhắn */}
          {messages.map((message) => (
            <div
              key={message._id}
              // className={`message ${message.senderID === /*receiverId*/id ? 'message-received' : 'message-sent'}`}
              className={`message `}
              style={{ alignSelf: `${message.senderID === id ? 'flex-start' : ' flex-end'}` }}
            >
              <div style={{
                backgroundColor: `${message.senderID === id ? '#373751' : ' #100cef'}`,
                borderRadius: '8px',
                padding: '10px'
              }}>
                <span >{message.content}</span>
              </div>
              <div style={{ display: 'flex', height: 'auto', flexWrap: 'wrap' }}>
                {(message?.images && message?.images.length > 0) &&
                  message.images.map(item => (

                    <Image
                      width={200}
                      src={item}
                    />
                  ))

                }
              </div>
            </div>
          ))}
        </div>
        <div ref={messageDetailRef} />
      </div>

      <div className='handle-sent-message'>
        <ul>
          <li style={{ position: "relative" }}>
            <div style={{ display: isChooseFile ? 'block' : 'none' }} className="message-choosefile">
              <>
                <Upload
                  action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                  listType="picture-card"
                  fileList={fileList}
                  onPreview={handlePreview}
                  onChange={handleChange}
                >
                  {fileList.length >= 8 ? null : uploadButton}
                </Upload>
                {previewImage && (
                  <Image
                    wrapperStyle={{
                      display: 'none',
                    }}
                    preview={{
                      visible: previewOpen,
                      onVisibleChange: (visible) => setPreviewOpen(visible),
                      afterOpenChange: (visible) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                  />
                )}
              </>
            </div>
            {/* Hiển thị icon CiImageOn */}
            <label htmlFor="fileInput" style={{ display: 'flex', cursor: 'pointer', fontSize: '25px' }} >
              <CiImageOn onClick={() => { setIsChooseFile(!isChooseFile); setFileList([]) }} />
            </label>
          </li>
          <li><MdOutlineEmojiEmotions onClick={toggleEmojiPicker} /></li>
          <li><AiOutlineUnorderedList /></li>
          {showEmojiPicker && (
            <div style={{ position: 'absolute', bottom: '60px', left: '0px' }}>
              <Picker
                onEmojiSelect={addEmoji}
                data={data}
                style={{
                  position: "absolute",
                  marginTop: "465px",
                  marginLeft: -40,
                  maxWidth: "320px",
                  borderRadius: "20px",
                }}
                theme="dark"
              />
            </div>
          )}
        </ul>
        <div className='handle-send' style={{ cursor: 'default' }}>
          <input
            placeholder='Start a new message'
            type='text'
            onChange={(e) => setMessageSendContent(e.target.value)
            }
            value={messageSendContent}
            onKeyDown={handleKeyPress}
          />
          <button onClick={() => sendMessage()} disabled={messageSendContent.trim() === ''}><AiOutlineSend /></button>
        </div>
      </div>
    </div>
  )
}

export default MessageContent
