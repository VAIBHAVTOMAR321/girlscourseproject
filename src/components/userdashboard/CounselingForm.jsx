import React, { useState } from 'react'
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import { FaLightbulb } from 'react-icons/fa'

const CounselingForm = ({ onSubmit, initialData = {}, showForm: propShowForm, onToggle }) => {
  const [internalShowForm, setInternalShowForm] = useState(false)
  const showForm = propShowForm !== undefined ? propShowForm : internalShowForm
  const setShowForm = (value) => {
    if (onToggle) {
      onToggle(value)
    } else {
      setInternalShowForm(value)
    }
  }
  
  const [formData, setFormData] = useState({
    student_id: initialData.student_id || '',
    full_name: initialData.full_name || '',
    aadhaar_no: initialData.aadhaar_no || '',
    associate_wings: initialData.associate_wings || '',
    phone: initialData.phone || initialData.mobile || '',
    email: initialData.email || '',
    district: initialData.district || '',
    block: initialData.block || '',
    state: initialData.state || '',
    category_consulting: initialData.category_consulting || [],
    otherCategory: initialData.otherCategory || '',
    status: 'pending' // Default status
  })
  
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field, value) => {
    if (field === 'category_consulting') {
      // For category, value should be an array
      setFormData(prev => ({
        ...prev,
        [field]: Array.isArray(value) ? value : [value]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (submitting) return // Prevent double submission

    // Validate required fields
    if (!formData.student_id) {
      alert('Please enter your student ID')
      return
    }
    
    if (!formData.full_name) {
      alert('Please enter your full name')
      return
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[6-9]\d{9}$/
    if (!formData.phone) {
      alert('Please enter your phone number')
      return
    }
    if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      alert('Please enter a valid 10-digit phone number starting with 6-9')
      return
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      alert('Please enter your email address')
      return
    }
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address')
      return
    }

    // Validate aadhaar if provided
    if (formData.aadhaar_no && !/^\d{12}$/.test(formData.aadhaar_no.replace(/\s+/g, ''))) {
      alert('Aadhaar number must be 12 digits')
      return
    }

    if (!formData.category_consulting.length) {
      alert('Please select at least one counseling category')
      return
    }

    if (formData.category_consulting.includes('other') && !formData.otherCategory.trim()) {
      alert('Please specify the other category')
      return
    }

    setSubmitting(true)

    try {
      setError('') // Clear any previous errors

      // Clean phone number (remove spaces)
      const cleanData = {
        ...formData,
        phone: formData.phone.replace(/\s+/g, ''),
        aadhaar_no: formData.aadhaar_no ? formData.aadhaar_no.replace(/\s+/g, '') : null,
        category_consulting: formData.category_consulting,
        otherCategory: formData.otherCategory.trim()
      }

      // Call the parent submit handler
      await onSubmit(cleanData)

      // Show success message and reset form
      setSubmitted(true)
      setFormData({
        student_id: '',
        full_name: '',
        aadhaar_no: '',
        associate_wings: '',
        phone: '',
        email: '',
        district: '',
        block: '',
        state: '',
        category_consulting: [],
        otherCategory: '',
        status: 'pending'
      })
      setShowForm(false)

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      setError(error.message || 'Failed to submit counseling request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Success Alert */}
      {submitted && (
        <Alert variant="success" className="mb-4">
          <strong>Success!</strong> Your counseling request has been submitted. Our team will contact you soon.
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Error!</strong> {error}
        </Alert>
      )}

      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: '10px' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">
                <FaLightbulb className="me-2 text-warning" />
                Need Counseling Support?
              </h5>
              <small className="text-muted">Get personalized guidance for your career journey</small>
            </div>
            <Button
              variant="outline-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Hide Form' : 'Get Counseling'}
            </Button>
          </div>

          {showForm && (
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Student ID *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.student_id}
                      onChange={(e) => handleChange('student_id', e.target.value)}
                      placeholder="Enter your student ID"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Full Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Aadhaar Number</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.aadhaar_no}
                      onChange={(e) => handleChange('aadhaar_no', e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="Enter 12-digit Aadhaar number"
                      maxLength="12"
                    />
                    <Form.Text className="text-muted">
                      Optional: Enter 12-digit Aadhaar number
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Associate Wings</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.associate_wings}
                      onChange={(e) => handleChange('associate_wings', e.target.value)}
                      placeholder="Enter associate wings"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Phone Number *</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit phone number"
                      maxLength="10"
                      required
                    />
                    <Form.Text className="text-muted">
                      Enter 10-digit phone number (e.g., 9876543210)
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email Address *</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      required
                    />
                    <Form.Text className="text-muted">
                      We'll use this to contact you regarding your counseling request
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="Enter your state"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>District</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.district}
                      onChange={(e) => handleChange('district', e.target.value)}
                      placeholder="Enter your district"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Block</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.block}
                      onChange={(e) => handleChange('block', e.target.value)}
                      placeholder="Enter your block"
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Counseling Category * (Select all that apply)</Form.Label>
                    <div className="row">
                      {[
                        { value: 'career-guidance', label: 'Career Guidance' },
                        { value: 'course-selection', label: 'Course Selection Help' },
                        { value: 'admission-process', label: 'Admission Process' },
                        { value: 'financial-aid', label: 'Financial Aid & Scholarships' },
                        { value: 'study-abroad', label: 'Study Abroad Guidance' },
                        { value: 'job-placement', label: 'Job Placement Assistance' },
                        { value: 'skill-development', label: 'Skill Development' },
                        { value: 'personal-counseling', label: 'Personal Counseling' },
                        { value: 'health', label: 'Health Related' },
                        { value: 'domestic', label: 'Domestic Issues' },
                        { value: 'other', label: 'Other' }
                      ].map((option) => (
                        <Col key={option.value} md={4} className="mb-2">
                          <Form.Check
                            type="checkbox"
                            id={option.value}
                            label={option.label}
                            checked={formData.category_consulting.includes(option.value)}
                            onChange={(e) => {
                              const checked = e.target.checked
                              const currentCategories = formData.category_consulting
                              if (checked) {
                                handleChange('category_consulting', [...currentCategories, option.value])
                              } else {
                                handleChange('category_consulting', currentCategories.filter(cat => cat !== option.value))
                              }
                            }}
                          />
                        </Col>
                      ))}
                    </div>
                  </Form.Group>
                </Col>
                {formData.category_consulting.includes('other') && (
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Specify Other Category *</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.otherCategory}
                        onChange={(e) => handleChange('otherCategory', e.target.value)}
                        placeholder="Please specify"
                        required
                      />
                    </Form.Group>
                  </Col>
                )}
                <Col xs={12}>
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Counseling Request'
                    )}
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Card.Body>
      </Card>
    </>
  )
}

export default CounselingForm