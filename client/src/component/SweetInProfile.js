//import React, { useEffect, useState }from 'react'
import React, { useState, useEffect } from 'react';

import { CiImageOn } from "react-icons/ci";
import { AiOutlineFileGif } from "react-icons/ai";
import { AiOutlineUnorderedList } from "react-icons/ai";
import { BsEmojiSmile } from "react-icons/bs";
import { SlCalender } from "react-icons/sl";
import { CiLocationOn } from "react-icons/ci";

import { FaRegComment } from "react-icons/fa";
import { GiRapidshareArrow } from "react-icons/gi";
import { AiOutlineHeart } from "react-icons/ai";
import { BsReverseListColumnsReverse } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import axiosClient from '../authenticate/authenticationConfig';
import { toast } from 'react-toastify';
import  Dialog  from '../component/Dialog'
import DialogShare from './DialogShare';
import { FaEllipsisV } from "react-icons/fa";
import DialogHistorySweet from './DialogHistorySweet';

function SweetInProfile({sweetData, resetData}) {
    const navigate = useNavigate();
    const handleGetSweetDetail = (_id) => {
        navigate(`/status/${_id}`, { state: { source: 'sweetDetail' } })
    }

    const [checkIsLiked, setCheckIsLiked] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    // const [quantityLike, setQuantityLike] = useState(); 
    const [showDialog, setShowDialog] = useState(false);
    const [showDialogCreateShare, setShowDialogCreateShare] = useState(false);
    const [getListSweet, setGetListSweet] = useState([]);
    const [isShare, setIsShare] = useState(false)

    const [quantityLike, setQuantityLike] = useState(); 
    const [quantityShare, setQuantityShare] = useState(); 
   
    const [getList, setGetList] = useState();
    const [isOption, setIsOption] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState([]);
    const [updatedSweet, setUpdatedSweet] = useState();
    const [idAfterUpdatedSweet, setIdAfterUpdatedSweet] = useState();
    const [contentAferUpdateSweet, setContentAferUpdateSweet] = useState();
    const [showDialogHistory, setshowDialogHistory] = useState(false);


    // const handleGetSweet = async () => {
    //     try {
           
    //       const response = await axiosClient.get(`/sweet/getSweetByUserID/${user_id}`);
    //       if(response.data.isSuccess){
    //         setGetListSweet(response.data.data.Info);
    //             console.log(response.data.data.Info);
    //         }

    //     } catch (error) {
    //       toast.error(error.response?.data.errorMessage ?? "Unexpected error");
    //     }
    // };


   

    // useEffect(() => {
    //     handleGetSweet();
        
    // }, [user_id]); 
  
    

    const handleCreateShareClick = () => {
        setShowDialogCreateShare(true);
    };

    const handleShowDialogCreateShare = (value) => {
        setShowDialogCreateShare(value);
    };
    
    const handleShowDialogGetQuantityShare = (value) => {
        setQuantityShare(value);
    };


    const handleGetListShareClick = () => {
        setShowDialog(true);
        setGetList(true);
    };

    const handleGetListLikeClick = () => {
        setShowDialog(true);
        setGetList(false);
    };

    const handleShowDialog = (value) => {
        setShowDialog(value);
    };

    const likeSweetHandle = async () => {
        try {
            const response = await axiosClient.put(`/sweet/addOrDeleleLike/${sweetData._id}`);
            
            if (response.data.isSuccess) {
                if (response.data.data.State) {
                    setIsLiked(false);
                } else {
                    setIsLiked(true);
                }
                setCheckIsLiked(response.data.isSuccess);

                setQuantityLike(response.data.data.QuantityLike);

            }

        } catch (error) {
            toast.error(error.response?.data.errorMessage ?? "Unexpected error");
        }
    }
    const handleOptionClick = () => {
        setIsOption(true);
    };
    const handleCancelOptionClick = () => {
        setIsOption(false);
    };

    const handlePinSweetClick = async () => {
        try {
            
            const response = await axiosClient.put(`sweet/pinSweet/${sweetData._id}`);
            // const response = await axiosClient.get(`sweet/checkSweetOrShare?SweetID=${sweetData._id}`);

            if (response.data.data) {
                toast.success("Ghim bài viết thành công.");

                resetData();
            } else{
                toast.success("Bỏ ghim bài viết thành công.");
                resetData();
            }
            
        } catch (error) {
            toast.error("Lỗi khi ghim bài viết");
            console.log("Lỗi: ", error)
        }
        setIsOption(false);
    };

    const handleDeleteClick = async () => {
        try {
            if(!sweetData.State){
                const response = await axiosClient.delete(`sweet/deleteSweet/${sweetData._id}`);
                if (response.data.isSuccess) {
                    toast.success("Xóa bài viết thành công.");
                    resetData();
                } else {
                    toast.error(response.errorMessage);
                }
            }else{
                const response = await axiosClient.delete(`share/deleteShare/${sweetData._id}`);
                if (response.data.isSuccess) {
                    toast.success("Xóa bài Share thành công.");
                    setQuantityShare(response.data.data.QuantityShare);
                    resetData();
                } else {
                    toast.error(response.errorMessage);
                }
            }
        } catch (error) {
            toast.error("Lỗi khi xóa bài viết");
        }
        setIsOption(false);
    };
      
    const handleDeleteTemporaryClick = async () => {
        try {
            const response = await axiosClient.delete(`sweet/deleteSweetTemporary/${sweetData._id}`);
            if (response.data.isSuccess) {
                toast.success("Bỏ bài viết vào thùng rác thành công.");
                resetData();
            } else {
                toast.error(response.errorMessage);
            }
        } catch (error) {
            toast.error("Lỗi khi bỏ bài viết vào thùng rác");
        }
        setIsOption(false);
    };

    const handleEditClick = () => {
    setIsEditing(true);
    setIsOption(false);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpdateClick = async () => {
        try {
            if(!sweetData.State){
                const formData = new FormData();
                formData.append('content', updatedSweet);
                selectedFile && formData.append('image', selectedFile);     
                const response = await axiosClient.put(`sweet/updateSweet/${sweetData._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (response.data.isSuccess) {
                    setIdAfterUpdatedSweet(response.data.data._id);
                    setUpdatedSweet(response.data.data.Content);
                    setContentAferUpdateSweet(response.data.data.Content);
                    toast.success("Cập nhật bài viết thành công.");
                    // resetData();
                } else {
                    toast.error(response.errorMessage);
                }
            }else {
                const formData = new FormData();
                formData.append('content', updatedSweet);
                selectedFile && formData.append('image', selectedFile);     
                const response = await axiosClient.put(`share/updateShare/${sweetData._id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (response.data.isSuccess) {
                    setIdAfterUpdatedSweet(response.data.data._id);
                    setUpdatedSweet(response.data.data.Content);
                    setContentAferUpdateSweet(response.data.data.Content);
                    toast.success("Cập nhật bài Share thành công.");
                    // resetData();
                } else {
                    toast.error(response.errorMessage);
                }                
            }
            
        } catch (error) {
            toast.error("Lỗi khi chỉnh sửa bài viết");
        }
        setIsEditing(false);
    };

    const handleCancelEditClick = () => {
        setIsEditing(false);
    };

    const handleDialogHistoryClick = async () => {
    setshowDialogHistory(true);
    };

    const handleShowDialogHistoryUpdate = (value) => {
    setshowDialogHistory(value);
    if(!value){
        setIsOption(false);
    }
    };

    return (
        <div className='single-post-by-user'>
            <div className='single-post-new' style={{marginBottom: 20}}>
                <div className='user-info' style={{ display: 'flex', flexDirection: 'row' , marginBottom: 20}}>
                    <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' />
                    <div className='info-content'>
                        <div className='user-info-name'>
                            <span>{sweetData.UserName.displayName}</span>
                            <span style={{color: 'red', marginLeft: 10}}>{sweetData.UserName.username}</span>
                        </div>
                        <span className='post-createdAt' style={{opacity: 0.5, marginLeft: 10}}>{sweetData.Duration}</span>

                    </div>
                    <div className='option-sweet-by-user'> {/*option-sigle-post*/}
                        {isOption ? (
                        <div className='option-sweet'>
                            {!sweetData.Ispin ? (<button onClick={handlePinSweetClick}>Ghim bài viết</button>   ) 
                            : (<button onClick={handlePinSweetClick}>Bỏ ghim bài viết</button>   )}
                                            
                            <button onClick={handleEditClick}>Chỉnh sửa</button>
                            <button onClick={() => handleDeleteClick()}>Xóa vĩnh viễn</button>
                            {!sweetData.State ? (<button onClick={() => handleDeleteTemporaryClick()}>Xóa bỏ vào thùng rác</button>) : (null)}               
                            <button onClick={handleDialogHistoryClick}>Xem lịch sử chỉnh sửa</button>
                            <button onClick={handleCancelOptionClick}>Hủy</button>
                        </div>
                        ) : (<span onClick={handleOptionClick}><FaEllipsisV/></span>)
                        }
                    </div>
                </div>
                
                <div className='single-post-content'>
                    <div className='text-content'>
                        <span >{sweetData.Content}</span>
                    </div>
                    
                    {sweetData.State === true ? (
                        <div className='post-share'> 
                            <div className='user-info'>
                                <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' />
                                <div className='info-content'>
                                <div className='user-info-name'>
                                    <span>{sweetData.UserName_Origin?.displayName}</span>
                                    <span style={{color: 'red'}}>{sweetData.UserName_Origin?.username}</span>
                                </div>
                                <span className='post-createdAt' style={{opacity: 0.5, marginLeft: 10}}>{sweetData.Duration_Origin}</span>
                                </div>
                            </div>

                            <div className='single-post-content'> 
                                <div className='text-content' onClick={() => handleGetSweetDetail(sweetData._id)}>
                                    <span >{sweetData.Content_Origin}</span>
                                </div>

                                <div className='image-content' onClick={() => handleGetSweetDetail(sweetData._id)}>
                                { sweetData.Image_Origin && sweetData.Image_Origin.map((itemI, index) => (
                                    <img src={itemI} />
                                    ))
                                }
                                </div>
                            </div>
                        </div>  
                    

                    ) : (null)}

                    <div className='image-content' >
                        {sweetData.Image && sweetData.Image.map((item1, index) => (
                                <img src={item1} />
                            ))
                        }
                    </div>

                    <div className='react-content'>
                        <ul>
                            <li ><FaRegComment /> &nbsp; { sweetData.QuantityComment}</li>
                            <li><GiRapidshareArrow 
                                    
                                /> 
                                {!sweetData.State ? (
                                <span >&nbsp; {sweetData.QuantityShare}</span> 
                                ) : (null)}
                            </li>
                            
                            <li ><AiOutlineHeart
                                    // onClick={()=>likeSweetHandle()}
                                    // style={{ color: isLiked ? 'red' : 'white', cursor: 'pointer' }}
                                />      
                                <span >&nbsp; {sweetData.QuantityLike}</span>
                            </li>
                            
                            <li ><BsReverseListColumnsReverse/> &nbsp; {835}</li>
                        </ul>
                    </div>

                    {/* {showDialog && <Dialog sweet = {sweetData} getList={getList} onCloseDialog={handleShowDialog}/>}

                    {showDialogCreateShare && <DialogShare sweet = {sweetData} onCloseDialog={handleShowDialogCreateShare}/>} */}

                </div>
            </div>
        </div>
    )
}

export default SweetInProfile
