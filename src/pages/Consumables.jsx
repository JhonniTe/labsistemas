import { Plus, Box, Filter } from 'lucide-react';

const Consumables = () => {
  return (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1>Consumibles</h1>
          <p>Control de materiales gastables y stock mínimo.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-primary">
            <Plus size={18} />
            Nuevo Consumible
          </button>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="input-group" style={{ marginBottom: 0, width: '300px' }}>
            <input type="text" className="input-field" placeholder="Buscar insumos..." />
          </div>
          <button className="btn btn-icon">
            <Filter size={18} />
          </button>
        </div>

        <div className="grid-cols-4 mb-6">
          {/* Tarjetas de consumibles simuladas */}
          {[
            { name: 'Pasta Térmica ArctiC', stock: 12, min: 5, unit: 'Tubos' },
            { name: 'Alcohol Isopropílico 1L', stock: 2, min: 5, unit: 'Botellas', alert: true },
            { name: 'Conectores RJ45', stock: 15, min: 50, unit: 'Unidades', alert: true },
            { name: 'Cable UTP Cat 6', stock: 8, min: 2, unit: 'Bobinas' },
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-6" style={{ background: item.alert ? 'rgba(239, 68, 68, 0.05)' : ''}}>
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary stat-icon-wrapper" style={{ width: 40, height: 40 }}>
                  <Box size={20} className="text-primary" />
                </div>
                {item.alert && <span className="badge badge-danger">Crítico</span>}
              </div>
              <h3 className="font-medium" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{item.name}</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>Min: {item.min} {item.unit}</p>
              
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Stock Actual</span>
                  <div className={`stat-value ${item.alert ? 'text-danger' : 'text-main'}`} style={{ fontSize: '1.5rem' }}>
                    {item.stock}
                  </div>
                </div>
                <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>QR</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Consumables;
