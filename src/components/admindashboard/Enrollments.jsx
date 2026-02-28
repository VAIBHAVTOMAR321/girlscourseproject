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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(50)
  const [selectedEnrollments, setSelectedEnrollments] = useState([])

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

  const handleResetPassword = (enrollment) => {
    if (window.confirm(`Are you sure you want to reset password for ${enrollment.full_name} to Test@123?`)) {
      resetPassword([enrollment.student_id])
    }
  }

  const handleDelete = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowDeleteModal(true)
  }

  const handleSelectEnrollment = (studentId) => {
    setSelectedEnrollments(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId)
      } else {
        return [...prev, studentId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedEnrollments.length === currentRecords.length) {
      setSelectedEnrollments([])
    } else {
      setSelectedEnrollments(currentRecords.map(enrollment => enrollment.student_id))
    }
  }

  const handleBulkResetPassword = () => {
    if (selectedEnrollments.length === 0) {
      alert('Please select at least one student to reset password')
      return
    }
    if (window.confirm(`Are you sure you want to reset password for ${selectedEnrollments.length} selected student(s) to Test@123?`)) {
      resetPassword(selectedEnrollments)
    }
  }

  const resetPassword = async (uniqueIds) => {
    try {
      const payload = {
        unique_ids: uniqueIds,
        new_password: 'Test@123'
      }
      const response = await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/bulk-password-reset/', payload)
      alert(`Password reset successfully for ${uniqueIds.length} student(s)!`)
      setSelectedEnrollments([])
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Failed to reset password')
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
                 <div className="search-section mb-2">
                   <Form.Group controlId="searchTerm">
                     <Form.Control 
                       type="text" 
                       placeholder="Search by student name, ID, phone, or email..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="search-input"
                       size="sm"
                     />
                   </Form.Group>
                 </div>

                <Card className="enrollments-table-card border">
                  <Card.Header className="bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <h5 className="mb-0 fw-semibold text-secondary">All Enrollments</h5>
                      {selectedEnrollments.length > 0 && (
                        <Button 
                          variant="primary" 
                          size="sm"
                          className="action-btn"
                          onClick={handleBulkResetPassword}
                        >
                          Reset Selected ({selectedEnrollments.length})
                        </Button>
                      )}
                    </div>
                    <span className="text-muted small">
                      Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredEnrollments.length)} of {filteredEnrollments.length} records
                    </span>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table hover className="custom-table align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="ps-3" style={{ width: '40px' }}>
                              <Form.Check 
                                type="checkbox"
                                checked={selectedEnrollments.length === currentRecords.length && currentRecords.length > 0}
                                onChange={handleSelectAll}
                                size="sm"
                              />
                            </th>
                            <th className="ps-2">Student ID</th>
                            <th>Full Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th className="text-end pe-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentRecords.map((enrollment) => (
                            <tr key={enrollment.id}>
                              <td className="ps-3">
                                <Form.Check 
                                  type="checkbox"
                                  checked={selectedEnrollments.includes(enrollment.student_id)}
                                  onChange={() => handleSelectEnrollment(enrollment.student_id)}
                                  size="sm"
                                />
                              </td>
                              <td className="ps-2"><span className="text-muted small fw-medium">{enrollment.student_id}</span></td>
                              <td className="fw-medium text-dark">{enrollment.full_name}</td>
                              <td className="small">{enrollment.phone}</td>
                              <td className="small text-muted">{enrollment.email}</td>
                              <td>
                                <span className={`status-badge ${enrollment.status === 'active' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                  {enrollment.status}
                                </span>
                              </td>
                              <td className="text-end pe-3">
                                <div className="action-buttons justify-content-end gap-1">
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
                                    onClick={() => handleResetPassword(enrollment)}
                                  >
                                    Reset Password
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
                     <Card.Footer className="bg-light border-top py-2 px-3">
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
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="sm">
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">Student Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2 px-3">
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
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="light" onClick={() => setShowViewModal(false)} className="border small">
            Close
          </Button>
        </Modal.Footer>
      </Modal>



      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6 text-danger">Delete Enrollment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2 px-3">
          {selectedEnrollment && (
            <p className="small">
              Are you sure you want to delete <strong>{selectedEnrollment.full_name}</strong>?<br/>
              <span className="text-muted small">This action cannot be undone.</span>
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="light" onClick={() => setShowDeleteModal(false)} className="border small">
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} size="sm">
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Enrollments