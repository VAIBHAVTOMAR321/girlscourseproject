import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Modal, Spinner, Accordion } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import { FaBook, FaCheckCircle, FaClock, FaEye, FaArrowLeft, FaTimesCircle, FaCertificate } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

const UserTest = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [testCompleted, setTestCompleted] = useState(false)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timer, setTimer] = useState(30)
  const [userAnswers, setUserAnswers] = useState([])
  const [testLoading, setTestLoading] = useState(true)
  const [testResult, setTestResult] = useState(null)
  const [showCelebrationModal, setShowCelebrationModal] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(0)

  const location = useLocation()
  const navigate = useNavigate()
  const { uniqueId, accessToken, userRoleType } = useAuth()
  
  // Get course and module from location state
  const { course, moduleIndex, isLastModule, attemptCount } = location.state || {}

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

  // Fetch test questions
  useEffect(() => {
    const fetchTestQuestions = async () => {
      try {
        setTestLoading(true)
        // Get module ID from location state or from course data
        let moduleId = null
        if (location.state && location.state.moduleId) {
          moduleId = location.state.moduleId
        } else if (course && course.modules && course.modules[moduleIndex]) {
          moduleId = course.modules[moduleIndex].module_id
        }

        if (!moduleId) {
          setLoading(false)
          setTestLoading(false)
          return
        }

        const response = await axios.post(
          'https://brjobsedu.com/girls_course/girls_course_backend/api/module-test/start/',
          {
            module_id: moduleId
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.data.success) {
          setQuestions(response.data.questions)
          setUserAnswers(new Array(response.data.questions.length).fill(null))
          // Set overall timer: 30 seconds per question
          setTimer(response.data.questions.length * 30)
          // Store attempt count if available in response
          if (response.data.attempt_count !== undefined) {
            setTestResult(prev => ({ ...prev, attempt_count: response.data.attempt_count }))
          }
          // Store attempts left if available in response
          if (response.data.attempts_left !== undefined) {
            setAttemptsLeft(response.data.attempts_left)
          } else if (response.data.attempt_count !== undefined) {
            // Calculate attempts left (assuming max 3 attempts)
            setAttemptsLeft(3 - response.data.attempt_count)
          }
        }
      } catch (error) {
        // Handle error silently
      } finally {
        setTestLoading(false)
        setLoading(false)
      }
    }

    if (course && moduleIndex !== undefined) {
      fetchTestQuestions()
    }
  }, [course, moduleIndex])

  // Overall test timer
  useEffect(() => {
    if (timer > 0 && !testCompleted) {
      const timerInterval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timerInterval)
    } else if (timer === 0 && !testCompleted) {
      // Auto submit when overall timer ends
      handleTestComplete()
    }
  }, [timer, testCompleted])

  // State to track navigation attempts
  const [navigationAttempts, setNavigationAttempts] = useState(0)

  // Block navigation when user tries to leave the test page
  useEffect(() => {
    // Store current location
    const currentPath = window.location.pathname
    
    // Block all link clicks on the page
    const handleLinkClick = (e) => {
      if (testCompleted) return
      
      // Check if it's a link to another page
      const href = e.target.closest('a')?.href
      if (href && !href.includes(currentPath)) {
        e.preventDefault()
        if (navigationAttempts === 0) {
          alert('Are you sure you want to leave? Your test will be submitted automatically if you leave again.')
          setNavigationAttempts(1)
        } else {
          handleTestComplete()
        }
      }
    }
    
    document.addEventListener('click', handleLinkClick, true)
    
    return () => {
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [testCompleted, navigationAttempts])

  // Prevent navigation away from test page
  useEffect(() => {
    // Check if we're on the test page and test is not completed
    if (testCompleted) return

    const handlePopState = (e) => {
      if (!testCompleted) {
        if (navigationAttempts === 0) {
          // First attempt - show warning
          alert('Are you sure you want to leave? Your test will be submitted automatically if you leave again.')
          setNavigationAttempts(1)
          // Prevent going back
          window.history.pushState(null, '', window.location.href)
        } else {
          // Second attempt - auto submit
          handleTestComplete()
        }
      }
    }

    // Push initial state to prevent immediate back
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [testCompleted, navigationAttempts])

  // Auto submit when user closes the window or navigates away
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!testCompleted) {
        if (navigationAttempts === 0) {
          // Show warning on first attempt
          e.preventDefault()
          e.returnValue = ''
          setNavigationAttempts(1)
          alert('Are you sure you want to leave? Your test will be submitted automatically if you leave again.')
          return ''
        } else {
          // Auto submit on subsequent attempts
          handleTestComplete()
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [testCompleted, navigationAttempts])

  // Auto submit when user switches to another tab/window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !testCompleted) {
        if (navigationAttempts === 0) {
          // Show warning on first attempt (works for both tab switch and window close)
          alert('Are you sure you want to leave? Your test will be submitted automatically if you leave again.')
          setNavigationAttempts(1)
        } else {
          // Auto submit on subsequent attempts
          handleTestComplete()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [testCompleted, navigationAttempts])

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setUserAnswers(newAnswers)
  }

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  // Handle previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  // Handle test completion (submission)
  const handleTestComplete = async () => {
    try {
      // Prepare submission data
      const submissionData = {
        module_id: location.state.moduleId,
        answers: questions.map((question, index) => ({
          question_id: question.id,
          selected: userAnswers[index]
        }))
      }

      // Submit test
      const endpoint = userRoleType === 'student-unpaid' 
        ? 'https://brjobsedu.com/girls_course/girls_course_backend/api/submit-test-unpaid/'
        : 'https://brjobsedu.com/girls_course/girls_course_backend/api/module-test/submit/'
        
      const response = await axios.post(
        endpoint,
        submissionData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        // Show results
        setTestCompleted(true)
        setTestResult(response.data)
        
        // Store attempts left from API response
        if (response.data.attempts_left !== undefined) {
          setAttemptsLeft(response.data.attempts_left)
        } else if (response.data.attempt_count !== undefined) {
          // Calculate attempts left (assuming max 3 attempts)
          setAttemptsLeft(3 - response.data.attempt_count)
        }
        
        // Show celebration modal if test passed and it's the last module
        if (response.data.test_status === 'passed' && isLastModule) {
          setShowCelebrationModal(true)
        }
      }
    } catch (error) {
      alert('Failed to submit test. Please try again.')
    }
  }

  // Generate certificate
  const generateCertificate = async () => {
    try {
      const endpoint = userRoleType === 'student-unpaid' 
        ? 'https://brjobsedu.com/girls_course/girls_course_backend/api/enrollment-unpaid/'
        : 'https://brjobsedu.com/girls_course/girls_course_backend/api/student-entrollment/'
        
      const response = await axios.post(
        endpoint,
        {
          student_id: uniqueId,
          course_id: course.course_id
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        // Get the certificate file URL from response or fetch courses to get updated data
        alert('Certificate generated successfully!')
        
        // Check if we got certificate file in response
        if (response.data.data && response.data.data.certificate_file) {
          // Open certificate in new tab
          window.open(`https://brjobsedu.com/girls_course/girls_course_backend${response.data.data.certificate_file}`, '_blank')
        } else {
          // If not, try to fetch updated course data
          const coursesEndpoint = userRoleType === 'student-unpaid' 
            ? `https://brjobsedu.com/girls_course/girls_course_backend/api/enrollment-unpaid/?student_id=${uniqueId}`
            : `https://brjobsedu.com/girls_course/girls_course_backend/api/student-entrollment/?student_id=${uniqueId}`
            
          const coursesResponse = await axios.get(
            coursesEndpoint,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          )
          
          if (coursesResponse.data.success) {
            const updatedCourse = coursesResponse.data.data.find(
              c => c.course_id === course.course_id
            )
            
            if (updatedCourse && updatedCourse.certificate_file) {
              window.open(`https://brjobsedu.com/girls_course/girls_course_backend${updatedCourse.certificate_file}`, '_blank')
            }
          }
        }
      } else {
        alert('Failed to generate certificate')
      }
    } catch (error) {
      alert('Failed to generate certificate. Please try again.')
    }
  }

  // Go back to dashboard - with warning logic
  const handleGoBack = () => {
    if (testCompleted) {
      navigate('/UserDashboard')
      return
    }
    
    if (navigationAttempts === 0) {
      // First attempt - show warning and keep user on test
      alert('Are you sure you want to leave? Your test will be submitted automatically if you leave again.')
      setNavigationAttempts(1)
    } else {
      // Second attempt - auto submit
      handleTestComplete()
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
        
        <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '280px', padding: isMobile ? '10px' : '20px', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid className='fixed-profile'>
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
                
                {testLoading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" style={{ width: '60px', height: '60px' }} />
                    <p className="mt-3">Loading test questions...</p>
                  </div>
                ) : !course || moduleIndex === undefined ? (
                  <div className="text-center py-5">
                    <p className="text-muted fs-4">No test data available</p>
                    <Button variant="primary" onClick={handleGoBack}>
                      Go Back
                    </Button>
                  </div>
                ) : testCompleted && testResult ? (
                  <div className="text-center py-5">
                    <div className={`success-animation mb-4 ${testResult.test_status === 'passed' ? 'text-success' : 'text-danger'}`}>
                      {testResult.test_status === 'passed' ? (
                        <FaCheckCircle style={{ fontSize: '80px', color: '#28a745' }} />
                      ) : (
                        <FaTimesCircle style={{ fontSize: '80px', color: '#dc3545' }} />
                      )}
                    </div>
                    <h2 className="mb-2">
                      {testResult.test_status === 'passed' ? 'Test Passed!' : 'Test Failed!'}
                    </h2>
                    <p className="text-muted mb-4">
                      You scored {testResult.percentage}%
                    </p>
                    <div className="d-flex justify-content-center gap-4 mb-4">
                      <div className="bg-light p-3 rounded">
                        <p className="mb-0 text-muted small">Attempts Left</p>
                        <p className="mb-0 fw-bold">{testResult?.attempts_left !== undefined ? testResult.attempts_left : (attemptsLeft > 0 ? attemptsLeft : '0')}</p>
                      </div>
                      {testResult.locked_until && (
                        <div className="bg-light p-3 rounded">
                          <p className="mb-0 text-muted small">Locked Until</p>
                          <p className="mb-0 fw-bold">{new Date(testResult.locked_until).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="primary" 
                      onClick={handleGoBack}
                      className="d-flex align-items-center mx-auto"
                    >
                      <FaArrowLeft className="me-2" />
                      Back to Course
                    </Button>
                  </div>
                ) : questions.length > 0 ? (
                  <div className="max-w-4xl mx-auto">
                    <Card className="shadow-sm border-0" style={{ borderRadius: '10px' }}>
                      <Card.Body className="p-2">
                        <div className="mb-2">
                          <h6 className="mb-1">{course.course_name}</h6>
                          <p className="text-muted small">
                            Module {moduleIndex + 1} Test - Question {currentQuestionIndex + 1} of {questions.length}
                          </p>
                          <div className="d-flex align-items-center justify-content-between">
                            <Badge bg="warning" className="p-1 small">
                              <FaClock className="me-1" />
                              Time: {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Current Question */}
                        <div className="mb-3">
                          <h6 className="mb-1">{questions[currentQuestionIndex].question_text}</h6>
                          <div className="space-y-3">
                            {questions[currentQuestionIndex].options.map((option, index) => (
                              <div key={index} className="form-check">
                                <input 
                                  type="radio" 
                                  className="form-check-input" 
                                  id={`q${currentQuestionIndex}a${index}`} 
                                  name={`q${currentQuestionIndex}`}
                                  checked={userAnswers[currentQuestionIndex] === index}
                                  onChange={() => handleAnswerSelect(index)}
                                />
                                <label className="form-check-label" for={`q${currentQuestionIndex}a${index}`}>
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-2">
                            <Button 
                              variant="secondary" 
                              onClick={handlePreviousQuestion}
                              disabled={currentQuestionIndex === 0}
                              className="me-2"
                            >
                              Previous
                            </Button>
                            {currentQuestionIndex < questions.length - 1 ? (
                              <Button 
                                variant="primary" 
                                onClick={handleNextQuestion}
                              >
                                Next
                              </Button>
                            ) : (
                              <Button 
                                variant="success" 
                                onClick={handleTestComplete}
                              >
                                Submit Test
                              </Button>
                            )}
                          </div>
                          {testResult && (
                            <div className="text-muted small">
                              <span>Attempts Left: {attemptsLeft > 0 ? attemptsLeft : '0'}</span>
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted fs-4">No questions available for this test</p>
                    <Button variant="primary" onClick={handleGoBack}>
                      Go Back
                    </Button>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {/* Celebration Modal */}
          <Modal
            show={showCelebrationModal}
            onHide={() => setShowCelebrationModal(false)}
            centered
            size="lg"
          >
            <Modal.Body className="text-center p-5">
              <div className="celebration-content">
                {/* Celebration Animation */}
                <div className="celebration-animation mb-4">
                  <FaCheckCircle style={{ fontSize: '100px', color: '#28a745', animation: 'pulse 2s infinite' }} />
                </div>
                
                {/* Congratulations Text */}
                <h2 className="mb-4 text-success">Congratulations!</h2>
                <p className="text-muted mb-4 fs-5">
                  You have successfully completed all modules and passed the final test!
                </p>
                
                {/* Course Completion Badge */}
                <div className="mb-4">
                  <Badge bg="success" className="p-2 fs-6">
                    Course Completed
                  </Badge>
                </div>
                
                {/* Generate Certificate Button */}
                <Button 
                  variant="success" 
                  onClick={generateCertificate}
                  className="d-flex align-items-center mx-auto px-3 py-2 fs-6 mt-2"
                  style={{ borderRadius: '50px' }}
                >
                  <FaCertificate className="me-2" />
                  Generate Certificate
                </Button>
                
                {/* Optional: Close Button */}
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowCelebrationModal(false)}
                  className="mt-3"
                >
                  Close
                </Button>
              </div>
            </Modal.Body>
          </Modal>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default UserTest