// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage";
import DashboardLayout from "./layouts/DashboardLayout/DashboardLayout"; // Importa el layout
import DashboardHomePage from "./pages/DashboardPage/DashboardHomePage"; // Importa la página de inicio del dashboard
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage"; // <--- IMPORTA LA PÁGINA 404
import { isLoggedIn } from "./services/authService";
import UsersPage from "./pages/UsersPage/UsersPage";
import RestaurantPage from "./pages/RestaurantPage/RestaurantPage"; // Importa la página de restaurantes
import ProductsPage from './pages/ProductsPage/ProductsPage';
import InventoryPage from './pages/InventoryPage/InventoryPage'; // Importa la página de inventario
import RecipesPage from './pages/RecipesPage/RecipesPage'; // Importa la página de recetas
import MenusPage from './pages/MenusPage/MenusPage';
import MenuDetailPage from './pages/MenuDetailPage/MenuDetailPage';
import OrdersPage from './pages/OrdersPage/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage/OrderDetailPage';

import './styles/global.css'; // Importa tus estilos globales
// Componente para Rutas Protegidas
const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Un layout wrapper para las rutas del dashboard que necesiten el Sidebar y Header
const DashboardRoutesWrapper = () => {
  return (
    <DashboardLayout>
      <Outlet /> {/* Outlet renderizará el componente de la ruta hija */}
    </DashboardLayout>
  );
};

function App() {
  return (
    <>
      {" "}
      {/* Fragmento para el body (si aplicas estilos al body desde JS) */}
      {/* <div className={isDashboardRoute ? "dashboard-body" : ""}>  // Lógica condicional para clase de body si es necesario */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas del Dashboard anidadas bajo ProtectedRoute y DashboardRoutesWrapper */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRoutesWrapper />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHomePage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="restaurante" element={<RestaurantPage />} />
          <Route path="productos" element={<ProductsPage />} />
          <Route path="inventario" element={<InventoryPage />} />
          <Route path="recetas" element={<RecipesPage />} />
          <Route path="menus" element={<MenusPage />} />
          <Route path="menus/:menuId" element={<MenuDetailPage />} />
          <Route path="pedidos" element={<OrdersPage />} />
          <Route path="pedidos/:orderId" element={<OrderDetailPage />} />
        </Route>

        {/* Ruta por defecto */}
        <Route
          path="/"
          element={
            isLoggedIn() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {/* </div> */}
    </>
  );
}

export default App;
