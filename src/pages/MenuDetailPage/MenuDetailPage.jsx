// src/pages/MenuDetailPage/MenuDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMenuById, deleteMenuItem } from '../../services/menuService';
import Header from '../../components/Dashboard/Header';
import ItemMenuFormModal from '../../components/Dashboard/ItemMenuFormModal';
import { FaEdit, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';

const MenuDetailPage = () => {
    const { menuId } = useParams(); // Obtener el ID del menú de la URL
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);


    const fetchMenuDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMenuById(menuId);
            setMenu(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [menuId]);

    useEffect(() => {
        fetchMenuDetails();
    }, [fetchMenuDetails]);

        // --- MANEJADORES DE EVENTOS ---
    
    const handleOpenAddItemModal = () => {
        setEditingItem(null);
        setIsItemModalOpen(true);
    };

    const handleOpenEditItemModal = (item) => {
        setEditingItem(item);
        setIsItemModalOpen(true);
    };

    const handleCloseItemModal = () => {
        setIsItemModalOpen(false);
        setEditingItem(null);
    };

    const handleSaveItem = () => {
        handleCloseItemModal();
        fetchMenuDetails(); // Recargar los detalles del menú
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm("¿Seguro que quieres quitar este item del menú?")) {
            try {
                await deleteMenuItem(itemId);
                fetchMenuDetails(); // Recargar los detalles del menú
            } catch (err) {
                alert("Error: " + err.message);
            }
        }
    };

    

    if (loading) return <p className="loading-message">Cargando detalles del menú...</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!menu) return <p>Menú no encontrado.</p>;

    return (
        <div className="page-container">
            <Link to="/dashboard/menus" className="btn btn-secondary" style={{ marginBottom: '20px' }}>
                <FaArrowLeft /> Volver a Menús
            </Link>
            <Header title={`Gestionando Menú: "${menu.nombre}"`} />
            <p>{menu.descripcion}</p>

            <div className="page-header-actions">
                <button onClick={() => handleOpenAddItemModal()} className="btn btn-primary">
                    <FaPlus /> Añadir Item al Menú
                </button>
            </div>

            <div className="responsive-table-wrapper">
                <table className="responsive-table">
                    <thead>
                        <tr>
                            <th>Receta</th>
                            <th>Precio del Item</th>
                            <th>Disponible</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menu.items.map((item) => (
                            <tr key={item.id_item_menu}>
                                <td data-label="Receta">{item.Recetum.nombre || 'Receta no encontrada'}</td>
                                <td data-label="Precio">
                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.precio_item)}
                                </td>
                                <td data-label="Disponible">
                                    <span className={`status-indicator ${item.disponible ? 'status-ok' : 'status-out'}`}>
                                        {item.disponible ? 'Sí' : 'No'}
                                    </span>
                                </td>
                                <td data-label="Acciones">
                                    <div className="action-btn-group">
                                        <button onClick={() => handleOpenEditItemModal(item)} className="btn btn-primary action-btn" title="Editar Item">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDeleteItem(item.id_item_menu)} className="btn btn-danger action-btn" title="Quitar del Menú">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        
                    </tbody>
                </table>
            </div>
            {/* Modal para añadir/editar items */}
            <ItemMenuFormModal
                isOpen={isItemModalOpen}
                onClose={handleCloseItemModal}
                menuId={menuId}
                item={editingItem}
                onSave={handleSaveItem}
            />
        </div>
    );
};

export default MenuDetailPage;