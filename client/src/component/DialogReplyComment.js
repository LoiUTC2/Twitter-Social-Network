//import React, { useEffect, useState }from 'react'
import React, { useState, useEffect } from 'react';
import { useRef } from 'react';

import { AiOutlineSetting } from "react-icons/ai";
import { CiImageOn } from "react-icons/ci";
import { AiOutlineFileGif } from "react-icons/ai";
import { AiOutlineUnorderedList } from "react-icons/ai";
import { BsEmojiSmile } from "react-icons/bs";
import { SlCalender } from "react-icons/sl";
import { CiLocationOn } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import axiosClient from '../authenticate/authenticationConfig';
import { toast } from 'react-toastify';
import Post from './post/post';


function DialogReplyComment({comment, onCloseDialog}) {
    const navigate = useNavigate();
    const handleReturnPort = () => {
        navigate("/")
    }

    const [showDialog, setShowDialog] = useState(true);
    const [postSweetContent, setPostSweetContent] = useState();
    const [selectedFile, setSelectedFile] = useState([]);
    const [QuantityRepLyComment, setQuantityReplyComment] = useState();
    const textareaRef = useRef(null);

    useEffect(() => {
    if (showDialog && textareaRef.current) {
      textareaRef.current.focus();
    }
    }, [showDialog]);
  
    const handleCloseDialog = () => {
        setShowDialog(false); 
        onCloseDialog(false);

    };

    

    const handleCreateReplyComment = async () => {
        try {
            const formData = new FormData();
            formData.append('content', postSweetContent);
            //selectedFile && formData.append('image', selectedFile, selectedFile.name);
            
            const response = await axiosClient.post(`/comment/createReplyComment/${comment._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.isSuccess) {
                setPostSweetContent('');
                setQuantityReplyComment(response.data.data.QuantityCommentReply)
                toast.success("Tạo reply comment thành công!");
            }else toast.error(response.errorMessage); 
            
        } catch (error) {
          console.error("Error posting content:", error);
          toast.error("Lỗi khi tạo reply comment", error);
        }
        handleCloseDialog();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
        
        // Create a preview image URL for the selected file
        // const reader = new FileReader();
        // reader.onload = () => {
        //   setPreviewImage(reader.result);
        // };
        // reader.readAsDataURL(file);
    };


    return (
    <div className='dialog-reply-comment-container'> 
        {showDialog ? (
            <div className="overlay">
                <div className="dialog">
                    <div className="dialog-header">
                        <h2>{comment.DisplayName.UserName === '' ? `Reply ${comment.DisplayName.DisplayName}` : `Reply ${comment.DisplayName.UserName}`}</h2>
                        <button className="close-button" onClick={() => handleCloseDialog()}>&times;</button>
                    </div>

                    <div className='post-share'> 
                        <div className='user-info'>
                            <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' />
                            <div className='info-content'>
                                <div className='user-info-name'>
                                    <span>{comment.DisplayName.DisplayName}</span>
                                    <span>{comment.DisplayName.UserName}</span>
                                </div>
                                <span className='post-createdAt'>{comment.CreateAt}</span>
                            </div>
                        </div>

                        <div className='single-post-content'> 
                            <div className='text-content'>
                                <span >{comment.Content}</span>
                            </div>

                            <div className='image-content'>
                            { comment.Image && comment.Image.map((item, index) => (
                                <img src={item} />
                                ))
                            }
                            </div>
                        </div>
                    </div>  

                    <div className='post-create-box-share'>
                        <div className='input-box-avatar'>
                            <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' />
                        </div>
                        <div className='create-box-input'>
                            <div className='input-box-text-share'>
                                <textarea
                                    ref={textareaRef}
                                    name="postSweetContent"
                                    value={postSweetContent}
                                    onChange={(e) => setPostSweetContent(e.target.value)}
                                    placeholder='Post your reply'
                                    rows={2}
                                    cols={40}
                                />
                            </div>

                            <div className='text-replycomment-icon'>
                                <nav>
                                    <ul>
                                        <li>
                                            {/* Hiển thị icon CiImageOn */}
                                            <label htmlFor="fileInput" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '22px' }}>
                                                <CiImageOn />
                                                {/* Ẩn input file */}
                                                <input
                                                    type="file"
                                                    id="fileInput"
                                                    style={{ display: "none" }}
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                        </li>
                                        <li><AiOutlineFileGif /></li>
                                        <li><BsEmojiSmile /></li>
                                        <li><SlCalender /></li>
                                    </ul>
                                </nav>
                                <button onClick={handleCreateReplyComment}>Reply</button>
                            </div>


                            

                        </div>
                    </div>

                    

                    

                </div>
            </div>
        ): (null)}
     {/* <div>{isCreateShare && <Post isCreateShare = {isCreateShare}/>}</div> */}
    </div>
    )
}

export default DialogReplyComment
