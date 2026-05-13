import { Package, AlertTriangle, ArrowRightLeft, TrendingUp } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    { title: 'Total Activos', value: '1,248', icon: Package, color: 'primary', trend: '+12 este mes' },
    { title: 'Stock Crítico', value: '14', icon: AlertTriangle, color: 'danger', trend: 'Requiere atención' },
    { title: 'Préstamos Activos', value: '56', icon: ArrowRightLeft, color: 'warning', trend: 'Devoluciones hoy: 8' },
    { title: 'Nuevos Movimientos', value: '342', icon: TrendingUp, color: 'success', trend: '+5% vs semana pasada' },
  ];

  const recentMovements = [
    { id: '1', item: 'Router Cisco 1941', type: 'Salida', to: 'Aula 402', user: 'Roberto Gómez', time: 'Hace 10 min', status: 'warning' },
    { id: '2', item: 'Pasta Térmica', type: 'Consumo', to: 'Lab Redes', user: 'Ana Ramírez', time: 'Hace 45 min', status: 'success' },
    { id: '3', item: 'Switch Catalyst 2960', type: 'Devolución', to: 'Estante B2', user: 'Carlos Ruiz', time: 'Hace 2 horas', status: 'primary' },
    { id: '4', item: 'Cable UTP Cat 6 (Bobina)', type: 'Consumo', to: 'Lab 3', user: 'Elena Flores', time: 'Hace 3 horas', status: 'success' },
  ];

  return (
    <div className="dashboard animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1>Panel de Control</h1>
          <p>Resumen en tiempo real del inventario del laboratorio.</p>
        </div>
        <button className="btn btn-primary">
          Descargar Reporte PDF
        </button>
      </div>

      <div className="grid-cols-4 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="stat-card glass-panel">
              <div className="stat-card-header">
                <div>
                  <h3 className="stat-title">{stat.title}</h3>
                  <div className="stat-value">{stat.value}</div>
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
        <div className="glass-panel col-span-2 p-6">
          <h2 className="mb-4 text-xl">Movimientos Recientes</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ítem / Equipo</th>
                  <th>Tipo</th>
                  <th>Destino</th>
                  <th>Responsable</th>
                  <th>Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {recentMovements.map(mov => (
                  <tr key={mov.id}>
                    <td className="font-medium">{mov.item}</td>
                    <td>
                      <span className={`badge badge-${mov.status}`}>
                        {mov.type}
                      </span>
                    </td>
                    <td>{mov.to}</td>
                    <td>{mov.user}</td>
                    <td className="text-muted">{mov.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="mb-4 text-xl">Alertas de Stock</h2>
          <div className="flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="alert-item">
                <div className="alert-icon">
                  <AlertTriangle size={18} className="text-warning" />
                </div>
                <div className="alert-content">
                  <h4>Conectores RJ45 Cat 6</h4>
                  <p>Quedan 15 unidades (Mín: 50)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
