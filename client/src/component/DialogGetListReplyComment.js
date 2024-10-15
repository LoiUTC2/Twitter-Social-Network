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


function DialogGetListReplyComment({comment, onCloseDialog}) {
    const navigate = useNavigate();
    const handleReturnPort = () => {
        navigate("/")
    }

    const [showDialog, setShowDialog] = useState(true);
    const [replyComment, setReplyComment] = useState();
    const [QuantityRepLyComment, setQuantityReplyComment] = useState();
    const [isCreateShare, setIsCreateShare] = useState(false);
    const [isShare, setIsShare] = useState();
    const textareaRef = useRef(null);

    
  
    const handleCloseDialog = () => {
        setShowDialog(false); 
        onCloseDialog(false);
    };

    

    const handleGetListReplyComment = async () => {
        try {
            const response = await axiosClient.get(`/comment/getListReplyComment?CommentID=${comment._id}`)
                
                if (response.data.isSuccess) {
                    setReplyComment(response.data.data.Info_All_ReplyComment);
                    setQuantityReplyComment(response.data.data.QuantityReplyComment);
                    
                    
                }else toast.error(response.errorMessage); 
            
        } catch (error) {
          console.error("Error posting content:", error);
          toast.error("Lỗi khi tạo mới bài viết");
        }
        
    };

    useEffect(() => {
        handleGetListReplyComment();
    }, [comment._id]);

    

    return (
    <div className='dialogShare-container'> 
        {showDialog && replyComment ? (
            <div className="overlay">
                <div className="dialog" style={{ position: 'relative', overflow: 'auto'}}>
                    <div className="dialog-header">                     
                        <h2>Đã có {QuantityRepLyComment} Reply cho Comment này </h2>                      
                        <button className="close-button" onClick={() => handleCloseDialog()}>&times;</button>
                    </div>

                    <div className='post-share' style={{marginLeft: 1}}> 
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

                    <div className="dialog-content" style={{marginTop: 10, marginLeft: 20}}>
                            {replyComment.length > 0 ? (
                                <p>{replyComment.map((item, index) => (
                                    <div key={index} className='user-like' style={{ display: 'flex', flexDirection: 'row'}}>                   
                                        <img style={{width: '6%', height: '6%', borderRadius: '50%'}} src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' /> 
                                        <div>
                                            <div>
                                                <p>&nbsp;{item.UserName.DisplayName}</p> 
                                                <p style={{ color: 'red' }}>&nbsp;{item.UserName.UserName}</p>
                                            </div>

                                            <p style={{color: '#787272'}}>&nbsp;{item.CreateAt}</p>
                                            <p style={{fontSize: 20, marginTop: 15}}>&nbsp;{item.Content}</p>
                                            <div className='image-content' >
                                            {
                                                item.Image && item.Image.map((items, index) => (
                                                    <img src={items} />
                                                ))
                                            }
                                            <div style={{}}>|</div>
                                            </div>
                                        </div>
                                        
                                    </div>
                                ))}</p>
                            ):(<div style={{color: 'red'}}><p>Hy vọng bạn sẽ là người đầu tiên Reply Comment này!</p></div>)}
                            
                        </div>                    
                    
                </div>
            </div>        
        ): (null)}
    </div>
    )
}

export default DialogGetListReplyComment
