import React, { useState, useEffect } from 'react';


import { useNavigate } from "react-router-dom";
import axiosClient from '../authenticate/authenticationConfig';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import SinglePost from './SinglePost';


function Dialog({sweet, getList, onCloseDialog}) {
    const navigate = useNavigate();
    const handleGetSweetDetail = (_id) => {
        navigate(`/status/${_id}`)
    }

    const [listLike, setListLike] = useState()
    const [quantityLike, setQuantityLike] = useState(); 
    const [quantityShare, setQuantityShare] = useState(); 
    const [showDialog, setShowDialog] = useState(true);

    const handleCloseDialog = () => {
        setShowDialog(false); 
        onCloseDialog(false);
    };
    

    const getListLikeHandle = async () => {
             
        const response = await axiosClient.get(`/sweet/getListLike?SweetID=${sweet._id}`);
        if(response.data.isSuccess){
            setListLike(response.data.data.List_UserName_ToLike)
            setQuantityLike(response.data.data.QuantityLike);
        }else {
            toast.error(response.errorMessage);
        }
    }

    const getListShareHandle = async () => {

        const response = await axiosClient.get(`/sweet/getListShare?SweetID=${sweet._id}`);
        if(response.data.isSuccess){
            setListLike(response.data.data.List_UserName_ToShare)
            setQuantityShare(response.data.data.QuantityShare);
        }else {
            toast.error(response.errorMessage);
        }
    }

    useEffect(() => {
        if (getList) {
            getListShareHandle();
        } else {
            getListLikeHandle();
        }
    }, [getList, sweet._id]);
    

    
    return (
        <div className='dialog-container'>
            {showDialog && listLike ? (
                <div className="overlay">
                    <div className="dialog">
                        <div className="dialog-header">
                            {getList && quantityShare !=0 ? (<h3>Đã có {quantityShare} người đã Share bài viết này</h3>) : (null)}
                            {getList && quantityShare ==0 ? (<h3>Bài viết hiện chưa có người Share</h3>) : (null)}
                            {!getList && quantityLike !=0 ? (<h3>Đã có {quantityLike} người đã Like bài viết này</h3>) : (null)}
                            {!getList && quantityLike ==0 ? (<h3>Bài viết hiện chưa có người Like</h3>) : (null)}
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
                            ):(<div style={{color: 'red'}}>{getList ? (<p>Hy vọng bạn sẽ là người đầu tiên Share bài viết này!</p>) : (<p>Hy vọng bạn sẽ là người đầu tiên Like bài viết này!</p>)}</div>)}
                            
                        </div>
                    </div>
                </div>
            ): (null)
            }
        </div>

    )

}

export default Dialog
