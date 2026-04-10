import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { reportService } from '../../../services/reportService';
import s from '../ReportStyles.module.css';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const ComissoesReport: React.FC = () => {
  const nav = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [rate, setRate] = useState('5');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setData(await reportService.commissionsReport({ date_from: dateFrom, date_to: dateTo, commission_rate: parseFloat(rate) || 0 })); }
    catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className={s.page}>
      <div className={s.headerRow}>
        <button className={s.backBtn} onClick={() => nav('/relatorios')}><ArrowLeft size={16} /> Voltar</button>
        <h1 className={s.title}>Comissões</h1>
      </div>
      <p className={s.subtitle}>Quanto cada vendedor vendeu e o valor das comissões.</p>

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
          <label className={s.filterLabel}>Taxa comissão (%)</label>
          <input type="number" className={s.filterInput} value={rate} onChange={e => setRate(e.target.value)} min="0" max="100" step="0.5" style={{ minWidth: 100 }} />
        </div>
        <button className={s.filterBtn} onClick={load} disabled={loading}><Search size={16} /> {loading ? 'Carregando...' : 'Filtrar'}</button>
      </div>

      {loading && <div className={s.loading}>Carregando relatório...</div>}

      {data && !loading && (
        <>
          <div className={s.summaryGrid}>
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalSellers}</span><span className={s.summaryLabel}>Vendedores</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalValue)}</span><span className={s.summaryLabel}>Total Vendido</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalCommissions)}</span><span className={s.summaryLabel}>Total Comissões</span></div>
          </div>

          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Vendedor</th><th>Vendas</th><th>Peças</th><th>Total Vendido</th><th>Comissão ({rate}%)</th></tr></thead>
              <tbody>
                {data.rows.length === 0
                  ? <tr><td colSpan={5} className={s.emptyState}>Nenhuma venda com vendedor encontrada.</td></tr>
                  : data.rows.map((r: any) => (
                    <tr key={r.sellerId}>
                      <td>{r.sellerName}</td>
                      <td>{r.salesCount}</td>
                      <td>{r.itemsSold}</td>
                      <td className={s.mono}>{fmt(r.totalValue)}</td>
                      <td className={s.mono}>{fmt(r.commission)}</td>
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

export default ComissoesReport;
