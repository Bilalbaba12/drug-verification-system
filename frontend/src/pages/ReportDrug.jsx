import { useState } from 'react';

function ReportDrug() {
  const [formData, setFormData] = useState({
    drug_name: '',
    manufacturer: '',
    purchase_location: '',
    reporter_phone: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  
  // FIXED: Added the missing state to track if the browser is currently searching for GPS
  const [isLocating, setIsLocating] = useState(false); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Submitting your report to NAFDAC...' });

    try {
      const response = await fetch('https://nafdac-backend-api.onrender.com/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit report. Please check your connection and try again.');
      
      const data = await response.json();
      setStatus({ type: 'success', message: data.message });
      // Clear the form after a successful submission
      setFormData({ drug_name: '', manufacturer: '', purchase_location: '', reporter_phone: '' }); 
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setFormData({ ...formData, purchase_location: `GPS: ${lat}, ${lng}` });
          setIsLocating(false);
        },
        (error) => {
          alert("Could not get your location. Please type it in manually.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Report a Counterfeit Drug</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Drug Name *</label>
          <input 
            type="text" 
            name="drug_name"
            value={formData.drug_name}
            onChange={handleChange}
            placeholder="e.g., Panadol Extra" 
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Manufacturer (if known)</label>
          <input 
            type="text" 
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            placeholder="e.g., Emzor" 
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        
        {/* FIXED: Wrapped the input and the new Auto-Locate button in a flex container */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Purchase Location *</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              name="purchase_location"
              value={formData.purchase_location}
              onChange={handleChange}
              placeholder="Pharmacy name, street, or city" 
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <button 
              type="button" 
              onClick={handleGetLocation}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 font-semibold text-sm transition whitespace-nowrap"
              disabled={isLocating}
            >
              {isLocating ? 'Locating...' : '📍 Auto-Locate'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Your Phone Number *</label>
          <input 
            type="tel" 
            name="reporter_phone"
            value={formData.reporter_phone}
            onChange={handleChange}
            placeholder="080..." 
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        
        <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded hover:bg-red-700 transition">
          Submit Report
        </button>
      </form>

      {status.message && (
        <div className={`mt-6 p-4 rounded border-l-4 ${
          status.type === 'success' ? 'bg-green-100 text-green-800 border-green-600' : 
          status.type === 'error' ? 'bg-red-100 text-red-800 border-red-600' : 
          'bg-blue-100 text-blue-800 border-blue-600'
        }`}>
          <p className="font-semibold">{status.message}</p>
        </div>
      )}
    </div>
  );
}

export default ReportDrug;