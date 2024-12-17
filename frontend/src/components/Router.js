import Header from './Header';
import Footer from './Footer';
import Upit from '../pages/Upit';
import Home from '../pages/Home';
import Signup from '../pages/Signup';
import Main from '../pages/Main';
import Contact from '../pages/Contact';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import KontaktDetalji from '../pages/KontaktDetalji';
import PotvrdaSignupa from '../pages/additionalInfo';
import UserPage from '../pages/KorisnikInfo';

export default function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); 
  const [isEmailVerified, setIsEmailVerified] = useState(null); // Track email verifikaciju

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:4000/check-auth', {
        withCredentials: true,
      });
      
      // Update autentifikaciju
      setIsAuthenticated(response.data.isAuthenticated);
      setIsEmailVerified(response.data.isEmailVerified);
      
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsAuthenticated(false); //slanje signala o stanju
      setIsEmailVerified(false); 
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const Layout = () => {
    return (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header />
            <div style={{ flex: 1 }}>
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};



  

  const PrivateRoute = ({ children }) => {
    if (isAuthenticated === null || isEmailVerified === null) {
      return <div>Loading...</div>; 
    }
    console.log(isAuthenticated);
    console.log("------------------------");
    console.log(isEmailVerified);

    if (!isAuthenticated || !isEmailVerified) {
      return <Navigate to="/signup" />;
    }
    return children; 
  };

  const LoggedRoute = ({ children }) => {
    if (isAuthenticated === null || isEmailVerified === null) {
      return <div>Loading...</div>; 
    }

    console.log(isAuthenticated);
    console.log("------------------------");
    console.log(isEmailVerified);

    // Redirect to signup if not authenticated or email is not verified
    if (isAuthenticated && isEmailVerified) {
      return <Navigate to="/home" />;
    }
    return children; // If authenticated and verified, render the children components
  };
  const AuthenticatedRoute = ({ children }) => {
    if (isAuthenticated === null) {
      return <div>Loading...</div>;
    }
    // If authenticated, render the children components; otherwise, redirect to signup
    return isAuthenticated ? children : <Navigate to="/signup" />;
  };

  const BrowserRouters = () => (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>

        <Route path="/" element={
          <LoggedRoute>
          <Signup />
        </LoggedRoute>
          } 
          />
          
          
          <Route 
          path="signup" 
          element={
            <LoggedRoute>

            <Signup />
          </LoggedRoute>

          } 
          />
          
          


          {/* Protected Routes */}
          <Route
            path="home"
            element={
              <PrivateRoute>
                <Home />
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
            path="potvrda"
            element={
              <AuthenticatedRoute>
                <PotvrdaSignupa />
              </AuthenticatedRoute>
            }
          />



          <Route
            path="contact"
            element={
              <PrivateRoute>
                <Contact />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );

  return <BrowserRouters />;
}
