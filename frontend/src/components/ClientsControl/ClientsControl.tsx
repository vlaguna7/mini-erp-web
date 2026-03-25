import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import styles from './ClientsControl.module.css';

const ClientsControl: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Users size={24} className={styles.icon} />
        <h2 className={styles.title}>Controle de Clientes</h2>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => navigate('/vendas-e-clientes/cadastrar-cliente')}
        >
          <Plus size={18} />
          Cadastrar Cliente
        </button>

        <button
          className={`${styles.btn} ${styles.btnOutline}`}
          onClick={() => navigate('/vendas-e-clientes/lista-clientes')}
        >
          <Users size={18} />
          Lista de Clientes
        </button>
      </div>
    </div>
  );
};

export default ClientsControl;
