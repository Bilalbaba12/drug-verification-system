import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PharmacistDashboard() {
  const [formData, setFormData] = useState({ drug_number: '', name: '', manufacturer: '', expiry_date: '' });
  const [drugs, setDrugs] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const navigate = useNavigate();
  const token = localStorage.getItem('nafdac_token');

  const fetchDrugs = async () => {
    const res = await fetch('http://localhost:8000/api/drugs', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if(res.ok) {
      const data = await res.json();
      setDrugs(data);
    }
  };

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchDrugs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/drugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to register drug.');
      setStatus({ type: 'success', message: 'Drug submitted! Waiting for Admin Approval.' });
      setFormData({ drug_number: '', name: '', manufacturer: '', expiry_date: '' }); 
      fetchDrugs(); // Refresh table
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-8">
      {/* Registration Form */}
      <div className="bg-white p-8 rounded-lg shadow border-t-4 border-blue-600">
        <h2 className="text-2xl font-bold mb-4">Pharmacist Portal - Register Drug</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input type="text" name="drug_number" value={formData.drug_number} onChange={(e) => setFormData({...formData, drug_number: e.target.value})} placeholder="NAFDAC Number" className="border p-2 rounded" required />
          <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Drug Name" className="border p-2 rounded" required />
          <input type="text" name="manufacturer" value={formData.manufacturer} onChange={(e) => setFormData({...formData, manufacturer: e.target.value})} placeholder="Manufacturer" className="border p-2 rounded" required />
          <input type="date" name="expiry_date" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} className="border p-2 rounded" required />
          <button type="submit" className="col-span-2 bg-blue-600 text-white font-bold py-2 rounded">Submit for Approval</button>
        </form>
        {status.message && <p className="mt-4 text-green-700 font-bold">{status.message}</p>}
      </div>

      {/* Database View */}
      <div className="bg-white p-8 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">Database Records</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">NAFDAC No.</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {drugs.map(d => (
              <tr key={d.id}>
                <td className="p-3 border">{d.drug_number}</td>
                <td className="p-3 border">{d.name}</td>
                <td className="p-3 border font-bold text-sm">
                  {d.is_approved ? <span className="text-green-600">Approved</span> : <span className="text-yellow-600">Pending</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PharmacistDashboard;