import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface ValidationRequestProps {
  campaignId: string | null;
  campaignName: string;
}

const ValidationRequest: React.FC<ValidationRequestProps> = ({ campaignId, campaignName }) => {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (campaignId) {
      checkValidationStatus();
    }
  }, [campaignId]);

  const checkValidationStatus = async () => {
    if (!campaignId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/api/campaigns/${campaignId}`);
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

  return (
    <div className="text-center py-12">
      {status === 'pending' && (
        <div>
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Campagne en attente de validation
          </h2>
          <p className="text-gray-600 mb-6">
            La campagne &quot;{campaignName}&quot; a été créée avec succès et est en attente de validation
            par l&apos;équipe RH/Sécurité.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-semibold text-blue-900 mb-2">Prochaines étapes:</h3>
            <ul className="text-sm text-blue-800 text-left space-y-1">
              <li>• Un email a été envoyé aux validateurs</li>
              <li>• Vous serez notifié une fois la décision prise</li>
              <li>• La campagne sera lancée après approbation</li>
            </ul>
          </div>
        </div>
      )}

      {status === 'approved' && (
        <div>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Campagne approuvée!
          </h2>
          <p className="text-gray-600 mb-6">
            La campagne &quot;{campaignName}&quot; a été approuvée et sera lancée selon le planning défini.
          </p>
        </div>
      )}

      {status === 'rejected' && (
        <div>
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Campagne rejetée
          </h2>
          <p className="text-gray-600 mb-6">
            La campagne &quot;{campaignName}&quot; a été rejetée. Veuillez consulter les commentaires
            du validateur et apporter les modifications nécessaires.
          </p>
        </div>
      )}

      <div className="mt-8 space-x-4">
        
          href="/campaigns"
          className="inline-block px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          Retour aux campagnes
        </a>
        
        {campaignId && (
          
            href={`/campaigns/${campaignId}`}
            className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Voir les détails
          </a>
        )}
      </div>
    </div>
  );
};

export default ValidationRequest;