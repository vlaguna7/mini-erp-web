import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { usePDVStore } from '../../store/pdvStore';
import styles from './PDVClient.module.css';

const MOCK_CLIENTS = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', cpf: '123.456.789-00', phone: '11999999999' },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', cpf: '987.654.321-00', phone: '11988888888' },
  { id: '3', name: 'Pedro Oliveira', email: 'pedro@email.com', cpf: '456.789.123-00', phone: '11977777777' },
];

const PDVClient: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients] = useState(MOCK_CLIENTS);
  const { selectedClient, setSelectedClient } = usePDVStore();

  const filteredClients = useMemo(
    () =>
      clients.filter(
        (c) =>
          c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.cpf?.includes(searchTerm)
      ),
    [clients, searchTerm]
  );

  return (
    <div className={styles.pdvClient}>
      <div className={styles.pdvClientHeader}>
        <h2 className={styles.pdvClientTitle}>Cliente</h2>
        <button className={styles.pdvAddClientBtn}>
          <Plus size={18} />
          Novo Cliente
        </button>
      </div>

      <div className={styles.pdvClientSearch}>
        <Search size={18} className={styles.pdvSearchIcon} />
        <input
          type="text"
          placeholder="Buscar por nome, email ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.pdvClientSearchInput}
        />
      </div>

      <div className={styles.pdvClientSelectedBox}>
        {selectedClient ? (
          <div className={styles.pdvClientSelectedInfo}>
            <p className={styles.pdvClientSelectedName}>{selectedClient.name}</p>
            <p className={styles.pdvClientSelectedMeta}>
              {selectedClient.email} • {selectedClient.cpf}
            </p>
            <button
              className={styles.pdvClientDeselectBtn}
              onClick={() => setSelectedClient(null)}
            >
              Desselecionar
            </button>
          </div>
        ) : (
          <p className={styles.pdvClientNoSelection}>Nenhum cliente selecionado</p>
        )}
      </div>

      {filteredClients.length === 0 ? (
        <div className={styles.pdvClientsEmpty}>
          <p>Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className={styles.pdvClientsList}>
          {filteredClients.map((client) => (
            <button
              key={client.id}
              className={`${styles.pdvClientItem} ${
                selectedClient?.id === client.id ? styles.selected : ''
              }`}
              onClick={() => setSelectedClient(client)}
            >
              <div className={styles.pdvClientCardName}>{client.name}</div>
              <div className={styles.pdvClientCardEmail}>{client.email}</div>
              <div className={styles.pdvClientCardCpf}>{client.cpf}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PDVClient;
