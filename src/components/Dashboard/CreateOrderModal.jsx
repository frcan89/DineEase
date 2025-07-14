// src/components/Dashboard/CreateOrderModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { createOrder } from '../../services/orderService';
import { getMenus } from '../../services/menuService';
import { getTables } from '../../services/tableService'; // Asumiendo que existe
import { getUserRestaurantId } from '../../services/authService';
import { debounce } from 'lodash';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import './CreateOrderModal.css'; // Un CSS específico para este modal complejo

const CreateOrderModal = ({ isOpen, onClose, onSave }) => {
    // === ESTADOS ===
    const [idMesa, setIdMesa] = useState('');
    const [items, setItems] = useState([]); // El "carrito" del pedido
    const [availableTables, setAvailableTables] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Estados para la búsqueda de menús
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // --- CARGA DE DATOS INICIAL ---
    useEffect(() => {
        if (isOpen) {
            // Cargar mesas disponibles al abrir el modal
            const fetchInitialData = async () => {
                const restaurantId = getUserRestaurantId();
                if (!restaurantId) return;
                try {
                    const tablesData = await getTables({ id_restaurante: restaurantId, estado: 'Libre' });
                    setAvailableTables(tablesData.mesas || []);                    
                } catch (err) {
                    console.error("Error al cargar mesas:", err);
                }
            };
            fetchInitialData();

            // Resetear el estado del modal al abrir
            setIdMesa('');
            setItems([]);
            setError('');
            setSearchQuery('');
            setSearchResults([]);
        }
    }, [isOpen]);

    // --- LÓGICA DE BÚSQUEDA DE MENÚS ---
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
        if (searchQuery && restaurantId) {
            setIsSearching(true);
            debouncedSearch(searchQuery, restaurantId);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, debouncedSearch]);


    // --- MANEJADORES DE EVENTOS ---

    const handleAddItem = (menu) => {
        const existingItemIndex = items.findIndex(item => item.id_menu === menu.id_menu);
        if (existingItemIndex > -1) {
            // Si el item ya existe, incrementa la cantidad
            const updatedItems = [...items];
            updatedItems[existingItemIndex].cantidad += 1;
            setItems(updatedItems);
        } else {
            // Si es nuevo, lo añade al carrito
            setItems(prev => [...prev, {
                id_menu: menu.id_menu,
                nombre: menu.nombre,
                precio_venta: menu.precio_venta,
                cantidad: 1,
                notas_item: '',
            }]);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        if (field === 'cantidad') {
            const newQuantity = parseInt(value, 10);
            if (newQuantity > 0) {
                updatedItems[index].cantidad = newQuantity;
            } else {
                // Si la cantidad es 0 o inválida, no actualizamos (o eliminamos, ver handleRemoveItem)
                return;
            }
        } else {
            updatedItems[index][field] = value;
        }
        setItems(updatedItems);
    };

    const handleRemoveItem = (index) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const calculateSubtotal = () => {
        return items.reduce((total, item) => total + (item.precio_venta * item.cantidad), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (items.length === 0) {
            setError("Debe añadir al menos un item al pedido.");
            return;
        }

        setIsLoading(true);
        setError('');

        const payload = {
            id_mesa: idMesa ? parseInt(idMesa, 10) : null,
            items: items.map(item => ({
                id_menu: item.id_menu,
                cantidad: item.cantidad,
                notas_item: item.notas_item || null,
            })),
        };

        try {
            await createOrder(payload);
            onSave(); // Notifica al padre para recargar y cerrar
        } catch (err) {
            setError(err.message || "Ocurrió un error al crear el pedido.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '700px' }}>
                <button className="modal-close-btn" onClick={onClose} disabled={isLoading}><FaTimes /></button>
                <h2>Nuevo Pedido</h2>
                {error && <p className="modal-error-message">{error}</p>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="id_mesa">Mesa (Opcional, para llevar)</label>
                        <select id="id_mesa" value={idMesa} onChange={(e) => setIdMesa(e.target.value)} disabled={isLoading}>
                            <option value="">-- Para llevar / Domicilio --</option>
                            {availableTables.map(table => (
                                <option key={table.id_mesa} value={table.id_mesa}>Mesa {table.numero}</option>
                            ))}                            
                        </select>
                    </div>

                    <hr className="form-divider" />
                    
                    {/* Buscador de Menús */}
                    <div className="form-group">
                        <label>Añadir Items al Pedido</label>
                        <div className="ingredient-search-wrapper">
                            <input
                                type="text"
                                placeholder="Buscar menú por nombre..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={isLoading}
                            />
                            {isSearching && <div className="search-spinner"></div>}
                            {searchResults.length > 0 && (
                                <ul className="search-results">
                                    {searchResults.map(menu => (
                                        <li key={menu.id_menu} onClick={() => handleAddItem(menu)}>
                                            {menu.nombre} - {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(menu.precio_venta)}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    
                    {/* Carrito de Pedido */}
                    <div className="order-items-list">
                        {items.length === 0 ? (
                            <p className="empty-cart-message">El pedido está vacío.</p>
                        ) : (
                            items.map((item, index) => (
                                <div key={item.id_menu} className="order-item">
                                    <div className="item-details">
                                        <span className="item-name">{item.nombre}</span>
                                        <span className="item-price">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.precio_venta)}</span>
                                    </div>
                                    <div className="item-controls">
                                        <input
                                            type="number"
                                            className="item-quantity-input"
                                            value={item.cantidad}
                                            onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                                            min="1"
                                        />
                                        <input
                                            type="text"
                                            className="item-notes-input"
                                            placeholder="Notas..."
                                            value={item.notas_item}
                                            onChange={(e) => handleItemChange(index, 'notas_item', e.target.value)}
                                        />
                                        <button type="button" className="btn-remove-ingredient" onClick={() => handleRemoveItem(index)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {items.length > 0 && (
                        <div className="order-summary">
                            <strong>Subtotal:</strong>
                            <span>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(calculateSubtotal())}</span>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading || items.length === 0}>
                            {isLoading ? 'Creando...' : 'Crear Pedido'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOrderModal;