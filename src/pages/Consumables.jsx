import { Plus, Box, Filter, Loader2, X, Search, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { db } from '../firebaseClient';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

const Modal = ({ onClose, children }) =>
  createPortal(
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );

const Consumables = () => {
  const [consumables, setConsumables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', qrcode: '', unit: '', stock_current: '', stock_minimum: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [adjustId, setAdjustId] = useState(null);
  const [adjustDelta, setAdjustDelta] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'consumables'), orderBy('createdAt', 'desc')));
    setConsumables(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await addDoc(collection(db, 'consumables'), {
        ...formData,
        stock_current: Number(formData.stock_current),
        stock_minimum: Number(formData.stock_minimum),
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setFormData({ name: '', qrcode: '', unit: '', stock_current: '', stock_minimum: '' });
      fetchData();
    } catch (err) {
      setFormError('Error: ' + err.message);
    }
    setSaving(false);
  };

  const handleAdjust = async (item, delta) => {
    const newStock = Math.max(0, item.stock_current + delta);
    await updateDoc(doc(db, 'consumables', item.id), { stock_current: newStock });
    fetchData();
  };

  const filtered = consumables.filter(c =>
    `${c.name} ${c.qrcode} ${c.unit}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Consumibles</h1>
          <p style={{ marginBottom: 0 }}>Control de materiales gastables y stock mínimo.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setFormError(null); }}>
          <Plus size={16} /> Nuevo Consumible
        </button>
      </div>

      {/* Search */}
      <div className="glass-panel mb-6" style={{ padding: '1rem 1.5rem' }}>
        <div className="table-toolbar">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input type="text" className="input-field search-input" placeholder="Buscar insumos..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-icon"><Filter size={16} /></button>
        </div>
      </div>

      {/* Cards grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 className="animate-spin text-primary" style={{ margin: '0 auto' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          {search ? 'Sin resultados.' : 'No hay consumibles. ¡Agrega el primero!'}
        </div>
      ) : (
        <div className="grid-cols-4">
          {filtered.map((item) => {
            const isCritical = item.stock_current <= item.stock_minimum;
            return (
              <div key={item.id} className="glass-panel p-6" style={{ background: isCritical ? 'rgba(239, 68, 68, 0.05)' : '' }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-primary stat-icon-wrapper" style={{ width: 40, height: 40 }}>
                    <Box size={20} className="text-primary" />
                  </div>
                  {isCritical && <span className="badge badge-danger">Crítico</span>}
                </div>
                <h3 className="font-medium" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{item.name}</h3>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Mín: {item.stock_minimum} {item.unit}</p>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>QR: {item.qrcode}</p>

                <div className="mt-4">
                  <span className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Stock Actual</span>
                  <div className={`stat-value ${isCritical ? 'text-danger' : ''}`} style={{ fontSize: '1.75rem' }}>
                    {item.stock_current}
                  </div>
                </div>

                {/* Quick adjust */}
                {adjustId === item.id ? (
                  <div className="flex gap-2 mt-3">
                    <input
                      type="number"
                      className="input-field"
                      style={{ padding: '0.4rem', fontSize: '0.875rem' }}
                      placeholder="Δ ej. -2"
                      value={adjustDelta}
                      onChange={e => setAdjustDelta(e.target.value)}
                    />
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                      onClick={() => { handleAdjust(item, Number(adjustDelta)); setAdjustId(null); setAdjustDelta(''); }}>
                      OK
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={() => setAdjustId(null)}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-outline mt-3" style={{ width: '100%', fontSize: '0.75rem' }}
                    onClick={() => setAdjustId(item.id)}>
                    Ajustar Stock
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="modal-header">
            <h2 style={{ fontSize: '1.25rem', marginBottom: 0 }}>Nuevo Consumible</h2>
            <button className="btn-icon modal-close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
          </div>
          {formError && <div className="form-error-banner">{formError}</div>}
          <form onSubmit={handleSave}>
            <div className="modal-fields">
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Nombre *</label>
                  <input type="text" className="input-field" required placeholder="Ej. Pasta Térmica"
                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Código QR *</label>
                  <input type="text" className="input-field" required placeholder="Ej. QR-CON-001"
                    value={formData.qrcode} onChange={e => setFormData({ ...formData, qrcode: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label className="input-label">Unidad *</label>
                  <input type="text" className="input-field" required placeholder="Ej. Tubos, Botellas"
                    value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} />
                </div>
                <div className="input-group">
                  <label className="input-label">Stock Actual *</label>
                  <input type="number" className="input-field" required min="0" placeholder="0"
                    value={formData.stock_current} onChange={e => setFormData({ ...formData, stock_current: e.target.value })} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Stock Mínimo *</label>
                <input type="number" className="input-field" required min="0" placeholder="5"
                  value={formData.stock_minimum} onChange={e => setFormData({ ...formData, stock_minimum: e.target.value })} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Consumables;
