import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ConfiguracoesProvider } from '@/contexts/ConfiguracoesContext';
import { ProtectedRoute as ProtectedRouteComponent, GuestRoute } from '@/components/ProtectedRoute';

// Layout components
import Layout from '@/components/Layout';

// Pages
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Accounts from '@/pages/Accounts';
import CreditCards from '@/pages/CreditCards';
import Transactions from '@/pages/Transactions';
import Budgets from '@/pages/Budgets';
import Reports from '@/pages/Reports';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import CategoriesManagement from '@/pages/CategoriesManagement';
import CostCentersManagement from '@/pages/CostCentersManagement';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <GuestRoute>
          <Login />
        </GuestRoute>
      } />
      <Route path="/register" element={
        <GuestRoute>
          <Register />
        </GuestRoute>
      } />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRouteComponent>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRouteComponent>
      } />
      <Route path="/accounts" element={
        <ProtectedRouteComponent>
          <Layout>
            <Accounts />
          </Layout>
        </ProtectedRouteComponent>
      } />
      <Route path="/credit-cards" element={
        <ProtectedRouteComponent>
          <Layout>
            <CreditCards />
          </Layout>
        </ProtectedRouteComponent>
      } />
      <Route path="/transactions" element={
        <ProtectedRouteComponent>
          <Layout>
            <Transactions />
          </Layout>
        </ProtectedRouteComponent>
      } />
      <Route path="/budgets" element={
        <ProtectedRouteComponent>
          <Layout>
            <Budgets />
          </Layout>
        </ProtectedRouteComponent>
      } />
      <Route path="/reports" element={
        <ProtectedRouteComponent>
          <Layout>
            <Reports />
          </Layout>
        </ProtectedRouteComponent>
      } />
      <Route path="/profile" element={
        <ProtectedRouteComponent>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRouteComponent>
      } />
      <Route path="/settings" element={
        <ProtectedRouteComponent>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRouteComponent>
      } />
      <Route path="/settings/categories" element={
        <ProtectedRouteComponent>
          <Layout>
            <CategoriesManagement />
          </Layout>
        </ProtectedRouteComponent>
      } />
      <Route path="/settings/cost-centers" element={
        <ProtectedRouteComponent>
          <Layout>
            <CostCentersManagement />
          </Layout>
        </ProtectedRouteComponent>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ConfiguracoesProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </Router>
      </ConfiguracoesProvider>
    </AuthProvider>
  );
};

export default App;
