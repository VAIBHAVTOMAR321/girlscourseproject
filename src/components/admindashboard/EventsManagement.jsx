import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Form, Modal, Table, Spinner, Badge, Nav } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { renderContentWithLineBreaks } from '../../utils/contentRenderer'
import { FaPlus, FaEdit, FaTrash, FaEye, FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaClock } from 'react-icons/fa'

const EventsManagement = ({ onBack }) => {
  const { accessToken } = useAuth()
  
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const eventsPerPage = 10
  
  const [formData, setFormData] = useState({
    event_name: '',
    description: '',
    event_name_hindi: '',
    description_hindi: '',
    venue_hindi: '',
    event_date_time: '',
    end_date_time: '',
    venue: '',
    event_type: '',
    event_image: null
  })

  const getAuthConfig = () => ({
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const response = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/event-item/')
      if (response.data && response.data.success) {
        setEvents(response.data.data)
      }
    } catch (error) {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (event = null) => {
    if (event) {
      setFormData({
        event_id: event.event_id,
        event_name: event.event_name,
        description: event.description || '',
        event_name_hindi: event.event_name_hindi || '',
        description_hindi: event.description_hindi || '',
        venue_hindi: event.venue_hindi || '',
        event_date_time: event.event_date_time ? event.event_date_time.slice(0, 16) : '',
        end_date_time: event.end_date_time ? event.end_date_time.slice(0, 16) : '',
        venue: event.venue || '',
        event_type: event.event_type || '',
        event_image: null
      })
    } else {
      setFormData({
        event_name: '',
        description: '',
        event_name_hindi: '',
        description_hindi: '',
        venue_hindi: '',
        event_date_time: '',
        end_date_time: '',
        venue: '',
        event_type: '',
        event_image: null
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setFormData({
      event_name: '',
      description: '',
      event_name_hindi: '',
      description_hindi: '',
      venue_hindi: '',
      event_date_time: '',
      end_date_time: '',
      venue: '',
      event_type: '',
      event_image: null
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)

    try {
      if (formData.event_image) {
        const formDataToSend = new FormData()
        formDataToSend.append('event_name', formData.event_name)
        formDataToSend.append('description', formData.description)
        formDataToSend.append('event_name_hindi', formData.event_name_hindi)
        formDataToSend.append('description_hindi', formData.description_hindi)
        formDataToSend.append('venue_hindi', formData.venue_hindi)
        formDataToSend.append('event_date_time', formData.event_date_time)
        formDataToSend.append('end_date_time', formData.end_date_time)
        formDataToSend.append('venue', formData.venue)
        formDataToSend.append('event_type', formData.event_type)
        formDataToSend.append('event_image', formData.event_image)
        
        if (formData.event_id) {
          formDataToSend.append('event_id', formData.event_id)
          await axios.put(`https://brjobsedu.com/girls_course/girls_course_backend/api/event-item/`, formDataToSend, {
            headers: {
              ...getAuthConfig().headers,
              'Content-Type': 'multipart/form-data'
            }
          })
          alert('Event updated successfully!')
        } else {
          await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/event-item/', formDataToSend, {
            headers: {
              ...getAuthConfig().headers,
              'Content-Type': 'multipart/form-data'
            }
          })
          alert('Event created successfully!')
        }
      } else {
        const dataToSend = {
          event_name: formData.event_name,
          description: formData.description,
          event_name_hindi: formData.event_name_hindi,
          description_hindi: formData.description_hindi,
          venue_hindi: formData.venue_hindi,
          event_date_time: formData.event_date_time,
          end_date_time: formData.end_date_time,
          venue: formData.venue,
          event_type: formData.event_type
        }

        if (formData.event_id) {
          await axios.put(`https://brjobsedu.com/girls_course/girls_course_backend/api/event-item/`, {
            event_id: formData.event_id,
            ...dataToSend
          }, getAuthConfig())
          alert('Event updated successfully!')
        } else {
          await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/event-item/', dataToSend, getAuthConfig())
          alert('Event created successfully!')
        }
      }
      
      handleCloseModal()
      fetchEvents()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save event')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (event) => {
    if (window.confirm(`Are you sure you want to delete the event "${event.event_name}"?`)) {
      try {
        await axios.delete('https://brjobsedu.com/girls_course/girls_course_backend/api/event-item/', {
          data: { event_id: event.event_id },
          ...getAuthConfig()
        })
        alert('Event deleted successfully!')
        fetchEvents()
      } catch (error) {
        alert('Failed to delete event')
      }
    }
  }

  const handleViewEvent = (event) => {
    setSelectedEvent(event)
    setShowViewModal(true)
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

  const formatEndDateTime = (dateTimeStr) => {
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

  const indexOfLastEvent = currentPage * eventsPerPage
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent)
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const getEventCounts = () => ({
    all: events.length,
    active: events.filter(e => e.is_active).length,
    upcoming: events.filter(e => e.is_upcoming).length,
    past: events.filter(e => e.is_past).length
  })

  const counts = getEventCounts()

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <div>
          <Button variant="outline-secondary" size="sm" onClick={onBack} className="me-2">
            <FaArrowLeft /> Dashboard
          </Button>
          <h4 className="d-inline-block align-middle mb-0">Events Management</h4>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <FaPlus className="me-2" /> Create New Event
        </Button>
      </div>

      <Card className="shadow-sm border-0">
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
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-5">
              <FaCalendarAlt className="text-muted mb-3" style={{ fontSize: '48px' }} />
              <p className="text-muted">No {activeTab === 'all' ? '' : activeTab} events found.</p>
            </div>
          ) : (
            <div>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Event Name</th>
                    <th>Start Date & Time</th>
                    <th>End Date & Time</th>
                    <th>Venue</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEvents.map((event) => (
                    <tr key={event.id}>
                      <td><Badge bg="secondary">{event.event_id}</Badge></td>
                      <td className="fw-semibold">{renderContentWithLineBreaks(event.event_name)}</td>
                      <td>
                        <FaClock className="me-1 text-muted" />
                        {formatDateTime(event.event_date_time)}
                      </td>
                      <td>
                        <FaClock className="me-1 text-muted" />
                        {formatEndDateTime(event.end_date_time)}
                      </td>
                      <td>
                        <FaMapMarkerAlt className="me-1 text-muted" />
                        {event.venue || 'N/A'}
                      </td>
                      <td>{event.event_type || 'N/A'}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button variant="outline-info" size="sm" onClick={() => handleViewEvent(event)}>
                            <FaEye className="me-1" /> View
                          </Button>
                          <Button variant="outline-warning" size="sm" onClick={() => handleOpenModal(event)}>
                            <FaEdit className="me-1" /> Edit
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(event)}>
                            <FaTrash className="me-1" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted">
                    Showing {indexOfFirstEvent + 1}-{Math.min(indexOfLastEvent, filteredEvents.length)} of {filteredEvents.length} events
                  </div>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="me-2"
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="me-1"
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="ms-2"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>{formData.event_id ? 'Edit Event' : 'Create New Event'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Event Name (English) *</Form.Label>
              <Form.Control
                type="text"
                value={formData.event_name}
                onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                placeholder="e.g. Tech Innovation Summit 2026"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Event Name (Hindi)</Form.Label>
              <Form.Control
                type="text"
                value={formData.event_name_hindi}
                onChange={(e) => setFormData({ ...formData, event_name_hindi: e.target.value })}
                placeholder="e.g. वार्षिक टेक सम्मेलन 2026"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (English)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Event description..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (Hindi)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description_hindi}
                onChange={(e) => setFormData({ ...formData, description_hindi: e.target.value })}
                placeholder="एआई, वेब डेवलपमेंट और क्लाउड टेक्नोलॉजी पर आधारित सम्मेलन।"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date & Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.event_date_time}
                    onChange={(e) => setFormData({ ...formData, event_date_time: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.end_date_time}
                    onChange={(e) => setFormData({ ...formData, end_date_time: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Event Type</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                    placeholder="e.g. Adventure Event, Workshop"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Venue (English) *</Form.Label>
              <Form.Control
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. India Expo Centre, Greater Noida"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Venue (Hindi)</Form.Label>
              <Form.Control
                type="text"
                value={formData.venue_hindi}
                onChange={(e) => setFormData({ ...formData, venue_hindi: e.target.value })}
                placeholder="e.g. दिल्ली कन्वेंशन सेंटर"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Event Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, event_image: e.target.files[0] })}
              />
              {formData.event_image && (
                <small className="text-muted d-block mt-1">
                  Selected: {formData.event_image.name}
                </small>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? <Spinner size="sm" animation="border" /> : (formData.event_id ? 'Update Event' : 'Create Event')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title>Event Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <Badge bg="secondary">Event ID: {selectedEvent.event_id}</Badge>
                </Col>
                <Col md={6}>
                  <Badge bg={selectedEvent.is_active ? 'success' : 'secondary'}>
                    {selectedEvent.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {selectedEvent.is_past && <Badge bg="warning" className="ms-1">Past</Badge>}
                  {selectedEvent.is_upcoming && <Badge bg="info" className="ms-1">Upcoming</Badge>}
                </Col>
              </Row>
              
              <h4 className="mb-1">{selectedEvent.event_name}</h4>
              {selectedEvent.event_name_hindi && (
                <h5 className="mb-3 text-muted fst-italic">{selectedEvent.event_name_hindi}</h5>
              )}
               
              {selectedEvent.event_image && (
                <div className="mb-3">
                  <img 
                    src={`https://brjobsedu.com/girls_course/girls_course_backend${selectedEvent.event_image}`} 
                    alt={selectedEvent.event_name}
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
               
              {selectedEvent.description && (
                <div className="mb-3">
                  <h6 className="text-muted">Description (English)</h6>
                  <p>{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.description_hindi && (
                <div className="mb-3">
                  <h6 className="text-muted">Description (Hindi)</h6>
                  <p>{selectedEvent.description_hindi}</p>
                </div>
              )}
               
              <Row>
                <Col md={6} className="mb-3">
                  <h6 className="text-muted"><FaClock className="me-1" /> Start Date & Time</h6>
                  <p>{formatDateTime(selectedEvent.event_date_time)}</p>
                </Col>
                <Col md={6} className="mb-3">
                  <h6 className="text-muted"><FaClock className="me-1" /> End Date & Time</h6>
                  <p>{formatEndDateTime(selectedEvent.end_date_time)}</p>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-3">
                  <h6 className="text-muted"><FaMapMarkerAlt className="me-1" /> Venue (English)</h6>
                  <p>{selectedEvent.venue || 'N/A'}</p>
                </Col>
                {selectedEvent.venue_hindi && (
                  <Col md={6} className="mb-3">
                    <h6 className="text-muted"><FaMapMarkerAlt className="me-1" /> Venue (Hindi)</h6>
                    <p>{selectedEvent.venue_hindi}</p>
                  </Col>
                )}
              </Row>
              
              {selectedEvent.event_type && (
                <div className="mb-3">
                  <h6 className="text-muted">Event Type</h6>
                  <p>{selectedEvent.event_type}</p>
                </div>
              )}
              
              <div className="text-muted small">
                <p>Created: {new Date(selectedEvent.created_at).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
          <Button variant="primary" onClick={() => { setShowViewModal(false); handleOpenModal(selectedEvent) }}>
            <FaEdit className="me-1" /> Edit Event
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default EventsManagement