import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner, Button, Modal, Form, Alert, Badge, Tooltip, OverlayTrigger, ProgressBar } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import TransText from '../TransText'
import { FaCopy, FaArrowLeft, FaCheck, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaCalendarAlt, FaBuilding, FaUserShield, FaUser, FaChartLine } from 'react-icons/fa'

const UserProfile = () => {
  const { uniqueId, accessToken, updateProfilePhoto, userRoleType } = useAuth()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [quizProgress, setQuizProgress] = useState({ participated: 0, total: 0, averagePercentage: 0 })
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

  // Handle responsive margin for mobile
  useEffect(() => {
    const contentArea = document.querySelector('.flex-grow-1')
    if (contentArea) {
      if (isMobile) {
        contentArea.style.marginLeft = '0px'
      } else {
        contentArea.style.marginLeft = '220px'
      }
    }
  }, [isMobile])

  const handleMenuToggle = () => {
    setShowOffcanvas(!showOffcanvas)
  }

  // Fetch user data when component mounts or uniqueId changes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        
        // Admin users don't need profiles
        if (userRoleType === 'admin') {
          navigate('/AdminDashboard')
          return
        }

        let response
        
        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
        
        // Fetch data based on user role
        if (userRoleType === 'student-unpaid') {
          // For unpaid students, fetch from student-unpaid endpoint with student_id
          response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/student-unpaid/?student_id=${uniqueId}`, config)
        } else {
          // For regular students, use the existing endpoint
          response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/?student_id=${uniqueId}`)
        }
        
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
  }, [uniqueId, userRoleType, navigate])

  // Fetch quiz progress
  useEffect(() => {
    const fetchQuizProgress = async () => {
      if (!uniqueId || !accessToken) return

      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }

        const allQuizzesResponse = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/quiz-items/', config)
        const quizParticipantsResponse = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/quiz-participants/', config)

        const totalQuizzes = allQuizzesResponse.data.success ? allQuizzesResponse.data.data?.length || 0 : 0

        let participatedCount = 0
        let totalPercentage = 0
        let participatedQuizzes = 0

        if (quizParticipantsResponse.data.status && quizParticipantsResponse.data.data) {
          const userParticipations = quizParticipantsResponse.data.data.filter(
            p => p.student?.student_id === uniqueId
          )

          participatedCount = userParticipations.length

          userParticipations.forEach(p => {
            if (p.attempt && p.attempt.total_questions > 0) {
              const percentage = (p.attempt.score / p.attempt.total_questions) * 100
              totalPercentage += percentage
              participatedQuizzes++
            }
          })
        }

        const averagePercentage = participatedQuizzes > 0 ? Math.round(totalPercentage / participatedQuizzes) : 0

        setQuizProgress({
          participated: participatedCount,
          total: totalQuizzes,
          averagePercentage
        })
      } catch (error) {
        console.error('Error fetching quiz progress:', error)
      }
    }

    fetchQuizProgress()
  }, [uniqueId, accessToken])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('student_id', uniqueId)
      formData.append('profile_photo', selectedFile)

      const response = await axios.put(
        'https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (response.data.success) {
        // Refetch user data to ensure profile photo is updated correctly
        const fetchResponse = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/?student_id=${uniqueId}`)
        if (fetchResponse.data.success) {
          setUserData(fetchResponse.data.data)
          updateProfilePhoto(fetchResponse.data.data.profile_photo) // Update profile photo in context
        }
        
        setUpdateSuccess(true)
        setSelectedFile(null)
        setPreviewImage(null)
        setTimeout(() => setUpdateSuccess(false), 3000)
      } else {
        alert('Failed to update profile photo')
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error)
      alert('Failed to update profile photo')
    } finally {
      setUploading(false)
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
        
        <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '220px', padding: isMobile ? '12px' : '24px', minHeight: 'calc(100vh - 70px)', backgroundColor: '#f8f9fa' }}>
          <Container fluid className='fixed-profile'>
            {/* Success Alert */}
            {/* Back Button */}
            <div className="mb-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/UserDashboard')} 
                className="d-flex align-items-center"
                style={{ borderColor: '#dee2e6', color: '#495057', fontSize: '0.95rem' }}
              >
                <FaArrowLeft className="me-2" />
                <TransText k="profile.backToDashboard" as="span" />
              </Button>
            </div>
            
            {updateSuccess && (
              <Alert variant="success" className="mb-4 animate-fade-in">
                <FaCheck className="me-2" />
                <TransText k="profile.profileUpdated" as="span" />
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" style={{ width: '60px', height: '60px' }} />
                <p className="mt-3"><TransText k="profile.loading" as="span" /></p>
              </div>
            ) : userData ? (
              <Row>
                <Col lg={12}>
                   {/* Profile Header Card */}
                   <Card className="shadow-sm mb-4 border-0 profile-header-card" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
                     <Card.Body className="p-4">
                       <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                         <div className="d-flex align-items-center gap-3">
                           {/* Profile Image */}
                           <div className="profile-image-wrapper">
                             {previewImage ? (
                               <img 
                                 src={previewImage} 
                                 alt="Preview" 
                                 className="profile-image rounded-circle" 
                                 style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                               />
                             ) : (userRoleType !== 'student-unpaid' && userData.profile_photo) ? (
                               <img 
                                 src={`https://brjobsedu.com/girls_course/girls_course_backend/${userData.profile_photo}`} 
                                 alt="Profile" 
                                 className="profile-image rounded-circle" 
                                 style={{ width: '90px', height: '90px', objectFit: 'cover' }}
                               />
                             ) : (
                               <div className="profile-image bg-gradient-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '90px', height: '90px' }}>
                                 <FaUser className="text-white" style={{ fontSize: '32px' }} />
                               </div>
                             )}
                           </div>
                            <div>
                             <h3 className="mb-1" style={{ fontWeight: '600', color: '#202020' }}>{userRoleType === 'student-unpaid' ? userData.full_name : userData.candidate_name}</h3>
                             <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                               {userRoleType === 'student-unpaid' ? 'Student Candidate' : 'Registered Student'}
                             </p>
                           </div>
                         </div>
                          <div className="d-flex gap-2 flex-wrap">
                           {userRoleType === 'student-unpaid' && (
                             <Button 
                               variant="outline-info" 
                               className="d-flex align-items-center" 
                               onClick={() => window.open(`https://brjobsedu.com/girls_course/girls_course_backend${userData.adharcard_file}`, '_blank')}
                               style={{ fontSize: '0.9rem' }}
                             >
                               <FaIdCard className="me-2" />
                               <TransText k="profile.viewAadhaar" as="span" />
                             </Button>
                           )}
                           {userRoleType !== 'student-unpaid' && (
                             <>
                               <input
                                 type="file"
                                 accept="image/*"
                                 onChange={handleFileChange}
                                 className="d-none"
                                 id="profilePhotoInput"
                               />
                               <Button 
                                 variant="outline-primary" 
                                 className="d-flex align-items-center"
                                 onClick={() => document.getElementById('profilePhotoInput').click()}
                                 style={{ fontSize: '0.9rem' }}
                               >
                                 <FaUser className="me-2" />
                                 <TransText k={selectedFile ? "profile.changePhoto" : "profile.updatePhoto"} as="span" />
                               </Button>
                               {selectedFile && (
                                 <Button 
                                   variant="primary" 
                                   className="d-flex align-items-center"
                                   onClick={handleUpload}
                                   disabled={uploading}
                                   style={{ fontSize: '0.9rem' }}
                                 >
                                   <TransText k={uploading ? "profile.uploading" : "profile.upload"} as="span" />
                                 </Button>
                               )}
                             </>
                           )}
                         </div>
                       </div>
                     </Card.Body>
                   </Card>
                    
                    {/* Quiz Progress Card */}
                    <Card className="shadow-sm mb-4 border-0 quiz-progress-card" style={{ 
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                      color: 'white',
                      boxShadow: '0 12px 50px rgba(102, 126, 234, 0.35)',
                      overflow: 'hidden'
                    }}>
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                          <div className="d-flex align-items-center">
                            <div className="bg-white bg-opacity-25 rounded-circle p-3 me-3" style={{ backdropFilter: 'blur(10px)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FaChartLine className="text-white" style={{ fontSize: '28px' }} />
                            </div>
                            <div>
                              <h5 className="mb-0 fw-bold" style={{ fontSize: '1.1rem' }}>Quiz Progress</h5>
                              <small className="text-white-50" style={{ fontSize: '0.85rem' }}>Your Performance Overview</small>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="fs-1 fw-bold" style={{ fontSize: '2.5rem', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                              {quizProgress.averagePercentage}%
                            </div>
                            <small className="text-white-50" style={{ fontSize: '0.85rem' }}>Average Score</small>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div style={{ 
                            background: 'rgba(255,255,255,0.2)', 
                            borderRadius: '20px', 
                            height: '32px',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)'
                          }}>
                            <div style={{ 
                              width: `${quizProgress.averagePercentage}%`,
                              background: quizProgress.averagePercentage >= 60 
                                ? 'linear-gradient(90deg, #10b981, #34d399)' 
                                : quizProgress.averagePercentage >= 40 
                                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' 
                                  : 'linear-gradient(90deg, #ef4444, #f87171)',
                              height: '100%',
                              borderRadius: '20px',
                              transition: 'width 1.5s ease-in-out',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                              animation: 'progressFill 1.5s ease-out'
                            }} />
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                              zIndex: 1
                            }}>
                              {quizProgress.averagePercentage}% Complete
                            </div>
                          </div>
                        </div>
                        
                        <Row className="text-center g-2 mb-3">
                          <Col xs={6}>
                            <div className="bg-white bg-opacity-15 rounded-3 py-3" style={{ backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                              <div className="fs-3 fw-bold">{quizProgress.participated}</div>
                              <div className="small text-white-50" style={{ fontSize: '0.85rem' }}>
                                <i className="bi bi-check-circle me-1"></i> Completed
                              </div>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="bg-white bg-opacity-15 rounded-3 py-3" style={{ backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                              <div className="fs-3 fw-bold">{quizProgress.total}</div>
                              <div className="small text-white-50" style={{ fontSize: '0.85rem' }}>
                                <i className="bi bi-collection me-1"></i> Total
                              </div>
                            </div>
                          </Col>
                        </Row>
                        
                        {quizProgress.participated > 0 && (
                          <div className="mt-3 pt-3 border-top border-white border-opacity-30">
                            <Row className="text-center g-2">
                              <Col xs={4}>
                                <div className="text-center">
                                  <div className="fs-4 fw-bold mb-1">
                                    {quizProgress.averagePercentage >= 60 ? '🟢' : quizProgress.averagePercentage >= 40 ? '🟡' : '🔴'}
                                  </div>
                                  <small className="text-white-50" style={{ fontSize: '0.8rem' }}>Status</small>
                                </div>
                              </Col>
                              <Col xs={4}>
                                <div className="text-center">
                                  <div className="fs-4 fw-bold mb-1">
                                    {quizProgress.total > 0 ? Math.round((quizProgress.participated / quizProgress.total) * 100) : 0}%
                                  </div>
                                  <small className="text-white-50" style={{ fontSize: '0.8rem' }}>Completion</small>
                                </div>
                              </Col>
                              <Col xs={4}>
                                <div className="text-center">
                                  <div className="fs-4 fw-bold mb-1">
                                    {quizProgress.total - quizProgress.participated}
                                  </div>
                                  <small className="text-white-50" style={{ fontSize: '0.8rem' }}>Remaining</small>
                                </div>
                              </Col>
                            </Row>
                          </div>
                        )}
                        
                        {quizProgress.participated === quizProgress.total && quizProgress.total > 0 && (
                          <div className="mt-3 text-center">
                            <Badge bg="warning" text="dark" className="py-2 px-4" style={{ borderRadius: '25px', fontSize: '13px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                              🎉 Congratulations! All Quizzes Completed!
                            </Badge>
                          </div>
                        )}
                      </Card.Body>
                      <style>{`
                        @keyframes progressFill {
                          from { width: 0%; }
                        }
                      `}</style>
                    </Card>

                   <Card className="shadow-sm border-0 profile-details-card" style={{ borderRadius: '16px', backgroundColor: '#ffffff' }}>
                     <Card.Header className="bg-white border-bottom pt-4 pb-3 px-4" style={{ borderBottomColor: '#e9ecef', borderRadius: '16px 16px 0 0' }}>
                       <h6 className="mb-0" style={{ fontWeight: '600', fontSize: '1.05rem', color: '#202020' }}>
                         <TransText k="profile.information" as="span" />
                       </h6>
                     </Card.Header>
                     <Card.Body className="p-4">
                      <Row className="g-3">
                        {userRoleType === 'student-unpaid' ? (
                          <>
                            {/* Student-Unpaid Profile Fields */}
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaIdCard className="me-2 text-primary" />
                                  <TransText k="profile.studentId" as="span" />
                                </div>
                                <div className="info-value">{userData.student_id}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaIdCard className="me-2 text-primary" />
                                  <TransText k="profile.aadhaarNumber" as="span" />
                                </div>
                                <div className="info-value">{userData.aadhaar_no}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaEnvelope className="me-2 text-info" />
                                  <TransText k="profile.emailAddress" as="span" />
                                </div>
                                <div className="info-value text-truncate">{userData.email}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaPhone className="me-2 text-success" />
                                  <TransText k="profile.mobileNumber" as="span" />
                                </div>
                                <div className="info-value">{userData.phone}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaMapMarkerAlt className="me-2 text-danger" />
                                  <TransText k="profile.district" as="span" />
                                </div>
                                <div className="info-value">{userData.district}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaMapMarkerAlt className="me-2 text-danger" />
                                  <TransText k="profile.block" as="span" />
                                </div>
                                <div className="info-value">{userData.block}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaMapMarkerAlt className="me-2 text-danger" />
                                  <TransText k="profile.state" as="span" />
                                </div>
                                <div className="info-value">{userData.state}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-3">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaBuilding className="me-2 text-warning" />
                                  <TransText k="profile.associateWings" as="span" />
                                </div>
                                <div className="info-value">{userData.associate_wings}</div>
                              </div>
                            </Col>
                          </>
                        ) : (
                          <>
                            {/* Regular Student Profile Fields */}
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaEnvelope className="me-2 text-info" />
                                  <TransText k="profile.emailAddress" as="span" />
                                </div>
                                <div className="info-value text-truncate">{userData.email}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaPhone className="me-2 text-success" />
                                  <TransText k="profile.mobileNumber" as="span" />
                                </div>
                                <div className="info-value">{userData.mobile_no}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaUserShield className="me-2 text-secondary" />
                                  <TransText k="profile.guardianName" as="span" />
                                </div>
                                <div className="info-value">{userData.guardian_name}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaCalendarAlt className="me-2 text-primary" />
                                  <TransText k="profile.dateOfBirth" as="span" />
                                </div>
                                <div className="info-value">{userData.date_of_birth}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaBuilding className="me-2 text-warning" />
                                  <TransText k="profile.highestEducation" as="span" />
                                </div>
                                <div className="info-value">{userData.highest_education}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaMapMarkerAlt className="me-2 text-danger" />
                                  <TransText k="profile.address" as="span" />
                                </div>
                                <div className="info-value">{userData.address}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-3">
                              <div className="info-item">
                                <div className="info-label">
                                  <FaCalendarAlt className="me-2 text-primary" />
                                  <TransText k="profile.joinedDate" as="span" />
                                </div>
                                <div className="info-value">{new Date(userData.created_at).toLocaleDateString()}</div>
                              </div>
                            </Col>
                          </>
                        )}
                      </Row>
                    </Card.Body>
                  </Card>

                  {/* Profile Details Card */}
                </Col>
              </Row>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted fs-4"><TransText k="profile.noProfileData" as="span" /></p>
              </div>
            )}
          </Container>
        </div>
      </div>

      {/* Handle responsive margin for mobile */}
      <style jsx>{`
        .profile-image-wrapper {
          position: relative;
        }

        .profile-image {
          width: 90px;
          height: 90px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .profile-image:hover {
          transform: scale(1.08);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .profile-header-card {
          background: white;
          border-radius: 16px;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }

        .profile-header-card:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
          transform: translateY(-2px);
        }

        .quiz-progress-card {
          position: relative;
          overflow: hidden;
        }

        .quiz-progress-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          pointer-events: none;
          opacity: 0.5;
        }

        .profile-details-card {
          background: white;
          border-radius: 16px;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }

        .profile-details-card:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
          transform: translateY(-2px);
        }

        .info-item {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
          padding: 18px;
          transition: all 0.3s ease;
          border: 1px solid #dee2e6;
          height: 100%;
        }

        .info-item:hover {
          background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
          transform: translateY(-3px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
          border-color: #adb5bd;
        }

        .info-label {
          font-size: 0.875rem;
          color: #6c757d;
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 1rem;
          color: #212529;
          font-weight: 500;
          word-break: break-word;
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
          .profile-image {
            width: 70px;
            height: 70px;
          }

          .profile-details-card .card-body {
            padding: 1.5rem !important;
          }

          .info-item {
            margin-bottom: 1rem;
          }

          .quiz-progress-card {
            margin-bottom: 1.5rem !important;
          }

          .info-label {
            font-size: 0.8rem;
          }

          .info-value {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  )
}

export default UserProfile