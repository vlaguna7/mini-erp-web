import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { reportService } from '../../../services/reportService';
import s from '../ReportStyles.module.css';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const segmentBadge: Record<string, string> = {
  'Campeão': s.badgeGreen,
  'Leal': s.badgeBlue,
  'Potencial': s.badgePurple,
  'Em risco': s.badgeYellow,
  'Hibernando': s.badgeRed,
  'Novo': s.badgeGray,
};

const CicloVidaReport: React.FC = () => {
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setData(await reportService.clientLifecycleReport()); }
    catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className={s.page}>
      <div className={s.headerRow}>
        <button className={s.backBtn} onClick={() => nav('/relatorios')}><ArrowLeft size={16} /> Voltar</button>
        <h1 className={s.title}>Ciclo de Vida do Cliente</h1>
      </div>
      <p className={s.subtitle}>Análise RFV (Recência, Frequência, Valor) com segmentação automática.</p>

      {loading && <div className={s.loading}>Carregando relatório...</div>}

      {data && !loading && (
        <>
          <div className={s.summaryGrid}>
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalClients}</span><span className={s.summaryLabel}>Total de Clientes</span></div>
            {Object.entries(data.summary.segments as Record<string, number>).map(([seg, count]) => (
              <div key={seg} className={s.summaryCard}>
                <span className={s.summaryValue}>{count}</span>
                <span className={s.summaryLabel}>{seg}</span>
              </div>
            ))}
          </div>

          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Cliente</th><th>Frequência</th><th>Total Gasto</th>
                  <th>Última Compra</th><th>Dias</th>
                  <th>R</th><th>F</th><th>V</th><th>Score</th><th>Segmento</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.length === 0
                  ? <tr><td colSpan={10} className={s.emptyState}>Nenhum cliente cadastrado.</td></tr>
                  : data.rows.map((r: any) => (
                    <tr key={r.clientId}>
                      <td>{r.clientName}</td>
                      <td>{r.frequency}</td>
                      <td className={s.mono}>{fmt(r.totalValue)}</td>
                      <td>{r.lastPurchase ? new Date(r.lastPurchase + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</td>
                      <td>{r.recencyDays < 999 ? r.recencyDays : '—'}</td>
                      <td>{r.recencyScore}</td>
                      <td>{r.frequencyScore}</td>
                      <td>{r.valueScore}</td>
                      <td><strong>{r.rfvScore}</strong></td>
                      <td><span className={`${s.badge} ${segmentBadge[r.segment] || s.badgeGray}`}>{r.segment}</span></td>
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

export default CicloVidaReport;
