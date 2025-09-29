import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Save } from 'lucide-react';

interface Settings {
  minSecondsPerWord: number;
  alertThresholds: {
    clickRate: number;
    fastRead: number;
  };
  sandboxMode: boolean;
  requireApproval: boolean;
  aiProvider: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    minSecondsPerWord: 0.25,
    alertThresholds: {
      clickRate: 0.8,
      fastRead: 0.8,
    },
    sandboxMode: true,
    requireApproval: true,
    aiProvider: 'GEMINI',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      alert('Paramètres enregistrés avec succès');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Échec de l\'enregistrement des paramètres');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-2">Configuration globale de l'application</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Détection de lecture</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondes minimum par mot
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.minSecondsPerWord}
                  onChange={(e) =>
                    setSettings({ ...settings, minSecondsPerWord: parseFloat(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Seuil pour détecter une lecture trop rapide
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Seuils d'alerte</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux de clic maximal (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.alertThresholds.clickRate * 100}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      alertThresholds: {
                        ...settings.alertThresholds,
                        clickRate: parseFloat(e.target.value) / 100,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux de lecture rapide maximal (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.alertThresholds.fastRead * 100}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      alertThresholds: {
                        ...settings.alertThresholds,
                        fastRead: parseFloat(e.target.value) / 100,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sécurité</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.sandboxMode}
                  onChange={(e) => setSettings({ ...settings, sandboxMode: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Mode sandbox par défaut (recommandé)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.requireApproval}
                  onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Exiger approbation RH/Sécurité (recommandé)
                </span>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Intelligence Artificielle</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fournisseur IA
              </label>
              <select
                value={settings.aiProvider}
                onChange={(e) => setSettings({ ...settings, aiProvider: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="GEMINI">Google Gemini</option>
                <option value="OPENAI">OpenAI</option>
                <option value="ANTHROPIC">Anthropic Claude</option>
                <option value="OLLAMA">Ollama (Local)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Configurez la clé API dans les variables d'environnement
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
