import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Modal, Nav } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import TransText from '../TransText'
import '../../assets/css/UserQuiz.css'
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaArrowRight, FaEye, FaInfoCircle, FaPlay } from 'react-icons/fa'

const UserEvents = () => {
  const { accessToken } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState('all')
  const eventsPerPage = 9

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

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/event-item/')
      
      if (response.data.success) {
        setEvents(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMenuToggle = () => {
    setShowOffcanvas(!showOffcanvas)
  }

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A'
    const date = new Date(dateTimeStr)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isEventUpcoming = (event) => {
    if (!event.event_date_time) return false
    const eventDate = new Date(event.event_date_time)
    const now = new Date()
    return eventDate > now
  }

  const getFilteredEvents = () => {
    switch (activeTab) {
      case 'active':
        return events.filter(e => e.is_active)
      case 'upcoming':
        return events.filter(e => e.is_upcoming)
      case 'past':
        return events.filter(e => e.is_past)
      default:
        return events
    }
  }

  const filteredEvents = getFilteredEvents()

  const getEventCounts = () => ({
    all: events.length,
    active: events.filter(e => e.is_active).length,
    upcoming: events.filter(e => e.is_upcoming).length,
    past: events.filter(e => e.is_past).length
  })

  const counts = getEventCounts()

  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setShowViewModal(true)
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
                onClick={() => navigate('/UserDashboard')} 
                className="d-flex align-items-center"
              >
                <FaArrowRight className="me-2" style={{ transform: 'rotate(180deg)' }} />
                <TransText k="quiz.backToDashboard" as="span" />
              </Button>
            </div>

            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-light border-bottom py-3">
                <Nav variant="tabs" activeKey={activeTab} onSelect={(key) => { setActiveTab(key); setCurrentPage(1) }}>
                  <Nav.Item>
                    <Nav.Link eventKey="all">
                      All ({counts.all})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="active">
                      Active ({counts.active})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="upcoming">
                      Upcoming ({counts.upcoming})
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="past">
                      Past ({counts.past})
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
            </Card>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" style={{ width: '60px', height: '60px' }} />
                <p className="mt-3">Loading events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <Alert variant="info" className="text-center">
                <FaCalendarAlt className="me-2" />
                No {activeTab === 'all' ? '' : activeTab} events found
              </Alert>
            ) : (
              <div>
              <Row>
                {filteredEvents
                  .slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage)
                  .map((event) => {
                  const upcoming = isEventUpcoming(event)
                  return (
                    <Col md={6} lg={4} key={event.id} className="mb-4">
                      <Card className="h-100 shadow-sm event-card" style={{ 
                        borderRadius: '16px', 
                        border: 'none',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)'
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                      >
<div style={{ 
                          height: '180px',
                          overflow: 'hidden',
                          backgroundColor: '#f8f9fa'
                        }}>
                           {event.event_image ? (
                             <img 
                               src={`https://brjobsedu.com/girls_course/girls_course_backend${event.event_image}`}
                               alt={event.event_name}
                               style={{ 
                                 width: '100%',
                                
                                 objectFit: 'cover'
                               }}
                             />
                           ) : (
                            <div style={{ 
                              height: '100%',
                              background: upcoming 
                                ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                                : 'linear-gradient(135deg, #11998e, #38ef7d)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <div className="text-center text-white">
                                {event.event_type && (
                                  <Badge bg="light" text="dark" className="ms-2">
                                    {event.event_type}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Card.Body className="d-flex flex-column">
                          <div className="mb-3">
                            <h5 className="mb-2 fw-bold" style={{ color: '#333' }}>
                              {language === 'hi' && event.event_name_hindi ? event.event_name_hindi : event.event_name}
                            </h5>
                            {(language === 'hi' ? event.description_hindi : event.description) && (
                              <p className="text-muted small mb-0" style={{ lineHeight: '1.5' }}>
                                {(() => {
                                  const desc = (language === 'hi' && event.description_hindi) ? event.description_hindi : event.description;
                                  return desc && desc.length > 100 
                                    ? desc.substring(0, 100) + '...' 
                                    : desc;
                                })()}
                              </p>
                            )}
                          </div>

                          <div className="mb-3" style={{ flex: 1 }}>
                            <div className="d-flex align-items-center mb-2">
                              <div className="d-flex align-items-center text-muted">
                                <FaClock className="me-2 text-primary" style={{ fontSize: '14px' }} />
                                <small>Start: {formatDateTime(event.event_date_time)}</small>
                              </div>
                            </div>
                            
                            {event.end_date_time && (
                              <div className="d-flex align-items-center mb-2">
                                <div className="d-flex align-items-center text-muted">
                                  <FaClock className="me-2 text-danger" style={{ fontSize: '14px' }} />
                                  <small>End: {formatDateTime(event.end_date_time)}</small>
                                </div>
                              </div>
                            )}
                            
                            {event.venue && (
                              <div className="d-flex align-items-center">
                                <div className="d-flex align-items-center text-muted">
                                  <FaMapMarkerAlt className="me-2 text-success" style={{ fontSize: '14px' }} />
                                  <small>
                                    {language === 'hi' && event.venue_hindi ? event.venue_hindi : event.venue}
                                  </small>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-auto pt-3">
                            <Button
                              variant="outline-primary"
                              className="w-100 d-flex align-items-center justify-content-center"
                              onClick={() => handleViewEvent(event)}
                              style={{ 
                                borderRadius: '8px',
                                fontWeight: '600',
                                padding: '10px 16px'
                              }}
                            >
                              <FaEye className="me-2" />
                              View Details
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  )
                })}
              </Row>
              
              {filteredEvents.length > eventsPerPage && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div className="text-muted">
                    Showing {((currentPage - 1) * eventsPerPage) + 1}-{Math.min(currentPage * eventsPerPage, filteredEvents.length)} of {filteredEvents.length} events
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.ceil(filteredEvents.length / eventsPerPage) }, function(_, i) { return i + 1 }).map(function(page) { return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ); })}
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={currentPage === Math.ceil(filteredEvents.length / eventsPerPage)}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              </div>
            )}
          </Container>
        </div>
      </div>

      {/* View Event Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaCalendarAlt className="me-2" />
            Event Details
          </Modal.Title>
        </Modal.Header>
<Modal.Body>
          {selectedEvent && (
            <div>
              {selectedEvent.event_image && (
                <div className="mb-3">
                  <img 
                    src={`https://brjobsedu.com/girls_course/girls_course_backend${selectedEvent.event_image}`}
                    alt={selectedEvent.event_name}
                    className="img-fluid rounded"
                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                  />
                </div>
              )}
              
              <div className="mb-4">
                <Badge bg="secondary" className="me-2">{selectedEvent.event_id}</Badge>
                {selectedEvent.event_type && (
                  <Badge bg="info">{selectedEvent.event_type}</Badge>
                )}
              </div>
               
              <h4 className="mb-3">
                {language === 'hi' && selectedEvent.event_name_hindi ? selectedEvent.event_name_hindi : selectedEvent.event_name}
              </h4>
               
              {(language === 'hi' ? selectedEvent.description_hindi : selectedEvent.description) && (
                <div className="mb-4">
                  <h6 className="text-muted mb-2">
                    {language === 'hi' ? 'विवरण' : 'Description'}
                  </h6>
                  <p className="">{language === 'hi' && selectedEvent.description_hindi ? selectedEvent.description_hindi : selectedEvent.description}</p>
                </div>
              )}
              
              <Row className="mb-4">
                <Col md={6}>
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted mb-2">
                      <FaClock className="me-2" /> 
                      {language === 'hi' ? 'शुरुआत का समय' : 'Start Date & Time'}
                    </h6>
                    <p className="mb-0 fw-semibold">{formatDateTime(selectedEvent.event_date_time)}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 bg-light rounded">
                    <h6 className="text-muted mb-2">
                      <FaClock className="me-2" /> 
                      {language === 'hi' ? 'समाप्ति का समय' : 'End Date & Time'}
                    </h6>
                    <p className="mb-0 fw-semibold">
                      {selectedEvent.end_date_time ? formatDateTime(selectedEvent.end_date_time) : 'N/A'}
                    </p>
                  </div>
                </Col>
              </Row>
              
              <div className="p-3 bg-light rounded">
                <h6 className="text-muted mb-2">
                  <FaMapMarkerAlt className="me-2" /> 
                  {language === 'hi' ? 'स्थान' : 'Venue'}
                </h6>
                <p className="mb-0 fw-semibold">
                  {(language === 'hi' && selectedEvent.venue_hindi) ? selectedEvent.venue_hindi : (selectedEvent.venue || 'N/A')}
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default UserEvents