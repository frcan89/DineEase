import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <--- Importa BrowserRouter
import App from './App.jsx';
import './index.css'; // o tus estilos globales

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* <--- Envuelve tu App con BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);