import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Form, Nav } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import '../../assets/css/Enrollments.css'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'

const Feedback = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [feedbacks, setFeedbacks] = useState([])
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(50)
  const [filterCourse, setFilterCourse] = useState('all')
  const [filterRating, setFilterRating] = useState('all')
  const [courses, setCourses] = useState([])

  useEffect(() => {
    fetchFeedbacks()
  }, [])

  useEffect(() => {
    // Extract unique courses from feedbacks
    const uniqueCourses = [...new Set(feedbacks.map(f => f.course_name))]
    setCourses(uniqueCourses)
  }, [feedbacks])

  useEffect(() => {
    // Filter feedbacks based on search term, course, and rating
    let filtered = feedbacks

    // Apply search filter
    if (searchTerm !== '') {
      filtered = filtered.filter(feedback => {
        return feedback.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feedback.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feedback.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feedback.course_id.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    // Apply course filter
    if (filterCourse !== 'all') {
      filtered = filtered.filter(feedback => feedback.course_name === filterCourse)
    }

    // Apply rating filter
    if (filterRating !== 'all') {
      filtered = filtered.filter(feedback => {
        return feedback.question_1 === filterRating ||
          feedback.question_2 === filterRating ||
          feedback.question_3 === filterRating ||
          feedback.question_4 === filterRating ||
          feedback.question_5 === filterRating
      })
    }

    setFilteredFeedbacks(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [searchTerm, feedbacks, filterCourse, filterRating])

  const fetchFeedbacks = async () => {
    try {
      setLoading(true)
      const config = {
        headers: {}
      }
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`
      }

      const response = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/course-feedback/', config)

      if (response.data.success) {
        setFeedbacks(response.data.data)
        setFilteredFeedbacks(response.data.data) // Initialize filtered list
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredFeedbacks.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredFeedbacks.length / recordsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleView = (feedback) => {
    setSelectedFeedback(feedback)
    setShowViewModal(true)
  }

  const handleDelete = (feedback) => {
    setSelectedFeedback(feedback)
    setShowDeleteModal(true)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterCourse('all')
    setFilterRating('all')
  }

  const confirmDelete = async () => {
    try {
      const payload = {
        id: selectedFeedback.id
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }

      const response = await axios.delete('https://brjobsedu.com/girls_course/girls_course_backend/api/course-feedback/', {
        data: payload,
        ...config
      })
      setShowDeleteModal(false)
      fetchFeedbacks()
      alert('Feedback deleted successfully!')
    } catch (error) {
      alert('Failed to delete feedback')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-wrapper d-flex">
          <AdminLeftNav show={showSidebar} setShow={setShowSidebar} />
          <div className={`admin-main-content flex-grow-1 ${!showSidebar ? 'sidebar-compact' : ''}`}>
            <AdminTopNav />
            <div className="content-area p-4">
              <Container fluid>
                <div className="d-flex align-items-center justify-content-center h-100">
                  <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                </div>
              </Container>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-layout">
      <div className="admin-wrapper d-flex">
        <AdminLeftNav show={showSidebar} setShow={setShowSidebar} />
        <div className={`admin-main-content flex-grow-1 ${!showSidebar ? 'sidebar-compact' : ''}`}>
          <AdminTopNav />
          <div className="content-area p-4">
            <Container fluid>
              <div className="d-flex justify-content-between align-items-center mb-4 page-header">
                <div className="d-flex align-items-center all-en-box gap-3">
                  <Button variant="outline-secondary back-btn" size="sm" onClick={() => navigate('/AdminDashboard')} className="me-2">
                    <FaArrowLeft /> Dashboard
                  </Button>
                  <h4 className="mb-0">Course Feedback</h4>
                </div>
              </div>
              <Row>
                <Col xs={12}>
                  {/* Filter Section */}
                  <Card className="mb-4 border">
                    <Card.Header className="bg-light border-bottom py-2 px-3">
                      <h6 className="mb-0 fw-semibold text-secondary">Filters</h6>
                    </Card.Header>
                    <Card.Body className="py-3 px-3">
                      <Row className="g-3">
                        <Col md={3}>
                          <Form.Group controlId="searchTerm">
                            <Form.Label className="small fw-medium mb-1">Search</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Search by name, ID, course..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="search-input"
                              size="sm"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group controlId="filterCourse">
                            <Form.Label className="small fw-medium mb-1">Course</Form.Label>
                            <Form.Select
                              value={filterCourse}
                              onChange={(e) => setFilterCourse(e.target.value)}
                              size="sm"
                            >
                              <option value="all">All Courses</option>
                              {courses.map((course, index) => (
                                <option key={index} value={course}>{course}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group controlId="filterRating">
                            <Form.Label className="small fw-medium mb-1">Rating</Form.Label>
                            <Form.Select
                              value={filterRating}
                              onChange={(e) => setFilterRating(e.target.value)}
                              size="sm"
                            >
                              <option value="all">All Ratings</option>
                              <option value="Excellent">Excellent</option>
                              <option value="Good">Good</option>
                              <option value="Average">Average</option>
                              <option value="Poor">Poor</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3} className="d-flex align-items-end">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleClearFilters}
                            className="w-100"
                          >
                            Clear Filters
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <Card className="enrollments-table-card border">
                    <Card.Header className="bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center paid-btn gap-2">
                        <h5 className="mb-0 fw-semibold text-secondary">
                          All Feedbacks
                        </h5>
                      </div>
                      <span className="text-muted small">
                        Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredFeedbacks.length)} of {filteredFeedbacks.length} records
                      </span>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <Table hover className="custom-table align-middle mb-0">
                          <thead className="table-light custom-table">
                            <tr>
                              <th className="ps-2">ID</th>
                              <th>Student Name</th>
                              <th>Student ID</th>
                              <th>Course Name</th>
                              <th>Course ID</th>
                              <th>Q1</th>
                              <th>Q2</th>
                              <th>Q3</th>
                              <th>Q4</th>
                              <th>Q5</th>
                              <th>Comment</th>
                              <th>Date</th>
                              <th className="text-end pe-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentRecords.map((feedback) => (
                              <tr key={feedback.id}>
                                <td className="ps-2"><span className="text-muted small fw-medium">{feedback.id}</span></td>
                                <td className="fw-medium text-dark">{feedback.full_name}</td>
                                <td className="small">{feedback.student_id}</td>
                                <td className="small">{feedback.course_name}</td>
                                <td className="small">{feedback.course_id}</td>
                                <td className="small">
                                  <span className={`status-badge ${feedback.question_1 === 'Excellent' ? 'bg-success' : feedback.question_1 === 'Good' ? 'bg-info' : feedback.question_1 === 'Average' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                    {feedback.question_1}
                                  </span>
                                </td>
                                <td className="small">
                                  <span className={`status-badge ${feedback.question_2 === 'Excellent' ? 'bg-success' : feedback.question_2 === 'Good' ? 'bg-info' : feedback.question_2 === 'Average' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                    {feedback.question_2}
                                  </span>
                                </td>
                                <td className="small">
                                  <span className={`status-badge ${feedback.question_3 === 'Excellent' ? 'bg-success' : feedback.question_3 === 'Good' ? 'bg-info' : feedback.question_3 === 'Average' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                    {feedback.question_3}
                                  </span>
                                </td>
                                <td className="small">
                                  <span className={`status-badge ${feedback.question_4 === 'Excellent' ? 'bg-success' : feedback.question_4 === 'Good' ? 'bg-info' : feedback.question_4 === 'Average' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                    {feedback.question_4}
                                  </span>
                                </td>
                                <td className="small">
                                  <span className={`status-badge ${feedback.question_5 === 'Excellent' ? 'bg-success' : feedback.question_5 === 'Good' ? 'bg-info' : feedback.question_5 === 'Average' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                                    {feedback.question_5}
                                  </span>
                                </td>
                                <td className="small text-muted" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {feedback.comment || '-'}
                                </td>
                                <td className="small">{formatDate(feedback.created_at)}</td>
                                <td className="text-end pe-3">
                                  <div className="action-buttons justify-content-end gap-1">
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      className="action-btn"
                                      onClick={() => handleView(feedback)}
                                    >
                                      View
                                    </Button>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      className="action-btn"
                                      onClick={() => handleDelete(feedback)}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Card.Body>
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Card.Footer className="bg-light border-top py-2 px-3">
                        <nav aria-label="Feedbacks pagination">
                          <ul className="pagination justify-content-center pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={handlePreviousPage}>
                                <i className="fas fa-chevron-left"></i>
                              </button>
                            </li>

                            {/* Previous pages */}
                            {currentPage > 2 && (
                              <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
                              </li>
                            )}
                            {currentPage > 3 && (
                              <li className="page-item disabled">
                                <span className="page-link">...</span>
                              </li>
                            )}

                            {/* Current and surrounding pages */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(page => {
                              return page >= currentPage - 1 && page <= currentPage + 1 && page <= totalPages && page >= 1
                            }).map(page => (
                              <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(page)}>
                                  {page}
                                </button>
                              </li>
                            ))}

                            {/* Next pages */}
                            {currentPage < totalPages - 2 && (
                              <li className="page-item disabled">
                                <span className="page-link">...</span>
                              </li>
                            )}
                            {currentPage < totalPages - 1 && (
                              <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                                  {totalPages}
                                </button>
                              </li>
                            )}

                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={handleNextPage}>
                                <i className="fas fa-chevron-right"></i>
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </Card.Footer>
                    )}
                  </Card>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            Feedback Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedFeedback && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <p className="mb-1"><strong>Student Name:</strong></p>
                  <p className="text-muted">{selectedFeedback.full_name}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1"><strong>Student ID:</strong></p>
                  <p className="text-muted">{selectedFeedback.student_id}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <p className="mb-1"><strong>Course Name:</strong></p>
                  <p className="text-muted">{selectedFeedback.course_name}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1"><strong>Course ID:</strong></p>
                  <p className="text-muted">{selectedFeedback.course_id}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <p className="mb-1"><strong>Feedback ID:</strong></p>
                  <p className="text-muted">{selectedFeedback.id}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1"><strong>Date:</strong></p>
                  <p className="text-muted">{formatDate(selectedFeedback.created_at)}</p>
                </Col>
              </Row>
              <hr />
              <h6 className="fw-semibold mb-3">Feedback Responses</h6>
              <Row className="mb-3">
                <Col md={4}>
                  <p className="mb-1"><strong>Question 1:</strong></p>
                  <span className={`status-badge ${selectedFeedback.question_1 === 'Excellent' ? 'bg-success' : selectedFeedback.question_1 === 'Good' ? 'bg-info' : selectedFeedback.question_1 === 'Average' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                    {selectedFeedback.question_1}
                  </span>
                </Col>
                <Col md={4}>
                  <p className="mb-1"><strong>Question 2:</strong></p>
                  <span className={`status-badge ${selectedFeedback.question_2 === 'Excellent' ? 'bg-success' : selectedFeedback.question_2 === 'Good' ? 'bg-info' : selectedFeedback.question_2 === 'Average' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                    {selectedFeedback.question_2}
                  </span>
                </Col>
                <Col md={4}>
                  <p className="mb-1"><strong>Question 3:</strong></p>
                  <span className={`status-badge ${selectedFeedback.question_3 === 'Excellent' ? 'bg-success' : selectedFeedback.question_3 === 'Good' ? 'bg-info' : selectedFeedback.question_3 === 'Average' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                    {selectedFeedback.question_3}
                  </span>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <p className="mb-1"><strong>Question 4:</strong></p>
                  <span className={`status-badge ${selectedFeedback.question_4 === 'Excellent' ? 'bg-success' : selectedFeedback.question_4 === 'Good' ? 'bg-info' : selectedFeedback.question_4 === 'Average' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                    {selectedFeedback.question_4}
                  </span>
                </Col>
                <Col md={4}>
                  <p className="mb-1"><strong>Question 5:</strong></p>
                  <span className={`status-badge ${selectedFeedback.question_5 === 'Excellent' ? 'bg-success' : selectedFeedback.question_5 === 'Good' ? 'bg-info' : selectedFeedback.question_5 === 'Average' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                    {selectedFeedback.question_5}
                  </span>
                </Col>
              </Row>
              {selectedFeedback.comment && (
                <Row className="mt-3">
                  <Col>
                    <p className="mb-1"><strong>Comment:</strong></p>
                    <p className="text-muted">{selectedFeedback.comment}</p>
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="secondary" size="sm" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedFeedback && (
            <p>Are you sure you want to delete feedback from <strong>{selectedFeedback.full_name}</strong> for course <strong>{selectedFeedback.course_name}</strong>?</p>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="secondary" size="sm" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Feedback
