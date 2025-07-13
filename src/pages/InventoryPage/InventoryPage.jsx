// src/pages/InventoryPage/InventoryPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../../services/productService'; // Reutilizamos este servicio
import { getUserRestaurantId } from '../../services/authService';
import Header from '../../components/Dashboard/Header';
import InventoryMovementModal from '../../components/Dashboard/InventoryMovementModal';
import './InventoryPage.css';
import { FaPlus, FaHistory } from 'react-icons/fa';

// Componente interno para la tabla
const InventoryTable = ({ products, onRegisterMovement, onViewHistory }) => {
    if (!products || products.length === 0) {
        return <p className="loading-message">No se encontraron productos en el inventario.</p>;
    }

    const getStockStatus = (stock, minStock) => {
        if (stock === 0) return { className: 'stock-out', text: 'Agotado' };
        if (stock <= minStock) return { className: 'stock-low', text: 'Bajo' };
        return { className: 'stock-ok', text: 'OK' };
    };

    return (
        <div className="inventory-table-wrapper">
            <table className="inventory-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Stock Actual</th>
                        <th>Stock Mínimo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => {
                        const stockActual = product.Inventario?.cantidad ?? 0;
                        const stockMinimo = product.stock_minimo ?? 0;
                        const stockStatus = getStockStatus(stockActual, stockMinimo);

                        return (
                            <tr key={product.id_producto}>
                                <td data-label="Producto">{product.nombre}</td>
                                <td data-label="Stock Actual">
                                    {stockActual} {product.unidad_medida}
                                </td>
                                <td data-label="Stock Mínimo">
                                    {stockMinimo} {product.unidad_medida}
                                </td>
                                <td data-label="Estado">
                                    <span className={`stock-level ${stockStatus.className}`}>
                                        {stockStatus.text}
                                    </span>
                                </td>
                                <td data-label="Acciones">
                                    <div className="action-btn-group">
                                        <button onClick={() => onRegisterMovement(product)} className="action-btn edit-btn" title="Registrar Movimiento">
                                            <FaPlus /> Registrar Movimiento
                                        </button>
                                        <button onClick={() => onViewHistory(product.id_producto)} className="action-btn" title="Ver Historial">
                                            <FaHistory /> Historial
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

// Componente principal de la página
const InventoryPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchInventoryProducts = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        const restaurantId = getUserRestaurantId();
        if (!restaurantId) {
            setError("No tienes un restaurante asociado.");
            setLoading(false);
            return;
        }

        try {
            const params = { pagina: page, limite: 15, id_restaurante: restaurantId };
            const data = await getProducts(params);
            
            setProducts(data.productos || []);
            setTotalPages(data.totalPaginas || 1);
            setCurrentPage(data.paginaActual || page);
        } catch (err) {
            setError(err.message || "Error al cargar el inventario.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventoryProducts(currentPage);
    }, [fetchInventoryProducts, currentPage]);

    const handleRegisterMovement = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleViewHistory = (productId) => {
        console.log("Ver historial para el producto ID:", productId);
        // Aquí podrías abrir otro modal o navegar a otra página
    };

    const handleSaveMovement = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
        fetchInventoryProducts(currentPage); // Recargar los datos
    };
    
    // ... lógica de paginación ...

    return (
        <div className="inventory-container">
            <Header title="Gestión de Inventario" />
            
            {loading && <p className="loading-message">Cargando inventario...</p>}
            {error && <p className="error-message">{error}</p>}
            
            {!loading && !error && (
                <InventoryTable 
                    products={products} 
                    onRegisterMovement={handleRegisterMovement}
                    onViewHistory={handleViewHistory}
                />
            )}
            
            {/* Modal para registrar movimiento */}
            {
            <InventoryMovementModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                product={selectedProduct}
                onSave={handleSaveMovement}
            /> 
            }
            
            {/* Paginación */}
        </div>
    );
};

export default InventoryPage;