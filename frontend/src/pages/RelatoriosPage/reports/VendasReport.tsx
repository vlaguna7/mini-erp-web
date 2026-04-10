import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { reportService } from '../../../services/reportService';
import s from '../ReportStyles.module.css';

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const groupOptions = [
  { value: 'sale', label: 'Venda' },
  { value: 'product', label: 'Produto' },
  { value: 'category', label: 'Categoria de produtos' },
  { value: 'client', label: 'Cliente' },
  { value: 'seller', label: 'Vendedor' },
  { value: 'payment', label: 'Forma de pagamento' },
  { value: 'supplier', label: 'Fornecedor' },
];

const VendasReport: React.FC = () => {
  const nav = useNavigate();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [groupBy, setGroupBy] = useState('sale');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    try {
      setData(await reportService.salesReport({ date_from: dateFrom, date_to: dateTo, group_by: groupBy }));
    } catch { /* */ } finally { setLoading(false); }
  };

  const isCurrency = (col: string) => ['Subtotal', 'Desconto', 'Total'].includes(col);
  const isDate = (col: string) => col === 'Data';

  const formatCell = (val: any, col: string) => {
    if (isDate(col) && val) return new Date(val).toLocaleDateString('pt-BR');
    if (isCurrency(col) && typeof val === 'number') return fmt(val);
    if (typeof val === 'number' && !Number.isInteger(val)) return fmt(val);
    return val ?? '—';
  };

  return (
    <div className={s.page}>
      <div className={s.headerRow}>
        <button className={s.backBtn} onClick={() => nav('/relatorios')}><ArrowLeft size={16} /> Voltar</button>
        <h1 className={s.title}>Relatório de Vendas</h1>
      </div>
      <p className={s.subtitle}>Selecione o período e o tipo de agrupamento para gerar o relatório.</p>

      <div className={s.filterBar}>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Data inicial *</label>
          <input type="date" className={s.filterInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Data final *</label>
          <input type="date" className={s.filterInput} value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Agrupar por *</label>
          <select className={s.filterSelect} value={groupBy} onChange={e => setGroupBy(e.target.value)}>
            {groupOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button className={s.filterBtn} onClick={load} disabled={loading || !dateFrom || !dateTo}>
          <Search size={16} /> {loading ? 'Gerando...' : 'Gerar relatório'}
        </button>
      </div>

      {loading && <div className={s.loading}>Gerando relatório...</div>}

      {!data && !loading && (
        <div className={s.emptyState}>Preencha os filtros acima e clique em "Gerar relatório".</div>
      )}

      {data && !loading && (
        <>
          <div className={s.summaryGrid}>
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalSales}</span><span className={s.summaryLabel}>Total de Vendas</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalGross)}</span><span className={s.summaryLabel}>Faturamento Bruto</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalDiscount)}</span><span className={s.summaryLabel}>Descontos</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{fmt(data.summary.totalNet)}</span><span className={s.summaryLabel}>Faturamento Líquido</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalItems}</span><span className={s.summaryLabel}>Itens Vendidos</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{data.summary.totalReturns}</span><span className={s.summaryLabel}>Devoluções</span></div>
          </div>

          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  {data.columns.map((col: string) => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.rows.length === 0
                  ? <tr><td colSpan={data.columns.length} className={s.emptyState}>Nenhum dado encontrado no período.</td></tr>
                  : data.rows.map((r: any) => (
                    <tr key={r.id}>
                      {data.columns.map((_: string, idx: number) => {
                        const val = r[`col${idx + 1}`];
                        const col = data.columns[idx];
                        return (
                          <td key={idx} className={isCurrency(col) || (typeof val === 'number' && !Number.isInteger(val)) ? s.mono : ''}>
                            {formatCell(val, col)}
                          </td>
                        );
                      })}
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

export default VendasReport;
