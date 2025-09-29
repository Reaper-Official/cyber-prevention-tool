import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface ValidationRequestProps {
  campaignId: string | null;
  campaignName: string;
}

const ValidationRequest: React.FC<ValidationRequestProps> = ({ campaignId, campaignName }) => {
  const [status, setStatus] = React.useState<string>('pending');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (campaignId) {
      checkValidationStatus();
    }
  }, [campaignId]);

  const checkValidationStatus = async () => {
    if (!campaignId) return;
    
    setLoading(true);
    try {
      const response = await api.get('/api/campaigns/' + campaignId);
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error checking validation status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!campaignId) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Erreur de création
        </h2>
        <p className="text-gray-600">
          Une erreur est survenue lors de la création de la campagne.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Vérification du statut...</p>
      </div>
    );
  }

  const renderStatus = () => {
    switch (status) {
      case 'pending':
        return (
          <div>
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Campagne en attente de validation
            </h2>
            <p className="text-gray-600 mb-6">
              La campagne {campaignName} est en attente de validation.
            </p>
          </div>
        );
      case 'approved':
        return (
          <div>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Campagne approuvée!
            </h2>
            <p className="text-gray-600 mb-6">
              La campagne {campaignName} a été approuvée.
            </p>
          </div>
        );
      case 'rejected':
        return (
          <div>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Campagne rejetée
            </h2>
            <p className="text-gray-600 mb-6">
              La campagne {campaignName} a été rejetée.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const detailsLink = campaignId ? (
    
      href={'/campaigns/' + campaignId}
      className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
    >
      Voir les détails
    </a>
  ) : null;

  return (
    <div className="text-center py-12">
      {renderStatus()}
      <div className="mt-8 space-x-4">
        
          href="/campaigns"
          className="inline-block px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Retour aux campagnes
        </a>
        {detailsLink}
      </div>
    </div>
  );
};

export default ValidationRequest;