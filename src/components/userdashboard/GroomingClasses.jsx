import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner, Button, Badge } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import { FaGraduationCap, FaArrowLeft, FaClock, FaUsers, FaCheckCircle, FaVideo, FaCalendarAlt } from 'react-icons/fa'

const translations = {
  en: {
    title: 'Grooming Classes',
    subtitle: 'Enhance your skills with professional grooming courses',
    backToDashboard: 'Back to Dashboard',
    loading: 'Loading...',
    noClasses: 'No grooming classes available at the moment.',
    duration: 'Duration',
    seats: 'Participants',
    enrolled: 'Enrolled',
    enrollNow: 'Join Now',
    joinClass: 'Join Class',
    participants: 'participants'
  },
  hi: {
    title: 'ग्रूमिंग क्लासेस',
    subtitle: 'पेशेवर ग्रूमिंग कोर्स से अपने कौशल को बढ़ाएं',
    backToDashboard: 'डैशबोर्ड पर वापस जाएं',
    loading: 'लोड हो रहा है...',
    noClasses: 'इस समय कोई ग्रूमिंग क्लास उपलब्ध नहीं है।',
    duration: 'अवधि',
    seats: 'प्रतिभागी',
    enrolled: 'नामांकित',
    enrollNow: 'अभी जुड़ें',
    joinClass: 'क्लास में शामिल हों',
    participants: 'प्रतिभागी'
  }
}

