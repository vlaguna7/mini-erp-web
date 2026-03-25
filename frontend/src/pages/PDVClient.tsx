import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { usePDVStore } from '../store/pdvStore';
import './PDVClient.css';

const MOCK_CLIENTS = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', cpf: '123.456.789-00', phone: '11999999999' },
  { id: '2', name: 'Maria Santos', email: 'maria@email.com', cpf: '987.654.321-00', phone: '11988888888' },
  { id: '3', name: 'Pedro Oliveira', email: 'pedro@email.com', cpf: '456.789.123-00', phone: '11977777777' },
];

export const PDVClient: React.FC = () => {
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
    <div className="pdv-client">
      <div className="pdv-client-header">
        <h2 className="pdv-client-title">Cliente</h2>
        <button className="pdv-client-add-btn">
          <Plus size={18} />
          Novo Cliente
        </button>
      </div>

      <div className="pdv-client-search">
        <Search size={18} className="pdv-search-icon" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pdv-search-input"
        />
      </div>

      <div className="pdv-client-selected">
        {selectedClient ? (
          <div className="pdv-client-selected-info">
            <p className="pdv-client-selected-name">{selectedClient.name}</p>
            <p className="pdv-client-selected-meta">
              {selectedClient.email} • {selectedClient.cpf}
            </p>
            <button
              className="pdv-client-deselect-btn"
              onClick={() => setSelectedClient(null)}
            >
              Desselecionar
            </button>
          </div>
        ) : (
          <p className="pdv-client-no-selection">Nenhum cliente selecionado</p>
        )}
      </div>

      {filteredClients.length === 0 ? (
        <div className="pdv-client-empty">
          <p>Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="pdv-client-list">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              className={`pdv-client-card ${
                selectedClient?.id === client.id ? 'selected' : ''
              }`}
              onClick={() => setSelectedClient(client)}
            >
              <div className="pdv-client-card-name">{client.name}</div>
              <div className="pdv-client-card-email">{client.email}</div>
              <div className="pdv-client-card-cpf">{client.cpf}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
