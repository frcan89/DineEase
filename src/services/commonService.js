// src/services/roleService.js (o añádelo a un commonService.js)
import axios from 'axios';
import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

export const getRoles = async () => {
    try {
        const response = await axios.get(`${API_URL}/roles`, { headers: getAuthHeaders() });
        // Asume que la respuesta es { data: { roles: [{ id_rol, nombre }, ...] } } o similar
        return response.data.data.roles || response.data.roles || response.data; // Ajusta según tu API
    } catch (error) {
        console.error("Error fetching roles:", error.response?.data || error.message);
        throw error.response?.data || new Error("Error al obtener roles");
    }
};