import React, { useEffect, useState } from 'react';
import { AiOutlineSearch } from "react-icons/ai";
import { CgMoreAlt } from "react-icons/cg";
import axiosClient from '../authenticate/authenticationConfig';
import { FaCircle } from "react-icons/fa";
import AutoSuggest from "react-autosuggest";
import { useNavigate } from 'react-router-dom';
const Menu = () => {
    const [userRelateList, setUserRelateList] = useState([]);
    const [userListOnline, setUserListOnline] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    const navigate = useNavigate();
    const [skip, setSkip] = useState(0);
    const [limit,setLimit] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3 * 60 * 1000); // 3 phút

        return () => clearInterval(interval);
    }, []);
    const fetchData = async () => {
        try {
            const userUnfollowResponse = await axiosClient.get('users/getListUserUnFollow');
            if (userUnfollowResponse.data.isSuccess) {
                const userRelateData = userUnfollowResponse.data.data.map(user => ({ ...user, isFollow: false }));
                setUserRelateList(userRelateData);
            }

            const userOnlineResponse = await axiosClient.get('users/getuseronline');
            if (userOnlineResponse.data.isSuccess) {
                setUserListOnline(userOnlineResponse.data.data);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const handleFollowToggle = async (id, index) => {
        try {
            const response = await axiosClient.post('users/addFollow', { followUserId: id });
            if (response.data.isSuccess) {
                const action = response.data.data.action;
                const updatedUserRelateList = [...userRelateList];

                if (action === 'follow') {
                    updatedUserRelateList[index].isFollow = true;
                } else if (action === 'unfollow') {
                    updatedUserRelateList[index].isFollow = false;
                }

                setUserRelateList(updatedUserRelateList);

                if (action === 'follow') {
                    setTimeout(() => {
                        fetchData()
                    }, 1000); // 3 seconds
                }
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    };
    const loadMoreSuggestions = () => {
        fetchSuggestions(searchValue, skip);
        setSkip(prevSkip => prevSkip + limit);
    };
    useEffect(() => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        if (searchValue) {
            const timeout = setTimeout(() => {
                fetchSuggestions(searchValue);
                setSkip(0); // Reset skip khi bắt đầu tìm kiếm mới
            }, 300); // Chờ 300ms sau khi người dùng ngừng nhập

            setDebounceTimeout(timeout);
        } else {
            setSuggestions([]);
        }
    }, [searchValue]);

    const fetchSuggestions = async (value) => {
        try {
            const response = await axiosClient.get(`users/search?query=${value}&skip=${skip}&limit=${100}`);
            if (response.data.isSuccess) {
                const fetchedUsers = response.data.data.users;
                setTotalUsers(response.data.data.totalUsers);
                if (skip === 0) {
                    setSuggestions(fetchedUsers);
                } else {
                    setSuggestions(prevSuggestions => [...prevSuggestions, ...fetchedUsers]);
                }
                setSuggestions(prev => [...prev, { isFooter: true }]);
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
};
const renderSectionTitle = (section) => {
    if (section.isFooter) {
        return (
            <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid #ccc' }}>
                <button onClick={loadMoreSuggestions}>Xem thêm</button>
            </div>
        );
    }
};
    const onSuggestionsFetchRequested = ({ value }) => {
        setSearchValue(value);
    };

    const onSuggestionsClearRequested = () => {
        setSuggestions([]);
    };

    const getSuggestionValue = suggestion => suggestion.displayName;
    const handleSelectUser = (id) => {
        navigate(`profile/${id}`)
    }
    const renderSuggestion = suggestion => (
        <div style={{ display: 'flex', alignItems: 'center' }} onClick={() => handleSelectUser(suggestion._id)}>
            <img src={suggestion.avatar || 'https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg'} alt={''} style={{ width: '35px', height: '35px', borderRadius: '50%', marginRight: '10px' }} />
            <div className='search-suggestion-info'>
                <span>{suggestion.displayName} </span>
                <span>@{suggestion.username}</span>
            </div>
        </div>
    );

    const inputProps = {
        placeholder: "Search for users...",
        value: searchValue,
        onChange: (e, { newValue }) => setSearchValue(newValue)
    };

    return (
        <div className='homepage-menu'>
            <nav className='search'>
                <AiOutlineSearch style={{ fontSize: '22px' }} />
                <AutoSuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={onSuggestionsClearRequested}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    inputProps={inputProps}
                    renderSectionTitle={renderSectionTitle}
                    theme={{
                        container: 'autosuggest__container',
                        input: 'autosuggest__input',
                        suggestionsContainerOpen: 'autosuggest__suggestions-container--open',
                        suggestionsList: 'autosuggest__suggestions-list',
                        suggestion: 'autosuggest__suggestion',
                    }}

                />

            </nav>
            <div className='subscribe'>
                <nav>
                    <ul>
                        <li>Subscribe to Premium</li>
                        <li>Subscribe to unclock new features and if eligible, receive a share of ads revenue.</li>
                        <li>Subscribe</li>
                    </ul>
                </nav>
            </div>
            {/* Who to follow */}
            <div className='user-relate'>
                <div>Who to follow</div>
                {userRelateList && userRelateList.map((item, index) => (
                    <ul key={index}>
                        <li>
                            <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' alt="Avatar" />
                        </li>
                        <li>
                            <div>
                                <span>{item.displayName}</span>
                                <span>{"@" + item.username}</span>
                            </div>
                        </li>
                        <li>
                            <button onClick={() => handleFollowToggle(item._id, index)}>
                                {item.isFollow ? "Đã follow" : "Follow"}
                            </button>
                        </li>
                    </ul>
                ))}
            </div>
            {/*Friend online*/}
            <div className='user-relate' style={{ minHeight: '140px' }}>
                <div>Contacts</div>
                {userListOnline && userListOnline.map((item, index) => (
                    <ul key={index}>
                        <li>
                            <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' alt="Avatar" />
                        </li>
                        <li>
                            <div>
                                <span>{item.displayName}</span>
                                <span>{"@" + item.username}</span>
                            </div>
                        </li>
                        <li style={{ fontSize: '12px', color: ' #e9e900' }}>
                            <FaCircle />
                        </li>
                    </ul>
                ))}
            </div>
        </div>
    );
};

export default Menu;
