import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  
  try {
    const payload = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    };
    
    console.log("Envoi:", payload); // ← DEBUG
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log("Status:", response.status); // ← DEBUG
    
    const data = await response.json();
    console.log("Réponse:", data); // ← DEBUG

    if (response.ok) {
      alert('Compte créé avec succès !');
      navigate('/login');
    } else {
      // Affiche le vrai message d'erreur de l'API
      const errorMsg = Object.entries(data)
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
        .join('\n');
      setError(errorMsg || 'Erreur lors de l\'inscription');
    }
  } catch (err) {
    console.error("Erreur fetch:", err); // ← DEBUG
    setError('Erreur de connexion au serveur');
  }
};
  return (
    <div className="min-h-screen bg-blue-800 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-2">ESATIC LMS</h2>
        <p className="text-center text-gray-500 mb-6">Créer un compte</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
              minLength={8}
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-900 text-white p-2 rounded hover:bg-blue-800 transition-colors"
          >
            S'inscrire
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
