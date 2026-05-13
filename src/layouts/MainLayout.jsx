import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-content">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
