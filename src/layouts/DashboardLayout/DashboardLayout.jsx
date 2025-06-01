// src/layouts/DashboardLayout/DashboardLayout.jsx
import React from 'react';
import Sidebar from './Sidebar'; // Ajusta la ruta si es necesario
import './DashboardLayout.css'; // Estilos para el layout

const DashboardLayout = ({ children }) => {
    return (
        <div className="dashboard-layout"> {/* Contenedor principal flex */}
            <Sidebar />
            <main className="main-content-area">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;