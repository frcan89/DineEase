// src/pages/NotFoundPage/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Para el botón de "Volver"
import { isLoggedIn } from '../../services/authService'; // Para decidir a dónde volver
import './NotFoundPage.css'; // Crearemos este archivo CSS

const NotFoundPage = () => {
    const homePath = isLoggedIn() ? '/dashboard' : '/login';

    return (
        <div className="notfound-page-body"> {/* Wrapper para aplicar estilos de centrado */}
            <div className="notfound-container">
                <h1>404</h1>
                <h2>Página no encontrada</h2>
                <p>Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
                <Link to={homePath} className="notfound-btn">
                    Volver a la página principal
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;