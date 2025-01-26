import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    // You could return a loading spinner here
    return null;
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
