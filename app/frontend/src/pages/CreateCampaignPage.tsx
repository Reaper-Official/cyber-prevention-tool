import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

export default function CreateCampaignPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/campaigns', { name, subject: 'Test', body: 'Test', fromName: 'Test', fromEmail: 'test@test.com', targetUserIds: [] });
      navigate('/campaigns');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create Campaign</h1>
      <form onSubmit={handleSubmit} className="card">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Campaign name" required />
        <button type="submit" disabled={loading} className="btn btn-primary mt-4">{loading ? 'Creating...' : 'Create'}</button>
      </form>
    </div>
  );
}