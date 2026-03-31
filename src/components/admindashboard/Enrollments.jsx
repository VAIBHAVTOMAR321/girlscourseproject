import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Form, Nav, Badge } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import '../../assets/css/Enrollments.css' 
import { useAuth } from '../../contexts/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaEye, FaKey, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa'

const Enrollments = () => {
  const { accessToken } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [enrollmentType, setEnrollmentType] = useState(location.state?.enrollmentType || 'paid') // 'paid' or 'unpaid'
  const [enrollments, setEnrollments] = useState([])
  const [filteredEnrollments, setFilteredEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(50)
  const [selectedEnrollments, setSelectedEnrollments] = useState([])
  const [expandedCards, setExpandedCards] = useState({})

  useEffect(() => {
    fetchEnrollments()
  }, [enrollmentType])

  useEffect(() => {
    // Filter enrollments based on search term
    if (searchTerm === '') {
      setFilteredEnrollments(enrollments)
      setCurrentPage(1) // Reset to first page when search term is cleared
    } else {
      const filtered = enrollments.filter(enrollment => {
        if (enrollmentType === 'paid') {
          const nameField = enrollment.candidate_name || enrollment.applicant_id || ''
          const phoneField = enrollment.mobile_no || ''
          return nameField.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.applicant_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            phoneField.includes(searchTerm) ||
            enrollment.email.toLowerCase().includes(searchTerm.toLowerCase())
        } else {
          return enrollment.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.phone.includes(searchTerm) ||
            enrollment.email.toLowerCase().includes(searchTerm.toLowerCase())
        }
      })
      setFilteredEnrollments(filtered)
      setCurrentPage(1) // Reset to first page when search term changes
    }
  }, [searchTerm, enrollments, enrollmentType])

    const fetchEnrollments = async () => {
     try {
       setLoading(true)
       let response
        
        const config = {
          headers: {}
        }
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`
        }
       
       if (enrollmentType === 'paid') {
         // Fetch paid enrollments from payment API
         try {
           response = await axios.get('https://brainrock.in/brainrock/backend/api/course-registration/', config)
         } catch (error) {
           // Fallback to girls_course API if payment API fails
           response = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/', config)
         }
       } else {
         // Fetch unpaid enrollments
         response = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/student-unpaid/', config)
       }
      
      if (response.data.success) {
        setEnrollments(response.data.data)
        setFilteredEnrollments(response.data.data) // Initialize filtered list
        setSelectedEnrollments([]) // Clear selections when switching tabs
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
    if (window.confirm(`Are you sure you want to reset password for ${enrollment.candidate_name} to Test@123?`)) {
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
      alert('Failed to reset password')
    }
  }

  const confirmDelete = async () => {
    try {
      const payload = {
        student_id: selectedEnrollment.student_id
      }
      
      let endpoint = 'https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/'
      
      // Use appropriate endpoint for unpaid students
      if (enrollmentType === 'unpaid') {
        endpoint = 'https://brjobsedu.com/girls_course/girls_course_backend/api/student-unpaid/'
      }
      
        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      
      const response = await axios.delete(endpoint, {
        data: payload,
        ...config
      })
      setShowDeleteModal(false)
      fetchEnrollments()
      alert('Enrollment deleted successfully!')
    } catch (error) {
      alert('Failed to delete enrollment')
    }
  }

  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const getPaymentStatusBadgeClass = (status) => {
    switch(status) {
      case 'completed': return 'bg-success'
      case 'pending': return 'bg-warning text-dark'
      default: return 'bg-danger'
    }
  }

  const getCourseStatusBadgeClass = (status) => {
    switch(status) {
      case 'active': return 'bg-success'
      case 'pending': return 'bg-warning text-dark'
      default: return 'bg-secondary'
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
              <Container>
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
            <Container className="mob-top-view">
              <div className="d-flex justify-content-between align-items-center mb-4 page-header">
                <div className="d-flex align-items-center all-en-box gap-3">
                  <Button variant="outline-secondary back-btn" size="sm" onClick={() => navigate('/AdminDashboard')} className="me-2">
                    <FaArrowLeft /> Dashboard
                  </Button>
                  <h4 className="mb-0">All Enrollments</h4>
                </div>
                <div className="search-section d-none d-md-block" style={{ width: '400px' }}>
                  <Form.Group controlId="searchTerm" className="mb-0">
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
              </div>
              
              {/* Mobile Search */}
              <div className="d-md-none mb-3">
                <Form.Group controlId="searchTermMobile" className="mb-0">
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
              
            <Row>
              <Col xs={12}>
                 {/* Search and Filter Section */}
               

                <Card className="enrollments-table-card border">
                  <Card.Header className="bg-light border-bottom py-2 px-3">
                     <Nav variant="tabs" activeKey={enrollmentType} onSelect={(eventKey) => setEnrollmentType(eventKey)}>
                       <Nav.Item>
                         <Nav.Link eventKey="paid">
                           Paid Enrollments
                         </Nav.Link>
                       </Nav.Item>
                       <Nav.Item>
                         <Nav.Link eventKey="unpaid">
                           Unpaid Enrollments
                         </Nav.Link>
                       </Nav.Item>
                     </Nav>
                  </Card.Header>
                  
                  <Card.Header className="bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center paid-btn  gap-2">
                      <h5 className="mb-0 fw-semibold text-secondary">
                        {enrollmentType === 'paid' ? 'Paid' : 'Unpaid'} Enrollments
                      </h5>
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
                  <Card.Body className="">
                    {/* Desktop Table View */}
                    <div className="table-responsive d-none d-lg-block">
                      <Table hover className="custom-table align-middle mb-0">
                        <thead className="table-light custom-table">
                          <tr>
                            <th className="ps-3" style={{ width: '40px' }}>
                              <Form.Check 
                                type="checkbox"
                                checked={selectedEnrollments.length === currentRecords.length && currentRecords.length > 0}
                                onChange={handleSelectAll}
                                size="sm"
                              />
                            </th>
                            <th className="ps-2">ID</th>
                            <th>{enrollmentType === 'paid' ? 'Candidate Name' : 'Full Name'}</th>
                            <th>{enrollmentType === 'paid' ? 'Phone' : 'Phone'}</th>
                            <th>Email</th>
                            {enrollmentType === 'paid' && <th>Course Fee</th>}
                            {enrollmentType === 'paid' && <th>Payment Status</th>}
                            {enrollmentType === 'unpaid' && <th>District</th>}
                            {enrollmentType === 'unpaid' && <th>State</th>}
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
                              <td className="ps-2"><span className="text-muted small fw-medium">{enrollment.applicant_id || enrollment.student_id}</span></td>
                              <td className="fw-medium text-dark">
                                {enrollmentType === 'paid' ? (enrollment.candidate_name || enrollment.applicant_id) : enrollment.full_name}
                              </td>
                              <td className="small">
                                {enrollmentType === 'paid' ? (enrollment.mobile_no || '') : enrollment.phone}
                              </td>
                              <td className="small text-muted">{enrollment.email}</td>
                              {enrollmentType === 'paid' && (
                                <td className="small fw-medium">
                                  ₹{parseFloat(enrollment.course_fee || 0).toFixed(2)}
                                </td>
                              )}
                              {enrollmentType === 'paid' && (
                                <td>
                                  <span className={`status-badge ${getPaymentStatusBadgeClass(enrollment.payment_status)}`}>
                                    {enrollment.payment_status}
                                  </span>
                                </td>
                              )}
                              {enrollmentType === 'unpaid' && <td className="small">{enrollment.district}</td>}
                              {enrollmentType === 'unpaid' && <td className="small">{enrollment.state}</td>}
                              <td>
                                <span className={`status-badge ${getCourseStatusBadgeClass(enrollment.course_status || enrollment.status)}`}>
                                  {enrollment.course_status || enrollment.status}
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
                                  {enrollmentType === 'unpaid' && (
                                    <Button 
                                      variant="danger" 
                                      size="sm"
                                      className="action-btn"
                                      onClick={() => handleDelete(enrollment)}
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="d-lg-none">
                      {currentRecords.map((enrollment) => (
                        <Card key={enrollment.id} className="mb-3 mx-2 enrollment-card">
                          <Card.Body className="p-3 card-box-mob">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h6 className="mb-1 fw-semibold">
                                  {enrollmentType === 'paid' ? (enrollment.candidate_name || enrollment.applicant_id) : enrollment.full_name}
                                </h6>
                                <small className="text-muted">ID: {enrollment.applicant_id || enrollment.student_id}</small>
                              </div>
                              <Form.Check 
                                type="checkbox"
                                checked={selectedEnrollments.includes(enrollment.student_id)}
                                onChange={() => handleSelectEnrollment(enrollment.student_id)}
                                size="sm"
                              />
                            </div>
                            
                            <div className="mb-2">
                              <small className="text-muted d-block">Phone:</small>
                              <span className="small fw-medium">
                                {enrollmentType === 'paid' ? (enrollment.mobile_no || 'N/A') : enrollment.phone}
                              </span>
                            </div>

                            <div className="mb-2">
                              <small className="text-muted d-block">Email:</small>
                              <span className="small text-muted">{enrollment.email}</span>
                            </div>

                            <div className="mb-2">
                              <small className="text-muted d-block">Status:</small>
                              <span className={`badge ${getCourseStatusBadgeClass(enrollment.course_status || enrollment.status)} small`}>
                                {enrollment.course_status || enrollment.status}
                              </span>
                            </div>

                            {/* Expandable Details */}
                            <div className="mt-3">
                              <Button 
                                variant="link" 
                                className="p-0 text-decoration-none d-flex align-items-center gap-1"
                                onClick={() => toggleCardExpansion(enrollment.id)}
                              >
                                {expandedCards[enrollment.id] ? <FaChevronUp /> : <FaChevronDown />}
                                <small>{expandedCards[enrollment.id] ? 'Hide Details' : 'Show Details'}</small>
                              </Button>
                              
                              {expandedCards[enrollment.id] && (
                                <div className="mt-3 pt-3 border-top">
                                  <Row className="g-2">
                                    {enrollmentType === 'paid' && (
                                      <>
                                        <Col xs={6}>
                                          <small className="text-muted d-block">Course Fee:</small>
                                          <span className="small fw-medium">₹{parseFloat(enrollment.course_fee || 0).toFixed(2)}</span>
                                        </Col>
                                        <Col xs={6}>
                                          <small className="text-muted d-block">Payment Status:</small>
                                          <span className={`badge ${getPaymentStatusBadgeClass(enrollment.payment_status)} small`}>
                                            {enrollment.payment_status}
                                          </span>
                                        </Col>
                                      </>
                                    )}
                                    {enrollmentType === 'unpaid' && (
                                      <>
                                        <Col xs={6}>
                                          <small className="text-muted d-block">District:</small>
                                          <span className="small">{enrollment.district}</span>
                                        </Col>
                                        <Col xs={6}>
                                          <small className="text-muted d-block">State:</small>
                                          <span className="small">{enrollment.state}</span>
                                        </Col>
                                      </>
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
                                onClick={() => handleView(enrollment)}
                              >
                                <FaEye className="me-1" /> View
                              </Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                className="flex-fill"
                                onClick={() => handleResetPassword(enrollment)}
                              >
                                <FaKey className="me-1" /> Reset
                              </Button>
                              {enrollmentType === 'unpaid' && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="flex-fill"
                                  onClick={() => handleDelete(enrollment)}
                                >
                                  <FaTrash className="me-1" /> Delete
                                </Button>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </Card.Body>
                  
                  {/* Payment Summary Footer for Paid Enrollments */}
                  {enrollmentType === 'paid' && filteredEnrollments.length > 0 && (
                    <Card.Footer className="bg-light border-top py-3 px-3">
                      <Row className="text-center">
                        <Col md={6} className="mb-2 mb-md-0">
                          <div className="d-flex justify-content-center align-items-center gap-3">
                            <div>
                              <h6 className="text-success fw-bold mb-1">Success Payments</h6>
                              <p className="mb-0">
                                <span className="badge bg-success">{filteredEnrollments.filter(e => e.payment_status === 'completed').length}</span>
                              </p>
                              <small className="text-muted">
                                Total: ₹{filteredEnrollments.filter(e => e.payment_status === 'completed').reduce((sum, e) => sum + parseFloat(e.course_fee || 0), 0).toFixed(2)}
                              </small>
                            </div>
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="d-flex justify-content-center align-items-center gap-3">
                            <div>
                              <h6 className="text-warning fw-bold mb-1">Unsuccessful/Pending</h6>
                              <p className="mb-0">
                                <span className="badge bg-warning text-dark">{filteredEnrollments.filter(e => e.payment_status !== 'completed').length}</span>
                              </p>
                              <small className="text-muted">
                                Total: ₹{filteredEnrollments.filter(e => e.payment_status !== 'completed').reduce((sum, e) => sum + parseFloat(e.course_fee || 0), 0).toFixed(2)}
                              </small>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Footer>
                  )}
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
      </div>

       {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            {enrollmentType === 'paid' ? 'Student' : 'Unpaid Student'} Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2 px-3">
          {selectedEnrollment && (
            <div className="student-details-list">
              {enrollmentType === 'paid' ? (
                <>
                  {/* Paid Student Fields */}
                  <div className="detail-item">
                    <span className="detail-label">Applicant ID</span>
                    <span className="detail-value">{selectedEnrollment.applicant_id || selectedEnrollment.student_id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Candidate Name</span>
                    <span className="detail-value">{selectedEnrollment.candidate_name || selectedEnrollment.applicant_id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Guardian Name</span>
                    <span className="detail-value">{selectedEnrollment.guardian_name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Course Applied</span>
                    <span className="detail-value">
                      {selectedEnrollment.application_for_course?.join(', ') || 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Course Mode</span>
                    <span className="detail-value">{selectedEnrollment.course_mode || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Address</span>
                    <span className="detail-value text-break">{selectedEnrollment.address || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date of Birth</span>
                    <span className="detail-value">{selectedEnrollment.date_of_birth || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mobile No</span>
                    <span className="detail-value">{selectedEnrollment.mobile_no || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value text-break">{selectedEnrollment.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Highest Education</span>
                    <span className="detail-value">{selectedEnrollment.highest_education || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">School/College</span>
                    <span className="detail-value text-break">{selectedEnrollment.school_college_name || 'N/A'}</span>
                  </div>
                  <hr className="my-3" />
                  <h6 className="fw-bold text-primary mb-3">Payment Information</h6>
                  <div className="detail-item">
                    <span className="detail-label">Course Fee</span>
                    <span className="detail-value fw-bold">₹{parseFloat(selectedEnrollment.course_fee || 0).toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment Status</span>
                    <span className="detail-value">
                      <span className={`badge ${getPaymentStatusBadgeClass(selectedEnrollment.payment_status)}`}>
                        {selectedEnrollment.payment_status}
                      </span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Transaction ID</span>
                    <span className="detail-value text-break">{selectedEnrollment.transaction_id || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">PhonePe Order ID</span>
                    <span className="detail-value text-break">{selectedEnrollment.phonepe_order_id || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Course Status</span>
                    <span className="detail-value">
                       <span className={`badge ${getCourseStatusBadgeClass(selectedEnrollment.course_status)}`}>
                        {selectedEnrollment.course_status}
                      </span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Registration Date</span>
                    <span className="detail-value">{new Date(selectedEnrollment.created_at).toLocaleDateString()}</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Unpaid Student Fields */}
                  <div className="detail-item">
                    <span className="detail-label">Student ID</span>
                    <span className="detail-value">{selectedEnrollment.student_id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Full Name</span>
                    <span className="detail-value">{selectedEnrollment.full_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Aadhaar Number</span>
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
                    <span className="detail-label">Block</span>
                    <span className="detail-value">{selectedEnrollment.block}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">State</span>
                    <span className="detail-value">{selectedEnrollment.state}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Associate Wings</span>
                    <span className="detail-value">{selectedEnrollment.associate_wings}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className="detail-value">
                       <span className={`badge ${getCourseStatusBadgeClass(selectedEnrollment.status)}`}>
                        {selectedEnrollment.status}
                      </span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Registration Date</span>
                    <span className="detail-value">{new Date(selectedEnrollment.created_at).toLocaleDateString()}</span>
                  </div>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="light" onClick={() => setShowViewModal(false)} className="border small en-btn">
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
              Are you sure you want to delete <strong>{enrollmentType === 'paid' ? selectedEnrollment.candidate_name : selectedEnrollment.full_name}</strong>?<br/>
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
