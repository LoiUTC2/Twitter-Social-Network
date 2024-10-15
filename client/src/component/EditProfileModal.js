import React, { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Image, Modal, Upload, Row, Col } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../authenticate/authenticationConfig';
import { toast } from 'react-toastify';
import FollowViewModal from './followViewModal';
const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

const EditProfileModal = ({handleReload}) => {
    const [open, setOpen] = useState(false);
    const [showFollowViewModal, setShowFollowViewModal] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState([]);
    const [form] = Form.useForm();
    const [formLayout, setFormLayout] = useState('horizontal');
    const [userInfo, setUserInfo] = useState();
    const userId = JSON.parse(localStorage.getItem("twitter-user"))?._id; //ID người đang sử dụng
    const navigate = useNavigate()
    const showModal = () => {
        setOpen(true);
    };
    const onFormLayoutChange = ({ layout }) => {
        setFormLayout(layout);
    };
    useEffect(() => {
        fetchData()
    }, [userId]);
    const fetchData = async () => {
        try {
            let response;
            response = await axiosClient.get(`/users/${userId}`);
            if (response.data.isSuccess) {
                setUserInfo(response.data.data)
                form.setFieldsValue({
                    displayName: response.data.data.displayName,
                    email: response.data.data.email,
                    userName: response.data.data.userName,
                    dob: response.data.data.dob,
                    bio: response.data.data.bio
                });
            } else {
                toast.error(response.errorMessage);
            }
        } catch (error) {
            toast.error("Unexpected error");
        };
    }
    const formItemLayout =
        formLayout === 'horizontal'
            ? {
                labelCol: {
                    span: 10,
                },
                wrapperCol: {
                    span: 20,
                },
            }
            : null;

            const handleOk = async () => {
                try {
                    console.log(form.getFieldsValue())
                    console.log(form.getFieldError())
                    setConfirmLoading(true);
                    const values = await form.validateFields();
            
                    const formData = new FormData();
                    Object.keys(values).forEach(key => {
                        if (!!values[key])
                            formData.append(key, values[key]);
                    });
                    if (!!fileList && fileList.length !=0) {
                        console.log(fileList.length)
                        formData.append('image', fileList[0].originFileObj);
                    }
            
                    console.log(formData);
            
                    const response = await axiosClient.put(`/users/edit`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
            
                    if (response.data.isSuccess) {
                        setOpen(false);
                        form.resetFields();
                        toast.success('Cập nhật thông tin thành công!');
                        handleReload(userId);
                    } else {
                        toast.error(response.errorMessage);
                    }
                } catch (error) {
                    console.log(error)
                    toast.error("Không thể cập nhật thông tin.");
                } finally {
                    setConfirmLoading(false);
                }
            };

    const handleCancel = () => {
        form.resetFields();
        setOpen(false);
    };

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
    };

    const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

    const uploadButton = (
        <button
            style={{
                border: 0,
                background: 'none',
                color: 'white'
            }}
            type="button"
        >
            <PlusOutlined />
            <div
                style={{
                    marginTop: 8,
                }}
            >
                Upload
            </div>
        </button>
    );
    return (
        <div className='profile-edit-modal'>
            <Button type="primary" onClick={showModal}>
                Edit profile
            </Button>
            <Modal
                title="Edit Profile"
                visible={open}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                width={700}
                styles={{
                    content: { backgroundColor: 'black' },
                    title: { backgroundColor: 'black', color: 'white' }
                }}
                centered
            >
                <div>
                    <div className='cover-images'>
                        <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbrcbieHSe__U37eq3JOSPIGi4WVjdzn0GDw_jVv7Rnqq_UTvaAw3GkeXd_O575NU_nGw&usqp=CAU' style={{ width: '100%', height: '200px' }} />
                    </div>
                    <div style={{ marginTop: '-50px' }}>
                        <Upload
                            action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                            listType="picture-circle"
                            fileList={fileList}
                            onPreview={handlePreview}
                            onChange={handleChange}
                            maxCount={1}
                            style={{ color: 'white !important' }}
                        >
                            {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                        {previewImage && (
                            <Image
                                wrapperStyle={{
                                    display: 'none',
                                    color: 'white !important'
                                }}
                                preview={{
                                    visible: previewOpen,
                                    onVisibleChange: (visible) => setPreviewOpen(visible),
                                    afterOpenChange: (visible) => !visible && setPreviewImage(''),
                                }}
                                src={previewImage}
                            />
                        )}
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Form
                        {...formItemLayout}
                        layout={formLayout}
                        form={form}
                        initialValues={{
                            displayName: userInfo?.displayName,
                            email: userInfo?.email,
                            userName: userInfo?.userName,
                            dob: userInfo?.dob,
                            bio: userInfo?.bio,
                            layout: formLayout,
                          }}
                          onValuesChange={onFormLayoutChange}
                        style={{
                            maxWidth: formLayout === 'inline' ? 'none' : 600,
                            color: 'white !important',
                            width: '100%'
                        }}
                    >
                        <Form.Item name="displayName"  style={{ width: '100%' }} rules={[{ required: true, message: 'Không thể bỏ trống thông tin này!' }]}>
                            <Row style={{ width: '100%', minWidth: '600px' }}>
                                <Col span={12} style={{ textAlign: 'center', paddingRight: '10px', color: 'white ', fontSize: '19px', margin: 'auto 0' }}>
                                    Tên hiển thị:
                                </Col>
                                <Col span={12}>
                                    <Input defaultValue={form.getFieldValue("displayName")} style={{ backgroundColor: 'transparent', color: 'white', fontSize: '20px', padding: '5px' }} />
                                </Col>
                            </Row>
                        </Form.Item>
                        <Form.Item name="email"  style={{ width: '100%' }} rules={[{ required: false,type: "email", message: 'Dữ liệu không hợp lệ' }]} >
                            <Row style={{ width: '100%', minWidth: '600px' }}>
                                <Col span={12} style={{ textAlign: 'center', paddingRight: '10px', color: 'white ', fontSize: '19px', margin: 'auto 0' }}>
                                    Email:
                                </Col>
                                <Col span={12}>
                                    <Input defaultValue={form.getFieldValue("email")} type='email' style={{ backgroundColor: 'transparent', color: 'white', fontSize: '20px', padding: '5px' }}  />
                                </Col>
                            </Row>
                        </Form.Item>
                        <Form.Item name="userName" style={{ width: '100%' }} rules={[{ required: true, message: 'Không thể bỏ trống thông tin này!' }]}>
                            <Row style={{ width: '100%', minWidth: '600px' }}>
                                <Col span={12} style={{ textAlign: 'center', paddingRight: '10px', color: 'white ', fontSize: '19px', margin: 'auto 0' }}>
                                    Tên người dùng:
                                </Col>
                                <Col span={12}>
                                    <Input defaultValue={form.getFieldValue("userName")} style={{ backgroundColor: 'transparent', color: 'white', fontSize: '20px', padding: '5px',}} placeholder='@' />
                                </Col>
                            </Row>
                        </Form.Item>
                        <Form.Item name="dob" style={{ width: '100%' }}>
                            <Row style={{ width: '100%', minWidth: '600px' }}>
                                <Col span={12} style={{ textAlign: 'center', paddingRight: '10px', color: 'white ', fontSize: '19px', margin: 'auto 0' }}>
                                    Ngày sinh:
                                </Col>
                                <Col span={12}>
                                    <Input defaultValue={form.getFieldValue("dob")} style={{ backgroundColor: 'transparent', color: 'white', fontSize: '20px', padding: '5px' }} />
                                </Col>
                            </Row>
                        </Form.Item>
                        <Form.Item name="bio" style={{ width: '100%' }}>
                            <Row style={{ width: '100%', minWidth: '600px' }}>
                                <Col span={12} style={{ textAlign: 'center', paddingRight: '10px', color: 'white ', fontSize: '19px', margin: 'auto 0' }}>
                                    Mô tả:
                                </Col>
                                <Col span={12}>
                                    <Input defaultValue={form.getFieldValue("bio")} style={{ backgroundColor: 'transparent', color: 'white', fontSize: '20px', padding: '5px', minHeight: '75px' }} />
                                </Col>
                            </Row>
                        </Form.Item>

                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default EditProfileModal;
