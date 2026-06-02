import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          FarmFlow
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/products">Products</Link>
          </li>
          {user ? (
            <>
              {user.role === 'seller' && (
                <li>
                  <Link to="/seller/dashboard">Seller Dashboard</Link>
                </li>
              )}
              {user.role === 'buyer' && (
                <>
                  <li>
                    <Link to="/cart">Cart ({totalItems})</Link>
                  </li>
                  <li>
                    <Link to="/my-orders">My Orders</Link>
                  </li>
                </>
              )}
              <li>
                <span style={{ color: '#4caf50' }}>Hi, {user.name}</span>
              </li>
              <li>
                <button onClick={logout} className="btn-logout">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
