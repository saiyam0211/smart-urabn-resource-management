import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import Login from "./components/Login";
import NavLink from "./components/NavLink";
import UserDashboard from "./components/UserDashboard";
import VolunteerDashboard from "./components/VolunteerDashboard";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import MainNavigation from "./components/NavLink";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Create a layout component that includes navigation
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};

// Update the private route component
const PrivateRoute = ({ children, requiredType }) => {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (requiredType && userType !== requiredType) {
    return <Navigate to="/" />;
  }

  return <Layout>{children}</Layout>;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="min-h-screen flex items-center justify-center bg-gray-50"
                >
                  <div className="max-w-md w-full space-y-8 p-8">
                    <div>
                      <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
                        Smart Urban Resource Management
                      </h1>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => (window.location.href = "/user-login")}
                        className="w-full py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-all duration-300"
                      >
                        User Login
                      </button>
                      <button
                        onClick={() =>
                          (window.location.href = "/volunteer-login")
                        }
                        className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300"
                      >
                        Volunteer Login
                      </button>
                    </div>
                  </div>
                </motion.div>
              }
            />
            <Route path="/user-login" element={<Login userType="user" />} />
            <Route
              path="/volunteer-login"
              element={<Login userType="volunteer" />}
            />

            {/* Private Routes */}
            <Route
              path="/user/dashboard"
              element={
                <PrivateRoute requiredType="user">
                  <UserDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/volunteer/dashboard"
              element={
                <PrivateRoute requiredType="volunteer">
                  <VolunteerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <AnalyticsDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
