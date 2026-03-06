import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Badge } from "react-bootstrap";
import axios from "axios";
import regBanner from "../../assets/reg-banner.jpg";
import { Link, useNavigate } from "react-router-dom";
import "../../custom/style.css";
import { useAuth } from "../../contexts/AuthContext";
import "../../assets/css/login.css";
import Logo from "../../assets/brainrock_logo.png";

const Login = () => {
  const [role, setRole] = useState("admin");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email_or_phone: "",
    phone: "",
    password: "",
  });

  // Sample courses data
  const courses = [
    { id: 1, name: "Web Development", status: "active", enrolled: 245, icon: "💻", color: "#4285F4" },
    { id: 2, name: "Data Science", status: "disabled", enrolled: 189, icon: "📊", color: "#34A853" },
    { id: 3, name: "Machine Learning", status: "active", enrolled: 156, icon: "🤖", color: "#EA4335" },
    { id: 4, name: "Digital Marketing", status: "disabled", enrolled: 201, icon: "📱", color: "#FBBC05" },
    { id: 5, name: "Cloud Computing", status: "active", enrolled: 178, icon: "☁️", color: "#6C63FF" },
    { id: 6, name: "Cybersecurity", status: "disabled", enrolled: 134, icon: "🔒", color: "#00ACC1" },
    { id: 7, name: "Mobile Development", status: "active", enrolled: 167, icon: "📲", color: "#FF6D00" },
    { id: 8, name: "Blockchain", status: "disabled", enrolled: 98, icon: "⛓️", color: "#7B1FA2" },
    { id: 9, name: "UI/UX Design", status: "active", enrolled: 223, icon: "🎨", color: "#00897B" },
    { id: 10, name: "DevOps", status: "disabled", enrolled: 145, icon: "⚙️", color: "#D32F2F" },
  ];

  // Duplicate courses array multiple times for seamless loop
  const duplicatedCourses = [...courses, ...courses, ...courses, ...courses];

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
      if (!formData.phone.trim()) {
        errors.phone = "Phone number is required";
      } else if (!/^\d{10}$/.test(formData.phone.trim())) {
        errors.phone = "Phone number must be exactly 10 digits";
      }
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    }

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
            phone: formData.phone,
            password: formData.password,
          };

    try {
      const response = await axios.post(
        "https://brjobsedu.com/girls_course/girls_course_backend/api/login/",
        payload
      );

      if (response.data.error || response.data.detail) {
        setErrorMessage(response.data.error || response.data.detail);
        return;
      }

      login(response.data);
      alert("Login Successful");

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

  // const handleCourseClick = (course) => {
  //   if (course.status === "active") {
  //     // Navigate to registration page with course information
  //     navigate("/Registration", { 
  //       state: { 
  //         courseName: course.name,
  //         courseId: course.id,
  //         fromCourse: true 
  //       } 
  //     });
  //   } else {
  //     // Show message for disabled courses
  //     alert("This course is currently unavailable. Please check back later.");
  //   }
  // };

  return (
    <div className="gov-portal-bg">
      {/* Fixed Header with Flexbox */}
      <header className="official-header-fixed">
        <Container fluid>
          <div className="official-header-content">
            <div className="header-left">
              <div className="official-seal">
                <div className="seal-inner">
                  <img src={Logo} alt="Logo" />
                </div>
              </div>
            </div>
            
            <div className="header-center">
              <h1 className="portal-title">National Education & Training Portal</h1>
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
           <h1>National Education</h1>
          <Col lg={6} md={6} sm={12} className="course-marquee-container">
            <div className="course-marquee-header">
              <h3 className="text-center mb-3">Available Courses</h3>
              <div className="header-underline mx-auto"></div>
            </div>
            
            <div className="marquee-wrapper">
              <div className="marquee-content">
                {duplicatedCourses.map((course, index) => (
                  <div
                    key={`${course.id}-${index}`}
                    className={`course-card ${course.status === "disabled" ? "disabled" : ""} ${
                      hoveredCourse === course.id ? "hovered" : ""
                    }`}
                    onClick={() => handleCourseClick(course)}
                    onMouseEnter={() => setHoveredCourse(course.id)}
                    onMouseLeave={() => setHoveredCourse(null)}
                    style={{
                      background: course.status === "active" 
                        ? `linear-gradient(135deg, ${course.color}15 0%, ${course.color}05 100%)` 
                        : "#f5f5f5",
                      borderLeft: `4px solid ${course.status === "active" ? course.color : "#ddd"}`
                    }}
                  >
                    <div className="course-icon" style={{ color: course.color }}>
                      {course.icon}
                    </div>
                    <div className="course-info">
                      <h5 className="course-name">{course.name}</h5>
                      <div className="course-meta">
                        <Badge 
                          bg={course.status === "active" ? "success" : "secondary"}
                          className="me-2"
                        >
                          {course.status === "active" ? "Available" : "Locked"}
                        </Badge>
                        <span className="enrolled-count">
                          <i className="fas fa-users"></i> {course.enrolled}
                        </span>
                      </div>
                    </div>
                    <div className="course-action" style={{ color: course.status === "active" ? course.color : "#a0aec0" }}>
                      {course.status === "active" ? (
                        <i className="fas fa-arrow-right"></i>
                      ) : (
                        <i className="fas fa-lock"></i>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="marquee-footer text-center mt-3">
              <p className="small text-muted">
                <i className="fas fa-info-circle me-1"></i>
                Click on any course to register and get started
              </p>
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
                    <Form.Label className="form-label-gov">Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="Enter 10 Digit Phone Number"
                      className="form-control-gov"
                    />
                    {fieldErrors.phone && (
                      <small className="text-danger">
                        {fieldErrors.phone}
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
                  <Button type="submit" className="text-center btn-gov-primary">
                    <span>Login</span>
                  </Button>
                </div>
              </Form>

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

    
    </div>
  );
};

export default Login;