import { useNavigate } from 'react-router-dom';

const About = () => {
    const navigate = useNavigate();
    
    return (
        <div className="fade-in" style={styles.container}>
            
            <div style={styles.card}>
                <h1 style={styles.title}>Civic Connect</h1>
                <p style={styles.subtitle}>Making our city better, one report at a time.</p>
                
                <hr style={styles.divider} />

                <h2 style={styles.heading}>What is this?</h2>
                <p style={styles.text}>
                    Civic Connect is a bridge between you and the Municipal Corporation. 
                    Instead of visiting government offices, you can now report issues like 
                    <strong> potholes, garbage, or streetlights.</strong> 
                </p>

                <h2 style={styles.heading}>How it works</h2>
                <div style={styles.steps}>
                    <div style={styles.step}>
                        <span style={styles.emoji}>📸</span>
                        <strong>1. You Report</strong>
                        <p style={styles.smallText}>Upload a photo. </p>
                    </div>
                    <div style={styles.step}>
                        <span style={styles.emoji}>⚙️</span>
                        <strong>2. We Assign</strong>
                        <p style={styles.smallText}>The system notifies the correct officer.</p>
                    </div>
                    <div style={styles.step}>
                        <span style={styles.emoji}>✅</span>
                        <strong>3. Fixed!</strong>
                        <p style={styles.smallText}>You get a notification when the job is done.</p>
                    </div>
                </div>

                <div style={{marginTop:'30px'}}>
                    <p style={{fontSize:'0.9rem', color:'#64748b'}}>Built with ❤️ for the Smart City Initiative.</p>
                    <button onClick={() => navigate('/')} style={styles.button}>Go Back Home</button>
                </div>
            </div>

        </div>
    );
}

// --- STYLES ---
const styles = {
    container: {
        minHeight: '100vh',
        background: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    card: {
        background: 'white',
        maxWidth: '600px',
        width: '100%',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        textAlign: 'center'
    },
    title: {
        fontSize: '2.5rem',
        margin: '0 0 10px',
        color: '#0f172a'
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#64748b',
        margin: '0'
    },
    divider: {
        border: 'none',
        height: '1px',
        background: '#e2e8f0',
        margin: '30px 0'
    },
    heading: {
        color: '#334155',
        fontSize: '1.2rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '15px',
        marginTop: '20px'
    },
    text: {
        color: '#475569',
        fontSize: '1rem',
        lineHeight: '1.6',
        maxWidth: '500px',
        margin: '0 auto'
    },
    steps: {
        display: 'flex',
        gap: '20px',
        marginTop: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap'
    },
    step: {
        flex: 1,
        minWidth: '120px',
        background: '#f8fafc',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
    },
    emoji: {
        fontSize: '2rem',
        display: 'block',
        marginBottom: '10px'
    },
    smallText: {
        fontSize: '0.8rem',
        color: '#94a3b8',
        marginTop: '5px'
    },
    button: {
        marginTop: '20px',
        padding: '12px 24px',
        background: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '0.9rem'
    }
};

export default About;