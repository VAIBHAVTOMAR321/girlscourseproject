import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Badge } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import '../../assets/css/Enrollments.css'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCalendar, FaClock, FaUsers, FaLink } from 'react-icons/fa'

const API_URL = 'https://brjobsedu.com/girls_course/girls_course_backend/api/grooming-classes/'

const ManageGroomingClasses = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(10)

  useEffect(() => {
    fetchClasses()
  }, [])

  const getAuthConfig = () => ({
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_URL, getAuthConfig())
      if (response.data && response.data.data) {
        setClasses(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (groomingClass) => {
    navigate('/CreateGroomingClass', { state: { editData: groomingClass } })
  }

  const handleDelete = (groomingClass) => {
    setSelectedClass(groomingClass)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(API_URL, {
        data: { class_id: selectedClass.class_id },
        ...getAuthConfig()
      })
      setShowDeleteModal(false)
      fetchClasses()
      alert('Class deleted successfully!')
    } catch (error) {
      console.error('Error deleting class:', error)
      alert('Failed to delete class')
    }
  }

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-'
    const date = new Date(dateTimeString)
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = classes.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(classes.length / recordsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
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
                  <h4 className="mb-0">Manage Grooming Classes</h4>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigate('/CreateGroomingClass')}>
                  <FaPlus className="me-1" /> Create New Class
                </Button>
              </div>

              <Row>
                <Col xs={12}>
                  <Card className="enrollments-table-card border">
                    <Card.Header className="bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center paid-btn gap-2">
                        <h5 className="mb-0 fw-semibold text-secondary">
                          All Grooming Classes ({classes.length})
                        </h5>
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive">
                        <Table hover className="custom-table align-middle mb-0">
                          <thead className="table-light custom-table">
                            <tr>
                              <th className="ps-2">Class ID</th>
                              <th>Title</th>
                              <th>Description</th>
                              <th><FaLink className="me-1" /> Link</th>
                              <th><FaCalendar className="me-1" /> Start Time</th>
                              <th><FaClock className="me-1" /> End Time</th>
                              <th className="text-end pe-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentRecords.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="text-center py-4 text-muted">
                                  No grooming classes found
                                </td>
                              </tr>
                            ) : (
                              currentRecords.map((groomingClass) => (
                                <tr key={groomingClass.class_id}>
                                  <td className="ps-2">
                                    <span className="text-muted small fw-medium">{groomingClass.class_id}</span>
                                  </td>
                                  <td className="fw-medium text-dark">
                                    {groomingClass.title}
                                    {groomingClass.title_hindi && (
                                      <div className="small text-muted">{groomingClass.title_hindi}</div>
                                    )}
                                  </td>
                                  <td className="small" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {groomingClass.description || '-'}
                                  </td>
                                  <td className="small">
                                    {groomingClass.class_link ? (
                                      <a href={groomingClass.class_link} target="_blank" rel="noopener noreferrer" className="text-primary">
                                        <FaLink />
                                      </a>
                                    ) : '-'}
                                  </td>
                                  <td className="small">
                                    {formatDateTime(groomingClass.start_date_time)}
                                  </td>
                                  <td className="small">
                                    {formatDateTime(groomingClass.end_date_time)}
                                  </td>
                                  <td className="text-end pe-3">
                                    <div className="d-flex gap-1 justify-content-end">
                                      <Button
                                        variant="outline-warning"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleEdit(groomingClass)}
                                        title="Edit"
                                      >
                                        <FaEdit style={{ fontSize: '12px' }} />
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleDelete(groomingClass)}
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
                    </Card.Body>
                    {totalPages > 1 && (
                      <Card.Footer className="bg-light border-top py-2 px-3">
                        <nav aria-label="Grooming classes pagination">
                          <ul className="pagination justify-content-center pagination-sm mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={handlePreviousPage}>‹</button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(page => {
                              return page >= currentPage - 1 && page <= currentPage + 1 && page <= totalPages && page >= 1
                            }).map(page => (
                              <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(page)}>{page}</button>
                              </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button className="page-link" onClick={handleNextPage}>›</button>
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

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this grooming class?</p>
          <p className="text-muted">Class ID: {selectedClass?.class_id}</p>
        </Modal.Body>
        <Modal.Footer>
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

export default ManageGroomingClasses