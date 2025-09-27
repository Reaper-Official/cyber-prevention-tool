import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { Plus, Eye } from 'lucide-react';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/campaigns');
        setCampaigns(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-gray-600 mt-2">Manage phishing simulation campaigns</p>
        </div>
        <button 
          onClick={() => navigate('/campaigns/create')}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Campaign</span>
        </button>
      </div>
      
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Targets</th>
                <th className="text-left py-3 px-4 font-semibold">Created</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{campaign.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      campaign.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{campaign._count?.targets || 0}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No campaigns yet. Create your first campaign to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}