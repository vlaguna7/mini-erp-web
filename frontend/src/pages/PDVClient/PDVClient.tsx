import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User } from 'lucide-react';
import { clientService } from '../../services/clientService';
import { usePDVStore } from '../../store/pdvStore';
import styles from './PDVClient.module.css';

const PDVClient: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedClient, setSelectedClient } = usePDVStore();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await clientService.getClients();
      const list = Array.isArray(data) ? data : data?.clients ?? [];
      setClients(list);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = useMemo(
    () =>
      clients.filter(
        (c) =>
          c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.cpfCnpj?.includes(searchTerm) ||
          c.phone?.includes(searchTerm)
      ),
    [clients, searchTerm]
  );

  const handleSelectClient = (client: any) => {
    const id = String(client.id);
    if (selectedClient?.id === id) {
      setSelectedClient(null);
    } else {
      setSelectedClient({
        id,
        name: client.name,
        email: client.email || undefined,
        cpf: client.cpfCnpj || undefined,
        phone: client.phone || undefined,
      });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pdvClient}>
        <div className={styles.pdvClientsEmpty}>
          <p>Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pdvClient}>
      <div className={styles.pdvClientHeader}>
        <h2 className={styles.pdvClientTitle}>Cliente</h2>
      </div>

      <div className={styles.pdvClientSearch}>
        <input
          type="text"
          placeholder="Buscar por nome, email, CPF ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.pdvClientSearchInput}
        />
        <button
          onClick={() => navigate('/pdv/cliente/criar-cliente')}
          type="button"
          className={styles.pdvAddClientBtn}
        >
          <Plus size={16} />
          Adicionar Cliente
        </button>
      </div>

      {filteredClients.length === 0 ? (
        <div className={styles.pdvClientsEmpty}>
          <p>{clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}</p>
        </div>
      ) : (
        <div className={styles.pdvClientsList}>
          {filteredClients.map((client) => (
            <button
              key={client.id}
              className={`${styles.pdvClientItem} ${
                selectedClient?.id === String(client.id) ? styles.selected : ''
              }`}
              onClick={() => handleSelectClient(client)}
            >
              <div className={styles.pdvClientItemPhoto}>
                {client.photo ? (
                  <img src={client.photo} alt={client.name} className={styles.pdvClientPhotoImg} />
                ) : (
                  <User size={20} />
                )}
              </div>

              <div className={styles.pdvClientItemCol}>
                <span className={styles.pdvClientItemLabel}>NOME:</span>
                <span className={styles.pdvClientItemName}>{client.name}</span>
              </div>

              <div className={styles.pdvClientItemCol}>
                <span className={styles.pdvClientItemLabel}>CPF/CNPJ:</span>
                <span className={styles.pdvClientItemValue}>{client.cpfCnpj || '—'}</span>
              </div>

              <div className={styles.pdvClientItemCol}>
                <span className={styles.pdvClientItemLabel}>TELEFONE:</span>
                <span className={styles.pdvClientItemValue}>{client.phone || '—'}</span>
              </div>

              <div className={styles.pdvClientItemCol}>
                <span className={styles.pdvClientItemLabel}>EMAIL:</span>
                <span className={styles.pdvClientItemValue}>{client.email || '—'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PDVClient;
