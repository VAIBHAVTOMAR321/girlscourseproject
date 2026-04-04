import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Alert, Form, Button } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import TransText from '../TransText'
import { getTranslation } from '../../utils/translations'
import { FaArrowLeft, FaPaperPlane, FaHistory, FaClock } from 'react-icons/fa'

const API_URL = 'https://brjobsedu.com/girls_course/girls_course_backend/api/student-issue/'

function UserQuery() {
  const { uniqueId, accessToken, userRoleType } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    title: '',
    issue: ''
  })
  
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Check admin role and redirect
  useEffect(() => {
    if (userRoleType === 'admin') {
      navigate('/AdminDashboard')
    }
  }, [userRoleType, navigate])

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

  // Fetch all queries on component mount and initialize student_id from auth
  useEffect(() => {
    if (uniqueId) {
      setFormData(prev => ({ ...prev, student_id: uniqueId }))
      fetchQueries()
    }
  }, [uniqueId, accessToken])

  const fetchQueries = async () => {
    setLoading(true)
    try {
      console.log('Fetching queries with student_id:', uniqueId)
      const response = await fetch(`${API_URL}?student_id=${uniqueId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('API Response:', result)
        
        // Handle both response formats - with status/data or direct array
        let userQueries = []
        if (result.status && result.data) {
          userQueries = result.data
        } else if (Array.isArray(result)) {
          userQueries = result
        }
        console.log('Filtered queries:', userQueries)
        setQueries(userQueries)
      } else {
        console.error('Failed to fetch queries, status:', response.status)
      }
    } catch (error) {
      console.error('Error fetching queries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: getTranslation('query.querySubmitted', language) })
        setFormData({
          full_name: formData.full_name,
          student_id: uniqueId,
          title: '',
          issue: ''
        })
        // Refresh the queries list
        fetchQueries()
      } else {
        const errorData = await response.json()
        setMessage({ type: 'danger', text: errorData.message || getTranslation('query.failedSubmit', language) })
      }
    } catch (error) {
      console.error('Error submitting query:', error)
      setMessage({ type: 'danger', text: getTranslation('query.errorOccurred', language) })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatus = (status) => {
    if (!status || status.trim() === '' || status === 'pending') {
      return getTranslation('query.pending', language)
    }
    if (status.toLowerCase() === 'resolved') {
      return getTranslation('query.resolved', language)
    }
    if (status.toLowerCase() === 'completed') {
      return getTranslation('query.completed', language)
    }
    if (status.toLowerCase() === 'rejected') {
      return getTranslation('query.rejected', language)
    }
    if (status.toLowerCase() === 'cancelled') {
      return getTranslation('query.cancelled', language)
    }
    // Fallback: Capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
  }

  const getStatusBadgeClass = (status) => {
    if (!status || status.trim() === '' || status === 'pending') {
      return 'bg-warning'
    }
    if (status.toLowerCase() === 'resolved' || status.toLowerCase() === 'completed') {
      return 'bg-success'
    }
    if (status.toLowerCase() === 'rejected' || status.toLowerCase() === 'cancelled') {
      return 'bg-danger'
    }
    return 'bg-info'
  }

  return (
    <div className="d-flex flex-column">
      <UserTopNav onMenuToggle={handleMenuToggle} isMobile={isMobile} />
      <div className="d-flex flex-1">
        <UseLeftNav 
          showOffcanvas={showOffcanvas} 
          setShowOffcanvas={setShowOffcanvas} 
        />
        
        <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '220px', padding: isMobile ? '10px' : '20px', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid>
            <div className="mb-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => window.location.href = '/UserDashboard'} 
                className="d-flex align-items-center"
              >
                <FaArrowLeft className="me-2" />
                <TransText k="query.backToDashboard" as="span" />
              </Button>
            </div>

            <Row>
              <Col lg={12}>
                {/* Query Form Card */}
                <div className="mb-4" style={{ borderRadius: '10px', border: '1px solid #dee2e6', backgroundColor: '#fff' }}>
                  <div className="bg-white border-bottom-0 pt-3 px-3">
                    <h5 className="mb-0 d-flex align-items-center">
                      <FaPaperPlane className="me-2 text-primary" />
                      <TransText k="query.raiseAQuery" as="span" />
                    </h5>
                  </div>
                  <div className="p-3">
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label><TransText k="query.fullName" as="span" /></Form.Label>
                            <Form.Control
                              type="text"
                              name="full_name"
                              value={formData.full_name}
                              onChange={handleInputChange}
                              placeholder={"Enter your full name"}
                              required
                            />
                          </Form.Group>
                        </Col>
                        {/* <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label>Student ID</Form.Label>
                            <Form.Control
                              type="text"
                              name="student_id"
                              value={formData.student_id}
                              onChange={handleInputChange}
                              placeholder="Enter your student ID"
                              disabled
                            />
                          </Form.Group>
                        </Col> */}
                      
                      
                    
                        <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label><TransText k="query.title" as="span" /></Form.Label>
                            <Form.Control
                              type="text"
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              placeholder="Enter query title"
                              required
                            />
                          </Form.Group>
                        </Col>
                         <Col md={6} className="mb-3">
                          <Form.Group>
                            <Form.Label><TransText k="query.issueDescription" as="span" /></Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              name="issue"
                              value={formData.issue}
                              onChange={handleInputChange}
                              placeholder="Describe your issue or query in detail..."
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      
                     

                      {message.text && (
                        <Alert variant={message.type} className="mb-3">
                          {message.text}
                        </Alert>
                      )}

                      <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={submitting}
                        className="d-flex align-items-center"
                      >
                        <FaPaperPlane className="me-2" />
                        <TransText k={submitting ? "query.submitting" : "query.submitQuery"} as="span" />
                      </Button>
                    </Form>
                  </div>
                </div>

                {/* Queries Table Card */}
                <Card className="shadow-sm border-0" style={{ borderRadius: '10px' }}>
                  <Card.Header className="bg-white border-bottom-0 pt-3">
                    <h5 className="mb-0 d-flex align-items-center">
                      <FaHistory className="me-2 text-primary" />
                      <TransText k="query.myQueries" as="span" />
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {loading ? (
                      <div className="text-center py-4">
                        <p className="text-muted"><TransText k="query.loadingQueries" as="span" /></p>
                      </div>
                    ) : queries.length === 0 ? (
                      <Alert variant="info" className="d-flex align-items-center">
                        <FaClock className="me-2" />
                        <TransText k="query.noQueries" as="span" />
                      </Alert>
                    ) : (
                      <Table responsive striped bordered hover className="mb-0">
                        <thead>
                          <tr>
                            <th><TransText k="query.queryId" as="span" /></th>
                            <th><TransText k="query.title" as="span" /></th>
                            <th><TransText k="query.issue" as="span" /></th>
                            <th><TransText k="query.status" as="span" /></th>
                            <th><TransText k="query.remark" as="span" /></th>
                            <th><TransText k="query.submittedOn" as="span" /></th>
                          </tr>
                        </thead>
                        <tbody>
                          {queries.map((query) => (
                            <tr key={query.id}>
                              <td>{query.query_id || query.id}</td>
                              <td>{query.title}</td>
                              <td>{query.issue}</td>
                              <td>
                                <span className={`badge ${getStatusBadgeClass(query.status)}`}>
                                  {getStatus(query.status)}
                                </span>
                              </td>
                              <td>{query.extra_remark || '-'}</td>
                              <td>{query.created_at ? new Date(query.created_at).toLocaleDateString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>

      <style jsx>{`
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
      `}</style>
    </div>
  )
}

export default UserQuery