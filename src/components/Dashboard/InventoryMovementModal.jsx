// src/components/Dashboard/InventoryMovementModal.jsx
import React, { useState } from 'react';
import { registerInventoryMovement } from '../../services/inventoryService';
import './UserFormModal.css'; // Reutilizamos estilos
import { FaTimes } from 'react-icons/fa';

const MOVEMENT_TYPES = [
    'ENTRADA_COMPRA', 'ENTRADA_AJUSTE', 'ENTRADA_DEVOLUCION_CLIENTE',
    'SALIDA_VENTA', 'SALIDA_CONSUMO_INTERNO', 'SALIDA_MERMA', 'SALIDA_AJUSTE',
    'SALIDA_DEVOLUCION_PROVEEDOR'
];

const InventoryMovementModal = ({ isOpen, onClose, product, onSave }) => {
    const [tipoMovimiento, setTipoMovimiento] = useState('ENTRADA_COMPRA');
    const [cantidad, setCantidad] = useState('');
    const [precioCompra, setPrecioCompra] = useState('');
    const [motivo, setMotivo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cantidad || parseInt(cantidad, 10) <= 0) {
            setError("La cantidad debe ser un número positivo.");
            return;
        }
        
        setIsLoading(true);
        setError('');

        const payload = {
            id_producto: product.id_producto,
            tipo_movimiento: tipoMovimiento,
            cantidad_movida: parseInt(cantidad, 10),
            motivo: motivo.trim() || null,
            precio_compra_unitario_movimiento: tipoMovimiento === 'ENTRADA_COMPRA' ? parseFloat(precioCompra) : null,
        };
        
        try {
            await registerInventoryMovement(payload);
            onSave();
        } catch (err) {
            setError(err.message || "Error al registrar el movimiento.");
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-btn" onClick={onClose} disabled={isLoading}><FaTimes /></button>
                <h2>Registrar Movimiento para: {product.nombre}</h2>
                <p>Stock actual: {product.Inventario?.cantidad ?? 0} {product.unidad_medida}</p>
                {error && <p className="modal-error-message">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="tipo_movimiento">Tipo de Movimiento *</label>
                        <select id="tipo_movimiento" value={tipoMovimiento} onChange={(e) => setTipoMovimiento(e.target.value)} disabled={isLoading}>
                            {MOVEMENT_TYPES.map(type => (
                                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="cantidad">Cantidad Movida *</label>
                        <input type="number" id="cantidad" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" disabled={isLoading} />
                    </div>

                    {tipoMovimiento === 'ENTRADA_COMPRA' && (
                        <div className="form-group">
                            <label htmlFor="precio_compra">Precio de Compra Unitario (opcional)</label>
                            <input type="number" step="0.01" id="precio_compra" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} min="0" disabled={isLoading} />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label htmlFor="motivo">Motivo (ej. Merma por producto dañado)</label>
                        <textarea id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} rows="3" disabled={isLoading}></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>Cancelar</button>
                        <button type="submit" className="btn-save" disabled={isLoading}>
                            {isLoading ? 'Registrando...' : 'Registrar Movimiento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InventoryMovementModal;