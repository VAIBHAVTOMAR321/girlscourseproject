import React, { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Form, Badge } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import '../../assets/css/Enrollments.css'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSearch, FaChevronDown, FaChevronUp, FaMapMarkerAlt, FaBook, FaUniversity, FaTimes, FaCheck } from 'react-icons/fa'

const API_URL = 'https://brjobsedu.com/girls_course/girls_course_backend/api/meet-our-learner/'
const BASE_URL = 'https://brjobsedu.com/girls_course/girls_course_backend'

const getLearnerImageUrl = (img) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  if (img.startsWith('/media')) return BASE_URL + img
  return img
}

const LearnersManagement = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  const [learners, setLearners] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(10)
  const [expandedCards, setExpandedCards] = useState({})

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedLearner, setSelectedLearner] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    address: '',
    cour_name: '',
    sch_name: '',
    img: null
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState(null)

  // ===================== FETCH ALL (GET) =====================
  const fetchLearners = async () => {
    setLoading(true)
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (response.data && response.data.success) {
        setLearners(response.data.data || [])
      } else {
        setLearners([])
      }
    } catch (error) {
      console.error('Error fetching learners:', error)
      setLearners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLearners()
  }, [])

  // ===================== FILTERING =====================
  const uniqueCourses = useMemo(() => {
    const courses = [...new Set(learners.map(l => l.cour_name).filter(Boolean))]
    return courses.sort()
  }, [learners])

  const filteredLearners = useMemo(() => {
    let result = [...learners]
    if (filterCourse !== 'all') {
      result = result.filter(l => l.cour_name === filterCourse)
    }
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      result = result.filter(l =>
        (l.address || '').toLowerCase().includes(term) ||
        (l.cour_name || '').toLowerCase().includes(term) ||
        (l.sch_name || '').toLowerCase().includes(term)
      )
    }
    return result
  }, [searchTerm, filterCourse, learners])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCourse])

  // ===================== PAGINATION =====================
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredLearners.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredLearners.length / recordsPerPage)

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // ===================== FORM HELPERS =====================
  const resetForm = () => {
    setFormData({ address: '', cour_name: '', sch_name: '', img: null })
    setImagePreview(null)
    setExistingImageUrl(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, img: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setFormData(prev => ({ ...prev, img: null }))
      setImagePreview(null)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, img: null }))
    setImagePreview(null)
    setExistingImageUrl(null)
  }

  // ===================== OPEN MODALS =====================
  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const openEditModal = (learner) => {
    setSelectedLearner(learner)
    setFormData({
      address: learner.address || '',
      cour_name: learner.cour_name || '',
      sch_name: learner.sch_name || '',
      img: null
    })
    if (learner.img) {
      setExistingImageUrl(learner.img)
      setImagePreview(getLearnerImageUrl(learner.img))
    } else {
      setExistingImageUrl(null)
      setImagePreview(null)
    }
    setShowEditModal(true)
  }

  const openDeleteModal = (learner) => {
    setSelectedLearner(learner)
    setShowDeleteModal(true)
  }

  // ===================== CREATE (POST) =====================
  const submitAdd = async () => {
    if (!formData.address.trim() || !formData.cour_name.trim() || !formData.sch_name.trim()) {
      alert('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const dataToSend = new FormData()
      dataToSend.append('address', formData.address)
      dataToSend.append('cour_name', formData.cour_name)
      dataToSend.append('sch_name', formData.sch_name)
      if (formData.img) {
        dataToSend.append('img', formData.img)
      }

      const response = await axios.post(API_URL, dataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data && response.data.success) {
        setShowAddModal(false)
        resetForm()
        fetchLearners()
        alert('Learner added successfully!')
      } else {
        alert(response.data?.message || 'Failed to add learner.')
      }
    } catch (error) {
      console.error('Error adding learner:', error)
      alert('An error occurred while adding the learner.')
    } finally {
      setSubmitting(false)
    }
  }

  // ===================== UPDATE (PUT) =====================
  const submitEdit = async () => {
    if (!selectedLearner) return
    if (!formData.address.trim() || !formData.cour_name.trim() || !formData.sch_name.trim()) {
      alert('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const dataToSend = new FormData()
      dataToSend.append('id', selectedLearner.id)
      dataToSend.append('address', formData.address)
      dataToSend.append('cour_name', formData.cour_name)
      dataToSend.append('sch_name', formData.sch_name)
      if (formData.img) {
        dataToSend.append('img', formData.img)
      }

      const response = await axios.put(API_URL, dataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data && response.data.success) {
        setShowEditModal(false)
        setSelectedLearner(null)
        resetForm()
        fetchLearners()
        alert('Learner updated successfully!')
      } else {
        alert(response.data?.message || 'Failed to update learner.')
      }
    } catch (error) {
      console.error('Error updating learner:', error)
      alert('An error occurred while updating the learner.')
    } finally {
      setSubmitting(false)
    }
  }

  // ===================== DELETE =====================
  const confirmDelete = async () => {
    if (!selectedLearner) return

    setSubmitting(true)
    try {
      const response = await axios.delete(API_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: { id: selectedLearner.id }
      })

      if (response.data && response.data.success) {
        setShowDeleteModal(false)
        setSelectedLearner(null)
        fetchLearners()
        alert('Learner deleted successfully!')
      } else {
        alert(response.data?.message || 'Failed to delete learner.')
      }
    } catch (error) {
      console.error('Error deleting learner:', error)
      alert('An error occurred while deleting the learner.')
    } finally {
      setSubmitting(false)
    }
  }

  // ===================== RENDER IMAGE HELPER =====================
  const renderImage = (img, name, size = 40) => {
    const resolvedImg = getLearnerImageUrl(img)
    const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Learner')}&background=5B2D90&color=fff&size=${size * 2}`
    if (resolvedImg) {
      return (
        <img
          src={resolvedImg}
          alt={name}
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }}
          onError={(e) => { e.target.src = fallbackSrc }}
        />
      )
    }
    return (
      <img
        src={fallbackSrc}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }}
      />
    )
  }

  // ===================== IMAGE PREVIEW IN MODAL =====================
  const renderImagePreview = () => {
    const resolvedPreview = getLearnerImageUrl(imagePreview)
    if (resolvedPreview) {
      return (
        <div className="image-preview-wrapper">
          <img src={resolvedPreview} alt="Preview" className="image-preview" />
          <Button
            variant="danger"
            size="sm"
            className="image-remove-btn"
            onClick={removeImage}
            type="button"
          >
            <FaTimes />
          </Button>
        </div>
      )
    }
    return null
  }

  // ===================== FORM FIELDS (SHARED) =====================
  const renderFormFields = () => (
    <>
      <Form.Group className="mb-3">
        <Form.Label><strong>School Name <span className="text-danger">*</span></strong></Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter school name"
          value={formData.sch_name}
          onChange={(e) => setFormData(prev => ({ ...prev, sch_name: e.target.value }))}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label><strong>Address <span className="text-danger">*</span></strong></Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label><strong>Course Name <span className="text-danger">*</span></strong></Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter course name"
          value={formData.cour_name}
          onChange={(e) => setFormData(prev => ({ ...prev, cour_name: e.target.value }))}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label><strong> Image</strong></Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
     
      </Form.Group>
    </>
  )

  return (
    <div className="admin-layout">
      <div className="admin-wrapper d-flex">
        <AdminLeftNav show={showSidebar} setShow={setShowSidebar} />
        <div className={`admin-main-content flex-grow-1 ${!showSidebar ? 'sidebar-compact' : ''}`}>
          <AdminTopNav />
          <div className="content-area">
            <Container fluid className='mob-top-view'>
              {/* Page Header */}
              <div className="d-flex justify-content-between align-items-center mb-4 page-header flex-wrap gap-2">
                <div className="d-flex align-items-center all-en-box gap-3">
                  <Button variant="outline-secondary" size="sm" onClick={() => navigate('/AdminDashboard')} className="me-2">
                    <FaArrowLeft /> Dashboard
                  </Button>
                  <h4 className="mb-0">Meet Our Learners</h4>
                </div>
                <Button variant="primary" size="sm" onClick={openAddModal}>
                  <FaPlus className="me-1" /> Add Learner
                </Button>
              </div>

              {/* Search and Filter Bar */}
              <Row className="mb-3 align-items-center">
                <Col md={5} xs={12} className="mb-2 mb-md-0">
                  <div className="position-relative">
                    <FaSearch className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <Form.Control
                      type="text"
                      placeholder="Search by address, course, school..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="ps-4"
                    />
                  </div>
                </Col>
                <Col md={4} xs={12} className="mb-2 mb-md-0">
                  <Form.Select
                    value={filterCourse}
                    onChange={(e) => setFilterCourse(e.target.value)}
                  >
                    <option value="all">All Courses</option>
                    {uniqueCourses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={3} xs={12} className="text-md-end">
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Total: <strong>{filteredLearners.length}</strong> learners
                  </span>
                </Col>
              </Row>

              {/* Loading */}
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Loading learners...</p>
                </div>
              ) : currentRecords.length === 0 ? (
                <Card className="text-center py-5">
                  <Card.Body>
                    <p className="text-muted mb-0">No learners found.</p>
                  </Card.Body>
                </Card>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="d-none d-md-block">
                    <Card className="shadow-sm">
                      <Card.Body className="p-0">
                        <div className="table-responsive">
                          <Table className="mb-0 align-middle" hover>
                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                              <tr>
                                <th className="ps-3" style={{ fontSize: '0.85rem' }}>#</th>
                                <th style={{ fontSize: '0.85rem' }}>Student</th>
                                <th style={{ fontSize: '0.85rem' }}>Address</th>
                                <th style={{ fontSize: '0.85rem' }}>Course</th>
                                <th style={{ fontSize: '0.85rem' }}>School</th>
                                <th style={{ fontSize: '0.85rem' }}>Date</th>
                                <th className="text-center" style={{ fontSize: '0.85rem' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentRecords.map((learner, index) => (
                                <tr key={learner.id}>
                                  <td className="ps-3">{indexOfFirstRecord + index + 1}</td>
                                  <td>
                                    <div className="d-flex align-items-center gap-3">
                                      {renderImage(learner.img, learner.sch_name, 40)}
                                      <strong style={{ fontSize: '0.9rem' }}>Learner #{learner.id}</strong>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                      {learner.address || '-'}
                                    </span>
                                  </td>
                                  <td>
                                    <Badge bg="light" text="dark" style={{ fontSize: '0.78rem', fontWeight: 500, padding: '0.35em 0.65em', border: '1px solid #e0e0e0' }}>
                                      <FaBook className="me-1" style={{ fontSize: '0.7rem' }} />
                                      {learner.cour_name || '-'}
                                    </Badge>
                                  </td>
                                  <td>
                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                      {learner.sch_name || '-'}
                                    </span>
                                  </td>
                                  <td style={{ fontSize: '0.85rem' }}>
                                    {learner.created_at ? new Date(learner.created_at).toLocaleDateString() : '-'}
                                  </td>
                                  <td className="text-center">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-1"
                                      onClick={() => openEditModal(learner)}
                                      title="Edit"
                                    >
                                      <FaEdit />
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => openDeleteModal(learner)}
                                      title="Delete"
                                    >
                                      <FaTrash />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>

                  {/* Mobile Card View */}
                  <div className="d-md-none">
                    {currentRecords.map((learner) => (
                      <Card className="mb-3 shadow-sm" key={learner.id} style={{ border: '1px solid #e9ecef', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                        <Card.Body>
                          <div className="d-flex align-items-start gap-3 mb-2">
                            {renderImage(learner.img, learner.sch_name, 56)}
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <strong className="d-block" style={{ fontSize: '0.95rem' }}>Learner #{learner.id}</strong>
                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  {learner.created_at ? new Date(learner.created_at).toLocaleDateString() : ''}
                                </small>
                              </div>
                              <Badge bg="light" text="dark" className="mt-1" style={{ fontSize: '0.75rem', fontWeight: 500, padding: '0.25em 0.55em', border: '1px solid #e0e0e0' }}>
                                <FaBook className="me-1" style={{ fontSize: '0.65rem' }} />
                                {learner.cour_name || '-'}
                              </Badge>
                            </div>
                          </div>

                          <div
                            className="mb-2"
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleCardExpansion(learner.id)}
                          >
                            <small className="text-primary">
                              {expandedCards[learner.id] ? <FaChevronUp className="me-1" /> : <FaChevronDown className="me-1" />}
                              {expandedCards[learner.id] ? 'Hide' : 'Show'} Details
                            </small>
                          </div>

                          {expandedCards[learner.id] && (
                            <div className="mb-2 p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '0.85rem' }}>
                              <div className="mb-1">
                                <FaUniversity className="me-1 text-secondary" style={{ fontSize: '0.8rem' }} />
                                <strong>School:</strong> {learner.sch_name || '-'}
                              </div>
                              <div>
                                <FaMapMarkerAlt className="me-1 text-danger" style={{ fontSize: '0.8rem' }} />
                                <strong>Address:</strong> {learner.address || '-'}
                              </div>
                            </div>
                          )}

                          <div className="d-flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-grow-1"
                              onClick={() => openEditModal(learner)}
                            >
                              <FaEdit className="me-1" /> Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDeleteModal(learner)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center align-items-center mt-4 gap-1">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        Previous
                      </Button>
                      {getPageNumbers().map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'primary' : 'outline-secondary'}
                          size="sm"
                          className="mx-1"
                          onClick={() => setCurrentPage(page)}
                          style={{ minWidth: '36px' }}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Container>
          </div>
        </div>
      </div>

      {/* ===================== ADD MODAL (POST) ===================== */}
      <Modal show={showAddModal} onHide={() => { setShowAddModal(false); resetForm() }} centered size="lg">
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            <FaPlus className="me-2 text-primary" /> Add New Learner
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {renderFormFields()}
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="secondary" onClick={() => { setShowAddModal(false); resetForm() }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitAdd} disabled={submitting}>
            {submitting ? <><Spinner size="sm" className="me-1" /> Adding...</> : <><FaCheck className="me-1" /> Add Learner</>}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===================== EDIT MODAL (PUT) ===================== */}
      <Modal show={showEditModal} onHide={() => { setShowEditModal(false); resetForm() }} centered size="lg">
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            <FaEdit className="me-2 text-primary" /> Edit Learner #{selectedLearner?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {renderFormFields()}
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="secondary" onClick={() => { setShowEditModal(false); resetForm() }} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitEdit} disabled={submitting}>
            {submitting ? <><Spinner size="sm" className="me-1" /> Updating...</> : <><FaCheck className="me-1" /> Update Learner</>}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===================== DELETE MODAL (DELETE) ===================== */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            <FaTrash className="me-2 text-danger" /> Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this learner?</p>
          {selectedLearner && (
            <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <Row>
                <Col xs={3} className="text-center">
                  {renderImage(selectedLearner.img, selectedLearner.sch_name, 50)}
                </Col>
                <Col xs={9}>
                  <p className="mb-1"><strong>Learner ID:</strong> #{selectedLearner.id}</p>
                  <p className="mb-1"><strong>School:</strong> {selectedLearner.sch_name || '-'}</p>
                  <p className="mb-0"><strong>Course:</strong> {selectedLearner.cour_name || '-'}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={submitting}>
            {submitting ? <><Spinner size="sm" className="me-1" /> Deleting...</> : <><FaTrash className="me-1" /> Delete</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default LearnersManagement