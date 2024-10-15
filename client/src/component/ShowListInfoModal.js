import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Radio, Image, Modal, Upload, Row, Col, Avatar, List } from 'antd';
import axiosClient from '../authenticate/authenticationConfig';
import { toast } from 'react-toastify';

function ShowListInfoModal({ sweet, number, title, type }) {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);

    const handleCancel = () => {
        setVisible(false);
    };

    const toggleModal = () => {
        setVisible(prevVisible => !prevVisible);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (type === "Share") {
                    const response = await axiosClient.get(`/sweet/getListShare?SweetID=${sweet._id}`);
                    if (response.data.isSuccess) {
                        console.log(response.data)
                        setUsers(response.data.data.List_UserName_ToShare);
                    } else {
                        toast.error(response.data.errorMessage);
                    }
                } else if (type === "Like") {
                    const response = await axiosClient.get(`/sweet/getListLike?SweetID=${sweet._id}`);
                    if (response.data.isSuccess) {
                        setUsers(response.data.data.List_UserName_ToLike);
                    } else {
                        toast.error(response.data.errorMessage);
                    }
                }
            } catch (error) {
                toast.error("An error occurred while fetching data.");
            } finally {
                setLoading(false);
            }
        };

        if (visible) {
            fetchData();
        }
    }, [visible, sweet._id, type]);

    return (
        <span>
            <span onClick={toggleModal}>&nbsp; {number}</span>
            <Modal
                title={title}
                open={visible}
                onCancel={handleCancel}
                styles={{
                    content: { backgroundColor: 'black' },
                    title: { backgroundColor: 'black', color: '#5555' }
                }}
                centered
                footer={null}
            >
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={users}
                        renderItem={(item) => (
                            <List.Item style={{ borderBottom: '1px solid #5555' }}>
                                <List.Item.Meta style={{ color: "white" }}
                                    avatar={<Avatar src={item?.avatar ? item.avatar : 'https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg'} />}
                                    title={<a href={`/profile/${item._id}`} style={{ color: 'white !important' }}>{item.DisplayName}</a>}
                                    description={"@" + item?.UserName}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Modal>
        </span>
    );
}

export default ShowListInfoModal;
