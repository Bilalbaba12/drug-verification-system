import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
        NAFDAC Online Drug Verification System
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl">
        Protecting public health by ensuring the authenticity of medical products. 
        Verify your drugs instantly or report suspicious products directly to the agency.
      </p>
      <div className="flex space-x-4">
        <Link 
          to="/verify" 
          className="bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition shadow-md"
        >
          Verify a Drug
        </Link>
        <Link 
          to="/report" 
          className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition shadow-md"
        >
          Report Fake Drug
        </Link>
      </div>
    </div>
  );
}

export default Home;