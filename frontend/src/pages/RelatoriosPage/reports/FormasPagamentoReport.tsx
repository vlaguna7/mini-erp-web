import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { reportService } from '../../../services/reportService';
import s from '../ReportStyles.module.css';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const FormasPagamentoReport: React.FC = () => {
  const nav = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setData(await reportService.paymentMethodsReport({ date_from: dateFrom, date_to: dateTo })); }
    catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className={s.page}>
      <div className={s.headerRow}>
        <button className={s.backBtn} onClick={() => nav('/relatorios')}><ArrowLeft size={16} /> Voltar</button>
        <h1 className={s.title}>Vendas por Forma de Pagamento</h1>
      </div>
      <p className={s.subtitle}>Total vendido e número de transações por meio de pagamento.</p>

      <div className={s.filterBar}>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Data inicial</label>
          <input type="date" className={s.filterInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Data final</label>
          <input type="date" className={s.filterInput} value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <button className={s.filterBtn} onClick={load} disabled={loading}><Search size={16} /> {loading ? 'Carregando...' : 'Filtrar'}</button>
      </div>

      {loading && <div className={s.loading}>Carregando relatório...</div>}

      {data && !loading && (
        <>
          <div className={s.summaryGrid}>
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalMethods}</span><span className={s.summaryLabel}>Formas de Pagamento</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalTransactions}</span><span className={s.summaryLabel}>Total Transações</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalValue)}</span><span className={s.summaryLabel}>Valor Total</span></div>
          </div>

          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Forma de Pagamento</th><th>Transações</th><th>Total</th><th>Participação</th></tr></thead>
              <tbody>
                {data.rows.length === 0
                  ? <tr><td colSpan={4} className={s.emptyState}>Nenhum dado encontrado.</td></tr>
                  : data.rows.map((r: any) => (
                    <tr key={r.method}>
                      <td>{r.method}</td>
                      <td>{r.transactionCount}</td>
                      <td className={s.mono}>{fmt(r.totalValue)}</td>
                      <td>{r.share.toFixed(1)}%</td>
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

export default FormasPagamentoReport;
