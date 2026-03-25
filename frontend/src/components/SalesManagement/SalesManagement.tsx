import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, RotateCcw } from 'lucide-react';
import styles from './SalesManagement.module.css';

const SalesManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <ShoppingCart size={24} className={styles.icon} />
        <h2 className={styles.title}>Gestão de Vendas</h2>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => navigate('/vendas-e-clientes/lancar-venda')}
        >
          <ShoppingCart size={18} />
          Lançar Venda
        </button>

        <button
          className={`${styles.btn} ${styles.btnOutline}`}
          onClick={() => navigate('/vendas-e-clientes/lancar-devolucao')}
        >
          <RotateCcw size={18} />
          Lançar Devolução de Venda
        </button>
      </div>
    </div>
  );
};

export default SalesManagement;
