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

    // 1. Basic Validation
    if (password !== confirmPassword) {
      alert("❌ Passwords do not match!");
      setLoading(false);
      return;
    }

    // 2. Secret Code Validation (Your Logic)
    if (role === 'employee' && secretCode !== 'CITYWORKER') {
      setLoading(false);
      return alert("⛔ Invalid Employee Code");
    }
    if (role === 'admin' && secretCode !== 'ADMINMASTER') {
      setLoading(false);
      return alert("⛔ Invalid Admin Code");
    }

    try {
      // 3. CHECK IF USER ALREADY EXISTS (Prevents duplicates)
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

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
            full_name: fullName, // Important for dashboards
            role: role           // Saves 'citizen', 'employee', or 'admin'
          },
        },
      });

      if (error) throw error;

      // 5. Success!
      alert("✅ Registration Successful! Please check your email.");
      navigate('/login');

    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={styles.container}>
      <div style={styles.card}>
        
        {/* Header */}
        <div style={styles.header}>
          <h2 style={{ margin: 0, color: '#0056b3' }}>Create Account</h2>
          <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#666' }}>Join Civic Connect</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} style={styles.form}>
          
          <input 
            name="fullName" 
            type="text" 
            placeholder="Full Name" 
            value={formData.fullName} 
            onChange={handleChange} 
            required 
            style={styles.input} 
          />
          
          <input 
            name="email" 
            type="email" 
            placeholder="Email Address" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            style={styles.input} 
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              name="password" 
              type="password" 
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              style={{ ...styles.input, flex: 1 }} 
            />
            <input 
              name="confirmPassword" 
              type="password" 
              placeholder="Confirm" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
              style={{ ...styles.input, flex: 1 }} 
            />
          </div>

          {/* Role Selection */}
          <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px', border: '1px solid #eee' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Register As:</label>
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
              <input 
                type="password" 
                placeholder={role === 'admin' ? "Admin Master Code" : "Employee Code"} 
                value={secretCode} 
                onChange={e => setSecretCode(e.target.value)} 
                style={styles.secretInput} 
              />
            )}
          </div>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          Already have an account? <Link to="/login" style={{ color: '#0056b3', fontWeight: 'bold' }}>Login Here</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f8', padding: '20px' },
  card: { background: 'white', width: '100%', maxWidth: '400px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' },
  header: { padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #eee', textAlign: 'center' },
  form: { padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' },
  
  input: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem' },
  select: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' },
  secretInput: { width: '100%', padding: '8px', marginTop: '10px', border: '1px solid #dc3545', borderRadius: '4px', background: '#fff5f5', color: '#dc3545' },
  
  btn: { width: '100%', padding: '12px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },
  footer: { padding: '15px', textAlign: 'center', background: '#f8f9fa', borderTop: '1px solid #eee', fontSize: '0.9rem' }
};

export default Signup;