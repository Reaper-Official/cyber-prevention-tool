import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield } from 'lucide-react';
export default function LoginPage() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const { login } = useAuth();
const navigate = useNavigate();
const handleSubmit = async (e: FormEvent) => {
e.preventDefault();
setError('');
try {
await login(email, password);
navigate('/dashboard');
} catch (err: any) {
setError(err.response?.data?.error || 'Login failed');
}
};
return (
<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
<div className="max-w-md w-full">
<div className="text-center mb-8">
<div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
<Shield className="w-8 h-8 text-white" />
</div>
<h1 className="text-3xl font-bold">PhishGuard</h1>
</div> <div className="card"> <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"> <p className="text-sm text-yellow-800 text-center">⚠️ Internal Use Only</p> </div> <form onSubmit={handleSubmit} className="space-y-4"> <div> <label className="label">Email</label> <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required /> </div> <div> <label className="label">Password</label> <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required /> </div> {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm text-red-800">{error}</p></div>} <button type="submit" className="w-full btn btn-primary">Login</button> </form> <div className="mt-6 text-center text-sm text-gray-500"><p>Default: admin@local.test</p></div> </div> </div> </div> ); } 
