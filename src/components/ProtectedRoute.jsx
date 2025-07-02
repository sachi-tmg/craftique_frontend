// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context'; // Adjust the path if needed

const ProtectedRoute = ({ children }) => {
  // -------------------------------------------------------------------------
  // IMPORTANT CHANGE HERE:
  // Destructure userAuth from useAuth(), then access isAuthenticated from userAuth.
  const { userAuth } = useAuth();
  const { isAuthenticated } = userAuth;
  // -------------------------------------------------------------------------

  if (!isAuthenticated) { // Use isAuthenticated instead of isLoggedIn
    // User is not logged in, redirect them to the login page.
    return <Navigate to="/login" replace />;
  }

  // User is logged in, render the child components or the outlet for nested routes.
  return children ? children : <Outlet />;
};

export default ProtectedRoute;