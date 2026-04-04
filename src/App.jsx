import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css'; // If you use Bootstrap CSS
import 'bootstrap-icons/font/bootstrap-icons.css'; // <-- ADD THIS LINE
import Login from "./components/login/Login.jsx";
import UserLeftNav from "./components/userdashboard/UseLeftNav.jsx";
import UserDashboard from "./components/userdashboard/UserDashboard.jsx";
import UserTopNav from "./components/userdashboard/UserTopNav.jsx";
import AdminLeftNav from "./components/admindashboard/AdminLeftNav.jsx";
import AdminDashboard from "./components/admindashboard/AdminDashboard.jsx";
import AdminTopNav from "./components/admindashboard/AdminTopNav.jsx";
import Enrollments from "./components/admindashboard/Enrollments.jsx";
import Feedback from "./components/admindashboard/Feedback.jsx";
import StudentIssues from "./components/admindashboard/StudentIssues.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";
import UserProfile from "./components/userdashboard/UserProfile.jsx";
import UserTest from "./components/userdashboard/UserTest.jsx";
import Registration from "./components/registration/Registration.jsx";
import Footer from "./components/footer/Footer.jsx";
import NavBar from "./components/navbar/NavBar.jsx";
import RefundRequest from "./components/userdashboard/RefundRequest.jsx";
import UserSettings from "./components/userdashboard/UserSettings.jsx";
import UserNotifications from "./components/userdashboard/UserNotifications.jsx";
import OccupationDetails from "./components/userdashboard/OccupationDetails.jsx";
import UserQuery from "./components/userdashboard/UserQuery.jsx";
import Home from "./components/home/Home.jsx";

function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname.includes("/AdminDashboard") || location.pathname.includes("/UserDashboard") || location.pathname.includes("/UserProfile") || location.pathname.includes("/UserTest") || location.pathname.includes("/Enrollments") || location.pathname.includes("/RefundRequest") || location.pathname.includes("/UserSettings") || location.pathname.includes("/UserNotifications") || location.pathname.includes("/OccupationDetails") || location.pathname.includes("/Feedback") || location.pathname.includes("/UserQuery") || location.pathname.includes("/StudentIssues");
  const hideNavBar = location.pathname.includes("/AdminDashboard") || location.pathname.includes("/UserDashboard") || location.pathname.includes("/UserProfile") || location.pathname.includes("/UserTest") || location.pathname.includes("/Enrollments") || location.pathname.includes("/RefundRequest") || location.pathname.includes("/UserSettings") || location.pathname.includes("/UserNotifications") || location.pathname.includes("/OccupationDetails") || location.pathname.includes("/Feedback") || location.pathname.includes("/UserQuery") || location.pathname.includes("/StudentIssues");

  return (
    <>
      {!hideNavBar && <NavBar />}
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          {/* <Route path="/UserDashboard" element={<UserDashboard />} /> */}
          <Route path="/Registration" element={<Registration />} />
          
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
            path="/UserProfile"
            element={
              <ProtectedRoute>
                <UserProfile />
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
            path="/UserTest"
            element={
              <ProtectedRoute>
                <UserTest />
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
          <Route
            path="/RefundRequest"
            element={
              <ProtectedRoute>
                <RefundRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/UserSettings"
            element={
              <ProtectedRoute>
                <UserSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/UserQuery"
            element={
              <ProtectedRoute>
                <UserQuery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/UserNotifications"
            element={
              <ProtectedRoute>
                <UserNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/OccupationDetails"
            element={
              <ProtectedRoute>
                <OccupationDetails />
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
          <Route
            path="/Feedback"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Feedback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/StudentIssues"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <StudentIssues />
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
        {!hideFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <AppContent />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
