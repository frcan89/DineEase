// src/components/Dashboard/ItemOrderFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { addItemToOrder, updateOrderItem } from '../../services/orderService';
import { getMenus } from '../../services/menuService';
import { getUserRestaurantId } from '../../services/authService';
import { debounce } from 'lodash';
import { FaTimes } from 'react-icons/fa';
// Reutilizamos el CSS del modal de recetas, ya que tiene el buscador que necesitamos
//import './RecipeFormModal.css';

const ItemOrderFormModal = ({ isOpen, onClose, orderId, item: editingItem, onSave }) => {
    // === ESTADOS ===
    const initialFormState = {
        id_menu: '',
        nombre_menu: '',
        cantidad: 1,
        notas_item: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    // Estados para búsqueda de menús
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const isEditMode = Boolean(editingItem);

    // --- CARGA DE DATOS Y RESETEO ---
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && editingItem) {
                // Modo Edición: precargar datos del item existente
                setFormData({
                    id_menu: editingItem.Menu?.id_menu, // Asumiendo estructura anidada
                    nombre_menu: editingItem.Menu?.nombre || 'Nombre no disponible',
                    cantidad: editingItem.cantidad || 1,
                    notas_item: editingItem.notas_item || '',
                });
            } else {
                // Modo Creación: resetear el formulario
                setFormData(initialFormState);
            }
            // Limpiar estados al abrir
            setError('');
            setFormErrors({});
            setSearchQuery('');
            setSearchResults([]);
        }
    }, [isOpen, editingItem, isEditMode]);

    // --- LÓGICA DE BÚSQUEDA ---
    const debouncedSearch = useCallback(
        debounce(async (query, restaurantId) => {
            if (query.length < 2) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }
            try {
                const data = await getMenus({ nombre: query, limite: 5, id_restaurante: restaurantId, estado: 'Activo' });
                setSearchResults(data.menus || []);
            } catch (err) {
                console.error("Error buscando menús:", err);
            } finally {
                setIsSearching(false);
            }
        }, 400),
        []
    );

    useEffect(() => {
        const restaurantId = getUserRestaurantId();
        // Solo buscar si hay query, restaurante y NO estamos en modo edición
        if (searchQuery && restaurantId && !isEditMode) {
            setIsSearching(true);
            debouncedSearch(searchQuery, restaurantId);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, debouncedSearch, isEditMode]);

    // --- MANEJADORES DE EVENTOS ---
    const handleSelectMenu = (menu) => {
        setFormData(prev => ({ ...prev, id_menu: menu.id_menu, nombre_menu: menu.nombre }));
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const errors = {};
        if (!isEditMode && !formData.id_menu) {
            errors.menu = "Debe seleccionar un menú.";
        }
        const cantidadNum = parseInt(formData.cantidad, 10);
        if (isNaN(cantidadNum) || cantidadNum <= 0) {
            errors.cantidad = "La cantidad debe ser un número mayor a cero.";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setError('');

        try {
            if (isEditMode) {
                // En edición, solo se actualiza cantidad y notas
                const payload = {
                    cantidad: parseInt(formData.cantidad, 10),
                    notas_item: formData.notas_item || null,
                };
                await updateOrderItem(editingItem.id_item_pedido, payload);
            } else {
                // En creación, se añade un nuevo item al pedido
                const payload = {
                    id_menu: formData.id_menu,
                    cantidad: parseInt(formData.cantidad, 10),
                    notas_item: formData.notas_item || null,
                };
                await addItemToOrder(orderId, payload);
            }
            onSave(); // Notifica al padre para recargar y cerrar
        } catch (err) {
            setError(err.message || "Ocurrió un error al guardar el item.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-btn" onClick={onClose} disabled={isLoading}><FaTimes /></button>
                <h2>{isEditMode ? 'Editar Item del Pedido' : 'Añadir Item al Pedido'}</h2>
                {error && <p className="modal-error-message">{error}</p>}
                
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="menu_search">Menú *</label>
                        {isEditMode ? (
                            <input type="text" value={formData.nombre_menu} disabled />
                        ) : (
                            <div className="ingredient-search-wrapper">
                                <input
                                    type="text"
                                    id="menu_search"
                                    placeholder="Buscar menú por nombre..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    disabled={isLoading}
                                />
                                {isSearching && <div className="search-spinner"></div>}
                                {searchResults.length > 0 && (
                                    <ul className="search-results">
                                        {searchResults.map(menu => (
                                            <li key={menu.id_menu} onClick={() => handleSelectMenu(menu)}>
                                                {menu.nombre}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {formData.nombre_menu && <p className="selected-item-text">Seleccionado: <strong>{formData.nombre_menu}</strong></p>}
                            </div>
                        )}
                        {formErrors.menu && <span className="form-error">{formErrors.menu}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="cantidad">Cantidad *</label>
                        <input type="number" id="cantidad" name="cantidad" value={formData.cantidad} onChange={handleChange} min="1" disabled={isLoading} />
                        {formErrors.cantidad && <span className="form-error">{formErrors.cantidad}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="notas_item">Notas (Opcional)</label>
                        <textarea id="notas_item" name="notas_item" value={formData.notas_item} onChange={handleChange} rows="3" disabled={isLoading} placeholder="Ej: Sin cebolla, extra picante..."></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Añadir al Pedido')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemOrderFormModal;