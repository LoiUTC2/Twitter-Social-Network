// Menu.js
import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineSetting } from "react-icons/ai";
import { CiImageOn } from "react-icons/ci";
import { AiOutlineFileGif } from "react-icons/ai";
import { AiOutlineUnorderedList } from "react-icons/ai";
import { BsEmojiSmile } from "react-icons/bs";
import { SlCalender } from "react-icons/sl";
import { CiLocationOn } from "react-icons/ci";
import axiosClient from '../../authenticate/authenticationConfig';
import SinglePost from '../SinglePost';
import { toast } from 'react-toastify';

function Post() {
  const [selectedTab, setSelectedTab] = useState('For You');
  const [sweetList, setSweetList] = useState([]);
  const [postSweetContent, setPostSweetContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [limit, setLimit] = useState(5);
  const [skip, setSkip] = useState(0);

//Khởi tạo các biến mặc định
  useEffect(() => {
    setSelectedTab('For You');
    //Check phân trang
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const isNearBottom = scrollHeight - scrollTop <= clientHeight + 800;
      setIsNearBottom(isNearBottom);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    console.log('call fetchdata 1')
    fetchData();
   
  }, [limit, skip]);
  //Nếu như đổi tab data sẽ set lại từ đầu
  useEffect(() => {
    setSweetList([]);
    setSkip(0);
    setLimit(5);
    console.log('call fetchdata setSweetList')
    fetchData();
    
  },[selectedTab])

  const fetchData = async () => {
    try {
        let response;
        if (selectedTab === 'For You') {
            response = await axiosClient.get(`/sweet/getManySweetAndShareForYou?limit=${limit}&skip=${skip}`);
        } else if (selectedTab === 'Following') {
            response = await axiosClient.get(`/sweet/getManySweetAndShareFollowing?limit=${limit}&skip=${skip}`);
        }
            const newSweetList = response.data.data.InFo_Sweet;


        if (response.data.isSuccess) {
            // Hàm để loại bỏ các mục đã tồn tại trong danh sách
            const getUniqueNewSweetList = (newList, existingList) => {
                const existingIds = new Set(existingList.map(item => item._id));
                return newList.filter(item => !existingIds.has(item._id));
            };

            // Loại bỏ các mục đã tồn tại trong danh sách và cập nhật sweetList
            setSweetList(prevSweetList => [...prevSweetList, ...getUniqueNewSweetList(newSweetList, prevSweetList)]);
        } else {
            toast.error(response.errorMessage);
        }
    } catch (error) {
        console.error("Error occurred while fetching sweet data:", error);
    }
  }; 

  useEffect(() => {
    if (isNearBottom==true) {
      console.log('set skip')
      setSkip(prevSkip => prevSkip + limit);
    }
  }, [isNearBottom]);


  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const postContentHandle = async () => {
    try {
      const formData = new FormData();
      formData.append('content', postSweetContent);
      selectedFile && formData.append('image', selectedFile);
      const response = await axiosClient.post('/sweet/createSweet', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.isSuccess) {
        // Reset skip and sweetList to fetch updated data
        setSkip(0);
        setSweetList([]);
        setPostSweetContent('');
        toast.success("Tạo bài viết thành công!");
        fetchData();
      } else {
        toast.error(response.errorMessage);
      }
    } catch (error) {
      console.error("Error posting content:", error);
      toast.error("Lỗi khi tạo mới bài viết");
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };


  return (
    <div className='homepage-post'>
      {sweetList ? (
        <div>
          <div className='post-type-sweet'>
        <span className={selectedTab === 'For You' ? 'selected-tab' : ''} onClick={() => handleTabClick('For You')}>For you</span>
        <span className={selectedTab === 'Following' ? 'selected-tab' : ''} onClick={() => handleTabClick('Following')}>Following</span>
        
        <AiOutlineSetting width={20} color='white' fontSize={23} style={{ marginRight: '1px', marginTop: '10px', right: '0' }} />
        </div>
      <div className='post-create-box'>
        <div className='input-box-avatar'>
          <img src='https://as2.ftcdn.net/v2/jpg/03/49/49/79/1000_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg' />
        </div>
        <div className='create-box-input'>
          <div className='input-box-text'>
            <textarea
              name="postSweetContent"
              value={postSweetContent}
              onChange={(e) => setPostSweetContent(e.target.value)}
              placeholder='What is happening?!'
              rows={4}
              cols={40}
            />
          </div>
          <div className='box-icon'>
            <div className='icon-list'>
              <nav>
                <ul>
                    <li>
                      <label htmlFor="fileInput" style={{display:'flex', alignItems:'center',justifyContent:'center' ,cursor:'pointer',fontSize:'23px'}}>
                        <CiImageOn />
                        <input
                          type="file"
                          id="fileInput"
                         style={{ display: "none" }}
                        accept="image/*" 
                        onChange={handleFileChange}
                        multiple 
                        />
                        <span style={{ position: 'absolute', marginTop: '50px', fontSize: '16px', color: '#c9a4a4', fontWeight: 'normal', marginLeft: '-5px' }}>{selectedFile?.length>0 ? selectedFile.length + " file" : ""}</span>     
                      </label>
                    </li>
                    <li><AiOutlineFileGif /></li>
                    <li><AiOutlineUnorderedList /></li>
                    <li><BsEmojiSmile /></li>
                    <li><SlCalender /></li>
                    <li><CiLocationOn /></li>
                  </ul>
              </nav>
            </div>
            <button onClick={postContentHandle}>Post</button>
          </div>
        </div>
              {/* Preview image
        {previewImage && (
        <div className="preview-image">
          <img src={previewImage} alt="Preview" />
        </div>
      )} */}
      </div>

      
      {/* <div>
        {sweetList && sweetList.map((item, index) => (
          <div key={index} className='post-content'>
            <SinglePost sweetData={item} selectedTab={selectedTab} resetData={fetchData}/>
          </div>
        ))}
      </div> */}

      {sweetList && sweetList.map((item, index) => (
    <div key={index} className='post-content'>
        <SinglePost sweetData={item} selectedTab={selectedTab} resetData={fetchData} />
    </div>
))}
        </div>
      ):(null)}

    </div>
  );
};

export default Post;