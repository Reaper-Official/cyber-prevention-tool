import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { ArrowLeft, Send, Eye, MousePointer, Users, TrendingUp } from 'lucide-react';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const loadCampaign = async () => {
    try {
      const res = await api.get(`/campaigns/${id}`);
      setCampaign(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async () => {
    if (!confirm('Are you sure you want to launch this campaign?')) return;
    
    setLaunching(true);
    try {
      await api.post(`/campaigns/${id}/launch`);
      await loadCampaign();
      alert('Campaign launched successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to launch campaign');
    } finally {
      setLaunching(false);
    }
  };

  const handleViewReport = () => {
    navigate(`/campaigns/${id}/report`);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  const stats = campaign.stats || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/campaigns')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-gray-600 mt-1">
              Status: <span className={`font-semibold ${campaign.status === 'published' ? 'text-green-600' : 'text-gray-600'}`}>
                {campaign.status}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {campaign.status === 'draft' && (
            <button onClick={handleLaunch} disabled={launching} className="btn btn-primary flex items-center gap-2">
              <Send className="w-4 h-4" />
              {launching ? 'Launching...' : 'Launch Campaign'}
            </button>
          )}
          {campaign.status === 'published' && (
            <button onClick={handleViewReport} className="btn btn-primary">
              View Full Report
            </button>
          )}
        </div>
      </div>

      {campaign.status === 'published' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Targets</p>
                <p className="text-2xl font-bold mt-1">{stats.total || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Emails Opened</p>
                <p className="text-2xl font-bold mt-1">{stats.opened || 0}</p>
                <p className="text-xs text-gray-500">{stats.openRate}% rate</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Links Clicked</p>
                <p className="text-2xl font-bold mt-1">{stats.clicked || 0}</p>
                <p className="text-xs text-gray-500">{stats.clickRate}% rate</p>
              </div>
              <MousePointer className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risk Level</p>
                <p className={`text-2xl font-bold mt-1 ${parseFloat(stats.clickRate) > 20 ? 'text-red-600' : 'text-green-600'}`}>
                  {parseFloat(stats.clickRate) > 20 ? 'High' : 'Low'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Campaign Details</h2>
        <div className="space-y-3">
          <div>
            <span className="font-semibold">Subject:</span> {campaign.subject}
          </div>
          <div>
            <span className="font-semibold">From:</span> {campaign.fromName} &lt;{campaign.fromEmail}&gt;
          </div>
          <div>
            <span className="font-semibold">Body:</span>
            <pre className="mt-2 bg-gray-50 p-3 rounded whitespace-pre-wrap">{campaign.body}</pre>
          </div>
        </div>
      </div>

      {campaign.targets && campaign.targets.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Targets ({campaign.targets.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Employee</th>
                  <th className="text-left py-2 px-3">Email</th>
                  <th className="text-left py-2 px-3">Status</th>
                  <th className="text-left py-2 px-3">Opened At</th>
                  <th className="text-left py-2 px-3">Clicked At</th>
                </tr>
              </thead>
              <tbody>
                {campaign.targets.map((target: any) => (
                  <tr key={target.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{target.user.firstName} {target.user.lastName}</td>
                    <td className="py-2 px-3">{target.user.email}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        target.status === 'clicked' ? 'bg-red-100 text-red-800' :
                        target.status === 'opened' ? 'bg-yellow-100 text-yellow-800' :
                        target.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {target.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600">
                      {target.openedAt ? new Date(target.openedAt).toLocaleString() : '-'}
                    </td>
                    <td className="py-2 px-3 text-sm text-gray-600">
                      {target.clickedAt ? new Date(target.clickedAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}