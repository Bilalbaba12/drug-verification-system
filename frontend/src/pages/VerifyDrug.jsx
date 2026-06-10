import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

function VerifyDrug() {
  const [drugNumber, setDrugNumber] = useState('');
  const [drugDetails, setDrugDetails] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isScanning, setIsScanning] = useState(false);

  const verifyDatabase = async (number) => {
    setStatus({ type: 'loading', message: 'Checking NAFDAC Database...' });
    setDrugDetails(null);

    try {
      // NOTE: Change this to your Render URL when pushing to production!
      const response = await fetch(`https://nafdac-backend-api.onrender.com`);
      
      // --- Catch the Rate Limit Error ---
      if (response.status === 429) {
        throw new Error("Too many verification attempts. Please wait a minute and try again.");
      }

      if (!response.ok) throw new Error('Fake or Unregistered Drug Detected!');
      
      const data = await response.json();
      setDrugDetails(data);
      setStatus({ type: 'success', message: 'Drug Verified! This product is safe.' });
      
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (drugNumber) {
      verifyDatabase(drugNumber);
    }
  };

  const handleScan = (detectedCodes) => {
    const text = Array.isArray(detectedCodes) ? detectedCodes[0].rawValue : detectedCodes;

    if (text) {
      setDrugNumber(text);
      setIsScanning(false);
      verifyDatabase(text);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-white p-8 rounded-lg shadow-md border-t-4 border-green-800">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Verify Medication</h2>
        
        {/* The QR Scanner UI */}
        {isScanning ? (
          <div className="mb-6 rounded overflow-hidden border-4 border-green-500">
            <Scanner 
              onScan={handleScan}
              onError={(err) => console.log(err)} 
            />
            <p className="text-center text-sm text-gray-500 mt-2 font-semibold">Point camera at the drug's QR Code</p>
            <button 
              onClick={() => setIsScanning(false)}
              className="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
            >
              Cancel Scan
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsScanning(true)}
            className="w-full mb-6 bg-green-800 text-white font-bold py-3 rounded hover:bg-green-900 transition flex justify-center items-center gap-2"
          >
            <span>📷</span> Scan QR Code
          </button>
        )}

        <div className="flex items-center mb-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 font-semibold">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Enter NAFDAC Number</label>
            <input 
              type="text" 
              value={drugNumber}
              onChange={(e) => setDrugNumber(e.target.value)}
              placeholder="e.g., A4-5678" 
              className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-green-800 uppercase"
            />
          </div>
          <button type="submit" className="w-full bg-gray-800 text-white font-bold py-3 rounded hover:bg-gray-900 transition">
            Verify Manually
          </button>
        </form>

        {status.message && (
          <div className={`mt-6 p-4 rounded border-l-4 ${
            status.type === 'success' ? 'bg-green-100 text-green-800 border-green-600' : 
            status.type === 'error' ? 'bg-red-100 text-red-800 border-red-600' : 
            'bg-blue-100 text-blue-800 border-blue-600'
          }`}>
            <p className="font-semibold text-center">{status.message}</p>
          </div>
        )}

        {drugDetails && (
          <div className="mt-6 p-6 bg-gray-50 rounded border border-gray-200">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Drug Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold text-gray-600">NAFDAC No:</span> {drugDetails.drug_number}</p>
              <p><span className="font-semibold text-gray-600">Name:</span> {drugDetails.name}</p>
              <p><span className="font-semibold text-gray-600">Manufacturer:</span> {drugDetails.manufacturer}</p>
              <p><span className="font-semibold text-gray-600">Expiry Date:</span> {drugDetails.expiry_date}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyDrug;