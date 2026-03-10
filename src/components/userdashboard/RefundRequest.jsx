import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import "../../assets/css/UserDashboard.css"
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaArrowLeft } from 'react-icons/fa'

const RefundRequest = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    transaction_id: '',
    reason: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [userData, setUserData] = useState(null)
  const [canRequestRefund, setCanRequestRefund] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const { uniqueId, accessToken, isAuthenticated, userRoleType } = useAuth()

  // Redirect to login if not authenticated or to dashboard if unpaid user
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
    } else if (userRoleType === 'student-unpaid') {
      // Redirect unpaid users to dashboard
      navigate('/UserDashboard')
    }
  }, [isAuthenticated, navigate, location, userRoleType])

  // Check mobile view
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch user data to pre-fill form
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
        
        let response
        
        // Fetch data based on user role
        if (userRoleType === 'student-unpaid') {
          response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/student-unpaid/?student_id=${uniqueId}`, config)
        } else {
          response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/?student_id=${uniqueId}`)
        }
        
        const { data } = response
        
        if (data.success) {
          setUserData(data.data)
          // Pre-fill form with user data
          setFormData(prev => ({
            ...prev,
            full_name: userRoleType === 'student-unpaid' ? data.data.full_name : data.data.candidate_name,
            phone: userRoleType === 'student-unpaid' ? data.data.phone : data.data.mobile_no
          }))
          
          // Check if user can request refund based on status
          // Only allow if status is pending
          setCanRequestRefund(data.data.status === 'pending')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    if (uniqueId) {
      fetchUserData()
    }
  }, [uniqueId, userRoleType])

  const handleMenuToggle = () => {
    setShowOffcanvas(!showOffcanvas)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.full_name || !formData.phone || !formData.transaction_id || !formData.reason) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await axios.post(
        'https://brjobsedu.com/girls_course/girls_course_backend/api/refund-request/',
        {
          ...formData,
          student_id: uniqueId
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        setSuccess(true)
        setFormData({
          full_name: '',
          phone: '',
          transaction_id: '',
          reason: ''
        })
      } else {
        setError(response.data.message || 'Failed to submit refund request')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex flex-column">
      <UserTopNav onMenuToggle={handleMenuToggle} isMobile={isMobile} />
      <div className="d-flex flex-1">
        <UseLeftNav 
          showOffcanvas={showOffcanvas} 
          setShowOffcanvas={setShowOffcanvas} 
        />

         <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '280px', padding: isMobile ? '10px' : '20px', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid className='container-top-fixed'>
            <Row>
              <Col xs={12}>
                <div className="mt-4">
                  {/* Back Button */}
                  <div className="mb-4">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => navigate('/UserDashboard')} 
                      className="d-flex align-items-center"
                    >
                      <FaArrowLeft className="me-2" />
                      Back to Dashboard
                    </Button>
                  </div>

                      <Card className="shadow-sm">
                    <Card.Body>
                      <h4 className="mb-4">Refund Request</h4>
                      
                      {success && (
                        <Alert variant="success" className="mb-4">
                          Your refund request has been submitted successfully! We will process it within 3-5 business days.
                        </Alert>
                      )}

                      {error && (
                        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
                          {error}
                        </Alert>
                      )}

                      {!canRequestRefund && (
                        <Alert variant="info" className="mb-4">
                          You cannot request a refund at this time. Your course status is completed.
                        </Alert>
                      )}

                       <Form onSubmit={handleSubmit}>
                        <Row>
                          <Col md={6} className="mb-3">
                            <Form.Group>
                              <Form.Label>Full Name</Form.Label>
                              <Form.Control
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                required
                                disabled
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6} className="mb-3">
                            <Form.Group>
                              <Form.Label>Phone Number</Form.Label>
                              <Form.Control
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                                required
                                disabled
                              />
                            </Form.Group>
                          </Col>
                         <Col md={6} className="mb-3">
                         
                        <Form.Group className="mb-3">
                          <Form.Label>Transaction ID</Form.Label>
                          <Form.Control
                            type="text"
                            name="transaction_id"
                            value={formData.transaction_id}
                            onChange={handleInputChange}
                            placeholder="Enter transaction ID"
                            required
                            disabled={!canRequestRefund}
                          />
                        </Form.Group>
</Col>
  <Col md={6} className="mb-3">
                        <Form.Group className="mb-3">
                          <Form.Label>Reason for Refund</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            placeholder="Explain why you are requesting a refund"
                            required
                            disabled={!canRequestRefund}
                          />
                        </Form.Group>
</Col>
</Row>
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading || !canRequestRefund}
                          className="refund-btn"
                        >
                          {loading ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Refund Request'
                          )}
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default RefundRequest
