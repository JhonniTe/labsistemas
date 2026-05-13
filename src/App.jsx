import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Consumables from './pages/Consumables';
import Movements from './pages/Movements';
import Maintenance from './pages/Maintenance';
import MapView from './pages/Map';
import Login from './pages/Login';
import { supabase } from './supabaseClient';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Verificando credenciales...</p>
      </div>
    );
  }

  const isGuest = localStorage.getItem('isGuest') === 'true';
  return (session || isGuest) ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="consumables" element={<Consumables />} />
          <Route path="movements" element={<Movements />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="map" element={<MapView />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
