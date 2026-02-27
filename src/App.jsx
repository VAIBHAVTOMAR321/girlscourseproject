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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/Login" />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/UserLeftNav" element={<UserLeftNav />} />
        <Route path="/UserDashboard" element={<UserDashboard />} />
        <Route path="/UserTopNav" element={<UserTopNav />} />
      </Routes>
    </Router>
  );
}

export default App;
