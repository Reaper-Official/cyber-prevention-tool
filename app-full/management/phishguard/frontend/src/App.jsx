import { useState } from 'react';
import { Shield } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 w-96">
          <Shield className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-center mb-6">PhishGuard</h1>
          <button 
            onClick={() => setUser({name: 'Admin'})}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Connexion Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">PhishGuard Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Campagnes</p>
          <p className="text-3xl font-bold">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Emails</p>
          <p className="text-3xl font-bold">245</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Taux ouverture</p>
          <p className="text-3xl font-bold">68%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Taux clic</p>
          <p className="text-3xl font-bold">15%</p>
        </div>
      </div>
    </div>
  );
}
