import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

export default function CreateCampaignPage() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/campaigns', {
        name,
        subject,
        body,
        fromName,
        fromEmail,
        targetUserIds: [] // À implémenter: sélection des cibles
      });

      navigate(`/campaigns/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Campaign</h1>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Campaign Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
              placeholder="Q4 Security Training"
            />
          </div>

          <div>
            <label className="label">Email Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input"
              required
              placeholder="Important: Update Your Password"
            />
          </div>

          <div>
            <label className="label">Email Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="input h-48"
              required
              placeholder="Dear Employee,

We detected unusual activity..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">From Name</label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="input"
                required
                placeholder="IT Support"
              />
            </div>

            <div>
              <label className="label">From Email</label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="input"
                required
                placeholder="support@company.com"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/campaigns')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}