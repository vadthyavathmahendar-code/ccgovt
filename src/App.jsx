import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Theme & Auth Contexts
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import Unauthorized from './components/Unauthorized';

// Layout Components
import GovHeader from './components/GovHeader';
import GovFooter from './components/GovFooter';
import ScrollToTop from './components/ScrollToTop';

// Page Views
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import Services from './pages/Services';

// Protected Dashboards
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <GovHeader />
            <div style={{ flex: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Public-Only Auth Routes */}
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <Login />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicOnlyRoute>
                      <Signup />
                    </PublicOnlyRoute>
                  }
                />

                {/* Protected Citizen Dashboard */}
                <Route
                  path="/user-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['citizen', 'super_admin']}>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Field Worker Dashboard */}
                <Route
                  path="/employee-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['employee', 'super_admin']}>
                      <EmployeeDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin & Dept Head Dashboard */}
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['dept_admin', 'super_admin', 'commissioner']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />



                {/* Catch-all Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <GovFooter />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;