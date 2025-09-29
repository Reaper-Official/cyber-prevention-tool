import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/services/api';
import { Download, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface CampaignDetails {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: string;
  sandboxMode: boolean;
  createdAt: string;
  report: {
    totalTargets: number;
    delivered: number;
    opened: number;
    clicked: number;
    reported: number;
    clickRate: number;
    openRate: number;
    fastReadRate: number;
    avgReadingTime: number;
    alerts: string[];
  };
  targets: Array<{
    id: string;
    email: string;
    status: string;
    openedAt?: string;
    clickedAt?: string;
    readingMetrics?: any;
  }>;
}

const CampaignDetails: React.FC = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      setCampaign(response.data);
    } catch (error) {
      console.error('Failed to fetch campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const response = await api.get(`/reports/campaign/${id}/export?format=${format}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `campaign_${id}_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/campaigns/${id}/validate`);
      fetchCampaign();
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handlePublish = async () => {
    if (
      !campaign?.sandboxMode &&
      !confirm(
        'Attention: Cette action enverra des emails réels. Avez-vous obtenu l\'approbation RH/Sécurité?'
      )
    ) {
      return;
    }

    try {
      await api.post(`/campaigns/${id}/publish`);
      fetchCampaign();
    } catch (error) {
      console.error('Publish failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return <div>Campagne non trouvée</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
          <p className="text-gray-600 mt-2">
            Créée le {format(new Date(campaign.createdAt), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {campaign.status === 'PENDING_APPROVAL' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-yellow-700">
              Cette campagne nécessite une approbation avant publication.
            </p>
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Approuver
            </button>
          </div>
        </div>
      )}

      {campaign.status === 'APPROVED' && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-700">
              Campagne approuvée. Prête à être publiée.
              {campaign.sandboxMode && ' (Mode sandbox activé)'}
            </p>
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Publier
            </button>
          </div>
        </div>
      )}

      {campaign.report.alerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm font-medium text-red-700 mb-2">Alertes:</p>
          <ul className="list-disc list-inside text-sm text-red-600">
            {campaign.report.alerts.map((alert, idx) => (
              <li key={idx}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Taux d'ouverture</p>
          <p className="text-2xl font-bold text-gray-900">{campaign.report.openRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-2">
            {campaign.report.opened} / {campaign.report.totalTargets}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Taux de clic</p>
          <p className="text-2xl font-bold text-gray-900">{campaign.report.clickRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-2">
            {campaign.report.clicked} / {campaign.report.totalTargets}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Lecture rapide</p>
          <p className="text-2xl font-bold text-red-600">
            {campaign.report.fastReadRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-2">Formation recommandée</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600">Temps de lecture moyen</p>
          <p className="text-2xl font-bold text-gray-900">
            {campaign.report.avgReadingTime.toFixed(0)}s
          </p>
          <p className="text-xs text-gray-500 mt-2">Par utilisateur</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Cibles</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ouvert
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cliqué
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Temps lecture
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaign.targets.map((target) => (
              <tr key={target.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {target.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {target.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {target.openedAt ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-300" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {target.clickedAt ? (
                    <CheckCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-300" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {target.readingMetrics?.timeSpent
                    ? `${target.readingMetrics.timeSpent.toFixed(0)}s`
                    : '-'}
                  {target.readingMetrics?.fastRead && (
                    <span className="ml-2 text-red-600 text-xs">(rapide)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignDetails;