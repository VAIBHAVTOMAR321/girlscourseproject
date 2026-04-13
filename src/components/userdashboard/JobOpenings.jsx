import React, { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Card, Spinner, Badge, Button, Form } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import TransText from '../TransText'
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaGraduationCap, FaExternalLinkAlt, FaSearch, FaFilter } from 'react-icons/fa'
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
    </div>
  )
}

export default JobOpenings