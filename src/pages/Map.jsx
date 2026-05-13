import { MapPin, Server, Laptop, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import './Map.css';

const MapView = () => {
  const [activeArea, setActiveArea] = useState(null);

  const areas = [
    { id: 'rack-a', title: 'Rack Principal A', status: 'success', equipos: 12 },
    { id: 'rack-b', title: 'Rack B (Switches)', status: 'warning', equipos: 4 },
    { id: 'taller', title: 'Mesa de Taller', status: 'danger', equipos: 1 },
    { id: 'escritorio', title: 'Escritorio Auxiliar', status: 'primary', equipos: 3 },
  ];

  return (
    <div className="animate-fade-in flex-col h-full h-screen-content">
      <div className="dashboard-header mb-6 shrink-0">
        <div>
          <h1>Mapa Físico (Sala Redes 402)</h1>
          <p>Localización visual en tiempo real de equipos pesados.</p>
        </div>
        <div className="flex gap-4">
          <div className="input-group mb-0" style={{ marginBottom: 0 }}>
             <input type="text" className="input-field" placeholder="Buscar equipo y localizar..." style={{ width: 250 }} />
          </div>
        </div>
      </div>

      <div className="grid-cols-3 h-full mb-8">
        <div className="glass-panel col-span-2 p-6 flex flex-col relative" style={{ minHeight: '500px', background: 'rgba(10, 15, 25, 0.8)', border: '1px solid var(--primary-glow)' }}>
           
           {/* Mockup SVG Map Background */}
           <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-20 pointer-events-none">
              <div style={{ width: '80%', height: '80%', border: '4px solid white', borderRadius: '1rem' }}></div>
              {/* Decoraciones de plano */}
           </div>

           {/* Interactive Map Nodes (Absolute positions simulated) */}
           <div className="relative w-full h-full">
              
              <button 
                className={`map-node ${activeArea === 'rack-a' ? 'active pulse-success' : ''}`}
                style={{ top: '10%', left: '15%' }}
                onClick={() => setActiveArea('rack-a')}
              >
                <Server size={24} />
                <span>Rack A</span>
              </button>

              <button 
                className={`map-node ${activeArea === 'rack-b' ? 'active pulse-warning' : ''}`}
                style={{ top: '10%', left: '45%' }}
                onClick={() => setActiveArea('rack-b')}
              >
                <Server size={24} />
                <span>Rack B</span>
              </button>

              <button 
                className={`map-node ${activeArea === 'taller' ? 'active pulse-danger' : ''}`}
                style={{ top: '60%', left: '75%' }}
                onClick={() => setActiveArea('taller')}
              >
                <WrenchIcon size={24} />
                <span>Taller</span>
              </button>

              <button 
                className={`map-node ${activeArea === 'escritorio' ? 'active pulse-primary' : ''}`}
                style={{ top: '80%', left: '20%' }}
                onClick={() => setActiveArea('escritorio')}
              >
                <Laptop size={24} />
                <span>Docente</span>
              </button>
           </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="mb-4 text-xl">Info Ubicación</h2>
          
          {activeArea ? (
            <div className="animate-fade-in">
               {areas.filter(a => a.id === activeArea).map(area => (
                 <div key={area.id}>
                    <h3 className="text-xl text-main font-bold mb-2">{area.title}</h3>
                    <p className="text-muted mb-6">Equipos detectados localizados en esta zona física.</p>
                    
                    <div className="flex-col gap-3">
                       <div className="glass-panel p-3 bg-opacity-50">
                         <h4 className="text-sm font-medium">Cisco Catalyst 2960</h4>
                         <span className="badge badge-success mt-1">Operativo</span>
                       </div>
                       <div className="glass-panel p-3 bg-opacity-50">
                         <h4 className="text-sm font-medium">Router Generico TPLINK</h4>
                         <span className="badge badge-success mt-1">Operativo</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          ) : (
             <div className="flex-col items-center justify-center text-center text-muted h-full opacity-50" style={{ marginTop: '50%'}}>
               <MapPin size={48} className="mb-4" />
               <p>Selecciona un nodo del mapa para ver los activos físicamente ahí.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Polyfill icon to avoid missing import
const WrenchIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
);

export default MapView;
