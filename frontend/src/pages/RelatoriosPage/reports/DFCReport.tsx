import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { reportService } from '../../../services/reportService';
import s from '../ReportStyles.module.css';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const DFCReport: React.FC = () => {
  const nav = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setData(await reportService.cashFlowReport({ date_from: dateFrom, date_to: dateTo })); }
    catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const netColor = (v: number) => (v >= 0 ? '#059669' : '#dc2626');

  return (
    <div className={s.page}>
      <div className={s.headerRow}>
        <button className={s.backBtn} onClick={() => nav('/relatorios')}><ArrowLeft size={16} /> Voltar</button>
        <h1 className={s.title}>Demonstrativo de Fluxo de Caixa</h1>
      </div>
      <p className={s.subtitle}>Entradas, deduções, custos e resultado financeiro do período.</p>

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
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalRevenue)}</span><span className={s.summaryLabel}>Receita (Vendas)</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalDiscount)}</span><span className={s.summaryLabel}>Descontos</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalReturns)}</span><span className={s.summaryLabel}>Devoluções</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalEntries)}</span><span className={s.summaryLabel}>Custos / Entradas</span></div>
            <div className={s.summaryCard}>
              <span className={s.summaryValue} style={{ color: netColor(data.summary.netCashFlow) }}>{fmt(data.summary.netCashFlow)}</span>
              <span className={s.summaryLabel}>Resultado Líquido</span>
            </div>
          </div>

          {data.entries.length > 0 && (
            <>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: '1.5rem 0 0.75rem' }}>Entradas / Custos</h2>
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Valor</th></tr></thead>
                  <tbody>
                    {data.entries.map((e: any, i: number) => (
                      <tr key={i}>
                        <td>{new Date(e.date).toLocaleDateString('pt-BR')}</td>
                        <td>{e.type}</td>
                        <td>{e.description || '—'}</td>
                        <td className={s.mono}>{fmt(e.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default DFCReport;
