import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Filter, Download, Upload,
  Edit2, Trash2, Package, ScanLine, BarChart2, List, Camera,
} from 'lucide-react';
import { productService } from '../../services/productService';
import ProductForm from '../../components/ProductForm';
import styles from './EstoquePage.module.css';

type ViewMode = 'cards' | 'table';

const getStatus = (product: any) => {
  const current = product.quantity_stock ?? 0;
  const min = product.min_stock ?? 0;
  if (current === 0) return 'sem-estoque';
  if (current <= min) return 'estoque-baixo';
  return 'normal';
};

const STATUS_LABEL: Record<string, string> = {
  normal: 'Normal',
  'estoque-baixo': 'Estoque baixo',
  'sem-estoque': 'Sem estoque',
};

const EstoquePage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(Array.isArray(data) ? data : data?.products ?? []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = products.map((p) => p.category).filter(Boolean);
    return [...new Set(cats)].sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !categoryFilter || p.category === categoryFilter;
      const matchStatus = !statusFilter || getStatus(p) === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: products.length,
    normal: products.filter((p) => getStatus(p) === 'normal').length,
    baixo: products.filter((p) => getStatus(p) === 'estoque-baixo').length,
    semEstoque: products.filter((p) => getStatus(p) === 'sem-estoque').length,
  }), [products]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja remover este produto?')) return;
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingProduct(null);
    await loadProducts();
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Nome', 'Código', 'Categoria', 'Preço Custo', 'Preço Venda', 'Estoque', 'Estoque Mín'].join(','),
      ...products.map((p) =>
        [
          p.id, p.name, p.code, p.category,
          p.price_cost, p.price_sale, p.quantity_stock, p.min_stock,
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'estoque.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      isNaN(v) ? 0 : v
    );

  return (
    <div className={styles.estoque}>
      {/* ── Header ── */}
      <div className={styles.estoqueHeader}>
        <div>
          <h1 className={styles.estoqueTitle}>Controle de Estoque</h1>
          <p className={styles.estoqueSubtitle}>Gerencie seus produtos e quantidades</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className={styles.estoqueStats}>
        <div className={`${styles.estoqueStat} ${styles.blue}`}>
          <span className={styles.estoqueStatValue}>{stats.total}</span>
          <span className={styles.estoqueStatLabel}>Total Produtos</span>
        </div>
        <div className={`${styles.estoqueStat} ${styles.green}`}>
          <span className={styles.estoqueStatValue}>{stats.normal}</span>
          <span className={styles.estoqueStatLabel}>Estoque Normal</span>
        </div>
        <div className={`${styles.estoqueStat} ${styles.orange}`}>
          <span className={styles.estoqueStatValue}>{stats.baixo}</span>
          <span className={styles.estoqueStatLabel}>Estoque Baixo</span>
        </div>
        <div className={`${styles.estoqueStat} ${styles.red}`}>
          <span className={styles.estoqueStatValue}>{stats.semEstoque}</span>
          <span className={styles.estoqueStatLabel}>Sem Estoque</span>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className={styles.estoqueFilters}>
        <div className={styles.estoqueSearchWrap}>
          <Search size={16} className={styles.estoqueSearchIcon} />
          <input
            className={styles.estoqueSearch}
            type="text"
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className={styles.estoqueSelect}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Todas Categorias</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          className={styles.estoqueSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos Status</option>
          <option value="normal">Normal</option>
          <option value="estoque-baixo">Estoque Baixo</option>
          <option value="sem-estoque">Sem Estoque</option>
        </select>
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.estoqueToolbar}>
        <button className={styles.estoqueBtnTool} onClick={() => alert('Scanner em breve!')}>
          <ScanLine size={15} /> Scanner
        </button>
        <button className={styles.estoqueBtnTool}>
          <Filter size={15} /> Filtros
        </button>
        <button className={styles.estoqueBtnTool} onClick={handleExport}>
          <Download size={15} /> Exportar
        </button>
        <button className={styles.estoqueBtnTool} onClick={() => alert('Em breve!')}>
          <Upload size={15} /> Importar
        </button>
        <div className={styles.estoqueToolbarRight}>
          <span className={styles.estoqueCount}>{filtered.length} produto(s) encontrado(s)</span>
          <button
            className={`${styles.estoqueViewBtn} ${viewMode === 'cards' ? styles.active : ''}`}
            onClick={() => setViewMode('cards')}
            title="Visualização em cards"
          >
            <List size={16} />
          </button>
          <button
            className={`${styles.estoqueViewBtn} ${viewMode === 'table' ? styles.active : ''}`}
            onClick={() => setViewMode('table')}
            title="Visualização em tabela"
          >
            <BarChart2 size={16} />
          </button>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className={styles.estoqueActions}>
        <button
          className={styles.estoqueBtnPrimary}
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
        >
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      {/* ── Form Modal ── */}
      {showForm && (
        <div className={styles.estoqueModalOverlay} onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); setEditingProduct(null); } }}>
          <div className={styles.estoqueModal}>
            <ProductForm
              onSuccess={handleFormSuccess}
              onCancel={() => { setShowForm(false); setEditingProduct(null); }}
              initialProduct={editingProduct}
            />
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className={styles.estoqueContent}>
        {isLoading ? (
          <div className={styles.estoqueLoading}>
            <div className={styles.estoqueSpinner} />
            <p>Carregando produtos...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.estoqueEmpty}>
            <Package size={48} />
            <p>{products.length === 0 ? 'Nenhum produto cadastrado ainda.' : 'Nenhum produto encontrado com esses filtros.'}</p>
            {products.length === 0 && (
              <button className={styles.estoqueBtnPrimary} onClick={() => setShowForm(true)}>
                <Plus size={16} /> Adicionar primeiro produto
              </button>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          <div className={styles.estoqueRowList}>
            {filtered.map((product) => (
              <div key={product.id} className={styles.estoqueRow}>
                {/* Col 1: Image Placeholder */}
                <div className={styles.estoqueRowImg}>
                  <Camera size={20} />
                </div>

                {/* Col 2: Category + Name */}
                <div className={styles.estoqueRowInfo}>
                  <span className={styles.estoqueRowCategory}>Categoria: {product.category || '—'}</span>
                  <span className={styles.estoqueRowName}>{product.name}</span>
                </div>

                {/* Col 3: SKU + Barcode */}
                <div className={styles.estoqueRowTech}>
                  <span className={styles.estoqueRowSku}>{product.code || '—'}</span>
                  <span className={styles.estoqueRowBarcode}>
                    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className={styles.barcodeIcon}>
                      <rect x="0" y="0" width="2" height="12" fill="currentColor"/>
                      <rect x="3" y="0" width="1" height="12" fill="currentColor"/>
                      <rect x="5" y="0" width="2" height="12" fill="currentColor"/>
                      <rect x="8" y="0" width="1" height="12" fill="currentColor"/>
                      <rect x="10" y="0" width="2" height="12" fill="currentColor"/>
                      <rect x="13" y="0" width="1" height="12" fill="currentColor"/>
                      <rect x="15" y="0" width="1" height="12" fill="currentColor"/>
                    </svg>
                    {product.code || '—'}
                  </span>
                </div>

                {/* Col 4: Price + Quantity */}
                <div className={styles.estoqueRowCommercial}>
                  <span className={styles.estoqueRowPrice}>
                    {formatCurrency(parseFloat(product.price_sale) || 0)}
                  </span>
                  <span className={styles.estoqueRowQty}>
                    {product.quantity_stock ?? 0}
                    <span className={styles.estoqueRowUnit}>UN</span>
                  </span>
                </div>

                {/* Actions */}
                <div className={styles.estoqueRowActions}>
                  <button
                    className={`${styles.estoqueIconBtn} ${styles.edit}`}
                    onClick={() => handleEdit(product)}
                    title="Editar"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    className={`${styles.estoqueIconBtn} ${styles.delete}`}
                    onClick={() => handleDelete(product.id?.toString())}
                    title="Deletar"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Table view
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(15,23,42,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Nome</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Código</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Categoria</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Preço</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Estoque</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Mín.</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Status</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontWeight: 600, color: '#475569' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => {
                  const status = getStatus(product);
                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#1e293b' }}>{product.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{product.code || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{product.category || '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b', textAlign: 'right' }}>{formatCurrency(parseFloat(product.price_sale) || 0)}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b', textAlign: 'center' }}>{product.quantity_stock ?? 0}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b', textAlign: 'center' }}>{product.min_stock ?? '—'}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '4px', background: status === 'normal' ? '#dcfce7' : status === 'estoque-baixo' ? '#fed7aa' : '#fee2e2', color: status === 'normal' ? '#166534' : status === 'estoque-baixo' ? '#b45309' : '#991b1b' }}>
                          {STATUS_LABEL[status]}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button
                            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '6px', color: '#2563eb', cursor: 'pointer', transition: 'all 0.15s' }}
                            onClick={() => handleEdit(product)}
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', transition: 'all 0.15s' }}
                            onClick={() => handleDelete(product.id?.toString())}
                            title="Deletar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstoquePage;