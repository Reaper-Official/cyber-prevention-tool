import React from 'react';
import { Edit2, Users, Mail, Calendar } from 'lucide-react';

interface CampaignPreviewProps {
  campaignData: any;
  onEdit: (step: number) => void;
}

const CampaignPreview: React.FC<CampaignPreviewProps> = ({ campaignData, onEdit }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Aperçu de la campagne</h2>
      
      {/* Informations générales */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Informations générales</h3>
          <button
            onClick={() => onEdit(1)}
            className="text-primary-600 hover:text-primary-700"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-400 mr-3" />
            <span className="text-gray-600">Nom:</span>
            <span className="ml-2 font-medium">{campaignData.name}</span>
          </div>
          
          {campaignData.scheduledAt && (
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-600">Date de lancement:</span>
              <span className="ml-2 font-medium">
                {new Date(campaignData.scheduledAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ciblage */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Ciblage</h3>
          <button
            onClick={() => onEdit(2)}
            className="text-primary-600 hover:text-primary-700"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center">
          <Users className="w-5 h-5 text-gray-400 mr-3" />
          <span className="text-gray-600">Type:</span>
          <span className="ml-2 font-medium">
            {campaignData.targetType === 'all' 
              ? 'Tous les employés'
              : campaignData.targetType === 'department'
              ? 'Départements spécifiques'
              : 'Employés sélectionnés'}
          </span>
        </div>
        
        {campaignData.targetIds.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            {campaignData.targetIds.length} cible(s) sélectionnée(s)
          </p>
        )}
      </div>

      {/* Template */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Template</h3>
          <button
            onClick={() => onEdit(3)}
            className="text-primary-600 hover:text-primary-700"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <span className="text-gray-600">Type:</span>
            <span className="ml-2 font-medium">
              {campaignData.templateType === 'predefined' 
                ? 'Template prédéfinie'
                : campaignData.templateType === 'custom'
                ? 'Template personnalisée'
                : 'Générée par IA'}
            </span>
          </div>
          
          {campaignData.customTemplate && (
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">Sujet:</span>
                <p className="mt-1 p-2 bg-gray-50 rounded">
                  {campaignData.customTemplate.subject}
                </p>
              </div>
              
              <div>
                <span className="text-gray-600">Aperçu du corps:</span>
                <div 
                  className="mt-1 p-3 bg-gray-50 rounded max-h-40 overflow-y-auto"
                  dangerouslySetInnerHTML={{ 
                    __html: campaignData.customTemplate.body.substring(0, 200) + '...' 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Avertissement */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Rappel:</strong> Cette campagne sera soumise à validation avant envoi.
          Assurez-vous que toutes les informations sont correctes.
        </p>
      </div>
    </div>
  );
};

export default CampaignPreview;