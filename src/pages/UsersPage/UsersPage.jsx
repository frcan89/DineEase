// src/pages/UsersPage/UsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, deleteUser as apiDeleteUser } from '../../services/userService';
import Header from '../../components/Dashboard/Header';
import UserFormModal from '../../components/Dashboard/UserFormModal'; 
import './UsersPage.css';
// Iconos para botones de acción (opcional pero recomendado)
import { FaEdit, FaTrash, FaUserPlus, FaUndo } from 'react-icons/fa';


// Componente interno para la tabla para mantener UsersPage más limpio
const UserTable = ({ users, onEdit, onDelete, onRestore }) => {
    if (!users || users.length === 0) {
        return <p className="loading-message">No hay usuarios para mostrar.</p>;
    }

    return (
        <table className="users-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {users.map((user) => (
                    <tr key={user.id_usuario}>
                        <td>{user.nombre}</td>
                        <td>{user.email}</td>
                        <td>{user.Rol?.nombre || 'N/A'}</td>
                        <td>
                            <span style={{ 
                                color: user.estado ? '#5cb85c' : '#FF5252',
                                fontWeight: 'bold'
                            }}>
                                {user.estado ? 'Activo' : 'Inactivo'}
                                {user.eliminado && ' (Eliminado)'} {/* Tu API no muestra 'eliminado' en la lista, pero podrías necesitarlo */}
                            </span>
                        </td>
                        <td>
                            <div className="action-btn-group">
                                <button
                                    onClick={() => onEdit(user)}
                                    className="action-btn edit-btn"
                                    title="Editar"
                                >
                                    <FaEdit /> Editar
                                </button>
                                {/* Si el usuario está eliminado lógicamente, mostrar botón de restaurar */}
                                {/* Necesitarías un campo 'eliminado' de la API para esto */}
                                {/* {user.eliminado ? (
                                    <button
                                        onClick={() => onRestore(user.id_usuario)}
                                        className="action-btn restore-btn"
                                        title="Restaurar"
                                    >
                                        <FaUndo /> Restaurar
                                    </button>
                                ) : ( */}
                                    <button
                                        onClick={() => onDelete(user.id_usuario)}
                                        className="action-btn delete-btn"
                                        title="Eliminar"
                                    >
                                        <FaTrash /> Eliminar
                                    </button>
                                {/* )} */}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};


const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Paginación (estado básico)
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const usersPerPage = 10; // O configúralo según tu API o preferencia

    // Modal state (para crear/editar)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);


    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                pagina: page,
                limite: usersPerPage,
                // Aquí podrías añadir más filtros si tienes inputs para ellos:
                // nombre: '', estado: true, etc.
            };
            const data = await getUsers(params);
            console.log("Datos de usuarios recibidos:", data); // Para depuración
            setUsers(data.usuarios || []);
            setTotalUsers(data.totalUsuarios || 0);
            setTotalPages(Math.ceil((data.totalUsuarios || 0) / usersPerPage));
            setCurrentPage(page);
        } catch (err) {
            setError(err.message || "Error al cargar usuarios.");
            setUsers([]); // Limpiar usuarios en caso de error
        } finally {
            setLoading(false);
        }
    }, [usersPerPage]); // Dependencia para useCallback

    useEffect(() => {
        fetchUsers(currentPage);
    }, [fetchUsers, currentPage]); // Volver a cargar si la función fetchUsers o currentPage cambia

    const handleCreateUser = () => {
        console.log("UsersPage: handleCreateUser INVOCADO"); // <-- LOG
        setEditingUser(null);
        setIsModalOpen(true);
        console.log("UsersPage: setIsModalOpen(true) EJECUTADO"); // <-- LOG
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
        console.log("Editar usuario:", user);
        // Aquí abrirías un modal con un formulario precargado con datos del usuario
    };

     const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null); // Limpia el usuario en edición al cerrar
    };

    const handleSaveUser = () => {
        fetchUsers(currentPage); // Recargar la lista de usuarios después de guardar
        // setIsModalOpen(false); // El modal se cierra desde su propio handleClose
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
            try {
                await apiDeleteUser(userId);
                // alert("Usuario eliminado exitosamente");
                fetchUsers(currentPage); // Recargar la lista de usuarios
            } catch (err) {
                alert("Error al eliminar el usuario: " + (err.message || "Error desconocido"));
            }
        }
    };
    
    const handleRestoreUser = async (userId) => {
        // Implementar si tienes el campo 'eliminado' y la lógica
        // if (window.confirm("¿Estás seguro de que quieres restaurar este usuario?")) {
        // try {
        // await apiRestoreUser(userId);
        // fetchUsers(currentPage);
        // } catch (err) {
        // alert("Error al restaurar usuario: " + (err.message || "Error desconocido"));
        // }
        // }
        console.log("Restaurar usuario ID:", userId);
    };


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
        <div className="users-container">
            <Header title="Gestión de Usuarios" notificationCount={3} /> {/* Usamos el Header del Dashboard */}
            <div className="users-header-actions">
                {/* Aquí podrías añadir filtros si los implementas */}
                <div>{/* Placeholder para filtros */}</div>
                <button onClick={handleCreateUser} className="create-user-btn">
                    <FaUserPlus /> Crear Usuario
                </button>
            </div>

            {loading && <p className="loading-message">Cargando usuarios...</p>}
            {error && <p className="error-message-users">{error}</p>}
            
            {!loading && !error && (
                <UserTable 
                    users={users} 
                    onEdit={handleEditUser} 
                    onDelete={handleDeleteUser}
                    onRestore={handleRestoreUser} // Pasarías esto si implementas la lógica de restauración
                />
            )}

            {!loading && !error && totalUsers > 0 && (
                 <div className="pagination-controls">
                    <button onClick={goToPreviousPage} disabled={currentPage === 1}>
                        Anterior
                    </button>
                    {/* Renderizar algunos números de página - simplificado */}
                    {[...Array(totalPages).keys()].map(num => (
                        <button 
                            key={num + 1} 
                            onClick={() => goToPage(num + 1)}
                            disabled={currentPage === num + 1}
                            style={currentPage === num + 1 ? { backgroundColor: '#F47C34', borderColor: '#F47C34' } : {}}
                        >
                            {num + 1}
                        </button>
                    ))}
                    <button onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                        Siguiente
                    </button>
                    <span className="pagination-info">
                        Página {currentPage} de {totalPages} (Total: {totalUsers} usuarios)
                    </span>
                </div>
            )}

            {/* Aquí iría el UserFormModal si isModalOpen es true */}
            {console.log("UsersPage: RENDER - isModalOpen es:", isModalOpen)} 
            <UserFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                user={editingUser}
                onSave={handleSaveUser}
            />
        </div>
    );
};

export default UsersPage;