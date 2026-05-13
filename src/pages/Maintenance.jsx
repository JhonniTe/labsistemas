import { Wrench, Calendar, CheckSquare, Clock } from 'lucide-react';

const Maintenance = () => {
  const tasks = [
    { id: 1, eq: 'Servidor Dell ProEdge', date: 'Mañana, 10:00 AM', type: 'Preventivo', status: 'pending' },
    { id: 2, eq: 'Router Cisco 1941 (Laboratorio 2)', date: 'Próximo Lunes', type: 'Limpieza', status: 'scheduled' },
    { id: 3, eq: 'Switch Catalyst 2960', date: 'Hace 2 días', type: 'Reparación', status: 'completed' }
  ];

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1>Mantenimiento y Tickets</h1>
          <p>Control de fechas de limpieza, pasta térmica e incidencias.</p>
        </div>
        <button className="btn btn-primary">
          <Wrench size={18} />
          Nuevo Ticket
        </button>
      </div>

      <div className="grid-cols-3">
        <div className="glass-panel col-span-2 p-6">
          <h2 className="mb-4 text-xl">Mantenimientos Programados</h2>
          
          <div className="flex-col gap-4">
            {tasks.map(task => (
              <div key={task.id} className="alert-item" style={{ borderLeft: `4px solid ${task.status === 'completed' ? 'var(--success)' : task.status === 'pending' ? 'var(--warning)' : 'var(--primary)'}`}}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-4 items-center">
                    <div className={`alert-icon bg-${task.status === 'completed' ? 'success' : task.status === 'pending' ? 'warning' : 'primary'}`}>
                      {task.status === 'completed' ? <CheckSquare size={18} className="text-success" /> : <Clock size={18} className={task.status === 'pending' ? 'text-warning' : 'text-primary'} />}
                    </div>
                    <div>
                      <h4 className="font-medium" style={{ fontSize: '1rem', marginBottom: '0.2rem'}}>{task.eq}</h4>
                      <p className="text-muted text-sm gap-2 flex items-center">
                        <Calendar size={14} /> {task.date} • <span className="badge badge-outline">{task.type}</span>
                      </p>
                    </div>
                  </div>
                  
                  <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    {task.status === 'completed' ? 'Ver Reporte' : 'Iniciar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="mb-4 text-xl">Resumen</h2>
          <div className="flex-col gap-4">
            <div className="glass-panel p-4 flex justify-between items-center" style={{ background: 'rgba(255,255,255,0.02)'}}>
               <span className="text-muted">Tickets Abiertos</span>
               <span className="stat-value text-warning" style={{ fontSize: '1.5rem'}}>4</span>
            </div>
            <div className="glass-panel p-4 flex justify-between items-center" style={{ background: 'rgba(255,255,255,0.02)'}}>
               <span className="text-muted">Completados Hoy</span>
               <span className="stat-value text-success" style={{ fontSize: '1.5rem'}}>12</span>
            </div>
            <div className="glass-panel p-4 flex justify-between items-center" style={{ background: 'rgba(255,255,255,0.02)'}}>
               <span className="text-muted">Equipos Críticos</span>
               <span className="stat-value text-danger" style={{ fontSize: '1.5rem'}}>2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
