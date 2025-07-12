// src/services/authService.js
import axios from "axios";
import { getToken } from "./authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const getAuthHeaders = () => {
  const token = getToken();
  if (!token) {
    console.warn("No token found for API request");
    // Podrías lanzar un error o manejarlo según tu lógica de autenticación
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Obtener todos los usuarios con paginación y filtros
export const getRestaurants = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/restaurantes`, {
      headers: getAuthHeaders(),
      params: params,
    });

    // LA CLAVE ESTÁ AQUÍ: Devolver el objeto 'data' interno
    if (response.data && response.data.data) {
      return response.data.data; // Devolvemos { totalUsuarios, usuarios, paginaActual, totalPaginas }
    } else {
      // Si la estructura no es la esperada, pero la petición fue exitosa

      return {
        totalRestaurantes: 0,
        restaurantes: [],
        paginaActual: 1,
        totalPaginas: 0,
      }; // Valor por defecto
    }
  } catch (error) {
    console.error(
      "Error fetching users:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Error al obtener restaurantes");
  }
};
