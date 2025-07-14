// src/pages/OrderDetailPage/OrderDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, deleteOrderItem, updateOrderStatus, cancelOrder } from '../../services/orderService';
import ItemOrderFormModal from '../../components/Dashboard/ItemOrderFormModal'; 
import PaymentModal from '../../components/Dashboard/PaymentModal';
import Header from '../../components/Dashboard/Header';
import { FaArrowLeft, FaPlus, FaTimes, FaMoneyBillWave, FaEdit, FaTrash } from 'react-icons/fa';

// Función helper para los colores de estado
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

//====================================================================
// Componente Interno para la Tabla de Items del Pedido
//====================================================================
const OrderItemsTable = ({ items, canBeModified, onEdit, onDelete }) => {
    if (!items || items.length === 0) {
        return (
            <div className="empty-state">
                <p>Este pedido no tiene items.</p>
            </div>
        );
    }

    return (
        <div className="responsive-table-wrapper">
            <table className="responsive-table">
                <thead>
                    <tr>
                        <th>Item (Receta)</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                        {canBeModified && <th>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id_item_pedido}>
                            <td data-label="Item" className="item-name-cell">
                                <strong>{item.Menu.nombre || 'Nombre no disponible'}</strong>
                                <br />
                                {item.notas_item && ( 
                                    <span className="order-item-notes">Notas: {item.notas_item}</span>
                                )}
                            </td>
                            <td data-label="Cantidad">{item.cantidad}</td>
                            <td data-label="Precio Unitario">
                                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.precio_unitario_momento)}
                            </td>
                            <td data-label="Subtotal">
                                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.cantidad * item.precio_unitario_momento)}
                            </td>
                            {canBeModified && (
                                <td data-label="Acciones">
                                    <div className="action-btn-group">
                                        <button onClick={() => onEdit(item)} className="btn btn-primary action-btn" title="Editar Item">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => onDelete(item.id_item_pedido)} className="btn btn-danger action-btn" title="Quitar del Pedido">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


//====================================================================
// Componente Principal de la Página de Detalles del Pedido
//====================================================================
const OrderDetailPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para los modales
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const fetchOrderDetails = useCallback(async () => {
        // No resetear 'loading' a true si solo estamos recargando
        // setLoading(true); 
        try {
            const data = await getOrderById(orderId);
            setOrder(data);
        } catch (err) {
            setError(err.message || "Error al cargar los detalles del pedido.");
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    const handleUpdateStatus = async (newStatus) => {
        if (!window.confirm(`¿Confirmas cambiar el estado a "${newStatus}"?`)) return;
        try {
            await updateOrderStatus(orderId, newStatus);
            fetchOrderDetails(); // Recargar para ver el cambio
        } catch (err) {
            alert("Error al actualizar el estado: " + err.message);
        }
    };
    
    const handleCancelOrder = async () => {
        if (!window.confirm("¿Estás seguro de que quieres CANCELAR este pedido? Esta acción no se puede deshacer.")) return;
        try {
            await cancelOrder(orderId);
            fetchOrderDetails();
        } catch (err) {
            alert("Error al cancelar el pedido: " + err.message);
        }
    };

    const handleDeleteItem = async (orderItemId) => {
        if (window.confirm("¿Seguro que quieres quitar este item del pedido?")) {
            try {
                await deleteOrderItem(orderItemId);
                fetchOrderDetails();
            } catch (err) {
                alert("Error al quitar el item: " + err.message);
            }
        }
    };

    const handleOpenAddItemModal = () => {
        setEditingItem(null); // Modo creación
        setIsItemModalOpen(true);
    };

    const handleOpenEditItemModal = (item) => {
        setEditingItem(item); // Modo edición
        setIsItemModalOpen(true);
    };

    const handleCloseItemModal = () => {
        setIsItemModalOpen(false);
        setEditingItem(null);
    };

    const handleSaveItem = () => {
        handleCloseItemModal();
        fetchOrderDetails(); // Recargar los detalles del pedido
    };

    // --- MANEJADORES PARA EL MODAL DE PAGO ---
    const handleOpenPaymentModal = () => {
        setIsPaymentModalOpen(true);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
    };

    const handlePaymentSuccess = () => {
        handleClosePaymentModal();
        fetchOrderDetails(); // Recargar el pedido para ver su estado actualizado a "Pagado"
    };

    if (loading) return <p className="loading-message">Cargando detalles del pedido...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!order) return <p>Pedido no encontrado.</p>;

    const canBeModified = !['Pagado', 'Cancelado'].includes(order.estado);

    return (
        <div className="page-container">
            <Link to="/dashboard/pedidos" className="btn btn-secondary" style={{ marginBottom: '20px' }}>
                <FaArrowLeft /> Volver a Pedidos
            </Link>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Header title={`Pedido #${order.id_pedido}`} />
                <span className="status-indicator" style={{ backgroundColor: `${getStatusColor(order.estado)}20`, color: getStatusColor(order.estado), fontSize: '16px' }}>
                    {order.estado}
                </span>
            </div>
            {/* Aquí puedes añadir más detalles como Mesa, Cliente, Empleado */}
            <p>Mesa: <strong>{order.Mesa?.numero || 'Para Llevar'}</strong> | Atendido por: <strong>{order.empleado?.nombre || 'N/A'}</strong></p>

            <hr className="form-divider" />

            {/* Acciones del Pedido */}
            <div className="page-header-actions">
                {canBeModified && (
                    <>
                        <button onClick={() => handleOpenAddItemModal()} className="btn btn-primary"><FaPlus /> Añadir Item</button>
                        <button onClick={() => handleUpdateStatus('En Preparación')} className="btn btn-secondary">A 'En Preparación'</button>
                        <button onClick={() => handleUpdateStatus('Listo para Servir')} className="btn btn-secondary">A 'Listo'</button>
                        <button onClick={() => handleUpdateStatus('Servido')} className="btn btn-secondary">A 'Servido'</button>
                    </>
                )}
                {order.estado === 'Servido' && (
                    <button onClick={handleOpenPaymentModal} className="btn btn-success"><FaMoneyBillWave /> Registrar Pago</button>
                )}
                {canBeModified && (
                    <button onClick={handleCancelOrder} className="btn btn-danger"><FaTimes /> Cancelar Pedido</button>
                )}
            </div>

            <h3>Items del Pedido</h3>
            <OrderItemsTable 
                items={order.items}
                canBeModified={canBeModified}
                onEdit={(item) => {handleOpenEditItemModal(item)}}
                onDelete={handleDeleteItem}
            />

            <div className="order-summary" style={{marginTop: '20px'}}>
                <strong>Subtotal del Pedido:</strong>
                <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(order.subtotal)}</span>
            </div>

            
            {/* --- RENDERIZADO DEL MODAL --- */}
            <ItemOrderFormModal
                isOpen={isItemModalOpen}
                onClose={handleCloseItemModal}
                orderId={orderId}
                item={editingItem}
                onSave={handleSaveItem}
            />
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={handleClosePaymentModal}
                order={order}
                onSave={handlePaymentSuccess}
            />
        </div>
    );
};

export default OrderDetailPage;