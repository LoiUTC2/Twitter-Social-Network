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
import { FaEllipsisV } from "react-icons/fa";



function DialogSweetInBin({sweetTemporary, onCloseDialog, resetData}) {
    const navigate = useNavigate();
    const handleReturnPort = () => {
        navigate("/")
    }

    const [showDialog, setShowDialog] = useState(true);
    const [shareContent, setShareContent] = useState('');
    // const [sweetTemporary, setSweetTemporary] = useState([]);
    const [isOption, setIsOption] = useState(false);
    const [activeSweetIndex, setActiveSweetIndex] = useState(null);


   
    const handleCloseDialog = () => {
        setShowDialog(false); 
        onCloseDialog(false);
        resetData();
    };

    const handleRestoreSweet = async (sweetID) => {
        const response = await axiosClient.put(`/sweet/restoreSweet/${sweetID}`)
        if(response.data.isSuccess){
            toast.success("Khôi phục bài viết thành công");
            clickCancelOption();
        }else{
            toast.error(response.data.errorMessage);
        }
    }

    const handleDeleteSweet = async (sweetID) => {
        const response = await axiosClient.delete(`/sweet/deleteSweet/${sweetID}`)
        if(response.data.isSuccess){
            toast.success("Xóa bài viết thành công");
            clickCancelOption();
        }else{
            toast.error(response.data.errorMessage);
        }
    }

    const clickOption = (index) => {
        setActiveSweetIndex(index);
    };
    const clickCancelOption = () => {
        setActiveSweetIndex(null);
    }


    return (
    <div className='dialogGetSweetInBin-container'> 
        {showDialog ? (      
            <div className="overlay">
                <div className="dialog">
                    <div className="dialog-header">
                        <h2 style={{color: 'red'}}>Các bài viết đã xóa tạm thời</h2>                        
                        <button className="close-button" onClick={() => handleCloseDialog()}>&times;</button>
                    </div>

                    
                    <div className='sweetInBin'> 
                    {sweetTemporary.map((sweet, index) => (
                        <div key={index} className='sweet'>
                        <div className='user-info'>
                            <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' />
                            <div className='info-content'>
                                <div className='user-info-name'>
                                    <span>{sweet.UserName.displayName}</span>
                                    <span>{sweet.UserName.username}</span>
                                </div>
                                <span className='post-createdAt'>{sweet.Duration}</span>
                            </div>

                            <div className='option-sweet-by-user'> {/*option-sigle-post*/}
                                {activeSweetIndex === index ? (
                                <div className='option-sweet'>     
                                    <button onClick={() => handleRestoreSweet(sweet._id)}>Khôi phục bài viết</button>
                                    <button onClick={() => handleDeleteSweet(sweet._id)}>Xóa vĩnh viễn</button>
                                    <button onClick={() => clickCancelOption()}>Hủy</button>                                  
                                </div>
                                ) : (<span onClick={() => clickOption(index)}><FaEllipsisV/></span>)
                                }
                            </div>
                            
                        </div>

                        <div className='content'> 
                            <div className='text-content'>
                                <span >{sweet.Content}</span>
                            </div>

                            <div className='image-content'>
                            { sweet.Image && sweet.Image.map((item, index) => (
                                <img src={item} />
                                ))
                            }
                            </div>
                        </div>
                    </div>  ))} 

                    </div>
                    

                    

                </div>
            </div>
            
        ): (null)}
    </div>
    )
}

export default DialogSweetInBin
