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
        
        <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '220px', padding: isMobile ? '12px' : '28px', minHeight: 'calc(100vh - 70px)', backgroundColor: '#fafbfc' }}>
          <Container fluid className='fixed-profile'>
            {/* Back Button */}
            <div className="mb-5">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/UserDashboard')} 
                className="d-flex align-items-center"
                style={{ borderColor: '#d1d5db', color: '#4b5563', fontSize: '0.95rem', fontWeight: '500', padding: '8px 16px' }}
              >
                <FaArrowLeft className="me-2" />
                <TransText k="profile.backToDashboard" as="span" />
              </Button>
            </div>
            
            {updateSuccess && (
              <Alert variant="success" className="mb-4 animate-fade-in border-0" style={{ backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px', padding: '14px 18px', fontWeight: '500' }}>
                <FaCheck className="me-2" />
                <TransText k="profile.profileUpdated" as="span" />
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-5" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
                <Spinner animation="border" variant="primary" style={{ width: '50px', height: '50px', opacity: 0.8 }} />
                <p className="mt-4" style={{ color: '#6b7280', fontWeight: '500', fontSize: '0.95rem' }}><TransText k="profile.loading" as="span" /></p>
              </div>
            ) : userData ? (
              <Row>
                <Col lg={12}>
                   {/* Profile Header Card */}
                   <Card className="shadow-sm mb-4 border-0 profile-header-card" style={{ borderRadius: '12px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}>
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
                                 style={{ width: '90px', height: '90px', objectFit: 'cover', border: '3px solid #f0f4f8' }}
                               />
                             ) : (userRoleType !== 'student-unpaid' && userData.profile_photo) ? (
                               <img 
                                 src={`https://brjobsedu.com/girls_course/girls_course_backend/${userData.profile_photo}`} 
                                 alt="Profile" 
                                 className="profile-image rounded-circle" 
                                 style={{ width: '90px', height: '90px', objectFit: 'cover', border: '3px solid #f0f4f8' }}
                               />
                             ) : (
                               <div className="profile-image bg-gradient-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px', border: '3px solid #f0f4f8' }}>
                                 <FaUser className="text-white" style={{ fontSize: '36px' }} />
                               </div>
                             )}
                           </div>
                            <div>
                             <h3 className="mb-1" style={{ fontWeight: '700', color: '#1a202c', fontSize: '1.4rem' }}>{userRoleType === 'student-unpaid' ? userData.full_name : userData.candidate_name}</h3>
                             <p className="mb-0" style={{ fontSize: '0.95rem', color: '#718096', fontWeight: '500' }}>
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
                               style={{ fontSize: '0.9rem', fontWeight: '500', padding: '8px 16px', borderColor: '#cbd5e0', color: '#0284c7' }}
                             >
                               <FaIdCard className="me-2" style={{ fontSize: '16px' }} />
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
                                 style={{ fontSize: '0.9rem', fontWeight: '500', padding: '8px 16px', borderColor: '#cbd5e0', color: '#2563eb' }}
                               >
                                 <FaUser className="me-2" style={{ fontSize: '16px' }} />
                                 <TransText k={selectedFile ? "profile.changePhoto" : "profile.updatePhoto"} as="span" />
                               </Button>
                               {selectedFile && (
                                 <Button 
                                   variant="primary" 
                                   className="d-flex align-items-center"
                                   onClick={handleUpload}
                                   disabled={uploading}
                                   style={{ fontSize: '0.9rem', fontWeight: '500', padding: '8px 16px', backgroundColor: '#2563eb', borderColor: '#2563eb' }}
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
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #0c4a6e 100%)',
                      color: 'white',
                      boxShadow: '0 4px 15px rgba(30, 64, 175, 0.25)',
                      overflow: 'hidden'
                    }}>
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <div className="d-flex align-items-center">
                            <div className="bg-white bg-opacity-20 rounded-circle p-2 me-2" style={{ backdropFilter: 'blur(10px)', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)' }}>
                              <FaChartLine className="text-white" style={{ fontSize: '18px' }} />
                            </div>
                            <div>
                              <h6 className="mb-0 fw-bold" style={{ fontSize: '1rem' }}>Quiz Performance</h6>
                              <small className="text-white-50" style={{ fontSize: '0.75rem' }}>Track your progress</small>
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold" style={{ fontSize: '1.8rem', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                              {quizProgress.averagePercentage}<span style={{ fontSize: '1rem' }}>%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div style={{ 
                            background: 'rgba(255,255,255,0.15)', 
                            borderRadius: '8px', 
                            height: '20px',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}>
                            <div style={{ 
                              width: `${quizProgress.averagePercentage}%`,
                              background: quizProgress.averagePercentage >= 70 
                                ? 'linear-gradient(90deg, #10b981, #34d399)' 
                                : quizProgress.averagePercentage >= 50 
                                  ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' 
                                  : 'linear-gradient(90deg, #ef4444, #f87171)',
                              height: '100%',
                              borderRadius: '8px',
                              transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                            }} />
                          </div>
                        </div>
                        
                        <Row className="text-center g-2">
                          <Col xs={6}>
                            <div className="bg-white bg-opacity-10 rounded-2 py-2" style={{ backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                              <div className="fs-5 fw-bold">{quizProgress.participated}</div>
                              <div className="small text-white-50" style={{ fontSize: '0.7rem' }}>Completed</div>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div className="bg-white bg-opacity-10 rounded-2 py-2" style={{ backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                              <div className="fs-5 fw-bold">{quizProgress.total}</div>
                              <div className="small text-white-50" style={{ fontSize: '0.7rem' }}>Total</div>
                            </div>
                          </Col>
                        </Row>
                        
                        {quizProgress.participated === quizProgress.total && quizProgress.total > 0 && (
                          <div className="mt-2 text-center">
                            <Badge bg="warning" text="dark" className="py-1 px-2" style={{ borderRadius: '15px', fontSize: '0.75rem' }}>
                              🎉 All Completed!
                            </Badge>
                          </div>
                        )}
                      </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-0 profile-details-card" style={{ borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}>
                     <Card.Header className="bg-white border-bottom pt-4 pb-3 px-4" style={{ borderBottomColor: '#e5e7eb', borderRadius: '12px 12px 0 0', borderWidth: '1px' }}>
                       <h6 className="mb-0" style={{ fontWeight: '700', fontSize: '1rem', color: '#1a202c', letterSpacing: '0.3px' }}>
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
                                  <FaIdCard className="me-2" style={{ color: '#3b82f6' }} />
                                  <TransText k="profile.studentId" as="span" />
                                </div>
                                <div className="info-value">{userData.student_id}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaIdCard className="me-2" style={{ color: '#3b82f6' }} />
                                  <TransText k="profile.aadhaarNumber" as="span" />
                                </div>
                                <div className="info-value">{userData.aadhaar_no}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaEnvelope className="me-2" style={{ color: '#06b6d4' }} />
                                  <TransText k="profile.emailAddress" as="span" />
                                </div>
                                <div className="info-value text-truncate">{userData.email}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaPhone className="me-2" style={{ color: '#10b981' }} />
                                  <TransText k="profile.mobileNumber" as="span" />
                                </div>
                                <div className="info-value">{userData.phone}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaMapMarkerAlt className="me-2" style={{ color: '#ef4444' }} />
                                  <TransText k="profile.district" as="span" />
                                </div>
                                <div className="info-value">{userData.district}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaMapMarkerAlt className="me-2" style={{ color: '#ef4444' }} />
                                  <TransText k="profile.block" as="span" />
                                </div>
                                <div className="info-value">{userData.block}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaMapMarkerAlt className="me-2" style={{ color: '#ef4444' }} />
                                  <TransText k="profile.state" as="span" />
                                </div>
                                <div className="info-value">{userData.state}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-3">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaBuilding className="me-2" style={{ color: '#f59e0b' }} />
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
                                  <FaEnvelope className="me-2" style={{ color: '#06b6d4' }} />
                                  <TransText k="profile.emailAddress" as="span" />
                                </div>
                                <div className="info-value text-truncate">{userData.email}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaPhone className="me-2" style={{ color: '#10b981' }} />
                                  <TransText k="profile.mobileNumber" as="span" />
                                </div>
                                <div className="info-value">{userData.mobile_no}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaUserShield className="me-2" style={{ color: '#8b5cf6' }} />
                                  <TransText k="profile.guardianName" as="span" />
                                </div>
                                <div className="info-value">{userData.guardian_name}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaCalendarAlt className="me-2" style={{ color: '#3b82f6' }} />
                                  <TransText k="profile.dateOfBirth" as="span" />
                                </div>
                                <div className="info-value">{userData.date_of_birth}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaBuilding className="me-2" style={{ color: '#f59e0b' }} />
                                  <TransText k="profile.highestEducation" as="span" />
                                </div>
                                <div className="info-value">{userData.highest_education}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-2">
                              <div className="info-item">
                                <div className="info-label small">
                                  <FaMapMarkerAlt className="me-2" style={{ color: '#ef4444' }} />
                                  <TransText k="profile.address" as="span" />
                                </div>
                                <div className="info-value">{userData.address}</div>
                              </div>
                            </Col>
                            <Col md={6} className="mb-3">
                              <div className="info-item">
                                <div className="info-label">
                                  <FaCalendarAlt className="me-2" style={{ color: '#3b82f6' }} />
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
              <div className="text-center py-5" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
                <p className="text-muted" style={{ fontSize: '1rem', color: '#6b7280', fontWeight: '500' }}><TransText k="profile.noProfileData" as="span" /></p>
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
          background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.25);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .profile-image:hover {
          transform: scale(1.06);
          box-shadow: 0 6px 16px rgba(30, 64, 175, 0.35);
        }

        .profile-header-card {
          background: white;
          border-radius: 12px;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }

        .profile-header-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          transform: translateY(-1px);
        }

        .quiz-progress-card {
          position: relative;
          overflow: hidden;
        }

        .profile-details-card {
          background: white;
          border-radius: 12px;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }

        .profile-details-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          transform: translateY(-1px);
        }

        .info-item {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 10px;
          padding: 16px;
          transition: all 0.3s ease;
          border: 1px solid #e5e7eb;
          height: 100%;
        }

        .info-item:hover {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: #d1d5db;
        }

        .info-label {
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 700;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .info-value {
          font-size: 0.95rem;
          color: '#1a202c';
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
            font-size: 0.75rem;
          }

          .info-value {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  )
}

export default UserProfile