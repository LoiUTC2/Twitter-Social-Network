import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import Navbar from './component/Navbar/Navbar';

function MessageLayout() {
    const navigate = useNavigate();
    const isAuthentication = localStorage.getItem("token") ? true : false;


    useEffect(() => {
        if (!isAuthentication) {
            navigate('/login');
        }
    }, [isAuthentication, navigate]);

    // Use a state to track if redirect has been performed
    const [redirected, setRedirected] = useState(false);

    useEffect(() => {
        if (!isAuthentication && !redirected) {
            navigate('/login');
            // Set redirected to true to prevent further redirects
            setRedirected(true);
        }
    }, [isAuthentication, navigate, redirected]);

    return (
        <div style={{ display: 'flex', backgroundColor: 'black', width: '100%' }}>
            <Navbar />
            <main style={{
                display: 'flex',
                backgroundColor: 'black',
                width: '100%',
                height: '100vh',
                // border: '1px solid rgb(105 84 84)',
                left: '0px',
                marginRight: '35px',
                // borderTop: 'none',
                // borderBottom: 'none',
                // paddingBottom: '20px',
                // paddingTop: '10px'
            }}>
                {isAuthentication ? <Outlet /> : null}
            </main>
        </div>
    );
}

export default MessageLayout
