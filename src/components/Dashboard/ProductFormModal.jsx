// src/components/Dashboard/ProductFormModal.jsx
import React, { useState, useEffect } from 'react';
import { createProduct, updateProduct } from '../../services/productService';
import { getUserRestaurantId } from '../../services/authService';
import './UserFormModal.css'; // Reutilizamos el CSS del modal de usuario
import { FaTimes } from 'react-icons/fa';

const ProductFormModal = ({ isOpen, onClose, product: editingProduct, onSave }) => {
    const initialFormState = {
        nombre: '',
        descripcion: '',
        unidad_medida: 'kg', // Valor por defecto
        precio_compra: '',
        stock_minimo: '',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const isEditMode = Boolean(editingProduct);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && editingProduct) {
                setFormData({
                    nombre: editingProduct.nombre || '',
                    descripcion: editingProduct.descripcion || '',
                    unidad_medida: editingProduct.unidad_medida || 'kg',
                    precio_compra: editingProduct.precio_compra || '',
                    stock_minimo: editingProduct.stock_minimo || '',
                });
            } else {
                setFormData(initialFormState); // Reset para modo creación
            }
            // Limpiar errores al abrir o cambiar de modo
            setApiError('');
            setFormErrors({});
        }
    }, [isOpen, isEditMode, editingProduct]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
        if (!formData.unidad_medida.trim()) errors.unidad_medida = "La unidad de medida es obligatoria.";
        if (!formData.precio_compra || isNaN(parseFloat(formData.precio_compra)) || parseFloat(formData.precio_compra) < 0) {
            errors.precio_compra = "El precio de compra debe ser un número válido.";
        }
        if (!formData.stock_minimo || isNaN(parseInt(formData.stock_minimo, 10)) || parseInt(formData.stock_minimo, 10) < 0) {
            errors.stock_minimo = "El stock mínimo debe ser un número entero válido.";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setApiError('');

        const restaurantId = getUserRestaurantId();
        if (!restaurantId) {
            setApiError("No se pudo obtener el ID del restaurante. Inicia sesión de nuevo.");
            setIsLoading(false);
            return;
        }

        const payload = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            unidad_medida: formData.unidad_medida,
            precio_compra: parseFloat(formData.precio_compra),
            stock_minimo: parseInt(formData.stock_minimo, 10),
            id_restaurante: restaurantId, // Aseguramos que el ID del restaurante esté presente
        };

        try {
            if (isEditMode) {
                await updateProduct(editingProduct.id_producto, payload);
            } else {
                await createProduct(payload);
            }
            onSave(); // Llama a onSave para recargar la lista y cerrar el modal
        } catch (err) {
            console.error("Error guardando producto:", err);
            setApiError(err.message || (isEditMode ? "Error al actualizar el producto." : "Error al crear el producto."));
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-btn" onClick={onClose} disabled={isLoading}>
                    <FaTimes />
                </button>
                <h2>{isEditMode ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
                {apiError && <p className="modal-error-message">{apiError}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre del Producto *</label>
                        <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} disabled={isLoading} />
                        {formErrors.nombre && <span className="form-error">{formErrors.nombre}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción (Opcional)</label>
                        <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" disabled={isLoading}></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="precio_compra">Precio de Compra *</label>
                            <input type="number" id="precio_compra" name="precio_compra" value={formData.precio_compra} onChange={handleChange} step="0.01" min="0" disabled={isLoading} />
                            {formErrors.precio_compra && <span className="form-error">{formErrors.precio_compra}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="stock_minimo">Stock Mínimo *</label>
                            <input type="number" id="stock_minimo" name="stock_minimo" value={formData.stock_minimo} onChange={handleChange} min="0" disabled={isLoading} />
                            {formErrors.stock_minimo && <span className="form-error">{formErrors.stock_minimo}</span>}
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="unidad_medida">Unidad de Medida *</label>
                        <select id="unidad_medida" name="unidad_medida" value={formData.unidad_medida} onChange={handleChange} disabled={isLoading}>
                            <option value="kg">Kilogramo (kg)</option>
                            <option value="g">Gramo (g)</option>
                            <option value="l">Litro (l)</option>
                            <option value="ml">Mililitro (ml)</option>
                            <option value="unidad">Unidad</option>
                            <option value="docena">Docena</option>
                            <option value="lata">Lata</option>
                            <option value="botella">Botella</option>
                        </select>
                        {formErrors.unidad_medida && <span className="form-error">{formErrors.unidad_medida}</span>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={isLoading}>
                            {isLoading ? (isEditMode ? 'Guardando...' : 'Creando...') : 'Guardar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;