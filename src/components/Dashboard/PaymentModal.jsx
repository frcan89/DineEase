// src/components/Dashboard/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { payOrder } from '../../services/orderService';
import { FaTimes } from 'react-icons/fa';
// Reutilizamos el CSS global para modales y formularios
import './PaymentModal.css'; // CSS específico si es necesario

const PAYMENT_METHODS = [
    'Efectivo', 'Tarjeta Credito', 'Tarjeta Debito', 'Transferencia', 'Otro'
];

const PaymentModal = ({ isOpen, onClose, order, onSave }) => {
    // === ESTADOS ===
    const [montoRecibido, setMontoRecibido] = useState('');
    const [metodoPago, setMetodoPago] = useState('Efectivo');
    const [cambio, setCambio] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const totalAPagar = order?.subtotal || 0;

    // --- LÓGICA DE CÁLCULO DE CAMBIO ---
    useEffect(() => {
        if (isOpen) {
            // Resetear el estado al abrir
            setMontoRecibido('');
            setMetodoPago('Efectivo');
            setCambio(0);
            setError('');
        }
    }, [isOpen]);

    useEffect(() => {
        const montoNum = parseFloat(montoRecibido);
        if (!isNaN(montoNum) && montoNum >= totalAPagar) {
            setCambio(montoNum - totalAPagar);
        } else {
            setCambio(0);
        }
    }, [montoRecibido, totalAPagar]);

    // --- MANEJADORES DE EVENTOS ---

    const handleMontoChange = (e) => {
        setMontoRecibido(e.target.value);
    };

    const validate = () => {
        const montoNum = parseFloat(montoRecibido);
        if (isNaN(montoNum) || montoNum < totalAPagar) {
            setError(`El monto recibido debe ser al menos ${formatCurrency(totalAPagar)}.`);
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setError('');

        const payload = {
            monto: parseFloat(montoRecibido),
            metodo_pago: metodoPago,
        };

        try {
            await payOrder(order.id_pedido, payload);
            onSave(); // Notifica al padre para recargar y cerrar
        } catch (err) {
            setError(err.message || "Ocurrió un error al procesar el pago.");
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value || 0);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <button className="modal-close-btn" onClick={onClose} disabled={isLoading}><FaTimes /></button>
                <h2>Registrar Pago para Pedido #{order.id_pedido}</h2>
                {error && <p className="modal-error-message">{error}</p>}

                <div className="payment-summary">
                    <div className="summary-item">
                        <span>Total a Pagar:</span>
                        <strong className="total-amount">{formatCurrency(totalAPagar)}</strong>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="metodo_pago">Método de Pago *</label>
                        <select id="metodo_pago" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} disabled={isLoading}>
                            {PAYMENT_METHODS.map(method => (
                                <option key={method} value={method}>{method.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="montoRecibido">Monto Recibido *</label>
                        <input
                            type="number"
                            id="montoRecibido"
                            value={montoRecibido}
                            onChange={handleMontoChange}
                            step="0.01"
                            min={totalAPagar}
                            placeholder="Ingrese el monto entregado por el cliente"
                            disabled={isLoading}
                        />
                    </div>
                    
                    {cambio > 0 && (
                        <div className="payment-summary change-summary">
                            <div className="summary-item">
                                <span>Cambio a Devolver:</span>
                                <strong className="change-amount">{formatCurrency(cambio)}</strong>
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>Cancelar</button>
                        <button type="submit" className="btn btn-success" disabled={isLoading}>
                            {isLoading ? 'Procesando...' : 'Confirmar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;