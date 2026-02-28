import React, { useState, useEffect, useRef } from 'react'
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

  // State for Simple Course Form
  const [courseFormData, setCourseFormData] = useState({
    course_name: ''
  })
  
  // Prevent double submission
  const [submitting, setSubmitting] = useState(false)

  // State for Module Management
  const [moduleViewData, setModuleViewData] = useState(null) // { course }
  const [modules, setModules] = useState([])
  const [moduleFormData, setModuleFormData] = useState({
    mod_title: '',
    order: 1
  })
  const [loadingModules, setLoadingModules] = useState(false)

  // State for Submodules Management
  const [submodulesViewData, setSubmodulesViewData] = useState(null) // { course, module }
  const [submodules, setSubmodules] = useState([])
  const [submoduleFormData, setSubmoduleFormData] = useState({
    sub_modu_title: '',
    sub_modu_description: '',
    sub_mod: [{ title: '', description: '' }],
    image: null,
    order: 1
  })
  const [loadingSubmodules, setLoadingSubmodules] = useState(false)

  // State for Questions Management
  const [questionsViewData, setQuestionsViewData] = useState(null) // { course, module }
  const [questions, setQuestions] = useState([])
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    marks: 1
  })
  const [loadingQuestions, setLoadingQuestions] = useState(false)

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
      
      // Fetch enrollment count
      try {
        const enrollRes = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/', config)
        console.log('Enrollments response:', enrollRes.data)
        if (enrollRes.data && enrollRes.data.success) {
          setEnrollmentCount(enrollRes.data.data.length)
          console.log('Set enrollment count to:', enrollRes.data.data.length)
        }
      } catch (enrollError) {
        console.error('Error fetching enrollments:', enrollError)
        setEnrollmentCount(0)
      }

      // Fetch courses data from new endpoint
      try {
        const courseRes = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/course-items/', config)
        console.log('Courses response:', courseRes.data)
        if (courseRes.data && courseRes.data.success) {
          setCourses(courseRes.data.data)
          console.log('Set courses to:', courseRes.data.data.length, 'courses')
        }
      } catch (courseError) {
        console.error('Error fetching courses:', courseError)
        setCourses([])
      }

    } catch (error) {
      console.error('Error in fetchData:', error)
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
    setCourseFormData({ course_name: '' })
    setCurrentView('form')
  }
  const handleViewCourse = async (course) => {
    try {
      const config = getAuthConfig()
      const response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/course-module/?course_id=${course.course_id}`, config)
      if (response.data && response.data.success) {
        setSelectedCourse(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching course details:', error)
      alert('Failed to fetch course details. Please check the console for details.')
    }
    setShowModal(true)
  }

  const handleEditCourse = (course) => {
    setCourseFormData({
      course_id: course.course_id,
      course_name: course.course_name
    })
    setCurrentView('form')
  }

  const handleDeleteCourse = async (course) => {
    if (window.confirm(`Are you sure you want to delete the course "${course.course_name}"?`)) {
      try {
        const config = getAuthConfig()
        await axios.delete('https://brjobsedu.com/girls_course/girls_course_backend/api/course-items/', {
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

  const handleAddModule = (course) => {
    setModuleViewData({ course })
    setCurrentView('modules')
    setModules([])
    setModuleFormData({
      mod_title: '',
      order: 1
    })
    fetchModules(course.course_id)
  }

  const fetchModules = async (course_id) => {
    setLoadingModules(true)
    try {
      const config = getAuthConfig()
      const response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/module-items/?course_id=${course_id}`, config)
      if (response.data && response.data.success) {
        setModules(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching modules:', error)
      alert('Failed to fetch modules. Please check the console for details.')
    } finally {
      setLoadingModules(false)
    }
  }

  const handleAddModuleSubmit = async (e) => {
    e.preventDefault()
    if (!moduleViewData?.course) {
      alert('Please select a course first')
      return
    }

    try {
      const config = getAuthConfig()
      const dataToSend = {
        course_id: moduleViewData.course.course_id,
        mod_title: moduleFormData.mod_title,
        order: moduleFormData.order
      }

      if (moduleFormData.module_id) {
        // Update existing module
        await axios.put('https://brjobsedu.com/girls_course/girls_course_backend/api/module-items/', {
          ...dataToSend,
          module_id: moduleFormData.module_id
        }, config)
        alert('Module updated successfully!')
      } else {
        // Create new module
        await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/module-items/', dataToSend, config)
        alert('Module added successfully!')
      }
      
      // Reset form and fetch updated modules
      setModuleFormData({
        mod_title: '',
        order: 1
      })
      fetchModules(moduleViewData.course.course_id)
    } catch (error) {
      console.error('Error saving module:', error)
      if (error.response) {
        alert(`Failed: ${error.response.data.message || error.response.data.detail || 'Check console for details'}`)
      } else {
        alert('Failed: ' + error.message)
      }
    }
  }

  const handleEditModule = (module) => {
    setModuleFormData({
      module_id: module.module_id,
      mod_title: module.mod_title,
      order: module.order
    })
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteModule = async (module) => {
    if (window.confirm(`Are you sure you want to delete the module "${module.mod_title}"?`)) {
      try {
        const config = getAuthConfig()
        await axios.delete('https://brjobsedu.com/girls_course/girls_course_backend/api/module-items/', {
          data: { module_id: module.module_id },
          ...config
        })
        fetchModules(moduleViewData.course.course_id)
      } catch (error) {
        console.error('Error deleting module:', error)
        alert('Failed to delete module. Please check the console for details.')
      }
    }
  }

  const handleAddSubmodules = (course, module) => {
    setSubmodulesViewData({ course, module })
    setCurrentView('submodules')
    setSubmodules([])
    setSubmoduleFormData({
      sub_modu_title: '',
      sub_modu_description: '',
      sub_mod: [{ title: '', description: '', topics: [] }],
      image: null,
      order: 1
    })
    fetchSubmodules(course.course_id, module.module_id)
  }

  const fetchSubmodules = async (course_id, module_id) => {
    setLoadingSubmodules(true)
    try {
      const config = getAuthConfig()
      const response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/submodule-items/?course_id=${course_id}&module_id=${module_id}`, config)
      if (response.data && response.data.success) {
        const parsedSubmodules = response.data.data.map(submodule => ({
          ...submodule,
          sub_mod: typeof submodule.sub_mod === 'string' ? JSON.parse(submodule.sub_mod) : submodule.sub_mod
        }))
        setSubmodules(parsedSubmodules)
      }
    } catch (error) {
      console.error('Error fetching submodules:', error)
      alert('Failed to fetch submodules. Please check the console for details.')
    } finally {
      setLoadingSubmodules(false)
    }
  }

  const handleAddSubmoduleSubmit = async (e) => {
    e.preventDefault()
    if (!submodulesViewData?.course || !submodulesViewData?.module) {
      alert('Please select a module first')
      return
    }

    try {
      const config = getAuthConfig()
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('course_id', submodulesViewData.course.course_id)
      formData.append('module_id', submodulesViewData.module.module_id)
      formData.append('sub_modu_title', submoduleFormData.sub_modu_title)
      formData.append('sub_modu_description', submoduleFormData.sub_modu_description)
      formData.append('sub_mod', JSON.stringify(submoduleFormData.sub_mod))
      formData.append('order', submoduleFormData.order)
      if (submoduleFormData.image) {
        formData.append('image', submoduleFormData.image)
      }
      if (submoduleFormData.sub_module_id) {
        formData.append('sub_module_id', submoduleFormData.sub_module_id)
      }

      if (submoduleFormData.sub_module_id) {
        // Update existing submodule
        await axios.put('https://brjobsedu.com/girls_course/girls_course_backend/api/submodule-items/', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        // Create new submodule
        await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/submodule-items/', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        })
      }
      
      // Reset form and fetch updated submodules
      setSubmoduleFormData({
        sub_modu_title: '',
        sub_modu_description: '',
        sub_mod: [{ title: '', description: '', topics: [] }],
        image: null,
        order: 1
      })
      fetchSubmodules(submodulesViewData.course.course_id, submodulesViewData.module.module_id)
      alert(submoduleFormData.sub_module_id ? 'Submodule updated successfully!' : 'Submodule added successfully!')
    } catch (error) {
      console.error('Error saving submodule:', error)
      if (error.response) {
        alert(`Failed: ${error.response.data.message || error.response.data.detail || 'Check console for details'}`)
      } else {
        alert('Failed: ' + error.message)
      }
    }
  }

  const handleEditSubmodule = (submodule) => {
    setSubmoduleFormData({
      sub_module_id: submodule.sub_module_id,
      sub_modu_title: submodule.sub_modu_title,
      sub_modu_description: submodule.sub_modu_description,
      sub_mod: submodule.sub_mod || [{ title: '', description: '', topics: [] }],
      image: null,
      order: submodule.order
    })
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteSubmodule = async (submodule) => {
    if (window.confirm(`Are you sure you want to delete the submodule "${submodule.sub_modu_title}"?`)) {
      try {
        const config = getAuthConfig()
        await axios.delete('https://brjobsedu.com/girls_course/girls_course_backend/api/submodule-items/', {
          data: { sub_module_id: submodule.sub_module_id },
          ...config
        })
        fetchSubmodules(submodulesViewData.course.course_id, submodulesViewData.module.module_id)
      } catch (error) {
        console.error('Error deleting submodule:', error)
        alert('Failed to delete submodule. Please check the console for details.')
      }
    }
  }

  const handleAddSubModSection = () => {
    setSubmoduleFormData({
      ...submoduleFormData,
      sub_mod: [...submoduleFormData.sub_mod, { title: '', description: '' }]
    })
  }

  const handleRemoveSubModSection = (index) => {
    if (submoduleFormData.sub_mod.length > 1) {
      const newSubMod = [...submoduleFormData.sub_mod]
      newSubMod.splice(index, 1)
      setSubmoduleFormData({
        ...submoduleFormData,
        sub_mod: newSubMod
      })
    }
  }

  const handleSubModSectionChange = (index, field, value) => {
    const newSubMod = [...submoduleFormData.sub_mod]
    newSubMod[index][field] = value
    setSubmoduleFormData({
      ...submoduleFormData,
      sub_mod: newSubMod
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setSubmoduleFormData({
      ...submoduleFormData,
      image: file
    })
  }

  const handleAddQuestions = (course, module) => {
    setQuestionsViewData({ course, module })
    setCurrentView('questions')
    setQuestions([])
    setQuestionFormData({
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      marks: 1
    })
    if (module) {
      fetchQuestions(course.course_id, module.module_id)
    }
  }

  const fetchQuestions = async (course_id, module_id) => {
    setLoadingQuestions(true)
    try {
      const config = getAuthConfig()
      const response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/module-questions/?course_id=${course_id}&module_id=${module_id}`, config)
      if (response.data && response.data.success) {
        setQuestions(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      alert('Failed to fetch questions. Please check the console for details.')
    } finally {
      setLoadingQuestions(false)
    }
  }

  const handleAddQuestion = async (e) => {
    e.preventDefault()
    if (!questionsViewData?.course || !questionsViewData?.module) {
      alert('Please select a module first')
      return
    }

    try {
      const config = getAuthConfig()
      const dataToSend = {
        course_id: questionsViewData.course.course_id,
        module_id: questionsViewData.module.module_id,
        question_text: questionFormData.question_text,
        options: questionFormData.options,
        correct_answer: questionFormData.correct_answer,
        marks: questionFormData.marks
      }

      await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/module-questions/', dataToSend, config)
      
      // Reset form and fetch updated questions
      setQuestionFormData({
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        marks: 1
      })
      fetchQuestions(questionsViewData.course.course_id, questionsViewData.module.module_id)
      alert('Question added successfully!')
    } catch (error) {
      console.error('Error adding question:', error)
      if (error.response) {
        alert(`Failed: ${error.response.data.message || error.response.data.detail || 'Check console for details'}`)
      } else {
        alert('Failed: ' + error.message)
      }
    }
  }

  // --- Course Form Handler ---
  const handleCourseFormSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return // Prevent double click
    setSubmitting(true)

    try {
      const config = getAuthConfig()
      
      if (courseFormData.course_id) {
        // Update existing course
        await axios.put('https://brjobsedu.com/girls_course/girls_course_backend/api/course-items/', {
          course_id: courseFormData.course_id,
          course_name: courseFormData.course_name
        }, config)
        alert('Course updated successfully!')
      } else {
        // Create new course
        await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/course-items/', {
          course_name: courseFormData.course_name
        }, config)
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
                </div>
                <div className="mt-auto pt-3 border-top">
                  <div className="d-flex flex-wrap gap-1">
                    <Button variant="light" size="sm" className="flex-shrink-0 text-primary" onClick={() => handleViewCourse(course)}>
                      <FaEye className="me-1" /> View
                    </Button>
                    <Button variant="outline-warning" size="sm" className="flex-shrink-0 text-warning" onClick={() => handleEditCourse(course)}>
                      <FaEdit className="me-1" /> Edit
                    </Button>
                    <Button variant="outline-danger" size="sm" className="flex-shrink-0 text-danger" onClick={() => handleDeleteCourse(course)}>
                      <FaTrash className="me-1" /> Delete
                    </Button>
                    <Button variant="outline-info" size="sm" className="flex-shrink-0 text-info" onClick={() => handleAddModule(course)}>
                      <FaLayerGroup className="me-1" /> Add Module
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

  const renderModulesView = () => (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <Button variant="outline-secondary" size="sm" onClick={() => setCurrentView('list')}>
          <FaArrowLeft /> Back to Courses
        </Button>
        <h4 className="mb-0">Module Management</h4>
      </div>

      {/* Course Information */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="mb-3">
            <FaBook className="me-2" /> {moduleViewData?.course?.course_name}
          </h5>
          <p className="text-muted small">
            Course ID: {moduleViewData?.course?.course_id}
          </p>
        </Card.Body>
      </Card>

      {/* Add Module Form */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-primary text-white">
          <FaPlus className="me-2" /> Add New Module
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddModuleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Module Title</Form.Label>
              <Form.Control
                type="text"
                value={moduleFormData.mod_title}
                onChange={(e) => setModuleFormData({ ...moduleFormData, mod_title: e.target.value })}
                placeholder="e.g. Introduction to Python"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Module Order</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={moduleFormData.order}
                onChange={(e) => setModuleFormData({ ...moduleFormData, order: parseInt(e.target.value) })}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              <FaPlus className="me-2" /> {moduleFormData.module_id ? 'Update Module' : 'Add Module'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Modules List */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-info text-white">
          <FaLayerGroup className="me-2" /> Modules ({modules.length})
        </Card.Header>
        <Card.Body>
          {loadingModules ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading modules...</p>
            </div>
          ) : modules.length === 0 ? (
            <div className="text-center text-muted">
              <p>No modules found for this course.</p>
              <p>Add your first module above!</p>
            </div>
          ) : (
            <div className="modules-list">
              {modules.map((module, index) => (
                <Card key={module.id} className="mb-3 border-left-primary">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h6 className="fw-bold mb-0">
                        Module {module.order}: {module.mod_title}
                      </h6>
                      <Badge bg="secondary">ID: {module.module_id}</Badge>
                    </div>
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        onClick={() => handleAddSubmodules(moduleViewData.course, module)}
                      >
                        <FaLayerGroup className="me-1" /> Add Submodule
                      </Button>
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        onClick={() => handleAddQuestions(moduleViewData.course, module)}
                      >
                        <FaList className="me-1" /> Add Questions
                      </Button>
                      <Button 
                        variant="outline-warning" 
                        size="sm"
                        onClick={() => handleEditModule(module)}
                      >
                        <FaEdit className="me-1" /> Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteModule(module)}
                      >
                        <FaTrash className="me-1" /> Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )

  const renderCourseForm = () => (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <Button variant="outline-secondary" size="sm" onClick={() => setCurrentView('list')}>
          <FaArrowLeft /> Back to List
        </Button>
        <h4 className="mb-0">{courseFormData.course_id ? 'Edit Course' : 'Create New Course'}</h4>
      </div>

      <Card className="shadow-sm border-0 form-card">
        <Card.Body>
          <Form onSubmit={handleCourseFormSubmit}>
            <Form.Group className="mb-4">
              <Form.Label>Course Name</Form.Label>
              <Form.Control 
                type="text" 
                value={courseFormData.course_name}
                onChange={(e) => setCourseFormData({...courseFormData, course_name: e.target.value})}
                placeholder="e.g. Python Full Stack"
                required 
                disabled={submitting}
              />
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="primary" type="submit" size="lg" disabled={submitting}>
                {submitting ? <Spinner as="span" animation="border" size="sm" /> : (courseFormData.course_id ? 'Update Course' : 'Create Course')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  )

  const renderSubmodulesView = () => (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <Button variant="outline-secondary" size="sm" onClick={() => setCurrentView('modules')}>
          <FaArrowLeft /> Back to Modules
        </Button>
        <h4 className="mb-0">Submodule Management</h4>
      </div>

      {/* Course and Module Information */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="mb-3">
            <FaBook className="me-2" /> {submodulesViewData?.course?.course_name}
          </h5>
          <p className="text-muted small">
            Course ID: {submodulesViewData?.course?.course_id}
          </p>
          <p className="text-muted small">
            Module: {submodulesViewData?.module?.mod_title} (ID: {submodulesViewData?.module?.module_id})
          </p>
        </Card.Body>
      </Card>

      {/* Add Submodule Form */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-primary text-white">
          <FaPlus className="me-2" /> Add New Submodule
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddSubmoduleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Submodule Title</Form.Label>
              <Form.Control
                type="text"
                value={submoduleFormData.sub_modu_title}
                onChange={(e) => setSubmoduleFormData({ ...submoduleFormData, sub_modu_title: e.target.value })}
                placeholder="e.g. Introduction"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Submodule Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={submoduleFormData.sub_modu_description}
                onChange={(e) => setSubmoduleFormData({ ...submoduleFormData, sub_modu_description: e.target.value })}
                placeholder="e.g. Basic concepts"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Order</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={submoduleFormData.order}
                onChange={(e) => setSubmoduleFormData({ ...submoduleFormData, order: parseInt(e.target.value) })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label>Sections</Form.Label>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={handleAddSubModSection}
                >
                  <FaPlus className="me-1" /> Add Section
                </Button>
              </div>
              {submoduleFormData.sub_mod.map((section, sectionIndex) => (
                <div key={sectionIndex} className="mb-4 p-3 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Label className="small fw-bold">Section {sectionIndex + 1}</Form.Label>
                    {submoduleFormData.sub_mod.length > 1 && (
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleRemoveSubModSection(sectionIndex)}
                      >
                        <FaTrash className="me-1" /> Remove
                      </Button>
                    )}
                  </div>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="small">Section Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Introduction to Python"
                      value={section.title}
                      onChange={(e) => handleSubModSectionChange(sectionIndex, 'title', e.target.value)}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="small">Section Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="e.g. Basic concepts and fundamentals"
                      value={section.description}
                      onChange={(e) => handleSubModSectionChange(sectionIndex, 'description', e.target.value)}
                    />
                  </Form.Group>
                </div>
              ))}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {submoduleFormData.image && (
                <div className="mt-2">
                  <Image 
                    src={URL.createObjectURL(submoduleFormData.image)} 
                    alt="Preview" 
                    thumbnail 
                    className="img-fluid" 
                    style={{ maxWidth: '200px' }}
                  />
                </div>
              )}
            </Form.Group>

            <Button variant="primary" type="submit">
              <FaPlus className="me-2" /> {submoduleFormData.sub_module_id ? 'Update Submodule' : 'Add Submodule'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Submodules List */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-info text-white">
          <FaLayerGroup className="me-2" /> Submodules ({submodules.length})
        </Card.Header>
        <Card.Body>
          {loadingSubmodules ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading submodules...</p>
            </div>
          ) : submodules.length === 0 ? (
            <div className="text-center text-muted">
              <p>No submodules found for this module.</p>
              <p>Add your first submodule above!</p>
            </div>
          ) : (
            <div className="submodules-list">
              {submodules.map((submodule, index) => (
                <Card key={submodule.id} className="mb-3 border-left-primary">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h6 className="fw-bold mb-0">
                        Submodule {submodule.order}: {submodule.sub_modu_title}
                      </h6>
                      <Badge bg="secondary">ID: {submodule.sub_module_id}</Badge>
                    </div>
                    <p className="mb-3">{submodule.sub_modu_description}</p>
                    <div className="mb-3">
                      <h6 className="small fw-bold">Sections:</h6>
                      {submodule.sub_mod.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="mb-3 p-2 border rounded bg-light">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="small fw-bold mb-0">
                              Section {sectionIndex + 1}: {section.title || 'Untitled Section'}
                            </h6>
                          </div>
                          {section.description && (
                            <p className="small mb-2">{section.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    {submodule.image && (
                      <div className="mb-3">
                        <Image 
                          src={`https://brjobsedu.com/girls_course/girls_course_backend${submodule.image}`} 
                          alt="Submodule" 
                          thumbnail 
                          className="img-fluid"
                          style={{ maxWidth: '200px' }}
                        />
                      </div>
                    )}
                    <div className="d-flex gap-2">
                      <Button 
                        variant="outline-warning" 
                        size="sm"
                        onClick={() => handleEditSubmodule(submodule)}
                      >
                        <FaEdit className="me-1" /> Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteSubmodule(submodule)}
                      >
                        <FaTrash className="me-1" /> Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )

  const renderQuestionsView = () => (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <Button variant="outline-secondary" size="sm" onClick={() => setCurrentView('list')}>
          <FaArrowLeft /> Back to Courses
        </Button>
        <h4 className="mb-0">Questions Management</h4>
      </div>

      {/* Course and Module Selection */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="mb-3">
            <FaBook className="me-2" /> {questionsViewData?.course?.course_name}
          </h5>
          <div className="mb-3">
            <label className="form-label fw-bold">Select Module:</label>
            <div className="d-flex flex-wrap gap-2">
              {questionsViewData?.course?.modules?.map((module, index) => (
                <Button
                  key={index}
                  variant={questionsViewData.module?.module_id === module.module_id ? 'primary' : 'outline-primary'}
                  onClick={() => {
                    setQuestionsViewData({ ...questionsViewData, module })
                    fetchQuestions(questionsViewData.course.course_id, module.module_id)
                  }}
                >
                  {module.mod_title}
                </Button>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>

      {questionsViewData?.module && (
        <>
          {/* Add Question Form */}
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-primary text-white">
              <FaPlus className="me-2" /> Add New Question
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddQuestion}>
                <Form.Group className="mb-3">
                  <Form.Label>Question Text</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={questionFormData.question_text}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question_text: e.target.value })}
                    placeholder="Enter your question here..."
                    required
                  />
                </Form.Group>

                <div className="mb-3">
                  <Form.Label>Options</Form.Label>
                  {questionFormData.options.map((option, index) => (
                    <Form.Group key={index} className="mb-2">
                      <InputGroup>
                        <InputGroup.Text>{String.fromCharCode(65 + index)}</InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionFormData.options]
                            newOptions[index] = e.target.value
                            setQuestionFormData({ ...questionFormData, options: newOptions })
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                  ))}
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Correct Answer</Form.Label>
                  <Form.Select
                    value={questionFormData.correct_answer}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, correct_answer: parseInt(e.target.value) })}
                    required
                  >
                    {questionFormData.options.map((_, index) => (
                      <option key={index} value={index}>
                        {String.fromCharCode(65 + index)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Marks</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={questionFormData.marks}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, marks: parseInt(e.target.value) })}
                    required
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  <FaPlus className="me-2" /> Add Question
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Questions List */}
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-info text-white">
              <FaList className="me-2" /> Questions ({questions.length})
            </Card.Header>
            <Card.Body>
              {loadingQuestions ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Loading questions...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center text-muted">
                  <p>No questions found for this module.</p>
                  <p>Add your first question above!</p>
                </div>
              ) : (
                <div className="questions-list">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="mb-3 border-left-primary">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h6 className="fw-bold mb-0">
                            Question {index + 1} ({question.marks} mark{question.marks > 1 ? 's' : ''})
                          </h6>
                        </div>
                        <p className="mb-3">{question.question_text}</p>
                        <div className="mb-3">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="mb-2">
                              <div className={`d-inline-block px-2 py-1 rounded ${
                                optIndex === question.correct_answer 
                                  ? 'bg-success text-white' 
                                  : 'bg-light'
                              }`}>
                                {String.fromCharCode(65 + optIndex)}. 
                              </div>
                              <span className="ms-2">{option}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-muted small">
                          Correct Answer: <span className="fw-bold text-success">
                            {String.fromCharCode(65 + question.correct_answer)}
                          </span>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </>
      )}
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
            {currentView === 'modules' && renderModulesView()}
            {currentView === 'submodules' && renderSubmodulesView()}
            {currentView === 'questions' && renderQuestionsView()}
          </Container>
        </div>
      </div>

      {/* Course Details Modal */}
<Modal
  show={showModal}
  onHide={() => setShowModal(false)}
  fullscreen
  style={{
    padding: 0
  }}
  contentClassName="border-0"
  dialogClassName="m-0"
>        <Modal.Header closeButton className="border-bottom py-2">
          <Modal.Title className="fw-bold fs-5">{selectedCourse?.course_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedCourse && (
            <div>
              <p><strong>Course ID:</strong> {selectedCourse.course_id}</p>
              <p><strong>Course Name:</strong> {selectedCourse.course_name}</p>
              {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                <div className="mt-4">
                  <h5>Modules ({selectedCourse.modules.length})</h5>
                  <div className="modules-list">
                    {selectedCourse.modules.map((mod, index) => (
                      <div key={index} className="module-item mb-4 p-3 border rounded">
                        <h6 className="fw-bold mb-2">
                          Module {mod.order}: {mod.mod_title}
                          <Badge bg="secondary" className="ms-2">ID: {mod.module_id}</Badge>
                        </h6>
                        
                        {mod.sub_modules && mod.sub_modules.length > 0 && (
                          <div className="mt-3">
                            <h7 className="fw-bold text-muted">Sub-modules ({mod.sub_modules.length})</h7>
                            <div className="submodules-list mt-2">
                              {mod.sub_modules.map((subMod, subIndex) => (
                                <div key={subIndex} className="submodule-item mb-3 p-2 border rounded bg-light">
                                  <h7 className="fw-bold">
                                    Submodule {subMod.order}: {subMod.sub_modu_title}
                                    <Badge bg="secondary" className="ms-2">ID: {subMod.sub_module_id}</Badge>
                                  </h7>
                                  
                                  {subMod.sub_modu_description && (
                                    <p className="small mt-1">{subMod.sub_modu_description}</p>
                                  )}
                                  
                                  {subMod.image && (
                                    <div className="mt-2">
                                      <Image 
                                        src={`https://brjobsedu.com/girls_course/girls_course_backend${subMod.image}`} 
                                        alt={subMod.sub_modu_title} 
                                        thumbnail 
                                        className="img-fluid"
                                        style={{ maxWidth: '200px' }}
                                      />
                                    </div>
                                  )}
                                  
                                  {subMod.sub_mod && subMod.sub_mod.length > 0 && (
                                    <div className="mt-2">
                                      <h8 className="fw-bold text-muted small">Sections:</h8>
                                      <div className="sections-list mt-1">
                                        {subMod.sub_mod.map((section, sectionIndex) => (
                                          <div key={sectionIndex} className="section-item mb-2 p-1 border rounded">
                                            <h8 className="fw-bold small">
                                              Section {sectionIndex + 1}: {section.title || 'Untitled Section'}
                                            </h8>
                                            {section.description && (
                                              <p className="small mt-1">{section.description}</p>
                                            )}
                                            {section.topics && section.topics.length > 0 && (
                                              <div className="mt-1">
                                                <small className="text-muted">Topics:</small>
                                                <ul className="list-inline small mt-1">
                                                  {section.topics.map((topic, topicIndex) => (
                                                    <li key={topicIndex} className="list-inline-item">
                                                      <Badge bg="info">{topic}</Badge>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default AdminDashboard