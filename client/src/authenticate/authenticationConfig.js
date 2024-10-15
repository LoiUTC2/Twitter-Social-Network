import axios from 'axios';

const axiosClient = axios.create({
    // baseURL: 'http://localhost:5008/api',
    baseURL: 'http://localhost:5008/api',
    timeout: 20000, 
    headers: {
        'Content-Type': 'application/json'
      }
});

// Thêm interceptor để thiết lập token vào header của mỗi request
axiosClient.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token'); // Gọi hàm authorize để lấy token từ local storage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    // (error) => {
    //     return Promise.reject(error);
    // }
);

// Thêm interceptor để cập nhật token trong local storage nếu nó được trả về từ phản hồi
axiosClient.interceptors.response.use(
    (response) => {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token')
        }
        const { data } = response;
        if (data && data?.data?.token) {
            localStorage.setItem('token', data.data.token); 
        }
        return response;
    },
    // (error) => {
    //     return Promise.reject(error);
    // }
);
export default axiosClient;
