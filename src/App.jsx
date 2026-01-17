import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GovHeader from './components/GovHeader';
import GovFooter from './components/GovFooter';

// Import all the pages we created
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import About from './pages/About';
import Services from './pages/Services';
import ContactUs from './pages/ContactUs';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Header stays at the top */}
        <GovHeader />

        {/* Main Content Area */}
        <div style={{ flex: 1 }}>
          <Routes>
            {/* 1. Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<ContactUs />} />

            
            {/* 2. Protected Dashboards */}
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          </Routes>
        </div>

        {/* Footer stays at the bottom */}
        <GovFooter />
        
      </div>
    </Router>
  );
}

export default App;