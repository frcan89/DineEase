// src/services/orderService.js
import axios from 'axios';
import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

// --- GESTIÓN DE PEDIDOS ---

export const getOrders = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/pedidos`, { headers: getAuthHeaders(), params });
        return response.data.data || response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudieron obtener los pedidos.");
    }
};

export const getOrderById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/pedidos/${id}`, { headers: getAuthHeaders() });
        return response.data.data || response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo obtener el pedido.");
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await axios.post(`${API_URL}/pedidos`, orderData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo crear el pedido.");
    }
};

export const updateOrderStatus = async (id, estado) => {
    try {
        const response = await axios.patch(`${API_URL}/pedidos/${id}/estado`, { estado }, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo actualizar el estado del pedido.");
    }
};

export const cancelOrder = async (id) => {
    try {
        const response = await axios.post(`${API_URL}/pedidos/${id}/cancelar`, {}, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo cancelar el pedido.");
    }
};

export const payOrder = async (id, paymentData) => {
    try {
        const response = await axios.post(`${API_URL}/pedidos/${id}/pagar`, paymentData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo registrar el pago.");
    }
};


// --- GESTIÓN DE ITEMS DENTRO DE UN PEDIDO ---

export const addItemToOrder = async (orderId, itemData) => {
    try {
        const response = await axios.post(`${API_URL}/pedidos/${orderId}/menus`, itemData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo añadir el item al pedido.");
    }
};

export const updateOrderItem = async (orderItemId, itemData) => {
    try {
        const response = await axios.put(`${API_URL}/pedidos/items/${orderItemId}`, itemData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo actualizar el item del pedido.");
    }
};

export const deleteOrderItem = async (orderItemId) => {
    try {
        const response = await axios.delete(`${API_URL}/pedidos/items/${orderItemId}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo eliminar el item del pedido.");
    }
};