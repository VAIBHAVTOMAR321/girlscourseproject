import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner, Button, Modal, Form, Alert, Badge, Tooltip, OverlayTrigger, ProgressBar } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNavigate, useLocation } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import TransText from '../TransText'
import { FaCopy, FaArrowLeft, FaCheck, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaCalendarAlt, FaBuilding, FaUserShield, FaUser, FaChartLine } from 'react-icons/fa'
import '../../components/admindashboard/userprofile.css'

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
  const [refreshKey, setRefreshKey] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  // Refresh quiz progress when returning from quiz
  useEffect(() => {
    if (location.state?.fromQuiz) {
      setRefreshKey(prev => prev + 1)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location])

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
  }, [uniqueId, accessToken, refreshKey])

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
        
        <div className={`flex-grow-1 main-content-area ${isMobile ? 'mobile' : ''}`}>
          <Container fluid className='fixed-profile'>
            {/* Back Button */}
            <div className="mb-5">
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/UserDashboard')}
                className="d-flex align-items-center back-button"
              >
                <FaArrowLeft className="me-2" />
                <TransText k="profile.backToDashboard" as="span" />
              </Button>
            </div>
            
            {updateSuccess && (
              <Alert variant="success" className="mb-4 animate-fade-in border-0 success-alert">
                <FaCheck className="me-2" />
                <TransText k="profile.profileUpdated" as="span" />
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-5 loading-no-data-padding">
                <Spinner animation="border" variant="primary" className="loading-spinner" />
                <p className="mt-4 loading-text"><TransText k="profile.loading" as="span" /></p>
              </div>
            ) : userData ? (
              <Row>
                <Col lg={12}>
                   {/* Profile Header Card */}
                   <Card className="shadow-sm mb-4 border-0 profile-header-card">
                     <Card.Body className="p-2">
                       <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                         <div className="d-flex align-items-center gap-3">
                           {/* Profile Image */}
                           <div className="profile-image-wrapper">
                              {previewImage ? (
                                <img
                                  src={previewImage}
                                  alt="Preview"
                                  className="profile-image rounded-circle"
                                />
                              ) : (userRoleType !== 'student-unpaid' && userData.profile_photo) ? (
                                <img
                                  src={`https://brjobsedu.com/girls_course/girls_course_backend/${userData.profile_photo}`}
                                  alt="Profile"
                                  className="profile-image rounded-circle"
                                />
                              ) : (
                                <div className="profile-image bg-gradient-primary rounded-circle d-flex align-items-center justify-content-center default-profile-image">
                                  <FaUser className="text-white default-profile-icon" />
                                </div>
                              )}
                           </div>
                            <div>
                              <h3 className="mb-1 profile-name">{userRoleType === 'student-unpaid' ? userData.full_name : userData.candidate_name}</h3>
                              <p className="mb-0 profile-role">
                                {userRoleType === 'student-unpaid' ? 'Student Candidate' : 'Registered Student'}
                              </p>
                           </div>
                         </div>
                          <div className="d-flex gap-2 flex-wrap">
                            {userRoleType === 'student-unpaid' && (
                              <Button
                                variant="outline-info"
                                className="d-flex align-items-center view-aadhaar-btn"
                                onClick={() => window.open(`https://brjobsedu.com/girls_course/girls_course_backend${userData.adharcard_file}`, '_blank')}
                              >
                                <FaIdCard className="me-2 button-icon" />
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
                                  className="d-flex align-items-center update-photo-btn"
                                  onClick={() => document.getElementById('profilePhotoInput').click()}
                                >
                                  <FaUser className="me-2 button-icon" />
                                  <TransText k={selectedFile ? "profile.changePhoto" : "profile.updatePhoto"} as="span" />
                                </Button>
                                {selectedFile && (
                                  <Button
                                    variant="primary"
                                    className="d-flex align-items-center upload-btn"
                                    onClick={handleUpload}
                                    disabled={uploading}
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
                    <Card className="shadow-sm mb-4 border-0 quiz-progress-card mt-3">
                      <Card.Body className="p-3">
                         <div className="d-flex align-items-center justify-content-between  mb-3">
                           <div className="d-flex align-items-center">
                              <div className="rounded-circle p-2 me-2 quiz-icon-container">
                                <FaChartLine className="quiz-chart-icon" />
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold quiz-title">Quiz Performance</h6>
                                <small className="quiz-subtitle">Track your progress</small>
                              </div>
                           </div>
                           <div className="text-end">
                             <div className="fw-bold quiz-percentage">
                               {quizProgress.averagePercentage}<span className="quiz-percentage-span">%</span>
                             </div>
                           </div>
                         </div>
                        
                         <div className="mb-3">
                           <div className="progress-container">
                             <div
                               className="progress-bar-fill"
                               style={{
                                 width: `${quizProgress.averagePercentage}%`,
                                 background: quizProgress.averagePercentage >= 70
                                   ? 'linear-gradient(90deg, #10b981, #34d399)'
                                   : quizProgress.averagePercentage >= 50
                                     ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                     : 'linear-gradient(90deg, #ef4444, #f87171)'
                               }}
                             />
                           </div>
                         </div>
                        
                         <Row className="text-center g-2">
                            <Col xs={6}>
                              <div className="rounded-2 py-2 stat-box">
                                <div className="fw-bold stat-count">{quizProgress.participated}</div>
                                <div className="small stat-text">Completed</div>
                              </div>
                            </Col>
                            <Col xs={6}>
                              <div className="rounded-2 py-2 stat-box">
                                <div className="fw-bold stat-count">{quizProgress.total}</div>
                                <div className="small stat-text">Total</div>
                              </div>
                            </Col>
                         </Row>
                        
                        {quizProgress.participated === quizProgress.total && quizProgress.total > 0 && (
                          <div className="mt-2 text-center">
                            <Badge bg="warning" text="dark" className="py-1 px-2 completed-badge">
                              🎉 All Completed!
                            </Badge>
                          </div>
                        )}
                      </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-0 profile-details-card mt-4">
                      <Card.Header className="bg-white border-bottom pt-4 pb-3 px-4 card-header-custom">
                        <h6 className="mb-0 card-title">
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
                                   <FaIdCard className="me-2 icon-student-id" />
                                   <TransText k="profile.studentId" as="span" />
                                 </div>
                                 <div className="info-value">{userData.student_id}</div>
                               </div>
                             </Col>
                             <Col md={6} className="mb-2">
                               <div className="info-item">
                                 <div className="info-label small">
                                   <FaIdCard className="me-2 icon-aadhaar" />
                                   <TransText k="profile.aadhaarNumber" as="span" />
                                 </div>
                                 <div className="info-value">{userData.aadhaar_no}</div>
                               </div>
                             </Col>
                             <Col md={6} className="mb-2">
                               <div className="info-item">
                                 <div className="info-label small">
                                   <FaEnvelope className="me-2 icon-email" />
                                   <TransText k="profile.emailAddress" as="span" />
                                 </div>
                                 <div className="info-value text-truncate">{userData.email}</div>
                               </div>
                             </Col>
                             <Col md={6} className="mb-2">
                               <div className="info-item">
                                 <div className="info-label small">
                                   <FaPhone className="me-2 icon-phone" />
                                   <TransText k="profile.mobileNumber" as="span" />
                                 </div>
                                 <div className="info-value">{userData.phone}</div>
                               </div>
                             </Col>
                             <Col md={6} className="mb-2">
                               <div className="info-item">
                                 <div className="info-label small">
                                   <FaMapMarkerAlt className="me-2 icon-location" />
                                   <TransText k="profile.district" as="span" />
                                 </div>
                                 <div className="info-value">{userData.district}</div>
                               </div>
                             </Col>
                             <Col md={6} className="mb-2">
                               <div className="info-item">
                                 <div className="info-label small">
                                   <FaMapMarkerAlt className="me-2 icon-location" />
                                   <TransText k="profile.block" as="span" />
                                 </div>
                                 <div className="info-value">{userData.block}</div>
                               </div>
                             </Col>
                             <Col md={6} className="mb-2">
                               <div className="info-item">
                                 <div className="info-label small">
                                   <FaMapMarkerAlt className="me-2 icon-location" />
                                   <TransText k="profile.state" as="span" />
                                 </div>
                                 <div className="info-value">{userData.state}</div>
                               </div>
                             </Col>
                             <Col md={6} className="mb-3">
                               <div className="info-item">
                                 <div className="info-label small">
                                   <FaBuilding className="me-2 icon-building" />
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
                                   <FaEnvelope className="me-2 icon-email" />
                                   <TransText k="profile.emailAddress" as="span" />
                                 </div>
                                 <div className="info-value text-truncate">{userData.email}</div>
                               </div>
                             </Col>
                             <Col md={6} className="mb-2">
                               <div className="info-item">
                                 <div className="info-label small">
                                   <FaPhone className="me-2 icon-phone" />
                                   <TransText k="profile.mobileNumber" as="span" />
                                 </div>
                                 <div className="info-value">{userData.mobile_no}</div>
                               </div>
                             </Col>
                             <Col md={6} className="mb-2">
                               <div className="info-item">
                                 <div className="info-label small">
                                   <FaUserShield className="me-2 icon-guardian" />
                                   <TransText k="profile.guardianName" as="span" />
                                 </div>
                                 <div className="info-value">{userData.guardian_name}</div>
                               </div>
                             </Col>
                             <Col md={6} className="mb-2">
                               <div className="info-item">
                                 <div className="info-label small">
                                   <FaCalendarAlt className="me-2 icon-calendar" />
                                   <TransText k="profile.dateOfBirth" as="span" />
                                 </div>
                                 <div className="info-value">{userData.date_of_birth}</div>
                               </div>
                             </Col>
                             <Col md={6} className="mb-2">
                               <div className="info-item">
                                 <div className="info-label small">
                                   <FaBuilding className="me-2 icon-education" />
                                   <TransText k="profile.highestEducation" as="span" />
                                 </div>
                                 <div className="info-value">{userData.highest_education}</div>
                               </div>
                             </Col>
                             <Col md={6} className="mb-2">
                               <div className="info-item">
                                 <div className="info-label small">
                                   <FaMapMarkerAlt className="me-2 icon-location" />
                                   <TransText k="profile.address" as="span" />
                                 </div>
                                 <div className="info-value">{userData.address}</div>
                               </div>
                             </Col>
                             <Col md={6} className="mb-3">
                               <div className="info-item">
                                 <div className="info-label">
                                   <FaCalendarAlt className="me-2 icon-calendar" />
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
              <div className="text-center py-5 loading-no-data-padding">
                <p className="text-muted no-data-text"><TransText k="profile.noProfileData" as="span" /></p>
              </div>
            )}
          </Container>
        </div>
      </div>


    </div>
  )
}

export default UserProfile