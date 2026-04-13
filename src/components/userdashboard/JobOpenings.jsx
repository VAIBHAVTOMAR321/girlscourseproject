import React, { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Card, Spinner, Badge, Button, Form, Modal } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import TransText from '../TransText'
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaGraduationCap, FaExternalLinkAlt, FaSearch, FaFilter, FaInfoCircle, FaTimes } from 'react-icons/fa'
import { renderContentWithLineBreaks } from '../../utils/contentRenderer'

const JobOpenings = () => {
  const { accessToken, isAuthenticated } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedQualification, setSelectedQualification] = useState('')
  const [showJobModal, setShowJobModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)

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
        setJobs(response.data.data)
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

  useEffect(() => {
    fetchJobs()
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
            backgroundColor: '#f5f5f5'
          }}
        >
          <Container className="container-top-fixed">
            <Row className="mb-4">
              <Col xs={12} className="mt-4">
                <div className="d-flex align-items-center mb-3">
                  <FaBriefcase className="me-2 text-primary" style={{ fontSize: '24px' }} />
                  <h3 className="mb-0 fw-bold">Job Openings</h3>
                </div>
                <p className="text-muted">
                  {language === 'hindi' 
                    ? 'नई नौकरियों के अवसरों की खोज करें और अपने करियर को नई ऊँचाइयों तक ले जाएं।' 
                    : 'Explore new job opportunities and take your career to new heights.'}
                </p>
              </Col>
            </Row>

            {uniqueQualifications.length > 0 && (
              <Row className="mb-4">
                <Col xs={12}>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div className="d-flex align-items-center">
                      <FaFilter className="me-2 text-primary" />
                      <span className="fw-semibold me-2">
                        {language === 'hindi' ? 'योग्यता फ़िल्टर:' : 'Qualification Filter:'}
                      </span>
                    </div>
                    <Form.Select 
                      style={{ width: 'auto', display: 'inline-block' }}
                      value={selectedQualification}
                      onChange={(e) => setSelectedQualification(e.target.value)}
                    >
                      <option value="">
                        {language === 'hindi' ? 'सभी योग्यताएं' : 'All Qualifications'}
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
                        {language === 'hindi' ? 'साफ़ करें' : 'Clear'}
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
                  {language === 'hindi' ? 'नौकरी के अवसर लोड हो रहे हैं...' : 'Loading job openings...'}
                </p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <Card className="text-center py-5">
                <Card.Body>
                  <FaSearch className="text-muted mb-3" style={{ fontSize: '48px' }} />
                  <h5 className="text-muted">
                    {selectedQualification 
                      ? (language === 'hindi' ? 'इस योग्यता के लिए कोई नौकरी नहीं मिली' : 'No jobs found for this qualification')
                      : (language === 'hindi' ? 'कोई नौकरी उपलब्ध नहीं है' : 'No job openings available')}
                  </h5>
                  <p className="text-muted">
                    {selectedQualification 
                      ? (language === 'hindi' ? 'किसी अन्य योग्यता का प्रयास करें' : 'Try a different qualification')
                      : (language === 'hindi' ? 'बाद में नए अवसरों की जांच करें' : 'Check back later for new opportunities')}
                  </p>
                </Card.Body>
              </Card>
            ) : (
              <Row className="g-4">
                {filteredJobs.map((job, index) => {
                  const isExpired = isJobExpired(job.last_date_to_apply)
                  const descriptions = language === 'hindi' && job.description_hindi 
                    ? job.description_hindi 
                    : job.description || []
                  const title = language === 'hindi' && job.title_hindi 
                    ? job.title_hindi 
                    : job.title

                  return (
                    <Col key={job.id || index} xs={12} md={6} lg={4}>
                      <Card 
                        className="h-100 job-card" 
                        style={{ 
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          border: isExpired ? '2px solid #dee2e6' : '1px solid #dee2e6'
                        }}
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
                                {language === 'hindi' ? 'जिम्मेदारियाँ:' : 'Responsibilities:'}
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
                                {language === 'hindi' ? 'आवश्यक कौशल:' : 'Required Skills:'}
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
                                {language === 'hindi' ? 'योग्यता:' : 'Qualifications:'}
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
                                    {language === 'hindi' ? 'अंतिम तिथि: ' : 'Apply by: '} 
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
                                  {language === 'hindi' ? 'अधिक' : 'More'}
                                </Button>
                                <Button 
                                  variant={isExpired ? 'secondary' : 'primary'}
                                  size="sm"
                                  onClick={() => handleApplyClick(job.apply_link)}
                                  disabled={isExpired || !job.apply_link}
                                >
                                  <FaExternalLinkAlt className="me-1" />
                                  {language === 'hindi' ? 'आवेदन करें' : 'Apply'}
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
          </Container>
        </div>
      </div>

      <style>{`
        .job-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
      `}</style>

      <Modal show={showJobModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton style={{ backgroundColor: '#0d6efd', color: 'white' }}>
          <Modal.Title>
            {selectedJob && (
              language === 'hindi' && selectedJob.title_hindi 
                ? selectedJob.title_hindi 
                : selectedJob?.title
            )}
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
                      <span><strong>{language === 'hindi' ? 'स्थान:' : 'Location:'}</strong> {selectedJob.location}</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <FaClock className="me-2 text-primary" />
                      <span><strong>{language === 'hindi' ? 'अनुभव:' : 'Experience:'}</strong> {selectedJob.experience_required}</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <FaMoneyBillWave className="me-2 text-primary" />
                      <span><strong>{language === 'hindi' ? 'वेतन:' : 'Salary:'}</strong> {selectedJob.salary}</span>
                    </div>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="d-flex align-items-center">
                      <FaBriefcase className="me-2 text-primary" />
                      <span><strong>{language === 'hindi' ? 'नौकरी आईडी:' : 'Job ID:'}</strong> {selectedJob.job_id}</span>
                    </div>
                  </div>
                </div>

                {selectedJob.last_date_to_apply && (
                  <div className="mb-3 p-2 bg-light rounded">
                    <FaClock className="me-2 text-danger" />
                    <strong>{language === 'hindi' ? 'अंतिम तिथि:' : 'Last Date to Apply:'}</strong> {formatDate(selectedJob.last_date_to_apply)}
                  </div>
                )}
              </div>

              {(language === 'hindi' ? selectedJob.description_hindi : selectedJob.description)?.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">
                    <FaInfoCircle className="me-2" />
                    {language === 'hindi' ? 'जिम्मेदारियाँ और कार्य' : 'Responsibilities & Duties'}
                  </h6>
                  <ul className="list-unstyled">
                    {(language === 'hindi' ? selectedJob.description_hindi : selectedJob.description)?.map((desc, i) => (
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
                    {language === 'hindi' ? 'आवश्यक कौशल' : 'Required Skills'}
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
                    {language === 'hindi' ? 'योग्यता' : 'Qualifications Required'}
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
                  {language === 'hindi' ? 'पोस्ट किया गया:' : 'Posted on:'} {formatDate(selectedJob.created_at)}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            {language === 'hindi' ? 'बंद करें' : 'Close'}
          </Button>
          {selectedJob && !isJobExpired(selectedJob.last_date_to_apply) && selectedJob.apply_link && (
            <Button variant="primary" onClick={() => handleApplyClick(selectedJob.apply_link)}>
              <FaExternalLinkAlt className="me-2" />
              {language === 'hindi' ? 'अभी आवेदन करें' : 'Apply Now'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default JobOpenings