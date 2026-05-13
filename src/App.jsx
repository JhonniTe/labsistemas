import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Consumables from './pages/Consumables';
import Movements from './pages/Movements';
import Maintenance from './pages/Maintenance';
import MapView from './pages/Map';
import Login from './pages/Login';
import { auth } from './firebaseClient';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute = ({ children }) => {
  // undefined = loading, null = not logged in, object = logged in
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  if (user === undefined) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Verificando credenciales...</p>
      </div>
    );
  }

  const isGuest = localStorage.getItem('isGuest') === 'true';
  return (user || isGuest) ? children : <Navigate to="/login" replace />;
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
