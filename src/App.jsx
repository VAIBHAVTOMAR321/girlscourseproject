import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Registration from "./components/registration/Registration.jsx";
import Login from "./components/login/Login.jsx";
import UserLeftNav from "./components/userdashboard/UseLeftNav.jsx";
import UserDashboard from "./components/userdashboard/UserDashboard.jsx";
import UserTopNav from "./components/userdashboard/UserTopNav.jsx";
import AdminLeftNav from "./components/admindashboard/AdminLeftNav.jsx";
import AdminDashboard from "./components/admindashboard/AdminDashboard.jsx";
import AdminTopNav from "./components/admindashboard/AdminTopNav.jsx";
import Enrollments from "./components/admindashboard/Enrollments.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          
          {/* User Dashboard Routes - Accessible to all authenticated users */}
          <Route
            path="/UserLeftNav"
            element={
              <ProtectedRoute>
                <UserLeftNav />
              </ProtectedRoute>
            }
          />
          <Route
            path="/UserDashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/UserTopNav"
            element={
              <ProtectedRoute>
                <UserTopNav />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Dashboard Routes - Only accessible to admin users */}
          <Route
            path="/AdminLeftNav"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLeftNav />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AdminDashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AdminTopNav"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminTopNav />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Enrollments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Enrollments />
              </ProtectedRoute>
            }
          />

          {/* Unauthorized Access Page */}
          <Route
            path="/unauthorized"
            element={
              <div className="container mt-5">
                <div className="row justify-content-center">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body text-center">
                        <h1 className="card-title text-danger">403</h1>
                        <h2>Unauthorized Access</h2>
                        <p>You don't have permission to access this page.</p>
                        <button
                          className="btn btn-primary"
                          onClick={() => window.location.href = "/login"}
                        >
                          Back to Login
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
