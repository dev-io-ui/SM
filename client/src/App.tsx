import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import PrivateRoute from './components/routing/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import TradingDashboard from './components/trading/TradingDashboard';
import Profile from './pages/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import theme from './theme';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <Router>
          <Box minH="100vh">
            <Navbar />
            <Box as="main" p={4}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/courses"
                  element={
                    <PrivateRoute>
                      <Courses />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/courses/:id"
                  element={
                    <PrivateRoute>
                      <CourseDetails />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/trading"
                  element={
                    <PrivateRoute>
                      <TradingDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ChakraProvider>
    </Provider>
  );
};

export default App;
