import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const payload = { email, password };
      console.log("Login envoi:", payload);
      
      const apiUrl = import.meta.env.VITE_API_URL;
      console.log("API URL:", apiUrl);
      
      // Timeout de 60s pour le cold start Render
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch(`${apiUrl}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("Login status:", response.status);
      
      const data = await response.json();
      console.log("Login réponse:", data);

      if (!response.ok) {
        // Affiche le vrai message d'erreur de l'API
        const errorMsg = data.detail 
          || Object.entries(data)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
              .join('\n')
          || 'Email ou mot de passe incorrect';
        setError(errorMsg);
        return;
      }

      // Stocker le token et les infos utilisateur
      if (data.access) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh || '');
        
        setAuth(data.access, data.user || { email });
        navigate('/dashboard');
      } else {
        setError('Réponse invalide du serveur');
      }
      
    } catch (err: any) {
      console.error("Erreur fetch login:", err);
      
      if (err.name === 'AbortError') {
        setError('Le serveur met trop de temps à répondre. Réessaie dans 30 secondes.');
      } else {
        setError('Erreur de connexion au serveur. Le backend est peut-être en train de se réveiller (cold start).');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-800 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-2">ESATIC LMS</h2>
        <p className="text-center text-gray-500 mb-6">Plateforme d'apprentissage numérique</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm whitespace-pre-line">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-900 text-white p-2 rounded hover:bg-blue-800 transition-colors disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
