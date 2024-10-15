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
import Dialog from '../component/Dialog'
import DialogShare from './DialogShare';
import { FaEllipsisV } from "react-icons/fa";
import DialogHistorySweet from './DialogHistorySweet';
import ShowListInfoModal from './ShowListInfoModal';
import { DownOutlined, SmileOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Modal, Space } from 'antd';


function SinglePost({ sweetData, selectedTab, resetData, inProfile }) {
    const navigate = useNavigate();
    const handleGetSweetDetail = (_id) => {
        navigate(`/status/${_id}`, { state: { source: 'sweetDetail' } })
    }

    const userId = JSON.parse(localStorage.getItem("twitter-user"))?._id;

    const [isLiked, setIsLiked] = useState(sweetData.StateLike);
    const [quantityLike, setQuantityLike] = useState(sweetData.QuantityLike);
    const [quantityShare, setQuantityShare] = useState(sweetData.QuantityShare);
    const [showDialogCreateShare, setShowDialogCreateShare] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedFile, setSelectedFile] = useState([]);
    const [updatedSweet, setUpdatedSweet] = useState(sweetData.Content);
    const [idAfterUpdatedSweet, setIdAfterUpdatedSweet] = useState(sweetData._id);
    const [contentAferUpdateSweet, setContentAferUpdateSweet] = useState(sweetData.Content);

    const [showDialogHistory, setshowDialogHistory] = useState(false);

    const handleCreateShareClick = () => {
        setShowDialogCreateShare(true);
    };

    const handleShowDialogCreateShare = (value) => {
        setShowDialogCreateShare(value);
    };

    const handleShowDialogGetQuantityShare = (value) => {
        setQuantityShare(value);
    };

    const likeSweetHandle = async () => {
        try {
            const response = await axiosClient.put(`/sweet/addOrDeleleLike/${sweetData._id}`);
            if (response.data.isSuccess) {
                if (response.data.data.State) {
                    setIsLiked(true);
                } else {
                    setIsLiked(false);
                }
                resetData();
                setQuantityLike(response.data.data.QuantityLike);
            }
        } catch (error) {
            toast.error(error.response?.data.errorMessage ?? "Unexpected error");
        }
    }

    const handleDeleteClick = async () => {
        try {
            if (!sweetData.State) {
                const response = await axiosClient.delete(`sweet/deleteSweet/${sweetData._id}`);
                if (response.data.isSuccess) {
                    toast.success("Xóa bài viết thành công.");
                    resetData();
                } else {
                    toast.error(response.errorMessage);
                }
            } else {
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
    };


    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpdateClick = async () => {
        try {
            debugger
            if (!sweetData.State) {
                const formData = new FormData();
                formData.append('content', updatedSweet);
                // selectedFile && formData.append('image', selectedFile);
                selectedFile.length > 0 && formData.append('image', selectedFile);
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
                    resetData();
                } else {
                    toast.error(response.errorMessage);
                }
            } else {
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
                    resetData();
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
    };

    const handlePinSweetClick = async () => {
        try {

            const response = await axiosClient.put(`sweet/pinSweet/${sweetData._id}`);

            if (response.data.data) {
                toast.success("Ghim bài viết thành công.");

                resetData();
                // setContentAferUpdateSweet(sweetData.Content);
            } else {
                toast.success("Bỏ ghim bài viết thành công.");
                resetData();
                // setContentAferUpdateSweet(sweetData.Content);
            }
        } catch (error) {
            toast.error("Lỗi khi ghim bài viết");
            console.log("Lỗi: ", error)
        }
    };
    const Dropdownitems = [

        inProfile && userId === sweetData.UserName._id && {
            key: 'edit',
            label: !sweetData.Ispin ? 'Ghim bài viết' : 'Bỏ ghim bài viết',
            onClick: handlePinSweetClick,
        },

        userId === sweetData.UserName._id && {
            key: 'edit',
            label: 'Chỉnh sửa',
            onClick: handleEditClick,
        },
        userId === sweetData.UserName._id && {
            key: 'delete',
            label: 'Xóa vĩnh viễn',
            onClick: handleDeleteClick,
        },
        userId === sweetData.UserName._id && !sweetData.State && {
            key: 'deleteTemporary',
            label: 'Xóa bỏ vào thùng rác',
            onClick: handleDeleteTemporaryClick,
        },
        {
            key: 'viewHistory',
            label: 'Xem lịch sử chỉnh sửa',
            onClick: handleDialogHistoryClick,
        },

    ].filter(Boolean);

    const menu = (
        <Menu
            items={Dropdownitems}
            className="custom-dropdown"
        />
    );
    console.log(selectedFile)
    return (
        <div className='single-post' >
            <div className='user-info' >
                <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg'
                    onClick={() => { navigate(`/profile/${sweetData.UserName._id}`) }}
                />
                <div className='info-content' >
                    <div className='user-info-name' onClick={() => { navigate(`/profile/${sweetData.UserName._id}`) }}>
                        <span>{sweetData.UserName.displayName}</span>
                        <span>{sweetData.UserName.username}</span>
                    </div>
                    <div className='option-sigle-post'>
                        <span className='post-createdAt'>{sweetData.Duration}</span>
                        <div className='post-createdAt'> {/*option-sigle-post*/}


                        </div>
                    </div>

                </div>
                <div className='option-sweet'>
                    <Dropdown overlay={menu} trigger={['click']} className='custome-dropdown' >
                        <span onClick={(e) => e.preventDefault()}>
                            <Space>
                                <FaEllipsisV style={{ color: '#fff' }} />
                            </Space>
                        </span>
                    </Dropdown>
                </div>

            </div>

            <div className='single-post-content'>
                <div className='text-content' >
                    {isEditing ? (
                        <div>
                            <textarea
                                value={updatedSweet}
                                onChange={(e) => setUpdatedSweet(e.target.value)}
                                placeholder='Enter update Sweet...'
                                rows={3}
                            />

                            <div className='option-update-sweet'>
                                <div className='box-icon'>
                                    <div className='icon-list'>
                                        <nav>
                                            <ul>
                                                <li>
                                                    {/* Hiển thị icon CiImageOn */}
                                                    <label htmlFor="fileInput" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '23px' }}>
                                                        <CiImageOn />
                                                        {/* Ẩn input file */}
                                                        <input
                                                            type="file"
                                                            id="fileInput"
                                                            style={{ display: "none" }}
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e)}
                                                            multiple
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
                        <span onClick={() => handleGetSweetDetail(sweetData._id)}>
                            {inProfile ? sweetData.Content : updatedSweet}
                        </span>
                    )}

                </div>
                <div>
                    {sweetData.State ? (
                        <div className='post-share'>
                            <div className='user-info'>
                                <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' onClick={() => { navigate(`/profile/${sweetData.UserName_Origin._id}`) }} />
                                <div className='info-content'>
                                    <div className='user-info-name' onClick={() => { navigate(`/profile/${sweetData.UserName_Origin._id}`) }}>
                                        <span>{sweetData.UserName_Origin?.displayName}</span>
                                        <span>{sweetData.UserName_Origin?.username}</span>
                                    </div>
                                    <span className='post-createdAt'>{sweetData.Duration_Origin}</span>
                                </div>
                            </div>

                            <div className='single-post-content'>
                                <div className='text-content' onClick={() => handleGetSweetDetail(sweetData.SweetID)}>
                                    <span >{sweetData.Content_Origin}</span>
                                </div>

                                <div className='image-content' onClick={() => handleGetSweetDetail(sweetData.SweetID)}>
                                    {sweetData.Image_Origin && sweetData.Image_Origin.map((item, index) => (
                                        <img src={item} />
                                    ))
                                    }
                                </div>
                            </div>
                        </div>


                    ) : (null)}
                </div>


                <div className='image-content' onClick={() => handleGetSweetDetail(sweetData._id)}>
                    {
                        sweetData.Image && sweetData.Image.map((item, index) => (
                            <img src={item} />
                        ))
                    }
                </div>

                <div className='react-content'>
                    <ul>
                        <li onClick={() => handleGetSweetDetail(sweetData._id)}><FaRegComment /> &nbsp; {sweetData.QuantityComment}</li>
                        <li><GiRapidshareArrow
                            onClick={() => handleCreateShareClick(sweetData._id)}
                        />
                            {!sweetData.State ? (
                                <ShowListInfoModal title={"Danh sách người chia sẻ"} number={inProfile ? sweetData.QuantityShare : quantityShare} sweet={sweetData} type={"Share"} />
                            )
                                : (null)}
                        </li>

                        <li ><AiOutlineHeart
                            onClick={() => likeSweetHandle()}
                            style={{ color: inProfile ? (sweetData.StateLike ? 'red' : 'white') : (isLiked ? 'red' : 'white'), cursor: 'pointer' }}
                        />
                            <ShowListInfoModal title={"Danh sách người thích bài viết"} number={inProfile ? sweetData.QuantityLike : quantityLike} sweet={sweetData} type={"Like"} />
                        </li>

                        <li onClick={() => handleGetSweetDetail(sweetData._id)}><BsReverseListColumnsReverse /> &nbsp; {835}</li>
                    </ul>
                </div>
                {showDialogCreateShare && <DialogShare sweet={sweetData} onCloseDialog={handleShowDialogCreateShare} quantityShare={handleShowDialogGetQuantityShare} />}

                {showDialogHistory && <DialogHistorySweet sweet={sweetData} onCloseDialog={handleShowDialogHistoryUpdate} />}
            </div>

        </div>
    )
}

SinglePost.defaultProps = {
    inProfile: false,
};
export default SinglePost
