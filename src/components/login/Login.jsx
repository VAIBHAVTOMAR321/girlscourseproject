import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import axios from "axios";
import regBanner from "../../assets/reg-banner.jpg";
import { Link } from "react-router-dom";
import "../../custom/style.css";
const Login = () => {
  const [role, setRole] = useState("admin");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // ✅ ADD THIS

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

    alert("Login Successful");
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Login Failed";

    setErrorMessage(message);
  }
};

  return (
    <Container className="mt-5">
      <Row className="align-items-center p-4 shadow rounded bg-white">
        <Col lg={6} md={6} sm={12} className="text-center">
          <img src={regBanner} alt="Login" className="img-fluid rounded" />
        </Col>

        <Col lg={6} md={6} sm={12}>
          <div className="p-4">
            <h2 className="text-center mb-4">Course Login</h2>

            {/* Role Selection */}
            <Form.Group className="mb-3">
              <Form.Label>Login As</Form.Label>
              <Form.Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="student">Student</option>
              </Form.Select>
            </Form.Group>

            <Form onSubmit={handleSubmit}>
              {/* Admin Field */}
              {role === "admin" && (
                <Form.Group className="mb-3">
                  <Form.Label>Email or Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="email_or_phone"
                    value={formData.email_or_phone}
                    onChange={handleChange}
                    placeholder="Enter Email Or Phone"
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
                  <Form.Label>Aadhaar Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="aadhaar_no"
                    value={formData.aadhaar_no}
                    onChange={handleChange}
                    maxLength={12}
                    placeholder="Enter Aadhaar Number"
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
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                />
                {fieldErrors.password && (
                  <small className="text-danger">{fieldErrors.password}</small>
                )}
              </Form.Group>
              {errorMessage && (
                <div className="alert alert-danger error-box">
                  {errorMessage}
                </div>
              )}
              <Button type="submit" className="w-100">
                Login
              </Button>
            </Form>

            <div className="text-center mt-3">
              <small>
                Don't have an account? <Link to="/register">Register</Link>
              </small>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
