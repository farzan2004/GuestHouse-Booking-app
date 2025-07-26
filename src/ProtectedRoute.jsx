import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const guestToken = localStorage.getItem("guestToken");

  return currentUser || guestToken ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
