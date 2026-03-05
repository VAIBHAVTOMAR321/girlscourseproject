import React, { useState, useEffect } from "react";
import { Container, Button, Col, Form, Row, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../custom/style.css";
import regBanner from "../../assets/reg-banner.jpg";
import axios from "axios";
import Logo from "../../assets/brainrock_logo.png";

const Registration = () => {
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
    const requiredFields = ['full_name', 'aadhaar_no', 'adharcard_file', 'associate_wings', 
                          'phone', 'district', 'block', 'state', 'password', 'confirm_password'];

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

      const response = await axios.post(
        "https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/",
        data,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Accept": "application/json"
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      if (response.data.status) {
        setRegistrationSuccess(true);
      } else {
        setApiError(response.data.message || "Registration failed. Please try again.");
      }

    } catch (error) {
      let errorMessage = "An unknown error occurred.";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        
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
      
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="gov-portal-bg">
      {/* Fixed Header with Flexbox */}
      <header className="official-header-fixed">
        <Container fluid>
          <div className="official-header-content">
            <div className="header-left">
              <div className="official-seal">
                <div className="seal-inner">
                  <img src={Logo} alt="Logo"></img>
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
              <img src={regBanner} alt="Registration" className="img-fluid rounded" />
              <div className="banner-overlay">
                <h3>Student Registration</h3>
                <p>Create Your Account</p>
              </div>
            </div>
          </Col>

          <Col lg={6} md={6} sm={12}>
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

              {/* Success Alert */}
              {registrationSuccess && (
                <Alert variant="success" onClose={handleSuccessAlertClose} dismissible>
                  <Alert.Heading>Registration Successful!</Alert.Heading>
                  <p>Your details have been submitted successfully. You can now log in.</p>
                </Alert>
              )}

              <Form onSubmit={handleSubmit} noValidate>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-gov">Full Name *</Form.Label>
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
                      <Form.Label className="form-label-gov">Aadhaar Number *</Form.Label>
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
                      <Form.Label className="form-label-gov">Phone *</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        placeholder="Enter 10 digit phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-control-gov"
                        isInvalid={!!fieldErrors.phone || !!errors.phone}
                        maxLength={10}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.phone || errors.phone}
                      </Form.Control.Feedback>
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
                  <Form.Label className="form-label-gov">Aadhaar Card File *</Form.Label>
                  <Form.Control
                    type="file"
                    name="adharcard_file"
                    onChange={handleChange}
                    className="form-control-gov"
                    isInvalid={!!fieldErrors.adharcard_file}
                    accept="image/*,.pdf"
                    required
                  />
                  <Form.Text className="text-muted">
                    Upload JPG, PNG or PDF (Max 5MB)
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.adharcard_file}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-gov">Associate Wings *</Form.Label>
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
                      <Form.Label className="form-label-gov">District *</Form.Label>
                      <Form.Control
                        type="text"
                        name="district"
                        placeholder="Enter district name"
                        value={formData.district}
                        onChange={handleChange}
                        className="form-control-gov"
                        isInvalid={!!fieldErrors.district}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {fieldErrors.district}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-gov">Block *</Form.Label>
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
                      <Form.Label className="form-label-gov">State *</Form.Label>
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
                      <Form.Label className="form-label-gov">Password *</Form.Label>
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
                      <Form.Label className="form-label-gov">Confirm Password *</Form.Label>
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

              <div className="text-center mt-4">
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
        
        .seal-inner img {
          width: 40px;
          height: 40px;
          object-fit: contain;
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
          padding-top: 38px;
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
        
        .btn-gov-primary {
          background: linear-gradient(135deg, #1a3a5f 0%, #2c5282 100%);
          border: none;
          padding: 12px 40px;
          font-weight: 600;
          border-radius: 4px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
          
          .seal-inner img {
            width: 30px;
            height: 30px;
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

export default Registration;