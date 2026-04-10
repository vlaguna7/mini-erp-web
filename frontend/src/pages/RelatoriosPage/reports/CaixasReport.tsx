import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { reportService } from '../../../services/reportService';
import s from '../ReportStyles.module.css';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CaixasReport: React.FC = () => {
  const nav = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setData(await reportService.dailyCashReport({ date_from: dateFrom, date_to: dateTo })); }
    catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  /* Coleta todas as chaves de forma de pagamento para cabeçalhos dinâmicos */
  const paymentKeys: string[] = [];
  if (data) {
    const set = new Set<string>();
    for (const r of data.rows) {
      for (const k of Object.keys(r.payments)) set.add(k);
    }
    paymentKeys.push(...Array.from(set).sort());
  }

  return (
    <div className={s.page}>
      <div className={s.headerRow}>
        <button className={s.backBtn} onClick={() => nav('/relatorios')}><ArrowLeft size={16} /> Voltar</button>
        <h1 className={s.title}>Resumo Diário de Caixa</h1>
      </div>
      <p className={s.subtitle}>Vendas diárias com detalhamento por forma de pagamento.</p>

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
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalDays}</span><span className={s.summaryLabel}>Dias com Vendas</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalSales}</span><span className={s.summaryLabel}>Total de Vendas</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalValue)}</span><span className={s.summaryLabel}>Valor Total</span></div>
          </div>

          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Data</th><th>Vendas</th><th>Total</th>
                  {paymentKeys.map(k => <th key={k}>{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.rows.length === 0
                  ? <tr><td colSpan={3 + paymentKeys.length} className={s.emptyState}>Nenhum dado encontrado.</td></tr>
                  : data.rows.map((r: any) => (
                    <tr key={r.date}>
                      <td>{new Date(r.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                      <td>{r.salesCount}</td>
                      <td className={s.mono}>{fmt(r.total)}</td>
                      {paymentKeys.map(k => <td key={k} className={s.mono}>{fmt(r.payments[k] || 0)}</td>)}
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

export default CaixasReport;
