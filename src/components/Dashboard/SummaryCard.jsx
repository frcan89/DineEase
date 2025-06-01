// src/components/Dashboard/SummaryCard.jsx
import React from 'react';
// Asume que los estilos de la card están en DashboardLayout.css o en un SummaryCard.css dedicado
// import './SummaryCard.css';

const SummaryCard = ({ title, value, icon }) => { // 'icon' es opcional
    return (
        <div className="summary-card">
            <h3>{title}</h3>
            <p>{value}</p>
            {/* {icon && <div className="card-icon">{icon}</div>} Podrías añadir un icono si quieres */}
        </div>
    );
};

export default SummaryCard;