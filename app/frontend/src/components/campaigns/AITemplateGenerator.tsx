import React, { useState } from 'react';
import { Sparkles, Loader, AlertCircle, Eye } from 'lucide-react';
import { api } from '../../services/api';

interface AITemplateGeneratorProps {
  targetProfiles: string[];
  campaignName: string;
  onGenerate: (template: any) => void;
}

const AITemplateGenerator: React.FC<AITemplateGeneratorProps> = ({
  targetProfiles,
  campaignName,
  onGenerate
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedTemplate, setGeneratedTemplate] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const predefinedPrompts = [
    {
      title: 'Mise à jour RH',
      prompt: 'Créer un email concernant une mise à jour importante des politiques RH nécessitant une confirmation'
    },
    {
      title: 'Alerte sécurité',
      prompt: 'Générer une alerte de sécurité urgente demandant une vérification du compte'
    },
    {
      title: 'Formation obligatoire',
      prompt: 'Email sur une nouvelle formation obligatoire avec date limite d\'inscription'
    },
    {
      title: 'Bonus annuel',
      prompt: 'Communication sur les bonus annuels nécessitant une validation des informations bancaires'
    }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Veuillez entrer une description pour le template');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/campaigns/templates/generate', {
        prompt,
        targetDepartment: targetProfiles[0], // Simplified for demo
        campaignName
      });

      setGeneratedTemplate(response.data);
      onGenerate(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleUsePredefined = (predefinedPrompt: string) => {
    setPrompt(predefinedPrompt);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">
          Génération de template par Intelligence Artificielle
        </h3>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <p className="text-sm text-blue-800">
                L'IA va créer un template personnalisé basé sur vos instructions.
                Le contenu sera adapté au profil des employés ciblés.
              </p>
            </div>
          </div>
        </div>

        {/* Prompts prédéfinis */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Suggestions de scénarios:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {predefinedPrompts.map((item, index) => (
              <button
                key={index}
                className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                onClick={() => handleUsePredefined(item.prompt)}
              >
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-gray-600 mt-1">{item.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Zone de prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Décrivez le template souhaité
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Créer un email professionnel concernant une mise à jour du système informatique nécessitant une reconnexion. L'email doit paraître urgent mais pas alarmant, avec un ton corporate standard."
            disabled={loading}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Générer le template
              </>
            )}
          </button>

          {generatedTemplate && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
            >
              <Eye className="w-5 h-5 mr-2" />
              Aperçu
            </button>
          )}
        </div>
      </div>

      {/* Aperçu du template généré */}
      {showPreview && generatedTemplate && (
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Aperçu du template généré</h4>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Sujet:</p>
              <p className="p-3 bg-gray-50 rounded">{generatedTemplate.subject}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Corps de l'email:</p>
              <div 
                className="p-4 bg-gray-50 rounded border"
                dangerouslySetInnerHTML={{ __html: generatedTemplate.body }}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Métadonnées:</p>
              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">
                  Difficulté: {generatedTemplate.difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                  Catégorie: {generatedTemplate.category}
                </span>
                {generatedTemplate.personalized && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
                    Personnalisé
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITemplateGenerator;