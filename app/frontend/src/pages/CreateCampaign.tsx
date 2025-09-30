import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Users, Target, Sparkles } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  subject: string;
  body: string;
  description: string;
  indicators: string[];
}

interface Department {
  name: string;
  count: number;
}

const CreateCampaign: React.FC = () => {
  const [step, setStep] = useState(1);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    templateId: '',
    targetDepartments: [] as string[],
    sandboxMode: true,
    scheduledFor: '',
  });
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
    fetchDepartments();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/users');
      const deptMap = new Map<string, number>();
      
      response.data.forEach((user: any) => {
        if (user.department) {
          deptMap.set(user.department, (deptMap.get(user.department) || 0) + 1);
        }
      });

      const depts = Array.from(deptMap.entries()).map(([name, count]) => ({ name, count }));
      setDepartments(depts);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setFormData({ ...formData, templateId: template.id });
  };

  const handleDepartmentToggle = (dept: string) => {
    setFormData({
      ...formData,
      targetDepartments: formData.targetDepartments.includes(dept)
        ? formData.targetDepartments.filter((d) => d !== dept)
        : [...formData.targetDepartments, dept],
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await api.post('/campaigns', formData);
      navigate(`/campaigns/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('Erreur lors de la création de la campagne');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      BANKING: '🏦',
      DELIVERY: '📦',
      IT_SECURITY: '🔐',
      GOVERNMENT: '🏛️',
      INTERNAL: '🏢',
    };
    return icons[category] || '📧';
  };

  return (
    <div>
      <button
        onClick={() => navigate('/campaigns')}
        className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Retour aux campagnes
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Créer une Campagne</h1>
        <p className="text-gray-600 mt-2">Configurez votre campagne de sensibilisation</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                  step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    step > s ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm font-medium text-gray-600">Détails</span>
          <span className="text-sm font-medium text-gray-600">Template</span>
          <span className="text-sm font-medium text-gray-600">Cibles</span>
        </div>
      </div>

      {/* Step 1: Campaign Details */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Informations de la Campagne</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la campagne *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Ex: Test Phishing Q1 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de lancement (optionnel)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="sandboxMode"
                checked={formData.sandboxMode}
                onChange={(e) => setFormData({ ...formData, sandboxMode: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="sandboxMode" className="ml-2 text-sm text-gray-700">
                Mode Sandbox (test sans envoi réel d'emails)
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!formData.name}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Template Selection */}
      {step === 2 && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Choisissez un Template</h3>
            <button
              onClick={() => setStep(1)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Retour
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`bg-white rounded-lg shadow cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-primary-600' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{getCategoryIcon(template.category)}</div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </span>
                  </div>

                  <h4 className="font-bold text-gray-900 mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Indicateurs :</p>
                    <div className="flex flex-wrap gap-1">
                      {template.indicators.slice(0, 3).map((indicator, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedTemplate?.id === template.id && (
                    <div className="flex items-center text-primary-600 text-sm font-medium">
                      <Sparkles className="h-4 w-4 mr-1" />
                      Sélectionné
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedTemplate && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h4 className="font-bold text-gray-900 mb-4">Aperçu de l'Email</h4>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Objet:</strong> {selectedTemplate.subject}
                </p>
                <div
                  className="text-sm prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.body }}
                />
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setStep(3)}
              disabled={!selectedTemplate}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Target Selection */}
      {step === 3 && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Sélectionnez les Cibles</h3>
            <button
              onClick={() => setStep(2)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Retour
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h4 className="font-medium text-gray-900 mb-4">Départements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <div
                  key={dept.name}
                  onClick={() => handleDepartmentToggle(dept.name)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.targetDepartments.includes(dept.name)
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{dept.name}</p>
                      <p className="text-sm text-gray-500">{dept.count} employés</p>
                    </div>
                    {formData.targetDepartments.includes(dept.name) && (
                      <Target className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {formData.targetDepartments.length === 0 && (
              <p className="text-sm text-gray-500 mt-4">
                Sélectionnez au moins un département pour cibler vos employés
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-medium text-gray-900 mb-4">Résumé</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Nom de la campagne :</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Template :</span>
                <span className="font-medium">{selectedTemplate?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Départements ciblés :</span>
                <span className="font-medium">{formData.targetDepartments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Mode :</span>
                <span className={`font-medium ${formData.sandboxMode ? 'text-orange-600' : 'text-green-600'}`}>
                  {formData.sandboxMode ? 'Sandbox' : 'Production'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => navigate('/campaigns')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || formData.targetDepartments.length === 0}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer la Campagne'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCampaign;