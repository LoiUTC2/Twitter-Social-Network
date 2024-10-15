import React, { useState, useEffect } from 'react';

import { AiOutlineSetting } from "react-icons/ai";
import { CiImageOn } from "react-icons/ci";
import { AiOutlineFileGif } from "react-icons/ai";
import { AiOutlineUnorderedList } from "react-icons/ai";
import { BsEmojiSmile } from "react-icons/bs";
import { SlCalender } from "react-icons/sl";
import { CiLocationOn } from "react-icons/ci";

import { EditOutlined } from '@ant-design/icons';
import axiosClient from '../authenticate/authenticationConfig';
import { toast } from 'react-toastify';
import { FaRegComment } from "react-icons/fa";
import { GiRapidshareArrow } from "react-icons/gi";
import { AiOutlineHeart } from "react-icons/ai";
import { BsReverseListColumnsReverse } from "react-icons/bs";
import { FaEllipsisV } from "react-icons/fa";
import DialogHistoryComment from './DialogHistoryComment';
import DialogReplyComment from './DialogReplyComment';
import DialogGetLikeComment from './DialogGetLikeComment';
import DialogGetListReplyComment from './DialogGetListReplyComment';

function SweetComment({ commentData ,resetData, useIDOwnerSweet}) {

  const [isOption, setIsOption] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [CommentList, setCommentList] = useState([]);
  const [showDialogHistory, setshowDialogHistory] = useState(false);
  const [showDialogCreateReplyComment, setShowDialogCreateReplyComment] = useState(false);
  const [showDialogListReplyComment, setShowDialogListReplyComment] = useState(false);
  const [showDialogListLikeComment, setshowDialogListLikeComment] = useState(false);
  const [showDialogListLikeReplyComment, setshowDialogListLikeReplyComment] = useState(false);
  const [isLike, setIsLike] = useState(commentData.StateLike);
  const [QuantityRepLyComment, setQuantityReplyComment] = useState(commentData.QuantityReplyComment);
  const [QuantityLike, setQuantityLike] = useState(commentData.QuantityLike);
  const [selectedFile, setSelectedFile] = useState([]);

  const userId = JSON.parse(localStorage.getItem("twitter-user"))?._id; //ID người đang sử dụng

  const [updatedComment, setUpdatedComment] = useState(commentData.Content);

  const skip = 0;
  const limit = 10;

  const handleOptionClick = () => {
    setIsOption(true);
  };
  const handleCancelOptionClick = () => {
    setIsOption(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setIsOption(false);
  };
  const handleCancelEditClick = () => {
    setIsEditing(false);
  };

  const handleUpdateClick = async () => {
    try {
        const formData = new FormData();
        formData.append('content', updatedComment);
        selectedFile && formData.append('image', selectedFile);     
        const response = await axiosClient.put(`comment/updateComment/${commentData._id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        if (response.data.isSuccess) {
            setUpdatedComment(response.data.data.Content);
            toast.success("Cập nhật bình luận thành công.");
            resetData();
        } else {
            toast.error(response.errorMessage);
        }
    } catch (error) {
        toast.error("Lỗi khi chỉnh sửa bình luận");
    }
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setUpdatedComment(e.target.value);
  };

  const handleDeleteClick = async () => {
    try {
        const response = await axiosClient.delete(`comment/deleteComment/${commentData._id}`);
        if (response.data.isSuccess) {
            toast.success("Xóa bình luận thành công.");
            resetData();
        } else {
            toast.error(response.errorMessage);
        }
    } catch (error) {
        toast.error("Lỗi khi xóa bình luận");
    }
    setIsOption(false);
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

  const handleDialogCreateReplyClick = async () => {
    setShowDialogCreateReplyComment(true);
  };

  const handleshowDialogCreateReplyComment = (value) => {
    setShowDialogCreateReplyComment(value);
    if(!value){
      setIsOption(false);
    }
  };

  const handleDialogLikeCommentClick = async () => {
    setshowDialogListLikeComment(true);
  };

  const handleShowDialogLikeComment = (value) => {
    setshowDialogListLikeComment(value);
  };

  const handleDialogLikeReplyCommentClick = async () => {
    setshowDialogListLikeReplyComment(true);
  };

  const handleShowDialogLikeReplyComment = (value) => {
    setshowDialogListLikeReplyComment(value);
  };

  const hanldeShowListReplyCommentClick = async () => {
    setShowDialogListReplyComment(true);
  };
  
  const handleShowListReplyComment = (value) => {
    setShowDialogListReplyComment(value);
  };



  /////////////

  const fetchLikeComment = async () => {
    try {
        if (commentData && commentData._id) {
          const response = await axiosClient.get(`/comment/checkLikeComment?CommentID=${commentData._id}`);
          if(response.data.isSuccess){
            if(response.data.data.State){
              setIsLike(true);
            }else {
              setIsLike(false);
            }
          }
        }
    }catch (error) {
      toast.error(error.response?.data.errorMessage ?? "Unexpected error");
    }
  };

  // useEffect(() => {
  //   fetchLikeComment();
  // }, [commentData]); 

  const likeCommentHandle = async () => {
    try {
        const response = await axiosClient.put(`/comment/likeComment/${commentData._id}`);
        if(response.data.isSuccess){
            if(response.data.data.State){
                setIsLike(true);
            }else{
                setIsLike(false);
            }
            resetData();
            setQuantityLike(response.data.data.QuantityLike);
        }

    } catch (error) {
        toast.error(error.response?.data.errorMessage ?? "Unexpected error");
    }
}

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



  useEffect(()=>{
    resetData();
  }, [showDialogCreateReplyComment]);

  return (
 
        <div className='sweet-comment-content'>
          <div className='userinfo'>
            <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' />
            <div className='userinfo-name'>
              <div>
                <span style={{ color: 'red' }}>{commentData.DisplayName.DisplayName}</span>
                <span>{commentData.DisplayName.UserName}</span>
                <span>{commentData.CreateAt}</span>
              </div>
              <div>
                {isOption ? (
                  <div className='option-comment'>
                  {(userId===commentData.DisplayName._id)?(<button onClick={handleEditClick}>Chỉnh sửa</button>):(null)}
                  {(userId===commentData.DisplayName._id || userId ===useIDOwnerSweet)?(<button onClick={handleDeleteClick}>Xóa</button>):(null)}
                  <button onClick={handleDialogHistoryClick}>Xem lịch sử chỉnh sửa</button>
                  <button onClick={handleCancelOptionClick}>Hủy</button>
                  </div>
                ) : (
                  <span onClick={handleOptionClick}><FaEllipsisV/></span>
                )}
              </div>
            </div>
          </div>
    
          <div className='content'>
            <div className='text-content'>
              {isEditing ? (
                <div>
                  <textarea 
                  value={updatedComment}
                  onChange={handleChange}
                  placeholder='Enter your comment...'
                  rows={3}
                  />

                  <div className='option-update-comment'>
                    <div className='box-icon'>
                        <div className='icon-list'>
                            <nav>
                                <ul>
                                    <li>
                                    {/* Hiển thị icon CiImageOn */}
                                    <label htmlFor="fileInput" style={{display:'flex', alignItems:'center',justifyContent:'center' ,cursor:'pointer',fontSize:'23px'}}>
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
                                    <li></li>
                                    <li><AiOutlineFileGif /></li>
                                    <li><AiOutlineUnorderedList /></li>
                                    <li><BsEmojiSmile /></li>
                                    <li><SlCalender /></li>
                                    <li><CiLocationOn /></li>
                                </ul>
                            </nav>
                        </div>
                    </div>

                    <button id='btn-capnhat' onClick={() => handleUpdateClick()}>Update</button>
                    <button id='huy' onClick={handleCancelEditClick}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p>{commentData.Content}</p> 
              )}
            </div>
    
            <div className='images-content'>
              {commentData.Image && commentData.Image.map((item) => (
                <img key={item} src={item} alt="Comment Image" />
              ))}
            </div>
          </div>
    
          <div className='react-content'>
              <ul>
                  <li > <FaRegComment
                        onClick={() => handleDialogCreateReplyClick()}
                        /> 
                        {/* <span>&nbsp; {commentData.QuantityReplyComment}</span>  */}
                        
                        <span onClick = {() => hanldeShowListReplyCommentClick()} style={{cursor: 'pointer'}}>&nbsp; {commentData.QuantityReplyComment}</span> 
                  </li>

                  <li > <AiOutlineHeart
                          onClick={() => likeCommentHandle()}
                          style={{ color: commentData.StateLike ? 'red' : 'white', cursor: 'pointer' }}
                        />
                        <span onClick={()=> handleDialogLikeCommentClick()} style={{cursor: 'pointer'}}> &nbsp; {commentData.QuantityLike} </span>
                  </li> 

              </ul>   
          </div>
    
          <div>
            {showDialogHistory && <DialogHistoryComment comment = {commentData} onCloseDialog = {handleShowDialogHistoryUpdate}/> }            
            {showDialogCreateReplyComment && <DialogReplyComment comment = {commentData} onCloseDialog = {handleshowDialogCreateReplyComment}/>} 
            {showDialogListReplyComment && <DialogGetListReplyComment comment = {commentData} onCloseDialog={handleShowListReplyComment}/>}
            {showDialogListLikeComment && <DialogGetLikeComment comment = {commentData} getList = {showDialogListLikeComment} onCloseDialog={handleShowDialogLikeComment}/>}         
          </div>
    
        </div>
 
  );

}

export default SweetComment;
