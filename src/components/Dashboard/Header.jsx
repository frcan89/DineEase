// src/components/Dashboard/Header.jsx
import React from 'react';
import { FaBell } from 'react-icons/fa';
// Asume que los estilos del header están en DashboardLayout.css o en un Header.css dedicado
// import './Header.css';

const Header = ({ title, notificationCount = 0 }) => {
    return (
        <header className="dashboard-header">
            <h1>{title}</h1>
            {notificationCount > 0 && (
                <div className="notifications">
                    <FaBell />
                    {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
                </div>
            )}
        </header>
    );
};

export default Header;