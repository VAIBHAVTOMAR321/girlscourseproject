import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Spinner, Accordion, Alert } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import "../../assets/css/UserDashboard.css"
import { FaBook, FaCheckCircle, FaClock, FaEye, FaLock, FaUnlock, FaQuestionCircle, FaArrowLeft, FaFileAlt, FaImage, FaGraduationCap, FaChalkboardTeacher, FaCertificate, FaStar, FaPlay, FaAward, FaCalendarCheck, FaCrown } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

const UserDashboard = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseModules, setCourseModules] = useState(null)
  const [modulesLoading, setModulesLoading] = useState(false)
  const [completedModules, setCompletedModules] = useState([])
  const [error, setError] = useState(null)

  const location = useLocation()
  const navigate = useNavigate()
  const { uniqueId, accessToken, isAuthenticated } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
    }
  }, [isAuthenticated, navigate, location])

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // Handle test completion from UserTest
  useEffect(() => {
    if (location.state && location.state.testCompleted) {
      const { moduleIndex } = location.state
      console.log('Test completed for module index:', moduleIndex)
      if (!completedModules.includes(moduleIndex)) {
        setCompletedModules([...completedModules, moduleIndex])
      }
      // Clear the state to prevent re-processing on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state, completedModules])

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch user's enrolled courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (!uniqueId || !accessToken) {
        console.log('Missing uniqueId or accessToken:', { uniqueId, accessToken })
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        console.log('Fetching courses for student ID:', uniqueId)
        
        const response = await axios.get(
          `https://brjobsedu.com/girls_course/girls_course_backend/api/student-entrollment/?student_id=${uniqueId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        console.log('API response status:', response.status)
        console.log('API response data:', response.data)
        
        if (response.data.success && Array.isArray(response.data.data)) {
          console.log('Received courses data:', response.data.data)
          response.data.data.forEach(course => {
            console.log('Course object details:', course)
          })
          setCourses(response.data.data)
        } else {
          console.error('API response error:', response.data)
          setError(response.data.message || 'Failed to fetch courses')
          setCourses([])
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
        if (error.response) {
          console.error('Response status:', error.response.status)
          console.error('Response data:', error.response.data)
          setError(error.response.data?.message || 'Failed to fetch courses')
        } else {
          setError('Network error while fetching courses')
        }
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [uniqueId, accessToken])

  // Fetch course modules
  const fetchCourseModules = async (courseId) => {
    try {
      setModulesLoading(true)
      setError(null)
      console.log('Fetching modules for course ID:', courseId)
      
      const response = await axios.get(
        `https://brjobsedu.com/girls_course/girls_course_backend/api/course-module/?course_id=${courseId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )
      
      console.log('Modules API response status:', response.status)
      console.log('Modules API response data:', response.data)
      
      if (response.data.success && response.data.data) {
        console.log('Setting course modules:', response.data.data)
        setCourseModules(response.data.data)
      } else {
        console.error('API response error:', response.data)
        setError(response.data.message || 'Failed to fetch course modules')
        setCourseModules(null)
      }
    } catch (error) {
      console.error('Error fetching course modules:', error)
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
        setError(error.response.data?.message || 'Failed to fetch course modules')
      } else {
        setError('Network error while fetching modules')
      }
      setCourseModules(null)
    } finally {
      setModulesLoading(false)
    }
  }

  // Handle Start Course button click
  const handleViewCourse = async (course) => {
    console.log('Start Course clicked for:', course)
    console.log('Course ID:', course.course_id)
    
    if (!course.course_id) {
      console.error('Course object missing course_id:', course)
      setError('Course ID not available')
      return
    }
    
    setSelectedCourse(course)
    setCourseModules(null)
    setCompletedModules([])
    setError(null)
    await fetchCourseModules(course.course_id)
  }

  // Return to course list
  const handleBackToCourses = () => {
    setSelectedCourse(null)
    setCourseModules(null)
    setCompletedModules([])
    setError(null)
  }

  // Check if module is accessible
  const isModuleAccessible = (moduleIndex) => {
    if (moduleIndex === 0) {
      return true
    }
    return completedModules.includes(moduleIndex - 1)
  }

  // Navigate to module test
  const handleTestClick = (moduleIndex) => {
    console.log('Navigating to test for module index:', moduleIndex)
    navigate('/UserTest', {
      state: {
        course: selectedCourse,
        moduleIndex: moduleIndex
      }
    })
  }

  // Mark module as completed
  const markModuleComplete = (moduleIndex) => {
    if (!completedModules.includes(moduleIndex)) {
      setCompletedModules([...completedModules, moduleIndex])
    }
  }

  const handleMenuToggle = () => {
    setShowOffcanvas(!showOffcanvas)
  }

  return (
    <div className="d-flex flex-column">
      <UserTopNav onMenuToggle={handleMenuToggle} isMobile={isMobile} />
      <div className="d-flex flex-1">
        <UseLeftNav 
          showOffcanvas={showOffcanvas} 
          setShowOffcanvas={setShowOffcanvas} 
        />
    
        <Container fluid>
          <Row>
            <Col xs={12}>
              <div className="mt-4">
                {error && (
                  <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}
                
                {selectedCourse ? (
                  <div>
                    <Button 
                      variant="outline-primary" 
                      onClick={handleBackToCourses}
                      className="mb-4 d-flex align-items-center"
                    >
                      <FaArrowLeft className="me-2" />
                      Back to My Courses
                    </Button>
                    
                    <h1 className="mb-4">
                      <FaBook className="me-2 text-primary" />
                      {selectedCourse.course_name} - Modules
                    </h1>
                    
                    {modulesLoading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" style={{ width: '50px', height: '50px' }} />
                        <p className="mt-3">Loading modules...</p>
                      </div>
                    ) : courseModules && courseModules.modules ? (
                      <div>
                        {console.log('Course Modules Data:', courseModules)}
                       
                        <Accordion defaultActiveKey="0" className="course-accordion">
                          {courseModules.modules.map((module, moduleIndex) => {
                            const isAccessible = isModuleAccessible(moduleIndex)
                            const isCompleted = completedModules.includes(moduleIndex)
                            
                            return (
                              <Accordion.Item 
                                key={module.module_id} 
                                eventKey={moduleIndex.toString()}
                                disabled={!isAccessible}
                              >
                                <Accordion.Header className="fw-bold">
                                  <div className="d-flex align-items-center w-100">
                                    {isAccessible ? (
                                      isCompleted ? (
                                        <div className="module-icon me-3">
                                          <FaCertificate className="text-white" style={{ fontSize: '20px' }} />
                                        </div>
                                      ) : (
                                        <div className="module-icon me-3">
                                          <FaChalkboardTeacher className="text-white" style={{ fontSize: '20px' }} />
                                        </div>
                                      )
                                    ) : (
                                      <div className="module-icon me-3 opacity-50">
                                        <FaLock className="text-white" style={{ fontSize: '20px' }} />
                                      </div>
                                    )}
                                    <span className={!isAccessible ? 'text-gray-300' : 'text-white'}>
                                      Module {module.order}: {module.mod_title}
                                    </span>
                                    {!isAccessible && (
                                      <span className="ms-auto text-sm text-gray-300">
                                        Complete previous module to unlock
                                      </span>
                                    )}
                                  </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                  {module.sub_modules && module.sub_modules.length > 0 ? (
                                    <div className="sub-modules-container">
                                       {module.sub_modules.map((subModule, subModuleIndex) => (
                                        <div key={subModule.sub_module_id} className="book-card mb-4">
                                          <div className="book-header d-flex align-items-center mb-3">
                                            <div className="book-icon me-3">
                                              {subModuleIndex % 3 === 0 ? (
                                                <FaBook className="text-primary" style={{ fontSize: '24px' }} />
                                              ) : subModuleIndex % 3 === 1 ? (
                                                <FaChalkboardTeacher className="text-primary" style={{ fontSize: '24px' }} />
                                              ) : (
                                                <FaGraduationCap className="text-primary" style={{ fontSize: '24px' }} />
                                              )}
                                            </div>
                                            <div className="book-title flex-grow-1">
                                              <h5 className="mb-1 fw-bold text-primary">
                                             {subModule.order}: {subModule.sub_modu_title}
                                              </h5>
                                              {subModule.sub_modu_description && (
                                                <p className="mb-0 text-muted small">
                                                  {subModule.sub_modu_description}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          
                                          <Row className="g-4">
                                            {/* Alternating layout: Content and Image swap sides for each sub-module */}
                                            {subModuleIndex % 2 === 0 ? (
                                              <>
                                                {/* Left Side: Content */}
                                                <Col lg={7} md={12}>
                                                  <div className="content-wrapper">
                                                    {subModule.sub_mod && subModule.sub_mod.length > 0 ? (
                                                      <div className="content-section">
                                                      
                                                        <div className="content-items">
                                                          {subModule.sub_mod.map((item, itemIndex) => (
                                                            <div key={itemIndex} className="content-item p-3 mb-3 bg-white rounded-3 shadow-sm border-l-4 border-primary">
                                                              {Array.isArray(item) && item.length === 2 ? (
                                                                <div className="content-pair">
                                                                  {item[0].toLowerCase() === 'title' ? (
                                                                    <div className="content-title fw-bold text-dark mb-2">
                                                                      {item[1]}
                                                                    </div>
                                                                  ) : item[0].toLowerCase() === 'description' ? (
                                                                    <div className="content-description text-muted">
                                                                      {item[1]}
                                                                    </div>
                                                                  ) : (
                                                                    <div className="content-field">
                                                                      <span className="field-label fw-semibold text-primary me-2">
                                                                        {item[0]}:
                                                                      </span>
                                                                      <span className="field-value text-dark">
                                                                        {item[1]}
                                                                      </span>
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              ) : typeof item === 'object' && item !== null ? (
                                                                <div className="content-object">
                                                                  {Object.entries(item).map(([key, value]) => (
                                                                    <div key={key} className="content-entry mb-2">
                                                                      {key.toLowerCase() === 'title' ? (
                                                                        <h6 className="content-title fw-bold text-dark mb-2">
                                                                          {value}
                                                                        </h6>
                                                                      ) : key.toLowerCase() === 'description' ? (
                                                                        <p className="content-description text-muted mb-0">
                                                                          {value}
                                                                        </p>
                                                                      ) : (
                                                                        <div className="content-field">
                                                                          <span className="field-label fw-semibold text-primary me-2">
                                                                            {key}:
                                                                          </span>
                                                                          <span className="field-value text-dark">
                                                                            {value}
                                                                          </span>
                                                                        </div>
                                                                      )}
                                                                    </div>
                                                                  ))}
                                                                </div>
                                                              ) : (
                                                                <div className="content-text text-dark">
                                                                  {item}
                                                                </div>
                                                              )}
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <div className="no-content p-5 bg-gray-50 rounded-3 text-center">
                                                        <FaFileAlt className="text-muted mb-3" style={{ fontSize: '48px' }} />
                                                        <p className="text-muted mb-0">
                                                          📚 No content available for this sub-module.
                                                        </p>
                                                      </div>
                                                    )}
                                                  </div>
                                                </Col>
                                                
                                                {/* Right Side: Image */}
                                                <Col lg={5} md={12}>
                                                  <div className="image-wrapper">
                                                    {subModule.image ? (
                                                      <div className="book-image-container rounded-3 overflow-hidden shadow-lg">
                                                        <img 
                                                          src={`https://brjobsedu.com/girls_course/girls_course_backend/${subModule.image}`} 
                                                          alt={subModule.sub_modu_title} 
                                                          className="book-image w-100 h-100"
                                                          style={{ objectFit: 'cover' }}
                                                          onError={(e) => {
                                                            console.error('Image loading error:', e.target.src);
                                                            e.target.onerror = null;
                                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f8f9fa" width="400" height="300"/%3E%3Ctext fill="%236c757d" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Not Available%3C/text%3E%3C/svg%3E';
                                                          }}
                                                        />
                                                        <div className="image-overlay">
                                                          <div className="overlay-content">
                                                            <FaImage className="text-white mb-2" style={{ fontSize: '32px' }} />
                                                            <p className="text-white mb-0 small">
                                                              Sub Module {subModule.order}
                                                            </p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <div className="no-image-container rounded-3 bg-gray-50 d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                                                        <div className="text-center">
                                                          <FaImage className="text-muted mb-3" style={{ fontSize: '48px' }} />
                                                          <p className="text-muted mb-0">
                                                            No Image Available
                                                          </p>
                                                          <small className="text-muted">
                                                            Sub Module {subModule.order}
                                                          </small>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                </Col>
                                              </>
                                            ) : (
                                              <>
                                                {/* Right Side: Image (for odd indices) */}
                                                <Col lg={5} md={12}>
                                                  <div className="image-wrapper">
                                                    {subModule.image ? (
                                                      <div className="book-image-container rounded-3 overflow-hidden shadow-lg">
                                                        <img 
                                                          src={`https://brjobsedu.com/girls_course/girls_course_backend/${subModule.image}`} 
                                                          alt={subModule.sub_modu_title} 
                                                          className="book-image w-100 h-100"
                                                          style={{ objectFit: 'cover' }}
                                                          onError={(e) => {
                                                            console.error('Image loading error:', e.target.src);
                                                            e.target.onerror = null;
                                                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f8f9fa" width="400" height="300"/%3E%3Ctext fill="%236c757d" font-family="Arial" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage Not Available%3C/text%3E%3C/svg%3E';
                                                          }}
                                                        />
                                                        <div className="image-overlay">
                                                          <div className="overlay-content">
                                                            <FaImage className="text-white mb-2" style={{ fontSize: '32px' }} />
                                                            <p className="text-white mb-0 small">
                                                              Sub Module {subModule.order}
                                                            </p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <div className="no-image-container rounded-3 bg-gray-50 d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                                                        <div className="text-center">
                                                          <FaImage className="text-muted mb-3" style={{ fontSize: '48px' }} />
                                                          <p className="text-muted mb-0">
                                                            No Image Available
                                                          </p>
                                                          <small className="text-muted">
                                                            Sub Module {subModule.order}
                                                          </small>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>
                                                </Col>
                                                
                                                {/* Left Side: Content (for odd indices) */}
                                                <Col lg={7} md={12}>
                                                  <div className="content-wrapper">
                                                    {subModule.sub_mod && subModule.sub_mod.length > 0 ? (
                                                      <div className="content-section">
                                                        <div className="section-header d-flex align-items-center mb-3">
                                                          <FaFileAlt className="me-2 text-primary" />
                                                          <h6 className="mb-0 fw-semibold">📖 Course Content</h6>
                                                        </div>
                                                        <div className="content-items">
                                                          {subModule.sub_mod.map((item, itemIndex) => (
                                                            <div key={itemIndex} className="content-item p-3 mb-3 bg-white rounded-3 shadow-sm border-l-4 border-primary">
                                                              {Array.isArray(item) && item.length === 2 ? (
                                                                <div className="content-pair">
                                                                  {item[0].toLowerCase() === 'title' ? (
                                                                    <div className="content-title fw-bold text-dark mb-2">
                                                                      {item[1]}
                                                                    </div>
                                                                  ) : item[0].toLowerCase() === 'description' ? (
                                                                    <div className="content-description text-muted">
                                                                      {item[1]}
                                                                    </div>
                                                                  ) : (
                                                                    <div className="content-field">
                                                                      <span className="field-label fw-semibold text-primary me-2">
                                                                        {item[0]}:
                                                                      </span>
                                                                      <span className="field-value text-dark">
                                                                        {item[1]}
                                                                      </span>
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              ) : typeof item === 'object' && item !== null ? (
                                                                <div className="content-object">
                                                                  {Object.entries(item).map(([key, value]) => (
                                                                    <div key={key} className="content-entry mb-2">
                                                                      {key.toLowerCase() === 'title' ? (
                                                                        <h6 className="content-title fw-bold text-dark mb-2">
                                                                          {value}
                                                                        </h6>
                                                                      ) : key.toLowerCase() === 'description' ? (
                                                                        <p className="content-description text-muted mb-0">
                                                                          {value}
                                                                        </p>
                                                                      ) : (
                                                                        <div className="content-field">
                                                                          <span className="field-label fw-semibold text-primary me-2">
                                                                            {key}:
                                                                          </span>
                                                                          <span className="field-value text-dark">
                                                                            {value}
                                                                          </span>
                                                                        </div>
                                                                      )}
                                                                    </div>
                                                                  ))}
                                                                </div>
                                                              ) : (
                                                                <div className="content-text text-dark">
                                                                  {item}
                                                                </div>
                                                              )}
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    ) : (
                                                      <div className="no-content p-5 bg-gray-50 rounded-3 text-center">
                                                        <FaFileAlt className="text-muted mb-3" style={{ fontSize: '48px' }} />
                                                        <p className="text-muted mb-0">
                                                          📚 No content available for this sub-module.
                                                        </p>
                                                      </div>
                                                    )}
                                                  </div>
                                                </Col>
                                              </>
                                            )}
                                          </Row>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-5">
                                      <FaFileAlt className="text-muted mb-3" style={{ fontSize: '48px' }} />
                                      <p className="text-muted">No sub-modules available for this module.</p>
                                    </div>
                                  )}
                                  
                                   <div className="mt-4 d-flex justify-content-between align-items-center">
                                     <div>
                                       {isCompleted && (
                                         <div className="d-flex align-items-center text-success">
                                           <FaCheckCircle className="me-2" />
                                           <span className="fw-semibold">Module Completed</span>
                                         </div>
                                       )}
                                     </div>
                                     {isAccessible ? (
                                       <div className="d-flex gap-2">
                                         {!isCompleted ? (
                                           <>
                                             <Button 
                                               variant="success" 
                                               onClick={() => markModuleComplete(moduleIndex)}
                                               className="d-flex align-items-center px-4 py-2"
                                             >
                                               <FaCheckCircle className="me-2" />
                                               Complete Module
                                             </Button>
                                             <Button 
                                               variant="primary" 
                                               onClick={() => handleTestClick(moduleIndex)}
                                               className="d-flex align-items-center px-4 py-2"
                                               disabled={!isCompleted}
                                             >
                                               <FaQuestionCircle className="me-2" />
                                               Take Test
                                             </Button>
                                           </>
                                         ) : (
                                           <Button 
                                             variant="success" 
                                             onClick={() => handleTestClick(moduleIndex)}
                                             className="d-flex align-items-center px-4 py-2"
                                           >
                                             <FaCheckCircle className="me-2" />
                                             Retake Test
                                           </Button>
                                         )}
                                       </div>
                                     ) : (
                                       <Button 
                                         variant="secondary" 
                                         disabled
                                         className="d-flex align-items-center px-4 py-2"
                                       >
                                         <FaLock className="me-2" />
                                         Locked
                                       </Button>
                                     )}
                                   </div>
                                </Accordion.Body>
                              </Accordion.Item>
                            )
                          })}
                        </Accordion>
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <FaBook className="text-muted mb-3" style={{ fontSize: '48px' }} />
                        <p className="text-muted fs-4">No modules available for this course</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h1 className="mb-4">My Courses</h1>
                    
                    {loading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" style={{ width: '60px', height: '60px' }} />
                        <p className="mt-3">Loading courses...</p>
                      </div>
                    ) : courses.length > 0 ? (
                      <Row>
                        {courses.map((course, index) => (
                          <Col md={6} lg={4} key={course.id || index} className="mb-4">
                            <Card className="shadow-lg border-0 h-100 course-card" style={{ borderRadius: '20px' }}>
                              <div className="card-header-gradient" style={{ 
                                height: '180px', 
                                borderTopLeftRadius: '20px', 
                                borderTopRightRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)'
                              }}>
                                {course.is_completed ? (
                                  <FaCertificate className="text-white" style={{ fontSize: '56px', animation: 'pulse 2s infinite' }} />
                                ) : (
                                  <FaGraduationCap className="text-white" style={{ fontSize: '56px', animation: 'float 3s ease-in-out infinite' }} />
                                )}
                                {course.is_completed && (
                                  <div className="position-absolute top-0 end-0 p-2">
                                    <Badge bg="success" className="p-3 badge-custom">
                                      <FaCheckCircle className="me-1" /> Completed
                                    </Badge>
                                  </div>
                                )}
                                {!course.is_completed && (
                                  <div className="position-absolute top-0 start-0 p-2">
                                    <Badge bg="warning" className="p-2 badge-custom">
                                      <FaClock className="me-1" /> In Progress
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <Card.Body className="p-4">
                                <div className="text-center mb-4">
                                  <h3 className="mb-2 course-title">{course.course_name}</h3>
                                </div>
                                
                                <div className="course-stats mb-4">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small">
                                      <FaCalendarCheck className="me-1" /> Enrolled
                                    </span>
                                    <span className="fw-semibold">
                                      {course.enrolled_at ? new Date(course.enrolled_at).toLocaleDateString() : 'N/A'}
                                    </span>
                                  </div>
                                  {course.is_completed && course.completed_at && (
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <span className="text-muted small">
                                        <FaAward className="me-1" /> Completed
                                      </span>
                                      <span className="fw-semibold text-success">
                                        {new Date(course.completed_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center">
                                    <div className="bg-gradient-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', fontWeight: 'bold' }}>
                                      {course.student_name ? course.student_name.charAt(0) : 'S'}
                                    </div>
                                    <div className="ms-3">
                                      <p className="mb-0 fw-semibold">{course.student_name || 'Student'}</p>
                                      <small className="text-muted">Learner</small>
                                    </div>
                                  </div>
                                  <Button 
                                    variant={course.is_completed ? "success" : "primary"} 
                                    onClick={() => handleViewCourse(course)}
                                    className="d-flex align-items-center btn-custom"
                                    style={{
                                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                      border: 'none'
                                    }}
                                  >
                                    {course.is_completed ? (
                                      <>
                                        <FaEye className="me-2" />
                                        Start Course
                                      </>
                                    ) : (
                                      <>
                                        <FaPlay className="me-2" />
                                        Start
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <div className="text-center py-5">
                        <FaBook className="text-muted mb-3" style={{ fontSize: '48px' }} />
                        <p className="text-muted fs-4">No courses enrolled yet</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default UserDashboard