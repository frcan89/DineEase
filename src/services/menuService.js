// src/services/menuService.js
import axios from 'axios';
import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

// --- FUNCIONES PARA LA ENTIDAD MENÚ ---

export const getMenus = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/menus`, { headers: getAuthHeaders(), params });
        return response.data.data || response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudieron obtener los menús.");
    }
};

export const getMenuById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/menus/${id}`, { headers: getAuthHeaders() });
        return response.data.data || response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo obtener el menú.");
    }
};

export const createMenu = async (menuData) => {
    try {
        const response = await axios.post(`${API_URL}/menus`, menuData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo crear el menú.");
    }
};

export const updateMenu = async (id, menuData) => {
    try {
        const response = await axios.put(`${API_URL}/menus/${id}`, menuData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo actualizar el menú.");
    }
};

export const deleteMenu = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/menus/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo eliminar el menú.");
    }
};

// --- FUNCIONES PARA ITEMS DE MENÚ ---

export const addItemToMenu = async (menuId, itemData) => {
    try {
        const response = await axios.post(`${API_URL}/menus/${menuId}/items`, itemData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo añadir el item al menú.");
    }
};

export const updateMenuItem = async (itemId, itemData) => {
    try {
        const response = await axios.put(`${API_URL}/menus/items/${itemId}`, itemData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo actualizar el item del menú.");
    }
};

export const deleteMenuItem = async (itemId) => {
    try {
        const response = await axios.delete(`${API_URL}/menus/items/${itemId}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error("No se pudo eliminar el item del menú.");
    }
};