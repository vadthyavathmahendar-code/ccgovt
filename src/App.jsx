import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Import Headers
import Navbar from './components/Navbar';       // <--- NEW Smart Navbar
import GovHeader from './components/GovHeader'; // <--- OLD Header for Home/Login
import GovFooter from './components/GovFooter';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Profile from './pages/Profile'; // Only if you use it separately, else remove

// 1. Create a Layout Component
// This component checks the URL and decides which Header to show
const Layout = ({ children }) => {
  const location = useLocation();
  
  // List of pages that use the Smart Navbar
  const dashboardPaths = ['/user-dashboard', '/admin-dashboard', '/employee-dashboard'];
  
  // Check if current page is in that list
  const isDashboard = dashboardPaths.includes(location.pathname);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* 2. Conditional Logic: Show Navbar OR GovHeader */}
       <GovHeader />
      
      <div style={{ flex: 1 }}>
        {children}
      </div>

      <GovFooter />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          
          {/* Keep this if you haven't fully removed the page route yet */}
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;