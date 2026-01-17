import { useNavigate } from 'react-router-dom';

const About = () => {
    const navigate = useNavigate();
    
    return (
        <div className="fade-in" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#0056b3' }}>About Civic Connect</h1>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '15px' }}>
            Civic Connect is a cutting-edge platform designed to bridge the gap between citizens and local government services. Our mission is to empower residents to report civic issues quickly and efficiently, ensuring that communities remain safe, clean, and well-maintained.
        </p>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '15px' }}>
            With features like GPS tagging, photo uploads, and real-time status updates, Civic Connect makes it easier than ever for citizens to contribute to the upkeep of their neighborhoods. Whether it's a pothole, broken streetlight, or graffiti, reporting issues has never been more straightforward.
        </p>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '15px' }}>
            Our platform also provides government employees with the tools they need to manage and resolve reported issues efficiently. By fostering better communication between citizens and local authorities, we aim to create more responsive and accountable governance.
        </p>
        <button onClick={() => navigate('/')} className="btn-gov" style={{ marginTop: '30px', padding: '15px 30px', fontSize: '1.1rem' }}>
            Back to Home
        </button>
        </div>
    );
    }

export default About;