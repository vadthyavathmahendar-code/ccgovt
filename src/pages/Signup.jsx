import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    idNumber: ''
  });
  
  const [idType, setIdType] = useState('aadhaar'); // Default ID type
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- VALIDATION HELPERS ---
  const validateGovtId = (type, number) => {
    if (type === 'aadhaar') {
      // Aadhaar: Exactly 12 digits
      return /^\d{12}$/.test(number);
    } else {
      // PAN: 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F)
      return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(number.toUpperCase());
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { fullName, email, password, confirmPassword, phone, idNumber } = formData;

    // 1. Basic Validation
    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match!");
      setLoading(false);
      return;
    }

    if (!phone || phone.length !== 10) {
      toast.error("❌ Please enter a valid 10-digit phone number.");
      setLoading(false);
      return;
    }

    // 2. Government ID Validation
    if (!validateGovtId(idType, idNumber)) {
      toast.error(
        idType === 'aadhaar' 
          ? "❌ Invalid Aadhaar Format (Must be 12 digits)" 
          : "❌ Invalid PAN Format (e.g., ABCDE1234F)"
      );
      setLoading(false);
      return;
    }

    try {
      // 3. Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        toast.error("⚠️ User already exists! Please Login.");
        navigate('/');
        return;
      }

      // 4. Create User in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 5. Create Profile Entry with Verified ID
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id,
          full_name: fullName,
          role: 'citizen', // STRICTLY citizen for public signups
          phone: phone,
          govt_id_type: idType,
          govt_id_number: idNumber.toUpperCase()
        }]);

        if (profileError) throw profileError;

        toast.success("✅ Account Created Successfully!");
        setTimeout(() => navigate('/'), 2000);
      }

    } catch (error) {
      console.error("Signup Error:", error);
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={styles.pageContainer}>
      <Toaster />
      
      <div className="gov-card" style={styles.signupCard}>
        
        {/* Header Section */}
        <div style={styles.cardHeader}>
          <div style={styles.logoWrapper}>
             <img src="/images/cc_logo.png" alt="Logo" style={{height:'100%', width:'auto'}} />
          </div>
          <h2 style={styles.title}>Citizen Registration</h2>
          <p style={styles.subtitle}>Verify your identity to join Civic Connect</p>
        </div>

        {/* Form Section */}
        <div style={{ padding: '30px' }}>
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Name & Phone */}
            <div style={{ display: 'flex', gap: '15px', flexDirection: 'row' }}>
               <div style={{flex: 1}}>
                 <label style={styles.label}>Full Name</label>
                 <input name="fullName" type="text" placeholder="e.g. John Doe" value={formData.fullName} onChange={handleChange} required style={styles.input} />
               </div>
               <div style={{flex: 1}}>
                 <label style={styles.label}>Phone</label>
                 <input name="phone" type="tel" placeholder="9876543210" value={formData.phone} onChange={handleChange} required style={styles.input} />
               </div>
            </div>

            {/* ID VERIFICATION SECTION */}
            <div style={styles.idBox}>
              
                
                {/* ID Type Toggles */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button type="button" onClick={() => setIdType('aadhaar')} style={idType === 'aadhaar' ? styles.activeTab : styles.inactiveTab}>Aadhaar Card</button>
                    <button type="button" onClick={() => setIdType('pan')} style={idType === 'pan' ? styles.activeTab : styles.inactiveTab}>PAN Card</button>
                </div>

                {/* ID Input */}
                <input 
                    name="idNumber" 
                    type="text" 
                    placeholder={idType === 'aadhaar' ? "Enter 12-digit Number" : "Enter PAN (e.g. ABCDE1234F)"} 
                    value={formData.idNumber} 
                    onChange={handleChange} 
                    required 
                    maxLength={idType === 'aadhaar' ? 12 : 10}
                    style={{...styles.input, borderColor: formData.idNumber && !validateGovtId(idType, formData.idNumber) ? '#ef4444' : '#cbd5e1'}} 
                />
            </div>
            
            {/* Email */}
            <div>
              <label style={styles.label}>Email Address</label>
              <input name="email" type="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required style={styles.input} />
            </div>

            {/* Passwords */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Password</label>
                <input name="password" type="password" placeholder="Min. 6 chars" value={formData.password} onChange={handleChange} required style={styles.input} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Confirm</label>
                <input name="confirmPassword" type="password" placeholder="Re-enter" value={formData.confirmPassword} onChange={handleChange} required style={styles.input} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Verifying & Creating...' : 'Create Account'}
            </button>
          </form>

          {/* Footer Section */}
          <div style={styles.divider}>
            <span style={{ background: 'white', padding: '0 10px', color: '#94a3b8', fontSize: '0.85rem' }}>OR</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Already verified? <Link to="/" style={styles.link}>Login Here</Link>
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
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f8fafc',
    padding: '20px'
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
    padding: '25px',
    textAlign: 'center',
    borderBottom: '1px solid #e2e8f0'
  },
  logoWrapper: {
    height: '60px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
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
    fontSize: '0.9rem'
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    color: '#334155',
    fontSize: '0.85rem'
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
    background: '#f8fafc',
    boxSizing: 'border-box'
  },
  idBox: {
    background: '#eff6ff',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #bfdbfe'
  },
  sectionLabel: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: '10px',
    display: 'block',
    textTransform: 'uppercase'
  },
  activeTab: { flex: 1, padding: '8px', background: '#2563eb', color: 'white', border: '1px solid #2563eb', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  inactiveTab: { flex: 1, padding: '8px', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  
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