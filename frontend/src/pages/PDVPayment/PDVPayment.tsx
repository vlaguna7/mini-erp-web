import React from 'react';
import { DollarSign, Smartphone, CreditCard } from 'lucide-react';
import { usePDVStore } from '../../store/pdvStore';
import styles from './PDVPayment.module.css';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Dinheiro', icon: DollarSign, color: '#10b981' },
  { id: 'pix', label: 'Pix', icon: Smartphone, color: '#3b82f6' },
  { id: 'credit', label: 'Cartão de Crédito', icon: CreditCard, color: '#8b5cf6' },
  { id: 'debit', label: 'Cartão de Débito', icon: CreditCard, color: '#f59e0b' },
];

const PDVPayment: React.FC = () => {
  const { selectedPayment, setSelectedPayment } = usePDVStore();

  return (
    <div className={styles.pdvPayment}>
      <div className={styles.pdvPaymentHeader}>
        <h2 className={styles.pdvPaymentTitle}>Forma de Pagamento</h2>
      </div>

      <div className={styles.pdvPaymentMethods}>
        {PAYMENT_METHODS.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            className={`${styles.pdvPaymentCard} ${
              selectedPayment === id ? styles.selected : ''
            }`}
            onClick={() =>
              setSelectedPayment(selectedPayment === id ? null : (id as any))
            }
          >
            <div className={styles.pdvPaymentIcon} style={{ color }}>
              <Icon size={32} />
            </div>
            <span className={styles.pdvPaymentLabel}>{label}</span>
            {selectedPayment === id && (
              <div className={styles.pdvPaymentCheck}>✓</div>
            )}
          </button>
        ))}
      </div>

      {selectedPayment && (
        <div className={styles.pdvPaymentInfo}>
          <p>Forma de pagamento selecionada:</p>
          <p className={styles.pdvPaymentSelected}>
            {PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.label}
          </p>
        </div>
      )}
    </div>
  );
};

export default PDVPayment;
