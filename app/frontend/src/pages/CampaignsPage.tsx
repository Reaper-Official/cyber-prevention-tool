import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

export default function CreateCampaignPage() {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    fromName: '',
    fromEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/campaigns', {
        ...formData,
        targetUserIds: []
      });
      navigate(`/campaigns/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Campaign</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Campaign Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">Email Subject</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">Email Body</label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({...formData, body: e.target.value})}
            className="input h-32"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">From Name</label>
            <input
              type="text"
              value={formData.fromName}
              onChange={(e) => setFormData({...formData, fromName: e.target.value})}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">From Email</label>
            <input
              type="email"
              value={formData.fromEmail}
              onChange={(e) => setFormData({...formData, fromEmail: e.target.value})}
              className="input"
              required
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
          <button type="button" onClick={() => navigate('/campaigns')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}