// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context'; // Adjust the path if needed

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // User is not logged in, redirect them to the login page.
    return <Navigate to="/login" replace />;
  }

  // User is logged in, render the child components or the outlet for nested routes.
  return children ? children : <Outlet />;
};

export default ProtectedRoute;