const GroomingClasses = () => {
  const { uniqueId, accessToken, userRoleType } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(null)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [groomingClasses, setGroomingClasses] = useState([])
  const [enrolledClasses, setEnrolledClasses] = useState([])
  const [participantCounts, setParticipantCounts] = useState({})
  const t = translations[language] || translations.en

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, participationRes] = await Promise.all([
          axios.get(
            'https://brjobsedu.com/girls_course/girls_course_backend/api/grooming-classes/',
            {
              headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
              timeout: 10000
            }
          ),
          axios.get(
            'https://brjobsedu.com/girls_course/girls_course_backend/api/grooming-participation/',
            {
              headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
              timeout: 10000
            }
          )
        ])
        
        if (classesRes.data.success && classesRes.data.data) {
          setGroomingClasses(classesRes.data.data || [])
          
          const counts = {}
          if (participationRes.data.success && participationRes.data.data) {
            const allParticipation = participationRes.data.data
            allParticipation.forEach(p => {
              counts[p.class_id] = (counts[p.class_id] || 0) + 1
            })
            setParticipantCounts(counts)
            
            const userEnrolled = allParticipation
              .filter(p => p.student_id === uniqueId)
              .map(p => p.class_id)
            setEnrolledClasses(userEnrolled)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (accessToken && uniqueId) {
      fetchData()
    }
  }, [accessToken, uniqueId])

  const handleEnroll = async (classId, classLink) => {
    if (enrolling) return
    setEnrolling(classId)
    
    try {
      await axios.post(
        'https://brjobsedu.com/girls_course/girls_course_backend/api/grooming-participation/',
        {
          student_id: uniqueId,
          class_id: classId
        },
        {
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          timeout: 10000
        }
      )
      
      setEnrolledClasses(prev => [...prev, classId])
      setParticipantCounts(prev => ({
        ...prev,
        [classId]: (prev[classId] || 0) + 1
      }))
      
      if (classLink) {
        window.open(classLink, '_blank')
      }
    } catch (error) {
      console.error('Error enrolling:', error)
    } finally {
      setEnrolling(null)
    }
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDuration = (start, end) => {
    if (!start || !end) return ''
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffMinutes = (endDate - startDate) / (1000 * 60)
    if (diffMinutes >= 60) {
      const hours = Math.floor(diffMinutes / 60)
      const mins = diffMinutes % 60
      return `${hours}h ${mins}m`
    }
    return `${diffMinutes} min`
  }

  const handleMenuToggle = () => {
    if (isMobile) {
      setShowOffcanvas(!showOffcanvas)
    }
  }

  return (
    <div className="d-flex flex-column">
      <UserTopNav onMenuToggle={handleMenuToggle} isMobile={isMobile} />
      <div className="d-flex flex-1">
        <UseLeftNav showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas} />
        
        <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '220px', padding: isMobile ? '10px' : '20px', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid>
            <div className="mb-4">
              <Button variant="outline-secondary" onClick={() => navigate('/UserDashboard')} className="d-flex align-items-center">
                <FaArrowLeft className="me-2" />
                {t.backToDashboard}
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" style={{ width: '60px', height: '60px' }}>
                  <span className="visually-hidden">{t.loading}</span>
                </div>
                <p className="mt-3">{t.loading}</p>
              </div>
            ) : (
              <>
                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <Card.Body className="card-mobile py-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                      <div className="text-white">
                        <h2 className="mb-2 fw-bold">
                          <FaGraduationCap className="me-2" />
                          {t.title}
                        </h2>
                        <p className="mb-0 opacity-75">{t.subtitle}</p>
                      </div>
                      <div className="d-flex gap-3">
                        <div className="text-center text-white">
                          <div className="fs-1 fw-bold">{groomingClasses.length}</div>
                          <div className="small opacity-75">{language === 'hi' ? 'क्लासेस' : 'Classes'}</div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {groomingClasses.length === 0 ? (
                  <Card className="shadow-sm border-0" style={{ borderRadius: '15px' }}>
                    <Card.Body className="text-center py-5">
                      <FaGraduationCap size={50} className="text-muted mb-3" />
                      <p className="text-muted mb-0">{t.noClasses}</p>
                    </Card.Body>
                  </Card>
                ) : (
                  <Row>
                    {groomingClasses.map((cls) => {
                      const isEnrolled = enrolledClasses.includes(cls.class_id)
                      const participantCount = participantCounts[cls.class_id] || 0
                      
                      return (
                        <Col lg={4} md={6} className="mb-4" key={cls.class_id}>
                          <Card className="h-100 border-0" style={{ cursor: 'pointer', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                            <div className="p-3" style={{ background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)' }}>
                              <FaVideo size={40} className="text-primary" />
                            </div>
                            <Card.Body className="p-3">
                              <h5 className="mb-2 fw-bold text-dark">
                                {language === 'hi' ? cls.title_hindi || cls.title : cls.title}
                              </h5>
                              <p className="text-muted small mb-3">
                                {language === 'hi' ? cls.description_hindi || cls.description : cls.description}
                              </p>
                              
                              <div className="d-flex flex-wrap gap-2 mb-3">
                                <Badge bg="light" text="dark" className="d-flex align-items-center">
                                  <FaCalendarAlt className="me-1" size={12} />
                                  {formatDateTime(cls.start_date_time)}
                                </Badge>
                                <Badge bg="light" text="dark" className="d-flex align-items-center">
                                  <FaClock className="me-1" size={12} />
                                  {getDuration(cls.start_date_time, cls.end_date_time)}
                                </Badge>
                                <Badge bg="info" className="d-flex align-items-center">
                                  <FaUsers className="me-1" size={12} />
                                  {participantCount} {t.participants}
                                </Badge>
                              </div>

                              <div className="d-flex gap-2">
                                {isEnrolled ? (
                                  <Button className="w-100" disabled style={{ background: '#28a745', border: 'none', color: 'white' }}>
                                    <FaCheckCircle className="me-2" />
                                    {t.enrolled}
                                  </Button>
                                ) : (
                                  <Button 
                                    className="w-100" 
                                    onClick={() => handleEnroll(cls.class_id)}
                                    disabled={enrolling === cls.class_id}
                                    style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: 'none', color: 'white', fontWeight: 'bold' }}
                                  >
                                    {enrolling === cls.class_id ? (
                                      <Spinner size="sm" className="me-2" />
                                    ) : null}
                                    {t.enrollNow}
                                  </Button>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      )
                    })}
                  </Row>
                )}
              </>
            )}
          </Container>
        </div>
      </div>
    </div>
  )
}

export default GroomingClasses