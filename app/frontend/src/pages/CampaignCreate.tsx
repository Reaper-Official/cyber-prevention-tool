import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Sparkles, AlertCircle } from 'lucide-react';

const CampaignCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    sandboxMode: true,
    targetEmails: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateAI = async () => {
    setAiLoading(true);
    try {
      const response = await api.post('/ai/generate', {
        templateType: 'phishing_email',
        context: { scenario: 'password_reset' },
      });
      setFormData({
        ...formData,
        subject: response.data.subject,
        body: response.data.body,
      });
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const targets = formData.targetEmails
        .split('\n')
        .map((email) => email.trim())
        .filter((email) => email);

      const response = await api.post('/campaigns', {
        ...formData,
        targets,
      });

      navigate(`/campaigns/${response.data.id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Échec de la création de la campagne');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nouvelle campagne</h1>
        <p className="text-gray-600 mt-2">
          Créer une campagne de sensibilisation au phishing
        </p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-sm text-red-700">
            <strong>Usage interne uniquement:</strong> Cette campagne doit être approuvée par
            RH/Sécurité avant activation. Toute utilisation malveillante est strictement interdite.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nom de la campagne *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ex: Sensibilisation Q1 2025"
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Objet de l'email *
            </label>
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={aiLoading}
              className="flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 transition-colors"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              {aiLoading ? 'Génération...' : 'Générer avec IA'}
            </button>
          </div>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ex: Action requise - Réinitialisation de votre mot de passe"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
            Corps de l'email *
          </label>
          <textarea
            id="body"
            name="body"
            value={formData.body}
            onChange={handleChange}
            required
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Contenu de l'email de simulation..."
          />
        </div>

        <div className="mb-6">
          <label htmlFor="targetEmails" className="block text-sm font-medium text-gray-700 mb-2">
            Emails cibles (un par ligne) *
          </label>
          <textarea
            id="targetEmails"
            name="targetEmails"
            value={formData.targetEmails}
            onChange={handleChange}
            required
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="user1@example.com&#10;user2@example.com"
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="sandboxMode"
              checked={formData.sandboxMode}
              onChange={(e) => setFormData({ ...formData, sandboxMode: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Mode sandbox (ne pas envoyer d'emails réels)
            </span>
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Création...' : 'Créer la campagne'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignCreate;