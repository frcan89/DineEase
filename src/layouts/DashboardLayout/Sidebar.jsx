// src/layouts/DashboardLayout/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Importa useNavigate
import {
    FaHome, FaUtensils, FaCalendarAlt, FaBook, FaChartBar, FaCog, FaSignOutAlt, FaUserAlt} from 'react-icons/fa';
import { logout as authLogout } from '../../services/authService'; // Importa tu función de logout

// Estilos: asume que los estilos del sidebar están en DashboardLayout.css o en un Sidebar.css dedicado
// import './Sidebar.css'; // Si tienes estilos específicos para el sidebar

const menuItems = [
    { path: '/dashboard', icon: <FaHome />, label: 'Inicio' },
    { path: '/dashboard/pedidos', icon: <FaUtensils />, label: 'Pedidos' },
    { path: '/dashboard/reservas', icon: <FaCalendarAlt />, label: 'Reservas' },
    { path: '/dashboard/menu', icon: <FaBook />, label: 'Menú' },
    { path: '/dashboard/analiticas', icon: <FaChartBar />, label: 'Analíticas' },
    { path: '/dashboard/usuarios', icon: <FaUserAlt />, label: 'Usuarios' },
    { path: '/dashboard/configuracion', icon: <FaCog />, label: 'Configuración' },
];

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authLogout(); // Llama a la función de logout de authService
        navigate('/login'); // Redirige al usuario a la página de login
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>DineEase</h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => (isActive ? 'active' : '')}
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            {/* Botón de Cerrar Sesión */}
            <div className="sidebar-logout"> {/* Contenedor para el botón de logout */}
                <button onClick={handleLogout} className="logout-button">
                    <FaSignOutAlt />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;