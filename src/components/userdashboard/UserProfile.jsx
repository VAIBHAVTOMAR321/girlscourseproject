import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner, Button, Modal, Form, Alert, Badge, Tooltip, OverlayTrigger } from 'react-bootstrap'
import axios from 'axios'
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
        const response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/?student_id=${uniqueId}`)
        const { data } = response
        
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
  }, [uniqueId])

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
                    <Card className="shadow-sm mb-4 border-0 profile-header-card" style={{ borderRadius: '10px' }}>
                     <Card.Body className="p-3">
                       <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                         <div className="d-flex align-items-center gap-2">
                           {/* Profile Image */}
                           <div className="profile-image-wrapper">
                             {userData.profile_photo ? (
                               <img 
                                 src={`https://brjobsedu.com/girls_course/girls_course_backend/${userData.profile_photo}`} 
                                 alt="Profile" 
                                 className="profile-image rounded-circle" 
                                 style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                               />
                             ) : (
                               <div className="profile-image bg-gradient-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                 <FaUser className="text-white" style={{ fontSize: '24px' }} />
                               </div>
                             )}
                           </div>
                            <div>
                             <h4 className="mb-1">{userData.candidate_name}</h4>
                           
                             <Badge bg="primary" className="px-2 py-1 small">
                               {userData.status.charAt(0).toUpperCase() + userData.status.slice(1)}
                             </Badge>
                           </div>
                         </div>
                       </div>
                     </Card.Body>
                      <Card className="shadow-sm border-0 profile-details-card" style={{ borderRadius: '10px' }}>
                    <Card.Header className="bg-white border-bottom-0 pt-3">
                      <h6 className="mb-0">Profile Information</h6>
                    </Card.Header>
                     <Card.Body className="p-3">
                      <Row>
                        <Col md={6} className="mb-2">
                          <div className="info-item">
                            <div className="info-label small">
                              <FaEnvelope className="me-2 text-muted" />
                              Email Address
                            </div>
                            <div className="info-value small">{userData.email}</div>
                          </div>
                        </Col>
                        <Col md={6} className="mb-2">
                          <div className="info-item">
                            <div className="info-label small">
                              <FaPhone className="me-2 text-muted" />
                              Mobile Number
                            </div>
                            <div className="info-value small">{userData.mobile_no}</div>
                          </div>
                        </Col>
                        <Col md={6} className="mb-2">
                          <div className="info-item">
                            <div className="info-label small">
                              <FaUserShield className="me-2 text-muted" />
                              Guardian Name
                            </div>
                            <div className="info-value small">{userData.guardian_name}</div>
                          </div>
                        </Col>
                        <Col md={6} className="mb-2">
                          <div className="info-item">
                            <div className="info-label small">
                              <FaCalendarAlt className="me-2 text-muted" />
                              Date of Birth
                            </div>
                            <div className="info-value small">{userData.date_of_birth}</div>
                          </div>
                        </Col>
                        <Col md={6} className="mb-2">
                          <div className="info-item">
                            <div className="info-label small">
                              <FaBuilding className="me-2 text-muted" />
                              Highest Education
                            </div>
                            <div className="info-value small">{userData.highest_education}</div>
                          </div>
                        </Col>
                        <Col md={6} className="mb-2">
                          <div className="info-item">
                            <div className="info-label small">
                              <FaMapMarkerAlt className="me-2 text-muted" />
                              Address
                            </div>
                            <div className="info-value small">{userData.address}</div>
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