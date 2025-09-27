import { useState, useEffect } from 'react'
import axios from 'axios'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login')
  const [campaigns, setCampaigns] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    const [c, u, s] = await Promise.all([
      axios.get('/api/campaigns'),
      axios.get('/api/users'),
      axios.get('/api/stats')
    ])
    setCampaigns(c.data)
    setUsers(u.data)
    setStats(s.data)
  }

  const login = async () => {
    const res = await axios.post('/api/auth/login', { 
      email: 'admin@test.com', 
      password: 'admin123' 
    })
    setUser(res.data.user)
    setPage('dashboard')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 w-96">
          <h1 className="text-3xl font-bold text-center mb-6">PhishGuard</h1>
          <button onClick={login} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
            Connexion (admin@test.com)
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-8">PhishGuard</h2>
        <nav className="space-y-2">
          {['dashboard', 'campaigns', 'users'].map(p => (
            <button key={p} onClick={() => setPage(p)} 
              className={'w-full text-left px-4 py-3 rounded-lg ' + (page === p ? 'bg-blue-600' : 'hover:bg-gray-800')}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">{page}</h1>

        {page === 'dashboard' && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">Campagnes</p>
              <p className="text-3xl font-bold">{stats.total_campaigns || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">Utilisateurs</p>
              <p className="text-3xl font-bold">{stats.total_users || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">Emails ouverts</p>
              <p className="text-3xl font-bold">{stats.total_opened || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600">Clics</p>
              <p className="text-3xl font-bold">{stats.total_clicked || 0}</p>
            </div>
          </div>
        )}

        {page === 'campaigns' && (
          <div>
            <table className="w-full bg-white rounded-lg shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Nom</th>
                  <th className="p-4 text-left">Statut</th>
                  <th className="p-4 text-left">Envoyés</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} className="border-t">
                    <td className="p-4">{c.name}</td>
                    <td className="p-4">{c.status}</td>
                    <td className="p-4">{c.emails_sent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {page === 'users' && (
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Nom</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Département</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-4">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">{u.department || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  )
}
