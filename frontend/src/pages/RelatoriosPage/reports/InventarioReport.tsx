import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { reportService } from '../../../services/reportService';
import s from '../ReportStyles.module.css';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const InventarioReport: React.FC = () => {
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setData(await reportService.stockInventoryReport()); }
    catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const stockBadge = (stock: number, min: number) => {
    if (stock <= 0) return <span className={`${s.badge} ${s.badgeRed}`}>Sem estoque</span>;
    if (min > 0 && stock <= min) return <span className={`${s.badge} ${s.badgeYellow}`}>Estoque baixo</span>;
    return <span className={`${s.badge} ${s.badgeGreen}`}>OK</span>;
  };

  return (
    <div className={s.page}>
      <div className={s.headerRow}>
        <button className={s.backBtn} onClick={() => nav('/relatorios')}><ArrowLeft size={16} /> Voltar</button>
        <h1 className={s.title}>Inventário de Estoque</h1>
      </div>
      <p className={s.subtitle}>Visão geral do estoque atual com valores e alertas.</p>

      {loading && <div className={s.loading}>Carregando relatório...</div>}

      {data && !loading && (
        <>
          <div className={s.summaryGrid}>
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalProducts}</span><span className={s.summaryLabel}>Produtos</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalStock}</span><span className={s.summaryLabel}>Unidades em Estoque</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalStockValue)}</span><span className={s.summaryLabel}>Valor do Estoque</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue} style={{ color: '#eab308' }}>{data.summary.lowStock}</span><span className={s.summaryLabel}>Estoque Baixo</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue} style={{ color: '#dc2626' }}>{data.summary.outOfStock}</span><span className={s.summaryLabel}>Sem Estoque</span></div>
          </div>

          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Produto</th><th>Código</th><th>Estoque</th><th>Mín</th><th>Máx</th>
                  <th>Un</th><th>Custo</th><th>Preço Venda</th><th>Valor Estoque</th>
                  <th>Categoria</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.length === 0
                  ? <tr><td colSpan={11} className={s.emptyState}>Nenhum produto cadastrado.</td></tr>
                  : data.rows.map((r: any) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.code || '—'}</td>
                      <td>{r.stock}</td>
                      <td>{r.minStock}</td>
                      <td>{r.maxStock}</td>
                      <td>{r.unitType}</td>
                      <td className={s.mono}>{fmt(r.priceCost)}</td>
                      <td className={s.mono}>{fmt(r.priceSale)}</td>
                      <td className={s.mono}>{fmt(r.stockValue)}</td>
                      <td>{r.category}</td>
                      <td>{stockBadge(r.stock, r.minStock)}</td>
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

export default InventarioReport;
