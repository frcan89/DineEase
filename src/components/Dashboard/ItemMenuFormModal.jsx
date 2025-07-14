// src/components/Dashboard/ItemMenuFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { addItemToMenu, updateMenuItem } from '../../services/menuService';
import { getRecipes } from '../../services/recipeService'; // Para buscar recetas
import { getUserRestaurantId } from '../../services/authService';
import { debounce } from 'lodash';
import { FaTimes } from 'react-icons/fa';
// Asumimos que el CSS global o RecipeFormModal.css ya define los estilos del buscador
//import './RecipeFormModal.css'; // Reutilizamos el CSS del modal de recetas

const ItemMenuFormModal = ({ isOpen, onClose, menuId, item: editingItem, onSave }) => {
    const initialFormState = {
        id_receta: '',
        nombre_receta: '', // Solo para mostrar en el UI
        precio_item: '',
        disponible: true,
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    // Estados para la búsqueda de recetas
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const isEditMode = Boolean(editingItem);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && editingItem) {
                setFormData({
                    id_receta: editingItem.id_receta,
                    nombre_receta: editingItem.Recetum.nombre || 'Receta no encontrada',
                    precio_item: editingItem.precio_item || '',
                    disponible: editingItem.disponible !== undefined ? editingItem.disponible : true,
                });
            } else {
                setFormData(initialFormState);
            }
            // Resetear estados al abrir
            setSearchQuery('');
            setSearchResults([]);
            setError('');
            setFormErrors({});
        }
    }, [isOpen, editingItem, isEditMode]);

    const debouncedSearch = useCallback(
        debounce(async (query, restaurantId) => {
            if (query.length < 2) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }
            try {
                const data = await getRecipes({ nombre: query, limite: 5, id_restaurante: restaurantId });
                setSearchResults(data.recetas || []);
            } catch (err) {
                console.error("Error buscando recetas:", err);
            } finally {
                setIsSearching(false);
            }
        }, 400),
        []
    );

    useEffect(() => {
        const restaurantId = getUserRestaurantId();
        if (searchQuery && restaurantId && !isEditMode) { // Solo buscar si no estamos en modo edición
            setIsSearching(true);
            debouncedSearch(searchQuery, restaurantId);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, debouncedSearch, isEditMode]);

    const handleSelectRecipe = (recipe) => {
        setFormData(prev => ({ ...prev, id_receta: recipe.id_receta, nombre_receta: recipe.nombre }));
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validate = () => {
        const errors = {};
        if (!formData.id_receta) errors.receta = "Debe seleccionar una receta.";
        if (!formData.precio_item || isNaN(parseFloat(formData.precio_item)) || parseFloat(formData.precio_item) < 0) {
            errors.precio_item = "El precio del item es obligatorio y debe ser un número válido.";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setError('');

        // En modo edición, solo se pueden cambiar precio y disponibilidad
        const payload = isEditMode
            ? {
                precio_item: parseFloat(formData.precio_item),
                disponible: formData.disponible,
              }
            : {
                id_receta: formData.id_receta,
                precio_item: parseFloat(formData.precio_item),
                disponible: formData.disponible,
              };

        try {
            if (isEditMode) {
                await updateMenuItem(editingItem.id_item_menu, payload);
            } else {
                await addItemToMenu(menuId, payload);
            }
            onSave();
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
                <h2>{isEditMode ? 'Editar Item del Menú' : 'Añadir Item al Menú'}</h2>
                {error && <p className="modal-error-message">{error}</p>}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="receta">Receta *</label>
                        {isEditMode ? (
                            <input type="text" value={formData.nombre_receta} disabled />
                        ) : (
                            <div className="ingredient-search-wrapper">
                                <input
                                    type="text"
                                    id="receta"
                                    placeholder="Buscar receta..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {isSearching && <div className="search-spinner"></div>}
                                {searchResults.length > 0 && (
                                    <ul className="search-results">
                                        {searchResults.map(r => (
                                            <li key={r.id_receta} onClick={() => handleSelectRecipe(r)}>
                                                {r.nombre}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {formData.nombre_receta && <p className="selected-item-text">Seleccionado: <strong>{formData.nombre_receta}</strong></p>}
                            </div>
                        )}
                        {formErrors.receta && <span className="form-error">{formErrors.receta}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="precio_item">Precio de Venta del Item *</label>
                        <input type="number" id="precio_item" name="precio_item" value={formData.precio_item} onChange={handleChange} step="0.01" min="0" disabled={isLoading} />
                        {formErrors.precio_item && <span className="form-error">{formErrors.precio_item}</span>}
                    </div>

                    <div className="form-group form-group-checkbox">
                        <input type="checkbox" id="disponible" name="disponible" checked={formData.disponible} onChange={handleChange} disabled={isLoading} />
                        <label htmlFor="disponible">Disponible para la venta</label>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : 'Guardar Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemMenuFormModal;