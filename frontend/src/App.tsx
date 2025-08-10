import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ConfiguracoesProvider } from './contexts/ConfiguracoesContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { ProtectedRoute as ProtectedRouteComponent, GuestRoute } from './components/ProtectedRoute';
import { WorkspaceGuard } from './components/WorkspaceGuard';

// Layout components
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Accounts from './pages/Accounts';
import CreditCards from './pages/CreditCards';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import UserProfile from './pages/UserProfile';
import AppSettings from './pages/AppSettings';
import CategoriesManagement from './pages/CategoriesManagement';
import BeneficiariesPage from './pages/BeneficiariesPage';
import AutomationRulesPage from './pages/AutomationRulesPage';
import WorkspaceSettingsPage from './pages/WorkspaceSettingsPage';
import WorkspacesPage from './pages/WorkspacesPage';

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
          <WorkspaceGuard>
            <Layout>
              <Dashboard />
            </Layout>
          </WorkspaceGuard>
        </ProtectedRouteComponent>
      } />
      <Route path="/accounts" element={
        <ProtectedRouteComponent>
          <WorkspaceGuard>
            <Layout>
              <Accounts />
            </Layout>
          </WorkspaceGuard>
        </ProtectedRouteComponent>
      } />
      <Route path="/credit-cards" element={
        <ProtectedRouteComponent>
          <WorkspaceGuard>
            <Layout>
              <CreditCards />
            </Layout>
          </WorkspaceGuard>
        </ProtectedRouteComponent>
      } />
      <Route path="/transactions" element={
        <ProtectedRouteComponent>
          <WorkspaceGuard>
            <Layout>
              <Transactions />
            </Layout>
          </WorkspaceGuard>
        </ProtectedRouteComponent>
      } />
      <Route path="/budgets" element={
        <ProtectedRouteComponent>
          <WorkspaceGuard>
            <Layout>
              <Budgets />
            </Layout>
          </WorkspaceGuard>
        </ProtectedRouteComponent>
      } />
      <Route path="/reports" element={
        <ProtectedRouteComponent>
          <WorkspaceGuard>
            <Layout>
              <Reports />
            </Layout>
          </WorkspaceGuard>
        </ProtectedRouteComponent>
      } />
      <Route path="/workspaces" element={
        <ProtectedRouteComponent>
          <Layout>
            <WorkspacesPage />
          </Layout>
        </ProtectedRouteComponent>
      } />
      <Route path="/profile" element={
        <ProtectedRouteComponent>
          <Layout>
            <UserProfile />
          </Layout>
        </ProtectedRouteComponent>
      } />
      <Route path="/settings" element={
        <ProtectedRouteComponent>
          <WorkspaceGuard>
            <Layout>
              <AppSettings />
            </Layout>
          </WorkspaceGuard>
        </ProtectedRouteComponent>
      } />
      <Route path="/settings/categories" element={
        <ProtectedRouteComponent>
          <WorkspaceGuard>
            <Layout>
              <CategoriesManagement />
            </Layout>
          </WorkspaceGuard>
        </ProtectedRouteComponent>
      } />
      <Route path="/settings/beneficiaries" element={
        <ProtectedRouteComponent>
          <WorkspaceGuard>
            <Layout>
              <BeneficiariesPage />
            </Layout>
          </WorkspaceGuard>
        </ProtectedRouteComponent>
      } />
      <Route path="/settings/automation-rules" element={
        <ProtectedRouteComponent>
          <WorkspaceGuard>
            <Layout>
              <AutomationRulesPage />
            </Layout>
          </WorkspaceGuard>
        </ProtectedRouteComponent>
      } />
      <Route path="/settings/workspace" element={
        <ProtectedRouteComponent>
          <WorkspaceGuard>
            <Layout>
              <WorkspaceSettingsPage />
            </Layout>
          </WorkspaceGuard>
        </ProtectedRouteComponent>
      } />

      {/* Default redirect to login for unauthenticated users or dashboard for authenticated */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <WorkspaceProvider>
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
      </WorkspaceProvider>
    </AuthProvider>
  );
};

export default App;
