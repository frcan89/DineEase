// src/pages/ProductsPage/ProductsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    getProducts, 
    deleteProduct as apiDeleteProduct, 
    restoreProduct as apiRestoreProduct 
} from '../../services/productService';
import { getUserRestaurantId } from '../../services/authService';
import Header from '../../components/Dashboard/Header';
// import ProductFormModal from '../../components/Dashboard/ProductFormModal'; // Descomentar cuando lo creemos
import './ProductsPage.css';
import { FaEdit, FaTrash, FaPlus, FaUndo } from 'react-icons/fa';
import ProductFormModal from '../../components/Dashboard/ProductFormModal'; 

//====================================================================
// Componente Interno para la Tabla de Productos (Revisado)
//====================================================================
const ProductTable = ({ products, onEdit, onDelete, onRestore }) => {
    if (!products || products.length === 0) {
        return <p className="loading-message">No se encontraron productos.</p>;
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value || 0);
    };

    return (
        <div className="products-table-wrapper">
            <table className="products-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Precio Compra</th>
                        <th>Stock Mínimo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => {
                        const isActivo = !product.eliminado;
                        return (
                            <tr key={product.id_producto}>
                                <td data-label="Nombre">{product.nombre}</td>
                                <td data-label="Precio Compra">
                                    {formatCurrency(product.precio_compra)}
                                </td>
                                <td data-label="Stock Mínimo">
                                    {product.stock_minimo ?? 'N/A'} {product.unidad_medida}
                                </td>
                                <td data-label="Estado">
                                    <span style={{ color: isActivo ? '#5cb85c' : '#FF5252', fontWeight: 'bold' }}>
                                        {isActivo ? 'Activo' : 'Eliminado'}
                                    </span>
                                </td>
                                <td data-label="Acciones">
                                    <div className="action-btn-group">
                                        <button onClick={() => onEdit(product)} className="action-btn edit-btn" title="Editar">
                                            <FaEdit /> Editar
                                        </button>
                                        
                                        {isActivo ? (
                                            <button onClick={() => onDelete(product.id_producto)} className="action-btn delete-btn" title="Eliminar">
                                                <FaTrash /> Eliminar
                                            </button>
                                        ) : (
                                            <button onClick={() => onRestore(product.id_producto)} className="action-btn restore-btn" title="Restaurar">
                                                <FaUndo /> Restaurar
                                            </button>
                                        )}
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

//====================================================================
// Componente Principal de la Página de Productos (Revisado)
//====================================================================
const ProductsPage = () => {
    // Estados del componente
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const productsPerPage = 10;

    // Función para obtener los productos de la API
    const fetchProducts = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);

        const restaurantId = getUserRestaurantId();

        if (!restaurantId) {
            setError("No tienes un restaurante asociado para ver los productos. Contacta al administrador.");
            setLoading(false);
            setProducts([]);
            return;
        }

        try {
            const params = { 
                pagina: page, 
                limite: productsPerPage, 
                id_restaurante: restaurantId,
                incluirEliminados: true // Traer todos para poder restaurar
            };
            const data = await getProducts(params);
            
            setProducts(data.productos || []);
            setTotalProducts(data.totalProductos || 0);
            setTotalPages(data.totalPaginas || Math.ceil((data.totalProductos || 0) / productsPerPage));
            setCurrentPage(data.paginaActual || page);

        } catch (err) {
            setError(err.message || "Error al cargar productos.");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [productsPerPage]);

    // Efecto para cargar los datos al montar el componente o cambiar de página
    useEffect(() => {
        fetchProducts(currentPage);
    }, [fetchProducts, currentPage]);

    //--- Manejadores de eventos (CRUD y Modal) ---

    const handleCreateProduct = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };
    
    const handleSave = () => {
        handleCloseModal();
        fetchProducts(currentPage); // Recargar datos después de guardar
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
            try {
                await apiDeleteProduct(productId);
                fetchProducts(currentPage);
            } catch (err) {
                alert("Error al eliminar el producto: " + (err.message || "Error desconocido"));
            }
        }
    };

    const handleRestoreProduct = async (productId) => {
        if (window.confirm("¿Estás seguro de que quieres restaurar este producto?")) {
            try {
                await apiRestoreProduct(productId);
                fetchProducts(currentPage);
            } catch (err) {
                alert("Error al restaurar el producto: " + (err.message || "Error desconocido"));
            }
        }
    };

    //--- Lógica de Paginación ---

    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    //--- Renderizado del Componente ---

    return (
        <div className="products-container">
            <Header title="Gestión de Productos" />

            <div className="products-header-actions">
                {/* Aquí podrías añadir un componente de filtros */}
                <button 
                    onClick={handleCreateProduct} 
                    className="create-product-btn"
                    disabled={!getUserRestaurantId() || loading} 
                >
                    <FaPlus /> Crear Producto
                </button>
            </div>

            {loading && <p className="loading-message">Cargando productos...</p>}
            {error && <p className="error-message">{error}</p>}
            
            {!loading && !error && (
                <ProductTable 
                    products={products} 
                    onEdit={handleEditProduct} 
                    onDelete={handleDeleteProduct}
                    onRestore={handleRestoreProduct}
                />
            )}
            
            {/* Modal para crear/editar (a implementar) */}
            {<ProductFormModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                product={editingProduct}
                onSave={handleSave}
            /> }
            
            {/* Controles de Paginación */}
            {!loading && !error && totalProducts > 0 && (
                <div className="pagination-controls">
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                        Anterior
                    </button>
                    {/* Renderizado de números de página (lógica simple) */}
                    <span>Página {currentPage} de {totalPages}</span>
                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;