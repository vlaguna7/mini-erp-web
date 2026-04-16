import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Download, Upload, Edit2, Trash2, Users, Plus,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { clientService } from '../../services/clientService';
import styles from './ListaClientesPage.module.css';

function formatCpfCnpj(value?: string | null): string {
  if (!value) return '—';
  const d = value.replace(/\D/g, '');
  if (d.length === 11)
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14)
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return value;
}

function formatPhone(value?: string | null): string {
  if (!value) return '—';
  const d = value.replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return value;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

const ListaClientesPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await clientService.getClients(1, 10000);
      setClients(data.clients ?? []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Busca em tempo real: nome, CPF/CNPJ, e-mail
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const term = searchTerm.toLowerCase();
    const termDigits = term.replace(/\D/g, '');
    return clients.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        (termDigits && c.cpfCnpj?.includes(termDigits)) ||
        c.email?.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  // Reset página quando busca ou perPage mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, perPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage, perPage]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja remover este cliente?')) return;
    try {
      await clientService.deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
    }
  };

  const handleExport = useCallback(() => {
    const csv = [
      ['Nome', 'CPF/CNPJ', 'Telefone', 'Whatsapp', 'E-mail', 'Instagram', 'Gênero'].join(','),
      ...clients.map((c) =>
        [
          `"${c.name || ''}"`,
          c.cpfCnpj || '',
          c.phone || '',
          c.whatsapp || '',
          c.email || '',
          c.instagram || '',
          c.gender || '',
        ].join(',')
      ),
    ].join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clientes.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [clients]);

  // Gera números de página com ellipsis
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Lista de Clientes</h1>
        <p className={styles.subtitle}>Gerencie e visualize todos os seus clientes</p>
      </div>

      {/* Toolbar: Search + buttons */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.toolbarActions}>
          <button className={styles.btnTool} onClick={() => alert('Importação em breve!')} type="button">
            <Upload size={15} /> Importar
          </button>
          <button className={styles.btnTool} onClick={handleExport} type="button">
            <Download size={15} /> Exportar
          </button>
        </div>
        <button
          className={styles.btnPrimary}
          onClick={() => navigate('/vendas-e-clientes/cadastrar-cliente')}
          type="button"
        >
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      {/* Count */}
      <div className={styles.countBar}>
        <span className={styles.count}>
          {filtered.length} cliente(s) encontrado(s)
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Carregando clientes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <Users size={48} />
          <p>
            {clients.length === 0
              ? 'Nenhum cliente cadastrado ainda.'
              : 'Nenhum cliente encontrado com essa busca.'}
          </p>
          {clients.length === 0 && (
            <button
              className={styles.btnPrimary}
              onClick={() => navigate('/vendas-e-clientes/cadastrar-cliente')}
              type="button"
            >
              <Plus size={16} /> Cadastrar primeiro cliente
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF/CNPJ</th>
                  <th className={styles.mobileHide}>Vendedor</th>
                  <th>Telefone</th>
                  <th className={styles.mobileHide}>E-mail</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className={styles.nameCell}>
                        {client.photo ? (
                          <img src={client.photo} alt="" className={styles.clientPhoto} />
                        ) : (
                          <span className={styles.clientAvatar}>
                            {getInitials(client.name)}
                          </span>
                        )}
                        <span className={styles.clientName}>{client.name}</span>
                      </div>
                    </td>
                    <td className={styles.cellMuted}>{formatCpfCnpj(client.cpfCnpj)}</td>
                    <td className={`${styles.cellMuted} ${styles.mobileHide}`}>—</td>
                    <td className={styles.cellMuted}>
                      {formatPhone(client.whatsapp || client.phone)}
                    </td>
                    <td className={`${styles.cellMuted} ${styles.mobileHide}`}>
                      {client.email || '—'}
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          className={`${styles.iconBtn} ${styles.edit}`}
                          title="Editar"
                          onClick={() => navigate(`/vendas-e-clientes/editar-cliente/${client.id}`)}
                          type="button"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className={`${styles.iconBtn} ${styles.delete}`}
                          title="Excluir"
                          onClick={() => handleDelete(client.id)}
                          type="button"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <div className={styles.paginationLeft}>
              <span>Exibir</span>
              <select
                className={styles.perPageSelect}
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
              >
                {PER_PAGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <span>por página</span>
            </div>

            <div className={styles.paginationPages}>
              <button
                className={styles.pageBtn}
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                type="button"
              >
                <ChevronLeft size={14} />
              </button>
              {getPageNumbers().map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`e-${idx}`} className={styles.pageEllipsis}>…</span>
                ) : (
                  <button
                    key={item}
                    className={`${styles.pageBtn} ${currentPage === item ? styles.active : ''}`}
                    onClick={() => setCurrentPage(item as number)}
                    type="button"
                  >
                    {item}
                  </button>
                )
              )}
              <button
                className={styles.pageBtn}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                type="button"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ListaClientesPage;
