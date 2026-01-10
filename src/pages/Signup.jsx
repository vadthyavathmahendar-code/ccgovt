import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [secretCode, setSecretCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (role === 'employee' && secretCode !== 'CITYWORKER') return alert("Invalid Employee Code");
    if (role === 'admin' && secretCode !== 'ADMINMASTER') return alert("Invalid Admin Code");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: role } },
    });

    if (error) alert(error.message);
    else alert('✅ Registration Successful! Please check your email.');
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
      <div className="gov-card" style={{ width: '100%', maxWidth: '450px', padding: '0', borderTop: '4px solid #0056b3' }}>
        <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef', textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#0056b3' }}>SignUp</h2>
          <p style={{ margin: 5, fontSize: '0.9rem', color: '#666' }}>Create account for Civic Connect</p>
        </div>

        <form onSubmit={handleSignup} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          <input type="password" placeholder="Create Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          
          <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>Register As:</label>
          <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
            <option value="citizen">Citizen</option>
            <option value="employee">Govt Employee</option>
            <option value="admin">Admin</option>
          </select>

          {role !== 'citizen' && (
            <input type="password" placeholder="Enter Official Code" value={secretCode} onChange={e => setSecretCode(e.target.value)} style={{ borderColor: 'red', padding: '10px', borderRadius: '4px', border: '1px solid red' }} />
          )}

          <button type="submit" className="btn-gov" disabled={loading}>{loading ? 'Processing...' : 'Create Account'}</button>
        </form>

        <div style={{ padding: '15px', background: '#f8f9fa', borderTop: '1px solid #e9ecef', textAlign: 'center', fontSize: '0.9rem' }}>
          Already Registered? <Link to="/login" style={{ color: '#0056b3', fontWeight: 'bold' }}>Login Here</Link>
        </div>
      </div>
    </div>
  );
};
export default Signup;