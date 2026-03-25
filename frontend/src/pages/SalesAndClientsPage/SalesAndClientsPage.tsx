import React from 'react';
import ClientsControl from '../../components/ClientsControl';
import SalesManagement from '../../components/SalesManagement';
import styles from './SalesAndClientsPage.module.css';

const SalesAndClientsPage: React.FC = () => {
  return (
    <div className={styles.salesClients}>
      <header className={styles.salesClientsHeader}>
        <h1 className={styles.salesClientsTitle}>Vendas e Clientes</h1>
      </header>

      <div className={styles.salesClientsContainer}>
        <section className={styles.salesClientsColumn}>
          <ClientsControl />
        </section>

        <section className={styles.salesClientsColumn}>
          <SalesManagement />
        </section>
      </div>
    </div>
  );
};

export default SalesAndClientsPage;
