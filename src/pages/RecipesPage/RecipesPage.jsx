// src/pages/RecipesPage/RecipesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getRecipes, deleteRecipe as apiDeleteRecipe } from '../../services/recipeService';
import { getUserRestaurantId } from '../../services/authService';
import Header from '../../components/Dashboard/Header';
import RecipeFormModal from '../../components/Dashboard/RecipeFormModal';
import './RecipesPage.css'; // O reutiliza un CSS común
import { FaEdit, FaTrash, FaPlus, FaUndo } from 'react-icons/fa';

// Componente para la tabla de recetas
const RecipeTable = ({ recipes, onEdit, onDelete, onRestore }) => {
    if (!recipes || recipes.length === 0) {
        return <p className="loading-message">No se encontraron recetas.</p>;
    }
    
    return (
        <div className="responsive-table-wrapper">
            <table className="responsive-table"> {/* Asegúrate de que las clases coincidan con tu CSS */}
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Porciones</th>
                        <th>Costo Estimado</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {recipes.map((recipe) => {
                        const isActivo = !recipe.eliminado;
                        return (
                            <tr key={recipe.id_receta}>
                                <td data-label="Nombre">{recipe.nombre}</td>
                                <td data-label="Descripción" style={{ whiteSpace: 'normal', maxWidth: '300px' }}>
                                    {recipe.descripcion || 'N/A'}
                                </td>
                                <td data-label="Porciones">{recipe.porciones || 'N/A'}</td>
                                <td data-label="Costo Estimado">
                                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(recipe.precio_costo || 0)}
                                </td>
                                <td data-label="Estado">
                                    <span style={{ color: isActivo ? '#5cb85c' : '#FF5252', fontWeight: 'bold' }}>
                                        {isActivo ? 'Activo' : 'Eliminado'}
                                    </span>
                                </td>
                                <td data-label="Acciones">
                                    <div className="action-btn-group">
                                        <button onClick={() => onEdit(recipe.id_receta)} className="action-btn edit-btn" title="Editar">
                                            <FaEdit /> Editar
                                        </button>
                                        {/* ... (lógica de botones eliminar/restaurar) */}
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
const RecipesPage = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecipeId, setEditingRecipeId] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchRecipes = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        const restaurantId = getUserRestaurantId();
        if (!restaurantId) {
            setError("No tienes un restaurante asociado.");
            setLoading(false);
            return;
        }

        try {
            const params = { pagina: page, limite: 10, id_restaurante: restaurantId };
            const data = await getRecipes(params);
            setRecipes(data.recetas || []);
            setTotalPages(data.totalPaginas || 1);
            setCurrentPage(data.paginaActual || 1);
        } catch (err) {
            setError(err.message || "Error al cargar las recetas.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecipes(currentPage);
    }, [fetchRecipes, currentPage]);

    const handleCreateRecipe = () => {
        setEditingRecipeId(null);
        setIsModalOpen(true);
    };

    const handleEditRecipe = (id) => {
        setEditingRecipeId(id);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        setIsModalOpen(false);
        setEditingRecipeId(null);
        fetchRecipes(currentPage);
    };

    return (
        <div className="recipes-container">
            <Header title="Gestión de Recetas" />
            <div className="page-header-actions">
                <button onClick={handleCreateRecipe} className="btn-primary">
                    <FaPlus /> Crear Receta
                </button>
            </div>
            
            {loading && <p className="loading-message">Cargando...</p>}
            {error && <p className="error-message">{error}</p>}
            
            {!loading && !error && (
                <RecipeTable recipes={recipes} onEdit={handleEditRecipe} />
            )}
            
            {<RecipeFormModal 
                isOpen={isModalOpen} 
                onClose={() => { setIsModalOpen(false); setEditingRecipeId(null); }}
                recipeId={editingRecipeId}
                onSave={handleSave}
            />}
        </div>
    );
};

export default RecipesPage;