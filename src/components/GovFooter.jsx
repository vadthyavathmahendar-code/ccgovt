const GovFooter = () => {
  return (
    <footer style={{ background: '#0056b3', color: 'white', paddingTop: '40px', marginTop: 'auto' }}>
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', paddingBottom: '40px' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ borderBottom: '2px solid white', paddingBottom: '10px', display: 'inline-block' }}>Contact Us</h4>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            Commissionerate of Municipal Administration<br/>
            640, A.C. Guards, Masab Tank<br/>
            Hyderabad 500004<br/>
            Phone: 040-23222111
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ borderBottom: '2px solid white', paddingBottom: '10px', display: 'inline-block' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', lineHeight: '2' }}>
            <li>Telangana State Portal</li>
            <li>GHMC Official Website</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>
      <div style={{ background: '#004494', textAlign: 'center', padding: '15px', fontSize: '0.85rem' }}>
        Copyright © Government of Telangana. All rights reserved.
      </div>
    </footer>
  );
};
export default GovFooter;