import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Printer, ShoppingCart } from 'lucide-react';
import { usePDVStore } from '../../store/pdvStore';
import { saleService } from '../../services/saleService';
import styles from './PDVSuccess.module.css';

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Dinheiro',
  pix: 'Pix',
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
};

const PDVSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { lastSaleId, setLastSaleId, resetPDV } = usePDVStore();
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lastSaleId) {
      navigate('/pdv/produtos');
      return;
    }
    loadSale();
  }, [lastSaleId]);

  const loadSale = async () => {
    try {
      const data = await saleService.getSaleById(lastSaleId!);
      setSale(data);
    } catch (error) {
      console.error('Erro ao carregar venda:', error);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (value: number | string) =>
    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const fmtDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const buildReceiptText = () => {
    if (!sale) return '';

    const lines: string[] = [];
    lines.push('================================================');
    lines.push('              COMPROVANTE DE VENDA');
    lines.push('================================================');
    lines.push('');
    lines.push(`Venda Nº: ${sale.id}`);
    lines.push(`Data: ${fmtDate(sale.createdAt)}`);
    lines.push('');
    lines.push('------------------------------------------------');
    lines.push('CLIENTE');
    lines.push(`Nome: ${sale.client?.name || '-'}`);
    if (sale.client?.cpfCnpj) lines.push(`CPF/CNPJ: ${sale.client.cpfCnpj}`);
    if (sale.client?.phone) lines.push(`Telefone: ${sale.client.phone}`);
    lines.push('');
    if (sale.seller) {
      lines.push(`Vendedor: ${sale.seller.name}`);
      lines.push('');
    }
    lines.push('------------------------------------------------');
    lines.push('ITENS');
    lines.push('');

    sale.items.forEach((item: any, idx: number) => {
      const name = item.product?.name || `Produto ${item.productId}`;
      lines.push(`${idx + 1}. ${name}`);
      lines.push(`   ${item.quantity}x  ${fmt(item.unitPrice)}  =  ${fmt(item.subtotal)}`);
    });

    lines.push('');
    lines.push('------------------------------------------------');
    lines.push(`Subtotal:   ${fmt(sale.subtotal)}`);
    if (Number(sale.discount) > 0) lines.push(`Desconto:  -${fmt(sale.discount)}`);
    if (Number(sale.surcharge) > 0) lines.push(`Acréscimo: +${fmt(sale.surcharge)}`);
    lines.push(`TOTAL:      ${fmt(sale.totalValue)}`);
    lines.push('');
    lines.push('------------------------------------------------');
    lines.push('PAGAMENTO');
    sale.payments.forEach((p: any) => {
      let label = PAYMENT_LABELS[p.method] || p.label;
      if (p.installments && p.installments > 1) label += ` (${p.installments}x)`;
      if (p.cardBrand) label += ` - ${p.cardBrand}`;
      lines.push(`  ${label}: ${fmt(p.amount)}`);
    });
    lines.push('');
    if (sale.observation) {
      lines.push('------------------------------------------------');
      lines.push(`Observação: ${sale.observation}`);
      lines.push('');
    }
    lines.push('================================================');
    lines.push('           Obrigado pela preferência!');
    lines.push('================================================');

    return lines.join('\n');
  };

  const handleDownload = () => {
    const text = buildReceiptText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprovante-venda-${sale.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const text = buildReceiptText();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Recibo - Venda #${sale.id}</title>
            <style>
              body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; white-space: pre-wrap; max-width: 300px; margin: 0 auto; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>${text.replace(/\n/g, '<br>')}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleNewSale = () => {
    setLastSaleId(null);
    resetPDV();
    navigate('/pdv/produtos');
  };

  if (loading) {
    return <div className={styles.loading}>Carregando dados da venda...</div>;
  }

  if (!sale) {
    return (
      <div className={styles.page}>
        <CheckCircle size={64} className={styles.successIcon} />
        <h1 className={styles.title}>Venda realizada com sucesso!</h1>
        <p className={styles.subtitle}>Não foi possível carregar os detalhes.</p>
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleNewSale}>
            <ShoppingCart size={20} />
            Nova Venda
          </button>
        </div>
      </div>
    );
  }

  const totalItems = sale.items.reduce((sum: number, i: any) => sum + i.quantity, 0);

  return (
    <div className={styles.page}>
      <CheckCircle size={64} className={styles.successIcon} />
      <h1 className={styles.title}>Venda realizada com sucesso!</h1>
      <p className={styles.subtitle}>Venda Nº {sale.id} registrada em {fmtDate(sale.createdAt)}</p>

      <div className={styles.summaryCard}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Cliente</span>
          <span className={styles.summaryValue}>{sale.client?.name || '-'}</span>
        </div>
        {sale.seller && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Vendedor</span>
            <span className={styles.summaryValue}>{sale.seller.name}</span>
          </div>
        )}
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Itens</span>
          <span className={styles.summaryValue}>{totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Subtotal</span>
          <span className={styles.summaryValue}>{fmt(sale.subtotal)}</span>
        </div>
        {Number(sale.discount) > 0 && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Desconto</span>
            <span className={styles.summaryValue}>-{fmt(sale.discount)}</span>
          </div>
        )}
        {Number(sale.surcharge) > 0 && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Acréscimo</span>
            <span className={styles.summaryValue}>+{fmt(sale.surcharge)}</span>
          </div>
        )}
        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
          <span className={styles.summaryLabel}>Total</span>
          <span className={styles.summaryValue}>{fmt(sale.totalValue)}</span>
        </div>

        {sale.payments.map((p: any, idx: number) => {
          let label = PAYMENT_LABELS[p.method] || p.label;
          if (p.installments && p.installments > 1) label += ` (${p.installments}x)`;
          if (p.cardBrand) label += ` - ${p.cardBrand}`;
          return (
            <div key={idx} className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{label}</span>
              <span className={styles.summaryValue}>{fmt(p.amount)}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={handleNewSale}>
          <ShoppingCart size={20} />
          Nova Venda
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button className={styles.btnSecondary} onClick={handleDownload}>
            <Download size={18} />
            Baixar Comprovante
          </button>
          <button className={styles.btnSecondary} onClick={handlePrint}>
            <Printer size={18} />
            Imprimir Recibo
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDVSuccess;
