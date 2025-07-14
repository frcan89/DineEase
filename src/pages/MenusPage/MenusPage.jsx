// src/pages/MenusPage/MenusPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenus, deleteMenu } from '../../services/menuService';
import { getUserRestaurantId } from '../../services/authService';
import Header from '../../components/Dashboard/Header';
import MenuFormModal from '../../components/Dashboard/MenuFormModal';
import { FaEdit, FaTrash, FaPlus, FaListAlt } from 'react-icons/fa';
// Reutilizamos los estilos globales

const MenusPage = () => {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const navigate = useNavigate();

    const fetchMenus = useCallback(async () => {
        setLoading(true);
        setError(null);
        const restaurantId = getUserRestaurantId();
        if (!restaurantId) {
            setError("Restaurante no identificado.");
            setLoading(false);
            return;
        }
        try {
            const data = await getMenus({ id_restaurante: restaurantId });
            setMenus(data.menus || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMenus();
    }, [fetchMenus]);
    
    const handleManageItems = (menuId) => {
        navigate(`/dashboard/menus/${menuId}`);
    };

     const handleOpenCreateModal = () => {
        setEditingMenu(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (menu) => {
        setEditingMenu(menu);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMenu(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchMenus(); // Recargar la lista después de guardar
    };

    const handleDelete = async (menuId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este menú?")) {
            try {
                await deleteMenu(menuId);
                fetchMenus();
            } catch (err) {
                alert("Error al eliminar el menú: " + err.message);
            }
        }
    };
    
    const handleRestore = async (menuId) => {
        // ... (Implementar si es necesario)
    };


    return (
        <div className="page-container">
            <Header title="Gestión de Menús" />
            <div className="page-header-actions">
                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
                    <FaPlus /> Crear Menú
                </button>
            </div>
            {/* ... (loading/error) ... */}
            <div className="responsive-table-wrapper">
                <table className="responsive-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Precio Venta</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menus.map((menu) => (
                            <tr key={menu.id_menu}>
                                <td data-label="Nombre">{menu.nombre}</td>
                                <td data-label="Descripción">{menu.descripcion || 'N/A'}</td>
                                <td data-label="Precio Venta">
                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(menu.precio_venta)}
                                </td>
                                <td data-label="Estado">{menu.estado}</td>
                                <td data-label="Acciones">
                                    <div className="action-btn-group">
                                        <button onClick={() => handleManageItems(menu.id_menu)} className="btn btn-secondary action-btn" title="Gestionar Items">
                                            <FaListAlt /> Items
                                        </button>
                                        <button onClick={() => { setEditingMenu(menu); setIsModalOpen(true); }} className="btn btn-primary action-btn" title="Editar Menú">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(menu.id_menu)} className="btn btn-danger action-btn" title="Eliminar Menú">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <MenuFormModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                menu={editingMenu}
                onSave={handleSave}
            />
        </div>
    );
};

export default MenusPage;