import { useState } from 'react';
import { Layers, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Autenticación real con Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleTestLogin = () => {
    // Para pruebas rápidas si no han creado un usuario en Supabase aún.
    localStorage.setItem('isGuest', 'true');
    navigate('/dashboard');
  }

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-panel">
        <div className="login-header">
          <div className="login-logo bg-primary">
            <Layers size={36} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem' }}>Inventarios Utepsa</h1>
          <p>Lab. Sistemas y Redes</p>
        </div>

        {error && (
          <div className="login-error text-danger bg-danger" style={{ background: 'rgba(220, 38, 38, 0.1)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label className="input-label">Correo Electrónico</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="admin@laboratorio.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Contraseña</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="flex justify-between items-center mb-6">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" /> Recordarme
            </label>
            <a href="#" className="text-sm text-primary" style={{ textDecoration: 'none' }}>¿Olvidaste tu clave?</a>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary login-btn">
            {loading ? <Loader2 className="animate-spin" /> : 'Ingresar al Sistema'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="login-footer">
          <p className="text-muted text-sm text-center mb-4">¿No tienes cuenta de Auxiliar?</p>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleTestLogin}>
            Entrar como Invitado (Modo Prueba)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
