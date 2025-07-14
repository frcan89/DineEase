// src/pages/OrdersPage/OrdersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import { getUserRestaurantId } from '../../services/authService';
import Header from '../../components/Dashboard/Header';
import CreateOrderModal from '../../components/Dashboard/CreateOrderModal';
import { FaPlus, FaEye, FaSync } from 'react-icons/fa';
// Reutilizamos el CSS global y creamos uno específico si es necesario

// Helper para dar color a los estados
const getStatusColor = (status) => {
    switch (status) {
        case 'Pendiente': return '#F47C34';
        case 'En Preparación': return '#3498db';
        case 'Listo para Servir': return '#f1c40f';
        case 'Servido': return '#2ecc71';
        case 'Pagado': return '#5cb85c';
        case 'Cancelado': return '#e74c3c';
        default: return '#B0B0B0';
    }
};

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // ... (estados de paginación y filtros)

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        const restaurantId = getUserRestaurantId();
        if (!restaurantId) {
            setError("Restaurante no identificado.");
            setLoading(false);
            return;
        }
        try {
            // Aquí se pueden añadir los filtros desde el estado
            const params = { id_restaurante: restaurantId, limite: 20 };
            const data = await getOrders(params);
            setOrders(data.pedidos || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    const handleViewDetails = (orderId) => {
        navigate(`/dashboard/pedidos/${orderId}`);
    };

    return (
        <div className="page-container">
            <Header title="Gestión de Pedidos" />
            <div className="page-header-actions">
                {/* Filtros podrían ir aquí */}
                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                    <FaPlus /> Nuevo Pedido
                </button>
            </div>
            
            {loading && <p className="loading-message">Cargando pedidos...</p>}
            {error && <p className="error-message">{error}</p>}

            {!loading && !error && (
                <div className="responsive-table-wrapper">
                    <table className="responsive-table">
                        <thead>
                            <tr>
                                <th>ID Pedido</th>
                                <th>Mesa</th>
                                <th>Empleado</th>
                                <th>Subtotal</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id_pedido}>
                                    <td data-label="ID Pedido">#{order.id_pedido}</td>
                                    <td data-label="Mesa">{order.Mesa.numero || 'Para Llevar'}</td>
                                    <td data-label="Empleado">{order.empleado.nombre || 'N/A'}</td>
                                    <td data-label="Subtotal">
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(order.subtotal)}
                                    </td>
                                    <td data-label="Estado">
                                        <span style={{ 
                                            color: getStatusColor(order.estado),
                                            fontWeight: 'bold',
                                            backgroundColor: `${getStatusColor(order.estado)}20`, // Fondo con opacidad
                                            padding: '4px 8px',
                                            borderRadius: '4px'
                                        }}>
                                            {order.estado}
                                        </span>
                                    </td>
                                    <td data-label="Fecha">{new Date(order.fecha_creacion).toLocaleString()}</td>
                                    <td data-label="Acciones">
                                        <div className="action-btn-group">
                                            <button onClick={() => handleViewDetails(order.id_pedido)} className="btn btn-secondary action-btn" title="Ver Detalles">
                                                <FaEye /> Detalles
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            
            <CreateOrderModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={() => { setIsModalOpen(false); 
            fetchOrders(); }} />
            
        </div>
    );
};

export default OrdersPage;