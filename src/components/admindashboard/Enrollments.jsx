import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Form } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import '../../assets/css/Enrollments.css' 

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([])
  const [filteredEnrollments, setFilteredEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(50)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  useEffect(() => {
    // Filter enrollments based on search term
    if (searchTerm === '') {
      setFilteredEnrollments(enrollments)
      setCurrentPage(1) // Reset to first page when search term is cleared
    } else {
      const filtered = enrollments.filter(enrollment => 
        enrollment.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.phone.includes(searchTerm) ||
        enrollment.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEnrollments(filtered)
      setCurrentPage(1) // Reset to first page when search term changes
    }
  }, [searchTerm, enrollments])

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/')
      if (response.data.success) {
        setEnrollments(response.data.data)
        setFilteredEnrollments(response.data.data) // Initialize filtered list
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredEnrollments.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredEnrollments.length / recordsPerPage)

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

  const handleView = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowViewModal(true)
  }

  const handleChangePassword = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowChangePasswordModal(true)
  }

  const handleDelete = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowDeleteModal(true)
  }

  const confirmChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    try {
      const payload = {
        student_id: selectedEnrollment.student_id,
        password: newPassword
      }
      const response = await axios.put('https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/', payload)
      setShowChangePasswordModal(false)
      setNewPassword('')
      setConfirmPassword('')
      alert('Password changed successfully!')
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Failed to change password')
    }
  }

  const confirmDelete = async () => {
    try {
      const payload = {
        student_id: selectedEnrollment.student_id
      }
      const response = await axios.delete('https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/', {
        data: payload
      })
      setShowDeleteModal(false)
      fetchEnrollments()
      alert('Enrollment deleted successfully!')
    } catch (error) {
      console.error('Error deleting enrollment:', error)
      alert('Failed to delete enrollment')
    }
  }

  if (loading) {
    return (
      <div className="enrollments-page d-flex flex-column min-vh-100">
        <AdminTopNav />
        <div className="d-flex flex-grow-1 overflow-hidden">
          <AdminLeftNav />
          <div className="flex-grow-1 d-flex align-items-center justify-content-center main-content-wrapper">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="enrollments-page d-flex flex-column min-vh-100">
      <AdminTopNav />
      <div className="d-flex flex-grow-1 overflow-hidden">
        <AdminLeftNav />
        
        <div className="flex-grow-1 main-content-wrapper p-4">
          <Container fluid>
            <Row>
              <Col xs={12}>
                {/* Search and Filter Section */}
                <Card className="filter-card shadow-sm border-0 mb-3">
                  <Card.Body className="p-4">
                    <Form.Group controlId="searchTerm">
                      <Form.Control 
                        type="text" 
                        placeholder="Search by student name, ID, phone, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>

                <Card className="enrollments-table-card shadow-sm border-0">
                  <Card.Header className="bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 fw-bold text-secondary">All Enrollments</h4>
                    <span className="text-muted small">
                      Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredEnrollments.length)} of {filteredEnrollments.length} records
                    </span>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover className="custom-table align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="ps-4">Student ID</th>
                            <th>Full Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th className="text-end pe-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentRecords.map((enrollment) => (
                            <tr key={enrollment.id}>
                              <td className="ps-4"><span className="text-muted small fw-bold">{enrollment.student_id}</span></td>
                              <td className="fw-semibold text-dark">{enrollment.full_name}</td>
                              <td>{enrollment.phone}</td>
                              <td><small className="text-muted">{enrollment.email}</small></td>
                              <td>
                                <span className={`status-badge ${enrollment.status === 'active' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                  {enrollment.status}
                                </span>
                              </td>
                              <td className="text-end pe-4">
                                <div className="action-buttons justify-content-end gap-2">
                                  <Button 
                                    variant="primary" 
                                    size="sm"
                                    className="action-btn"
                                    onClick={() => handleView(enrollment)}
                                  >
                                    View
                                  </Button>
                                  <Button 
                                    variant="warning" 
                                    size="sm"
                                    className="action-btn"
                                    onClick={() => handleChangePassword(enrollment)}
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="danger" 
                                    size="sm"
                                    className="action-btn"
                                    onClick={() => handleDelete(enrollment)}
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
                    <Card.Footer className="bg-white border-top py-3 px-4">
                      <nav aria-label="Enrollments pagination">
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

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
        <Modal.Header closeButton className="border-bottom pb-3">
          <Modal.Title className="fw-bold fs-5">Student Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {selectedEnrollment && (
            <div className="student-details-list">
              <div className="detail-item">
                <span className="detail-label">Student ID</span>
                <span className="detail-value">{selectedEnrollment.student_id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{selectedEnrollment.full_name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Aadhaar No</span>
                <span className="detail-value">{selectedEnrollment.aadhaar_no}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone</span>
                {/* FIX: Changed enrollment.phone to selectedEnrollment.phone */}
                <span className="detail-value">{selectedEnrollment.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email</span>
                <span className="detail-value text-break">{selectedEnrollment.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">District</span>
                <span className="detail-value">{selectedEnrollment.district}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value">
                   <span className={`badge ${selectedEnrollment.status === 'active' ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {selectedEnrollment.status}
                  </span>
                </span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top pt-3">
          <Button variant="light" onClick={() => setShowViewModal(false)} className="border">
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change Password Modal (Labeled as Edit in table) */}
      <Modal show={showChangePasswordModal} onHide={() => setShowChangePasswordModal(false)} centered>
        <Modal.Header closeButton className="border-bottom pb-3">
          <Modal.Title className="fw-bold fs-5">Edit Credentials</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {selectedEnrollment && (
            <div>
              <p className="text-muted mb-4">Change password for <strong>{selectedEnrollment.full_name}</strong></p>
              <Form>
                <Form.Group controlId="newPassword" className="mb-3">
                  <Form.Label className="fw-bold small text-secondary">New Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </Form.Group>
                <Form.Group controlId="confirmPassword" className="mb-3">
                  <Form.Label className="fw-bold small text-secondary">Confirm Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top pt-3">
          <Button variant="light" onClick={() => setShowChangePasswordModal(false)} className="border">
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmChangePassword}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-bottom pb-3">
          <Modal.Title className="fw-bold fs-5 text-danger">Delete Enrollment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {selectedEnrollment && (
            <p>
              Are you sure you want to delete <strong>{selectedEnrollment.full_name}</strong>?<br/>
              <span className="text-muted small">This action cannot be undone.</span>
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top pt-3">
          <Button variant="light" onClick={() => setShowDeleteModal(false)} className="border">
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Enrollments