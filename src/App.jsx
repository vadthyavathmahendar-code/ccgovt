import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Layout Components
import GovHeader from './components/GovHeader';
import GovFooter from './components/GovFooter';
import ScrollToTop from './components/ScrollToTop'; // <--- NEW IMPORT

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
import Profile from './pages/Profile'; 

function App() {
  return (
    <Router>
      {/* This component runs invisibly to reset scroll position on every click */}
      <ScrollToTop />
      
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* 1. HEADER: Always the Official Government Header */}
        <GovHeader />
        
        {/* 2. MAIN CONTENT */}
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
            
            {/* Profile Page */}
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>

        {/* 3. FOOTER */}
        <GovFooter />
        
      </div>
    </Router>
  );
}

export default App;