import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import VerifyDrug from './pages/VerifyDrug';
import ReportDrug from './pages/ReportDrug';
import AdminDashboard from './pages/AdminDashboard'; 
import PharmacistDashboard from './pages/PharmacistDashboard'; 
import Login from './pages/Login'; 

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('nafdac_token');
  const role = localStorage.getItem('nafdac_role');
  
  if (!token) return <Navigate to="/login" replace />;
  // Stop a pharmacist from forcing their way into the admin URL
  if (allowedRole && role !== allowedRole) return <Navigate to="/login" replace />;
  
  return children;
}

function App() {
  return (
    <Router>
      <nav className="bg-green-800 p-4 text-white flex justify-between items-center shadow-md">
        <h1 className="font-bold text-xl tracking-wide">NAFDAC Verify</h1>
        <div className="space-x-4 flex items-center">
          <Link to="/" className="hover:text-green-300">Home</Link>
          <Link to="/verify" className="hover:text-green-300">Verify Drug</Link>
          <Link to="/report" className="hover:text-green-300">Report Fake</Link>
          <Link to="/login" className="hover:text-green-300 text-sm bg-green-900 px-3 py-1 rounded ml-4 border border-green-700">Admin Portal</Link> 
        </div>
      </nav>
      <main className="min-h-screen bg-gray-50 p-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/verify" element={<VerifyDrug />} />
          <Route path="/report" element={<ReportDrug />} />
          <Route path="/login" element={<Login />} /> 
          
          {/* We wrap the AdminDashboard inside our Bouncer */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } /> 

          <Route path="/pharmacist" element={
            <ProtectedRoute allowedRole="pharmacist">
              <PharmacistDashboard />
            </ProtectedRoute>
          } /> 
        </Routes>
      </main>
    </Router>
  );
}

export default App;