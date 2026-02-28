import React, { useState, useEffect, useContext, useRef } from 'react'
import { 
  Container, Row, Col, Card, Spinner, Button, Modal, Form, 
  Accordion, Badge, InputGroup, FormControl, Image 
} from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../../assets/css/AdminDashboard.css'
import { 
  FaPlus, FaArrowLeft, FaBook, FaUsers, FaLayerGroup, 
  FaTrash, FaImage, FaList, FaEye, FaEdit 
} from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'


const AdminDashboard = () => {
  const navigate = useNavigate()
  const isMounted = useRef(true) // Prevents double fetch in React 18 Strict Mode
  
  const authData = useAuth();
  const authToken = authData?.accessToken;
  
  // State for Data
  const [enrollmentCount, setEnrollmentCount] = useState(0)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  
  // State for Views
  const [currentView, setCurrentView] = useState('dashboard')
  
  // State for Course Detail Modal
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // State for Create Course Form
  const [formData, setFormData] = useState({
    course_id: '',
    course_name: '',
    modules: [] 
  })

  // Prevent double submission
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isMounted.current) {
      fetchData()
    }
    return () => { isMounted.current = false }
  }, [authToken, currentView])

  const getAuthConfig = () => {
    const headers = {}
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    // Note: Do NOT set Content-Type here manually when using FormData. 
    // Axios sets it automatically with the correct boundary.
    return { headers }
  }

  const fetchData = async () => {
    if (!authToken) {
      console.warn('Auth token not available, skipping data fetch')
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const config = getAuthConfig()
      console.log('Fetching dashboard data with token:', authToken.substring(0, 10) + '...')
      
      const [enrollRes, courseRes] = await Promise.all([
        axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/', config),
        axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/course-module/', config)
      ])

      console.log('Enrollments response:', enrollRes.data)
      console.log('Courses response:', courseRes.data)

      if (enrollRes.data && enrollRes.data.success) {
        setEnrollmentCount(enrollRes.data.data.length)
        console.log('Set enrollment count to:', enrollRes.data.data.length)
      }
      if (courseRes.data && courseRes.data.success) {
        setCourses(courseRes.data.data)
        console.log('Set courses to:', courseRes.data.data.length, 'courses')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
      }
      // Fallback data in case of error
      setEnrollmentCount(0)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  // --- Navigation Handlers ---
  const handleEnrollmentsClick = () => navigate('/Enrollments')
  const handleCoursesClick = () => setCurrentView('list')
  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    fetchData() // Refresh data when returning to dashboard
  }
  const handleAddCourseClick = () => {
    setFormData({ course_id: '', course_name: '', modules: [] })
    setCurrentView('form')
  }
  const handleViewCourse = (course) => {
    setSelectedCourse(course)
    setShowModal(true)
  }

  const handleEditCourse = (course) => {
    setCurrentView('form');
    // Populate form with course data, including IDs for update
    setFormData({
      id: course.id,
      course_id: course.course_id,
      course_name: course.course_name,
      modules: course.modules.map(mod => ({
        id: mod.id,
        module_id: mod.module_id,
        mod_title: mod.mod_title,
        order: mod.order,
        course: mod.course,
        sub_modules: mod.sub_modules.map(sub => ({
          id: sub.id,
          sub_module_id: sub.sub_module_id,
          sub_modu_title: sub.sub_modu_title,
          sub_modu_description: sub.sub_modu_description,
          image: sub.image, // Preserve image if it exists
          sub_mod: sub.sub_mod,
          order: sub.order,
          module: sub.module,
        }))
      }))
    });
  }

  const handleDeleteCourse = async (course) => {
    if (window.confirm(`Are you sure you want to delete the course "${course.course_name}"?`)) {
      try {
        const config = getAuthConfig()
        await axios.delete('https://brjobsedu.com/girls_course/girls_course_backend/api/course-module/', {
          data: { course_id: course.course_id },
          ...config
        })
        fetchData()
      } catch (error) {
        console.error('Error deleting course:', error)
        alert('Failed to delete course. Please check the console for details.')
      }
    }
  }

  // --- Form Handlers ---

  const addModule = () => {
    const newModule = {
      mod_title: '',
      order: formData.modules.length + 1,
      sub_modules: []
    }
    setFormData({ ...formData, modules: [...formData.modules, newModule] })
  }

  const updateModule = (index, field, value) => {
    const updatedModules = [...formData.modules]
    updatedModules[index][field] = value
    setFormData({ ...formData, modules: updatedModules })
  }

  const removeModule = (index) => {
    const updatedModules = formData.modules.filter((_, i) => i !== index)
    setFormData({ ...formData, modules: updatedModules })
  }

  const addSubModule = (modIndex) => {
    const newSubModule = {
      sub_modu_title: '',
      sub_modu_description: '',
      image: null, 
      sub_mod: [] 
    }
    const updatedModules = [...formData.modules]
    updatedModules[modIndex].sub_modules.push(newSubModule)
    setFormData({ ...formData, modules: updatedModules })
  }

  const updateSubModule = (modIndex, subIndex, field, value) => {
    const updatedModules = [...formData.modules]
    updatedModules[modIndex].sub_modules[subIndex][field] = value
    setFormData({ ...formData, modules: updatedModules })
  }

  const handleImageUpload = (e, modIndex, subIndex) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateSubModule(modIndex, subIndex, 'image', reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeSubModule = (modIndex, subIndex) => {
    const updatedModules = [...formData.modules]
    updatedModules[modIndex].sub_modules = updatedModules[modIndex].sub_modules.filter((_, i) => i !== subIndex)
    setFormData({ ...formData, modules: updatedModules })
  }

  const addSubModContent = (modIndex, subIndex) => {
    const updatedModules = [...formData.modules]
    updatedModules[modIndex].sub_modules[subIndex].sub_mod.push(["", ""])
    setFormData({ ...formData, modules: updatedModules })
  }

  const updateSubModContent = (modIndex, subIndex, contentIndex, fieldIndex, value) => {
    const updatedModules = [...formData.modules]
    updatedModules[modIndex].sub_modules[subIndex].sub_mod[contentIndex][fieldIndex] = value
    setFormData({ ...formData, modules: updatedModules })
  }

  const removeSubModContent = (modIndex, subIndex, contentIndex) => {
    const updatedModules = [...formData.modules]
    updatedModules[modIndex].sub_modules[subIndex].sub_mod = updatedModules[modIndex].sub_modules[subIndex].sub_mod.filter((_, i) => i !== contentIndex)
    setFormData({ ...formData, modules: updatedModules })
  }

  // Helper: Convert Base64 to File Object
  const dataURLtoFile = (dataurl, filename) => {
    if (!dataurl) return null
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while(n--){
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, {type:mime})
  }

  // --- Submit Handler with JSON ---
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return // Prevent double click
    setSubmitting(true)

    try {
      const isUpdate = !!formData.id;

      // Prepare the data in the exact format expected by the backend.
      // We build the payload from formData, which now contains all necessary IDs for an update.
      const dataToSend = {
        id: formData.id,
        course_id: formData.course_id,
        course_name: formData.course_name,
        modules: formData.modules.map(mod => ({
          id: mod.id,
          module_id: mod.module_id,
          mod_title: mod.mod_title,
          order: mod.order,
          course: mod.course,
          sub_modules: mod.sub_modules.map(sub => ({
            id: sub.id,
            sub_module_id: sub.sub_module_id,
            sub_modu_title: sub.sub_modu_title,
            sub_modu_description: sub.sub_modu_description,
            sub_mod: sub.sub_mod.filter(pair => (pair[0] && pair[0].trim() !== "") || (pair[1] && pair[1].trim() !== "")),
            order: sub.order,
            module: sub.module,
            // image is intentionally omitted as per pre-existing comment and logic
          })).filter(sub => sub.sub_modu_title && sub.sub_modu_title.trim() !== "")
        })).filter(mod => mod.mod_title && mod.mod_title.trim() !== "")
      };

      const config = getAuthConfig()
      
      if (isUpdate) {
        // Update existing course
        await axios.put('https://brjobsedu.com/girls_course/girls_course_backend/api/course-module/', dataToSend, config)
        alert('Course updated successfully!')
      } else {
        // Create new course - backend should ignore IDs.
        await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/course-module/', dataToSend, config)
        alert('Course created successfully!')
      }
      
      fetchData()
      setCurrentView('list')
    } catch (error) {
      console.error('Error saving course:', error)
      if (error.response) {
        console.error("Server Response Data:", error.response.data);
        alert(`Failed: ${error.response.data.message || error.response.data.detail || 'Check console for details'}`);
      } else {
        alert('Failed: ' + error.message);
      }
    } finally {
      setSubmitting(false)
    }
  }

  // --- Render Helpers ---

  const renderDashboardView = () => (
    <Row className="g-4">
      <Col xs={12} md={6} lg={4}>
        <Card className="stat-card h-100" onClick={handleEnrollmentsClick}>
          <Card.Body className="d-flex align-items-center">
            <div className="stat-icon-wrapper users me-3">
              <FaUsers className="stat-icon" />
            </div>
            <div>
              <h6 className="stat-label text-muted mb-1">Total Enrollments</h6>
              <h2 className="stat-value mb-0">{loading ? <Spinner size="sm" animation="border" /> : enrollmentCount}</h2>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col xs={12} md={6} lg={4}>
        <Card className="stat-card h-100" onClick={handleCoursesClick}>
          <Card.Body className="d-flex align-items-center">
            <div className="stat-icon-wrapper courses me-3">
              <FaBook className="stat-icon" />
            </div>
            <div>
              <h6 className="stat-label text-muted mb-1">Total Courses</h6>
              <h2 className="stat-value mb-0">{loading ? <Spinner size="sm" animation="border" /> : courses.length}</h2>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  )

  const renderCoursesListView = () => (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <div>
          <Button variant="outline-secondary" size="sm" onClick={handleBackToDashboard} className="me-2">
            <FaArrowLeft /> Dashboard
          </Button>
          <h4 className="d-inline-block align-middle mb-0">All Courses</h4>
        </div>
        <Button variant="primary" onClick={handleAddCourseClick}>
          <FaPlus className="me-2" /> Add New Course
        </Button>
      </div>

      <Row className="g-4">
        {courses.map((course) => (
          <Col key={course.id} xs={12} md={6} lg={4}>
            <Card className="course-card h-100 shadow-sm border-0">
              <Card.Body className="d-flex flex-column">
                <div className="mb-3">
                  <Badge bg="primary" className="mb-2">ID: {course.course_id}</Badge>
                  <Card.Title className="fw-bold">{course.course_name}</Card.Title>
                  <Card.Text className="text-muted small">
                    <FaLayerGroup className="me-1" /> {course.modules.length} Modules
                  </Card.Text>
                </div>
                <div className="mt-auto pt-3 border-top">
                  <div className="d-flex gap-2">
                    <Button variant="light" className="flex-1 text-primary fw-semibold" onClick={() => handleViewCourse(course)}>
                      <FaEye className="me-1" /> View
                    </Button>
                    <Button variant="outline-warning" className="flex-1 text-warning fw-semibold" onClick={() => handleEditCourse(course)}>
                      <FaEdit className="me-1" /> Edit
                    </Button>
                    <Button variant="outline-danger" className="flex-1 text-danger fw-semibold" onClick={() => handleDeleteCourse(course)}>
                      <FaTrash className="me-1" /> Delete
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )

  const renderCourseForm = () => (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <Button variant="outline-secondary" size="sm" onClick={() => setCurrentView('list')}>
          <FaArrowLeft /> Back to List
        </Button>
        <h4 className="mb-0">{formData.course_id ? 'Edit Course' : 'Create New Course'}</h4>
      </div>

      <Card className="shadow-sm border-0 form-card">
        <Card.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Course Name</Form.Label>
              <Form.Control 
                type="text" 
                name="course_name"
                value={formData.course_name}
                onChange={(e) => setFormData({...formData, course_name: e.target.value})}
                placeholder="e.g. Python Full Stack"
                required 
              />
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Course Modules</h5>
              <Button variant="outline-primary" size="sm" onClick={addModule} disabled={submitting}>
                <FaPlus className="me-1" /> Add Module
              </Button>
            </div>

            {formData.modules.map((mod, modIdx) => (
              <Card key={modIdx} className="mb-4 bg-light border-0 module-section">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-3">
                    <h6 className="fw-bold">Module {modIdx + 1}</h6>
                    <Button variant="link" className="text-danger p-0" onClick={() => removeModule(modIdx)} disabled={submitting}>
                      <FaTrash /> Remove Module
                    </Button>
                  </div>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Module Title</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={mod.mod_title}
                      onChange={(e) => updateModule(modIdx, 'mod_title', e.target.value)}
                      placeholder="e.g. Introduction to Python"
                      required
                      disabled={submitting}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                    <Form.Label className="mb-0 fw-bold">Sub-Modules</Form.Label>
                    <Button variant="outline-secondary" size="sm" onClick={() => addSubModule(modIdx)} disabled={submitting}>
                      <FaPlus className="me-1" /> Add Sub-Module
                    </Button>
                  </div>

                  {mod.sub_modules.map((subMod, subIdx) => (
                    <div key={subIdx} className="p-3 bg-white border rounded mb-3 sub-module-item shadow-sm">
                      <div className="d-flex justify-content-end mb-2">
                        <span 
                          className="text-danger small text-decoration-underline" 
                          style={{cursor: 'pointer'}}
                          onClick={() => removeSubModule(modIdx, subIdx)}
                        >
                          <FaTrash className="me-1"/> Remove Sub-Module
                        </span>
                      </div>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label>Title</Form.Label>
                            <Form.Control 
                              size="sm"
                              type="text" 
                              value={subMod.sub_modu_title}
                              onChange={(e) => updateSubModule(modIdx, subIdx, 'sub_modu_title', e.target.value)}
                              required
                              disabled={submitting}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label>Description</Form.Label>
                            <Form.Control 
                              size="sm"
                              as="textarea" 
                              rows={1}
                              value={subMod.sub_modu_description}
                              onChange={(e) => updateSubModule(modIdx, subIdx, 'sub_modu_description', e.target.value)}
                              disabled={submitting}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label><FaImage className="me-1"/> Sub-Module Image</Form.Label>
                        <Form.Control 
                          type="file" 
                          size="sm"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, modIdx, subIdx)}
                          disabled={submitting}
                        />
                        {subMod.image && (
                          <div className="mt-2">
                            <Image src={subMod.image} thumbnail width={100} />
                          </div>
                        )}
                      </Form.Group>

                      <div className="bg-light p-2 rounded">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Form.Label className="mb-0 small fw-bold text-muted">
                            Content Points (Title + Desc)
                          </Form.Label>
                          <Button variant="link" size="sm" className="p-0 text-primary" onClick={() => addSubModContent(modIdx, subIdx)} disabled={submitting}>
                            <FaPlus /> Add Point
                          </Button>
                        </div>
                        
                        {subMod.sub_mod.map((pair, pIdx) => (
                          <div key={pIdx} className="d-flex gap-2 mb-2 align-items-center">
                            <InputGroup size="sm">
                              <FormControl 
                                placeholder="Point Title" 
                                value={pair[0]}
                                onChange={(e) => updateSubModContent(modIdx, subIdx, pIdx, 0, e.target.value)}
                                disabled={submitting}
                              />
                              <FormControl 
                                placeholder="Point Desc" 
                                value={pair[1]}
                                onChange={(e) => updateSubModContent(modIdx, subIdx, pIdx, 1, e.target.value)}
                                disabled={submitting}
                              />
                              <Button variant="outline-danger" onClick={() => removeSubModContent(modIdx, subIdx, pIdx)} disabled={submitting}>
                                <FaTrash />
                              </Button>
                            </InputGroup>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </Card.Body>
              </Card>
            ))}

            <div className="d-flex justify-content-end mt-4">
              <Button variant="primary" type="submit" size="lg" disabled={submitting}>
                {submitting ? <Spinner as="span" animation="border" size="sm" /> : (formData.course_id ? 'Update Course' : 'Create Course')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )

  return (
    <div className="admin-layout d-flex flex-column min-vh-100">
      <AdminTopNav />
      <div className="d-flex flex-grow-1 overflow-hidden">
        <AdminLeftNav />
        
        <div className="flex-grow-1 main-content-wrapper p-4 overflow-auto">
          <Container fluid className="h-100">
            {currentView === 'dashboard' && renderDashboardView()}
            {currentView === 'list' && renderCoursesListView()}
            {currentView === 'form' && renderCourseForm()}
          </Container>
        </div>
      </div>

      {/* Course Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered className="course-modal">
        <Modal.Header closeButton className="border-bottom pb-3">
          <Modal.Title className="fw-bold fs-4">{selectedCourse?.course_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedCourse && (
            <Accordion defaultActiveKey="0">
              {selectedCourse.modules.map((mod, mIdx) => (
                <Accordion.Item eventKey={mIdx} key={mod.id || mIdx} className="mb-3 border rounded overflow-hidden">
                  <Accordion.Header className="bg-light fw-bold">
                    {mod.order}. {mod.mod_title} 
                    <Badge bg="secondary" className="ms-2">{mod.sub_modules.length} Topics</Badge>
                  </Accordion.Header>
                  <Accordion.Body className="p-3 bg-white">
                    <Row>
                      {mod.sub_modules.map((sub, sIdx) => (
                        <Col key={sub.id || sIdx} md={6} className="mb-4">
                          <Card className="h-100 border shadow-sm">
                            {sub.image && (
                              <div className="text-center bg-light pt-3">
                                <Image src={sub.image} fluid style={{ maxHeight: '150px', objectFit: 'contain' }} />
                              </div>
                            )}
                            <Card.Body>
                              <Card.Title className="fs-6 text-primary fw-bold">{sub.sub_modu_title}</Card.Title>
                              <Card.Text className="text-muted small">{sub.sub_modu_description || '-'}</Card.Text>
                              
                              {sub.sub_mod && sub.sub_mod.length > 0 && (
                                <div className="mt-3 pt-3 border-top">
                                  <small className="fw-bold text-uppercase text-muted" style={{fontSize: '0.7rem'}}>Content Details</small>
                                  <ul className="mb-0 ps-3 mt-2 small">
                                    {sub.sub_mod.map((item, i) => (
                                      <li key={i}>
                                        <strong>{item[0]}:</strong> {item[1]}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default AdminDashboard