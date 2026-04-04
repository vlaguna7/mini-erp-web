import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, ArrowLeft, AlertCircle, Check, X } from 'lucide-react';
import styles from './SimpleListPage.module.css';

export interface SimpleItem {
  id: number;
  name: string;
  [key: string]: any;
}

interface SimpleListPageProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  backPath: string;
  items: SimpleItem[];
  loading: boolean;
  onCreate: (name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  createPlaceholder?: string;
  createLabel?: string;
  emptyText?: string;
  searchPlaceholder?: string;
  extraColumns?: { label: string; key: string; render?: (item: SimpleItem) => React.ReactNode }[];
}

const SimpleListPage: React.FC<SimpleListPageProps> = ({
  title, subtitle, icon, backPath, items, loading,
  onCreate, onDelete,
  createPlaceholder = 'Nome...',
  createLabel = 'Criar novo',
  emptyText = 'Nenhum item cadastrado.',
  searchPlaceholder = 'Buscar...',
  extraColumns = [],
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(term));
  }, [items, searchTerm]);

  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      await onCreate(newName.trim());
      setNewName('');
      setShowCreate(false);
      setSuccessMsg('Item criado com sucesso!');
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Erro ao criar.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Deseja remover este item?')) return;
    try {
      await onDelete(id);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao remover.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') { setShowCreate(false); setNewName(''); setError(''); }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(backPath)} type="button">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </header>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className={styles.btnPrimary}
          onClick={() => { setShowCreate(!showCreate); setError(''); }}
          type="button"
        >
          {showCreate ? <X size={16} /> : <Plus size={16} />}
          {showCreate ? 'Cancelar' : createLabel}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className={styles.createRow}>
          <input
            className={styles.createInput}
            type="text"
            placeholder={createPlaceholder}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={creating}
          />
          <button
            className={styles.createBtn}
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            type="button"
          >
            {creating ? 'Criando...' : 'Salvar'}
          </button>
        </div>
      )}

      {/* Feedback */}
      {error && (
        <div className={styles.errorMsg}>
          <AlertCircle size={14} /> {error}
        </div>
      )}
      {successMsg && (
        <div className={styles.successMsg}>
          <Check size={14} /> {successMsg}
        </div>
      )}

      {/* Count */}
      <div className={styles.countBar}>
        <span className={styles.count}>{filtered.length} item{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Carregando...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          {icon}
          <p>{items.length === 0 ? emptyText : 'Nenhum item encontrado com essa busca.'}</p>
          {items.length === 0 && (
            <button
              className={styles.btnPrimary}
              onClick={() => setShowCreate(true)}
              type="button"
            >
              <Plus size={16} /> {createLabel}
            </button>
          )}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Nome</th>
                {extraColumns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
                <th style={{ width: '80px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id}>
                  <td className={styles.cellMuted}>{idx + 1}</td>
                  <td className={styles.itemName}>{item.name}</td>
                  {extraColumns.map((col) => (
                    <td key={col.key} className={styles.cellMuted}>
                      {col.render ? col.render(item) : item[col.key] ?? '—'}
                    </td>
                  ))}
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        className={`${styles.iconBtn} ${styles.delete}`}
                        title="Excluir"
                        onClick={() => handleDelete(item.id)}
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
      )}
    </div>
  );
};

export default SimpleListPage;
