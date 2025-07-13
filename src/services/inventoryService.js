// src/services/inventoryService.js
import axios from 'axios';
import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

/**
 * Registra un nuevo movimiento de inventario.
 * @param {object} movementData - Datos del movimiento { id_producto, tipo_movimiento, cantidad_movida, ... }
 * @returns {Promise<object>}
 */
export const registerInventoryMovement = async (movementData) => {
    try {
        const response = await axios.post(`${API_URL}/inventario/movimientos`, movementData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error al registrar movimiento de inventario:", error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudo registrar el movimiento.");
    }
};

/**
 * Obtiene el historial de movimientos de un producto.
 * @param {number|string} productId - ID del producto.
 * @param {object} params - Parámetros de paginación y filtros (pagina, limite, etc.)
 * @returns {Promise<object>}
 */
export const getProductMovements = async (productId, params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/inventario/productos/${productId}/movimientos`, {
            headers: getAuthHeaders(),
            params: params
        });
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    } catch (error) {
        console.error(`Error al obtener movimientos del producto ${productId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudieron obtener los movimientos.");
    }
};