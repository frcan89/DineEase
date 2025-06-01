// src/services/userService.js
import axios from 'axios';
import { getToken } from './authService'; // Para incluir el token en las cabeceras

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = getToken();
    if (!token) {
        console.warn("No token found for API request");
        // Podrías lanzar un error o manejarlo según tu lógica de autenticación
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// Obtener todos los usuarios con paginación y filtros
export const getUsers = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/usuarios`, {
            headers: getAuthHeaders(),
            params: params
        });
        // LA CLAVE ESTÁ AQUÍ: Devolver el objeto 'data' interno
        if (response.data && response.data.data) {
            return response.data.data; // Devolvemos { totalUsuarios, usuarios, paginaActual, totalPaginas }
        } else {
            // Si la estructura no es la esperada, pero la petición fue exitosa
            console.warn("Respuesta de getUsers no tiene la estructura esperada:", response.data);
            return { totalUsuarios: 0, usuarios: [], paginaActual:1, totalPaginas: 0 }; // Valor por defecto
        }
    } catch (error) {
        console.error("Error fetching users:", error.response?.data || error.message);
        throw error.response?.data || new Error("Error al obtener usuarios");
    }
};
// Obtener un usuario por ID (no está en tu HTML, pero es útil)
export const getUserById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/usuarios/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("Error al obtener el usuario");
    }
};

// Crear un nuevo usuario
export const createUser = async (userData) => {
    // userData debería coincidir con el Example Value de POST /api/usuarios
    // ej: { nombre, email, password_hash, id_rol, id_restaurante, estado, direccion, telefono, documento_identidad, notas }
    try {
        const response = await axios.post(`${API_URL}/usuarios`, userData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error creating user:", error.response?.data || error.message);
        throw error.response?.data || new Error("Error al crear el usuario");
    }
};

// Actualizar un usuario
export const updateUser = async (id, userData) => {
    // userData debería coincidir con el Example Value de PUT /api/usuarios/{id}
    try {
        const response = await axios.put(`${API_URL}/usuarios/${id}`, userData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error updating user ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("Error al actualizar el usuario");
    }
};

// Eliminar (lógicamente) un usuario
export const deleteUser = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/usuarios/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error deleting user ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("Error al eliminar el usuario");
    }
};

// Restaurar un usuario eliminado lógicamente
export const restoreUser = async (id) => {
    try {
        // La API indica PUT, pero no especifica un body. Asumimos que no necesita body.
        const response = await axios.put(`${API_URL}/usuarios/${id}/restaurar`, {}, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error restoring user ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("Error al restaurar el usuario");
    }
};

// Cambiar contraseña (no está en el CRUD básico de usuarios, pero tu API lo tiene)
export const changeUserPassword = async (id, passwordData) => {
    // passwordData sería algo como { oldPassword, newPassword } según tu schema ChangePasswordRequest
    try {
        const response = await axios.put(`${API_URL}/usuarios/${id}/cambiar-password`, passwordData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error changing password for user ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("Error al cambiar la contraseña");
    }
};