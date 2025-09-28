import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Sparkles, 
  Send, 
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Building,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TargetSelection from '../components/campaigns/TargetSelection';
import TemplateSelection from '../components/campaigns/TemplateSelection';
import AITemplateGenerator from '../components/campaigns/AITemplateGenerator';
import CampaignPreview from '../components/campaigns/CampaignPreview';
import ValidationRequest from '../components/campaigns/ValidationRequest';

interface CampaignFormData {
  name: string;
  targetType: 'department' | 'specific_users' | 'all';
  targetIds: string[];
  templateType: 'predefined' | 'custom' | 'ai_generated';
  templateId?: string;
  customTemplate?: {
    subject: string;
    body: string;
    landingPage: string;
  };
  aiPrompt?: string;
  scheduledAt?: string;
}

const CampaignCreation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    targetType: 'department',
    targetIds: [],
    templateType: 'predefined'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  const steps = [
    { id: 1, name: 'Informations', icon: FileText },
    { id: 2, name: 'Ciblage', icon: Users },
    { id: 3, name: 'Template', icon: Sparkles },
    { id: 4, name: 'Aperçu', icon: CheckCircle },
    { id: 5, name: 'Validation', icon: Send }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Créer la campagne
      const response = await api.post('/api/campaigns', formData);
      setCampaignId(response.data.id);

      // Si mode sandbox ou validation requise, soumettre pour approbation
      if (process.env.REACT_APP_REQUIRE_APPROVAL === 'true') {
        await api.post(`/api/campaigns/${response.data.id}/submit`);
      }

      setCurrentStep(5);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la campagne');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Créer une nouvelle campagne
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800">
                    <strong>Rappel éthique:</strong> Cette campagne est à des fins de 
                    formation uniquement. Toute utilisation malveillante est interdite.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la campagne
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Formation Q1 2025 - Sensibilisation phishing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de lancement (optionnel)
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <TargetSelection
            targetType={formData.targetType}
            targetIds={formData.targetIds}
            onChange={(type, ids) => setFormData({
              ...formData,
              targetType: type,
              targetIds: ids
            })}
          />
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Sélection du template
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                className={`p-6 border-2 rounded-lg transition-all ${
                  formData.templateType === 'predefined'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, templateType: 'predefined' })}
              >
                <FileText className="w-8 h-8 mx-auto mb-3 text-primary-600" />
                <h3 className="font-semibold">Template prédéfinie</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Utilisez un modèle existant
                </p>
              </button>

              <button
className={`p-6 border-2 rounded-lg transition-all ${
                  formData.templateType === 'custom'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, templateType: 'custom' })}
              >
                <FileText className="w-8 h-8 mx-auto mb-3 text-primary-600" />
                <h3 className="font-semibold">Création manuelle</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Créez votre propre template
                </p>
              </button>

              <button
                className={`p-6 border-2 rounded-lg transition-all ${
                  formData.templateType === 'ai_generated'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData({ ...formData, templateType: 'ai_generated' })}
              >
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary-600" />
                <h3 className="font-semibold">Génération par IA</h3>
                <p className="text-sm text-gray-600 mt-2">
                  L'IA crée un template personnalisé
                </p>
              </button>
            </div>

            <div className="mt-6">
              {formData.templateType === 'predefined' && (
                <TemplateSelection
                  selectedId={formData.templateId}
                  onSelect={(id) => setFormData({ ...formData, templateId: id })}
                />
              )}

              {formData.templateType === 'custom' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sujet de l'email
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      value={formData.customTemplate?.subject || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        customTemplate: {
                          ...formData.customTemplate,
                          subject: e.target.value,
                          body: formData.customTemplate?.body || '',
                          landingPage: formData.customTemplate?.landingPage || ''
                        }
                      })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Corps de l'email (HTML)
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg h-48"
                      value={formData.customTemplate?.body || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        customTemplate: {
                          ...formData.customTemplate,
                          subject: formData.customTemplate?.subject || '',
                          body: e.target.value,
                          landingPage: formData.customTemplate?.landingPage || ''
                        }
                      })}
                    />
                  </div>
                </div>
              )}

              {formData.templateType === 'ai_generated' && (
                <AITemplateGenerator
                  targetProfiles={formData.targetIds}
                  campaignName={formData.name}
                  onGenerate={(template) => setFormData({
                    ...formData,
                    customTemplate: template
                  })}
                />
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <CampaignPreview
            campaignData={formData}
            onEdit={(step) => setCurrentStep(step)}
          />
        );

      case 5:
        return (
          <ValidationRequest
            campaignId={campaignId}
            campaignName={formData.name}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    currentStep >= step.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="text-sm mt-2 text-gray-600">{step.name}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {renderStepContent()}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Précédent
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!formData.name && currentStep === 1}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          ) : currentStep === 4 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? 'Création...' : 'Créer la campagne'}
              <Send className="w-4 h-4 ml-2" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CampaignCreation;