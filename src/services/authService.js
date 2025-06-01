// src/services/authService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });

        // La respuesta exitosa tiene la estructura que proporcionaste
        if (response.data && response.data.data && response.data.data.token) {
            const { token, usuario } = response.data.data;

            // Guardar el token en localStorage
            localStorage.setItem('userToken', token);

            // Guardar la información del usuario en localStorage
            // Es buena práctica guardar el objeto de usuario completo si lo vas a necesitar
            if (usuario) {
                localStorage.setItem('userData', JSON.stringify(usuario));
            }

            return response.data; // Puedes devolver toda la respuesta o solo response.data.data
        } else {
            // Si la respuesta no tiene la estructura esperada aunque sea un 2xx
            throw new Error("Respuesta de inicio de sesión inesperada.");
        }

    } catch (error) {
        if (error.response && error.response.data) {
            // Si la API devuelve un error estructurado (ej. 400, 401, 403)
            // La API de ejemplo de Swagger parece devolver un string o un objeto simple con "message"
            // ej: { "message": "Credenciales inválidas" } o simplemente "Datos inválidos"
            // Si es un objeto con "message", lo usamos.
            throw error.response.data.message || error.response.data;
        } else if (error.request) {
            // La petición se hizo pero no se recibió respuesta
            throw new Error("No se pudo conectar al servidor. Verifica tu conexión.");
        } else {
            // Algo ocurrió al configurar la petición que generó un error
            throw error.message || "Error desconocido al intentar iniciar sesión.";
        }
    }
};

export const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    // Aquí podrías también llamar a un endpoint de logout en la API si existe
    // y redirigir al login.
    // Ejemplo: window.location.href = '/login';
};

export const getCurrentUser = () => {
    const userData = localStorage.getItem('userData');
    try {
        return userData ? JSON.parse(userData) : null;
    } catch (e) {
        console.error("Error al parsear userData de localStorage", e);
        localStorage.removeItem('userData'); // Limpiar dato corrupto
        return null;
    }
};

export const getToken = () => {
    return localStorage.getItem('userToken');
};

// Podrías añadir una función para verificar si el usuario está logueado
export const isLoggedIn = () => {
    const token = getToken();
    // Aquí podrías añadir una verificación de expiración del token si lo deseas
    return !!token;
};