import React, { useEffect, useState } from 'react';
import { IoSettingsOutline } from 'react-icons/io5';
import axiosClient from '../authenticate/authenticationConfig';
import { Dropdown, Menu, Space, Button } from 'antd';
import { HiDotsHorizontal } from "react-icons/hi";
import CommonFunctions from '../common/CommonFunctions';

function NotificationPage() {
    const [allNotify, setAllNotify] = useState([]);
    const [tabSelected, setTabSelected] = useState(1);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const limit = 10;

    const fetchData = async (page = 1, append = false) => {
        try {
            const response = await axiosClient.get(`users/getallnotify?page=${page}&limit=${limit}`);
            if (response.data.isSuccess) {
                setAllNotify(prev => append ? [...prev, ...response.data.data] : response.data.data);
                setTotalNotifications(response.data.total);
            }
        } catch (error) {
            setError("Error fetching notifications");
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        fetchData(1, false);
    }, [tabSelected]);

    const handleLoadMore = () => {
        setLoadingMore(true);
        const nextPage = currentPage + 1;
        fetchData(nextPage, true).then(() => {
            setCurrentPage(nextPage);
            setLoadingMore(false);
        });
    };

    const handleDeleteNotify = () => {
        // Implement delete notification logic here
    };

    const Dropdownitems = [
        {
            key: 'Delete',
            label: 'Xóa thông báo',
            onClick: handleDeleteNotify,
        },
    ];

    const menu = (
        <Menu
            items={Dropdownitems}
            className="custom-dropdown"
        />
    );

    return (
        <div className='notify-container'>
            <div className='notify-header'>
                <div className='notify-title'>
                    <span>Notifications</span>
                    <span><IoSettingsOutline /></span>
                </div>
                <div className='list-type-notify'>
                    <ul>
                        <li
                            className={`${tabSelected === 1 ? 'li-isselected' : ''}`}
                            onClick={() => { setTabSelected(1); setCurrentPage(1); setAllNotify([]); }}
                        >
                            All
                        </li>
                        <li
                            className={`${tabSelected === 2 ? 'li-isselected' : ''}`}
                            onClick={() => { setTabSelected(2); setCurrentPage(1); setAllNotify([]); }}
                        >
                            Verified
                        </li>
                        <li
                            className={`${tabSelected === 3 ? 'li-isselected' : ''}`}
                            onClick={() => { setTabSelected(3); setCurrentPage(1); setAllNotify([]); }}
                        >
                            Mentions
                        </li>
                    </ul>
                </div>
            </div>
            <div className='notify-list'>
                {error && <p className="error-message">{error}</p>}
                {allNotify && allNotify.map((item, index) => (
                    <div key={index} className='notify-single'>
                        <div className='notify-title'>
                            <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' alt='Notification' />
                            <div className='option-sweet'>
                                <Dropdown overlay={menu} trigger={['click']} className='custome-dropdown' >
                                    <span onClick={(e) => e.preventDefault()}>
                                        <Space>
                                            <HiDotsHorizontal style={{ color: '#fff', cursor: 'pointer' }} />
                                        </Space>
                                    </span>
                                </Dropdown>
                            </div>
                        </div>
                        <div className='notify-content'>
                            <p>{item?.content}</p>
                            <p>{CommonFunctions.formatTimeAgo(item?.created_at)}</p>
                        </div>
                    </div>
                ))}
            </div>
            {allNotify.length < totalNotifications && (
                <div className='load-more'>
                    <Button onClick={handleLoadMore} loading={loadingMore} type="text" style={{color:'white', fontSize:'17px'}} >
                        {loadingMore ? 'Loading...' : 'Xem thêm'}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default NotificationPage;
