import { useNavigate } from 'react-router-dom';

const Contact  = () => {
    const navigate = useNavigate();
    
    return (
        <div className="fade-in" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#0056b3' }}>Contact Us</h1>
            <p style={{ fontSize: '1.2rem', color: '#555' }}>
                Have questions or need assistance? Reach out to the Civic Connect support team.
            </p>
            
            <div style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <p><strong>📍 Address:</strong> Secretariat, Hyderabad, Telangana</p>
                <p><strong>📞 Helpline:</strong> 1800-XXX-XXXX</p>
                <p><strong>📧 Email:</strong> support@civicconnect.telangana.gov.in</p>
            </div>

            <button onClick={() => navigate('/')} className="btn-gov" style={{ marginTop: '30px', padding: '15px 30px' }}>
                Back to Home
            </button>
        </div>
    );
};

export default Contact;