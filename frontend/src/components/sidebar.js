
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/sidebar.css';
import { useNavigate } from "react-router-dom";
import logo from '../images/promanage.png'
import ReactDOM from 'react-dom';


const Sidebar = () => {
    const token = sessionStorage.getItem('token')
    const navigate = useNavigate()
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirmation(true);
    };

    const confirmLogout = () => {
        sessionStorage.removeItem('token');
        navigate('/');
    };

    const cancelLogout = () => {
        setShowLogoutConfirmation(false);
    };

    return (
        <aside className="sidebar">
            <div>
                <div className="logo"><img src={logo} />Pro Manage</div>
                <nav>
                    <ul>
                        <li>
                            <NavLink to="/board" activeClassName="active"><i className="fa-solid fa-table-cells-large"></i>Board</NavLink>
                        </li>
                        <li>
                            <NavLink to="/analytics" activeClassName="active"><i className="fa-solid fa-database"></i>Analytics</NavLink>
                        </li>
                        <li>
                            <NavLink to="/settings" activeClassName="active"><i className="fa-solid fa-gear"></i>Settings</NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
            <div className="logout">
                <button onClick={handleLogout}><i className="fa-solid fa-right-to-bracket"></i> Log out</button>
            </div>
            {showLogoutConfirmation &&
                ReactDOM.createPortal(
                    <div className="logout-confirmation-overlay">
                        <div className="logout-confirmation">
                            <p>Are you sure you want to Logout?</p>
                            <button className="confirm-button" onClick={confirmLogout}>Yes, Logout</button>
                            <button className="cancel-button" onClick={cancelLogout}>Cancel</button>
                        </div>
                    </div>,
                    document.body
                )}
        </aside>
    );
};

export default Sidebar;
