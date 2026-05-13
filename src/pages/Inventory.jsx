import { Plus, Barcode, Filter, UploadCloud, Printer, Loader2, X, Search } from 'lucide-react';
import { createPortal } from 'react-dom';
import { db } from '../firebaseClient';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

const statusColor = (s) => {
  if (s === 'operativo') return 'success';
  if (s === 'en_reparacion' || s === 'dañado') return 'danger';
  return 'warning';
};

const Modal = ({ onClose, children }) =>
  createPortal(
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );

const Inventory = () => {
  const [assets, setAssets] = useState([]);
  const [areas, setAreas] = useState([]);
  const [areasMap, setAreasMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '', model: '', barcode: '', serial_number: '', area_id: '', status: 'operativo',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const [assetsSnap, areasSnap] = await Promise.all([
      getDocs(query(collection(db, 'assets'), orderBy('createdAt', 'desc'))),
      getDocs(collection(db, 'areas')),
    ]);

    const areasData = areasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const map = {};
    areasData.forEach(a => { map[a.id] = a.name; });

    setAreas(areasData);
    setAreasMap(map);
    setAssets(assetsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = () => {
    setFormData({ name: '', model: '', barcode: '', serial_number: '', area_id: '', status: 'operativo' });
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    // Check for duplicate barcode manually (Firestore has no unique constraint)
    const existing = assets.find(a => a.barcode === formData.barcode);
    if (existing) {
      setFormError('El código de barras ya está registrado. Usa uno diferente.');
      setSaving(false);
      return;
    }

    try {
      await addDoc(collection(db, 'assets'), {
        ...formData,
        area_id: formData.area_id || null,
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setFormError('Error al guardar: ' + err.message);
    }
    setSaving(false);
  };

  const filtered = assets.filter((a) =>
    `${a.barcode} ${a.name} ${a.model} ${a.serial_number}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Inventario de Activos</h1>
          <p style={{ marginBottom: 0 }}>Gestión de hardware y equipos del laboratorio.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
            <UploadCloud size={16} /> <span className="btn-label">Subir Excel</span>
          </button>
          <button className="btn btn-outline">
            <Printer size={16} /> <span className="btn-label">Imprimir QRs</span>
          </button>
          <button className="btn btn-outline">
            <Barcode size={16} /> <span className="btn-label">Escanear</span>
          </button>
          <button className="btn btn-primary" onClick={openModal}>
            <Plus size={16} /> Nuevo Activo
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="table-toolbar mb-6">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input-field search-input"
              placeholder="Buscar por código, nombre o modelo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-icon"><Filter size={16} /></button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Código Inst.</th>
                <th>Equipo / Modelo</th>
                <th>N° Serie</th>
                <th>Estado</th>
                <th>Ubicación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    <Loader2 style={{ margin: '0 auto 0.5rem', display: 'block' }} className="animate-spin text-primary" />
                    Cargando inventario...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    {search ? 'No se encontraron resultados.' : '¡No hay activos registrados aún. Crea el primero!'}
                  </td>
                </tr>
              ) : (
                filtered.map((asset) => (
                  <tr key={asset.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{asset.barcode}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{asset.name}</div>
                      {asset.model && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asset.model}</div>}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{asset.serial_number || '—'}</td>
                    <td>
                      <span className={`badge badge-${statusColor(asset.status)}`}>{asset.status}</span>
                    </td>
                    <td>{areasMap[asset.area_id] || 'Bodega General'}</td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="modal-header">
            <h2 style={{ fontSize: '1.25rem', marginBottom: 0 }}>Registrar Activo</h2>
            <button className="btn-icon modal-close-btn" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
          </div>

          {formError && <div className="form-error-banner">{formError}</div>}

          <form onSubmit={handleSave} className="modal-form">
            <div className="modal-fields">
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Código de Barras *</label>
                  <input type="text" className="input-field" required placeholder="Ej. UTP-2026-001"
                    value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">N° de Serie</label>
                  <input type="text" className="input-field" placeholder="Ej. SN-ABC-12345"
                    value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Nombre del Equipo *</label>
                  <input type="text" className="input-field" required placeholder="Ej. Router Cisco"
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Modelo / Versión</label>
                  <input type="text" className="input-field" placeholder="Ej. 1941"
                    value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Estado</label>
                  <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="operativo">Operativo</option>
                    <option value="en_prestamo">En Préstamo</option>
                    <option value="en_reparacion">En Reparación</option>
                    <option value="dañado">Dañado</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Área / Ubicación</label>
                  <select className="input-field" value={formData.area_id} onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}>
                    <option value="">Bodega General (Sin Asignar)</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : 'Guardar en Base de Datos'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Inventory;
