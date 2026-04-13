import React, { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Card, Spinner, Badge, Button, Form, Modal, Nav, Tab } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import TransText from '../TransText'
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaGraduationCap, FaExternalLinkAlt, FaSearch, FaFilter, FaInfoCircle, FaTimes, FaChalkboardTeacher, FaTools } from 'react-icons/fa'
import { renderContentWithLineBreaks } from '../../utils/contentRenderer'

const JobOpenings = () => {
  const { accessToken, isAuthenticated } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  
  const [jobs, setJobs] = useState([])
  const [seminars, setSeminars] = useState([])
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingSeminars, setLoadingSeminars] = useState(true)
  const [loadingWorkshops, setLoadingWorkshops] = useState(true)
  const [error, setError] = useState(null)
  const [errorSeminars, setErrorSeminars] = useState(null)
  const [errorWorkshops, setErrorWorkshops] = useState(null)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedQualification, setSelectedQualification] = useState('')
  const [showJobModal, setShowJobModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [selectedSeminar, setSelectedSeminar] = useState(null)
  const [showSeminarModal, setShowSeminarModal] = useState(false)
  const [selectedWorkshop, setSelectedWorkshop] = useState(null)
  const [showWorkshopModal, setShowWorkshopModal] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0)

  useEffect(() => {
    setForceUpdate(prev => prev + 1)
  }, [language])

  const uniqueQualifications = useMemo(() => {
    const qualifications = new Set()
    jobs.forEach(job => {
      if (job.qualifications_required && Array.isArray(job.qualifications_required)) {
        job.qualifications_required.forEach(qual => {
          qualifications.add(qual)
        })
      }
    })
    return Array.from(qualifications).sort()
  }, [jobs])

  const filteredJobs = useMemo(() => {
    if (!selectedQualification) return jobs
    return jobs.filter(job => {
      if (job.qualifications_required && Array.isArray(job.qualifications_required)) {
        return job.qualifications_required.includes(selectedQualification)
      }
      return false
    })
  }, [jobs, selectedQualification])

  const [selectedSeminarEligibility, setSelectedSeminarEligibility] = useState('')
  const uniqueSeminarEligibility = useMemo(() => {
    const eligibility = new Set()
    seminars.forEach(seminar => {
      if (seminar.eligibility && Array.isArray(seminar.eligibility)) {
        seminar.eligibility.forEach(elig => {
          eligibility.add(elig)
        })
      }
    })
    return Array.from(eligibility).sort()
  }, [seminars])

  const filteredSeminars = useMemo(() => {
    if (!selectedSeminarEligibility) return seminars
    return seminars.filter(seminar => {
      if (seminar.eligibility && Array.isArray(seminar.eligibility)) {
        return seminar.eligibility.includes(selectedSeminarEligibility)
      }
      return false
    })
  }, [seminars, selectedSeminarEligibility])

  const [selectedWorkshopEligibility, setSelectedWorkshopEligibility] = useState('')
  const uniqueWorkshopEligibility = useMemo(() => {
    const eligibility = new Set()
    workshops.forEach(workshop => {
      if (workshop.eligibility && Array.isArray(workshop.eligibility)) {
        workshop.eligibility.forEach(elig => {
          eligibility.add(elig)
        })
      }
    })
    return Array.from(eligibility).sort()
  }, [workshops])

  const filteredWorkshops = useMemo(() => {
    if (!selectedWorkshopEligibility) return workshops
    return workshops.filter(workshop => {
      if (workshop.eligibility && Array.isArray(workshop.eligibility)) {
        return workshop.eligibility.includes(selectedWorkshopEligibility)
      }
      return false
    })
  }, [workshops, selectedWorkshopEligibility])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/JobOpenings' } })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)

      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }

      const response = await axios.get(
        'https://brjobsedu.com/girls_course/girls_course_backend/api/job-openings/',
        config
      )

      if (response.data.success && Array.isArray(response.data.data)) {
        const activeJobs = response.data.data.filter(job => job.status === 'active')
        setJobs(activeJobs)
      } else {
        setJobs([])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setError('Failed to load job openings')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSeminars = async () => {
    try {
      setLoadingSeminars(true)
      setErrorSeminars(null)

      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }

      const response = await axios.get(
        'https://brjobsedu.com/girls_course/girls_course_backend/api/seminar-items/',
        config
      )

      if (response.data.success && Array.isArray(response.data.data)) {
        const activeSeminars = response.data.data.filter(seminar => seminar.status === 'active')
        setSeminars(activeSeminars)
      } else {
        setSeminars([])
      }
    } catch (error) {
      console.error('Error fetching seminars:', error)
      setErrorSeminars('Failed to load seminars')
      setSeminars([])
    } finally {
      setLoadingSeminars(false)
    }
  }

  const fetchWorkshops = async () => {
    try {
      setLoadingWorkshops(true)
      setErrorWorkshops(null)

      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }

      const response = await axios.get(
        'https://brjobsedu.com/girls_course/girls_course_backend/api/workshop-items/',
        config
      )

      if (response.data.success && Array.isArray(response.data.data)) {
        const activeWorkshops = response.data.data.filter(workshop => workshop.status === 'active')
        setWorkshops(activeWorkshops)
      } else {
        setWorkshops([])
      }
    } catch (error) {
      console.error('Error fetching workshops:', error)
      setErrorWorkshops('Failed to load workshops')
      setWorkshops([])
    } finally {
      setLoadingWorkshops(false)
    }
  }

  useEffect(() => {
    fetchJobs()
    fetchSeminars()
    fetchWorkshops()
  }, [])

  const handleApplyClick = (applyLink) => {
    if (applyLink) {
      window.open(applyLink, '_blank')
    }
  }

  const getJobTypeBadge = (jobType) => {
    const variants = {
      'full_time': 'primary',
      'part_time': 'secondary',
      'internship': 'info',
      'contract': 'warning'
    }
    return variants[jobType] || 'secondary'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const isJobExpired = (lastDate) => {
    if (!lastDate) return false
    return new Date(lastDate) < new Date()
  }

  const handleViewDetails = (job) => {
    setSelectedJob(job)
    setShowJobModal(true)
  }

  const closeModal = () => {
    setShowJobModal(false)
    setSelectedJob(null)
  }

  const handleViewSeminarDetails = (seminar) => {
    setSelectedSeminar(seminar)
    setShowSeminarModal(true)
  }

  const closeSeminarModal = () => {
    setShowSeminarModal(false)
    setSelectedSeminar(null)
  }

  const isWorkshopExpired = (lastDate) => {
    if (!lastDate) return false
    return new Date(lastDate) < new Date()
  }

  const handleViewWorkshopDetails = (workshop) => {
    setSelectedWorkshop(workshop)
    setShowWorkshopModal(true)
  }

  const closeWorkshopModal = () => {
    setShowWorkshopModal(false)
    setSelectedWorkshop(null)
  }

  const isSeminarExpired = (lastDate) => {
    if (!lastDate) return false
    return new Date(lastDate) < new Date()
  }

  const handleRegisterClick = (registerLink) => {
    if (registerLink) {
      window.open(registerLink, '_blank')
    }
  }

  const formatSeminarDateTime = (dateTimeString) => {
    if (!dateTimeString) return ''
    const date = new Date(dateTimeString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="d-flex flex-column">
      <UserTopNav onMenuToggle={handleMenuToggle} isMobile={isMobile} />
      <div className="d-flex flex-1">
        <UseLeftNav 
          showOffcanvas={showOffcanvas} 
          setShowOffcanvas={setShowOffcanvas} 
        />
        
        <div 
          className="flex-grow-1" 
          style={{ 
            marginLeft: isMobile ? '0px' : '220px', 
            padding: isMobile ? '10px' : '20px', 
            minHeight: 'calc(100vh - 70px)',
           
          }}
        >
          <Container className="container-top-fixed" key={forceUpdate}>
            <Row className="mb-4">
              <Col xs={12} className="mt-4">
                <div className="d-flex align-items-center mb-3">
                  <FaBriefcase className="me-2 text-primary" style={{ fontSize: '24px' }} />
                  <h3 className="mb-0 fw-bold">
                    {language === 'hi' ? 'नौकरियां और सेमिनार' : 'Jobs & Seminars'}
                  </h3>
                </div>
                <p className="text-muted">
                  {language === 'hi' 
                    ? 'नई नौकरियों और सेमिनार के अवसरों की खोज करें और अपने करियर को नई ऊँचाइयों तक ले जाएं।' 
                    : 'Explore new job opportunities and seminars and take your career to new heights.'}
                </p>
              </Col>
            </Row>

            <Tab.Container id="jobs-seminars-tabs" defaultActiveKey="jobs">
              <Nav variant="tabs" className="mb-4">
                <Nav.Item>
                  <Nav.Link eventKey="jobs">
                    <FaBriefcase className="me-2" />
                    {language === 'hi' ? 'नौकरियां' : 'Jobs'}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="seminars">
                    <FaChalkboardTeacher className="me-2" />
                    {language === 'hi' ? 'सेमिनार' : 'Seminars'}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="workshops">
                    <FaTools className="me-2" />
                    {language === 'hi' ? 'वर्कशॉप' : 'Workshops'}
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey="jobs">
                  {uniqueQualifications.length > 0 && (
                    <Row className="mb-4">
                      <Col xs={12}>
                        <div className="d-flex align-items-center gap-3 ">
                          <div className="d-flex align-items-center">
                            <FaFilter className="me-2 text-primary" />
                            <span className="fw-semibold me-2">
                              {language === 'hi' ? 'योग्यता फ़िल्टर:' : 'Qualification Filter:'}
                            </span>
                          </div>
                          <Form.Select 
                            style={{ width: 'auto', display: 'inline-block' }}
                            value={selectedQualification}
                            onChange={(e) => setSelectedQualification(e.target.value)}
                          >
                            <option value="">
                              {language === 'hi' ? 'सभी योग्यताएं' : 'All Qualifications'}
                            </option>
                            {uniqueQualifications.map((qual, idx) => (
                              <option key={idx} value={qual}>{qual}</option>
                            ))}
                          </Form.Select>
                          {selectedQualification && (
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => setSelectedQualification('')}
                            >
                              {language === 'hi' ? 'साफ़ करें' : 'Clear'}
                            </Button>
                          )}
                        </div>
                      </Col>
                    </Row>
                  )}

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" style={{ width: '50px', height: '50px' }} />
                      <p className="mt-3">
                        {language === 'hi' ? 'नौकरी के अवसर लोड हो रहे हैं...' : 'Loading job openings...'}
                      </p>
                    </div>
                  ) : filteredJobs.length === 0 ? (
                    <Card className="text-center py-5">
                      <Card.Body>
                        <FaSearch className="text-muted mb-3" style={{ fontSize: '48px' }} />
                        <h5 className="text-muted">
                          {selectedQualification 
                            ? (language === 'hi' ? 'इस योग्यता के लिए कोई नौकरी नहीं मिली' : 'No jobs found for this qualification')
                            : (language === 'hi' ? 'कोई नौकरी उपलब्ध नहीं है' : 'No job openings available')}
                        </h5>
                        <p className="text-muted">
                          {selectedQualification 
                            ? (language === 'hi' ? 'किसी अन्य योग्यता का प्रयास करें' : 'Try a different qualification')
                            : (language === 'hi' ? 'बाद में नए अवसरों की जांच करें' : 'Check back later for new opportunities')}
                        </p>
                      </Card.Body>
                    </Card>
                  ) : (
                    <Row className="g-4">
                      {filteredJobs.map((job, index) => {
                        const isExpired = isJobExpired(job.last_date_to_apply)
                        const title = language === 'hi' && job.title_hindi 
                          ? job.title_hindi 
                          : job.title

                        const descriptions = language === 'hi' && job.description_hindi 
                          ? job.description_hindi 
                          : job.description || []

                        return (
                          <Col key={job.id || index} xs={12} md={6} lg={4}>
                            <Card 
                              className={`h-100 job-card ${isExpired ? 'job-card-expired' : ''}`}
                            >
                              <Card.Body className="d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <Badge bg={getJobTypeBadge(job.job_type)}>
                                    {job.job_type === 'full_time' ? 'Full Time' : 
                                     job.job_type === 'part_time' ? 'Part Time' : 
                                     job.job_type === 'internship' ? 'Internship' : 
                                     job.job_type || 'Job'}
                                  </Badge>
                                  {isExpired && (
                                    <Badge bg="secondary">Expired</Badge>
                                  )}
                                </div>

                                <h5 className="fw-bold mb-2">{title}</h5>
                                
                                <div className="mb-3">
                                  <small className="text-muted d-flex align-items-center mb-1">
                                    <FaMapMarkerAlt className="me-1" /> {job.location}
                                  </small>
                                  <small className="text-muted d-flex align-items-center mb-1">
                                    <FaClock className="me-1" /> {job.experience_required}
                                  </small>
                                  <small className="text-muted d-flex align-items-center">
                                    <FaMoneyBillWave className="me-1" /> {job.salary}
                                  </small>
                                </div>

                                {descriptions && descriptions.length > 0 && (
                                  <div className="mb-3">
                                    <small className="text-muted fw-semibold">
                                      {language === 'hi' ? 'जिम्मेदारियाँ:' : 'Responsibilities:'}
                                    </small>
                                    <ul className="list-unstyled mb-0">
                                      {descriptions.slice(0, 3).map((desc, i) => (
                                        <li key={i} className="text-muted small">
                                          <span className="me-1">•</span>
                                          {desc}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {job.skills_required && job.skills_required.length > 0 && (
                                  <div className="mb-3">
                                    <small className="text-muted fw-semibold">
                                      {language === 'hi' ? 'आवश्यक कौशल:' : 'Required Skills:'}
                                    </small>
                                    <div className="d-flex flex-wrap gap-1">
                                      {job.skills_required.slice(0, 4).map((skill, i) => (
                                        <Badge key={i} bg="light" text="dark" className="fw-normal">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {job.qualifications_required && job.qualifications_required.length > 0 && (
                                  <div className="mb-3">
                                    <small className="text-muted fw-semibold d-block mb-1">
                                      <FaGraduationCap className="me-1" />
                                      {language === 'hi' ? 'योग्यता:' : 'Qualifications:'}
                                    </small>
                                    <div className="d-flex flex-wrap gap-1">
                                      {job.qualifications_required.map((qual, i) => (
                                        <Badge key={i} bg="info" text="white" className="fw-normal">
                                          {qual}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="mt-auto pt-3 border-top">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                      {job.last_date_to_apply && (
                                        <>
                                          <FaClock className="me-1" />
                                          {language === 'hi' ? 'अंतिम तिथि: ' : 'Apply by: '} 
                                          {formatDate(job.last_date_to_apply)}
                                        </>
                                      )}
                                    </small>
                                    <div className="d-flex gap-2">
                                      <Button 
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleViewDetails(job)}
                                      >
                                        <FaInfoCircle className="me-1" />
                                        {language === 'hi' ? 'अधिक' : 'More'}
                                      </Button>
                                      <Button 
                                        variant={isExpired ? 'secondary' : 'primary'}
                                        size="sm"
                                        onClick={() => handleApplyClick(job.apply_link)}
                                        disabled={isExpired || !job.apply_link}
                                      >
                                        <FaExternalLinkAlt className="me-1" />
                                        {language === 'hi' ? 'आवेदन करें' : 'Apply'}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        )
                      })}
                    </Row>
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="seminars">
                  {errorSeminars && (
                    <div className="alert alert-danger" role="alert">
                      {errorSeminars}
                    </div>
                  )}

                  {uniqueSeminarEligibility.length > 0 && (
                    <Row className="mb-4">
                      <Col xs={12}>
                        <div className="d-flex align-items-center gap-3 ">
                          <div className="d-flex align-items-center">
                            <FaFilter className="me-2 text-success" />
                            <span className="fw-semibold me-2">
                              {language === 'hi' ? 'पात्रता फ़िल्टर:' : 'Eligibility Filter:'}
                            </span>
                          </div>
                          <Form.Select 
                            style={{ width: 'auto', display: 'inline-block' }}
                            value={selectedSeminarEligibility}
                            onChange={(e) => setSelectedSeminarEligibility(e.target.value)}
                          >
                            <option value="">
                              {language === 'hi' ? 'सभी पात्रताएं' : 'All Eligibility'}
                            </option>
                            {uniqueSeminarEligibility.map((elig, idx) => (
                              <option key={idx} value={elig}>{elig}</option>
                            ))}
                          </Form.Select>
                          {selectedSeminarEligibility && (
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => setSelectedSeminarEligibility('')}
                            >
                              {language === 'hi' ? 'साफ़ करें' : 'Clear'}
                            </Button>
                          )}
                        </div>
                      </Col>
                    </Row>
                  )}

                  {loadingSeminars ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" style={{ width: '50px', height: '50px' }} />
                      <p className="mt-3">
                        {language === 'hi' ? 'सेमिनार लोड हो रहे हैं...' : 'Loading seminars...'}
                      </p>
                    </div>
                  ) : filteredSeminars.length === 0 ? (
                    <Card className="text-center py-5">
                      <Card.Body>
                        <FaChalkboardTeacher className="text-muted mb-3" style={{ fontSize: '48px' }} />
                        <h5 className="text-muted">
                          {language === 'hi' ? 'कोई सेमिनार उपलब्ध नहीं है' : 'No seminars available'}
                        </h5>
                        <p className="text-muted">
                          {language === 'hi' ? 'बाद में नए अवसरों की जांच करें' : 'Check back later for new opportunities'}
                        </p>
                      </Card.Body>
                    </Card>
                  ) : (
                    <Row className="g-4">
                      {filteredSeminars.map((seminar, index) => {
                        const isExpired = isSeminarExpired(seminar.last_date_to_register)
                        const title = language === 'hi' && seminar.title_hindi 
                          ? seminar.title_hindi 
                          : seminar.title

                        const descriptions = language === 'hi' && seminar.description_hindi 
                          ? seminar.description_hindi 
                          : seminar.description || []

                        return (
                          <Col key={seminar.id || index} xs={12} md={6} lg={4}>
                            <Card 
                              className={`h-100 job-card ${isExpired ? 'job-card-expired' : ''}`}
                            >
                              <Card.Body className="d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <Badge bg={seminar.mode === 'online' ? 'success' : 'primary'}>
                                    {seminar.mode === 'online' ? 'Online' : 'Offline'}
                                  </Badge>
                                  {isExpired && (
                                    <Badge bg="secondary">Expired</Badge>
                                  )}
                                </div>

                                <h5 className="fw-bold mb-2">{title}</h5>
                                
                                <div className="mb-3">
                                  <small className="text-muted d-flex align-items-center mb-1">
                                    <FaMapMarkerAlt className="me-1" /> {seminar.location}
                                  </small>
                                  <small className="text-muted d-flex align-items-center mb-1">
                                    <FaClock className="me-1" /> 
                                    {seminar.start_date_time && seminar.end_date_time 
                                      ? `${formatSeminarDateTime(seminar.start_date_time)} - ${formatSeminarDateTime(seminar.end_date_time).split(',')[1]?.trim() || formatSeminarDateTime(seminar.end_date_time)}`
                                      : seminar.start_date_time || ''}
                                  </small>
                                  <small className="text-muted d-flex align-items-center">
                                    <FaChalkboardTeacher className="me-1" /> {seminar.speaker_name}
                                  </small>
                                </div>

                                {descriptions && descriptions.length > 0 && (
                                  <div className="mb-3">
                                    <small className="text-muted fw-semibold">
                                      {language === 'hi' ? 'विषय:' : 'Topics:'}
                                    </small>
                                    <ul className="list-unstyled mb-0">
                                      {descriptions.slice(0, 3).map((desc, i) => (
                                        <li key={i} className="text-muted small">
                                          <span className="me-1">•</span>
                                          {desc}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {seminar.eligibility && seminar.eligibility.length > 0 && (
                                  <div className="mb-3">
                                    <small className="text-muted fw-semibold d-block mb-1">
                                      <FaGraduationCap className="me-1" />
                                      {language === 'hi' ? 'पात्रता:' : 'Eligibility:'}
                                    </small>
                                    <div className="d-flex flex-wrap gap-1">
                                      {seminar.eligibility.map((elig, i) => (
                                        <Badge key={i} bg="info" text="white" className="fw-normal">
                                          {elig}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {seminar.benefits && seminar.benefits.length > 0 && (
                                  <div className="mb-3">
                                    <small className="text-muted fw-semibold">
                                      {language === 'hi' ? 'लाभ:' : 'Benefits:'}
                                    </small>
                                    <div className="d-flex flex-wrap gap-1">
                                      {seminar.benefits.map((benefit, i) => (
                                        <Badge key={i} bg="success" className="fw-normal">
                                          {benefit}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="mt-auto pt-3 border-top">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                      {seminar.start_date_time && seminar.end_date_time && (
                                        <>
                                          <FaClock className="me-1" />
                                          {language === 'hi' ? 'समय: ' : 'Time: '} 
                                          {formatSeminarDateTime(seminar.start_date_time)} - {formatSeminarDateTime(seminar.end_date_time).split(',')[1]?.trim() || formatSeminarDateTime(seminar.end_date_time)}
                                        </>
                                      )}
                                    </small>
                                    <div className="d-flex gap-2">
                                      <Button 
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleViewSeminarDetails(seminar)}
                                      >
                                        <FaInfoCircle className="me-1" />
                                        {language === 'hi' ? 'अधिक' : 'More'}
                                      </Button>
                                      <Button 
                                        variant={isExpired ? 'secondary' : 'success'}
                                        size="sm"
                                        onClick={() => handleRegisterClick(seminar.registration_link)}
                                        disabled={isExpired || !seminar.registration_link}
                                      >
                                        <FaExternalLinkAlt className="me-1" />
                                        {language === 'hi' ? 'रजिस्टर करें' : 'Register'}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        )
                      })}
                    </Row>
                  )}
                </Tab.Pane>

                <Tab.Pane eventKey="workshops">
                  {errorWorkshops && (
                    <div className="alert alert-danger" role="alert">
                      {errorWorkshops}
                    </div>
                  )}

                  {uniqueWorkshopEligibility.length > 0 && (
                    <Row className="mb-4">
                      <Col xs={12}>
                        <div className="d-flex align-items-center gap-3 ">
                          <div className="d-flex align-items-center">
                            <FaFilter className="me-2 text-warning" />
                            <span className="fw-semibold me-2">
                              {language === 'hi' ? 'पात्रता फ़िल्टर:' : 'Eligibility Filter:'}
                            </span>
                          </div>
                          <Form.Select 
                            style={{ width: 'auto', display: 'inline-block' }}
                            value={selectedWorkshopEligibility}
                            onChange={(e) => setSelectedWorkshopEligibility(e.target.value)}
                          >
                            <option value="">
                              {language === 'hi' ? 'सभी पात्रताएं' : 'All Eligibility'}
                            </option>
                            {uniqueWorkshopEligibility.map((elig, idx) => (
                              <option key={idx} value={elig}>{elig}</option>
                            ))}
                          </Form.Select>
                          {selectedWorkshopEligibility && (
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => setSelectedWorkshopEligibility('')}
                            >
                              {language === 'hi' ? 'साफ़ करें' : 'Clear'}
                            </Button>
                          )}
                        </div>
                      </Col>
                    </Row>
                  )}

                  {loadingWorkshops ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" style={{ width: '50px', height: '50px' }} />
                      <p className="mt-3">
                        {language === 'hi' ? 'वर्कशॉप लोड हो रहे हैं...' : 'Loading workshops...'}
                      </p>
                    </div>
                  ) : filteredWorkshops.length === 0 ? (
                    <Card className="text-center py-5">
                      <Card.Body>
                        <FaTools className="text-muted mb-3" style={{ fontSize: '48px' }} />
                        <h5 className="text-muted">
                          {language === 'hi' ? 'कोई वर्कशॉप उपलब्ध नहीं है' : 'No workshops available'}
                        </h5>
                        <p className="text-muted">
                          {language === 'hi' ? 'बाद में नए अवसरों की जांच करें' : 'Check back later for new opportunities'}
                        </p>
                      </Card.Body>
                    </Card>
                  ) : (
                    <Row className="g-4">
                      {filteredWorkshops.map((workshop, index) => {
                        const isExpired = isWorkshopExpired(workshop.last_date_to_register)
                        const title = language === 'hi' && workshop.title_hindi 
                          ? workshop.title_hindi 
                          : workshop.title

                        const descriptions = language === 'hi' && workshop.description_hindi 
                          ? workshop.description_hindi 
                          : workshop.description || []

                        return (
                          <Col key={workshop.id || index} xs={12} md={6} lg={4}>
                            <Card 
                              className={`h-100 job-card ${isExpired ? 'job-card-expired' : ''}`}
                            >
                              <Card.Body className="d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <Badge bg={workshop.mode === 'online' ? 'success' : 'warning'}>
                                    {workshop.mode === 'online' ? 'Online' : 'Offline'}
                                  </Badge>
                                  {isExpired && (
                                    <Badge bg="secondary">Expired</Badge>
                                  )}
                                </div>

                                <h5 className="fw-bold mb-2">{title}</h5>
                                
                                <div className="mb-3">
                                  <small className="text-muted d-flex align-items-center mb-1">
                                    <FaMapMarkerAlt className="me-1" /> {workshop.location}
                                  </small>
                                  <small className="text-muted d-flex align-items-center mb-1">
                                    <FaClock className="me-1" /> 
                                    {workshop.start_date_time && workshop.end_date_time 
                                      ? `${formatSeminarDateTime(workshop.start_date_time)} - ${formatSeminarDateTime(workshop.end_date_time).split(',')[1]?.trim() || formatSeminarDateTime(workshop.end_date_time)}`
                                      : workshop.start_date_time || ''}
                                  </small>
                                  <small className="text-muted d-flex align-items-center">
                                    <FaTools className="me-1" /> {workshop.instructor_name}
                                  </small>
                                </div>

                                {descriptions && descriptions.length > 0 && (
                                  <div className="mb-3">
                                    <small className="text-muted fw-semibold">
                                      {language === 'hi' ? 'विषय:' : 'Topics:'}
                                    </small>
                                    <ul className="list-unstyled mb-0">
                                      {descriptions.slice(0, 3).map((desc, i) => (
                                        <li key={i} className="text-muted small">
                                          <span className="me-1">•</span>
                                          {desc}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {workshop.eligibility && workshop.eligibility.length > 0 && (
                                  <div className="mb-3">
                                    <small className="text-muted fw-semibold d-block mb-1">
                                      <FaGraduationCap className="me-1" />
                                      {language === 'hi' ? 'पात्रता:' : 'Eligibility:'}
                                    </small>
                                    <div className="d-flex flex-wrap gap-1">
                                      {workshop.eligibility.map((elig, i) => (
                                        <Badge key={i} bg="info" text="white" className="fw-normal">
                                          {elig}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {workshop.benefits && workshop.benefits.length > 0 && (
                                  <div className="mb-3">
                                    <small className="text-muted fw-semibold">
                                      {language === 'hi' ? 'लाभ:' : 'Benefits:'}
                                    </small>
                                    <div className="d-flex flex-wrap gap-1">
                                      {workshop.benefits.map((benefit, i) => (
                                        <Badge key={i} bg="success" className="fw-normal">
                                          {benefit}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="mt-auto pt-3 border-top">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                      {workshop.start_date_time && workshop.end_date_time && (
                                        <>
                                          <FaClock className="me-1" />
                                          {language === 'hi' ? 'समय: ' : 'Time: '} 
                                          {formatSeminarDateTime(workshop.start_date_time)} - {formatSeminarDateTime(workshop.end_date_time).split(',')[1]?.trim() || formatSeminarDateTime(workshop.end_date_time)}
                                        </>
                                      )}
                                    </small>
                                    <div className="d-flex gap-2">
                                      <Button 
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleViewWorkshopDetails(workshop)}
                                      >
                                        <FaInfoCircle className="me-1" />
                                        {language === 'hi' ? 'अधिक' : 'More'}
                                      </Button>
                                      <Button 
                                        variant={isExpired ? 'secondary' : 'warning'}
                                        size="sm"
                                        onClick={() => handleRegisterClick(workshop.registration_link)}
                                        disabled={isExpired || !workshop.registration_link}
                                      >
                                        <FaExternalLinkAlt className="me-1" />
                                        {language === 'hi' ? 'रजिस्टर करें' : 'Register'}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        )
                      })}
                    </Row>
                  )}
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Container>
        </div>
      </div>

      <style>{`
        .job-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
        .job-card .btn {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          padding-left: 8px;
          padding-right: 8px;
          font-size: 0.75rem;
        }
        .nav-tabs .nav-link {
          transition: all 0.3s ease;
        }
        .nav-tabs .nav-link.active {
          background-color: #0d6efd !important;
          color: white !important;
          border-color: #0d6efd !important;
          font-weight: 600;
        }
        .nav-tabs .nav-link:not(.active):hover {
          background-color: #f0f4ff !important;
          color: #0d6efd !important;
        }
      `}</style>

      <Modal show={showJobModal} onHide={closeModal} size="lg" centered key={language}>
        <Modal.Header closeButton style={{ backgroundColor: '#0d6efd', color: 'white' }}>
          <Modal.Title>
            {selectedJob && (language === 'hi' && selectedJob.title_hindi 
                ? selectedJob.title_hindi 
                : selectedJob?.title)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedJob && (
            <>
              <div className="mb-4">
                <div className="d-flex gap-2 mb-3">
                  <Badge bg={getJobTypeBadge(selectedJob.job_type)}>
                    {selectedJob.job_type === 'full_time' ? 'Full Time' : 
                     selectedJob.job_type === 'part_time' ? 'Part Time' : 
                     selectedJob.job_type === 'internship' ? 'Internship' : 
                     selectedJob.job_type || 'Job'}
                  </Badge>
                  {isJobExpired(selectedJob.last_date_to_apply) && (
                    <Badge bg="secondary">Expired</Badge>
                  )}
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2 text-primary" />
                      <span><strong>{language === 'hi' ? 'स्थान:' : 'Location:'}</strong> {selectedJob.location}</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <FaClock className="me-2 text-primary" />
                      <span><strong>{language === 'hi' ? 'अनुभव:' : 'Experience:'}</strong> {selectedJob.experience_required}</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <FaMoneyBillWave className="me-2 text-primary" />
                      <span><strong>{language === 'hi' ? 'वेतन:' : 'Salary:'}</strong> {selectedJob.salary}</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <FaBriefcase className="me-2 text-primary" />
                      <span><strong>{language === 'hi' ? 'नौकरी आईडी:' : 'Job ID:'}</strong> {selectedJob.job_id}</span>
                    </div>
                  </div>
                </div>

                {selectedJob.last_date_to_apply && (
                  <div className="mb-3 p-2 bg-light rounded">
                    <FaClock className="me-2 text-danger" />
                    <strong>{language === 'hi' ? 'अंतिम तिथि:' : 'Last Date to Apply:'}</strong> {formatDate(selectedJob.last_date_to_apply)}
                  </div>
                )}
              </div>

              {(language === 'hi' ? selectedJob.description_hindi : selectedJob.description)?.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">
                    <FaInfoCircle className="me-2" />
                    {language === 'hi' ? 'जिम्मेदारियाँ और कार्य' : 'Responsibilities & Duties'}
                  </h6>
                  <ul className="list-unstyled">
                    {(language === 'hi' ? selectedJob.description_hindi : selectedJob.description)?.map((desc, i) => (
                      <li key={i} className="mb-2 d-flex align-items-start">
                        <span className="me-2 text-primary">•</span>
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.skills_required && selectedJob.skills_required.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">
                    <FaClock className="me-2" />
                    {language === 'hi' ? 'आवश्यक कौशल' : 'Required Skills'}
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedJob.skills_required.map((skill, i) => (
                      <Badge key={i} bg="primary" className="p-2">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.qualifications_required && selectedJob.qualifications_required.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">
                    <FaGraduationCap className="me-2" />
                    {language === 'hi' ? 'योग्यता' : 'Qualifications Required'}
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedJob.qualifications_required.map((qual, i) => (
                      <Badge key={i} bg="info" text="white" className="p-2">
                        {qual}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.created_at && (
                <div className="text-muted small mt-3">
                  <FaClock className="me-1" />
                  {language === 'hi' ? 'पोस्ट किया गया:' : 'Posted on:'} {formatDate(selectedJob.created_at)}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </Button>
          {selectedJob && !isJobExpired(selectedJob.last_date_to_apply) && selectedJob.apply_link && (
            <Button variant="primary" onClick={() => handleApplyClick(selectedJob.apply_link)}>
              <FaExternalLinkAlt className="me-2" />
              {language === 'hi' ? 'अभी आवेदन करें' : 'Apply Now'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={showSeminarModal} onHide={closeSeminarModal} size="lg" centered key={language}>
        <Modal.Header closeButton style={{ backgroundColor: '#198754', color: 'white' }}>
          <Modal.Title>
            {selectedSeminar && (language === 'hi' && selectedSeminar.title_hindi 
                ? selectedSeminar.title_hindi 
                : selectedSeminar?.title)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedSeminar && (
            <>
              <div className="mb-4">
                <div className="d-flex gap-2 mb-3">
                  <Badge bg={selectedSeminar.mode === 'online' ? 'success' : 'primary'}>
                    {selectedSeminar.mode === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                  {isSeminarExpired(selectedSeminar.last_date_to_register) && (
                    <Badge bg="secondary">Expired</Badge>
                  )}
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2 text-success" />
                      <span><strong>{language === 'hi' ? 'स्थान:' : 'Location:'}</strong> {selectedSeminar.location}</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <FaClock className="me-2 text-success" />
                      <span><strong>{language === 'hi' ? 'वक्ता:' : 'Speaker:'}</strong> {selectedSeminar.speaker_name}</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <FaBriefcase className="me-2 text-success" />
                      <span><strong>{language === 'hi' ? 'सेमिनार आईडी:' : 'Seminar ID:'}</strong> {selectedSeminar.seminar_id}</span>
                    </div>
                  </div>
                </div>

                {selectedSeminar.start_date_time && selectedSeminar.end_date_time && (
                  <div className="mb-3 p-2 bg-light rounded">
                    <FaClock className="me-2 text-success" />
                    <strong>{language === 'hi' ? 'समय:' : 'Time:'}</strong> 
                    {formatSeminarDateTime(selectedSeminar.start_date_time)} - {formatSeminarDateTime(selectedSeminar.end_date_time)}
                  </div>
                )}

                {selectedSeminar.last_date_to_register && (
                  <div className="mb-3 p-2 bg-light rounded">
                    <FaClock className="me-2 text-danger" />
                    <strong>{language === 'hi' ? 'पंजीकरण अंतिम तिथि:' : 'Registration Last Date:'}</strong> {formatDate(selectedSeminar.last_date_to_register)}
                  </div>
                )}
              </div>

              {(language === 'hi' ? selectedSeminar.description_hindi : selectedSeminar.description)?.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">
                    <FaInfoCircle className="me-2" />
                    {language === 'hi' ? 'विषय' : 'Topics'}
                  </h6>
                  <ul className="list-unstyled">
                    {(language === 'hi' ? selectedSeminar.description_hindi : selectedSeminar.description)?.map((desc, i) => (
                      <li key={i} className="mb-2 d-flex align-items-start">
                        <span className="me-2 text-success">•</span>
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedSeminar.eligibility && selectedSeminar.eligibility.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">
                    <FaGraduationCap className="me-2" />
                    {language === 'hi' ? 'पात्रता' : 'Eligibility'}
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedSeminar.eligibility.map((elig, i) => (
                      <Badge key={i} bg="info" text="white" className="p-2">
                        {elig}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedSeminar.benefits && selectedSeminar.benefits.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">
                    <FaBriefcase className="me-2" />
                    {language === 'hi' ? 'लाभ' : 'Benefits'}
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedSeminar.benefits.map((benefit, i) => (
                      <Badge key={i} bg="success" className="p-2">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedSeminar.created_at && (
                <div className="text-muted small mt-3">
                  <FaClock className="me-1" />
                  {language === 'hi' ? 'पोस्ट किया गया:' : 'Posted on:'} {formatDate(selectedSeminar.created_at)}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeSeminarModal}>
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </Button>
          {selectedSeminar && !isSeminarExpired(selectedSeminar.last_date_to_register) && selectedSeminar.registration_link && (
            <Button variant="success" onClick={() => handleRegisterClick(selectedSeminar.registration_link)}>
              <FaExternalLinkAlt className="me-2" />
              {language === 'hi' ? 'अभी रजिस्टर करें' : 'Register Now'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={showWorkshopModal} onHide={closeWorkshopModal} size="lg" centered key={language}>
        <Modal.Header closeButton style={{ backgroundColor: '#ffc107', color: 'black' }}>
          <Modal.Title>
            {selectedWorkshop && (language === 'hi' && selectedWorkshop.title_hindi 
                ? selectedWorkshop.title_hindi 
                : selectedWorkshop?.title)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {selectedWorkshop && (
            <>
              <div className="mb-4">
                <div className="d-flex gap-2 mb-3">
                  <Badge bg={selectedWorkshop.mode === 'online' ? 'success' : 'warning'}>
                    {selectedWorkshop.mode === 'online' ? 'Online' : 'Offline'}
                  </Badge>
                  {isWorkshopExpired(selectedWorkshop.last_date_to_register) && (
                    <Badge bg="secondary">Expired</Badge>
                  )}
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2 text-warning" />
                      <span><strong>{language === 'hi' ? 'स्थान:' : 'Location:'}</strong> {selectedWorkshop.location}</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <FaClock className="me-2 text-warning" />
                      <span><strong>{language === 'hi' ? 'प्रशिक्षक:' : 'Instructor:'}</strong> {selectedWorkshop.instructor_name}</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <FaTools className="me-2 text-warning" />
                      <span><strong>{language === 'hi' ? 'वर्कशॉप आईडी:' : 'Workshop ID:'}</strong> {selectedWorkshop.workshop_id}</span>
                    </div>
                  </div>
                </div>

                {selectedWorkshop.start_date_time && selectedWorkshop.end_date_time && (
                  <div className="mb-3 p-2 bg-light rounded">
                    <FaClock className="me-2 text-warning" />
                    <strong>{language === 'hi' ? 'समय:' : 'Time:'}</strong> 
                    {formatSeminarDateTime(selectedWorkshop.start_date_time)} - {formatSeminarDateTime(selectedWorkshop.end_date_time)}
                  </div>
                )}

                {selectedWorkshop.last_date_to_register && (
                  <div className="mb-3 p-2 bg-light rounded">
                    <FaClock className="me-2 text-danger" />
                    <strong>{language === 'hi' ? 'पंजीकरण अंतिम तिथि:' : 'Registration Last Date:'}</strong> {formatDate(selectedWorkshop.last_date_to_register)}
                  </div>
                )}
              </div>

              {(language === 'hi' ? selectedWorkshop.description_hindi : selectedWorkshop.description)?.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">
                    <FaInfoCircle className="me-2" />
                    {language === 'hi' ? 'विषय' : 'Topics'}
                  </h6>
                  <ul className="list-unstyled">
                    {(language === 'hi' ? selectedWorkshop.description_hindi : selectedWorkshop.description)?.map((desc, i) => (
                      <li key={i} className="mb-2 d-flex align-items-start">
                        <span className="me-2 text-warning">•</span>
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedWorkshop.eligibility && selectedWorkshop.eligibility.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">
                    <FaGraduationCap className="me-2" />
                    {language === 'hi' ? 'पात्रता' : 'Eligibility'}
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedWorkshop.eligibility.map((elig, i) => (
                      <Badge key={i} bg="info" text="white" className="p-2">
                        {elig}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedWorkshop.benefits && selectedWorkshop.benefits.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">
                    <FaTools className="me-2" />
                    {language === 'hi' ? 'लाभ' : 'Benefits'}
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedWorkshop.benefits.map((benefit, i) => (
                      <Badge key={i} bg="success" className="p-2">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedWorkshop.created_at && (
                <div className="text-muted small mt-3">
                  <FaClock className="me-1" />
                  {language === 'hi' ? 'पोस्ट किया गया:' : 'Posted on:'} {formatDate(selectedWorkshop.created_at)}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeWorkshopModal}>
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </Button>
          {selectedWorkshop && !isWorkshopExpired(selectedWorkshop.last_date_to_register) && selectedWorkshop.registration_link && (
            <Button variant="warning" onClick={() => handleRegisterClick(selectedWorkshop.registration_link)}>
              <FaExternalLinkAlt className="me-2" />
              {language === 'hi' ? 'अभी रजिस्टर करें' : 'Register Now'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default JobOpenings