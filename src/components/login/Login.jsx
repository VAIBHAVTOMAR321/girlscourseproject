import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Badge } from "react-bootstrap";
import axios from "axios";
import regBanner from "../../assets/reg-banner.jpg";
import { Link, useNavigate } from "react-router-dom";
import "../../custom/style.css";
import { useAuth } from "../../contexts/AuthContext";
import "../../assets/css/login.css";
import Logo from "../../assets/brainrock_logo.png";
import Footer from "../footer/Footer";
import NavBar from "../navbar/NavBar";

const Login = () => {
  const [role, setRole] = useState("admin");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [courseType, setCourseType] = useState("paid"); // Changed to lowercase to match API
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email_or_phone: "",
    phone: "",
    aadhaar_no: "",
    password: "",
  });

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("https://brjobsedu.com/girls_course/girls_course_backend/api/course-items/");
        if (response.data.success && response.data.data) {
          // Process fetched courses without static type assignment
          const processedCourses = response.data.data.map((course, index) => ({
            id: course.id,
            name: course.course_name,
            course_id: course.course_id,
            status: "active", // Set all courses to active
           // Random enrolled count
            icon: ["💻", "📊", "🤖", "📱", "☁️", "🔒", "📲", "⛓️", "🎨", "⚙️"][index % 10], // Cycle through icons
            color: ["#4285F4", "#34A853", "#EA4335", "#FBBC05", "#6C63FF", "#00ACC1", "#FF6D00", "#7B1FA2", "#00897B", "#D32F2F"][index % 10], // Cycle through colors
            type: course.course_status, // Use API field directly
            price: parseFloat(course.price) || 0 // Convert price string to number
          }));
          setCourses(processedCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]); // Set to empty array if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on selected tab
  const filteredCourses = courses.filter(course => course.type === courseType);

  // Duplicate filtered courses array multiple times for seamless loop
  const duplicatedCourses = [...filteredCourses, ...filteredCourses, ...filteredCourses, ...filteredCourses];

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

    if (role === "student-unpaid") {
      if (!formData.aadhaar_no.trim()) {
        errors.aadhaar_no = "Aadhaar number is required";
      } else if (!/^\d{12}$/.test(formData.aadhaar_no.trim())) {
        errors.aadhaar_no = "Aadhaar number must be exactly 12 digits";
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
            role: "admin",
            email_or_phone: formData.email_or_phone,
            password: formData.password,
          }
        : role === "student"
        ? {
            role: "student",
            phone: formData.phone,
            password: formData.password,
          }
        : role === "student-unpaid"
        ? {
            role: "student-unpaid",
            aadhaar_no: formData.aadhaar_no,
            password: formData.password,
          }
        : {};

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

  const handleCourseClick = (course) => {
    if (course.type === "paid") {
      // Redirect to external paid courses page
      window.open("https://brainrock.in/Courses", "_blank");
    } else {
      // Navigate to registration page with course information for unpaid courses
      navigate("/Registration", { 
        state: { 
          courseName: course.name,
          courseId: course.course_id || course.id,
          courseType: course.type,
          fromCourse: true 
        } 
      });
    }
  };

  // Format price with currency symbol
  const formatPrice = (price) => {
    return `₹${price.toFixed(2)}`;
  };

  return (
    <div className="gov-portal-bg">
      {/* Main Content with Padding-top to account for fixed header */}
      <Container className="mt-5 main-content-wrapper">
       
        <Row className="align-items-center p-4 shadow rounded bg-white official-card">
           <h1>National Education</h1>
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
                  Unpaid Courses
                </div>
              </div>
            </div>
            
            {/* Courses in grid layout - paid in 2 columns, unpaid in 1 column */}
            <div className={`course-grid ${courseType === "unpaid" ? "single-column" : "two-column"}`}>
              {loading ? (
                // Loading skeleton for grid
                Array.from({ length: courseType === "unpaid" ? 3 : 6 }).map((_, index) => (
                  <div
                    key={`loading-${index}`}
                    className="course-card disabled"
                    style={{
                      background: "#f5f5f5",
                      borderLeft: "4px solid #ddd"
                    }}
                  >
                    <div className="course-icon" style={{ color: "#ddd" }}>
                      ⏳
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
                ))
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course, index) => (
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
                          {course.type === "paid" ? "Paid" : "Free"}
                        </Badge>
                        <span className="enrolled-count">
                          <i className="fas fa-users"></i> {course.enrolled}
                        </span>
                      </div>
                      {course.type === "paid" && (
                        <div className="course-price mt-2">
                          <span className="price-label">Price:</span>
                          <span className="price-value">{formatPrice(course.price)}</span>
                        </div>
                      )}
                    </div>
                    <div className="course-action" style={{ color: course.color }}>
                      <i className="fas fa-arrow-right"></i>
                    </div>
                  </div>
                ))
              ) : (
                // No courses message for grid
                <div className="course-card disabled" style={{ width: "100%" }}>
                  <div className="course-info">
                    <h5 className="course-name text-center">
                      {courseType === "paid" ? "No paid courses available" : "No unpaid courses available"}
                    </h5>
                    <p className="text-center small text-muted">
                      Please check back later for available {courseType === "paid" ? "paid" : "unpaid"} courses
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

          <Col lg={6} md={6} sm={12}>
            <div className="p-4">
               {/* Dynamic heading based on role */}
              <div className="section-header">
                <h2 className="text-center mb-4">
                  {role === "admin" ? "Admin Login" : 
                   role === "student" ? "Student (Paid) Login" : "Student (Unpaid) Login"}
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
                    <span>Student (Paid)</span>
                  </div>
                  <div 
                    className={`gov-role-option ${role === "student-unpaid" ? "selected" : ""}`}
                    onClick={() => setRole("student-unpaid")}
                  >
                    <div className="gov-radio-button">
                      <div className={`gov-radio-inner ${role === "student-unpaid" ? "checked" : ""}`}></div>
                    </div>
                    <span>Student (Unpaid)</span>
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

                {/* Student (Paid) Field */}
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

                {/* Student (Unpaid) Field */}
                {role === "student-unpaid" && (
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
                  <Button type="submit" className="text-center btn-gov-primary">
                    <span>Login</span>
                  </Button>
                </div>

                {/* Register Link for Unpaid Courses or Unpaid Student Role */}
                {(courseType === "unpaid" || role === "student-unpaid") && (
                  <div className="text-center mt-3">
                    <p className="small">
                      Don't have an account?{" "}
                      <Link to="/Registration" className="text-primary">
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