import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import axios from "axios";
import regBanner from "../../assets/reg-banner.jpg";
import { Link, useNavigate } from "react-router-dom";
import "../../custom/style.css";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../../assets/brainrock_logo.png";

const Login = () => {
  const [role, setRole] = useState("admin");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email_or_phone: "",
    aadhaar_no: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = {};

    if (role === "admin") {
      if (!formData.email_or_phone.trim()) {
        errors.email_or_phone = "Email or Phone is required";
      }
    }

    if (role === "student") {
      if (!formData.aadhaar_no.trim()) {
        errors.aadhaar_no = "Aadhaar number is required";
      }
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    }

    // If errors exist → stop submit
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setErrorMessage("");

    let payload =
      role === "admin"
        ? {
            email_or_phone: formData.email_or_phone,
            password: formData.password,
          }
        : {
            aadhaar_no: formData.aadhaar_no,
            password: formData.password,
          };

    try {
      const response = await axios.post(
        "https://brjobsedu.com/girls_course/girls_course_backend/api/login/",
        payload,
      );

      if (response.data.error || response.data.detail) {
        setErrorMessage(response.data.error || response.data.detail);
        return;
      }

      // Store authentication data with actual response
      login(response.data);
      alert("Login Successful");

      // Redirect to appropriate dashboard based on role
      const dashboardRoute = response.data.role === "admin"
        ? "/AdminDashboard"
        : "/UserDashboard";
      navigate(dashboardRoute);
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Login Failed";

      setErrorMessage(message);
    }
  };

  return (
    <div className="gov-portal-bg">
      {/* Fixed Header with Flexbox */}
      <header className="official-header-fixed">
        <Container fluid>
          <div className="official-header-content">
            <div className="header-left">
              <div className="official-seal">
                <div className="seal-inner">
                  <img src={Logo} alt=""></img>
                </div>
              </div>
            </div>
            
            <div className="header-center">
              <h1 className="portal-title">National Education Portal</h1>
              <p className="portal-subtitle">Department of Education & Training</p>
            </div>
            
            <div className="header-right">
              <div className="header-nav">
                <span className="nav-item">Home</span>
               
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content with padding-top to account for fixed header */}
      <Container className="mt-5 main-content-wrapper">
        <Row className="align-items-center p-4 shadow rounded bg-white official-card">
          <Col lg={6} md={6} sm={12} className="text-center">
            <div className="banner-container">
              <img src={regBanner} alt="Login" className="img-fluid rounded" />
              <div className="banner-overlay">
                <h3>Secure Access Portal</h3>
                <p>Authorized Personnel Only</p>
              </div>
            </div>
          </Col>

          <Col lg={6} md={6} sm={12}>
            <div className="p-4">
              {/* Dynamic heading based on role */}
              <div className="section-header">
                <h2 className="text-center mb-4">
                  {role === "admin" ? "Admin Login" : "Student Login"}
                </h2>
                <div className="header-underline"></div>
              </div>

              {/* Role Selection with Radio Buttons */}
              <Form.Group className="mb-4">
                <Form.Label className="mb-3 form-label-gov">Select User Type</Form.Label>
                <div className="d-flex justify-content-around">
                  <div 
                    className={`gov-role-option ${role === "admin" ? "selected" : ""}`}
                    onClick={() => setRole("admin")}
                  >
                    <div className="gov-radio-button">
                      <div className={`gov-radio-inner ${role === "admin" ? "checked" : ""}`}></div>
                    </div>
                    <span>Administrator</span>
                  </div>
                  <div 
                    className={`gov-role-option ${role === "student" ? "selected" : ""}`}
                    onClick={() => setRole("student")}
                  >
                    <div className="gov-radio-button">
                      <div className={`gov-radio-inner ${role === "student" ? "checked" : ""}`}></div>
                    </div>
                    <span>Student</span>
                  </div>
                </div>
              </Form.Group>

              <Form onSubmit={handleSubmit}>
                {/* Admin Field */}
                {role === "admin" && (
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-gov">Email or Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="email_or_phone"
                      value={formData.email_or_phone}
                      onChange={handleChange}
                      placeholder="Enter Email Or Phone"
                      className="form-control-gov"
                    />
                    {fieldErrors.email_or_phone && (
                      <small className="text-danger">
                        {fieldErrors.email_or_phone}
                      </small>
                    )}
                  </Form.Group>
                )}

                {/* Student Field */}
                {role === "student" && (
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-gov">Aadhaar Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="aadhaar_no"
                      value={formData.aadhaar_no}
                      onChange={handleChange}
                      maxLength={12}
                      placeholder="Enter 12 Digit Aadhaar Number"
                      className="form-control-gov"
                    />
                    {fieldErrors.aadhaar_no && (
                      <small className="text-danger">
                        {fieldErrors.aadhaar_no}
                      </small>
                    )}
                  </Form.Group>
                )}

                {/* Common Password */}
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-gov">Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter Password"
                    className="form-control-gov"
                  />
                  {fieldErrors.password && (
                    <small className="text-danger">{fieldErrors.password}</small>
                  )}
                </Form.Group>
                
                {errorMessage && (
                  <div className="alert alert-danger error-box-gov">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {errorMessage}
                  </div>
                )}
                <div className="text-center">
                <Button type="submit" className=" text-center btn-gov-primary">
                  <span> Login</span>
                </Button>
                </div>
              </Form>

              <div className="text-center mt-4">
                <small className="register-text">
                  Don't have an account? <Link to="/Registration" className="register-link">Register Here</Link>
                </small>
              </div>
              
              <div className="security-notice mt-3">
                <p className="text-center small text-muted">
                  <i className="fas fa-lock me-1"></i>
                  This is a secure system. Unauthorized access is prohibited.
                </p>
              </div>
            </div>
          </Col>
        </Row>
        
        <div className="footer-notice text-center mt-4">
          <p className="small text-muted">
            © 2026 National Education Portal. All rights reserved. | 
             Designed by <a href="https://brainrock.in/" target="_blank" rel="noopener noreferrer" className="footer-link">Brainrock</a>
          </p>
        </div>
      </Container>

      <style jsx>{`
        .gov-portal-bg {
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
          min-height: 100vh;
          padding-bottom: 50px;
        }
        
        .official-header-fixed {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          padding: 15px 0;
          
        }
        
        .official-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          flex: 0 0 auto;
        }
        
        .header-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          text-align: center;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex: 0 0 auto;
        }
        
        .official-seal {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #1a3a5f 0%, #2c5282 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        
        .official-seal:hover {
          transform: scale(1.05);
        }
        
        .seal-inner {
          color: white;
          text-align: center;
          font-weight: bold;
          font-size: 10px;
          line-height: 1.2;
        }
        
        .portal-title {
          color: #1a3a5f;
          font-weight: 700;
          margin-bottom: 5px;
          font-size: 1.5rem;
          letter-spacing: 0.5px;
        }
        
        .portal-subtitle {
          color: #4a5568;
          font-weight: 500;
          margin-bottom: 0;
          font-size: 0.9rem;
        }
        
        .header-nav {
          display: flex;
          gap: 20px;
        }
        
        .nav-item {
          color: #4a5568;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: color 0.3s ease;
          position: relative;
        }
        
        .nav-item:hover {
          color: #1a3a5f;
        }
        
        .nav-item::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 0;
          height: 2px;
          background: #2c5282;
          transition: width 0.3s ease;
        }
        
        .nav-item:hover::after {
          width: 100%;
        }
        
        .main-content-wrapper {
          padding-top: 46px;
        }
        
        .official-card {
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          background-color: #fff;
        }
        
        .banner-container {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
        }
        
        .banner-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(26, 58, 95, 0.9), rgba(26, 58, 95, 0));
          color: white;
          padding: 20px;
          text-align: center;
        }
        
        .banner-overlay h3 {
          font-weight: 600;
          margin-bottom: 5px;
        }
        
        .section-header {
          position: relative;
          margin-bottom: 25px;
        }
        
        .header-underline {
          height: 3px;
          width: 80px;
          background: linear-gradient(90deg, #1a3a5f, #2c5282);
          margin: 0 auto;
          border-radius: 3px;
        }
        
        .form-label-gov {
          color: #2d3748;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .form-control-gov {
          border: 1px solid #cbd5e0;
          border-radius: 4px;
          padding: 12px 15px;
          transition: all 0.3s ease;
        }
        
        .form-control-gov:focus {
          border-color: #2c5282;
          box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
        }
        
        .gov-role-option {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid #e2e8f0;
          flex: 1;
          margin: 0 5px;
          justify-content: center;
          background-color: #f7fafc;
        }
        
        .gov-role-option:hover {
          background-color: #edf2f7;
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .gov-role-option.selected {
          border-color: #2c5282;
          background-color: rgba(44, 82, 130, 0.1);
          box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
        }
        
        .gov-radio-button {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid #a0aec0;
          margin-right: 12px;
          position: relative;
          transition: all 0.3s ease;
        }
        
        .gov-role-option.selected .gov-radio-button {
          border-color: #2c5282;
        }
        
        .gov-radio-inner {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #2c5282;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          transition: all 0.3s ease;
        }
        
        .gov-radio-inner.checked {
          transform: translate(-50%, -50%) scale(1);
        }
        
        .gov-role-option span {
          font-weight: 600;
          color: #4a5568;
          font-size: 15px;
        }
        
        .gov-role-option.selected span {
          color: #1a3a5f;
        }
        
        .btn-gov-primary {
          background: linear-gradient(135deg, #1a3a5f 0%, #2c5282 100%);
          border: none;
       
          font-weight: 600;
          border-radius: 4px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .btn-gov-primary{
        font-size:12px;
        }
        .btn-gov-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 14px rgba(0, 0, 0, 0.1);
          background: linear-gradient(135deg, #1a3a5f 0%, #2c5282 100%);
        }
        
        .error-box-gov {
          background-color: #fff5f5;
          border-left: 4px solid #e53e3e;
          border-radius: 4px;
          padding: 12px 15px;
          margin-top: 15px;
        }
        
        .register-text {
          color: #4a5568;
        }
        
        .register-link {
          color: #2c5282;
          font-weight: 600;
          text-decoration: none;
        }
        
        .register-link:hover {
          text-decoration: underline;
        }
        
        .security-notice {
          border-top: 1px solid #e2e8f0;
          padding-top: 15px;
          margin-top: 20px;
        }
        
        .footer-notice {
          margin-top: 30px;
        }
        
        .footer-link {
          color: #4a5568;
          margin: 0 5px;
          text-decoration: none;
        }
        
        .footer-link:hover {
          color: #2c5282;
          text-decoration: underline;
        }
        
        @media (max-width: 992px) {
          .header-nav {
            display: none;
          }
          
          .official-header-content {
            justify-content: center;
          }
          
          .header-left {
            position: absolute;
            left: 20px;
          }
          
          .header-right {
            display: none;
          }
        }
        
        @media (max-width: 768px) {
          .portal-title {
            font-size: 1.2rem;
          }
          
          .portal-subtitle {
            font-size: 0.8rem;
          }
          
          .official-seal {
            width: 50px;
            height: 50px;
          }
          
          .seal-inner {
            font-size: 8px;
          }
          
          .main-content-wrapper {
            padding-top: 130px;
          }
          
          .header-left {
            position: static;
          }
          
          .official-header-content {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;