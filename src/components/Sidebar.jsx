import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Database, Box, ArrowRightLeft, Settings, Layers, Map, Wrench } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/inventory', name: 'Inventario', icon: Database },
    { path: '/consumables', name: 'Consumibles', icon: Box },
    { path: '/movements', name: 'Movimientos', icon: ArrowRightLeft },
    { path: '/maintenance', name: 'Mantenimiento', icon: Wrench },
    { path: '/map', name: 'Mapa Lab', icon: Map },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <Layers className="sidebar-logo-icon" size={32} />
        <div>
          <h2 className="sidebar-brand text-gradient" style={{ fontSize: '1.25rem' }}>Inventarios Utepsa</h2>
          <span className="sidebar-subtitle">Lab. Sistemas y Redes</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-text">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-outline" style={{ width: '100%' }}>
          <Settings size={18} />
          <span>Configuración</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
