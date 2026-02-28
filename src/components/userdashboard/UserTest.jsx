import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Modal, Spinner, Accordion } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import { FaBook, FaCheckCircle, FaClock, FaEye, FaArrowLeft } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'

const UserTest = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseModules, setCourseModules] = useState(null)
  const [modulesLoading, setModulesLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const { uniqueId, accessToken } = useAuth()
  
  // Get course and module from location state
  const { course, moduleIndex } = location.state || {}

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

  // Handle test completion
  const handleTestComplete = () => {
    setTestCompleted(true)
    // Here you would typically send test results to backend
    setTimeout(() => {
      // Navigate back to user dashboard with completion status
      navigate('/UserDashboard', { 
        state: { 
          courseId: course.course_id, 
          moduleIndex: moduleIndex, 
          testCompleted: true 
        } 
      })
    }, 2000) // Show completion message for 2 seconds
  }

  // Go back to dashboard without completing
  const handleGoBack = () => {
    navigate('/UserDashboard')
  }

  // Fetch course modules (Test data)
  const fetchCourseModules = async (courseId) => {
    try {
      setModulesLoading(true)
      // Test modules data
      const testModules = {
        "success": true,
        "data": {
          "course_id": courseId,
          "modules": [
            {
              "id": 1,
              "order": 1,
              "mod_title": "Introduction to Testing",
              "sub_modules": [
                {
                  "id": 1,
                  "order": 1,
                  "sub_modu_title": "Test Basics",
                  "sub_modu_description": "Learn the fundamentals of testing",
                  "sub_mod": ["What is testing?", "Why testing is important"]
                }
              ]
            },
            {
              "id": 2,
              "order": 2,
              "mod_title": "Test Methods",
              "sub_modules": [
                {
                  "id": 2,
                  "order": 1,
                  "sub_modu_title": "Unit Testing",
                  "sub_modu_description": "Testing individual components",
                  "sub_mod": ["Jest testing framework", "React testing"]
                },
                {
                  "id": 3,
                  "order": 2,
                  "sub_modu_title": "Integration Testing",
                  "sub_modu_description": "Testing component interactions",
                  "sub_mod": ["React Testing Library", "End-to-end testing"]
                }
              ]
            }
          ]
        }
      }
      
      setCourseModules(testModules.data)
    } catch (error) {
      console.error('Error fetching test course modules:', error)
    } finally {
      setModulesLoading(false)
    }
  }

  // Handle View Course button click
  const handleViewCourse = async (course) => {
    setSelectedCourse(course)
    setShowModal(true)
    await fetchCourseModules(course.course_id)
  }

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedCourse(null)
    setCourseModules(null)
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
                <div className="d-flex align-items-center mb-4">
                  <Button 
                    variant="outline-secondary" 
                    onClick={handleGoBack}
                    className="me-3"
                  >
                    <FaArrowLeft className="me-2" />
                    Back to Course
                  </Button>
                  <h1 className="mb-0">Module Test</h1>
                </div>
                
                {!course || moduleIndex === undefined ? (
                  <div className="text-center py-5">
                    <p className="text-muted fs-4">No test data available</p>
                    <Button variant="primary" onClick={handleGoBack}>
                      Go Back
                    </Button>
                  </div>
                ) : testCompleted ? (
                  <div className="text-center py-5">
                    <div className="success-animation mb-4">
                      <FaCheckCircle style={{ fontSize: '80px', color: '#28a745' }} />
                    </div>
                    <h2 className="mb-2">Test Completed!</h2>
                    <p className="text-muted mb-4">Congratulations! You've successfully completed the test.</p>
                    <p className="text-muted mb-4">Redirecting back to course...</p>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <Card className="shadow-lg border-0">
                      <Card.Body className="p-4">
                        <div className="mb-4">
                          <h3 className="mb-2">{course.course_name}</h3>
                          <p className="text-muted">
                            Module {moduleIndex + 1} Test
                          </p>
                        </div>
                        
                        {/* Test Content */}
                        <div className="mb-6">
                          <h4 className="mb-3">Test Instructions</h4>
                          <p className="text-muted mb-4">
                            Please answer all the questions below. You must score at least 70% to proceed to the next module.
                          </p>
                          
                          <div className="bg-light p-4 rounded mb-4">
                            <h5 className="mb-3">Sample Test Questions:</h5>
                            <div className="mb-3">
                              <p><strong>1. What is the capital of France?</strong></p>
                              <div className="form-check mb-2">
                                <input type="radio" className="form-check-input" id="q1a" name="q1" />
                                <label className="form-check-label" for="q1a">London</label>
                              </div>
                              <div className="form-check mb-2">
                                <input type="radio" className="form-check-input" id="q1b" name="q1" />
                                <label className="form-check-label" for="q1b">Paris</label>
                              </div>
                              <div className="form-check mb-2">
                                <input type="radio" className="form-check-input" id="q1c" name="q1" />
                                <label className="form-check-label" for="q1c">Berlin</label>
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <p><strong>2. What is 2 + 2?</strong></p>
                              <div className="form-check mb-2">
                                <input type="radio" className="form-check-input" id="q2a" name="q2" />
                                <label className="form-check-label" for="q2a">3</label>
                              </div>
                              <div className="form-check mb-2">
                                <input type="radio" className="form-check-input" id="q2b" name="q2" />
                                <label className="form-check-label" for="q2b">4</label>
                              </div>
                              <div className="form-check mb-2">
                                <input type="radio" className="form-check-input" id="q2c" name="q2" />
                                <label className="form-check-label" for="q2c">5</label>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="d-flex justify-content-between">
                          <Button variant="secondary" onClick={handleGoBack}>
                            Cancel
                          </Button>
                          <Button variant="primary" onClick={handleTestComplete}>
                            Submit Test
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Course Modules Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        size="lg"
        className="course-modules-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-2">
            <FaBook className="me-2 text-primary" />
            {selectedCourse?.course_name} - Modules
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modulesLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" style={{ width: '50px', height: '50px' }} />
              <p className="mt-3">Loading modules...</p>
            </div>
          ) : courseModules ? (
            <div>
              <div className="mb-4 p-3 bg-light rounded">
                <p className="mb-0">
                  <strong>Course ID:</strong> {courseModules.course_id}
                </p>
                <p className="mb-0">
                  <strong>Total Modules:</strong> {courseModules.modules.length}
                </p>
              </div>
              
              <Accordion defaultActiveKey="0" className="course-accordion">
                {courseModules.modules.map((module, moduleIndex) => (
                  <Accordion.Item key={module.id} eventKey={moduleIndex.toString()}>
                    <Accordion.Header className="fw-bold">
                      Module {module.order}: {module.mod_title}
                    </Accordion.Header>
                    <Accordion.Body>
                      <Row>
                        <Col md={12}>
                          <h5 className="mb-3 text-muted">Sub Modules</h5>
                          {module.sub_modules.map((subModule, subModuleIndex) => (
                            <div key={subModule.id} className="mb-4 p-3 border rounded">
                              <h6 className="mb-2">
                                Sub Module {subModule.order}: {subModule.sub_modu_title}
                              </h6>
                              <p className="text-muted mb-3">{subModule.sub_modu_description}</p>
                              
                              <h7 className="mb-2 fw-semibold">Content:</h7>
                              <div className="mt-2">
                                {subModule.sub_mod.map((item, itemIndex) => (
                                  <div key={itemIndex} className="mb-2 p-2 bg-light rounded">
                                    {Array.isArray(item) ? (
                                      <div>
                                        <strong>{item[0]}:</strong> {item[1]}
                                      </div>
                                    ) : (
                                      <div>{item}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </Col>
                      </Row>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted fs-4">No modules available for this course</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default UserTest