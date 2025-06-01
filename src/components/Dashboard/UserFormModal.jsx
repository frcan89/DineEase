// src/components/Dashboard/UserFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { createUser, updateUser } from '../../services/userService';
import { getRoles } from '../../services/commonService'; // Asumiendo que creaste este servicio
import './UserFormModal.css'; // Crearemos este archivo CSS
import { FaTimes } from 'react-icons/fa';

const UserFormModal = ({ isOpen, onClose, user: editingUser, onSave }) => {
    
    console.log("UserFormModal: RENDER - Prop isOpen recibido:", isOpen); 
    const initialFormState = {
        nombre: '',
        email: '',
        password_hash: '', // Usaremos 'password_hash', el backend debe hashear
        id_rol: '',
        id_restaurante: '', // Lo manejaremos como texto, podría ser null
        estado: true,
        direccion: '',
        telefono: '',
        documento_identidad: '',
        notas: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const isEditMode = Boolean(editingUser);

    // Cargar roles al montar el modal
    useEffect(() => {
        if (isOpen) {
            const fetchRoles = async () => {
                try {
                    const rolesData = await getRoles();
                    setRoles(rolesData || []); // Asegúrate que rolesData sea un array
                } catch (err) {
                    console.error("Error cargando roles en modal:", err);
                    setError("No se pudieron cargar los roles.");
                }
            };
            fetchRoles();
        }
    }, [isOpen]);

    // Precargar datos del formulario si estamos en modo edición
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && editingUser) {
                setFormData({
                    nombre: editingUser.nombre || '',
                    email: editingUser.email || '',
                    password_hash: '', // La contraseña no se precarga por seguridad, solo se envía si se cambia
                    id_rol: editingUser.id_rol || '',
                    id_restaurante: editingUser.id_restaurante !== null ? String(editingUser.id_restaurante) : '',
                    estado: editingUser.estado !== undefined ? editingUser.estado : true,
                    direccion: editingUser.perfil?.direccion || '',
                    telefono: editingUser.perfil?.telefono || '',
                    documento_identidad: editingUser.perfil?.documento_identidad || '',
                    notas: editingUser.perfil?.notas || '',
                });
            } else {
                setFormData(initialFormState); // Reset para modo creación
            }
            setError(''); // Limpiar error al abrir/cambiar modo
            setFormErrors({}); // Limpiar errores de formulario
        }
    }, [isOpen, isEditMode, editingUser]); // Dependencias

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Limpiar error específico al cambiar
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
        if (!formData.email.trim()) {
            errors.email = "El correo es obligatorio.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = "El formato del correo no es válido.";
        }
        if (!isEditMode && !formData.password_hash) { // Contraseña obligatoria solo en creación
            errors.password_hash = "La contraseña es obligatoria.";
        } else if (formData.password_hash && formData.password_hash.length < 6) { // Si se ingresa, mínimo 6 caracteres
             errors.password_hash = "La contraseña debe tener al menos 6 caracteres.";
        }
        if (!formData.id_rol) errors.id_rol = "El rol es obligatorio.";
        
        // Puedes añadir más validaciones (documento_identidad, telefono, etc.)

        setFormErrors(errors);
        return Object.keys(errors).length === 0; // Retorna true si no hay errores
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        // Preparar los datos para la API
        // Tu API espera 'password_hash_hash', si envías 'password_hash', el backend debe encargarse.
        // Si DEBES enviar 'password_hash_hash' desde el frontend (no recomendado), aquí lo harías.
        const payload = {
            nombre: formData.nombre,
            email: formData.email,
            id_rol: parseInt(formData.id_rol), // Asegurar que sea número
            id_restaurante: formData.id_restaurante ? parseInt(formData.id_restaurante) : null,
            estado: formData.estado,
            // Los campos de perfil van anidados según tu API de creación (si es que es así)
            // o directamente si tu API los espera en el nivel raíz.
            // La API Swagger de POST /api/usuarios los muestra en el nivel raíz.
            direccion: formData.direccion,
            telefono: formData.telefono,
            documento_identidad: formData.documento_identidad,
            notas: formData.notas,
        };

        // Añadir contraseña solo si se proporcionó (para creación es obligatoria, para edición es opcional)
        if (formData.password_hash) {
            // Asume que tu backend espera un campo 'password_hash' y lo hashea.
            // Si tu API espera literalmente 'password_hash_hash', y tú debes enviar el hash
            // (lo cual es inusual para un frontend), tendrías que ajustar esto.
            payload.password_hash = formData.password_hash; // o payload.password_hash_hash = formData.password_hash;
        }


        try {
            if (isEditMode) {
                await updateUser(editingUser.id_usuario, payload);
            } else {
                await createUser(payload);
            }
            onSave(); // Llama a la función onSave pasada por props (ej. para recargar la lista)
            handleClose(); // Cierra el modal
        } catch (err) {
            console.error("Error guardando usuario:", err);
            setError(err.message || (isEditMode ? "Error al actualizar usuario." : "Error al crear usuario."));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData(initialFormState);
        setError('');
        setFormErrors({});
        onClose(); // Llama a la función onClose pasada por props
    };

    if (!isOpen) {
        console.log("UserFormModal: isOpen es false, retornando null."); 
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-btn" onClick={handleClose} disabled={isLoading}>
                    <FaTimes />
                </button>
                <h2>{isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
                {error && <p className="modal-error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre Completo *</label>
                            <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} disabled={isLoading} />
                            {formErrors.nombre && <span className="form-error">{formErrors.nombre}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Correo Electrónico *</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} disabled={isLoading} />
                            {formErrors.email && <span className="form-error">{formErrors.email}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password_hash">
                            Contraseña {isEditMode ? '(Dejar vacío para no cambiar)' : '*'}
                        </label>
                        <input type="password" id="password_hash" name="password_hash" value={formData.password_hash} onChange={handleChange} disabled={isLoading} placeholder={isEditMode ? 'Nueva contraseña' : ''}/>
                        {formErrors.password_hash && <span className="form-error">{formErrors.password_hash}</span>}
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="id_rol">Rol *</label>
                            <select id="id_rol" name="id_rol" value={formData.id_rol} onChange={handleChange} disabled={isLoading || roles.length === 0}>
                                <option value="">Seleccionar Rol...</option>
                                {roles.map(rol => (
                                    <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                                ))}
                            </select>
                            {formErrors.id_rol && <span className="form-error">{formErrors.id_rol}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="id_restaurante">ID Restaurante (Opcional)</label>
                            <input type="number" id="id_restaurante" name="id_restaurante" value={formData.id_restaurante} onChange={handleChange} disabled={isLoading} placeholder="Dejar vacío si no aplica"/>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="documento_identidad">Documento de Identidad</label>
                        <input type="text" id="documento_identidad" name="documento_identidad" value={formData.documento_identidad} onChange={handleChange} disabled={isLoading} />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="telefono">Teléfono</label>
                            <input type="tel" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} disabled={isLoading} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="direccion">Dirección</label>
                            <input type="text" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} disabled={isLoading} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="notas">Notas Adicionales</label>
                        <textarea id="notas" name="notas" value={formData.notas} onChange={handleChange} rows="3" disabled={isLoading}></textarea>
                    </div>

                    <div className="form-group form-group-checkbox">
                        <input type="checkbox" id="estado" name="estado" checked={formData.estado} onChange={handleChange} disabled={isLoading} />
                        <label htmlFor="estado">Usuario Activo</label>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={handleClose} disabled={isLoading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={isLoading}>
                            {isLoading ? (isEditMode ? 'Guardando...' : 'Creando...') : (isEditMode ? 'Guardar Cambios' : 'Crear Usuario')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;