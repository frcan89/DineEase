// src/components/Dashboard/RecipeFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getRecipeById, createRecipe, updateRecipe } from '../../services/recipeService';
import { getProducts } from '../../services/productService';
import { getUserRestaurantId } from '../../services/authService';
import { debounce } from 'lodash';
import { FaTimes, FaTrash } from 'react-icons/fa';
// Importa el CSS global si no lo has hecho en App.jsx/main.jsx
// O un CSS específico para este modal si lo creas.
// Asumimos que los estilos .modal-*, .form-*, .btn-* están definidos globalmente.
import '../../styles/global.css'; // Asegúrate de que este CSS contenga los estilos necesarios
//import './RecipeFormModal.css'; // Crearemos este CSS específico para el modal de recetas

const RecipeFormModal = ({ isOpen, onClose, recipeId, onSave }) => {
    // === ESTADOS DEL COMPONENTE ===
    const initialFormState = { nombre: '', descripcion: '', tiempo_preparacion: '', instrucciones: '', porciones: '1', precio_costo: '' };
    const [formData, setFormData] = useState(initialFormState);
    const [ingredients, setIngredients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    // Estados para la búsqueda de ingredientes
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const isEditMode = Boolean(recipeId);

    // === LÓGICA DE CARGA DE DATOS ===
    useEffect(() => {
        // Carga la receta completa si estamos en modo edición
        if (isEditMode && isOpen) {
            const fetchRecipe = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const recipeData = await getRecipeById(recipeId);
                    setFormData({
                        nombre: recipeData.nombre || '',
                        descripcion: recipeData.descripcion || '',
                        tiempo_preparacion: recipeData.tiempo_preparacion || '',
                        instrucciones: recipeData.instrucciones || '',
                        porciones: recipeData.porciones || '1',
                        precio_costo: recipeData.precio_costo || ''
                    });
                    const mappedIngredients = (recipeData.ingredientes || []).map(ing => ({
                        id_producto: ing.id_producto,
                        nombre: ing.nombre || 'Producto desconocido',
                        cantidad: ing.detallesIngrediente.cantidad,
                        unidad_medida: ing.detallesIngrediente.unidad_medida_receta || ing.unidad_medida,
                    }));
                    setIngredients(mappedIngredients);
                } catch (err) {
                    setError('Error al cargar la receta. ' + err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchRecipe();
        } else if (isOpen) {
            // Resetea el formulario para el modo creación
            setFormData(initialFormState);
            setIngredients([]);
            setError('');
            setFormErrors({});
        }
    }, [isOpen, recipeId, isEditMode]);

    // === LÓGICA DE BÚSQUEDA DE INGREDIENTES ===
    const debouncedSearch = useCallback(
        debounce(async (query, restaurantId) => {
            if (query.length < 2) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }
            try {
                const data = await getProducts({ nombre: query, limite: 5, id_restaurante: restaurantId });
                setSearchResults(data.productos || []);
            } catch (err) {
                console.error("Error buscando productos:", err);
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


    // === MANEJADORES DE EVENTOS ===
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleAddIngredient = (product) => {
        if (!ingredients.some(ing => ing.id_producto === product.id_producto)) {
            setIngredients(prev => [...prev, {
                id_producto: product.id_producto,
                nombre: product.nombre,
                cantidad: '',
                unidad_medida: product.unidad_medida || '',
            }]);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleIngredientChange = (index, field, value) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients[index][field] = value;
        setIngredients(updatedIngredients);
    };
    
    const handleRemoveIngredient = (index) => {
        setIngredients(prev => prev.filter((_, i) => i !== index));
    };

    const validate = () => {
        const errors = {};
        if (!formData.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
        if (ingredients.length === 0) errors.ingredientes = "Debe añadir al menos un ingrediente.";
        ingredients.forEach((ing, index) => {
            if (!ing.cantidad || isNaN(parseFloat(ing.cantidad)) || parseFloat(ing.cantidad) <= 0) {
                errors[`ingrediente_${index}`] = `La cantidad para "${ing.nombre}" no es válida.`;
            }
        });
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setError('');

        const payload = {
            nombre: formData.nombre,
            descripcion: formData.descripcion || null,
            tiempo_preparacion: formData.tiempo_preparacion ? parseInt(formData.tiempo_preparacion, 10) : null,
            instrucciones: formData.instrucciones || null,
            porciones: formData.porciones ? parseInt(formData.porciones, 10) : 1,
            precio_costo: formData.precio_costo ? parseFloat(formData.precio_costo) : null,
            ingredientes: ingredients.map(ing => ({
                id_producto: ing.id_producto,
                cantidad: parseFloat(ing.cantidad),
                unidad_medida_receta: ing.unidad_medida,
            })),
        };
        
        try {
            if (isEditMode) {
                await updateRecipe(recipeId, payload);
            } else {
                await createRecipe(payload);
            }
            onSave(); // Llama a la función del padre para recargar y cerrar
        } catch (err) {
            setError(err.message || "Un error ocurrió al guardar la receta.");
        } finally {
            setIsLoading(false);
        }
    };

    // === RENDERIZADO ===
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px' }}>
                <button className="modal-close-btn" onClick={onClose} disabled={isLoading}><FaTimes /></button>
                <h2>{isEditMode ? 'Editar Receta' : 'Crear Nueva Receta'}</h2>
                {error && <p className="modal-error-message">{error}</p>}
                
                <form onSubmit={handleSubmit} noValidate>
                    {/* --- DATOS GENERALES DE LA RECETA --- */}
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre de la Receta *</label>
                        <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} disabled={isLoading} />
                        {formErrors.nombre && <span className="form-error">{formErrors.nombre}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" disabled={isLoading}></textarea>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="tiempo_preparacion">Tiempo (min)</label>
                            <input type="number" id="tiempo_preparacion" name="tiempo_preparacion" value={formData.tiempo_preparacion} onChange={handleChange} min="0" disabled={isLoading} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="porciones">Porciones</label>
                            <input type="number" id="porciones" name="porciones" value={formData.porciones} onChange={handleChange} min="1" disabled={isLoading} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="instrucciones">Instrucciones</label>
                        <textarea id="instrucciones" name="instrucciones" value={formData.instrucciones} onChange={handleChange} rows="5" disabled={isLoading}></textarea>
                    </div>

                    {/* --- SECCIÓN DE INGREDIENTES --- */}
                    <hr className="form-divider" />
                    <div className="form-group">
                        <label>Ingredientes *</label>
                        <div className="ingredient-search-wrapper">
                            <input 
                                type="text"
                                placeholder="Buscar producto para añadir..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={isLoading}
                            />
                            {isSearching && <div className="search-spinner"></div>}
                            {searchResults.length > 0 && (
                                <ul className="search-results">
                                    {searchResults.map(p => (
                                        <li key={p.id_producto} onClick={() => handleAddIngredient(p)}>
                                            {p.nombre}
                                        </li>
                                    ))}
                                </ul>
                            )}                
                        </div>
                        {formErrors.ingredientes && <span className="form-error">{formErrors.ingredientes}</span>}
                        
                        <div className="ingredients-list">
                            {ingredients.map((ing, index) => (                                
                                <div key={ing.id_producto} className="ingredient-item">
                                    <span className="ingredient-name">{ing.nombre}</span>
                                    <div className="ingredient-inputs">
                                        <input 
                                            type="number" 
                                            placeholder="Cant." 
                                            value={ing.cantidad}
                                            onChange={(e) => handleIngredientChange(index, 'cantidad', e.target.value)}
                                            step="0.01" min="0.01"
                                        />
                                        <input 
                                            type="text"
                                            placeholder="Unidad"
                                            value={ing.unidad_medida}
                                            onChange={(e) => handleIngredientChange(index, 'unidad_medida', e.target.value)}
                                        />
                                        <button type="button" className="btn-remove-ingredient" onClick={() => handleRemoveIngredient(index)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                    {formErrors[`ingrediente_${index}`] && <span className="form-error full-width-error">{formErrors[`ingrediente_${index}`]}</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Receta')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecipeFormModal;