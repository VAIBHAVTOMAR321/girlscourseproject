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

    // 🔹 Phone Live Validation
    if (name === "phone") {
      const phoneRegex = /^[0-9]{0,10}$/; // allow typing up to 10 digits

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
        setErrors((prev) => ({
          ...prev,
          phone: "",
        }));
      }
    }

    // 🔹 Password length validation
    if (name === "password") {
      if (value.length < 6) {
        setErrors((prev) => ({
          ...prev,
          password: "Password must be at least 6 characters",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          password: "",
        }));
      }
    }

    // 🔹 Confirm password validation
    if (name === "confirm_password") {
      if (value !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          confirm_password: "Passwords do not match",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          confirm_password: "",
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(
        "https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/",
        formData,
      );
      console.log("Success:", response.data);
      alert("Registration Successful");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Registration failed!");
    }
  };

  return (
    <Container className="mt-5">
      <Row className="align-items-center p-4 shadow rounded bg-white">
        {/* LEFT SIDE IMAGE */}
        <Col lg={6} md={6} sm={12} className="text-center">
          <img
            src={regBanner}
            alt="Registration"
            className="img-fluid rounded"
          />
        </Col>

        {/* RIGHT SIDE FORM */}
        <Col lg={6} md={6} sm={12}>
          <div className="p-4">
            <h2 className="text-center mb-4">HealthHub Registration</h2>

            <Form onSubmit={handleSubmit} encType="multipart/form-data">

  {/* Full Name */}
  <Form.Group className="mb-3">
    <Form.Label>Full Name</Form.Label>
    <Form.Control
      type="text"
      name="full_name"
      value={formData.full_name}
      onChange={handleChange}
      required
    />
  </Form.Group>

  {/* Email */}
  <Form.Group className="mb-3">
    <Form.Label>Email</Form.Label>
    <Form.Control
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      required
    />
  </Form.Group>

  {/* Phone */}
  <Form.Group className="mb-3">
    <Form.Label>Phone</Form.Label>
    <Form.Control
      type="text"
      name="phone"
      value={formData.phone}
      onChange={handleChange}
      required
    />
    {errors.phone && (
      <small className="text-danger">{errors.phone}</small>
    )}
  </Form.Group>

  {/* Aadhaar Number */}
  <Form.Group className="mb-3">
    <Form.Label>Aadhaar Number</Form.Label>
    <Form.Control
      type="text"
      name="aadhaar_no"
      value={formData.aadhaar_no}
      onChange={handleChange}
      required
    />
  </Form.Group>

  {/* Aadhaar File Upload */}
  <Form.Group className="mb-3">
    <Form.Label>Aadhaar Card File</Form.Label>
    <Form.Control
      type="file"
      name="adharcard_file"
      accept=".pdf,.jpg,.jpeg,.png"
      onChange={(e) =>
        setFormData({
          ...formData,
          adharcard_file: e.target.files[0],
        })
      }
      required
    />
  </Form.Group>

  {/* Associate Wings */}
  <Form.Group className="mb-3">
    <Form.Label>Associate Wings</Form.Label>
    <Form.Control
      type="text"
      name="associate_wings"
      value={formData.associate_wings}
      onChange={handleChange}
      required
    />
  </Form.Group>

  {/* District */}
  <Form.Group className="mb-3">
    <Form.Label>District</Form.Label>
    <Form.Control
      type="text"
      name="district"
      value={formData.district}
      onChange={handleChange}
      required
    />
  </Form.Group>

  {/* Block */}
  <Form.Group className="mb-3">
    <Form.Label>Block</Form.Label>
    <Form.Control
      type="text"
      name="block"
      value={formData.block}
      onChange={handleChange}
      required
    />
  </Form.Group>

  {/* State */}
  <Form.Group className="mb-3">
    <Form.Label>State</Form.Label>
    <Form.Control
      type="text"
      name="state"
      value={formData.state}
      onChange={handleChange}
      required
    />
  </Form.Group>

  {/* Password Row */}
  <Row className="mb-3">
    <Col md={6}>
      <Form.Group>
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </Form.Group>
    </Col>

    <Col md={6}>
      <Form.Group>
        <Form.Label>Confirm Password</Form.Label>
        <Form.Control
          type="password"
          name="confirm_password"
          value={formData.confirm_password}
          onChange={handleChange}
          required
        />
      </Form.Group>
   
                </Col>
              </Row>

              <Button
                type="submit"
                className="w-100 mb-3"
                disabled={
                  errors.phone || errors.password || errors.confirm_password
                }
              >
                Register
              </Button>

              <div className="text-center">
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
