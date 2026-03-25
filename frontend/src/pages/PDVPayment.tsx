import React from 'react';
import { DollarSign, Smartphone, CreditCard } from 'lucide-react';
import { usePDVStore } from '../store/pdvStore';
import './PDVPayment.css';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Dinheiro', icon: DollarSign, color: '#10b981' },
  { id: 'pix', label: 'Pix', icon: Smartphone, color: '#3b82f6' },
  { id: 'credit', label: 'Cartão de Crédito', icon: CreditCard, color: '#8b5cf6' },
  { id: 'debit', label: 'Cartão de Débito', icon: CreditCard, color: '#f59e0b' },
];

export const PDVPayment: React.FC = () => {
  const { selectedPayment, setSelectedPayment } = usePDVStore();

  return (
    <div className="pdv-payment">
      <div className="pdv-payment-header">
        <h2 className="pdv-payment-title">Forma de Pagamento</h2>
      </div>

      <div className="pdv-payment-methods">
        {PAYMENT_METHODS.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            className={`pdv-payment-card ${
              selectedPayment === id ? 'selected' : ''
            }`}
            onClick={() =>
              setSelectedPayment(selectedPayment === id ? null : (id as any))
            }
          >
            <div className="pdv-payment-icon" style={{ color }}>
              <Icon size={32} />
            </div>
            <span className="pdv-payment-label">{label}</span>
            {selectedPayment === id && (
              <div className="pdv-payment-check">✓</div>
            )}
          </button>
        ))}
      </div>

      {selectedPayment && (
        <div className="pdv-payment-info">
          <p>Forma de pagamento selecionada:</p>
          <p className="pdv-payment-selected">
            {PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.label}
          </p>
        </div>
      )}
    </div>
  );
};
