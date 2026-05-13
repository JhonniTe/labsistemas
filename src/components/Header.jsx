import { Bell, Search, User } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header glass-panel">
      <div className="header-search">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          placeholder="Buscar activos, consumibles por código..." 
          className="search-input"
        />
      </div>
      
      <div className="header-actions">
        <button className="btn-icon">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        
        <div className="user-profile">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-info">
            <span className="user-name">Admin</span>
            <span className="user-role">Auxiliar Lab</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
