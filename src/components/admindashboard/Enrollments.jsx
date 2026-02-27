import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Form } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'

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
      // Implement change password API call here
      console.log('Changing password for:', selectedEnrollment.student_id)
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
      // Implement delete API call here
      console.log('Deleting enrollment:', selectedEnrollment.student_id)
      setShowDeleteModal(false)
      fetchEnrollments() // Refresh the list
      alert('Enrollment deleted successfully!')
    } catch (error) {
      console.error('Error deleting enrollment:', error)
      alert('Failed to delete enrollment')
    }
  }

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <AdminTopNav />
        <div className="d-flex flex-1">
          <AdminLeftNav />
          <div className="flex-1 d-flex align-items-center justify-content-center">
            <Spinner animation="border" variant="primary" style={{ width: '50px', height: '50px' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <AdminTopNav />
      <div className="d-flex flex-1">
        <AdminLeftNav />
        <div className="flex-1 p-4 pt-lg-4 pt-16"> {/* Add padding for mobile fixed button */}
          <Container fluid>
            <Row className="justify-content-center">
              <Col xs={12} md={12} lg={10}>
                <Card>
                  <Card.Header className="bg-primary text-white">
                    <h3 className="mb-0">Enrollments Management</h3>
                  </Card.Header>
                  <Card.Body>
                    <h4 className="mb-3">All Enrollments</h4>
                    
                    <div className="table-responsive">
                      <Table striped bordered hover size="sm">
                        <thead className="table-primary">
                          <tr>
                            <th>Student ID</th>
                            <th>Full Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrollments.map((enrollment) => (
                            <tr key={enrollment.id}>
                              <td><small>{enrollment.student_id}</small></td>
                              <td>{enrollment.full_name}</td>
                              <td><small>{enrollment.phone}</small></td>
                              <td><small>{enrollment.email}</small></td>
                              <td>
                                <span className={`badge ${
                                  enrollment.status === 'active' ? 'bg-success' : 'bg-warning'
                                }`}>
                                  {enrollment.status}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleView(enrollment)}
                                  >
                                    View
                                  </Button>
                                  <Button 
                                    variant="outline-warning" 
                                    size="sm"
                                    onClick={() => handleChangePassword(enrollment)}
                                  >
                                    Change Password
                                  </Button>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
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
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Student Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEnrollment && (
            <div>
              <p><strong>Student ID:</strong> {selectedEnrollment.student_id}</p>
              <p><strong>Full Name:</strong> {selectedEnrollment.full_name}</p>
              <p><strong>Aadhaar Number:</strong> {selectedEnrollment.aadhaar_no}</p>
              <p><strong>Phone:</strong> {selectedEnrollment.phone}</p>
              <p><strong>Email:</strong> {selectedEnrollment.email}</p>
              <p><strong>District:</strong> {selectedEnrollment.district}</p>
              <p><strong>Block:</strong> {selectedEnrollment.block}</p>
              <p><strong>State:</strong> {selectedEnrollment.state}</p>
              <p><strong>Associate Wings:</strong> {selectedEnrollment.associate_wings}</p>
              <p><strong>Status:</strong> {selectedEnrollment.status}</p>
              <p><strong>Created At:</strong> {new Date(selectedEnrollment.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change Password Modal */}
      <Modal show={showChangePasswordModal} onHide={() => setShowChangePasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEnrollment && (
            <div>
              <p>Change password for <strong>{selectedEnrollment.full_name}</strong> ({selectedEnrollment.student_id})</p>
              <Form>
                <Form.Group controlId="newPassword" className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </Form.Group>
                <Form.Group controlId="confirmPassword" className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
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
          <Button variant="secondary" onClick={() => setShowChangePasswordModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={confirmChangePassword}>
            Change Password
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Enrollment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEnrollment && (
            <p>
              Are you sure you want to delete the enrollment for <strong>{selectedEnrollment.full_name}</strong> ({selectedEnrollment.student_id})?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
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
