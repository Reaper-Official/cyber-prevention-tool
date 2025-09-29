import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface ValidationRequestProps {
  campaignId: string | null;
  campaignName: string;
}

const ValidationRequest: React.FC<ValidationRequestProps> = ({ campaignId, campaignName }) => {
  const [status, setStatus] = useState<string>('pending');
  const [loading, setLoading] = useState<boolean>(false);

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
      setStatus(response.data.status || 'pending');
    } catch (error) {
      console.error('Error checking validation status:', error);
      setStatus('pending');
    } finally {
      setLoading(false);
    }
  };

  // Gestion du cas où il n'y a pas d'ID de campagne
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
        <div className="mt-8">
          <a 
            href="/campaigns" 
            className="inline-block px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Retour aux campagnes
          </a>
        </div>
      </div>
    );
  }

  // Affichage du loader pendant le chargement
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Vérification du statut...</p>
      </div>
    );
  }

  // Rendu du contenu principal
  return (
    <div className="text-center py-12">
      {/* Statut: En attente */}
      {status === 'pending' && (
        <div>
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Campagne en attente de validation
          </h2>
          <p className="text-gray-600 mb-6">
            La campagne "{campaignName}" a été créée avec succès et est en attente 
            de validation par l'équipe RH/Sécurité.
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

      {/* Statut: Approuvée */}
      {status === 'approved' && (
        <div>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Campagne approuvée!
          </h2>
          <p className="text-gray-600 mb-6">
            La campagne "{campaignName}" a été approuvée et sera lancée 
            selon le planning défini.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-green-800">
              La campagne est maintenant active et les emails de simulation 
              seront envoyés aux destinataires sélectionnés.
            </p>
          </div>
        </div>
      )}

      {/* Statut: Rejetée */}
      {status === 'rejected' && (
        <div>
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Campagne rejetée
          </h2>
          <p className="text-gray-600 mb-6">
            La campagne "{campaignName}" a été rejetée. Veuillez consulter 
            les commentaires du validateur et apporter les modifications nécessaires.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-800">
              Vous pouvez modifier la campagne et la soumettre à nouveau pour validation.
            </p>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="mt-8 space-x-4">
        
          href="/campaigns"
          className="inline-block px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Retour aux campagnes
        </a>
        
          href={`/campaigns/${campaignId}`}
          className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Voir les détails
        </a>
      </div>
    </div>
  );
};

export default ValidationRequest;