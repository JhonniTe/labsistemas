import { ScanLine, Send, CornerDownLeft, Loader2, CheckCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../supabaseClient';
import { useEffect, useState } from 'react';

const Movements = () => {
  const [scannedCode, setScannedCode] = useState('');
  const [assetData, setAssetData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [areas, setAreas] = useState([]);
  
  // Form State
  const [operationType, setOperationType] = useState('salida'); // salida, devolucion
  const [destination, setDestination] = useState('');
  const [responsible, setResponsible] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    // Cargar áreas
    const fetchAreas = async () => {
      const { data } = await supabase.from('areas').select('*');
      if (data) setAreas(data);
    };
    fetchAreas();
  }, []);

  const initScanner = () => {
    setScannerActive(true);
    setSuccessMsg(null);
    // Limpiamos temporalmente si existe. TimeOut para asegurar re-render del div reader
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 300, height: 100 }, // Rectangular ideal para código UTEPSA (1D)
        fps: 10,
        rememberLastUsedCamera: true
      }, false);
  
      scanner.render((decodedText) => {
        handleManualSearch(decodedText);
        scanner.pause(true); // Pausar tras leer
      }, () => {});
  
      // Guardar instancia globalmente para cuando se limpie no falle
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

    const { data, error } = await supabase
      .from('assets')
      .select('*, areas(name)')
      .eq('barcode', code)
      .single();

    if (error || !data) {
      alert('Activo no encontrado: ' + code);
    } else {
      setAssetData(data);
      // Auto pre-seleccionamos tipo de operacion lógica
      if (data.status === 'en_prestamo') setOperationType('devolucion');
      else setOperationType('salida');
    }
    
    setIsSearching(false);
  };

  const submitMovement = async () => {
    if (!assetData) return;
    if (operationType === 'salida' && (!destination || !responsible)) {
      alert("Por favor ingrese Destino y Responsable para la salida.");
      return;
    }

    setIsSubmitting(true);
    const destinationAreaValue = operationType === 'salida' ? destination : assetData.area_id;

    // 1. Insert Movement Historial
    const { error: moveError } = await supabase.from('movements').insert([{
      item_type: 'asset',
      item_id: assetData.id,
      operation_type: operationType,
      destination_area_id: destinationAreaValue || null,
      responsible_name: operationType === 'devolucion' ? 'RETORNO A BASE' : responsible,
      quantity: 1
    }]);

    if (!moveError) {
      // 2. Update Asset Status and location
      const newStatus = operationType === 'salida' ? 'en_prestamo' : 'operativo';
      await supabase.from('assets').update({
        status: newStatus,
        area_id: destinationAreaValue || null
      }).eq('id', assetData.id);

      setSuccessMsg(`¡Movimiento registrado con éxito para: ${assetData.name}!`);
      setAssetData(null);
      setScannedCode('');
      setResponsible('');
      setDestination('');
      if(scannerActive && window.scannerInstance) {
          window.scannerInstance.resume();
      }
    } else {
      alert('Error registrando movimiento: ' + moveError.message);
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
        <div className="glass-panel p-6">
          <h2 className="mb-6 flex items-center gap-2">
            <ScanLine className="text-primary" />
            Escáner Activo
          </h2>
          
          {/* Scanner Area */}
          {!scannerActive ? (
            <div style={{ height: '240px', background: 'var(--bg-dark)', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', marginBottom: '1.5rem' }}>
              <ScanLine size={48} className="text-muted mb-4" style={{ borderRadius: '50%' }} />
              <p className="text-muted text-center text-sm px-4">Utiliza la cámara para leer códigos automáticos o ingresalo manualmente a la derecha.</p>
              <button className="btn btn-primary mt-4" onClick={initScanner}>Activar Cámara</button>
            </div>
          ) : (
            <div className="mb-6 relative">
               <div id="reader" style={{ width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}></div>
               <button className="btn btn-outline mt-2 w-full text-sm" onClick={stopScanner}>Detener Cámara</button>
            </div>
          )}
        </div>

        <div className="glass-panel p-6">
          <h2 className="mb-6">Registrar Operación</h2>
          
          {successMsg && (
            <div className="mb-6 bg-success text-success p-4 rounded-md flex items-center gap-2" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
               <CheckCircle size={20} />
               {successMsg}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Código (USB / Manual)</label>
            <div className="flex gap-2">
              <input type="text" className="input-field" placeholder="Ej. 0601050010" value={scannedCode} onChange={e => setScannedCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleManualSearch()} />
              <button disabled={isSearching} className="btn btn-primary" onClick={() => handleManualSearch()}>{isSearching ? <Loader2 className="animate-spin" /> : 'Buscar'}</button>
            </div>
            
            {assetData && (
              <div className="mt-3 p-3 bg-dark rounded-md border border-primary text-sm flex justify-between items-center bg-gray-50">
                <div>
                  <span className="font-bold block text-primary">{assetData.name} {assetData.model}</span>
                  <span className="text-muted">Estado Actual: {assetData.status} | Ubicación: {assetData.areas?.name || 'Bodega'}</span>
                </div>
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
                <select className="input-field" style={{ appearance: 'none' }} value={destination} onChange={e=>setDestination(e.target.value)}>
                  <option value="">Seleccionar Aula / Taller...</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Responsable (Docente / Alumno)</label>
                <input type="text" className="input-field" placeholder="Nombre completo" value={responsible} onChange={e=>setResponsible(e.target.value)} />
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
