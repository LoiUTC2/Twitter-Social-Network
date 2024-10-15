import './App.scss';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import {jwtDecode} from 'jwt-decode';

import LoginPage from './pages/LoginPage';
import NotFound from './pages/NotFound';
import CommonToastContainer from './ultis/ToastNoti';
import HomePage from './pages/HomePage';
import SweetDetail from './pages/SweetDetail';
import Layout from './layout';
import MessageLayout from './messageLayout';
import MessagePage from './pages/MessagePage';
import NotificationPage from './pages/NotificationPage';
import ProfilePage from './pages/ProfilePage';
import useWebSocket from './authenticate/Websocket.config';

const App = () => {
  const token = localStorage.getItem("token");
  const userId = token ? jwtDecode(token).userId : null;
  const { client, isConnected } = useWebSocket('ws://localhost:8080');

  useEffect(() => {
    if (!client) return;

    const handleMessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      if (receivedMessage?.userId === userId && receivedMessage?.type === "Notify") {
        toast.info(receivedMessage.content);
      }
    };

    client.onmessage = handleMessage;

    return () => {
      client.onmessage = null;
    };
  }, [client, userId]);

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <CommonToastContainer />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/messages/:id" element={<MessageLayout />}>
            <Route index element={<MessagePage />} />
          </Route>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/notifications" element={<NotificationPage />} />
            <Route path="/status/:id" element={<SweetDetail />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
