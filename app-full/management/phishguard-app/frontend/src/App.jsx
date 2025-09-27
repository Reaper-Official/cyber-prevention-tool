import { useState, useEffect } from 'react'
import axios from 'axios'

export default function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('login')
  const [data, setData] = useState({ campaigns: [], users: [], stats: {} })

  useEffect(() => {
    if (user) loadData()
  }, [user])

  const loadData = async () => {
    const [c, u, s] = await Promise.all([
      axios.get('/api/campaigns'),
      axios.get('/api/users'),
      axios.get('/api/stats')
    ])
    setData({ campaigns: c.data, users: u.data, stats: s.data })
  }

  const login = async () => {
    try {
      const res = await axios.post('/api/auth/login', { email: 'admin@test.com', password: 'admin' })
      setUser(res.data.user)
      setPage('dashboard')
    } catch (e) {
      alert('Erreur login')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 w-96">
          <h1 className="text-3xl font-bold text-center mb-6">PhishGuard</h1>
          <button onClick={login} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
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
              className={'w-full text-left px-4 py-3 rounded ' + (page === p ? 'bg-blue-600' : 'hover:bg-gray-800')}>
              {p.toUpperCase()}
            </button>
          ))}
        </nav>
      </aside>
      
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">{page.toUpperCase()}</h1>
        
        {page === 'dashboard' && (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Campagnes', value: data.stats.campaigns || 0 },
              { label: 'Utilisateurs', value: data.stats.users || 0 },
              { label: 'Ouverts', value: data.stats.opened || 0 },
              { label: 'Cliqués', value: data.stats.clicked || 0 }
            ].map(s => (
              <div key={s.label} className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 text-sm">{s.label}</p>
                <p className="text-3xl font-bold mt-2">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {page === 'campaigns' && (
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                {['Nom', 'Statut', 'Envoyés'].map(h => (
                  <th key={h} className="p-4 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.campaigns.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="p-4">{c.name || 'Sans nom'}</td>
                  <td className="p-4">{c.status}</td>
                  <td className="p-4">{c.emails_sent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {page === 'users' && (
          <table className="w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                {['Nom', 'Email', 'Département'].map(h => (
                  <th key={h} className="p-4 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.users.map(u => (
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
