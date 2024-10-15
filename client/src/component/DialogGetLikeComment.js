import React, { useState, useEffect } from 'react';


import { useNavigate } from "react-router-dom";
import axiosClient from '../authenticate/authenticationConfig';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import SinglePost from './SinglePost';


function DialogGetLikeComment({comment, getList, onCloseDialog}) {
    const navigate = useNavigate();
    const handleGetSweetDetail = (_id) => {
        navigate(`/status/${_id}`)
    }

    const [listLike, setListLike] = useState()
    const [quantityLikeComment, setQuantityLikeComment] = useState(); 
    const [quantityLikeReplyComment, setQuantityLikeReplyComment] = useState(); 
    const [showDialog, setShowDialog] = useState(true);

    const handleCloseDialog = () => {
        setShowDialog(false); 
        onCloseDialog(false);
    };
    
    

    const getListLikeCommentHandle = async () => {
        const response = await axiosClient.get(`/comment/getListlikeComment?CommentID=${comment._id}`);
        if(response.data.isSuccess){
            setListLike(response.data.data.List_UserName_ToLike)
            setQuantityLikeComment(response.data.data.QuantityLike);
        }else {
            toast.error(response.errorMessage);
        }
    }

    const getListLikeReplyCommentHandle = async () => {

        const response = await axiosClient.get(`/comment/getListlikeReplyComment?CommentID=${comment._id}`);
        if(response.data.isSuccess){
            setListLike(response.data.data.List_UserName_ToLike)
            setQuantityLikeReplyComment(response.data.data.QuantityLike);
        }else {
            toast.error(response.errorMessage);
        }
    }

    useEffect(() => {
        if (getList) {
            getListLikeCommentHandle();
        } else {
            getListLikeReplyCommentHandle();
        }
    }, [getList, comment._id]);
    

    
    return (
        <div className='dialog-container'>
            {showDialog && listLike? (
                <div className="overlay">
                    <div className="dialog">
                        <div className="dialog-header">
                            {getList && quantityLikeComment !=0 ? (<h3>Đã có {quantityLikeComment} người đã like Comment này</h3>) : (null)}
                            {getList && quantityLikeComment ==0 ? (<h3>Comment hiện chưa có người Like</h3>) : (null)}
                            {!getList && quantityLikeReplyComment !=0 ? (<h3>Đã có {quantityLikeReplyComment} người đã Like ReplyComment này</h3>) : (null)}
                            {!getList && quantityLikeReplyComment ==0 ? (<h3>Comment hiện chưa có người Like</h3>) : (null)}
                            <button className="close-button" onClick={() => handleCloseDialog()}>&times;</button>
                        </div>

                        <div className="dialog-content">
                            {listLike.length > 0 ? (
                                <p>{listLike.map((like, index) => (
                                    <div key={index} className='user-like'>
                                        <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' /> 
                                        <p style={{ color: 'red' }}>&nbsp;{like.DisplayName}</p> 
                                        <p>&nbsp;{like.UserName}</p>
                                    </div>
                                ))}</p>
                            ):(<div style={{color: 'red'}}>{getList ? (<p>Hy vọng bạn sẽ là người đầu tiên like Comment này!</p>) : (<p>Hy vọng bạn sẽ là người đầu tiên Like ReplyComment này!</p>)}</div>)}
                            
                        </div>
                    </div>
                </div>
            ): (null)
            }
        </div>

    )

}

export default DialogGetLikeComment
