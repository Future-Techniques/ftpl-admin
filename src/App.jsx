import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductsPage } from './pages/ProductsPage';
import { BlogsPage } from './pages/BlogsPage';
import { ServicesPage } from './pages/ServicesPage';
import { IndustriesPage } from './pages/IndustriesPage';
import { SisterConcernsPage } from './pages/SisterConcernsPage';
import { AssociatesPage } from './pages/AssociatesPage';
import { BannersPage } from './pages/BannersPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { StaticPagesPage } from './pages/StaticPagesPage';
import { FaqsPage } from './pages/FaqsPage';
import { InquiriesPage } from './pages/InquiriesPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { SubscribersPage } from './pages/SubscribersPage';
import { DataCleanupPage } from './pages/DataCleanupPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="blogs" element={<BlogsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="industries" element={<IndustriesPage />} />
            <Route path="sister-concerns" element={<SisterConcernsPage />} />
            <Route path="associates" element={<AssociatesPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="features" element={<FeaturesPage />} />
            <Route path="pages" element={<StaticPagesPage />} />
            <Route path="faqs" element={<FaqsPage />} />
            <Route path="inquiries" element={<InquiriesPage />} />
            <Route path="candidates" element={<CandidatesPage />} />
            <Route path="subscribers" element={<SubscribersPage />} />
            <Route path="cleanup" element={<DataCleanupPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
