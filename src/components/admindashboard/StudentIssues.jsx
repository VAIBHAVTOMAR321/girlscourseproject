import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Form, Badge } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import '../../assets/css/Enrollments.css'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaReply, FaCheck, FaTimes, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa'

const API_URL = 'https://brjobsedu.com/girls_course/girls_course_backend/api/student-issue/'

const StudentIssues = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [queries, setQueries] = useState([])
  const [filteredQueries, setFilteredQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(15)
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedCards, setExpandedCards] = useState({})

  // Reply form state
  const [replyData, setReplyData] = useState({
    extra_remark: '',
    status: ''
  })

  useEffect(() => {
    fetchQueries()
  }, [])

  useEffect(() => {
    // Filter queries based on search term and status
    let filtered = queries

    // Apply search filter
    if (searchTerm !== '') {
      filtered = filtered.filter(query => {
        return query.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.query_id.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(query => query.status === filterStatus)
    }

    setFilteredQueries(filtered)
    setCurrentPage(1)
  }, [searchTerm, queries, filterStatus])

  const fetchQueries = async () => {
    try {
      setLoading(true)
      const config = {}
      if (accessToken) {
        config.headers = {
          'Authorization': `Bearer ${accessToken}`
        }
      }

      const response = await axios.get(API_URL, config)

      if (response.data.status) {
        setQueries(response.data.data)
        setFilteredQueries(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching queries:', error)
    } finally {
      setLoading(false)
    }
  }

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredQueries.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredQueries.length / recordsPerPage)

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

  const handleReply = (query) => {
    setSelectedQuery(query)
    setReplyData({
      extra_remark: query.extra_remark || '',
      status: query.status || 'pending'
    })
    setShowReplyModal(true)
  }

  const handleDelete = (query) => {
    setSelectedQuery(query)
    setShowDeleteModal(true)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
  }

  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const submitReply = async () => {
    try {
      const payload = {
        query_id: selectedQuery.query_id,
        extra_remark: replyData.extra_remark,
        status: replyData.status
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }

      await axios.put(API_URL, payload, config)
      setShowReplyModal(false)
      fetchQueries()
      alert('Query updated successfully!')
    } catch (error) {
      console.error('Error updating query:', error)
      alert('Failed to update query')
    }
  }

  const confirmDelete = async () => {
    try {
      const payload = {
        query_id: selectedQuery.query_id
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }

      await axios.delete(API_URL, {
        data: payload,
        ...config
      })
      setShowDeleteModal(false)
      fetchQueries()
      alert('Query deleted successfully!')
    } catch (error) {
      console.error('Error deleting query:', error)
      alert('Failed to delete query')
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

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge bg="warning" text="dark">Pending</Badge>
      case 'accepted':
      case 'resolved':
        return <Badge bg="success">Resolved</Badge>
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>
      default:
        return <Badge bg="secondary">{status || 'Pending'}</Badge>
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-warning text-dark'
      case 'accepted':
      case 'resolved':
        return 'bg-success'
      case 'rejected':
        return 'bg-danger'
      default:
        return 'bg-secondary'
    }
  }

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-wrapper d-flex">
          <AdminLeftNav show={showSidebar} setShow={setShowSidebar} />
          <div className={`admin-main-content flex-grow-1 ${!showSidebar ? 'sidebar-compact' : ''}`}>
            <AdminTopNav />
            <div className="content-area">
              <Container fluid className=''>
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
          <div className="content-area">
            <Container className='mob-top-view'>
              <div className="d-flex justify-content-between align-items-center mb-4 page-header">
                <div className="d-flex align-items-center all-en-box gap-3">
                  <Button variant="outline-secondary" size="sm" onClick={() => navigate('/AdminDashboard')} className="me-2">
                    <FaArrowLeft /> Dashboard
                  </Button>
                  <h4 className="mb-0">Student Issues / Queries</h4>
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
                        <Col md={4} xs={12}>
                          <Form.Group controlId="searchTerm">
                            <Form.Label className="small fw-medium mb-1">Search</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Search by name, ID, title..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="search-input"
                              size="sm"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4} xs={6}>
                          <Form.Group controlId="filterStatus">
                            <Form.Label className="small fw-medium mb-1">Status</Form.Label>
                            <Form.Select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              size="sm"
                            >
                              <option value="all">All Status</option>
                              <option value="pending">Pending</option>
                              <option value="accepted">Accepted</option>
                              <option value="resolved">Resolved</option>
                              <option value="rejected">Rejected</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4} xs={6} className="d-flex align-items-end">
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
                          All Queries
                        </h5>
                      </div>
                      <span className="text-muted small">
                        Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredQueries.length)} of {filteredQueries.length} records
                      </span>
                    </Card.Header>
                    <Card.Body className="p-0">
                      {/* Desktop Table View */}
                      <div className="table-responsive d-none d-lg-block">
                        <Table hover className="custom-table align-middle mb-0">
                          <thead className="table-light custom-table">
                            <tr>
                              <th className="ps-2">Query ID</th>
                              <th>Student Name</th>
                              <th>Student ID</th>
                              <th>Title</th>
                              <th>Issue</th>
                              <th>Status</th>
                              <th>Extra Remark</th>
                              <th>Date</th>
                              <th className="text-end pe-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentRecords.length === 0 ? (
                              <tr>
                                <td colSpan="9" className="text-center py-4 text-muted">
                                  No queries found
                                </td>
                              </tr>
                            ) : (
                              currentRecords.map((query) => (
                                <tr key={query.id}>
                                  <td className="ps-2"><span className="text-muted small fw-medium">{query.query_id}</span></td>
                                  <td className="fw-medium text-dark">{query.full_name}</td>
                                  <td className="small">{query.student_id}</td>
                                  <td className="small">{query.title}</td>
                                  <td className="small" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {query.issue}
                                  </td>
                                  <td className="small">
                                    {getStatusBadge(query.status)}
                                  </td>
                                  <td className="small text-muted" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {query.extra_remark || '-'}
                                  </td>
                                  <td className="small">{formatDate(query.created_at)}</td>
                                  <td className="text-end pe-3">
                                    <div className="d-flex gap-1 justify-content-end">
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleReply(query)}
                                        title="Reply"
                                      >
                                        <FaReply style={{ fontSize: '12px' }} />
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleDelete(query)}
                                        title="Delete"
                                      >
                                        <FaTrash style={{ fontSize: '12px' }} />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </Table>
                      </div>

                      {/* Mobile Card View */}
                      <div className="d-lg-none">
                        {currentRecords.length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            No queries found
                          </div>
                        ) : (
                          currentRecords.map((query) => (
                            <Card key={query.id} className="mb-3 mx-2 query-card">
                              <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="mb-1 fw-semibold">{query.full_name}</h6>
                                    <small className="text-muted">ID: {query.student_id}</small>
                                  </div>
                                  <Badge bg="secondary" className="small">#{query.query_id}</Badge>
                                </div>
                                
                                <div className="mb-2">
                                  <small className="text-muted d-block">Title:</small>
                                  <span className="small fw-medium">{query.title}</span>
                                </div>

                                <div className="mb-2">
                                  <small className="text-muted d-block">Status:</small>
                                  <span className={`badge ${getStatusBadgeClass(query.status)} small`}>
                                    {query.status || 'Pending'}
                                  </span>
                                </div>

                                <div className="mb-2">
                                  <small className="text-muted d-block">Date:</small>
                                  <span className="small">{formatDate(query.created_at)}</span>
                                </div>

                                {/* Expandable Details */}
                                <div className="mt-3">
                                  <Button 
                                    variant="link" 
                                    className="p-0 text-decoration-none d-flex align-items-center gap-1"
                                    onClick={() => toggleCardExpansion(query.id)}
                                  >
                                    {expandedCards[query.id] ? <FaChevronUp /> : <FaChevronDown />}
                                    <small>{expandedCards[query.id] ? 'Hide Details' : 'Show Details'}</small>
                                  </Button>
                                  
                                  {expandedCards[query.id] && (
                                    <div className="mt-3 pt-3 border-top">
                                      <Row className="g-2">
                                        <Col xs={12}>
                                          <small className="text-muted d-block">Issue:</small>
                                          <p className="small mb-0 mt-1">{query.issue}</p>
                                        </Col>
                                        {query.extra_remark && (
                                          <Col xs={12}>
                                            <small className="text-muted d-block">Extra Remark:</small>
                                            <p className="small mb-0 mt-1">{query.extra_remark}</p>
                                          </Col>
                                        )}
                                      </Row>
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="d-flex gap-2 mt-3 pt-3 border-top">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="flex-fill"
                                    onClick={() => handleReply(query)}
                                  >
                                    <FaReply className="me-1" /> Reply
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="flex-fill"
                                    onClick={() => handleDelete(query)}
                                  >
                                    <FaTrash className="me-1" /> Delete
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          ))
                        )}
                      </div>
                    </Card.Body>
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Card.Footer className="bg-light border-top py-2 px-3">
                        <nav aria-label="Queries pagination">
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
                                <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
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

      {/* Reply Modal */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            Reply to Query - {selectedQuery?.query_id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          {selectedQuery && (
            <div>
              <Row className="mb-3">
                <Col md={6} xs={12}>
                  <p className="mb-1"><strong>Student Name:</strong></p>
                  <p className="text-muted">{selectedQuery.full_name}</p>
                </Col>
                <Col md={6} xs={12}>
                  <p className="mb-1"><strong>Student ID:</strong></p>
                  <p className="text-muted">{selectedQuery.student_id}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <p className="mb-1"><strong>Title:</strong></p>
                  <p className="text-muted">{selectedQuery.title}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <p className="mb-1"><strong>Issue:</strong></p>
                  <p className="text-muted">{selectedQuery.issue}</p>
                </Col>
              </Row>
              <hr />
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Update Status</strong></Form.Label>
                  <Form.Select
                    value={replyData.status}
                    onChange={(e) => setReplyData({ ...replyData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Reply / Extra Remark</strong></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={replyData.extra_remark}
                    onChange={(e) => setReplyData({ ...replyData, extra_remark: e.target.value })}
                    placeholder="Enter your reply or remark..."
                  />
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitReply}>
            <FaCheck className="me-1" /> Submit Reply
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          <p>Are you sure you want to delete this query?</p>
          <p className="text-muted">Query ID: {selectedQuery?.query_id}</p>
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <FaTrash className="me-1" /> Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default StudentIssues
