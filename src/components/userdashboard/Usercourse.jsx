import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner, Button, Modal, Form, Alert, Badge, Tooltip, OverlayTrigger } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import { FaCopy, FaArrowLeft, FaPrint, FaKey, FaCheck, FaTimes, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaCalendarAlt, FaBuilding, FaUserShield } from 'react-icons/fa'

const Usercourse = () => {
  const { uniqueId, accessToken } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [copiedId, setCopiedId] = useState(false)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleMenuToggle = () => {
    setShowOffcanvas(!showOffcanvas)
  }

  // Fetch user data when component mounts or uniqueId changes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/?student_id=${uniqueId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        const data = await response.json()
        
        if (data.success) {
          setUserData(data.data)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (uniqueId) {
      fetchUserData()
    }
  }, [uniqueId, accessToken])

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords don't match")
      return
    }
    
    try {
      setShowPasswordModal(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setUpdateSuccess(true)
      
      setTimeout(() => setUpdateSuccess(false), 3000)
    } catch (error) {
      console.error('Error changing password:', error)
      setPasswordError('Failed to change password')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const printProfile = () => {
    window.print()
  }

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target
    setPasswordForm(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="d-flex flex-column ">
      <UserTopNav onMenuToggle={handleMenuToggle} isMobile={isMobile} />
      <div className="d-flex flex-1">
        <UseLeftNav 
          showOffcanvas={showOffcanvas} 
          setShowOffcanvas={setShowOffcanvas} 
        />
    
          <Container fluid>
            {updateSuccess && (
              <Alert variant="success" className="mb-4 animate-fade-in">
                <FaCheck className="me-2" />
                Profile updated successfully!
              </Alert>
            )}
            
            <Row>
              <Col xs={12}>
                <div className="mt-4">
                  {loading ? (
                    <div className="text-center">
                      <Spinner animation="border" variant="primary" style={{ width: '60px', height: '60px' }} />
                      <p className="mt-3">Loading profile...</p>
                    </div>
                  ) : userData ? (
                    <>
                      {/* Header Card */}
                      <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '16px' }}>
                        <Card.Body className="p-4">
                          <div className="d-flex flex-wrap justify-content-between align-items-start gap-4">
                            <Button variant="outline-secondary" onClick={() => navigate('/UserDashboard')} className="d-flex align-items-center">
                              <FaArrowLeft className="me-2" />
                              Back to Dashboard
                            </Button>
                            <div className="d-flex gap-3">
                              <OverlayTrigger placement="top" overlay={<Tooltip>Print Profile</Tooltip>}>
                                <Button variant="outline-primary" className="d-flex align-items-center" onClick={printProfile}>
                                  <FaPrint className="me-2" />
                                  Print
                                </Button>
                              </OverlayTrigger>
                              <OverlayTrigger placement="top" overlay={<Tooltip>View Aadhaar Card</Tooltip>}>
                                <Button 
                                  variant="outline-info" 
                                  className="d-flex align-items-center" 
                                  onClick={() => window.open(`https://brjobsedu.com/girls_course/girls_course_backend/${userData.adharcard_file}`, '_blank')}
                                >
                                  <FaIdCard className="me-2" />
                                  View Aadhaar
                                </Button>
                              </OverlayTrigger>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>

                      {/* Profile Card */}
                      <Card className="shadow-lg mb-4 border-0" style={{ borderRadius: '20px' }}>
                        <Card.Body className="p-6">
                          <div className="d-flex flex-wrap gap-6">
                            {/* Left side - Photo */}
                            <div className="flex-shrink-0">
                              <div className="bg-gradient rounded-circle d-flex align-items-center justify-content-center" style={{ width: '140px', height: '140px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <span className="text-white fs-1">👤</span>
                              </div>
                            </div>
                            
                            {/* Right side - All Details */}
                            <div className="flex-grow-1 min-width-0">
                              {/* Name and Student ID */}
                              <div className="mb-4">
                                <h2 className="mb-1">{userData.full_name}</h2>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                  <span className="text-muted">{userData.student_id}</span>
                                  <OverlayTrigger placement="top" overlay={<Tooltip>{copiedId ? "Copied!" : "Copy ID"}</Tooltip>}>
                                    <Button variant="link" className="p-0 text-muted" onClick={() => copyToClipboard(userData.student_id)}>
                                      {copiedId ? <FaCheck /> : <FaCopy />}
                                    </Button>
                                  </OverlayTrigger>
                                </div>
                                <Badge bg="primary" className="px-3 py-1">
                                  {userData.status.charAt(0).toUpperCase() + userData.status.slice(1)}
                                </Badge>
                              </div>
                              
                              {/* All Details - Label Value Pairs */}
                              <div className="space-y-3">
                                <div className="d-flex  align-items-center p-3 bg-light rounded-lg">
                                  <span className="text-secondary fw-semibold">Email:</span>
                                  <span className="text-primary fw-medium">{userData.email}</span>
                                </div>
                                <div className="d-flex  align-items-center p-3 bg-light rounded-lg">
                                  <span className="text-secondary fw-semibold">Phone:</span>
                                  <span className="text-primary fw-medium">{userData.phone}</span>
                                </div>
                                <div className="d-flex  align-items-center p-3 bg-light rounded-lg">
                                  <span className="text-secondary fw-semibold">Aadhaar Number:</span>
                                  <span className="text-primary fw-medium">{userData.aadhaar_no}</span>
                                </div>
                                <div className="d-flex  align-items-center p-3 bg-light rounded-lg">
                                  <span className="text-secondary fw-semibold">Associate Wings:</span>
                                  <span className="text-primary fw-medium">{userData.associate_wings}</span>
                                </div>
                                <div className="d-flex align-items-center p-3 bg-light rounded-lg">
                                  <span className="text-secondary fw-semibold">State:</span>
                                  <span className="text-primary fw-medium">{userData.state}</span>
                                </div>
                                <div className="d-flex  align-items-center p-3 bg-light rounded-lg">
                                  <span className="text-secondary fw-semibold">District:</span>
                                  <span className="text-primary fw-medium">{userData.district}</span>
                                </div>
                                <div className="d-flex  align-items-center p-3 bg-light rounded-lg">
                                  <span className="text-secondary fw-semibold">Block:</span>
                                  <span className="text-primary fw-medium">{userData.block}</span>
                                </div>
                                <div className="d-flex  align-items-center p-3 bg-light rounded-lg">
                                  <span className="text-secondary fw-semibold">Joined Date:</span>
                                  <span className="text-primary fw-medium">{new Date(userData.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </>
                  ) : (
                    <div className="text-center">
                      <p className="text-muted fs-4">No profile data found</p>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Container>
      
      </div>

      {/* Change Password Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {passwordError && <Alert variant="danger">{passwordError}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordFormChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordFormChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePasswordChange}>
            Change Password
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom Styles */}
      <style jsx>{`
        .hover-lift {
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

export default Usercourse