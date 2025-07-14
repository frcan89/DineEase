// src/components/Dashboard/MenuFormModal.jsx
import React, { useState, useEffect } from 'react';
import { createMenu, updateMenu } from '../../services/menuService';
import { getUserRestaurantId } from '../../services/authService';
// Reutilizamos el CSS global para modales y formularios
import { FaTimes } from 'react-icons/fa';

const MenuFormModal = ({ isOpen, onClose, menu: editingMenu, onSave }) => {
    const initialFormState = {
        nombre: '',
        descripcion: '',
        precio_venta: '',
        estado: 'Activo',
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const isEditMode = Boolean(editingMenu);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && editingMenu) {
                setFormData({
                    nombre: editingMenu.nombre || '',
                    descripcion: editingMenu.descripcion || '',
                    precio_venta: editingMenu.precio_venta || '',
                    estado: editingMenu.estado || 'Activo',
                });
            } else {
                setFormData(initialFormState);
            }
            setError('');
            setFormErrors({});
        }
    }, [isOpen, editingMenu, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const errors = {};
        if (!formData.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
        if (!formData.precio_venta || isNaN(parseFloat(formData.precio_venta)) || parseFloat(formData.precio_venta) < 0) {
            errors.precio_venta = "El precio de venta debe ser un número válido.";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setError('');

        const restaurantId = getUserRestaurantId();
        if (!restaurantId && !isEditMode) { // Solo es crucial en la creación
            setError("No se pudo obtener el ID del restaurante.");
            setIsLoading(false);
            return;
        }

        const payload = {
            nombre: formData.nombre,
            descripcion: formData.descripcion || null,
            precio_venta: parseFloat(formData.precio_venta),
            estado: formData.estado,
            id_restaurante: restaurantId, // El backend lo podría tomar del usuario, pero es bueno enviarlo
        };

        try {
            if (isEditMode) {
                await updateMenu(editingMenu.id_menu, payload);
            } else {
                await createMenu(payload);
            }
            onSave();
        } catch (err) {
            setError(err.message || "Ocurrió un error al guardar el menú.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-btn" onClick={onClose} disabled={isLoading}><FaTimes /></button>
                <h2>{isEditMode ? 'Editar Menú' : 'Crear Nuevo Menú'}</h2>
                {error && <p className="modal-error-message">{error}</p>}
                
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="nombre">Nombre del Menú *</label>
                        <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} disabled={isLoading} />
                        {formErrors.nombre && <span className="form-error">{formErrors.nombre}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" disabled={isLoading}></textarea>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="precio_venta">Precio de Venta (Combo) *</label>
                            <input type="number" id="precio_venta" name="precio_venta" value={formData.precio_venta} onChange={handleChange} step="0.01" min="0" disabled={isLoading} />
                            {formErrors.precio_venta && <span className="form-error">{formErrors.precio_venta}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="estado">Estado</label>
                            <select id="estado" name="estado" value={formData.estado} onChange={handleChange} disabled={isLoading}>
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                                <option value="Promoción">Promoción</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Menú')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MenuFormModal;