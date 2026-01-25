import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layout Components
import GovHeader from './components/GovHeader';
import GovFooter from './components/GovFooter';
import ScrollToTop from './components/ScrollToTop'; // <--- 1. IMPORT THIS

// Import Pages
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
import Profile from './pages/Profile'; 

function App() {
  return (
    <Router>
      {/* 2. PLACE IT HERE: Inside Router, but before everything else */}
      <ScrollToTop />

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* 3. HEADER */}
        <GovHeader />
        
        {/* 4. MAIN CONTENT */}
        <div style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact-us" element={<ContactUs />} />
            
            {/* Protected Routes */}
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
            
            {/* Common Profile Page */}
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>

        {/* 5. FOOTER */}
        <GovFooter />
        
      </div>
    </Router>
  );
}

export default App;