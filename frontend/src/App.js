import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage        from './pages/LoginPage';
import SellerDashboard  from './pages/SellerDashboard';
import SellerOrdersPage from './pages/SellerOrdersPage';
import BuyerPage        from './pages/BuyerPage';
import OrdersPage       from './pages/OrdersPage';
import PaymentPage      from './pages/PaymentPage';
import Navbar           from './components/Navbar';
import ErrorBoundary    from './components/ErrorBoundary';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  function handleLogin(userData) {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  // Listen for 401 responses fired by apiFetch — auto-logout when token expires
  useEffect(() => {
    function onExpired() {
      alert('Your session has expired. Please log in again.');
      handleLogout();
    }
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />

      {/* Catches render crashes in any page and shows a fallback */}
      <ErrorBoundary>
        <Routes>
          {/* Not logged in */}
          <Route
            path="/login"
            element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />}
          />

          {/* Home — seller or buyer */}
          <Route
            path="/"
            element={
              !user                  ? <Navigate to="/login" /> :
              user.role === 'seller' ? <SellerDashboard />      :
              <BuyerPage />
            }
          />

          {/* Buyer — orders */}
          <Route
            path="/orders"
            element={
              !user                 ? <Navigate to="/login" /> :
              user.role !== 'buyer' ? <Navigate to="/" />      :
              <OrdersPage />
            }
          />

          {/* Buyer — payment */}
          <Route
            path="/payment"
            element={
              !user                 ? <Navigate to="/login" /> :
              user.role !== 'buyer' ? <Navigate to="/" />      :
              <PaymentPage />
            }
          />

          {/* Seller — orders */}
          <Route
            path="/seller-orders"
            element={
              !user                  ? <Navigate to="/login" /> :
              user.role !== 'seller' ? <Navigate to="/" />      :
              <SellerOrdersPage />
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
