import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const Signup = () => {
  // --- STATE ---
  const [role, setRole] = useState('citizen'); // 'citizen', 'employee', 'admin'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Dynamic Fields
    aadhaar: '',      // For Citizen
    employeeId: '',   // For Employee
    adminId: '',      // For Admin
    department: 'Roads' // For Admin Only
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { fullName, email, phone, password, confirmPassword, aadhaar, employeeId, adminId, department } = formData;

    // 1. Password Match
    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match!");
      setLoading(false);
      return;
    }

    // 2. Prepare Data based on Role
    let finalRole = role; // 'citizen', 'employee', or 'admin' (which we map to 'dept_admin')
    let finalIdType = '';
    let finalIdNumber = '';
    let finalDept = 'All'; // Default for citizen/employee (or NULL)

    if (role === 'citizen') {
        if (!/^\d{12}$/.test(aadhaar)) {
            toast.error("❌ Invalid Aadhaar (Must be 12 digits)");
            setLoading(false); return;
        }
        finalIdType = 'aadhaar';
        finalIdNumber = aadhaar;
        finalRole = 'citizen';
    } 
    else if (role === 'employee') {
        if (!employeeId) {
            toast.error("❌ Employee ID is required");
            setLoading(false); return;
        }
        finalIdType = 'employee_id';
        finalIdNumber = employeeId;
        finalRole = 'employee';
        // Note: In real app, you might want to ask Dept for employee too, 
        // but for now we can leave it or assign later by Admin. 
        // Let's set it to 'Roads' default or allow selection if you want.
        finalDept = 'Roads'; 
    } 
    else if (role === 'admin') {
        if (!adminId) {
            toast.error("❌ Admin ID is required");
            setLoading(false); return;
        }
        finalIdType = 'admin_id';
        finalIdNumber = adminId;
        finalRole = 'dept_admin'; // Map UI 'admin' to DB 'dept_admin'
        finalDept = department;
    }

    try {
      // 3. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;

      if (authData.user) {
        // 4. Create Profile
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id,
          full_name: fullName,
          email: email,
          phone: phone,
          role: finalRole,
          department: finalDept,
          govt_id_type: finalIdType,
          govt_id_number: finalIdNumber
        }]);

        if (profileError) throw profileError;

        toast.success(`✅ ${role.toUpperCase()} Account Created!`);
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={styles.pageContainer}>
      <Toaster />
      <div className="gov-card" style={styles.signupCard}>
        
        {/* Header */}
        <div style={styles.cardHeader}>
          <div style={styles.logoWrapper}>
             <img src="/images/cc_logo.png" alt="Logo" style={{height:'100%', width:'auto'}} />
          </div>
          <h2 style={styles.title}>Join Civic Connect</h2>
          <p style={styles.subtitle}>Select your role to register</p>
        </div>

        {/* ROLE SELECTOR TABS */}
        <div style={styles.tabContainer}>
            <button type="button" onClick={()=>setRole('citizen')} style={role==='citizen' ? styles.activeTab : styles.tab}>
                🙋‍♂️ Citizen
            </button>
            <button type="button" onClick={()=>setRole('employee')} style={role==='employee' ? styles.activeTab : styles.tab}>
                👷‍♂️ Employee
            </button>
            <button type="button" onClick={()=>setRole('admin')} style={role==='admin' ? styles.activeTab : styles.tab}>
                👔 Admin
            </button>
        </div>

        {/* Form */}
        <div style={{ padding: '25px' }}>
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* COMMON FIELDS */}
            <div>
               <label style={styles.label}>Full Name</label>
               <input name="fullName" placeholder="full name" value={formData.fullName} onChange={handleChange} required style={styles.input} />
            </div>

            <div style={{display:'flex', gap:'15px'}}>
                <div style={{flex:1}}>
                    <label style={styles.label}>Phone Number</label>
                    <input name="phone" type="tel" placeholder="9876543210" value={formData.phone} onChange={handleChange} required style={styles.input} />
                </div>
                <div style={{flex:1}}>
                    <label style={styles.label}>Email</label>
                    <input name="email" type="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required style={styles.input} />
                </div>
            </div>

            {/* DYNAMIC FIELDS BASED ON ROLE */}
            <div style={styles.dynamicBox}>
                
                {/* 1. CITIZEN FIELDS */}
                {role === 'citizen' && (
                    <div>
                        <label style={styles.label}>Aadhaar Number (12 Digits)</label>
                        <input name="aadhaar" maxLength="12" placeholder="xxxx xxxx xxxx" value={formData.aadhaar} onChange={handleChange} style={styles.input} />
                    </div>
                )}

                {/* 2. EMPLOYEE FIELDS */}
                {role === 'employee' && (
                    <div>
                        <label style={styles.label}>Employee ID</label>
                        <input name="employeeId" placeholder="EMP-101" value={formData.employeeId} onChange={handleChange} style={styles.input} />
                    </div>
                )}

                {/* 3. ADMIN FIELDS */}
                {role === 'admin' && (
                    <div style={{display:'flex', gap:'15px'}}>
                        <div style={{flex:1}}>
                            <label style={styles.label}>Admin ID</label>
                            <input name="adminId" placeholder="ADM-001" value={formData.adminId} onChange={handleChange} style={styles.input} />
                        </div>
                        <div style={{flex:1}}>
                            <label style={styles.label}>Department</label>
                            <select name="department" value={formData.department} onChange={handleChange} style={styles.input}>
                                <option value="Roads">Roads</option>
                                <option value="Garbage">Garbage</option>
                                <option value="Electricity">Electricity</option>
                                
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* PASSWORDS */}
            <div style={{ display: 'flex', gap: '15px' }}>
               <div style={{flex:1}}>
                  <label style={styles.label}>Password</label>
                  <input name="password" type="password" value={formData.password} onChange={handleChange} required style={styles.input} />
               </div>
               <div style={{flex:1}}>
                  <label style={styles.label}>Confirm</label>
                  <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required style={styles.input} />
               </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Creating Account...' : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </button>

          </form>
          
          <div style={{textAlign:'center', marginTop:'20px', fontSize:'0.9rem', color:'#64748b'}}>
             Already have an account? <Link to="/" style={styles.link}>Login Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
  pageContainer: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', padding: '20px' },
  signupCard: { width: '100%', maxWidth: '500px', padding: '0', borderTop: '5px solid #2563eb', overflow: 'hidden' },
  cardHeader: { background: '#f1f5f9', padding: '25px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' },
  logoWrapper: { height: '50px', marginBottom: '10px', display: 'flex', justifyContent: 'center' },
  title: { margin: '5px 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: '800' },
  subtitle: { margin: 0, color: '#64748b', fontSize: '0.9rem' },
  
  // TABS
  tabContainer: { display: 'flex', background: '#e2e8f0', padding: '4px', margin: '20px 25px 0', borderRadius: '8px' },
  tab: { flex: 1, padding: '10px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '600', color: '#64748b', borderRadius: '6px' },
  activeTab: { flex: 1, padding: '10px', border: 'none', background: 'white', cursor: 'pointer', fontWeight: 'bold', color: '#2563eb', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },

  label: { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#334155', fontSize: '0.85rem' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', outline: 'none', boxSizing:'border-box', background:'#f8fafc' },
  
  dynamicBox: { background: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1px solid #bfdbfe' },
  
  submitBtn: { width: '100%', padding: '12px', marginTop: '10px' },
  link: { color: '#2563eb', fontWeight: '600', textDecoration: 'none' }
};

export default Signup;