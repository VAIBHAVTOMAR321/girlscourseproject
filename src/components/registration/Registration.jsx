import React, { useState, useEffect } from "react";
import { Container, Button, Col, Form, Row, Alert, Spinner, Badge } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../custom/style.css";
import regBanner from "../../assets/reg-banner.jpg";
import BannerImg from "../../assets/image.png";
import axios from "axios";
import Logo from "../../assets/brainrock_logo.png";
import "../../assets/css/registration.css"
import "../../assets/css/login.css"
import Footer from "../footer/Footer";
import { renderContentWithLineBreaks } from "../../utils/contentRenderer";


const Registration = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get course information from state and normalize to lowercase
  const { courseName, courseId, courseType: initialCourseTypeRaw, fromCourse } = location.state || {};
  const initialCourseType = initialCourseTypeRaw ? initialCourseTypeRaw.toLowerCase() : null;
  // Static list of districts
  const staticDistricts = [
    "Dehradun",
    "Haridwar",
    "Udham Singh Nagar",
    "Nainital",
    "Almora",
    "Pauri Garhwal",
    "Tehri Garhwal",
    "Chamoli",
    "Rudraprayag",
    "Uttarkashi",
    "Pithoragarh",
    "Bageshwar",
    "Champawat"
  ];

  // Fetch courses from API
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

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
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const [courseType, setCourseType] = useState(fromCourse && initialCourseType ? initialCourseType : "paid"); // Changed to lowercase to match API
  const [hoveredCourse, setHoveredCourse] = useState(null);

  // Filter courses based on selected tab
  const filteredCourses = courses.filter(course => course.type === courseType);

  // Duplicate filtered courses array multiple times for seamless loop
  const duplicatedCourses = [...filteredCourses, ...filteredCourses, ...filteredCourses, ...filteredCourses];

  const [formData, setFormData] = useState({
    full_name: "",
    aadhaar_no: "",
    adharcard_file: null,
    associate_wings: "",
    phone: "",
    email: "",
    district: "",
    block: "",
    state: "",
    password: "",
    confirm_password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [errors, setErrors] = useState({
    phone: "",
    password: "",
    confirm_password: "",
    aadhaar_no: "",
  });

  
  const [apiError, setApiError] = useState("");
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [isBlocksLoading, setIsBlocksLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [checkingAadhaar, setCheckingAadhaar] = useState(false);

  // Check if Aadhaar number exists
  const checkAadhaarExists = async (aadhaarNo) => {
    if (aadhaarNo.length !== 12) return;
    
    setCheckingAadhaar(true);
    
    try {
      const response = await axios.get("https://brjobsedu.com/girls_course/girls_course_backend/api/get-aadhar-list/");
      
      if (response.data && Array.isArray(response.data)) {
        const existingAadhaarNumbers = response.data;
        
        if (existingAadhaarNumbers.includes(aadhaarNo)) {
          // Aadhaar number already exists - show popup
          const userConfirmed = window.confirm(
            "This Aadhaar number is already registered. Please login to register for a new course."
          );
          
          if (userConfirmed) {
            // Navigate to login page with unpaid student role
            navigate("/login", { state: { role: "student-unpaid" }, replace: true });
          }
        }
      }
    } catch (error) {
      console.error("Error checking Aadhaar number:", error);
    } finally {
      setCheckingAadhaar(false);
    }
  };

  // Fetch blocks when district changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.district && formData.district.trim() !== "") {
        setIsBlocksLoading(true);
        axios
          .get(
            `https://brjobsedu.com/girls_course/girls_course_backend/api/district-blocks/?district=${encodeURIComponent(formData.district)}`
          )
          .then((response) => {
            if (response.data.status && response.data.data) {
              setAvailableBlocks(response.data.data.blocks || []);
              if (response.data.data.state) {
                setFormData((prev) => ({
                  ...prev,
                  state: response.data.data.state,
                }));
              }
            }
          })
          .catch((error) => {
            console.error("Error fetching blocks:", error);
            setAvailableBlocks([]);
          })
          .finally(() => {
            setIsBlocksLoading(false);
          });
      } else {
        setAvailableBlocks([]);
        setFormData((prev) => ({
          ...prev,
          state: "",
          block: "",
        }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.district]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      const file = files[0];
      // Validate file type and size
      if (file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!allowedTypes.includes(file.type)) {
          setFieldErrors(prev => ({
            ...prev,
            adharcard_file: "Please upload a valid image (JPG, PNG) or PDF file"
          }));
          return;
        }
        
        if (file.size > maxSize) {
          setFieldErrors(prev => ({
            ...prev,
            adharcard_file: "File size must be less than 5MB"
          }));
          return;
        }
      }
      
      setFormData({ ...formData, [name]: file });
      if (fieldErrors[name]) {
        setFieldErrors({ ...fieldErrors, [name]: '' });
      }
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear field-specific error when user starts typing
    if (value.trim() !== "") {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Client-side validation logic
    if (name === "phone") {
      const phoneRegex = /^[0-9]{0,10}$/;
      if (!phoneRegex.test(value)) {
        setErrors((prev) => ({ ...prev, phone: "Only numbers allowed (max 10 digits)" }));
      } else if (value.length !== 0 && value.length !== 10) {
        setErrors((prev) => ({ ...prev, phone: "Phone must be exactly 10 digits" }));
      } else {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }

     if (name === "aadhaar_no") {
       const aadhaarRegex = /^[0-9]{0,12}$/;
       if (!aadhaarRegex.test(value)) {
         setErrors((prev) => ({ ...prev, aadhaar_no: "Only numbers allowed (max 12 digits)" }));
       } else if (value.length !== 0 && value.length !== 12) {
         setErrors((prev) => ({ ...prev, aadhaar_no: "Aadhaar must be exactly 12 digits" }));
       } else {
         setErrors((prev) => ({ ...prev, aadhaar_no: "" }));
         // Check if Aadhaar number already exists when user enters 12 digits
         checkAadhaarExists(value);
       }
     }

    if (name === "password") {
      if (value.length < 6) {
        setErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters" }));
      } else {
        setErrors((prev) => ({ ...prev, password: "" }));
      }
      if (formData.confirm_password && value !== formData.confirm_password) {
        setErrors((prev) => ({ ...prev, confirm_password: "Passwords do not match" }));
      } else {
        setErrors((prev) => ({ ...prev, confirm_password: "" }));
      }
    }

    if (name === "confirm_password") {
      if (value !== formData.password) {
        setErrors((prev) => ({ ...prev, confirm_password: "Passwords do not match" }));
      } else {
        setErrors((prev) => ({ ...prev, confirm_password: "" }));
      }
    }
  };

  const validateForm = () => {
    let newErrors = {};

    // Required field validation
    const requiredFields = ['full_name', 'aadhaar_no',  'associate_wings', 
                          'district', 'block', 'state', 'password', 'confirm_password'];

    requiredFields.forEach(field => {
      if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === "")) {
        newErrors[field] = "This field is required";
      }
    });

    // Validate email if provided
    if (formData.email && formData.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Validate phone format
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    // Validate Aadhaar format
    if (formData.aadhaar_no && !/^[0-9]{12}$/.test(formData.aadhaar_no)) {
      newErrors.aadhaar_no = "Aadhaar must be exactly 12 digits";
    }

    // Validate password match
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    // Validate password length
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
// NEW: useEffect to handle redirect after successful registration

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setApiError("");
    setFieldErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object
      const data = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      // Append course information if available
      if (fromCourse && courseId && courseName) {
        data.append("course_id", courseId);
        data.append("course_name", courseName);
        data.append("course_type", initialCourseType || courseType);
      }

      console.log("Submitting registration data...");

      const response = await axios.post(
        "https://brjobsedu.com/girls_course/girls_course_backend/api/student-unpaid/",
        data,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Accept": "application/json"
          },
          timeout: 30000 // 30 second timeout
        }
      );

      console.log("Registration response:", response.data);
       
      // Check for success - handle different response formats
      if (response.data.status || response.data.success || response.data.message?.includes("success")) {
          // Show success alert popup
          alert("Registration submitted successfully!");
          // Redirect to login page with unpaid student tab
          console.log("Navigating to login page with role: student-unpaid");
          navigate("/login", { state: { role: "student-unpaid" }, replace: true });
        } else {
          // Show error alert popup
          alert(response.data.message || "Registration failed. Please try again.");
        }

    } catch (error) {
      console.error("Registration error:", error);
      
      let errorMessage = "An unknown error occurred.";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response:", error.response.data);
        
        if (error.response.data.errors) {
          // Handle field-specific validation errors
          setFieldErrors(error.response.data.errors);
          errorMessage = "Please correct the highlighted errors.";
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your internet connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message;
      }
      
       // Show error alert popup
       alert(errorMessage);
    } finally {
      setIsSubmitting(false);
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

  const handleSuccessAlertClose = () => {
    setRegistrationSuccess(false);
    setApiError("");
    // Reset form
    setFormData({
      full_name: "",
      aadhaar_no: "",
      adharcard_file: null,
      associate_wings: "",
      phone: "",
      email: "",
      district: "",
      block: "",
      state: "",
      password: "",
      confirm_password: "",
    });
    setAvailableBlocks([]);
    setFieldErrors({});
  };

  return (
    <>
    <div className="gov-portal-bg">
      {/* Main Content with Padding-top to account for fixed header */}
        <Container className="mt-5 main-content-wrapper">
         <Row className="align-items-center p-4 shadow rounded bg-white official-card">
            {/* <h1>National Education</h1> */}
          <Col lg={6} md={6} sm={12} className="course-marquee-container-box">
          
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
            
            {/* Courses in grid layout - paid in 2 columns, unpaid in banner layout */}
            <div className={`course-grid ${courseType === "unpaid" ? "banner-layout" : "two-column"}`}>
              {coursesLoading ? (
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
                courseType === "unpaid" ? (
                  // Unpaid courses with banner image on left and courses on right
                  <div className="unpaid-banner-layout">
                    {/* Left side - Banner Image */}
                    <div className="banner-image-section">
                      <div className="banner-container">
                        <img src={BannerImg} alt="banner" />
                        <div className="banner-overlay">
                          <div className="banner-content">
                            <div className="banner-stats">
                              <div className="stat-item">
                                <i className="fas fa-book"></i>
                                <span>{filteredCourses.length} Courses</span>
                              </div>
                              <div className="stat-item">
                                <i className="fas fa-users"></i>
                                <span>{filteredCourses.reduce((sum, course) => sum + (course.enrolled || 0), 0)} Students</span>
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
                                <h6 className="course-title">{renderContentWithLineBreaks(course.name)}</h6>
                                <div className="course-meta-info">
                                  <span className="enrolled-info">
                                    <i className="fas fa-users"></i> {course.enrolled}
                                  </span>
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
                  // Paid courses - card layout
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
                        <h5 className="course-name">{renderContentWithLineBreaks(course.name)}</h5>
                        <div className="course-meta">
                          <Badge 
                            bg={course.type === "paid" ? "success" : "primary"} 
                            className="me-2"
                          >
                            {course.type === "paid" ? "Paid" : ""}
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
                )
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

          <Col lg={6} md={6} sm={12} className="mb-3">
            <div className="p-4">
              <div className="section-header">
                <h2 className="text-center mb-4">Course Registration</h2>
                <div className="header-underline"></div>
              </div>

              {/* General API Error Alert */}
              {apiError && (
                <Alert variant="danger" onClose={() => setApiError("")} dismissible className="error-box-gov">
                  {apiError}
                </Alert>
              )}

 

              <Form onSubmit={handleSubmit} noValidate>
               
              

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-gov">Full Name <span className="red-color">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="full_name"
                        placeholder="Enter full name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="form-control-gov"
                        isInvalid={!!fieldErrors.full_name}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.full_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-gov">Aadhaar Number <span className="red-color">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="aadhaar_no"
                        placeholder="Enter 12 digit Aadhaar"
                        value={formData.aadhaar_no}
                        onChange={handleChange}
                        className="form-control-gov"
                        isInvalid={!!fieldErrors.aadhaar_no || !!errors.aadhaar_no}
                        maxLength={12}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.aadhaar_no || errors.aadhaar_no}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-gov">Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        placeholder="Enter 10 digit phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-control-gov"
                       
                        maxLength={10}
                        required
                      />
                     
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-gov">Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Optional"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control-gov"
                        isInvalid={!!fieldErrors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.email}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="form-label-gov">Aadhaar Card File </Form.Label>
                  <Form.Control
                    type="file"
                    name="adharcard_file"
                    onChange={handleChange}
                    className="form-control-gov"
                    accept="image/*,.pdf"
                    required
                  />
                  <Form.Text className="file-size">
                    Upload JPG, PNG or PDF (Max 5MB)
                  </Form.Text>
                 
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-gov">Associate Wings<span className="red-color">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="associate_wings"
                        placeholder="Enter associate wings"
                        value={formData.associate_wings}
                        onChange={handleChange}
                        className="form-control-gov"
                        isInvalid={!!fieldErrors.associate_wings}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.associate_wings}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-gov">District <span className="red-color">*</span></Form.Label>
                      <Form.Control
                        as="select"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="form-control-gov"
                        isInvalid={!!fieldErrors.district}
                        required
                      >
                        <option value="">Select district</option>
                        {staticDistricts.map((district, index) => (
                          <option key={index} value={district}>
                            {district}
                          </option>
                        ))}
                      </Form.Control>
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.district}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-gov">Block <span className="red-color">*</span></Form.Label>
                      <Form.Control
                        as="select"
                        name="block"
                        value={formData.block}
                        onChange={handleChange}
                        disabled={!availableBlocks.length || isBlocksLoading}
                        className="form-control-gov"
                        isInvalid={!!fieldErrors.block}
                        required
                      >
                        <option value="">
                          {isBlocksLoading ? "Loading..." : "Select block"}
                        </option>
                        {availableBlocks.map((block, index) => (
                          <option key={index} value={block}>
                            {block}
                          </option>
                        ))}
                      </Form.Control>
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.block}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-gov">State <span className="red-color">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        placeholder="State will be auto-filled"
                        value={formData.state}
                        onChange={handleChange}
                        className="form-control-gov"
                        readOnly
                        isInvalid={!!fieldErrors.state}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.state}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-gov">Password <span className="red-color">*</span></Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-control-gov"
                        isInvalid={!!fieldErrors.password || !!errors.password}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.password || errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-gov">Confirm Password <span className="red-color">*</span></Form.Label>
                      <Form.Control
                        type="password"
                        name="confirm_password"
                        placeholder="Confirm password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className="form-control-gov"
                        isInvalid={!!fieldErrors.confirm_password || !!errors.confirm_password}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.confirm_password || errors.confirm_password}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="text-center">
                  <Button type="submit" className="btn-gov-primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Processing...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </div>
              </Form>

              <div className="text-center account-style mt-4">
                <small className="register-text">
                  Already have an account? <Link to="/login" className="register-link">Login Here</Link>
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
        
      
      </Container>

     
    </div>
   
    </>
  );
};

export default Registration;
