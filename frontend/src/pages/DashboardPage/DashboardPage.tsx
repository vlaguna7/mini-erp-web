import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { dashboardService } from '../../services/dashboardService';
import { useAuthStore } from '../../store/authStore';
import {
  DollarSign,
  TrendingUp,
  Package,
  ShoppingCart,
  AlertTriangle,
  Clock,
  ShoppingBag,
  Layers,
} from 'lucide-react';
import styles from './DashboardPage.module.css';

interface DashboardStats {
  totalProducts: number;
  totalStockValue: number;
  lowStockProducts: any[];
  salesToday: number;
  salesTodayCount: number;
  salesWeek: number;
  salesWeekCount: number;
  recentActivity: any[];
}

const INITIAL_STATS: DashboardStats = {
  totalProducts: 0,
  totalStockValue: 0,
  lowStockProducts: [],
  salesToday: 0,
  salesTodayCount: 0,
  salesWeek: 0,
  salesWeekCount: 0,
  recentActivity: [],
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [products, salesToday, salesWeek, recentActivity] =
        await Promise.allSettled([
          productService.getProducts(),
          dashboardService.getSalesToday(),
          dashboardService.getSalesWeek(),
          dashboardService.getRecentActivity(),
        ]);

      const productList =
        products.status === 'fulfilled' ? products.value : [];

      const lowStockProducts = productList.filter(
        (p: any) => (p.quantity_stock || 0) <= (p.min_stock || 0)
      );

      const totalStockValue = productList
        .filter((p: any) => (p.quantity_stock || 0) >= 1)
        .reduce(
          (sum: number, p: any) =>
            sum + (parseFloat(p.price_sale) || 0) * p.quantity_stock,
          0
        );

      setStats({
        totalProducts: productList.length,
        totalStockValue,
        lowStockProducts,
        salesToday:
          salesToday.status === 'fulfilled' ? salesToday.value.total : 0,
        salesTodayCount:
          salesToday.status === 'fulfilled' ? salesToday.value.count : 0,
        salesWeek:
          salesWeek.status === 'fulfilled' ? salesWeek.value.total : 0,
        salesWeekCount:
          salesWeek.status === 'fulfilled' ? salesWeek.value.count : 0,
        recentActivity:
          recentActivity.status === 'fulfilled' ? recentActivity.value : [],
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(isNaN(value) ? 0 : value);

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `há ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `há ${hrs}h`;
    return `há ${Math.floor(hrs / 24)} dias`;
  };

  const activityIcon: Record<string, React.ReactNode> = {
    sale: <ShoppingBag size={16} />,
    entry: <Layers size={16} />,
  };

  const activityColor: Record<string, string> = {
    sale: '#22c55e',
    entry: '#3b82f6',
  };

  const statCards = [
    {
      key: 'salesToday',
      label: 'Vendas do Dia',
      value: formatCurrency(stats.salesToday),
      sub: `${stats.salesTodayCount} venda${stats.salesTodayCount !== 1 ? 's' : ''} realizada${stats.salesTodayCount !== 1 ? 's' : ''}`,
      icon: <DollarSign size={22} />,
      color: '#22c55e',
      bg: '#f0fdf4',
    },
    {
      key: 'stockValue',
      label: 'Valor em Estoque',
      value: formatCurrency(stats.totalStockValue),
      sub: `${stats.totalProducts} produto${stats.totalProducts !== 1 ? 's' : ''} cadastrado${stats.totalProducts !== 1 ? 's' : ''}`,
      icon: <TrendingUp size={22} />,
      color: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      key: 'products',
      label: 'Produtos em Estoque',
      value: stats.totalProducts.toString(),
      sub: `${stats.lowStockProducts.length} com estoque baixo`,
      icon: <Package size={22} />,
      color: '#8b5cf6',
      bg: '#f5f3ff',
    },
    {
      key: 'salesWeek',
      label: 'Vendas na Semana',
      value: formatCurrency(stats.salesWeek),
      sub: `${stats.salesWeekCount} venda${stats.salesWeekCount !== 1 ? 's' : ''} nos últimos 7 dias`,
      icon: <ShoppingCart size={22} />,
      color: '#3b82f6',
      bg: '#eff6ff',
    },
  ];

  if (isLoading) {
    return (
      <div className={styles.dashLoading}>
        <div className={styles.dashSpinner} />
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dash}>
      {/* Header */}
      <div className={styles.dashHeader}>
        <div>
          <h1 className={styles.dashTitle}>Dashboard</h1>
          <p className={styles.dashSubtitle}>Visão geral do seu negócio</p>
        </div>
        {user && <span className={styles.dashWelcome}>Olá, {user.name} 👋</span>}
      </div>

      {/* Stat Cards */}
      <div className={styles.dashCards}>
        {statCards.map((card) => (
          <div className={styles.dashCard} key={card.key}>
            <div className={styles.dashCardTop}>
              <span className={styles.dashCardLabel}>{card.label}</span>
              <span
                className={styles.dashCardIcon}
                style={{ background: card.bg, color: card.color }}
              >
                {card.icon}
              </span>
            </div>
            <p className={styles.dashCardValue}>{card.value}</p>
            <p className={styles.dashCardSub}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className={styles.dashBottom}>
        {/* Alertas de Estoque */}
        <div className={styles.dashPanel}>
          <div className={styles.dashPanelHeader}>
            <AlertTriangle size={18} className={`${styles.dashPanelIcon} ${styles.alert}`} />
            <h2>Alertas de Estoque</h2>
          </div>

          {stats.lowStockProducts.length === 0 ? (
            <div className={styles.dashEmpty}>
              <Package size={32} />
              <p>Todos os produtos estão com estoque adequado!</p>
            </div>
          ) : (
            <ul className={styles.dashAlertList}>
              {stats.lowStockProducts.slice(0, 6).map((product) => {
                const pct = product.min_stock
                  ? Math.min(
                    100,
                    Math.round(
                      (product.quantity_stock / product.min_stock) * 100
                    )
                  )
                  : 0;
                return (
                  <li key={product.id} className={styles.dashAlertItem}>
                    <div className={styles.dashAlertRow}>
                      <span className={styles.dashAlertName}>{product.name}</span>
                      <span className={styles.dashAlertQty}>
                        {product.quantity_stock} unidades
                      </span>
                    </div>
                    <div className={styles.dashProgressTrack}>
                      <div
                        className={styles.dashProgressBar}
                        style={{
                          width: `${pct}%`,
                          background:
                            pct <= 25
                              ? '#ef4444'
                              : pct <= 50
                                ? '#f59e0b'
                                : '#3b82f6',
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {stats.lowStockProducts.length > 0 && (
            <button
              className={styles.dashPanelBtn}
              onClick={() => navigate('/estoque')}
            >
              Gerenciar Estoque
            </button>
          )}
        </div>

        {/* Atividades Recentes */}
        <div className={styles.dashPanel}>
          <div className={styles.dashPanelHeader}>
            <Clock size={18} className={`${styles.dashPanelIcon} ${styles.activity}`} />
            <h2>Atividades Recentes</h2>
          </div>

          {stats.recentActivity.length === 0 ? (
            <div className={styles.dashEmpty}>
              <Clock size={32} />
              <p>Nenhuma atividade recente encontrada.</p>
            </div>
          ) : (
            <ul className={styles.dashActivityList}>
              {stats.recentActivity.map((item, i) => (
                <li key={i} className={styles.dashActivityItem}>
                  <span
                    className={styles.dashActivityDot}
                    style={{
                      background: activityColor[item.type] ?? '#94a3b8',
                    }}
                  >
                    {activityIcon[item.type]}
                  </span>
                  <div className={styles.dashActivityInfo}>
                    <p className={styles.dashActivityLabel}>{item.label}</p>
                    <p className={styles.dashActivityDetail}>
                      {item.detail}
                      {item.date && (
                        <span> · {formatTimeAgo(item.date)}</span>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;