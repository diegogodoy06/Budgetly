import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-bold text-primary-600">Budgetly</h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Controle Financeiro Pessoal
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
