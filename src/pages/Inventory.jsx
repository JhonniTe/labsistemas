import { Plus, Barcode, Filter, UploadCloud, Printer, Loader2, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useEffect, useState } from 'react';

const Inventory = () => {
  const [assets, setAssets] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', model: '', barcode: '', area_id: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [assetsResponse, areasResponse] = await Promise.all([
      supabase.from('assets').select('*, areas(name)'),
      supabase.from('areas').select('*')
    ]);
    
    if (!assetsResponse.error) setAssets(assetsResponse.data);
    if (!areasResponse.error) setAreas(areasResponse.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Si area_id está vacío, usar null para evitar error en UUID
    const payload = { ...formData, area_id: formData.area_id || null };
    
    const { error } = await supabase.from('assets').insert([payload]);
    setSaving(false);
    
    if (error) {
      alert('Error guardando: ' + error.message);
    } else {
      setShowModal(false);
      setFormData({ name: '', model: '', barcode: '', area_id: '' });
      fetchData(); // Refresh list
    }
  };
  return (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1>Inventario de Activos</h1>
          <p>Gestión de hardware y equipos del laboratorio.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
            <UploadCloud size={18} />
            Subir Excel
          </button>
          <button className="btn btn-outline">
            <Printer size={18} />
            Imprimir QRs
          </button>
          <button className="btn btn-outline">
            <Barcode size={18} />
            Escanear
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Nuevo Activo
          </button>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="input-group" style={{ marginBottom: 0, width: '300px' }}>
            <input type="text" className="input-field" placeholder="Buscar por código, IP o nombre..." />
          </div>
          <button className="btn btn-icon">
            <Filter size={18} />
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código Inst.</th>
                <th>Equipo / Modelo</th>
                <th>Estado</th>
                <th>Ubicación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center" style={{ padding: '2rem' }}>
                    <Loader2 className="animate-spin text-primary mx-auto mb-2" />
                    Cargando inventario desde Supabase...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted" style={{ padding: '2rem' }}>
                    No hay activos registrados en la base de datos aún. ¡Crea el primero!
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id}>
                    <td>{asset.barcode}</td>
                    <td className="font-medium">{asset.name} {asset.model}</td>
                    <td>
                      <span className={`badge badge-${asset.status === 'operativo' ? 'success' : asset.status === 'en_reparacion' ? 'danger' : 'warning'}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td>{asset.areas?.name || 'Bodega General'}</td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Ver Detalle</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel" style={{ width: '450px', padding: '2rem', position: 'relative' }}>
            <button 
              className="btn-icon" 
              style={{ position: 'absolute', top: '1rem', right: '1rem' }}
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl mb-6">Registrar Activo</h2>
            
            <form onSubmit={handleSave}>
              <div className="input-group">
                <label className="input-label">Código de Barras</label>
                <div className="flex gap-2">
                  <input type="text" className="input-field" required value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} placeholder="Ej. UTP-2026-X" />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Nombre del Equipo</label>
                <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Router Cisco" />
              </div>
              <div className="input-group">
                <label className="input-label">Modelo / Versión</label>
                <input type="text" className="input-field" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="Ej. 1941" />
              </div>
              <div className="input-group">
                <label className="input-label">Área / Ubicación Inicial</label>
                <select className="input-field" style={{ appearance: 'none' }} value={formData.area_id} onChange={e => setFormData({...formData, area_id: e.target.value})}>
                  <option value="">Bodega General (Sin Asignar)</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={saving} className="btn btn-primary mt-4" style={{ width: '100%', padding: '0.75rem' }}>
                {saving ? 'Guardando...' : 'Guardar en Base de Datos'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
