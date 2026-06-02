import React from 'react';

const Footer = () => {
  return (
    <footer style={{ background: '#2e7d32', color: 'white', textAlign: 'center', padding: '16px' }}>
      <p>© {new Date().getFullYear()} FarmFlow. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
