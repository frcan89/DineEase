// src/pages/Dashboard/DashboardHomePage.jsx
import React from 'react';
import Header from '../../components/Dashboard/Header';
import SummaryCard from '../../components/Dashboard/SummaryCard';
import ChartCard from '../../components/Dashboard/ChartCard';

const DashboardHomePage = () => {
    // Estos datos vendrían de una API en una aplicación real
    const summaryData = [
        { title: 'Ventas Diarias', value: '$5,250.00' },
        { title: 'Pedidos', value: '125' },
        { title: 'Reservas', value: '30' },
    ];

    return (
        <>
            <Header title="Dashboard" notificationCount={3} />
            <div className="summary-cards-container">
                {summaryData.map((card, index) => (
                    <SummaryCard key={index} title={card.title} value={card.value} />
                ))}
            </div>
            <div className="charts-container">
                <ChartCard title="Tendencias de Ventas">
                    {/* Aquí iría un componente de gráfico real, ej: <SalesTrendChart data={...} /> */}
                    <div className="chart-placeholder">Gráfico de tendencias de ventas</div>
                </ChartCard>
                <ChartCard title="Estado de Pedidos">
                    {/* Aquí iría un componente de gráfico real, ej: <OrderStatusChart data={...} /> */}
                    <div className="chart-placeholder">Gráfico de estado de pedidos</div>
                </ChartCard>
            </div>
        </>
    );
};

export default DashboardHomePage;