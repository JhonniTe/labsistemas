import { useState } from 'react';
import { Layers, ArrowRight, Loader2 } from 'lucide-react';
import { auth } from '../firebaseClient';
import { signInWithEmailAndPassword } from 'firebase/auth';
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

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Espera unos minutos.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Sin conexión a internet. Verifica tu red.');
      } else {
        setError('Error: ' + err.message);
      }
      setLoading(false);
    }
  };

  const handleTestLogin = () => {
    localStorage.setItem('isGuest', 'true');
    navigate('/dashboard');
  };

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
          <div className="login-error text-danger" style={{ background: 'rgba(220, 38, 38, 0.1)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
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

          <button type="submit" disabled={loading} className="btn btn-primary login-btn">
            {loading ? <Loader2 className="animate-spin" /> : 'Ingresar al Sistema'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="login-footer">
          <p className="text-muted text-sm text-center mb-4">¿Sin cuenta? Usa el modo prueba</p>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleTestLogin}>
            Entrar como Invitado (Modo Prueba)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
