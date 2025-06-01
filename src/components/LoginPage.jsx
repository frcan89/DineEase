import React, { useState } from 'react';

// It's good practice to create a separate CSS file for component styles
import './LoginPage.css';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [apiFeedback, setApiFeedback] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setApiFeedback(''); // Clear previous feedback

        try {
            const response = await fetch('YOUR_API_ENDPOINT_URL_HERE', { // Placeholder URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json(); // Attempt to parse JSON regardless of response.ok

            if (response.ok) {
                setApiFeedback('Login successful!'); // Or use a message from 'data' if available
                // Handle successful login, e.g., store token, redirect (will be covered later if needed)
                console.log('Login success data:', data);
            } else {
                setApiFeedback(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login API error:', error);
            setApiFeedback('An error occurred during login. Please try again.');
        }
    };

    return (
        <div className="login-container-wrapper"> {/* Wrapper for centering */}
            <div className="login-container">
                <div className="logo">
                    {/* Placeholder for logo, or use an img tag if an actual logo URL is available */}
                    {/* <img src="https://via.placeholder.com/100" alt="DineEase Logo" /> */}
                    <div>DineEase Logo Placeholder</div>
                </div>
                <h1>Bienvenido a DineEase</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Nombre de Usuario</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Nombre de Usuario"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setApiFeedback(''); // Clear feedback
                            }}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setApiFeedback(''); // Clear feedback
                            }}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Iniciar Sesión</button>
                    <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
                </form>
                {apiFeedback && (
                    <p className={`api-feedback ${apiFeedback.toLowerCase().includes('successful') ? 'success' : 'error'}`}>
                        {apiFeedback}
                    </p>
                )}
                <p className="support-text">
                    ¿Necesitas ayuda? Contacta a <a href="mailto:soporte@dineease.com" style={{ color: '#F47C34' }}>soporte@dineease.com</a>
                </p>
                <p className="copyright">© 2023 DineEase. Todos los derechos reservados.</p>
            </div>
        </div>
    );
};

export default LoginPage;
