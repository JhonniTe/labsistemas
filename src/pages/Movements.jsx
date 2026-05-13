import { ScanLine, Send, CornerDownLeft, Loader2, CheckCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { db } from '../firebaseClient';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

const Movements = () => {
  const [scannedCode, setScannedCode] = useState('');
  const [assetData, setAssetData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [areas, setAreas] = useState([]);

  const [operationType, setOperationType] = useState('salida');
  const [destination, setDestination] = useState('');
  const [responsible, setResponsible] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchAreas = async () => {
      const snap = await getDocs(collection(db, 'areas'));
      setAreas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchAreas();
  }, []);

  const initScanner = () => {
    setScannerActive(true);
    setSuccessMsg(null);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 300, height: 100 },
        fps: 10,
        rememberLastUsedCamera: true,
      }, false);
      scanner.render((decodedText) => {
        handleManualSearch(decodedText);
        scanner.pause(true);
      }, () => {});
      window.scannerInstance = scanner;
    }, 100);
  };

  const stopScanner = () => {
    if (window.scannerInstance) {
      window.scannerInstance.clear().catch(e => console.error(e));
      setScannerActive(false);
    }
  };

  const handleManualSearch = async (codeValue) => {
    const code = codeValue || scannedCode;
    if (!code) return;

    setScannedCode(code);
    setIsSearching(true);
    setAssetData(null);
    setSuccessMsg(null);
    setErrorMsg(null);

    const q = query(collection(db, 'assets'), where('barcode', '==', code));
    const snap = await getDocs(q);

    if (snap.empty) {
      setErrorMsg('Activo no encontrado con el código: ' + code);
    } else {
      const asset = { id: snap.docs[0].id, ...snap.docs[0].data() };
      setAssetData(asset);
      setOperationType(asset.status === 'en_prestamo' ? 'devolucion' : 'salida');
    }
    setIsSearching(false);
  };

  const submitMovement = async () => {
    if (!assetData) return;
    if (operationType === 'salida' && (!destination || !responsible)) {
      setErrorMsg('Por favor ingresa Destino y Responsable para la salida.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const destinationAreaId = operationType === 'salida' ? destination : assetData.area_id;
    const destinationAreaName = areas.find(a => a.id === destinationAreaId)?.name || null;

    try {
      // 1. Insert movement record
      await addDoc(collection(db, 'movements'), {
        item_type: 'asset',
        item_id: assetData.id,
        operation_type: operationType,
        destination_area_id: destinationAreaId || null,
        destination_area_name: destinationAreaName,
        responsible_name: operationType === 'devolucion' ? 'RETORNO A BASE' : responsible,
        quantity: 1,
        createdAt: serverTimestamp(),
      });

      // 2. Update asset status
      const newStatus = operationType === 'salida' ? 'en_prestamo' : 'operativo';
      await updateDoc(doc(db, 'assets', assetData.id), {
        status: newStatus,
        area_id: destinationAreaId || null,
      });

      setSuccessMsg(`¡Movimiento registrado con éxito para: ${assetData.name}!`);
      setAssetData(null);
      setScannedCode('');
      setResponsible('');
      setDestination('');
      if (scannerActive && window.scannerInstance) window.scannerInstance.resume();
    } catch (err) {
      setErrorMsg('Error registrando movimiento: ' + err.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header mb-6">
        <div>
          <h1>Movimientos</h1>
          <p>Registro rápido de salidas, devoluciones y consumo.</p>
        </div>
      </div>

      <div className="grid-cols-2">
        {/* Scanner Panel */}
        <div className="glass-panel p-6">
          <h2 className="mb-6 flex items-center gap-2">
            <ScanLine className="text-primary" />
            Escáner Activo
          </h2>
          {!scannerActive ? (
            <div style={{ height: '240px', background: 'var(--bg-dark)', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', marginBottom: '1.5rem' }}>
              <ScanLine size={48} className="text-muted mb-4" />
              <p className="text-muted text-center" style={{ fontSize: '0.875rem', padding: '0 1rem' }}>
                Usa la cámara o ingresa el código manualmente.
              </p>
              <button className="btn btn-primary mt-4" onClick={initScanner}>Activar Cámara</button>
            </div>
          ) : (
            <div className="mb-6">
              <div id="reader" style={{ width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}></div>
              <button className="btn btn-outline mt-2" style={{ width: '100%' }} onClick={stopScanner}>Detener Cámara</button>
            </div>
          )}
        </div>

        {/* Operation Panel */}
        <div className="glass-panel p-6">
          <h2 className="mb-6">Registrar Operación</h2>

          {successMsg && (
            <div className="mb-4 p-4 flex items-center gap-2" style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', color: 'var(--success)' }}>
              <CheckCircle size={20} /> {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 p-4" style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem', color: 'var(--danger)', fontSize: '0.875rem' }}>
              {errorMsg}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Código (USB / Manual)</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field"
                placeholder="Ej. UTP-2026-001"
                value={scannedCode}
                onChange={e => setScannedCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
              />
              <button disabled={isSearching} className="btn btn-primary" onClick={() => handleManualSearch()}>
                {isSearching ? <Loader2 className="animate-spin" /> : 'Buscar'}
              </button>
            </div>

            {assetData && (
              <div className="mt-3 p-3 border rounded-md" style={{ borderColor: 'var(--primary)', background: 'rgba(220,38,38,0.05)', fontSize: '0.875rem' }}>
                <span className="font-bold block" style={{ color: 'var(--primary)' }}>{assetData.name} {assetData.model}</span>
                <span className="text-muted">Estado: {assetData.status}</span>
              </div>
            )}
          </div>

          <div className="grid-cols-2 mb-4">
            <button
              className={`btn flex-col items-center justify-center gap-2 ${operationType === 'salida' ? 'btn-primary' : 'btn-outline'}`}
              style={{ height: '80px', opacity: !assetData ? 0.5 : 1 }}
              onClick={() => setOperationType('salida')}
              disabled={!assetData}
            >
              <Send size={24} />
              <span>Préstamo</span>
            </button>
            <button
              className={`btn flex-col items-center justify-center gap-2 ${operationType === 'devolucion' ? 'btn-primary' : 'btn-outline'}`}
              style={{ height: '80px', opacity: !assetData ? 0.5 : 1 }}
              onClick={() => setOperationType('devolucion')}
              disabled={!assetData}
            >
              <CornerDownLeft size={24} />
              <span>Devolución</span>
            </button>
          </div>

          {operationType === 'salida' && assetData && (
            <>
              <div className="input-group">
                <label className="input-label">Destino / Aula</label>
                <select className="input-field" style={{ appearance: 'none' }} value={destination} onChange={e => setDestination(e.target.value)}>
                  <option value="">Seleccionar Aula / Taller...</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Responsable</label>
                <input type="text" className="input-field" placeholder="Nombre completo" value={responsible} onChange={e => setResponsible(e.target.value)} />
              </div>
            </>
          )}

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
            onClick={submitMovement}
            disabled={!assetData || isSubmitting}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirmar Movimiento'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Movements;
