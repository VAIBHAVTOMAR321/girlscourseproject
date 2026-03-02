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

  // Fetch courses and module progress when component mounts or uniqueId/accessToken changes
  useEffect(() => {
    const fetchData = async () => {
      await fetchCourses()
      await fetchModuleProgress()
    }
    
    fetchData()
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
    await fetchModuleProgress()
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
    
    // Check if previous module is accessible and either:
    // 1. Completed via complete button
    // 2. Test is passed
    const previousModule = courseModules.modules[moduleIndex - 1]
    const previousModuleProgress = moduleProgress.find(
      progress => 
        progress.course_id === selectedCourse.course_id && 
        progress.module === previousModule.module_id
    )
    
    const isPreviousModuleCompleted = completedModules.includes(moduleIndex - 1)
    const isPreviousModuleTestPassed = previousModuleProgress?.test_status === 'passed'
    
    return isPreviousModuleCompleted || isPreviousModuleTestPassed
  }

  // Navigate to module test
  const handleTestClick = (moduleIndex) => {
    console.log('Navigating to test for module index:', moduleIndex)
    const currentModule = courseModules.modules[moduleIndex]
    const isLastModule = moduleIndex === courseModules.modules.length - 1
    navigate('/UserTest', {
      state: {
        course: selectedCourse,
        moduleIndex: moduleIndex,
        moduleId: currentModule.module_id,
        isLastModule: isLastModule
      }
    })
  }

  // Check if all modules are completed for current course
  const areAllModulesCompleted = () => {
    if (!courseModules || !courseModules.modules) return false
    
    return courseModules.modules.every((module, moduleIndex) => {
      const moduleProgressData = moduleProgress.find(
        progress => 
          progress.course_id === selectedCourse.course_id && 
          progress.module === module.module_id
      )
      
      const isModuleCompleted = completedModules.includes(moduleIndex)
      const isTestPassed = moduleProgressData?.test_status === 'passed'
      
      return isModuleCompleted || isTestPassed
    })
  }

  // Check if certificate exists for current course
  const isCertificateGenerated = () => {
    const course = courses.find(c => c.course_id === selectedCourse.course_id)
    return course && course.certificate_file
  }

  // Generate certificate
  const generateCertificate = async () => {
    try {
      const response = await axios.post(
        'https://brjobsedu.com/girls_course/girls_course_backend/api/student-entrollment/',
        {
          student_id: uniqueId,
          course_id: selectedCourse.course_id
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        // Refresh courses data to get the certificate file
        await fetchCourses()
        alert('Certificate generated successfully!')
      } else {
        alert('Failed to generate certificate')
      }
    } catch (error) {
      console.error('Error generating certificate:', error)
      alert('Failed to generate certificate. Please try again.')
    }
  }

  // Check if all modules of a course are completed
  const isAllModulesCompleted = (course) => {
    // Check if we have module progress data for this course
    const courseModuleProgress = moduleProgress.filter(
      progress => progress.course_id === course.course_id
    )
    
    // If no progress data available, course is not completed
    if (courseModuleProgress.length === 0) {
      return false
    }
    
    // Check if all modules for this course are completed or passed the test
    const allModulesCompleted = courseModuleProgress.every(progress => {
      return progress.module_status === 'completed' || progress.test_status === 'passed'
    })
    
    return allModulesCompleted
  }

  // View certificate
  const viewCertificate = () => {
    const course = courses.find(c => c.course_id === selectedCourse.course_id)
    if (course && course.certificate_file) {
      window.open(`https://brjobsedu.com/girls_course/girls_course_backend${course.certificate_file}`, '_blank')
    }
  }

  // Fetch module progress data
  const [moduleProgress, setModuleProgress] = useState([])
  const [progressLoading, setProgressLoading] = useState(false)

  const fetchModuleProgress = async () => {
    try {
      setProgressLoading(true)
      const response = await axios.get(
        `https://brjobsedu.com/girls_course/girls_course_backend/api/module-progress/?student_id=${uniqueId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success && Array.isArray(response.data.data)) {
        console.log('Module progress data:', response.data.data)
        setModuleProgress(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching module progress:', error)
    } finally {
      setProgressLoading(false)
    }
  }

  // Mark module as completed
  const markModuleComplete = async (moduleIndex) => {
    try {
      const currentModule = courseModules.modules[moduleIndex]
      const response = await axios.put(
        `https://brjobsedu.com/girls_course/girls_course_backend/api/module-progress/`,
        {
          module_status: "ongoing",
          student_id: uniqueId,
          course_id: selectedCourse.course_id,
          module: currentModule.module_id
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        // Update module progress state
        await fetchModuleProgress()
        // Also update local completed modules state for UI
        if (!completedModules.includes(moduleIndex)) {
          setCompletedModules([...completedModules, moduleIndex])
        }
        // Show success alert
        alert('Module marked as complete successfully!')
      }
    } catch (error) {
      console.error('Error marking module complete:', error)
      // Show failure alert
      alert('Failed to mark module as complete. Please try again.')
      setError('Failed to mark module as complete')
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
                    
                     <div className="d-flex justify-content-between align-items-center mb-3">
                       <h4 className="mb-0">
                         <FaBook className="me-2 text-primary" />
                         {selectedCourse.course_name} - Modules
                       </h4>
                      
                      {/* Certificate Button */}
                      {isCertificateGenerated() ? (
                        <Button 
                          variant="success" 
                          onClick={viewCertificate}
                          className="d-flex align-items-center"
                        >
                          <FaCertificate className="me-2" />
                          View Certificate
                        </Button>
                      ) : (
                        <Button 
                          variant="primary" 
                          onClick={generateCertificate}
                          disabled={!areAllModulesCompleted()}
                          className="d-flex align-items-center"
                        >
                          <FaCertificate className="me-2" />
                          Generate Certificate
                        </Button>
                      )}
                    </div>
                    
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
                            
                             // Check if module is in ongoing status
                             const currentModule = courseModules.modules[moduleIndex]
                             const isOngoing = moduleProgress.some(
                               progress => 
                                 progress.course_id === selectedCourse.course_id && 
                                 progress.module === currentModule.module_id && 
                                 progress.module_status === 'ongoing'
                             )

                             // Get module progress data for current module
                             const moduleProgressData = moduleProgress.find(
                               progress => 
                                 progress.course_id === selectedCourse.course_id && 
                                 progress.module === currentModule.module_id
                             )

                             // Determine if test button should be disabled
                             let isTestDisabled = false
                             let testButtonText = "Take Test"
                             let testButtonVariant = "primary"
                             let isTestPassed = false

                             if (moduleProgressData) {
                               // Check if test status is passed
                               if (moduleProgressData.test_status === 'passed') {
                                 isTestPassed = true
                               } else {
                                 // Check if attempt count has reached maximum (3 attempts)
                                 if (moduleProgressData.attempt_count >= 3) {
                                   // Check if locked_until has passed
                                   if (moduleProgressData.locked_until) {
                                     const lockedUntil = new Date(moduleProgressData.locked_until)
                                     const currentTime = new Date()
                                     
                                     if (currentTime < lockedUntil) {
                                       // Still locked
                                       isTestDisabled = true
                                       testButtonText = "Test Locked"
                                       testButtonVariant = "secondary"
                                     }
                                   } else {
                                     // No locked_until date, assume permanently locked
                                     isTestDisabled = true
                                     testButtonText = "Test Locked"
                                     testButtonVariant = "secondary"
                                   }
                                 } else {
                                   // Show attempts left
                                   const attemptsLeft = 3 - moduleProgressData.attempt_count
                                   testButtonText = `Take Test (${attemptsLeft} attempts left)`
                                 }
                               }
                             }

                              return (
                                <Accordion.Item 
                                  key={module.module_id} 
                                  eventKey={moduleIndex.toString()}
                                  disabled={!isAccessible}
                                  className={isCompleted || isTestPassed ? 'completed-module' : ''}
                                >
                                  <Accordion.Header className="fw-bold">
                                    <div className="d-flex align-items-center w-100">
                                      {isAccessible ? (
                                        isCompleted ? (
                                          <div className="module-icon me-1">
                                            <FaCertificate className="text-white" style={{ fontSize: '12px' }} />
                                          </div>
                                        ) : (
                                          <div className="module-icon me-1">
                                            <FaChalkboardTeacher className="text-white" style={{ fontSize: '12px' }} />
                                          </div>
                                        )
                                      ) : (
                                        <div className="module-icon me-1 opacity-50">
                                          <FaLock className="text-white" style={{ fontSize: '12px' }} />
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
                                         {isCompleted || isTestPassed ? (
                                           <div className="d-flex align-items-center text-success">
                                             <FaCheckCircle className="me-2" />
                                             <span className="fw-semibold">Module Completed</span>
                                             {isTestPassed && moduleProgressData?.test_score !== null && moduleProgressData?.test_score !== undefined && (
                                               <span className="ms-3 text-success">
                                                 Score: {moduleProgressData.test_score}%
                                               </span>
                                             )}
                                           </div>
                                         ) : (
                                           !isCompleted && (
                                             <div className="d-flex align-items-center text-warning">
                                               <FaClock className="me-2" />
                                               <span className="fw-semibold">Module In Progress</span>
                                             </div>
                                           )
                                         )}
                                       </div>
                                       {isAccessible ? (
                                         <div className="d-flex gap-2">
                                           {isTestPassed ? (
                                             // If test is passed, show nothing (already completed)
                                             null
                                           ) : !isCompleted && !isOngoing ? (
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
                                                 variant={testButtonVariant} 
                                                 onClick={() => handleTestClick(moduleIndex)}
                                                 className="d-flex align-items-center px-4 py-2"
                                                 disabled={!isCompleted && !isOngoing || isTestDisabled}
                                               >
                                                 <FaQuestionCircle className="me-2" />
                                                 {testButtonText}
                                               </Button>
                                             </>
                                           ) : (
                                             <Button 
                                               variant={testButtonVariant} 
                                               onClick={() => handleTestClick(moduleIndex)}
                                               className="d-flex align-items-center px-4 py-2"
                                               disabled={isTestDisabled}
                                             >
                                               <FaCheckCircle className="me-2" />
                                               {testButtonText}
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
                    <h4 className="mb-3">My Courses</h4>
                    
                    {loading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" style={{ width: '60px', height: '60px' }} />
                        <p className="mt-3">Loading courses...</p>
                      </div>
                    ) : courses.length > 0 ? (
                      <Row>
                        {courses.map((course, index) => (
                          <Col md={6} lg={4} key={course.id || index} className="mb-4">
                            <Card className="shadow-sm border-0 h-100 course-card" style={{ borderRadius: '10px' }}>
                              <div className="card-header-gradient" style={{ 
                                height: '80px', 
                                borderTopLeftRadius: '10px', 
                                borderTopRightRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)'
                              }}>
                                {/* Check if all modules are completed instead of relying on course.is_completed */}
                                {isAllModulesCompleted(course) ? (
                                  <FaCertificate className="text-white" style={{ fontSize: '24px', animation: 'pulse 2s infinite' }} />
                                ) : (
                                  <FaGraduationCap className="text-white" style={{ fontSize: '24px', animation: 'float 3s ease-in-out infinite' }} />
                                )}
                                {isAllModulesCompleted(course) && (
                                  <div className="position-absolute top-0 end-0 p-1">
                                    <Badge bg="success" className="p-1 badge-custom fs-7">
                                      <FaCheckCircle className="me-1" /> Completed
                                    </Badge>
                                  </div>
                                )}
                                {!isAllModulesCompleted(course) && (
                                  <div className="position-absolute top-0 start-0 p-1">
                                    <Badge bg="warning" className="p-1 badge-custom fs-7">
                                      <FaClock className="me-1" /> In Progress
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <Card.Body className="p-2">
                                <div className="text-center mb-2">
                                  <h6 className="mb-1 course-title">{course.course_name}</h6>
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
                                  {isAllModulesCompleted(course) && course.completed_at && (
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
                                    variant={isAllModulesCompleted(course) ? "success" : "primary"} 
                                    onClick={() => handleViewCourse(course)}
                                    className="d-flex align-items-center btn-custom"
                                    style={{
                                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                      border: 'none'
                                    }}
                                  >
                                    {isAllModulesCompleted(course) ? (
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