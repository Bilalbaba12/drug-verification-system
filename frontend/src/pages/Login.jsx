import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      // NOTE: Change this to your live Render URL when pushing to production!
      const response = await fetch('https://nafdac-backend-api.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      // --- The Brute Force Shield (Rate Limiting) ---
      if (response.status === 429) {
        throw new Error("Too many failed login attempts. Please wait 60 seconds.");
      }

      if (!response.ok) throw new Error('Invalid username or password');

      const data = await response.json();
      
      // Securely store the JWT and role
      localStorage.setItem('nafdac_token', data.access_token);
      localStorage.setItem('nafdac_role', data.role);
      
      // Two-Tier Routing: Teleport the user to their specific dashboard
      if (data.role === 'admin') {
        navigate('/admin'); 
      } else {
        navigate('/pharmacist');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-lg shadow-md border-t-4 border-green-800">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Secure Portal Login</h2>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-800"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-800"
            required
          />
        </div>
        <button type="submit" className="w-full bg-green-800 text-white font-bold py-3 rounded hover:bg-green-900 transition shadow-sm">
          Secure Login
        </button>
      </form>
      
      {/* Dynamic Error Rendering */}
      {error && (
        <div className="mt-6 p-4 rounded bg-red-100 border-l-4 border-red-600">
            <p className="text-red-800 text-center font-semibold">{error}</p>
        </div>
      )}
    </div>
  );
}

export default Login;