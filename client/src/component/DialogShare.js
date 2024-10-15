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


function DialogShare({sweet, onCloseDialog, quantityShare}) {
    const navigate = useNavigate();
    const handleReturnPort = () => {
        navigate("/")
    }

    const [showDialog, setShowDialog] = useState(true);
    const [shareContent, setShareContent] = useState('');

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

    const handleCreateShare = async () => {
        try {
            const formData = new FormData();
            formData.append('content', shareContent);
            if(!sweet.State){
                const response = await axiosClient.post(`/share/createShare/${sweet._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (response.data.isSuccess) {
                    console.log("shareCretae: ", response.data.data.QuantityShare_Origin);
                    toast.success("Tạo bài Share thành công!");
                    setShareContent('');
                    quantityShare(response.data.data.QuantityShare_Origin);
                }else toast.error(response.errorMessage); 
            }else{
                const response = await axiosClient.post(`/share/createShare/${sweet.SweetID}`, formData, {
                    headers: {
                      'Content-Type': 'multipart/form-data'
                    }
                });
                if (response.data.isSuccess) {
                    // setSweetList(response.data.data.InFo_Sweet);
                    setShareContent('');
                    toast.success("Tạo bài Share thành công!");
                    quantityShare(response.data.data.QuantityShare_Origin);
                }else toast.error(response.errorMessage);
            }
        } catch (error) {
          console.error("Error posting content:", error);
          toast.error("Lỗi khi tạo mới bài viết");
        }
        handleCloseDialog();
    };


    return (
    <div className='dialogShare-container'> 
        {showDialog ? (
            <div className="overlay">
                <div className="dialog">
                    <div className="dialog-header">
                        {sweet.State ? (
                            <h2 style={{color: 'black', fontStyle: 'italic'}}>{sweet.UserName_Origin.username === '' ? `Share bài viết của ${sweet.UserName_Origin.displayName}` : `Share bài viết của ${sweet.UserName_Origin.username}`}</h2>
                        ) : (
                            <h2 style={{color: 'black', fontStyle: 'italic'}}>{sweet.UserName.username === '' ? `Share bài viết của ${sweet.UserName.displayName}` : `Share bài viết của ${sweet.UserName.username}`}</h2>
                        )}
                        <button className="close-button" onClick={() => handleCloseDialog()}>&times;</button>
                    </div>

                    <div className='post-create-box-share'>
                        <div className='input-box-avatar'>
                            <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' />
                        </div>
                        <div className='create-box-input'>
                            <div className='input-box-text-share'>
                                <textarea
                                    ref={textareaRef}
                                    name="shareContent"
                                    value={shareContent}
                                    onChange={(e) => {
                                        const value = e.target.value; 
                                        setShareContent(value !== '' ? value : '');
                                        }
                                    }
                                    placeholder='What do you think about this status?!'
                                    rows={2}
                                    cols={40}
                                />
                            </div>

                            <div className='box-icon'>
                                <div className='icon-list'>
                                    <nav>
                                        <ul>
                                            <li></li>
                                            <li><AiOutlineFileGif /></li>
                                            <li><AiOutlineUnorderedList /></li>
                                            <li><BsEmojiSmile /></li>
                                            <li><SlCalender /></li>
                                            <li><CiLocationOn /></li>
                                        </ul>
                                    </nav>
                                </div>
                                <button onClick={handleCreateShare}>Post</button>
                            </div>

                        </div>
                    </div>

                    <div>
                        {sweet.State ? (
                            <div className='post-share'> 
                                <div className='user-info'>
                                    <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' />
                                    <div className='info-content'>
                                        <div className='user-info-name'>
                                            <span style={{color: 'black'}}>{sweet.UserName_Origin.displayName}</span>
                                            <span>{sweet.UserName_Origin.username}</span>
                                        </div>
                                        <span className='post-createdAt'>{sweet.Duration_Origin}</span>
                                    </div>
                                </div>
        
                                <div className='single-post-content'> 
                                    <div className='text-content'>
                                        <span style={{color: 'black'}}>{sweet.Content_Origin}</span>
                                    </div>
        
                                    <div className='image-content'>
                                    { sweet.Image_Origin && sweet.Image_Origin.map((item, index) => (
                                        <img src={item} />
                                        ))
                                    }
                                    </div>
                                </div>
                            </div>  
                        ):(
                            <div className='post-share'> 
                                <div className='user-info'>
                                    <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' />
                                    <div className='info-content'>
                                        <div className='user-info-name'>
                                            <span style={{color: 'black'}}>{sweet.UserName.displayName}</span>
                                            <span>{sweet.UserName.username}</span>
                                        </div>
                                        <span className='post-createdAt'>{sweet.Duration}</span>
                                    </div>
                                </div>
        
                                <div className='single-post-content'> 
                                    <div className='text-content'>
                                        <span style={{color: 'black'}}>{sweet.Content}</span>
                                    </div>
        
                                    <div className='image-content'>
                                    { sweet.Image && sweet.Image.map((item, index) => (
                                        <img src={item} />
                                        ))
                                    }
                                    </div>
                                </div>
                            </div>  
                        )}
                    </div>

                    

                </div>
            </div>
        ): (null)}
    </div>
    )
}

export default DialogShare
