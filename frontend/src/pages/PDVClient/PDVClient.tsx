import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, User, Wallet } from 'lucide-react';
import { clientService } from '../../services/clientService';
import { usePDVStore } from '../../store/pdvStore';
import styles from './PDVClient.module.css';

const ITEMS_PER_PAGE = 5;

const PDVClient: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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
        creditBalance: Number(client.creditBalance ?? 0) || 0,
      });
    }
  };

  const fmtCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
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
        <>
        <div className={styles.pdvClientsList}>
          {paginatedClients.map((client) => (
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

              {Number(client.creditBalance ?? 0) > 0 && (
                <div className={`${styles.pdvClientItemCol} ${styles.pdvClientItemColCredit}`}>
                  <span className={styles.pdvClientItemLabel}>SALDO:</span>
                  <span className={styles.pdvClientCreditBadge}>
                    <Wallet size={12} /> {fmtCurrency(Number(client.creditBalance))}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
          {totalPages > 1 && (
            <div className={styles.pdvPagination}>
              <button
                className={styles.pdvPageBtn}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                «
              </button>
              <button
                className={styles.pdvPageBtn}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 7) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .reduce<(number | string)[]>((acc, page, idx, arr) => {
                  if (idx > 0 && typeof arr[idx - 1] === 'number' && (page as number) - (arr[idx - 1] as number) > 1) {
                    acc.push('...');
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((page, idx) =>
                  typeof page === 'string' ? (
                    <span key={`dots-${idx}`} className={styles.pdvPageDots}>…</span>
                  ) : (
                    <button
                      key={page}
                      className={`${styles.pdvPageNum} ${currentPage === page ? styles.pdvPageActive : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}

              <button
                className={styles.pdvPageBtn}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
              <button
                className={styles.pdvPageBtn}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          )}
        </>      )}
    </div>
  );
};

export default PDVClient;
