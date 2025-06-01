// src/components/Dashboard/ChartCard.jsx
import React from 'react';
// Asume que los estilos están en DashboardLayout.css o en un ChartCard.css dedicado
// import './ChartCard.css';

const ChartCard = ({ title, children }) => {
    return (
        <div className="chart-card">
            <h3>{title}</h3>
            <div className="chart-content">
                {children ? children : <div className="chart-placeholder">Gráfico aquí</div>}
            </div>
        </div>
    );
};

export default ChartCard;