const GovFooter = () => {
  return (
    <footer style={{ 
      background: '#1a1a1a', 
      color: '#ccc', 
      padding: '40px 20px', 
      marginTop: '50px',
      fontSize: '0.85rem',
      borderTop: '4px solid #eab308' 
    }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px' }}>
        
        {/* Column 1 */}
        <div>
          <h4 style={{ color: 'white', borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '15px' }}>Government of Telangana</h4>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
            <li>• Telangana State Portal</li>
            <li>• Government Orders (GOs)</li>
            <li>• Press Releases</li>
            <li>• Directory</li>
          </ul>
        </div>

        {/* Column 2 */}
        <div>
          <h4 style={{ color: 'white', borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '15px' }}>Accessibility & Help</h4>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.8' }}>
            <li>• Screen Reader Access</li>
            <li>• Accessibility Option</li>
            <li>• Privacy Policy</li>
            <li>• Hyperlink Policy</li>
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h4 style={{ color: 'white', borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '15px' }}>Contact Us</h4>
          <p>
            <strong>Commissioner & Director of Municipal Administration</strong><br/>
            640, A.C. Guards, Masab Tank,<br/>
            Hyderabad - 500004.<br/><br/>
            📞 Toll Free: 1800-425-XXXX
          </p>
        </div>

      </div>

      <div style={{ textAlign: 'center', borderTop: '1px solid #333', marginTop: '30px', paddingTop: '20px', opacity: 0.6 }}>
        <p>Content Owned, Maintained and Updated by Municipal Administration Department, Govt. of Telangana.</p>
        <p>Last Updated: {new Date().toLocaleDateString()}</p>
      </div>
    </footer>
  );
};

export default GovFooter;