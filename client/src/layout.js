import { Outlet, useNavigate } from "react-router-dom"
import Menu from "./component/Menu";
import Navbar from "./component/Navbar/Navbar"
import { useEffect, useState } from "react";
const Layout = ({ children }) => {
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
        <div style={{ display: 'flex', backgroundColor:'black' }}>
            <Navbar />
            <main>
                {isAuthentication ? <Outlet/> : null}
            </main>
            <Menu />
        </div>
    );
};

export default Layout;