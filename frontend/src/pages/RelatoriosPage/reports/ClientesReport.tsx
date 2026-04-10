import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { reportService } from '../../../services/reportService';
import s from '../ReportStyles.module.css';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const ClientesReport: React.FC = () => {
  const nav = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setData(await reportService.clientReport({ date_from: dateFrom, date_to: dateTo })); }
    catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className={s.page}>
      <div className={s.headerRow}>
        <button className={s.backBtn} onClick={() => nav('/relatorios')}><ArrowLeft size={16} /> Voltar</button>
        <h1 className={s.title}>Relatório de Clientes</h1>
      </div>
      <p className={s.subtitle}>Quanto cada cliente comprou no período, com peças e ticket médio.</p>

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
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalClients}</span><span className={s.summaryLabel}>Clientes</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalSales}</span><span className={s.summaryLabel}>Total de Vendas</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalRevenue)}</span><span className={s.summaryLabel}>Receita Total</span></div>
          </div>

          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Cliente</th><th>Vendas</th><th>Itens</th><th>Total</th><th>Ticket Médio</th></tr></thead>
              <tbody>
                {data.rows.length === 0
                  ? <tr><td colSpan={5} className={s.emptyState}>Nenhum dado encontrado.</td></tr>
                  : data.rows.map((r: any) => (
                    <tr key={r.clientId}>
                      <td>{r.clientName}</td>
                      <td>{r.salesCount}</td>
                      <td>{r.totalItems}</td>
                      <td className={s.mono}>{fmt(r.totalValue)}</td>
                      <td className={s.mono}>{fmt(r.avgTicket)}</td>
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

export default ClientesReport;
