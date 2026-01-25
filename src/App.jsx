import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <--- 1. IMPORT THIS

// Import Layouts
import GovHeader from './components/GovHeader';
import GovFooter from './components/GovFooter';
import ScrollToTop from './components/ScrollToTop';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import Services from './pages/Services';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

// NOTE: We do NOT import 'Profile' here anymore because it will be a popup inside the Dashboard!

function App() {
  return (
    <Router>
      <ScrollToTop />
      
      {/* 2. ADD THE TOASTER HERE */}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <GovHeader />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact-us" element={<ContactUs />} />
            
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
            
            {/* REMOVED: <Route path="/profile" ... /> (No longer needed as a separate page) */}
          </Routes>
        </div>
        <GovFooter />
      </div>
    </Router>
  );
}

export default App;