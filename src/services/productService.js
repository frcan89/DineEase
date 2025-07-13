// src/services/productService.js
import axios from 'axios';
import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Función auxiliar para obtener las cabeceras de autenticación
const getAuthHeaders = () => {
    const token = getToken();
    if (!token) {
        // En una app real, podrías redirigir al login o manejar el error
        console.error("Token de autenticación no encontrado.");
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

/**
 * Obtiene una lista paginada de productos.
 * @param {object} params - Parámetros de la query (pagina, limite, nombre, etc.)
 * @returns {Promise<object>} - La data de la respuesta, ej: { totalProductos, productos, ... }
 */
export const getProducts = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/productos`, {
            headers: getAuthHeaders(),
            params: params
        });
        // Asume que la respuesta útil está en response.data.data, como en la API de usuarios
        if (response.data && response.data.data) {
            return response.data.data;
        }
        // Fallback si la respuesta no está envuelta en 'data'
        return response.data;
    } catch (error) {
        console.error("Error al obtener productos:", error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudieron obtener los productos.");
    }
};

/**
 * Crea un nuevo producto.
 * @param {object} productData - Los datos del producto a crear.
 * @returns {Promise<object>}
 */
export const createProduct = async (productData) => {
    try {
        const response = await axios.post(`${API_URL}/productos`, productData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error al crear el producto:", error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudo crear el producto.");
    }
};

/**
 * Actualiza un producto existente por su ID.
 * @param {number|string} id - El ID del producto.
 * @param {object} productData - Los datos a actualizar.
 * @returns {Promise<object>}
 */
export const updateProduct = async (id, productData) => {
    try {
        const response = await axios.put(`${API_URL}/productos/${id}`, productData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el producto ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudo actualizar el producto.");
    }
};

/**
 * Elimina (lógicamente) un producto por su ID.
 * @param {number|string} id - El ID del producto.
 * @returns {Promise<object>}
 */
export const deleteProduct = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/productos/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar el producto ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudo eliminar el producto.");
    }
};

/**
 * Restaura un producto eliminado lógicamente por su ID.
 * @param {number|string} id - El ID del producto.
 * @returns {Promise<object>}
 */
export const restoreProduct = async (id) => {
    try {
        const response = await axios.put(`${API_URL}/productos/${id}/restaurar`, {}, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al restaurar el producto ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudo restaurar el producto.");
    }
};