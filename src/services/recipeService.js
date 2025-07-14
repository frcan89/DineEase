// src/services/recipeService.js
import axios from 'axios';
import { getToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

/**
 * Obtiene una lista paginada de recetas.
 * @param {object} params - Parámetros de la query (pagina, limite, etc.)
 */
export const getRecipes = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/recetas`, { headers: getAuthHeaders(), params });
        return response.data.data || response.data;
    } catch (error) {
        console.error("Error al obtener recetas:", error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudieron obtener las recetas.");
    }
};

/**
 * Obtiene una receta por su ID, incluyendo sus ingredientes.
 * @param {number|string} id - El ID de la receta.
 */
export const getRecipeById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/recetas/${id}`, { headers: getAuthHeaders() });
        return response.data.data || response.data;
    } catch (error) {
        console.error(`Error al obtener la receta ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudo obtener la receta.");
    }
};

/**
 * Crea una nueva receta con sus ingredientes.
 * @param {object} recipeData - Los datos de la receta (RecetaInputSchema).
 */
export const createRecipe = async (recipeData) => {
    try {
        const response = await axios.post(`${API_URL}/recetas`, recipeData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error("Error al crear la receta:", error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudo crear la receta.");
    }
};

/**
 * Actualiza una receta y REEMPLAZA sus ingredientes.
 * @param {number|string} id - El ID de la receta.
 * @param {object} recipeData - Los datos actualizados (RecetaInputSchema).
 */
export const updateRecipe = async (id, recipeData) => {
    try {
        const response = await axios.put(`${API_URL}/recetas/${id}`, recipeData, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar la receta ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudo actualizar la receta.");
    }
};

/**
 * Elimina (lógicamente) una receta.
 * @param {number|string} id - El ID de la receta.
 */
export const deleteRecipe = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/recetas/${id}`, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar la receta ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudo eliminar la receta.");
    }
};

/**
 * Restaura una receta eliminada.
 * @param {number|string} id - El ID de la receta.
 */
export const restoreRecipe = async (id) => {
    try {
        const response = await axios.put(`${API_URL}/recetas/${id}/restaurar`, {}, { headers: getAuthHeaders() });
        return response.data;
    } catch (error) {
        console.error(`Error al restaurar la receta ${id}:`, error.response?.data || error.message);
        throw error.response?.data || new Error("No se pudo restaurar la receta.");
    }
};