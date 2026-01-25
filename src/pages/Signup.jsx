import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  // --- STATE ---
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [role, setRole] = useState('citizen');
  const [secretCode, setSecretCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- SIGNUP LOGIC ---
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { fullName, email, password, confirmPassword } = formData;

    console.log("🚀 Starting Signup for:", email); // DEBUG LOG

    // 1. Basic Validation
    if (password !== confirmPassword) {
      alert("❌ Passwords do not match!");
      setLoading(false);
      return;
    }

    // 2. Secret Code Validation
    if (role === 'employee' && secretCode !== 'CITYWORKER') {
      setLoading(false);
      return alert("⛔ Invalid Employee Code");
    }
    if (role === 'admin' && secretCode !== 'ADMINMASTER') {
      setLoading(false);
      return alert("⛔ Invalid Admin Code");
    }

    try {
      // 3. CHECK IF USER ALREADY EXISTS (FIXED)
      // We use .maybeSingle() instead of .single() to prevent 406 Errors
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle(); 

      if (checkError) {
        console.error("⚠️ Error checking existing user:", checkError);
        // We continue anyway, because sometimes RLS policies hide the user
      }

      if (existingUser) {
        alert("⚠️ User already exists! Please go to Login.");
        navigate('/login');
        return;
      }

      // 4. Create User in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            role: role // Important: This triggers the SQL function to create the profile
          },
        },
      });

      console.log("📡 Supabase Response:", { data, error }); // DEBUG LOG

      if (error) throw error;

      // 5. Success!
      alert("✅ Registration Successful! Please check your email.");
      navigate('/login');

    } catch (error) {
      console.error("💥 Signup Error:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={styles.pageContainer}>
      
      <div className="gov-card" style={styles.signupCard}>
        
        {/* Header Section */}
        <div style={styles.cardHeader}>
          <div style={styles.logoCircle}>📋</div>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Join Civic Connect </p>
        </div>

        {/* Form Section */}
        <div style={{ padding: '30px' }}>
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Full Name */}
            <div>
              <label style={styles.label}>Full Name</label>
              <input 
                name="fullName" 
                type="text" 
                placeholder="e.g. John Doe" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
                style={styles.input} 
              />
            </div>
            
            {/* Email */}
            <div>
              <label style={styles.label}>Email Address</label>
              <input 
                name="email" 
                type="email" 
                placeholder="example@gmail.com" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                style={styles.input} 
              />
            </div>

            {/* Passwords Row */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Password</label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Min. 6 chars" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  style={styles.input} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Confirm</label>
                <input 
                  name="confirmPassword" 
                  type="password" 
                  placeholder="Re-enter" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                  style={styles.input} 
                />
              </div>
            </div>

            {/* Role Selection Box */}
            <div style={styles.roleBox}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#334155' }}>Register As:</label>
              <select 
                value={role} 
                onChange={e => setRole(e.target.value)} 
                style={styles.select}
              >
                <option value="citizen">Citizen</option>
                <option value="employee">Govt Employee</option>
                <option value="admin">Admin</option>
              </select>

              {/* Secret Code Input (Hidden for Citizens) */}
              {role !== 'citizen' && (
                <div style={{ marginTop: '10px', animation: 'fadeIn 0.3s ease' }}>
                  <input 
                    type="password" 
                    placeholder={role === 'admin' ? "Enter Admin Master Code" : "Enter Employee Code"} 
                    value={secretCode} 
                    onChange={e => setSecretCode(e.target.value)} 
                    style={styles.secretInput} 
                  />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Footer Section */}
          <div style={styles.divider}>
            <span style={{ background: 'white', padding: '0 10px', color: '#94a3b8', fontSize: '0.85rem' }}>OR</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Already have an account? <Link to="/login" style={styles.link}>Login Here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
  pageContainer: {
    minHeight: '90vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f8fafc',
    padding: '40px 20px'
  },
  signupCard: {
    width: '100%',
    maxWidth: '480px',
    padding: '0',
    borderTop: '5px solid #2563eb',
    overflow: 'hidden'
  },
  cardHeader: {
    background: '#f1f5f9',
    padding: '30px 30px 20px',
    textAlign: 'center',
    borderBottom: '1px solid #e2e8f0'
  },
  logoCircle: {
    fontSize: '2rem',
    marginBottom: '10px',
    display: 'inline-block',
    background: 'white',
    width: '60px',
    height: '60px',
    lineHeight: '60px',
    borderRadius: '50%',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
  },
  title: {
    margin: '10px 0 5px',
    color: '#0f172a',
    fontSize: '1.5rem',
    fontWeight: '700'
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.95rem'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    color: '#334155',
    fontSize: '0.9rem'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.95rem',
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#f8fafc'
  },
  roleBox: {
    background: '#f1f5f9',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    background: 'white',
    fontSize: '0.95rem',
    cursor: 'pointer'
  },
  secretInput: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ef4444',
    borderRadius: '6px',
    background: '#fef2f2',
    color: '#b91c1c',
    fontSize: '0.9rem'
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '10px',
    padding: '12px'
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    borderTop: '1px solid #e2e8f0',
    marginTop: '25px',
    marginBottom: '25px',
    height: '0px'
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
    textDecoration: 'none'
  }
};

export default Signup;