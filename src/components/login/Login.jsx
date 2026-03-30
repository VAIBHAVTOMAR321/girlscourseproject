import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Container, Row, Col, Form, Button, Badge, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../assets/css/login.css";
import Logo from "../../assets/brainrock_logo.png";
import Footer from "../footer/Footer";
import NavBar from "../navbar/NavBar";
import BannerImg from "../../assets/image.png";

// Constants
const API_BASE_URL = "https://brjobsedu.com/girls_course/girls_course_backend/api";
const COURSE_ICONS = ["💻", "📊", "🤖", "📱", "☁️", "🔒", "📲", "⛓️", "🎨", "⚙️"];
const COURSE_COLORS = ["#4285F4", "#34A853", "#EA4335", "#FBBC05", "#6C63FF", "#00ACC1", "#FF6D00", "#7B1FA2", "#00897B", "#D32F2F"];

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // State management
  const [role, setRole] = useState(location.state?.role || "admin");
  const [courseType, setCourseType] = useState("paid");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    email_or_phone: "",
    phone: "",
    aadhaar_no: "",
    password: "",
  });

  // Fetch courses with useCallback for optimization
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/course-items/`);
      
      if (response.data?.success && response.data?.data) {
        const processedCourses = response.data.data.map((course, index) => ({
          id: course.id,
          name: course.course_name,
          course_id: course.course_id,
          status: "active",
          enrolled: Math.floor(Math.random() * 500) + 100,
          icon: COURSE_ICONS[index % COURSE_ICONS.length],
          color: COURSE_COLORS[index % COURSE_COLORS.length],
          type: course.course_status,
          price: parseFloat(course.price) || 0,
          description: course.description || "",
          duration: course.duration || "",
        }));
        setCourses(processedCourses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setErrorMessage("Failed to load courses. Please try again later.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Memoize filtered courses for performance
  const filteredCourses = useMemo(() => {
    return courses.filter(course => course.type === courseType);
  }, [courses, courseType]);

  // Handle form input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  }, [fieldErrors]);

  // Validate form fields
  const validateForm = useCallback(() => {
    const errors = {};

    if (role === "admin") {
      if (!formData.email_or_phone.trim()) {
        errors.email_or_phone = "Email or Phone is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_or_phone) && !/^\d{10}$/.test(formData.email_or_phone)) {
        errors.email_or_phone = "Please enter a valid email or 10-digit phone number";
      }
    }

    if (role === "student") {
      if (!formData.phone.trim()) {
        errors.phone = "Phone number is required";
      } else if (!/^\d{10}$/.test(formData.phone.trim())) {
        errors.phone = "Phone number must be exactly 10 digits";
      }
    }

    if (role === "student-unpaid") {
      if (!formData.aadhaar_no.trim()) {
        errors.aadhaar_no = "Aadhaar number is required";
      } else if (!/^\d{12}$/.test(formData.aadhaar_no.trim())) {
        errors.aadhaar_no = "Aadhaar number must be exactly 12 digits";
      }
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [role, formData]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting || !validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage("");

    const payload = {
      role,
      ...(role === "admin" && { email_or_phone: formData.email_or_phone }),
      ...(role === "student" && { phone: formData.phone }),
      ...(role === "student-unpaid" && { aadhaar_no: formData.aadhaar_no }),
      password: formData.password,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/login/`, payload);

      if (response.data?.error || response.data?.detail) {
        setErrorMessage(response.data.error || response.data.detail);
        return;
      }

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberedRole', role);
      }

      login(response.data);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
      successMessage.style.zIndex = '9999';
      successMessage.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        Login Successful! Redirecting...
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        successMessage.remove();
        const dashboardRoute = response.data.role === "admin" ? "/AdminDashboard" : "/UserDashboard";
        navigate(dashboardRoute);
      }, 1500);

    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.detail || "Login Failed. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle course click
  const handleCourseClick = useCallback((course) => {
    if (course.type === "paid") {
      window.open("https://brainrock.in/Courses", "_blank");
    } else {
      navigate("/Registration", { 
        state: { 
          courseName: course.name,
          courseId: course.course_id || course.id,
          courseType: course.type,
          fromCourse: true 
        } 
      });
    }
  }, [navigate]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Render course card
  const renderCourseCard = (course, index) => (
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
            bg={course.type === "paid" ? "success" : "primary"} 
            className="me-2"
          >
            {course.type === "paid" ? "Paid" : ""}
          </Badge>
          <span className="enrolled-count">
            <i className="fas fa-users"></i> {course.enrolled} enrolled
          </span>
        </div>
        {course.type === "paid" && (
          <div className="course-price mt-2">
            <span className="price-label">Price:</span>
            <span className="price-value">{formatPrice(course.price)}</span>
          </div>
        )}
        {course.duration && (
          <div className="course-duration mt-1">
            <small className="text-muted">
              <i className="fas fa-clock me-1"></i>
              {course.duration}
            </small>
          </div>
        )}
      </div>
      <div className="course-action" style={{ color: course.color }}>
        <i className="fas fa-arrow-right"></i>
      </div>
    </div>
  );

  // Render loading skeleton
  const renderLoadingSkeleton = () => {
    const count = courseType === "unpaid" ? 3 : 6;
    return Array.from({ length: count }).map((_, index) => (
      <div
        key={`loading-${index}`}
        className="course-card disabled"
        style={{
          background: "#f5f5f5",
          borderLeft: "4px solid #ddd"
        }}
      >
        <div className="course-icon" style={{ color: "#ddd" }}>
          <Spinner animation="border" size="sm" />
        </div>
        <div className="course-info">
          <h5 className="course-name">Loading...</h5>
          <div className="course-meta">
            <Badge bg="secondary" className="me-2">
              Loading
            </Badge>
            <span className="enrolled-count">
              <i className="fas fa-users"></i> --
            </span>
          </div>
        </div>
        <div className="course-action" style={{ color: "#a0aec0" }}>
          <i className="fas fa-spinner fa-spin"></i>
        </div>
      </div>
    ));
  };

  return (
    <div className="gov-portal-bg">
      <NavBar />
      
      <Container className="mt-5 main-content-wrapper">
        <Row className="align-items-center shadow rounded bg-white official-card">
          {/* <h1 className="text-center">National Education Portal</h1> */}
          
          {/* Courses Section */}
        <Col lg={6} md={6} sm={12} className="course-marquee-container">
  <div className="course-marquee-header">
    <h3 className="text-center mb-3">Available Courses</h3>
    <div className="header-underline mx-auto"></div>
    
    {/* Course Type Tabs */}
    <div className="course-tabs mb-4">
      <div 
        className={`course-tab ${courseType === "paid" ? "active" : ""}`}
        onClick={() => setCourseType("paid")}
      >
        Paid Courses
      </div>
      <div 
        className={`course-tab ${courseType === "unpaid" ? "active" : ""}`}
        onClick={() => setCourseType("unpaid")}
      >
        UnPaid Courses
      </div>
    </div>
  </div>
  
  {/* Courses Grid */}
  <div className={`course-grid ${courseType === "unpaid" ? "banner-layout" : "two-column"}`}>
    {loading ? (
      renderLoadingSkeleton()
    ) : filteredCourses.length > 0 ? (
      courseType === "unpaid" ? (
        // Unpaid courses with banner image on left and courses on right
        <div className="unpaid-banner-layout">
          {/* Left side - Banner Image */}
          <div className="banner-image-section">
            <div className="banner-container">
              <img  src={BannerImg} alt="banner"
                
              />
              <div className="banner-overlay">
                <div className="banner-content">
                 
                  <div className="banner-stats">
                    <div className="stat-item">
                      <i className="fas fa-book"></i>
                    </div>
                    <div className="stat-item">
                      <i className="fas fa-users"></i>
                     
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Courses List */}
          <div className="courses-list-section">
           
            
            <div className="courses-list-container">
              {filteredCourses.map((course, index) => (
                <div
                  key={`unpaid-${course.id}-${index}`}
                  className={`unpaid-list-item ${course.status === "disabled" ? "disabled" : ""}`}
                  onClick={() => handleCourseClick(course)}
                  style={{
                    background: course.status === "active" 
                      ? `linear-gradient(135deg, ${course.color}08 0%, transparent 100%)` 
                      : "#f5f5f5",
                    borderLeft: `3px solid ${course.status === "active" ? course.color : "#ddd"}`
                  }}
                >
                  <div className="list-item-content">
                    {/* <div className="course-icon-small" style={{ color: course.color }}>
                      {course.icon}
                    </div> */}
                    <div className="course-details">
                      <h6 className="course-title">{course.name}</h6>
                      <div className="course-meta-info">
                        <span className="enrolled-info">
                          <i className="fas fa-users"></i> {course.enrolled}
                        </span>
                        {course.duration && (
                          <span className="duration-info">
                            <i className="fas fa-clock"></i> {course.duration}
                          </span>
                        )}
                        <Badge bg="primary" className="free-badge">
                          
                        </Badge>
                      </div>
                    </div>
                    <div className="course-action-arrow">
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Paid courses - original card layout
        filteredCourses.map(renderCourseCard)
      )
    ) : (
      <div className="course-card disabled" style={{ width: "100%" }}>
        <div className="course-info">
          <h5 className="course-name text-center">
            No {courseType === "paid" ? "paid" : ""} courses available
          </h5>
          <p className="text-center small text-muted">
            Please check back later for available courses
          </p>
        </div>
      </div>
    )}
  </div>

  <div className="marquee-footer text-center mt-3">
    <p className="small text-muted">
      <i className="fas fa-info-circle me-1"></i>
      Click on any course to register and get started
    </p>
  </div>
</Col>

          {/* Login Section */}
          <Col lg={6} md={6} sm={12}>
            <div className="p-4">
              <div className="section-header">
                <h2 className="text-center mb-4">
                  {role === "admin" ? "Admin Login" : 
                   role === "student" ? "Student Login" : "Free Student Login"}
                </h2>
                <div className="header-underline"></div>
              </div>

              {/* Role Selection */}
              <Form.Group className="mb-4">
                <Form.Label className="mb-3 form-label-gov">Select User Type</Form.Label>
                <div className="d-flex justify-content-around flex-wrap gap-2">
                  {[
                    { value: "admin", label: "Administrator" },
                    { value: "student", label: "Student (Paid)" },
                    { value: "student-unpaid", label: "Student (Free)" }
                  ].map(({ value, label }) => (
                    <div 
                      key={value}
                      className={`gov-role-option ${role === value ? "selected" : ""}`}
                      onClick={() => setRole(value)}
                    >
                      <div className="gov-radio-button">
                        <div className={`gov-radio-inner ${role === value ? "checked" : ""}`}></div>
                      </div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </Form.Group>

              <Form onSubmit={handleSubmit}>
                {/* Dynamic form fields based on role */}
                {role === "admin" && (
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-gov">Email or Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="email_or_phone"
                      value={formData.email_or_phone}
                      onChange={handleChange}
                      placeholder="Enter email or phone"
                      className="form-control-gov"
                      isInvalid={!!fieldErrors.email_or_phone}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.email_or_phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}

                {role === "student" && (
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-gov">Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="Enter 10-digit phone number"
                      className="form-control-gov"
                      isInvalid={!!fieldErrors.phone}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}

                {role === "student-unpaid" && (
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-gov">Aadhaar Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="aadhaar_no"
                      value={formData.aadhaar_no}
                      onChange={handleChange}
                      maxLength={12}
                      placeholder="Enter 12-digit Aadhaar number"
                      className="form-control-gov"
                      isInvalid={!!fieldErrors.aadhaar_no}
                    />
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.aadhaar_no}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}

                {/* Password Field */}
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-gov">Password</Form.Label>
                  <div className="password-input-wrapper">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className="form-control-gov"
                      isInvalid={!!fieldErrors.password}
                    />
                    <Button
                      variant="link"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas fa-${showPassword ? "eye-slash" : "eye"}`}></i>
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      {fieldErrors.password}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                {/* Remember Me */}
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Remember me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="form-check-gov"
                  />
                </Form.Group>
                
                {/* Error Message */}
                {errorMessage && (
                  <Alert variant="danger" className="error-box-gov">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {errorMessage}
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="text-center">
                  <Button 
                    type="submit" 
                    className="btn-gov-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        <span className="ms-2">Logging in...</span>
                      </>
                    ) : (
                      <span>Login</span>
                    )}
                  </Button>
                </div>

                {/* Register Link */}
                {(courseType === "unpaid" || role === "student-unpaid") && (
                  <div className="text-center mt-3">
                    <p className="small">
                      Don't have an account?{" "}
                      <Link to="/Registration" className="register-link">
                        Register here
                      </Link>
                    </p>
                  </div>
                )}
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
      </Container>

    
    </div>
  );
};

export default Login;