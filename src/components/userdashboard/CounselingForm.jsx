import React, { useState } from 'react'
import { Card, Button, Form, Row, Col, Alert } from 'react-bootstrap'
import { FaLightbulb } from 'react-icons/fa'
import TransText from '../TransText'
import { useLanguage } from '../../contexts/LanguageContext'
import { getTranslation } from '../../utils/translations'

const CounselingForm = ({ onSubmit, initialData = {}, showForm: propShowForm, onToggle, userRoleType }) => {
  const { language } = useLanguage()
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
    student_id: initialData.student_id || initialData.student_id || '',
    full_name: initialData.full_name || initialData.candidate_name || '',
    aadhaar_no: initialData.aadhaar_no || '',
    associate_wings: initialData.associate_wings || '',
    phone: initialData.phone || initialData.mobile_no || '',
    email: initialData.email || '',
    district: initialData.district || '',
    block: initialData.block || '',
    state: initialData.state || '',
    guardian_name: initialData.guardian_name || '',
    date_of_birth: initialData.date_of_birth || '',
    highest_education: initialData.highest_education || '',
    address: initialData.address || '',
    created_at: initialData.created_at || '',
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
      alert(getTranslation('counseling.errorStudentId', language))
      return
    }
    
    if (!formData.full_name) {
      alert(getTranslation('counseling.errorFullName', language))
      return
    }



    // Validate aadhaar if provided
    if (formData.aadhaar_no && !/^\d{12}$/.test(formData.aadhaar_no.replace(/\s+/g, ''))) {
      alert(getTranslation('counseling.errorAadhaar', language))
      return
    }

    if (!formData.category_consulting.length) {
      alert(getTranslation('counseling.errorCategory', language))
      return
    }

    if (formData.category_consulting.includes('other') && !formData.otherCategory.trim()) {
      alert(getTranslation('counseling.errorOtherCategory', language))
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
        student_id: initialData.student_id || initialData.student_id || '',
        full_name: initialData.full_name || initialData.candidate_name || '',
        aadhaar_no: initialData.aadhaar_no || '',
        associate_wings: initialData.associate_wings || '',
        phone: initialData.phone || initialData.mobile_no || '',
        email: initialData.email || '',
        district: initialData.district || '',
        block: initialData.block || '',
        state: initialData.state || '',
        guardian_name: initialData.guardian_name || '',
        date_of_birth: initialData.date_of_birth || '',
        highest_education: initialData.highest_education || '',
        address: initialData.address || '',
        created_at: initialData.created_at || '',
        category_consulting: [],
        otherCategory: '',
        status: 'pending'
      })

      // Hide success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      setError(error.message || getTranslation('counseling.error', language))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
    

      {/* Error Alert */}
      {error && (
        <Alert variant="success" className="mb-4">
          <strong></strong> {error}
        </Alert>
      )}

      <Card className="mb-4 shadow-sm border-0" style={{ borderRadius: '10px' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">
                <FaLightbulb className="me-2 text-warning" />
                <TransText k="counseling.title" as="span" />
              </h5>
              <small className="text-muted"><TransText k="counseling.subtitle" as="span" /></small>
            </div>
            <Button
              variant="outline-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? <TransText k="counseling.hideForm" as="span" /> : <TransText k="counseling.getCounseling" as="span" />}
            </Button>
          </div>

          {showForm && (
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                {/* <Col md={6}>
                  <Form.Group>
                    <Form.Label>Student ID *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.student_id}
                      onChange={(e) => handleChange('student_id', e.target.value)}
                      placeholder="Enter your student ID"
                      required
                      disabled
                    />
                  </Form.Group>
                </Col> */}
                {/* <Col md={6}>
                  <Form.Group>
                    <Form.Label>Full Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                      disabled
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
                      disabled
                    />
                    <Form.Text className="text-muted">
                      Optional: Enter 12-digit Aadhaar number
                    </Form.Text>
                  </Form.Group>
                </Col> */}
                {/* {userRoleType === 'student-unpaid' && (
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Associate Wings</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.associate_wings}
                        onChange={(e) => handleChange('associate_wings', e.target.value)}
                        placeholder="Enter associate wings"
                        disabled
                      />
                    </Form.Group>
                  </Col>
                )}
                {userRoleType !== 'student-unpaid' && (
                  <>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Guardian Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.guardian_name}
                          onChange={(e) => handleChange('guardian_name', e.target.value)}
                          placeholder="Enter guardian name"
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.date_of_birth}
                          onChange={(e) => handleChange('date_of_birth', e.target.value)}
                          placeholder="Enter date of birth"
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Highest Education</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.highest_education}
                          onChange={(e) => handleChange('highest_education', e.target.value)}
                          placeholder="Enter highest education"
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          placeholder="Enter address"
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Joined Date</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.created_at ? new Date(formData.created_at).toLocaleDateString() : ''}
                          onChange={(e) => handleChange('created_at', e.target.value)}
                          placeholder="Joined date"
                          disabled
                        />
                      </Form.Group>
                    </Col>
                  </>
                )}
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
                      disabled
                    />
                    <Form.Text className="text-muted">
                      Enter 10-digit phone number (e.g., 9876543210)
                    </Form.Text>
                  </Form.Group>
                </Col> */}
                {/* <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email Address *</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      
                      disabled
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
                      disabled
                    />
                  </Form.Group>
                </Col> */}
                {/* <Col md={4}>
                  <Form.Group>
                    <Form.Label>District</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.district}
                      onChange={(e) => handleChange('district', e.target.value)}
                      placeholder="Enter your district"
                      disabled
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
                      disabled
                    />
                  </Form.Group>
                </Col> */}
                <Col md={12}>
                  <Form.Group>
                    <Form.Label><TransText k="counseling.categoryLabel" as="span" /></Form.Label>
                    <div className="row">
                      {[
                        { value: 'career-guidance', labelKey: 'counseling.categoryCareer' },
                        { value: 'course-selection', labelKey: 'counseling.categoryCourse' },
                        { value: 'admission-process', labelKey: 'counseling.categoryAdmission' },
                        { value: 'financial-aid', labelKey: 'counseling.categoryFinancial' },
                        { value: 'study-abroad', labelKey: 'counseling.categoryAbroad' },
                        { value: 'job-placement', labelKey: 'counseling.categoryJob' },
                        { value: 'skill-development', labelKey: 'counseling.categorySkill' },
                        { value: 'personal-counseling', labelKey: 'counseling.categoryPersonal' },
                        { value: 'health', labelKey: 'counseling.categoryHealth' },
                        { value: 'domestic', labelKey: 'counseling.categoryDomestic' },
                        { value: 'other', labelKey: 'counseling.categoryOther' }
                      ].map((option) => (
                        <Col key={option.value} md={4} className="mb-2">
                          <Form.Check
                            type="checkbox"
                            id={option.value}
                            label={<TransText k={option.labelKey} as="span" />}
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
                      <Form.Label><TransText k="counseling.otherSpecify" as="span" /></Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.otherCategory}
                        onChange={(e) => handleChange('otherCategory', e.target.value)}
                        placeholder={<TransText k="counseling.otherPlaceholder" as="span" />}
                        required
                      />
                    </Form.Group>
                  </Col>
                )}
                <Col xs={12}>
                  <Button
                    variant={submitted ? "success" : "primary"}
                    type="submit"
                    className=""
                    disabled={submitting || submitted}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        <TransText k="counseling.submitting" as="span" />
                      </>
                    ) : submitted ? (
                      <TransText k="counseling.submitted" as="span" />
                    ) : (
                      <TransText k="counseling.submit" as="span" />
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