import { useNavigate } from 'react-router-dom';

const Services = () => {
    const navigate = useNavigate();
    
    return (
        <div className="fade-in" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#0056b3' }}>Our Services</h1>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '15px' }}>
            At Civic Connect, we offer a comprehensive suite of services designed to enhance civic engagement and streamline the reporting of local issues. Our platform empowers citizens to take an active role in maintaining and improving their communities.
        </p>
        <h2 style={{ fontSize: '2rem', marginBottom: '15px', color: '#0056b3' }}>Key Services:</h2>
        <ul style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '15px' }}>
            <li><strong>Issue Reporting:</strong> Easily report civic issues such as potholes, broken streetlights, graffiti, and more through our user-friendly interface.</li>
            <li><strong>GPS Tagging:</strong> Our advanced geolocation technology ensures that every report is accurately tagged with its location for efficient resolution.</li>
            <li><strong>Photo Uploads:</strong> Attach photos to your reports to provide visual evidence of the issue, helping authorities assess and prioritize repairs.</li>
            <li><strong>Status Tracking:</strong> Stay informed with real-time updates on the status of your reported issues, from submission to resolution.</li>
            <li><strong>Community Feedback:</strong> Engage with local government officials and provide feedback on services to help improve community responsiveness.</li>
        </ul>
        <button onClick={() => navigate('/')} className="btn-gov" style={{ marginTop: '30px', padding: '15px 30px', fontSize: '1.1rem' }}>
            Back to Home
        </button>
        </div>
    );
    }

export default Services;