import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Highlight active link
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <strong className="navbar__brand" onClick={() => navigate('/')}>
        🌿 FarmFlow
      </strong>

      {user && (
        <div className="navbar__right">
          {/* Buyer links */}
          {user.role === 'buyer' && (
            <>
              <button
                className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}
                onClick={() => navigate('/')}
              >
                Products
              </button>
              <button
                className={`navbar__link ${isActive('/cart') ? 'navbar__link--active' : ''}`}
                onClick={() => navigate('/cart')}
              >
                🛒 Cart
              </button>
              <button
                className={`navbar__link ${isActive('/addresses') ? 'navbar__link--active' : ''}`}
                onClick={() => navigate('/addresses')}
              >
                Addresses
              </button>
              <button
                className={`navbar__link ${isActive('/orders') ? 'navbar__link--active' : ''}`}
                onClick={() => navigate('/orders')}
              >
                My Orders
              </button>
            </>
          )}

          {/* Seller links */}
          {user.role === 'seller' && (
            <>
              <button
                className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}
                onClick={() => navigate('/')}
              >
                Dashboard
              </button>
              <button
                className={`navbar__link ${isActive('/seller-orders') ? 'navbar__link--active' : ''}`}
                onClick={() => navigate('/seller-orders')}
              >
                Orders
              </button>
            </>
          )}

          <span className="navbar__user">
            {user.name} · <em>{user.role}</em>
          </span>

          <button className="navbar__logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
