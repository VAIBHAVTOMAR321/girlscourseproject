import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Badge } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import '../../assets/css/Enrollments.css'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaCalendar, FaClock, FaBriefcase, FaLink, FaMapMarkerAlt, FaMoneyBillWave, FaGraduationCap, FaTools } from 'react-icons/fa'

const API_URL = 'https://brjobsedu.com/girls_course/girls_course_backend/api/job-openings/'

const ManageJobs = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(10)

  useEffect(() => {
    fetchJobs()
  }, [])

  const getAuthConfig = () => ({
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_URL, getAuthConfig())
      if (response.data && response.data.data) {
        setJobs(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (job) => {
    navigate('/AddJob', { state: { editData: job } })
  }

  const handleDelete = (job) => {
    setSelectedJob(job)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      await axios.delete(API_URL, {
        data: { job_id: selectedJob.job_id },
        ...getAuthConfig()
      })
      setShowDeleteModal(false)
      fetchJobs()
      alert('Job deleted successfully!')
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Failed to delete job')
    }
  }

  const handleView = (job) => {
    setSelectedJob(job)
    setShowViewModal(true)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    })
  }

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = jobs.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(jobs.length / recordsPerPage)

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
                  <h4 className="mb-0">Manage Jobs</h4>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigate('/AddJob')}>
                  <FaPlus className="me-1" /> Add New Job
                </Button>
              </div>

              <Row>
                <Col xs={12}>
                  <Card className="enrollments-table-card border">
                    <Card.Header className="bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center paid-btn gap-2">
                        <h5 className="mb-0 fw-semibold text-secondary">
                          All Jobs ({jobs.length})
                        </h5>
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="table-responsive d-none d-md-block">
                        <Table hover className="custom-table align-middle mb-0">
                          <thead className="table-light custom-table">
                            <tr>
                              <th className="ps-2">Job ID</th>
                              <th>Title</th>
                              <th><FaMapMarkerAlt className="me-1" /> Location</th>
                              <th><FaBriefcase className="me-1" /> Type</th>
                              <th><FaMoneyBillWave className="me-1" /> Salary</th>
                              <th><FaCalendar className="me-1" /> Last Date</th>
                              <th className="text-end pe-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentRecords.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="text-center py-4 text-muted">
                                  No jobs found
                                </td>
                              </tr>
                            ) : (
                              currentRecords.map((job) => (
                                <tr key={job.job_id}>
                                  <td className="ps-2">
                                    <span className="text-muted small fw-medium">{job.job_id}</span>
                                  </td>
                                  <td className="fw-medium text-dark">
                                    {job.title}
                                    {job.title_hindi && (
                                      <div className="small text-muted">{job.title_hindi}</div>
                                    )}
                                  </td>
                                  <td className="small">
                                    {job.location || '-'}
                                  </td>
                                  <td className="small">
                                    <Badge bg={job.job_type === 'full_time' ? 'success' : job.job_type === 'part_time' ? 'info' : job.job_type === 'internship' ? 'warning' : 'secondary'}>
                                      {job.job_type?.replace('_', ' ')}
                                    </Badge>
                                  </td>
                                  <td className="small">
                                    {job.salary || '-'}
                                  </td>
                                  <td className="small">
                                    {formatDate(job.last_date_to_apply)}
                                  </td>
                                  <td className="text-end pe-3">
                                    <div className="d-flex gap-1 justify-content-end">
                                      <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleView(job)}
                                        title="View"
                                      >
                                        <i className="bi bi-eye" style={{ fontSize: '12px' }}></i>
                                      </Button>
                                      <Button
                                        variant="outline-warning"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleEdit(job)}
                                        title="Edit"
                                      >
                                        <FaEdit style={{ fontSize: '12px' }} />
                                      </Button>
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="p-1"
                                        style={{ width: '28px', height: '28px' }}
                                        onClick={() => handleDelete(job)}
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
                      <div className="mobile-card-view d-md-none">
                        {currentRecords.length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            No jobs found
                          </div>
                        ) : (
                          currentRecords.map((job) => (
                            <div key={job.job_id} className="grooming-class-card">
                              <div className="card-header">
                                <span className="class-id">ID: {job.job_id}</span>
                              </div>
                              <div className="class-title">{job.title}</div>
                              {job.title_hindi && (
                                <div className="class-title-hindi">{job.title_hindi}</div>
                              )}
                              <div className="class-info">
                                <div className="info-item">
                                  <span className="label"><FaMapMarkerAlt className="me-1" />Location:</span>{' '}
                                  <span className="value">{job.location || '-'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label"><FaBriefcase className="me-1" />Type:</span>{' '}
                                  <span className="value">{job.job_type?.replace('_', ' ')}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label"><FaMoneyBillWave className="me-1" />Salary:</span>{' '}
                                  <span className="value">{job.salary || '-'}</span>
                                </div>
                                <div className="info-item">
                                  <span className="label"><FaCalendar className="me-1" />Last Date:</span>{' '}
                                  <span className="value">{formatDate(job.last_date_to_apply)}</span>
                                </div>
                              </div>
                              <div className="card-actions">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleView(job)}
                                >
                                  <i className="bi bi-eye me-1"></i> View
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleEdit(job)}
                                >
                                  <FaEdit className="me-1" /> Edit
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(job)}
                                >
                                  <FaTrash className="me-1" /> Delete
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card.Body>
                    {totalPages > 1 && (
                      <Card.Footer className="bg-light border-top py-2 px-3">
                        <nav aria-label="Jobs pagination">
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
          <p>Are you sure you want to delete this job?</p>
          <p className="text-muted">Job ID: {selectedJob?.job_id}</p>
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

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Job Details - {selectedJob?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <div className="job-details">
              <Row className="mb-3">
                <Col md={6}>
                  <p><strong>Job ID:</strong> {selectedJob.job_id}</p>
                  <p><strong><FaBriefcase className="me-1" />Job Type:</strong> {selectedJob.job_type?.replace('_', ' ')}</p>
                  <p><strong><FaMapMarkerAlt className="me-1" />Location:</strong> {selectedJob.location || '-'}</p>
                  <p><strong><FaMoneyBillWave className="me-1" />Salary:</strong> {selectedJob.salary || '-'}</p>
                  <p><strong><FaClock className="me-1" />Experience:</strong> {selectedJob.experience_required || '-'}</p>
                </Col>
                <Col md={6}>
                  <p><strong><FaCalendar className="me-1" />Last Date to Apply:</strong> {formatDate(selectedJob.last_date_to_apply)}</p>
                  {selectedJob.apply_link && (
                    <p><strong><FaLink className="me-1" />Apply Link:</strong> <a href={selectedJob.apply_link} target="_blank" rel="noopener noreferrer">Apply Here</a></p>
                  )}
                </Col>
              </Row>
              
              {selectedJob.description && selectedJob.description.length > 0 && (
                <div className="mb-3">
                  <h6>Description (English)</h6>
                  <ul>
                    {selectedJob.description.map((desc, index) => (
                      <li key={index}>{desc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.description_hindi && selectedJob.description_hindi.length > 0 && (
                <div className="mb-3">
                  <h6>Description (Hindi)</h6>
                  <ul>
                    {selectedJob.description_hindi.map((desc, index) => (
                      <li key={index}>{desc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.qualifications_required && selectedJob.qualifications_required.length > 0 && (
                <div className="mb-3">
                  <h6><FaGraduationCap className="me-1" />Qualifications Required</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedJob.qualifications_required.map((qual, index) => (
                      <Badge key={index} bg="info">{qual}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedJob.skills_required && selectedJob.skills_required.length > 0 && (
                <div className="mb-3">
                  <h6><FaTools className="me-1" />Skills Required</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedJob.skills_required.map((skill, index) => (
                      <Badge key={index} bg="warning" text="dark">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
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

export default ManageJobs
