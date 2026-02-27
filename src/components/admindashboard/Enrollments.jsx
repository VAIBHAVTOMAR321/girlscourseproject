import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Form } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import '../../assets/css/Enrollments.css' // Import specific CSS

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const fetchEnrollments = async () => {
    try {
      const response = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/')
      if (response.data.success) {
        setEnrollments(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setLoading(false)
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
      // API Logic for password update
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
      // API Logic for user deletion
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
        <div className="d-flex flex-1">
          <AdminLeftNav />
          <div className="flex-1 d-flex align-items-center justify-content-center loading-center">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="enrollments-page d-flex flex-column min-vh-100">
      <AdminTopNav />
      <div className="d-flex flex-1">
        <AdminLeftNav />
        <div className="flex-1 p-4 pt-lg-4 pt-16">
          <Container fluid>
            <Row className="justify-content-center">
              <Col xs={12} lg={12}>
                <Card className="enrollments-table">
                  <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h4 className="mb-0 fw-bold text-secondary">All Enrollments</h4>
                  </div>
                  <Card.Body className="p-0">
                    <div className="table-wrapper">
                      <Table hover className="custom-table mb-0">
                        <thead>
                          <tr>
                            <th>Student ID</th>
                            <th>Full Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrollments.map((enrollment) => (
                            <tr key={enrollment.id}>
                              <td><span className="text-muted small">{enrollment.student_id}</span></td>
                              <td className="fw-semibold">{enrollment.full_name}</td>
                              <td>{enrollment.phone}</td>
                              <td><small>{enrollment.email}</small></td>
                              <td>
                                <span className={`status-badge ${enrollment.status === 'active' ? 'active' : 'inactive'}`}>
                                  {enrollment.status}
                                </span>
                              </td>
                              <td className="text-end">
                                <div className="action-buttons justify-content-end">
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    className="action-btn view"
                                    onClick={() => handleView(enrollment)}
                                  >
                                    <i className="bi bi-eye me-1"></i> View
                                  </Button>
                                  <Button 
                                    variant="outline-warning" 
                                    size="sm"
                                    className="action-btn edit"
                                    onClick={() => handleChangePassword(enrollment)}
                                  >
                                    <i className="bi bi-key me-1"></i> Pass
                                  </Button>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    className="action-btn delete"
                                    onClick={() => handleDelete(enrollment)}
                                  >
                                    <i className="bi bi-trash me-1"></i> Del
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered>
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="modal-title-custom">Student Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedEnrollment && (
            <div>
              <div className="detail-row">
                <span className="detail-label">Student ID:</span>
                <span className="detail-value">{selectedEnrollment.student_id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">{selectedEnrollment.full_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Aadhaar No:</span>
                <span className="detail-value">{selectedEnrollment.aadhaar_no}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedEnrollment.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedEnrollment.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">District:</span>
                <span className="detail-value">{selectedEnrollment.district}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                   <span className={`status-badge ${selectedEnrollment.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                    {selectedEnrollment.status}
                  </span>
                </span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowViewModal(false)} className="border">
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change Password Modal */}
      <Modal show={showChangePasswordModal} onHide={() => setShowChangePasswordModal(false)} centered>
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="modal-title-custom">Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedEnrollment && (
            <div>
              <p className="mb-4">Reset password for <strong>{selectedEnrollment.full_name}</strong></p>
              <Form>
                <Form.Group controlId="newPassword" className="mb-3">
                  <Form.Label className="fw-bold small">New Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </Form.Group>
                <Form.Group controlId="confirmPassword" className="mb-3">
                  <Form.Label className="fw-bold small">Confirm Password</Form.Label>
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
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowChangePasswordModal(false)} className="border">
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmChangePassword}>
            Update Password
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title className="modal-title-custom text-danger">Delete Enrollment</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {selectedEnrollment && (
            <p>
              Are you sure you want to delete <strong>{selectedEnrollment.full_name}</strong>?<br/>
              <span className="text-muted small">This action cannot be undone.</span>
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
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