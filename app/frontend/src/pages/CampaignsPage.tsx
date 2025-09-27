import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Plus } from 'lucide-react';
export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/campaigns');
        setCampaigns(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold">Campaigns</h1><p className="text-gray-600 mt-2">Manage phishing simulations</p></div>
        <button className="btn btn-primary flex items-center space-x-2"><Plus className="w-5 h-5" /><span>Create</span></button>
      </div>
      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Targets</th>
              <th className="text-left py-3 px-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{c.name}</td>
                <td className="py-3 px-4">{c.status}</td>
                <td className="py-3 px-4">{c._count?.targets || 0}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {campaigns.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-500">No campaigns</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
