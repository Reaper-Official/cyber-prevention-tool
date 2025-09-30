import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Eye,
  MousePointer,
  AlertTriangle,
  CheckCircle,
  Download,
  Play,
  Pause,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Campaign {
  id: string;
  name: string;
  status: string;
  sandboxMode: boolean;
  createdAt: string;
  publishedAt: string | null;
  targetDepartments: string[];
}

interface Stats {
  totalTargets: number;
  delivered: number;
  opened: number;
  clicked: number;
  reported: number;
  openRate: number;
  clickRate: number;
  reportRate: number;
  fastReadRate: number;
  avgReadingTime: number;
  alerts: string[];
}

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  const fetchCampaignDetails = async () => {
    try {
      const [campaignRes, statsRes] = await Promise.all([
        api.get(`/campaigns/${id}`),
        api.get(`/campaigns/${id}/stats`),
      ]);
      setCampaign(campaignRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch campaign details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await api.get(`/campaigns/${id}/report/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `campaign_${id}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Êtes-vous sûr de vouloir lancer cette campagne?')) return;
    
    try {
      await api.post(`/campaigns/${id}/publish`);
      fetchCampaignDetails();
    } catch (error) {
      console.error('Failed to publish campaign:', error);
      alert('Erreur lors du lancement de la campagne');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!campaign || !stats) {
    return <div>Campagne non trouvée</div>;
  }

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];

  const pieData = [
    { name: 'Signalés', value: stats.reported, color: '#10b981' },
    { name: 'Cliqués', value: stats.clicked - stats.reported, color: '#ef4444' },
    { name: 'Ouverts', value: stats.opened - stats.clicked, color: '#f59e0b' },
    { name: 'Non ouverts', value: stats.delivered - stats.opened, color: '#6b7280' },
  ];

  return (
    <div>
      <button
        onClick={() => navigate('/campaigns')}
        className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Retour aux campagnes
      </button>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
          <p className="text-gray-600 mt-2">
            Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportReport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Exporter PDF
          </button>
          {campaign.status === 'DRAFT' && (
            <button
              onClick={handlePublish}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Play className="h-5 w-5 mr-2" />
              Lancer
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emails Envoyés</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.delivered}</p>
            </div>
            <Mail className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux d'Ouverture</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.openRate.toFixed(1)}%</p>
            </div>
            <Eye className="h-10 w-10 text-yellow-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">{stats.opened} ouverts</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de Clic</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.clickRate.toFixed(1)}%</p>
            </div>
            <MousePointer className="h-10 w-10 text-red-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">{stats.clicked} clics</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Signalements</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.reported}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <p className="text-sm text-green-600 mt-2">{stats.reportRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Alerts */}
      {stats.alerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Alertes de Sécurité</h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {stats.alerts.map((alert, idx) => (
                  <li key={idx}>{alert}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Répartition des Réponses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Reading Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Métriques de Lecture</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Temps moyen de lecture</span>
                <span className="text-lg font-bold text-gray-900">{stats.avgReadingTime.toFixed(0)}s</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min((stats.avgReadingTime / 300) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Lecture rapide (suspect)</span>
                <span className="text-lg font-bold text-gray-900">{stats.fastReadRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stats.fastReadRate > 50 ? 'bg-red-600' : 'bg-yellow-600'
                  }`}
                  style={{ width: `${stats.fastReadRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Recommandations</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {stats.clickRate > 30 && (
                <li>• Formation renforcée recommandée</li>
              )}
              {stats.fastReadRate > 50 && (
                <li>• Sessions de sensibilisation obligatoires</li>
              )}
              {stats.reportRate < 10 && (
                <li>• Améliorer les procédures de signalement</li>
              )}
              {stats.clickRate < 10 && (
                <li>• Excellent niveau de vigilance!</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;