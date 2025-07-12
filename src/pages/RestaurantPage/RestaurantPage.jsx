import "./RestaurantPage.css";
import Header from "../../components/Dashboard/Header";
import React, { useState, useEffect, useCallback } from "react";
import { getRestaurants } from "../../services/restaurantService";
const RestaurantTable = ({ restaurants }) => {
  if (!restaurants || restaurants.length === 0) {
    return <p className="loading-message">No hay restaurantes para mostrar.</p>;
  }
  return (
    <>
      <table className="restaurant-table">
        <thead>
          <tr>
            <th>Nomre</th>
            <th>Logo</th>
            <th>Colores primarios</th>
            <th>Dirección</th>
            <th>Telefono</th>
            <th>Eliminado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((restaurant) => (
            <tr key={restaurant.id_restaurante}>
              <td>{restaurant.nombre}</td>
              <td>{restaurant.logo}</td>
              <td>{restaurant.colores_primarios}</td>
              <td>{restaurant.direccion}</td>
              <td>{restaurant.telefono}</td>
              <td>
                <span
                  style={{
                    color: restaurant.eliminado ? "#FF5252" : "#5cb85c",
                    fontWeight: "bold",
                  }}
                >
                  {restaurant.eliminado ? "Si" : "No"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const RestaurantPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Paginación (estado básico)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRestaurantes, setTotalRestaurantes] = useState(0);
  const restaurantesPerPage = 10; // O configúralo según tu API o preferencia

  // Modal state (para crear/editar)
  const [isModalOpen] = useState(false);

  const fetchRestaurants = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          pagina: page,
          limite: restaurantesPerPage,
          // Aquí podrías añadir más filtros si tienes inputs para ellos:
          // nombre: '', estado: true, etc.
        };
        const data = await getRestaurants(params);
        console.log("Datos de usuarios recibidos:", data); // Para depuración
        setRestaurants(data.restaurantes || []);
        setTotalRestaurantes(data.totalRestaurantes || 0);
        setTotalPages(
          Math.ceil((data.totalRestaurantes || 0) / restaurantesPerPage)
        );
        setCurrentPage(page);
      } catch (err) {
        setError(err.message || "Error al cargar usuarios.");
        setRestaurants([]); // Limpiar restaurantes en caso de error
      } finally {
        setLoading(false);
      }
    },
    [restaurantesPerPage]
  );

  useEffect(() => {
    fetchRestaurants(currentPage);
  }, [fetchRestaurants, currentPage]); // Volver a cargar si la función fetchUsers o currentPage cambia

  // Funciones de paginación
  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };
  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };
  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  return (
    <>
      <div className="restaurants-container">
        <Header title="Gestión de Restaurantes" notificationCount={3} />{" "}
        {/* Usamos el Header del Dashboard */}
        <div className="restaurants-header-actions">
          {/* Aquí podrías añadir filtros si los implementas */}
          <div>{/* Placeholder para filtros */}</div>
          {/* <button onClick={handleCreateRestaurant} className="create-user-btn">
            <FaUserPlus /> Crear Usuario
          </button> */}
        </div>
        {loading && <p className="loading-message">Cargando usuarios...</p>}
        {error && <p className="error-message-restaurants">{error}</p>}
        {!loading && !error && (
          <RestaurantTable
            restaurants={restaurants}

            // Pasarías esto si implementas la lógica de restauración
          />
        )}
        {!loading && !error && totalRestaurantes > 0 && (
          <div className="pagination-controls">
            <button onClick={goToPreviousPage} disabled={currentPage === 1}>
              Anterior
            </button>
            {/* Renderizar algunos números de página - simplificado */}
            {[...Array(totalPages).keys()].map((num) => (
              <button
                key={num + 1}
                onClick={() => goToPage(num + 1)}
                disabled={currentPage === num + 1}
                style={
                  currentPage === num + 1
                    ? { backgroundColor: "#F47C34", borderColor: "#F47C34" }
                    : {}
                }
              >
                {num + 1}
              </button>
            ))}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Siguiente
            </button>
            <span className="pagination-info">
              Página {currentPage} de {totalPages} (Total: {totalRestaurantes}{" "}
              usuarios)
            </span>
          </div>
        )}
        {/* Aquí iría el UserFormModal si isModalOpen es true */}
        {console.log("UsersPage: RENDER - isModalOpen es:", isModalOpen)}
      </div>
    </>
  );
};

export default RestaurantPage;
