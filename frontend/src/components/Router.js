import Header from './Header';
import Footer from './Footer';
import NoHeader from './NoHeader';
import NoFooter from './NoFooter';
import Upit from '../pages/Upit';
import Home from '../pages/Main';
import Signup from '../pages/Signup';
import Glasanje from '../pages/Glasanje';
import Main from '../pages/Main';
import Arhiva from '../pages/Archive';

import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import KontaktDetalji from '../pages/KontaktDetalji';
import CentarZaPoruke from '../pages/CentarZaPoruke';
import PotvrdaSignupa from '../pages/additionalInfo';
import UserPage from '../pages/KorisnikInfo';
import Zgrade from '../pages/Zgrade';

export default function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(null);

  const checkAuth = async () => {
    try {
      const response = await axios.get('https://be30c39fc6db.ngrok.app/check-auth', {
        withCredentials: true,
      });

      setIsAuthenticated(response.data.isAuthenticated);
      setIsEmailVerified(response.data.isEmailVerified);
    } catch (error) {
      console.error('Authentication check failed:', error);
      setIsAuthenticated(false);
      setIsEmailVerified(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const Layout = () => (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
  const ErrorPage = () => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1 style={{ fontSize: '3rem', color: '#e74c3c' }}>404 - Stranica nije pronađena</h1>
      <p>Stranica koju tražite ne postoji.</p>
      <a href="/" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold' }}>
        Vrati se na početnu stranicu
      </a>
    </div>
  );
  const NoLayout = () => (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <NoHeader />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
      <NoFooter />
    </div>
  );

  const PrivateRoute = ({ children }) => {
    if (isAuthenticated === null || isEmailVerified === null) {
      return <div>Loading...</div>;
    }
    if (!isAuthenticated || !isEmailVerified) {
      return <Navigate to="/signup" />;
    }
    return children;
  };

  const LoggedRoute = ({ children }) => {
    if (isAuthenticated === null || isEmailVerified === null) {
      return <div>Loading...</div>;
    }
    if (isAuthenticated && isEmailVerified) {
      return <Navigate to="/home" />;
    }
    return children;
  };

  const AuthenticatedRoute = ({ children }) => {
    if (isAuthenticated === null || isEmailVerified === null) {
      return <div>Loading...</div>;
    }
    if (isAuthenticated && isEmailVerified) {
      return <Navigate to="/home" />;
    }
    return children;
  };
  

  const BrowserRouters = () => (
    <BrowserRouter>
      <Routes>
        {/* Routes with Layout */}
        <Route path="/" element={<Layout />}>
        <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />

          <Route
            path="glasanje"
            element={
              <PrivateRoute>
                <Glasanje />
              </PrivateRoute>
            }
          />
          <Route
            path="main"
            element={
              <PrivateRoute>
                <Main />
              </PrivateRoute>
            }
          />

                    <Route
            path="zgrade"
            element={
              <PrivateRoute>
                <Zgrade />
              </PrivateRoute>
            }
          />
          <Route
            path="upit"
            element={
              <PrivateRoute>
                <Upit />
              </PrivateRoute>
            }
          />
          <Route
            path="archive"
            element={
              <PrivateRoute>
                <Arhiva />
              </PrivateRoute>
            }
          />
          <Route
            path="kontakt/:broj"
            element={
              <PrivateRoute>
                <KontaktDetalji />
              </PrivateRoute>
            }
          />
          <Route
            path="korisnikinfo"
            element={
              <PrivateRoute>
                <UserPage />
              </PrivateRoute>
            }
          />
          <Route
            path="inbox"
            element={
              <PrivateRoute>
                <CentarZaPoruke />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Tu cemo puknuti sve rute koje pocinju sa signup */}
        <Route element={<NoLayout />}>
          <Route
            path="/signup"
            element={
              <LoggedRoute>
                <Signup />
              </LoggedRoute>
            }
          />
          <Route
            path="/potvrda"
            element={
              <AuthenticatedRoute>
                <PotvrdaSignupa />
              </AuthenticatedRoute>
            }
          />
        </Route>
        <Route path="*" element={<ErrorPage />} />

      </Routes>
    </BrowserRouter>
  );

  return <BrowserRouters />;
}
