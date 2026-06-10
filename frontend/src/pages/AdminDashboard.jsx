import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('nafdac_token');

  const fetchData = async () => {
    // Fetch Reports
    const repRes = await fetch('http://localhost:8000/api/reports', { headers: { 'Authorization': `Bearer ${token}` }});
    if(repRes.ok) setReports(await repRes.json());
    
    // Fetch Drugs
    const drugRes = await fetch('http://localhost:8000/api/drugs', { headers: { 'Authorization': `Bearer ${token}` }});
    if(drugRes.ok) setDrugs(await drugRes.json());
  };

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchData();
  }, []);

  const handleApprove = async (id) => {
    await fetch(`http://localhost:8000/api/drugs/${id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData(); // Refresh tables
  };

  const handleDeleteReport = async (id) => {
    await fetch(`http://localhost:8000/api/reports/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('nafdac_token');
    localStorage.removeItem('nafdac_role');
    navigate('/login');
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-8">
      <div className="flex justify-between items-center bg-gray-800 text-white p-4 rounded shadow">
        <h2 className="text-2xl font-bold">NAFDAC Admin Control Panel</h2>
        <button onClick={handleLogout} className="bg-red-600 px-4 py-1 rounded">Logout</button>
      </div>

      {/* Reports Table */}
      <div className="bg-white p-6 rounded-lg shadow border-t-4 border-red-600">
        <h3 className="text-xl font-bold mb-4">Counterfeit Reports</h3>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Drug</th>
              <th className="p-2 border">Location</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id}>
                <td className="p-2 border font-semibold">{r.drug_name}</td>
                <td className="p-2 border">{r.purchase_location}</td>
                <td className="p-2 border">{r.reporter_phone}</td>
                <td className="p-2 border">
                  <button onClick={() => handleDeleteReport(r.id)} className="text-red-600 font-bold hover:underline">Resolve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drug Approval Table */}
      <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-600">
        <h3 className="text-xl font-bold mb-4">Drug Registry</h3>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">NAFDAC No.</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {drugs.map(d => (
              <tr key={d.id}>
                <td className="p-2 border">{d.drug_number}</td>
                <td className="p-2 border">{d.name}</td>
                <td className="p-2 border font-bold">
                  {d.is_approved ? <span className="text-green-600">Approved</span> : <span className="text-yellow-600">Pending</span>}
                </td>
                <td className="p-2 border">
                  {!d.is_approved && (
                    <button onClick={() => handleApprove(d.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Approve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;