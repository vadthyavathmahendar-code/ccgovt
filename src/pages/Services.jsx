import { useNavigate } from 'react-router-dom';

const Services = () => {
    const navigate = useNavigate();
    
    return (
        <div className="fade-in" style={styles.container}>
            


            <div style={styles.content}>
                
                {/* INTRO TEXT */}
                <div style={{textAlign:'center', marginBottom:'50px'}}>
                    <h2 style={styles.sectionTitle}>What Services We Offer</h2>
                    <p style={styles.text}>
                        Civic Connect isn't just a form; it's a full-stack governance suite. 
                        We provide end-to-end solutions for grievance redressal, from the moment 
                        you snap a photo to the moment the issue is resolved.
                    </p>
                </div>

                {/* SERVICES GRID */}
                <div style={styles.grid}>
                    
                  

                    {/* Service 2 */}
                    <ServiceCard 
                        icon="📍" 
                        title="GPS & Geo-Tagging" 
                        desc="No need to type addresses. We use your device's GPS to pin the exact latitude and longitude of the problem, ensuring officers find the spot immediately."
                    />

                    {/* Service 3 */}
                    <ServiceCard 
                        icon="⚡" 
                        title="Real-Time Tracking" 
                        desc="Stop guessing. Watch your complaint move from 'Pending' to 'In Progress' to 'Resolved' in real-time with instant dashboard updates."
                    />

                    {/* Service 4 */}
                    <ServiceCard 
                        icon="📸" 
                        title="Evidence-Based Resolution" 
                        desc="Transparency is key. Field officers cannot close a ticket without uploading a 'Proof of Work' photo, ensuring the job is actually done."
                    />

                    

                

                </div>

                {/* CTA BUTTON */}
                <div style={{textAlign:'center', marginTop:'50px'}}>
                    <button onClick={() => navigate('/')} style={styles.backBtn}>
                        ← Back to Home
                    </button>
                </div>

            </div>
        </div>
    );
}

// --- SUB-COMPONENT FOR CARDS ---
const ServiceCard = ({ icon, title, desc }) => (
    <div style={styles.card}>
        <div style={styles.iconBox}>{icon}</div>
        <h3 style={styles.cardTitle}>{title}</h3>
        <p style={styles.cardDesc}>{desc}</p>
    </div>
);

// --- STYLES ---
const styles = {
    container: {
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        background: '#f8fafc',
        minHeight: '100vh',
        paddingBottom: '40px'
    },
    header: {
        background: '#0f172a',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center',
        borderBottom: '5px solid #2563eb'
    },
    title: { fontSize: '3rem', margin: '0 0 10px 0', fontWeight: '700' },
    subtitle: { fontSize: '1.2rem', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto' },
    
    content: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' },
    
    sectionTitle: { fontSize: '2rem', color: '#1e293b', marginBottom: '15px' },
    text: { fontSize: '1.1rem', color: '#64748b', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' },

    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '25px',
        marginTop: '20px'
    },
    
    // CARD STYLES
    card: {
        background: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        borderTop: '4px solid transparent',
        transition: 'transform 0.2s, border-color 0.2s',
        cursor: 'default'
    },
    iconBox: { fontSize: '2.5rem', marginBottom: '15px' },
    cardTitle: { fontSize: '1.25rem', color: '#0f172a', marginBottom: '10px', fontWeight: '700' },
    cardDesc: { fontSize: '0.95rem', color: '#64748b', lineHeight: '1.6' },

    backBtn: {
        padding: '12px 30px',
        background: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
    }
};

export default Services;