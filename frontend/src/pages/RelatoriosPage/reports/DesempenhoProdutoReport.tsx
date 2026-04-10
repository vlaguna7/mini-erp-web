import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { reportService } from '../../../services/reportService';
import { productCategoryService } from '../../../services/productCategoryService';
import { productBrandService } from '../../../services/productBrandService';
import { productCollectionService } from '../../../services/productCollectionService';
import { supplierService } from '../../../services/supplierService';
import { employeeService } from '../../../services/employeeService';
import s from '../ReportStyles.module.css';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const DesempenhoProdutoReport: React.FC = () => {
  const nav = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);

  useEffect(() => {
    productCategoryService.getAll().then(setCategories).catch(() => {});
    productBrandService.getAll().then(setBrands).catch(() => {});
    productCollectionService.getAll().then(setCollections).catch(() => {});
    supplierService.getAll().then(setSuppliers).catch(() => {});
    employeeService.getAll().then(setSellers).catch(() => {});
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      setData(await reportService.productPerformanceReport({
        date_from: dateFrom, date_to: dateTo,
        category_id: categoryId ? Number(categoryId) : undefined,
        brand_id: brandId ? Number(brandId) : undefined,
        collection_id: collectionId ? Number(collectionId) : undefined,
        supplier_id: supplierId ? Number(supplierId) : undefined,
        seller_id: sellerId ? Number(sellerId) : undefined,
      }));
    } catch { /* */ } finally { setLoading(false); }
  };

  return (
    <div className={s.page}>
      <div className={s.headerRow}>
        <button className={s.backBtn} onClick={() => nav('/relatorios')}><ArrowLeft size={16} /> Voltar</button>
        <h1 className={s.title}>Desempenho por Produto</h1>
      </div>
      <p className={s.subtitle}>Histórico de vendas por produto com quantidade, faturamento e lucro bruto.</p>

      <div className={s.filterBar}>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Data inicial</label>
          <input type="date" className={s.filterInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Data final</label>
          <input type="date" className={s.filterInput} value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Categoria</label>
          <select className={s.filterSelect} value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Todas</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Marca</label>
          <select className={s.filterSelect} value={brandId} onChange={e => setBrandId(e.target.value)}>
            <option value="">Todas</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Coleção</label>
          <select className={s.filterSelect} value={collectionId} onChange={e => setCollectionId(e.target.value)}>
            <option value="">Todas</option>
            {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Fornecedor</label>
          <select className={s.filterSelect} value={supplierId} onChange={e => setSupplierId(e.target.value)}>
            <option value="">Todos</option>
            {suppliers.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
          </select>
        </div>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Vendedor</label>
          <select className={s.filterSelect} value={sellerId} onChange={e => setSellerId(e.target.value)}>
            <option value="">Todos</option>
            {sellers.map(sl => <option key={sl.id} value={sl.id}>{sl.name}</option>)}
          </select>
        </div>
        <button className={s.filterBtn} onClick={load} disabled={loading}><Search size={16} /> {loading ? 'Carregando...' : 'Filtrar'}</button>
      </div>

      {loading && <div className={s.loading}>Carregando relatório...</div>}

      {data && !loading && (
        <>
          <div className={s.summaryGrid}>
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalProducts}</span><span className={s.summaryLabel}>Produtos</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalQuantity}</span><span className={s.summaryLabel}>Quantidade Vendida</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalRevenue)}</span><span className={s.summaryLabel}>Faturamento</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalCost)}</span><span className={s.summaryLabel}>Custo Total</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue} style={{ color: data.summary.totalProfit >= 0 ? '#059669' : '#dc2626' }}>{fmt(data.summary.totalProfit)}</span><span className={s.summaryLabel}>Lucro Bruto</span></div>
          </div>

          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Produto</th><th>Código</th><th>Qtd Vendida</th><th>Devoluções</th><th>Faturamento</th><th>Custo</th><th>Lucro Bruto</th></tr></thead>
              <tbody>
                {data.rows.length === 0
                  ? <tr><td colSpan={7} className={s.emptyState}>Nenhum produto vendido no período.</td></tr>
                  : data.rows.map((r: any) => (
                    <tr key={r.productId}>
                      <td>{r.name}</td>
                      <td>{r.code || '—'}</td>
                      <td>{r.quantitySold}</td>
                      <td>{r.returns}</td>
                      <td className={s.mono}>{fmt(r.revenue)}</td>
                      <td className={s.mono}>{fmt(r.cost)}</td>
                      <td className={s.mono} style={{ color: r.grossProfit >= 0 ? '#059669' : '#dc2626' }}>{fmt(r.grossProfit)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default DesempenhoProdutoReport;
