import React, { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Form, Badge } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import '../../assets/css/Enrollments.css'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSearch, FaChevronDown, FaChevronUp, FaTimes, FaCheck, FaImage } from 'react-icons/fa'

const API_URL = 'https://brjobsedu.com/girls_course/girls_course_backend/api/our-gallery/'
const BASE_URL = 'https://brjobsedu.com/girls_course/girls_course_backend'

const getImageUrl = (img) => {
  if (!img) return null
  if (img.startsWith('http')) return img
  if (img.startsWith('/media')) return BASE_URL + img
  return img
}

const GalleryManageMent = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(10)
  const [expandedCards, setExpandedCards] = useState({})

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    img: null
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState(null)

  const fetchGallery = async () => {
    setLoading(true)
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setGalleryItems(response.data.data)
      } else {
        setGalleryItems([])
      }
    } catch (error) {
      console.error('Error fetching gallery:', error)
      setGalleryItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGallery()
  }, [])

  const filteredItems = useMemo(() => {
    let result = [...galleryItems]
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      result = result.filter(item =>
        (item.id || '').toString().includes(term) ||
        (item.img || '').toLowerCase().includes(term) ||
        (item.created_at || '').toLowerCase().includes(term)
      )
    }
    return result
  }, [searchTerm, galleryItems])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredItems.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredItems.length / recordsPerPage)

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

  const resetForm = () => {
    setFormData({ img: null })
    setImagePreview(null)
    setExistingImageUrl(null)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ img: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setFormData({ img: null })
      setImagePreview(null)
    }
  }

  const removeImage = () => {
    setFormData({ img: null })
    setImagePreview(null)
    setExistingImageUrl(null)
  }

  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const openEditModal = (item) => {
    setSelectedItem(item)
    setFormData({ img: null })
    if (item.img) {
      setExistingImageUrl(item.img)
      setImagePreview(getImageUrl(item.img))
    } else {
      setExistingImageUrl(null)
      setImagePreview(null)
    }
    setShowEditModal(true)
  }

  const openDeleteModal = (item) => {
    setSelectedItem(item)
    setShowDeleteModal(true)
  }

  const submitAdd = async () => {
    setSubmitting(true)
    try {
      const dataToSend = new FormData()
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
        fetchGallery()
        alert('Gallery item added successfully!')
      } else {
        alert(response.data?.message || 'Failed to add gallery item.')
      }
    } catch (error) {
      console.error('Error adding gallery item:', error)
      alert('An error occurred while adding the gallery item.')
    } finally {
      setSubmitting(false)
    }
  }

  const submitEdit = async () => {
    if (!selectedItem) return
    setSubmitting(true)
    try {
      const dataToSend = new FormData()
      dataToSend.append('id', selectedItem.id)
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
        setSelectedItem(null)
        resetForm()
        fetchGallery()
        alert('Gallery item updated successfully!')
      } else {
        alert(response.data?.message || 'Failed to update gallery item.')
      }
    } catch (error) {
      console.error('Error updating gallery item:', error)
      alert('An error occurred while updating the gallery item.')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedItem) return
    setSubmitting(true)
    try {
      const response = await axios.delete(API_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: { id: selectedItem.id }
      })

      if (response.data && response.data.success) {
        setShowDeleteModal(false)
        setSelectedItem(null)
        fetchGallery()
        alert('Gallery item deleted successfully!')
      } else {
        alert(response.data?.message || 'Failed to delete gallery item.')
      }
    } catch (error) {
      console.error('Error deleting gallery item:', error)
      alert('An error occurred while deleting the gallery item.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderImage = (img, size = 40) => {
    const resolvedImg = getImageUrl(img)
    const fallbackSrc = `https://ui-avatars.com/api/?name=Gallery&background=5B2D90&color=fff&size=${size * 2}`
    if (resolvedImg) {
      return (
        <img
          src={resolvedImg}
          alt="Gallery"
          style={{ width: size, height: size, borderRadius: '8px', objectFit: 'cover', border: '2px solid #e0e0e0' }}
          onError={(e) => { e.target.src = fallbackSrc }}
        />
      )
    }
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '8px',
        background: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #e0e0e0',
        color: '#94a3b8'
      }}>
        <FaImage />
      </div>
    )
  }

  const renderImagePreview = () => {
    const resolvedPreview = getImageUrl(imagePreview)
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

  const renderFormFields = () => (
    <>
      <Form.Group className="mb-3">
        <Form.Label><strong>Image <span className="text-danger">*</span></strong></Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        {renderImagePreview()}
        {!imagePreview && existingImageUrl && (
          <div className="mt-2">
            <p className="text-muted mb-1">Current image:</p>
            {renderImage(existingImageUrl, 120)}
          </div>
        )}
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
              <div className="d-flex justify-content-between align-items-center mb-4 page-header flex-wrap gap-2">
                <div className="d-flex align-items-center all-en-box gap-3">
                  <Button variant="outline-secondary" size="sm" onClick={() => navigate('/AdminDashboard')} className="me-2">
                    <FaArrowLeft /> Dashboard
                  </Button>
                  <h4 className="mb-0">Gallery Management</h4>
                </div>
                <Button variant="primary" size="sm" onClick={openAddModal}>
                  <FaPlus className="me-1" /> Add Image
                </Button>
              </div>

              <Row className="mb-3 align-items-center">
                <Col md={5} xs={12} className="mb-2 mb-md-0">
                  <div className="position-relative">
                    <FaSearch className="position-absolute" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                    <Form.Control
                      type="text"
                      placeholder="Search by ID, image path, date..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="ps-4"
                    />
                  </div>
                </Col>
                <Col md={3} xs={12} className="text-md-end">
                  <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Total: <strong>{filteredItems.length}</strong> items
                  </span>
                </Col>
              </Row>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Loading gallery...</p>
                </div>
              ) : currentRecords.length === 0 ? (
                <Card className="text-center py-5">
                  <Card.Body>
                    <p className="text-muted mb-0">No gallery items found.</p>
                  </Card.Body>
                </Card>
              ) : (
                <>
                  <div className="d-none d-md-block">
                    <Card className="shadow-sm">
                      <Card.Body className="p-0">
                        <div className="table-responsive">
                          <Table className="mb-0 align-middle" hover>
                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                              <tr>
                                <th className="ps-3" style={{ fontSize: '0.85rem' }}>#</th>
                                <th style={{ fontSize: '0.85rem' }}>Image</th>
                                <th style={{ fontSize: '0.85rem' }}>Path</th>
                                <th style={{ fontSize: '0.85rem' }}>Created At</th>
                                <th className="text-center" style={{ fontSize: '0.85rem' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentRecords.map((item, index) => (
                                <tr key={item.id}>
                                  <td className="ps-3">{indexOfFirstRecord + index + 1}</td>
                                  <td>{renderImage(item.img, 50)}</td>
                                  <td>
                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                                      {item.img || '-'}
                                    </span>
                                  </td>
                                  <td style={{ fontSize: '0.85rem' }}>
                                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                                  </td>
                                  <td className="text-center">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-1"
                                      onClick={() => openEditModal(item)}
                                      title="Edit"
                                    >
                                      <FaEdit />
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => openDeleteModal(item)}
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

                  <div className="d-md-none">
                    {currentRecords.map((item) => (
                      <Card className="mb-3 shadow-sm" key={item.id} style={{ border: '1px solid #e9ecef', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                        <Card.Body>
                          <div className="d-flex align-items-start gap-3 mb-2">
                            {renderImage(item.img, 60)}
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <strong className="d-block" style={{ fontSize: '0.95rem' }}>Gallery #{item.id}</strong>
                                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                                </small>
                              </div>
                              <p className="mb-0 mt-1" style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                {item.img || 'No image'}
                              </p>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              className="flex-grow-1"
                              onClick={() => openEditModal(item)}
                            >
                              <FaEdit className="me-1" /> Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => openDeleteModal(item)}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>

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

      <Modal show={showAddModal} onHide={() => { setShowAddModal(false); resetForm() }} centered size="lg">
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            <FaPlus className="me-2 text-primary" /> Add Gallery Image
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
            {submitting ? <><Spinner size="sm" className="me-1" /> Adding...</> : <><FaCheck className="me-1" /> Add Image</>}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => { setShowEditModal(false); resetForm() }} centered size="lg">
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            <FaEdit className="me-2 text-primary" /> Edit Gallery #{selectedItem?.id}
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
            {submitting ? <><Spinner size="sm" className="me-1" /> Updating...</> : <><FaCheck className="me-1" /> Update Image</>}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            <FaTrash className="me-2 text-danger" /> Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this gallery image?</p>
          {selectedItem && (
            <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <Row>
                <Col xs={3} className="text-center">
                  {renderImage(selectedItem.img, 60)}
                </Col>
                <Col xs={9}>
                  <p className="mb-1"><strong>Gallery ID:</strong> #{selectedItem.id}</p>
                  <p className="mb-1"><strong>Path:</strong> {selectedItem.img || '-'}</p>
                  <p className="mb-0"><strong>Created:</strong> {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleDateString() : '-'}</p>
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

export default GalleryManageMent
