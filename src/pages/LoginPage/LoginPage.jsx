// src/pages/LoginPage/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { login } from '../../services/authService'; // Ajusta la ruta si es necesario
import logoImage from '../../assets/DINEESASE.webp'; // Asegúrate de que la ruta sea correcta
import './LoginPage.css';
// Si tienes un logo local en src/assets/logo.png
// import logoImage from '../../assets/logo.png';

const LoginPage = () => {
    const [email, setEmail] = useState(''); // Cambiado de username a email según API
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Por favor, ingresa tu email y contraseña.');
            setLoading(false);
            return;
        }

        try {
            // La API de Swagger espera 'email' y 'password'
            const data = await login(email, password);
            console.log('Login successful:', data);
            // Redirigir al dashboard u otra página protegida
            navigate('/dashboard');

        } catch (err) {
            console.error('Login failed:', err);
            // El error de authService ya es el objeto de error de la API
            // o un error genérico.
            // La API de Swagger indica que 400 es "Email y contraseña son requeridos"
            // o "Datos inválidos", y 401 es "Credenciales inválidas".
            if (err && err.message) {
                setError(err.message);
            } else if (err && typeof err === 'string') {
                setError(err);
            }
             else {
                setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-body"> {/* Envuelve para aplicar estilos de body */}
            <div className="login-container">
                <div className="logo">
                    {/* Si tienes logoImage importado: */}
                    {/* <img src={logoImage} alt="DineEase Logo" /> */}
                    {/* O usando placeholder: */}
                    <img src={logoImage} alt="DineEase Logo" />
                </div>
                <h1>Bienvenido a DineEase</h1>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label> {/* Cambiado de username a email */}
                        <input
                            type="email" // Cambiado a email para validación de navegador
                            id="email"
                            placeholder="tu@email.com" // Cambiado placeholder
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                    <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
                </form>
                <p className="support-text">
                    ¿Necesitas ayuda? Contacta a <a href="mailto:soporte@dineease.com">soporte@dineease.com</a>
                </p>
                <p className="copyright">© {new Date().getFullYear()} DineEase. Todos los derechos reservados.</p>
            </div>
        </div>
    );
};

export default LoginPage;