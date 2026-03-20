import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Filter, Download, Upload,
  Edit2, Trash2, Package, ScanLine, BarChart2, List,
} from 'lucide-react';
import { productService } from '../services/productService';
import { ProductForm } from '../components/ProductForm';
import './EstoquePage.css';

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

export const EstoquePage: React.FC = () => {
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
    <div className="estoque">
      {/* ── Header ── */}
      <div className="estoque-header">
        <div>
          <h1 className="estoque-title">Controle de Estoque</h1>
          <p className="estoque-subtitle">Gerencie seus produtos e quantidades</p>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="estoque-actions">
        <button className="estoque-btn-outline" onClick={handleExport}>
          <Download size={16} /> Exportar
        </button>
        <button className="estoque-btn-outline" onClick={() => alert('Em breve!')}>
          <Upload size={16} /> Importar
        </button>
        <button
          className="estoque-btn-primary"
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
        >
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="estoque-stats">
        <div className="estoque-stat blue">
          <span className="estoque-stat-value">{stats.total}</span>
          <span className="estoque-stat-label">Total Produtos</span>
        </div>
        <div className="estoque-stat green">
          <span className="estoque-stat-value">{stats.normal}</span>
          <span className="estoque-stat-label">Estoque Normal</span>
        </div>
        <div className="estoque-stat orange">
          <span className="estoque-stat-value">{stats.baixo}</span>
          <span className="estoque-stat-label">Estoque Baixo</span>
        </div>
        <div className="estoque-stat red">
          <span className="estoque-stat-value">{stats.semEstoque}</span>
          <span className="estoque-stat-label">Sem Estoque</span>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="estoque-filters">
        <div className="estoque-search-wrap">
          <Search size={16} className="estoque-search-icon" />
          <input
            className="estoque-search"
            type="text"
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="estoque-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Todas Categorias</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          className="estoque-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos Status</option>
          <option value="normal">Normal</option>
          <option value="estoque-baixo">Estoque Baixo</option>
          <option value="sem-estoque">Sem Estoque</option>
        </select>
      </div>

      {/* ── Secondary toolbar ── */}
      <div className="estoque-toolbar">
        <button className="estoque-btn-tool" onClick={() => alert('Scanner em breve!')}>
          <ScanLine size={15} /> Scanner
        </button>
        <button className="estoque-btn-tool">
          <Filter size={15} /> Filtros
        </button>
        <div className="estoque-toolbar-right">
          <span className="estoque-count">{filtered.length} produto(s) encontrado(s)</span>
          <button
            className={`estoque-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
            onClick={() => setViewMode('cards')}
            title="Visualização em cards"
          >
            <List size={16} />
          </button>
          <button
            className={`estoque-view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Visualização em tabela"
          >
            <BarChart2 size={16} />
          </button>
        </div>
      </div>

      {/* ── Form Modal ── */}
      {showForm && (
        <div className="estoque-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); setEditingProduct(null); } }}>
          <div className="estoque-modal">
            <ProductForm
              onSuccess={handleFormSuccess}
              onCancel={() => { setShowForm(false); setEditingProduct(null); }}
              initialProduct={editingProduct}
            />
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <div className="estoque-loading">
          <div className="estoque-spinner" />
          <p>Carregando produtos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="estoque-empty">
          <Package size={48} />
          <p>{products.length === 0 ? 'Nenhum produto cadastrado ainda.' : 'Nenhum produto encontrado com esses filtros.'}</p>
          {products.length === 0 && (
            <button className="estoque-btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Adicionar primeiro produto
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        <div className="estoque-card-list">
          {filtered.map((product) => {
            const status = getStatus(product);
            return (
              <div key={product.id} className="estoque-card">
                <div className="estoque-card-main">
                  <div className="estoque-card-icon">
                    <Package size={22} />
                  </div>
                  <div className="estoque-card-info">
                    <div className="estoque-card-name-row">
                      <span className="estoque-card-name">{product.name}</span>
                      <span className={`estoque-badge estoque-badge--${status}`}>
                        {STATUS_LABEL[status]}
                      </span>
                    </div>
                    <span className="estoque-card-meta">
                      Código: {product.code || '—'} · {product.quantity_stock ?? 0} unidades
                    </span>
                    <span className="estoque-card-category">{product.category || '—'}</span>
                  </div>
                  <div className="estoque-card-qty">
                    <span className={`estoque-qty-badge estoque-qty-badge--${status}`}>
                      {product.quantity_stock ?? 0}
                    </span>
                  </div>
                </div>

                <div className="estoque-card-footer">
                  <span className="estoque-card-price">
                    Preço: {formatCurrency(parseFloat(product.price_sale) || 0)}
                  </span>
                  <span className="estoque-card-min">
                    Estoque mín: {product.min_stock ?? '—'}
                  </span>
                  <div className="estoque-card-actions">
                    <button
                      className="estoque-icon-btn edit"
                      onClick={() => handleEdit(product)}
                      title="Editar"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="estoque-icon-btn delete"
                      onClick={() => handleDelete(product.id?.toString())}
                      title="Deletar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Table view
        <div className="estoque-table-wrapper">
          <table className="estoque-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Código</th>
                <th>Categoria</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Mín.</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const status = getStatus(product);
                return (
                  <tr key={product.id}>
                    <td className="cell-name"><strong>{product.name}</strong></td>
                    <td>{product.code || '—'}</td>
                    <td>{product.category || '—'}</td>
                    <td>{formatCurrency(parseFloat(product.price_sale) || 0)}</td>
                    <td>{product.quantity_stock ?? 0}</td>
                    <td>{product.min_stock ?? '—'}</td>
                    <td>
                      <span className={`estoque-badge estoque-badge--${status}`}>
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <button className="estoque-icon-btn edit" onClick={() => handleEdit(product)} title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button className="estoque-icon-btn delete" onClick={() => handleDelete(product.id?.toString())} title="Deletar">
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
  );
};