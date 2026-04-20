import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthCallbackPage, LoginPage, RegisterPage } from 'pages/auth';
import { DashboardPage } from 'pages/dashboard';
import { HomePage } from 'pages/home';
import { LandingPage } from 'pages/landing';
import { SurveyPage } from 'pages/survey';
import { CheckoutPage } from 'pages/checkout';
import { isAuthenticatedSession } from 'lib/auth-session';

const queryClient = new QueryClient();

function App() {
  const isAuthenticated = isAuthenticatedSession();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
                    <Route
                      path="/checkout"
                      element={isAuthenticated ? <CheckoutPage /> : <Navigate to="/login" replace />}
                    />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/home' : '/'} replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
