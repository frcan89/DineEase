// src/services/tableService.js
import axios from 'axios';
import { getToken } from './authService';
import { getUserRestaurantId } from './authService'; // Importamos para usar el id del restaurante

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = getToken();
    if (!token) {
        console.error("Token de autenticación no encontrado.");
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

/**
 * Obtiene todas las mesas del restaurante del usuario.
 * @param {object} params - Parámetros de filtro y paginación (ej. { estado: 'Libre' })
 * @returns {Promise<object>}
 */
export const getTables = async (params = {}) => {
    // Tomamos el id_restaurante del usuario logueado, ya que la API no lo toma del contexto directamente
    // según el endpoint /api/pedidos que también lo necesita como parámetro.
    const restaurantId = getUserRestaurantId();
    if (!restaurantId && !params.id_restaurante) {
        // Si el usuario no tiene restaurante y no se pasa uno (ej. SuperAdmin)
        return Promise.reject(new Error("ID de restaurante no especificado."));
    }
    
    // Añadimos el id_restaurante a los parámetros si no está ya
    const requestParams = {
        id_restaurante: restaurantId,
        ...params,
    };

    try {
        const response = await axios.get(`${API_URL}/mesas`, {
            headers: getAuthHeaders(),
            params: requestParams,
        });
        
        // Asumimos consistencia con otras APIs y que la data está en .data.data
        if (response.data && response.data.data) {
            return response.data.data;
        }
        
        // Fallback por si la respuesta es plana
        return response.data;

    } catch (error) {
        console.error("Error al obtener las mesas:", error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudieron obtener las mesas.");
    }
};

/**
 * Crea una nueva mesa.
 * @param {object} tableData - Datos de la mesa { numero, capacidad, estado, ubicacion }
 * @returns {Promise<object>}
 */
export const createTable = async (tableData) => {
    try {
        const response = await axios.post(`${API_URL}/mesas`, tableData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error al crear la mesa:", error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudo crear la mesa.");
    }
};

/**
 * Actualiza una mesa existente.
 * @param {number|string} id - ID de la mesa a actualizar.
 * @param {object} tableData - Nuevos datos para la mesa.
 * @returns {Promise<object>}
 */
export const updateTable = async (id, tableData) => {
    try {
        const response = await axios.put(`${API_URL}/mesas/${id}`, tableData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar la mesa ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudo actualizar la mesa.");
    }
};

/**
 * Elimina (lógicamente) una mesa.
 * @param {number|string} id - ID de la mesa a eliminar.
 * @returns {Promise<object>}
 */
export const deleteTable = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/mesas/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar la mesa ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudo eliminar la mesa.");
    }
};

/**
 * Restaura una mesa eliminada.
 * @param {number|string} id - ID de la mesa a restaurar.
 * @returns {Promise<object>}
 */
export const restoreTable = async (id) => {
    try {
        const response = await axios.put(`${API_URL}/mesas/${id}/restaurar`, {}, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al restaurar la mesa ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudo restaurar la mesa.");
    }
};