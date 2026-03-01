import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner, Button, Modal, Form, Alert, Badge, Tooltip, OverlayTrigger } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import { FaCopy, FaArrowLeft, FaCheck, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaCalendarAlt, FaBuilding, FaUserShield, FaUser } from 'react-icons/fa'

const UserProfile = () => {
  const { uniqueId, accessToken } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updateSuccess, setUpdateSuccess] = useState(false)
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  return (
    <div className="user-profile-wrapper min-vh-100">
      <UserTopNav onMenuToggle={handleMenuToggle} isMobile={isMobile} />
      <div className="d-flex flex-1">
        <UseLeftNav 
          showOffcanvas={showOffcanvas} 
          setShowOffcanvas={setShowOffcanvas} 
        />
        
        {/* Main Content */}
        <div className="flex-grow-1 p-4">
          <Container fluid className="mt-4">
            {/* Success Alert */}
            {updateSuccess && (
              <Alert variant="success" className="mb-4 animate-fade-in">
                <FaCheck className="me-2" />
                Profile updated successfully!
              </Alert>
            )}
            
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

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" style={{ width: '60px', height: '60px' }} />
                <p className="mt-3">Loading profile...</p>
              </div>
            ) : userData ? (
              <Row>
                <Col lg={12}>
                  {/* Profile Header Card */}
                  <Card className="shadow-sm mb-4 border-0 profile-header-card">
                    <Card.Body className="p-4">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                        <div className="d-flex align-items-center gap-3">
                          {/* Profile Image */}
                          <div className="profile-image-wrapper">
                            <div className="profile-image bg-gradient-primary rounded-circle d-flex align-items-center justify-content-center">
                              <FaUser className="text-white fs-2" />
                            </div>
                          </div>
                          <div>
                            <h2 className="mb-1">{userData.full_name}</h2>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span className="text-muted">ID: {userData.student_id}</span>
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
                        </div>
                        <div className="d-flex gap-2">
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
                      <Card className="shadow-lg border-0 profile-details-card">
                    <Card.Header className="bg-white border-bottom-0 pt-4">
                      <h4 className="mb-0">Profile Information</h4>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <Row>
                        <Col md={6} className="mb-3">
                          <div className="info-item">
                            <div className="info-label">
                              <FaEnvelope className="me-2 text-muted" />
                              Email Address
                            </div>
                            <div className="info-value">{userData.email}</div>
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <div className="info-item">
                            <div className="info-label">
                              <FaPhone className="me-2 text-muted" />
                              Phone Number
                            </div>
                            <div className="info-value">{userData.phone}</div>
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <div className="info-item">
                            <div className="info-label">
                              <FaIdCard className="me-2 text-muted" />
                              Aadhaar Number
                            </div>
                            <div className="info-value">{userData.aadhaar_no}</div>
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <div className="info-item">
                            <div className="info-label">
                              <FaBuilding className="me-2 text-muted" />
                              Associate Wings
                            </div>
                            <div className="info-value">{userData.associate_wings}</div>
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <div className="info-item">
                            <div className="info-label">
                              <FaMapMarkerAlt className="me-2 text-muted" />
                              State
                            </div>
                            <div className="info-value">{userData.state}</div>
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <div className="info-item">
                            <div className="info-label">
                              <FaMapMarkerAlt className="me-2 text-muted" />
                              District
                            </div>
                            <div className="info-value">{userData.district}</div>
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <div className="info-item">
                            <div className="info-label">
                              <FaMapMarkerAlt className="me-2 text-muted" />
                              Block
                            </div>
                            <div className="info-value">{userData.block}</div>
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <div className="info-item">
                            <div className="info-label">
                              <FaCalendarAlt className="me-2 text-muted" />
                              Joined Date
                            </div>
                            <div className="info-value">{new Date(userData.created_at).toLocaleDateString()}</div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                  </Card>

                  {/* Profile Details Card */}
                
                </Col>
              </Row>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted fs-4">No profile data found</p>
              </div>
            )}
          </Container>
        </div>
      </div>



      {/* Custom Styles */}
      <style jsx>{`
        .user-profile-wrapper {
          background-color: #f8f9fa;
        }

        .profile-image-wrapper {
          position: relative;
        }

        .profile-image {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }

        .profile-image:hover {
          transform: scale(1.05);
        }

        .profile-header-card {
          background: white;
          border-radius: 16px;
        }

        .profile-details-card {
          background: white;
          border-radius: 16px;
        }

        .info-item {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 16px;
          transition: all 0.3s ease;
        }

        .info-item:hover {
          background: #e9ecef;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .info-label {
          font-size: 0.875rem;
          color: #6c757d;
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }

        .info-value {
          font-size: 1rem;
          color: #212529;
          font-weight: 500;
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

        @media (max-width: 768px) {
          .profile-header-card .card-body {
            padding: 1.5rem !important;
          }

          .profile-details-card .card-body {
            padding: 1.5rem !important;
          }

          .info-item {
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default UserProfile