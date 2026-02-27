import React, { useState } from "react";
import { Container, Button, Col, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../../custom/style.css";
import regBanner from "../../assets/reg-banner.jpg";
import axios from "axios";

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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // ✅ Clear required error when user starts typing
    if (value.trim() !== "") {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Phone validation
    if (name === "phone") {
      const phoneRegex = /^[0-9]{0,10}$/;

      if (!phoneRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          phone: "Only numbers allowed (max 10 digits)",
        }));
      } else if (value.length !== 10) {
        setErrors((prev) => ({
          ...prev,
          phone: "Phone must be exactly 10 digits",
        }));
      } else {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }

    // Password validation
    if (name === "password") {
      if (value.length < 6) {
        setErrors((prev) => ({
          ...prev,
          password: "Password must be at least 6 characters",
        }));
      } else {
        setErrors((prev) => ({ ...prev, password: "" }));
      }

      // Also re-check confirm password
      if (formData.confirm_password && value !== formData.confirm_password) {
        setErrors((prev) => ({
          ...prev,
          confirm_password: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirm_password: "" }));
      }
    }

    // Confirm password validation
    if (name === "confirm_password") {
      if (value !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          confirm_password: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirm_password: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    // Required validation
    Object.keys(formData).forEach((key) => {
      if (!formData[key] || formData[key].toString().trim() === "") {
        newErrors[key] = "This field is required";
      }
    });

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      await axios.post(
        "https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      alert("Registration Successful");
    } catch (error) {
      alert("Registration failed!");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="align-items-center p-4 shadow rounded bg-white">
        <Col lg={6} md={6} sm={12} className="text-center">
          <img
            src={regBanner}
            alt="Registration"
            className="img-fluid rounded"
          />
        </Col>

        <Col lg={6} md={6} sm={12}>
          <div className="p-4">
            <h2 className="text-center mb-4">Course Registration</h2>

            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="full_name"
                      placeholder="Enter full name"
                      value={formData.full_name}
                      onChange={handleChange}
                    />
                    <small className="text-danger">
                      {fieldErrors.full_name}
                    </small>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Aadhaar Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="aadhaar_no"
                      placeholder="Enter 12 digit Aadhaar"
                      value={formData.aadhaar_no}
                      onChange={handleChange}
                    />
                    <small className="text-danger">
                      {fieldErrors.aadhaar_no}
                    </small>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      placeholder="Enter 10 digit phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    <small className="text-danger">
                      {fieldErrors.phone || errors.phone}
                    </small>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Optional"
                      value={formData.email}
                      onChange={handleChange}
                    />
                   
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Aadhaar Card File</Form.Label>
                <Form.Control
                  type="file"
                  name="adharcard_file"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      adharcard_file: e.target.files[0],
                    })
                  }
                />
                <small className="text-danger">
                  {fieldErrors.adharcard_file}
                </small>
              </Form.Group>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Associate Wings</Form.Label>
                    <Form.Control
                      type="text"
                      name="associate_wings"
                      placeholder="Enter associate wings"
                      value={formData.associate_wings}
                      onChange={handleChange}
                    />
                    <small className="text-danger">
                      {fieldErrors.associate_wings}
                    </small>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>District</Form.Label>
                    <Form.Control
                      type="text"
                      name="district"
                      placeholder="Enter district"
                      value={formData.district}
                      onChange={handleChange}
                    />
                    <small className="text-danger">
                      {fieldErrors.district}
                    </small>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Block</Form.Label>
                    <Form.Control
                      type="text"
                      name="block"
                      placeholder="Enter block"
                      value={formData.block}
                      onChange={handleChange}
                    />
                    <small className="text-danger">{fieldErrors.block}</small>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                    <small className="text-danger">{fieldErrors.state}</small>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <small className="text-danger">
                      {fieldErrors.password || errors.password}
                    </small>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirm_password"
                      placeholder="Confirm password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                    />
                    <small className="text-danger">
                      {fieldErrors.confirm_password || errors.confirm_password}
                    </small>
                  </Form.Group>
                </Col>
              </Row>

              <Button type="submit" className="w-100">
                Register
              </Button>

              <div className="text-center mt-3">
                <small>
                  Already have an account? <Link to="/login">Login</Link>
                </small>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Registration;
