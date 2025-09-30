import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import Training from './pages/Training';
import Users from './pages/Users';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/campaigns/create" element={<CreateCampaign />} />
                  <Route path="/campaigns/:id" element={<CampaignDetails />} />
                  <Route path="/training" element={<Training />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/profile/:userId" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;