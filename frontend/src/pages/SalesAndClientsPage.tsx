import React from 'react';
import { ClientsControl } from '../components/ClientsControl';
import { SalesManagement } from '../components/SalesManagement';
import './SalesAndClientsPage.css';

export const SalesAndClientsPage: React.FC = () => {
  return (
    <div className="sales-clients">
      <header className="sales-clients-header">
        <h1 className="sales-clients-title">Vendas e Clientes</h1>
      </header>

      <div className="sales-clients-container">
        <section className="sales-clients-column">
          <ClientsControl />
        </section>

        <section className="sales-clients-column">
          <SalesManagement />
        </section>
      </div>
    </div>
  );
};
