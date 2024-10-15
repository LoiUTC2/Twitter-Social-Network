import React, { useState } from 'react'
import { Button, Form, Input, Radio, Image, Modal, Upload, Row, Col, Avatar, List } from 'antd';
import axiosClient from '../authenticate/authenticationConfig';
import { toast } from 'react-toastify';

function FollowViewModal({ type, userList,resetData }) {
    const [visible, setVisible] = useState();
    const [loading, setLoading] = useState({});
    const [users, setUsers] = useState(userList);

    const handleCancel = () => {
        resetData().then(
            setVisible(false)
        )
        
    };
    const toggleModal = () => {
        setVisible(prevVisible => !prevVisible);
    };
    const handleUnfollow = async (userId) => {
        setLoading(prevLoading => ({ ...prevLoading, [userId]: true }));
        try {
            const action = await axiosClient.post('users/addFollow', { followUserId: userId });
            if (action.data.isSuccess) {
                console.log(users,userId)
                setTimeout(() => {
                    setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
                    setLoading(prevLoading => ({ ...prevLoading, [userId]: false }));
                }, 1000);
            }
        } catch (error) {
            toast.error("Thông báo lỗi!!");
            setLoading(prevLoading => ({ ...prevLoading, [userId]: false }));
        }
    };
    return (
        <span>
            <p onClick={toggleModal}>{type=="following" ? "Following" : "Followers"}</p>
            <Modal
                title={type=="following" ? "Danh sách người đang theo dõi" :"Danh sách người theo dõi"}
                open={visible}
                onCancel={handleCancel}
                //   width={700}
                styles={{
                    content: { backgroundColor: 'black' },
                    title: { backgroundColor: 'black', color: '#5555' }
                }}
                centered
                footer={
                    <Button type='primary' onClick={handleCancel} >
                    Thoát
                </Button>
                }
            >
                <List
                    itemLayout="horizontal"
                    dataSource={users && users}
                    renderItem={(item, index) => (
                        <List.Item style={{ borderBottom: '1px solid #5555' }}>
                            <List.Item.Meta style={{ color: "white" }}
                                avatar={<Avatar src={item?.avatar ? item.avatar : 'https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg'} />}
                                title={<a href={`/profile/${item._id }`} style={{ color: 'white !importance' }}>{item.displayName}</a>}
                                description={"@"+item?.username}
                            />
                            <Button 
                            loading={loading[item._id]}
                                onClick={() => handleUnfollow(item._id)}
                                style={{
                                    backgroundColor: '#ff4d4f',
                                    borderColor: '#ff4d4f',
                                    color: 'white',
                                }}
                            >
                                {type=="following" ? "Bỏ theo dõi" : "Loại bỏ follow này"}
                            </Button>

                        </List.Item>
                    )}
                />
            </Modal>
        </span>
    )
}

export default FollowViewModal
