import { Package, AlertTriangle, ArrowRightLeft, Wrench, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { db } from '../firebaseClient';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import './Dashboard.css';

const MOVEMENT_BADGE = {
  salida: 'warning',
  devolucion: 'primary',
  consumo: 'success',
};

const toDate = (val) => {
  if (!val) return new Date();
  if (val.toDate) return val.toDate(); // Firestore Timestamp
  return new Date(val);
};

const timeAgo = (val) => {
  const diff = Math.floor((Date.now() - toDate(val)) / 1000);
  if (diff < 60) return `Hace ${diff}s`;
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalAssets: 0, activeLoans: 0, lowStock: 0, pendingMaint: 0 });
  const [movements, setMovements] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Assets
      const assetsSnap = await getDocs(collection(db, 'assets'));
      const assets = assetsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const totalAssets = assets.length;
      const activeLoans = assets.filter(a => a.status === 'en_prestamo').length;

      // 2. Consumables - low stock
      const consumablesSnap = await getDocs(collection(db, 'consumables'));
      const consumables = consumablesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const lowStockItems = consumables.filter(c => c.stock_current <= c.stock_minimum);

      // 3. Pending maintenance
      const maintQ = query(collection(db, 'maintenance_tickets'), where('status', '==', 'pending'));
      const maintSnap = await getDocs(maintQ);

      // 4. Recent movements
      const movQ = query(
        collection(db, 'movements'),
        orderBy('createdAt', 'desc'),
        limit(8)
      );
      const movSnap = await getDocs(movQ);
      const recentMovements = movSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setStats({
        totalAssets,
        activeLoans,
        lowStock: lowStockItems.length,
        pendingMaint: maintSnap.size,
      });
      setAlerts(lowStockItems);
      setMovements(recentMovements);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const statCards = [
    { title: 'Total Activos', value: stats.totalAssets, icon: Package, color: 'primary', trend: 'Equipos registrados' },
    { title: 'Stock Crítico', value: stats.lowStock, icon: AlertTriangle, color: 'danger', trend: stats.lowStock > 0 ? 'Requiere reposición' : 'Todo en orden ✓' },
    { title: 'Préstamos Activos', value: stats.activeLoans, icon: ArrowRightLeft, color: 'warning', trend: 'Equipos en préstamo' },
    { title: 'Mant. Pendientes', value: stats.pendingMaint, icon: Wrench, color: 'success', trend: 'Tickets sin resolver' },
  ];

  return (
    <div className="dashboard animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1>Panel de Control</h1>
          <p>
            Resumen en tiempo real del inventario del laboratorio.
            {lastUpdated && (
              <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '0.75rem' }}>
                Actualizado: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button className="btn btn-outline" onClick={fetchAll} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid-cols-4 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="stat-card glass-panel">
              <div className="stat-card-header">
                <div>
                  <h3 className="stat-title">{stat.title}</h3>
                  <div className="stat-value">
                    {loading ? <Loader2 size={28} className="animate-spin text-muted" /> : stat.value}
                  </div>
                </div>
                <div className={`stat-icon-wrapper bg-${stat.color}`}>
                  <Icon size={24} className={`text-${stat.color}`} />
                </div>
              </div>
              <div className="stat-card-footer">
                <span className={`text-${stat.color}`}>{stat.trend}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid-cols-3">
        {/* Recent Movements */}
        <div className="glass-panel col-span-2 p-6">
          <h2 className="mb-4 text-xl">Movimientos Recientes</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Responsable</th>
                  <th>Destino</th>
                  <th>Cant.</th>
                  <th>Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      <Loader2 className="animate-spin text-primary" style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No hay movimientos registrados aún.
                    </td>
                  </tr>
                ) : (
                  movements.map((mov) => (
                    <tr key={mov.id}>
                      <td>
                        <span className={`badge badge-${MOVEMENT_BADGE[mov.operation_type] || 'primary'}`}>
                          {mov.operation_type}
                        </span>
                      </td>
                      <td className="font-medium">{mov.responsible_name}</td>
                      <td>{mov.destination_area_name || '—'}</td>
                      <td>{mov.quantity}</td>
                      <td className="text-muted">{timeAgo(mov.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-panel p-6">
          <h2 className="mb-4 text-xl">Alertas de Stock</h2>
          <div className="flex-col gap-4">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <Loader2 className="animate-spin text-warning" style={{ margin: '0 auto' }} />
              </div>
            ) : alerts.length === 0 ? (
              <div className="alert-item" style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
                <div className="alert-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <Package size={18} className="text-success" />
                </div>
                <div className="alert-content">
                  <h4>Stock OK</h4>
                  <p>Todos los insumos sobre el mínimo</p>
                </div>
              </div>
            ) : (
              alerts.map((item, i) => (
                <div key={i} className="alert-item">
                  <div className="alert-icon">
                    <AlertTriangle size={18} className="text-warning" />
                  </div>
                  <div className="alert-content">
                    <h4>{item.name}</h4>
                    <p>
                      Quedan <strong style={{ color: 'var(--danger)' }}>{item.stock_current}</strong>{' '}
                      {item.unit} (Mín: {item.stock_minimum})
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
