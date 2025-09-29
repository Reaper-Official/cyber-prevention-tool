import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface ValidationRequestProps {
  campaignId: string | null;
  campaignName: string;
}

const ValidationRequest: React.FC<ValidationRequestProps> = ({ campaignId, campaignName }) => {
  const [status, setStatus] = React.useState('pending');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (campaignId) {
      checkStatus();
    }
  }, [campaignId]);

  const checkStatus = async () => {
    if (!campaignId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/campaigns/${campaignId}`);
      setStatus(res.data.status || 'pending');
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (!campaignId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Erreur</h2>
        <p>Campagne non trouvée</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
        <p className="mt-4">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      {status === 'pending' && (
        <div>
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">En attente de validation</h2>
          <p className="mb-4">Campagne: {campaignName}</p>
        </div>
      )}
      
      {status === 'approved' && (
        <div>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Approuvée</h2>
          <p className="mb-4">Campagne: {campaignName}</p>
        </div>
      )}
      
      {status === 'rejected' && (
        <div>
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Rejetée</h2>
          <p className="mb-4">Campagne: {campaignName}</p>
        </div>
      )}

      <div className="mt-8 space-x-4">
        <a href="/campaigns" className="px-6 py-2 bg-gray-200 rounded">
          Retour
        </a>
        <a href={`/campaigns/${campaignId}`} className="px-6 py-2 bg-primary-600 text-white rounded">
          Détails
        </a>
      </div>
    </div>
  );
};

export default ValidationRequest;