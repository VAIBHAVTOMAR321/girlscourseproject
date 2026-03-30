import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Spinner, Accordion, Alert } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import "../../assets/css/UserDashboard.css"
import { renderContentWithLineBreaks } from '../../utils/contentRenderer'
import { FaBook, FaCheckCircle, FaClock, FaEye, FaLock, FaUnlock, FaQuestionCircle, FaArrowLeft, FaFileAlt, FaImage, FaGraduationCap, FaChalkboardTeacher, FaCertificate, FaStar, FaPlay, FaAward, FaCalendarCheck, FaCrown } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

const UserDashboard = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState('my-courses') // 'my-courses' or 'all-courses'
  const [courses, setCourses] = useState([])
  const [allCourses, setAllCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [allCoursesLoading, setAllCoursesLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseModules, setCourseModules] = useState(null)
  const [modulesLoading, setModulesLoading] = useState(false)
  const [completedModules, setCompletedModules] = useState([])
  const [activeAccordionKey, setActiveAccordionKey] = useState('0')
  const [error, setError] = useState(null)
  const [refundRequests, setRefundRequests] = useState([])

  // Exercise management state
  const [currentExerciseModule, setCurrentExerciseModule] = useState(null)
  const [showExerciseView, setShowExerciseView] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  const [correctMatches, setCorrectMatches] = useState([])
  const [exerciseFeedback, setExerciseFeedback] = useState({ type: '', message: '' })
  const [shuffledTargets, setShuffledTargets] = useState({})

  // Course feedback state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackCourse, setFeedbackCourse] = useState(null)
  const [feedbackData, setFeedbackData] = useState({
    question_1: '',
    question_2: '',
    question_3: '',
    question_4: '',
    question_5: '',
    comment: ''
  })
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackError, setFeedbackError] = useState(null)

  const location = useLocation()
  const navigate = useNavigate()
  const { uniqueId, accessToken, isAuthenticated, userRoleType } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
    }
  }, [isAuthenticated, navigate, location])

  // Handle test completion from UserTest
  useEffect(() => {
    if (location.state && location.state.testCompleted) {
      const { moduleIndex } = location.state
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
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Use appropriate endpoint based on user role
      const endpoint = userRoleType === 'student-unpaid' 
        ? `https://brjobsedu.com/girls_course/girls_course_backend/api/enrollment-unpaid/?student_id=${uniqueId}`
        : `https://brjobsedu.com/girls_course/girls_course_backend/api/student-entrollment/?student_id=${uniqueId}`
      
      const response = await axios.get(
        endpoint,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.data.success && Array.isArray(response.data.data)) {
        // Also fetch all courses to get start_date and end_date
        let coursesWithDates = response.data.data
        
        try {
          const allCoursesResponse = await axios.get(
            'https://brjobsedu.com/girls_course/girls_course_backend/api/course-items/'
          )
          
          if (allCoursesResponse.data.success && Array.isArray(allCoursesResponse.data.data)) {
            // Merge start_date and end_date from allCourses to enrolled courses
            coursesWithDates = response.data.data.map(enrolledCourse => {
              const courseDetails = allCoursesResponse.data.data.find(
                c => c.course_id === enrolledCourse.course_id
              )
              return {
                ...enrolledCourse,
                start_date: courseDetails?.start_date || null,
                end_date: courseDetails?.end_date || null
              }
            })
          }
        } catch (courseError) {
          // Use original data if course-items fetch fails
          console.warn('Could not fetch course details for dates')
        }
        
        setCourses(coursesWithDates)
      } else {
        setError(response.data.message || 'Failed to fetch courses')
        setCourses([])
      }
    } catch (error) {
      setError('Network error while fetching courses')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch refund requests for the user
  const fetchRefundRequests = async () => {
    try {
      const response = await axios.get(
        `https://brjobsedu.com/girls_course/girls_course_backend/api/student-unpaid/?student_id=${uniqueId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setRefundRequests(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching refund requests:', error)
      setRefundRequests([])
    }
  }

  // Fetch all available courses
  const fetchAllCourses = async () => {
    try {
      setAllCoursesLoading(true)
      const response = await axios.get(
        'https://brjobsedu.com/girls_course/girls_course_backend/api/course-items/'
      )
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setAllCourses(response.data.data)
      } else {
        setAllCourses([])
      }
    } catch (error) {
      console.error('Error fetching all courses:', error)
      setAllCourses([])
    } finally {
      setAllCoursesLoading(false)
    }
  }

  // Fetch courses, module progress, refund requests, and all courses when component mounts or uniqueId/accessToken changes
  useEffect(() => {
    const fetchData = async () => {
      await fetchCourses()
      await fetchModuleProgress()
      await fetchRefundRequests()
      await fetchAllCourses()
    }
    
    fetchData()
  }, [uniqueId, accessToken])

  // Fetch user data for navigation state
  const [userData, setUserData] = useState(null)
  const fetchUserData = async () => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
      
      let response
      
      // Fetch data based on user role
      if (userRoleType === 'student-unpaid') {
        response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/student-unpaid/?student_id=${uniqueId}`, config)
      } else {
        response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/?student_id=${uniqueId}`)
      }
      
      const { data } = response
      
      if (data.success) {
        setUserData(data.data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  // Fetch user data on mount
  useEffect(() => {
    if (uniqueId) {
      fetchUserData()
    }
  }, [uniqueId, userRoleType])

  // Fetch course modules
  const fetchCourseModules = async (courseId) => {
    try {
      setModulesLoading(true)
      setError(null)
      
      const response = await axios.get(
        `https://brjobsedu.com/girls_course/girls_course_backend/api/course-module/?course_id=${courseId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )
      
      if (response.data.success && response.data.data) {
        setCourseModules(response.data.data)
      } else {
        setError(response.data.message || 'Failed to fetch course modules')
        setCourseModules(null)
      }
    } catch (error) {
      setError('Network error while fetching modules')
      setCourseModules(null)
    } finally {
      setModulesLoading(false)
    }
  }

   // Handle Start Course button click
  const handleViewCourse = async (course) => {
    if (!course.course_id) {
      setError('Course ID not available')
      return
    }
    
    setSelectedCourse(course)
    setCourseModules(null)
    setCompletedModules([])
    setError(null)
    setActiveAccordionKey('0') // Reset to first module, will be updated by useEffect
    await fetchCourseModules(course.course_id)
    await fetchModuleProgress()
  }

  // Return to course list
  const handleBackToCourses = () => {
    setSelectedCourse(null)
    setCourseModules(null)
    setCompletedModules([])
    setError(null)
    setActiveAccordionKey('0') // Reset accordion to first module
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
    const currentModule = courseModules.modules[moduleIndex]
    const isLastModule = moduleIndex === courseModules.modules.length - 1
    
    // Get module progress data to pass attempt count
    const moduleProgressData = moduleProgress.find(
      progress => 
        progress.course_id === selectedCourse.course_id && 
        progress.module_id === currentModule.module_id
    )
    
    const attemptCount = moduleProgressData?.attempt_count || 0
    
    navigate('/UserTest', {
      state: {
        course: selectedCourse,
        moduleIndex: moduleIndex,
        moduleId: currentModule.module_id,
        isLastModule: isLastModule,
        attemptCount: attemptCount
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
      const endpoint = userRoleType === 'student-unpaid' 
        ? 'https://brjobsedu.com/girls_course/girls_course_backend/api/enrollment-unpaid/'
        : 'https://brjobsedu.com/girls_course/girls_course_backend/api/student-entrollment/'
        
      const response = await axios.post(
        endpoint,
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
      
      // Use appropriate endpoint based on user role
      const endpoint = userRoleType === 'student-unpaid' 
        ? `https://brjobsedu.com/girls_course/girls_course_backend/api/module-progress-unpaid/?student_id=${uniqueId}`
        : `https://brjobsedu.com/girls_course/girls_course_backend/api/module-progress/?student_id=${uniqueId}`
      
      const response = await axios.get(
        endpoint,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success && Array.isArray(response.data.data)) {
        setModuleProgress(response.data.data)
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setProgressLoading(false)
    }
  }

  // Calculate time remaining until course end date
  const calculateTimeRemaining = (startDate, endDate) => {
    if (!startDate || !endDate) return null
    
    const now = new Date()
    const end = new Date(endDate)
    const start = new Date(startDate)
    
    // If course has already ended
    if (now > end) {
      return { status: 'expired', text: 'Course Expired' }
    }
    
    // If course hasn't started yet
    if (now < start) {
      return { status: 'upcoming', text: 'Starts on ' + start.toLocaleDateString() }
    }
    
    // Calculate time remaining
    const diffTime = end - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const months = Math.floor(diffDays / 30)
    const weeks = Math.floor((diffDays % 30) / 7)
    const days = diffDays % 7
    
    let timeText = ''
    if (months > 0) {
      timeText += `${months} month${months > 1 ? 's' : ''} `
    }
    if (weeks > 0) {
      timeText += `${weeks} week${weeks > 1 ? 's' : ''} `
    }
    if (days > 0 || (months === 0 && weeks === 0)) {
      timeText += `${days} day${days !== 1 ? 's' : ''}`
    }
    
    return { 
      status: 'active', 
      text: timeText.trim(),
      days: diffDays,
      months,
      weeks,
      daysLeft: days
    }
  }

  // Check if course is expired
  const isCourseExpired = (course) => {
    if (!course.start_date || !course.end_date) return false
    const time = calculateTimeRemaining(course.start_date, course.end_date)
    return time?.status === 'expired'
  }

  // Open feedback modal
  const handleOpenFeedbackModal = (course) => {
    setFeedbackCourse(course)
    setFeedbackData({
      question_1: '',
      question_2: '',
      question_3: '',
      question_4: '',
      question_5: '',
      comment: ''
    })
    setFeedbackError(null)
    setShowFeedbackModal(true)
  }

  // Close feedback modal
  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false)
    setFeedbackCourse(null)
    setFeedbackData({
      question_1: '',
      question_2: '',
      question_3: '',
      question_4: '',
      question_5: '',
      comment: ''
    })
    setFeedbackError(null)
  }

  // Handle feedback form input change
  const handleFeedbackChange = (field, value) => {
    setFeedbackData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Submit feedback
  const handleSubmitFeedback = async () => {
    if (!feedbackCourse) return
    
    // Validate all fields are filled
    if (!feedbackData.question_1 || !feedbackData.question_2 || !feedbackData.question_3 || 
        !feedbackData.question_4 || !feedbackData.question_5) {
      setFeedbackError('Please answer all questions')
      return
    }
    
    try {
      setFeedbackSubmitting(true)
      setFeedbackError(null)
      
      const response = await axios.post(
        'https://brjobsedu.com/girls_course/girls_course_backend/api/course-feedback/',
        {
          course_id: feedbackCourse.course_id,
          student_id: uniqueId,
          full_name: userData?.full_name || 'Student',
          course_name: feedbackCourse.course_name,
          question_1: feedbackData.question_1,
          question_2: feedbackData.question_2,
          question_3: feedbackData.question_3,
          question_4: feedbackData.question_4,
          question_5: feedbackData.question_5,
          comment: feedbackData.comment
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.data.success) {
        alert('Thank you for your feedback!')
        handleCloseFeedbackModal()
      } else {
        setFeedbackError(response.data.message || 'Failed to submit feedback')
      }
    } catch (error) {
      setFeedbackError('Failed to submit feedback. Please try again.')
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  // Compute the first incomplete module index based on user progress
  const computeFirstIncompleteModule = () => {
    if (!courseModules || !courseModules.modules || courseModules.modules.length === 0) {
      return '0'
    }
    
    for (let i = 0; i < courseModules.modules.length; i++) {
      const module = courseModules.modules[i]
      
      // Check if module is completed via local state
      const isLocalCompleted = completedModules.includes(i)
      
      // Check if module test is passed from API progress
      const moduleProgressData = moduleProgress.find(
        progress => 
          progress.course_id === selectedCourse?.course_id && 
          progress.module === module.module_id
      )
      const isTestPassed = moduleProgressData?.test_status === 'passed'
      
      // If neither completed nor test passed, this is the first incomplete module
      if (!isLocalCompleted && !isTestPassed) {
        return i.toString()
      }
    }
    
    // All modules are completed, return the last module index
    return (courseModules.modules.length - 1).toString()
  }

  // Update active accordion key when module progress changes
  useEffect(() => {
    if (courseModules && selectedCourse && !modulesLoading) {
      const firstIncomplete = computeFirstIncompleteModule()
      setActiveAccordionKey(firstIncomplete)
    }
  }, [courseModules, completedModules, moduleProgress, selectedCourse, modulesLoading])

  // Start exercise for module
  const handleStartExercise = (module) => {
    setCurrentExerciseModule(module)
    setShowExerciseView(true)
    setCorrectMatches([])
    setExerciseFeedback({ type: '', message: '' })
  }

  // Handle drag and drop for exercise (mouse)
  const handleDragStart = (e, item) => {
    setDraggedItem(item)
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Touch event handlers for mobile support
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 })
  const [touchDraggedItem, setTouchDraggedItem] = useState(null)

  const handleTouchStart = (e, item) => {
    setTouchDraggedItem(item)
    const touch = e.touches[0]
    setTouchPosition({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e) => {
    if (!touchDraggedItem) return
    e.preventDefault() // Prevent scrolling while dragging
    const touch = e.touches[0]
    setTouchPosition({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e) => {
    if (!touchDraggedItem) return
    
    const touch = e.changedTouches[0]
    const target = document.elementFromPoint(touch.clientX, touch.clientY)
    
    // Find the closest target item
    const targetItem = target?.closest('.target-item')
    
    if (targetItem) {
      const targetName = targetItem.getAttribute('data-target')
      if (targetName) {
        handleDrop(e, targetName)
      }
    }
    
    setTouchDraggedItem(null)
    setTouchPosition({ x: 0, y: 0 })
  }

  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleDrop = (e, targetName) => {
    e.preventDefault()
    
    // Use either mouse-dragged item or touch-dragged item
    const itemToCheck = draggedItem || touchDraggedItem
    
    if (itemToCheck && itemToCheck.img_name === targetName) {
      // Correct match - keep in right side
      setCorrectMatches(prev => [...prev, itemToCheck])
      setExerciseFeedback({
        type: 'success',
        message: `✓ Correct! "${itemToCheck.img_name}" matches.`
      })
    } else {
      // Incorrect match - return to left side with feedback
      setExerciseFeedback({
        type: 'error',
        message: `✗ Incorrect! "${itemToCheck?.img_name}" does not match "${targetName}"`
      })
    }

    // Clear dragged item
    setDraggedItem(null)
    setTouchDraggedItem(null)
    
    // Auto-clear feedback after 3 seconds
    setTimeout(() => {
      setExerciseFeedback({ type: '', message: '' })
    }, 3000)
  }

  // Mark module as completed
  const markModuleComplete = async (moduleIndex) => {
    try {
      const currentModule = courseModules.modules[moduleIndex]
      
      const endpoint = userRoleType === 'student-unpaid' 
        ? `https://brjobsedu.com/girls_course/girls_course_backend/api/module-progress-unpaid/`
        : `https://brjobsedu.com/girls_course/girls_course_backend/api/module-progress/`
        
      const response = await axios.put(
        endpoint,
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
      // Show failure alert
      alert('Failed to mark module as complete. Please try again.')
      setError('Failed to mark module as complete')
    }
  }

  // Handle enrollment in free course
  const handleEnrollCourse = async (courseId) => {
    try {
      
      const response = await axios.post(
        'https://brjobsedu.com/girls_course/girls_course_backend/api/enroll-unpaid/',
        {
          student_id: uniqueId,
          course_id: courseId
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )


      // Check if enrollment was successful (API returns message on success)
      if (response.data && response.data.message) {
        // Show success message
        alert(response.data.message)
        
        // Refresh both enrolled courses and all courses
        console.log('Fetching updated course data...')
        try {
          await fetchCourses()
          console.log('Courses fetched successfully')
        } catch (e) {
          console.error('Error fetching courses:', e)
        }
        
        try {
          await fetchAllCourses()
          console.log('All courses fetched successfully')
        } catch (e) {
          console.error('Error fetching all courses:', e)
        }
        
        // Switch to My Courses tab after data is refreshed
        setTimeout(() => {
          console.log('Switching to My Courses tab')
          setActiveTab('my-courses')
        }, 800)
        
      } else {
        alert('Failed to enroll in course. Please try again.')
      }
    } catch (error) {
      console.error('Error enrolling in course:', error)
      alert('Failed to enroll in course. Please try again.')
    }
  }

  const handleMenuToggle = () => {
    setShowOffcanvas(!showOffcanvas)
  }

  // Handle responsive margin for mobile
  useEffect(() => {
    const contentArea = document.querySelector('.flex-grow-1')
    if (contentArea) {
      if (isMobile) {
        contentArea.style.marginLeft = '0px'
      } else {
        contentArea.style.marginLeft = '220px'
      }
    }
  }, [isMobile])

  return (
    <div className="d-flex flex-column">
      <UserTopNav onMenuToggle={handleMenuToggle} isMobile={isMobile} />
      <div className="d-flex flex-1">
        <UseLeftNav 
          showOffcanvas={showOffcanvas} 
          setShowOffcanvas={setShowOffcanvas} 
        />
    
        <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '220px', padding: isMobile ? '10px' : '20px', minHeight: 'calc(100vh - 70px)' }}>
          <Container className='container-top-fixed'>
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
                      className="mb-4 d-flex align-items-center back-btn"
                    >
                      <FaArrowLeft className="me-2" />
                      Back to My Courses
                    </Button>
                    
                     <div className="d-flex justify-content-between align-items-center title-h mb-3">
                        <h4 className="mb-0">
                          <FaBook className="me-2 text-primary" />
                          {renderContentWithLineBreaks(selectedCourse.course_name)} - Modules
                        </h4>
                       
                       {/* Certificate Button */}
                       {isCertificateGenerated() ? (
                         <Button 
                           variant="success" 
                           onClick={viewCertificate}
                           className="d-flex align-items-center view-certificate-btn "
                         >
                           <FaCertificate className="me-2" />
                           View Certificate
                         </Button>
                       ) : (
                         <Button 
                           variant="primary" 
                           onClick={generateCertificate}
                           disabled={!areAllModulesCompleted()}
                           className="d-flex align-items-center button-view"
                         >
                           <FaCertificate className="me-2" />
                           Generate Certificate
                         </Button>
                       )}
                     </div>

                     {/* Course Completed Message */}
                     {areAllModulesCompleted() && (
                       <Alert variant="success" className="mb-4">
                         <FaCheckCircle className="me-2" />
                         <strong>Congratulations!</strong> You have completed all modules in this course.
                         {isCertificateGenerated() ? (
                           <span className="ms-2">Your certificate is ready to view.</span>
                         ) : (
                           <span className="ms-2">Click the "Generate Certificate" button to get your certificate.</span>
                         )}
                       </Alert>
                     )}
                    
                    {modulesLoading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" style={{ width: '50px', height: '50px' }} />
                        <p className="mt-3">Loading modules...</p>
                      </div>
                    ) : courseModules && courseModules.modules ? (
                      <div>
                        <Accordion activeKey={activeAccordionKey} onSelect={(key) => setActiveAccordionKey(key)} className="course-accordion">
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
                                       Module {module.order}: {renderContentWithLineBreaks(module.mod_title)}
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
                                              {subModule.order}: {renderContentWithLineBreaks(subModule.sub_modu_title)}
                                               </h5>
                                               {subModule.sub_modu_description && (
                                                 <p className="mb-0 text-muted small">
                                                   {renderContentWithLineBreaks(subModule.sub_modu_description)}
                                                 </p>
                                               )}
                                             </div>
                                           </div>
                                           
                                           <Row className="g-4">
                                             {/* Determine layout based on image presence and alternating pattern */}
                                             {(() => {
                                               const hasImage = subModule.image;
                                               let contentCol, imageCol, contentFirst;

                                               if (hasImage) {
                                                 // Alternating layout when image exists
                                                 contentCol = subModuleIndex % 2 === 0 ? 7 : 5;
                                                 imageCol = subModuleIndex % 2 === 0 ? 5 : 7;
                                                 contentFirst = subModuleIndex % 2 === 0;
                                               } else {
                                                 // Full width content when no image
                                                 contentCol = 12;
                                                 imageCol = 0;
                                                 contentFirst = true;
                                               }

                                               // Render content section
                                               const contentElement = (
                                                 <Col lg={contentCol} md={12}>
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
                                                                       {renderContentWithLineBreaks(item[1])}
                                                                     </div>
                                                                   ) : item[0].toLowerCase() === 'description' ? (
                                                                     <div className="content-description text-muted">
                                                                       {renderContentWithLineBreaks(item[1])}
                                                                     </div>
                                                                   ) : (
                                                                     <div className="content-field">
                                                                       <span className="field-label fw-semibold text-primary me-2">
                                                                         {item[0]}:
                                                                       </span>
                                                                       <span className="field-value text-dark">
                                                                         {renderContentWithLineBreaks(item[1])}
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
                                                                           {renderContentWithLineBreaks(value)}
                                                                         </h6>
                                                                       ) : key.toLowerCase() === 'description' ? (
                                                                         <p className="content-description text-muted mb-0">
                                                                           {renderContentWithLineBreaks(value)}
                                                                         </p>
                                                                       ) : (
                                                                         <div className="content-field">
                                                                           <span className="field-label fw-semibold text-primary me-2">
                                                                             {key}:
                                                                           </span>
                                                                           <span className="field-value text-dark">
                                                                             {renderContentWithLineBreaks(value)}
                                                                           </span>
                                                                         </div>
                                                                       )}
                                                                     </div>
                                                                   ))}
                                                                 </div>
                                                               ) : (
                                                                 <div className="content-text text-dark">
                                                                   {renderContentWithLineBreaks(item)}
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
                                               );

                                               // Render image section
                                               const imageElement = hasImage ? (
                                                 <Col lg={imageCol} md={12}>
                                                   <div className="image-wrapper">
                                                     <div className="book-image-container rounded-3 overflow-hidden shadow-lg">
                                                       <img
                                                         src={`https://brjobsedu.com/girls_course/girls_course_backend/${subModule.image}`}
                                                         alt={subModule.sub_modu_title}
                                                         className="book-image w-100 h-100"
                                                         style={{ objectFit: 'contain', objectPosition: 'center' }}
                                                         onError={(e) => {
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
                                                   </div>
                                                 </Col>
                                               ) : null;

                                               // Order based on alternating pattern or content-first when no image
                                               return contentFirst ? (
                                                 <>
                                                   {contentElement}
                                                   {imageElement}
                                                 </>
                                               ) : (
                                                 <>
                                                   {imageElement}
                                                   {contentElement}
                                                 </>
                                               );
                                             })()}
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
                                  
                                  {/* Exercise Section - Show directly below submodules */}
                                  {module.exercises && module.exercises.length > 0 && (
                                    <div className="mt-4 exercise-section">
                                      <div className="bg-light p-3 rounded-3 border border-primary">
                                        <h6 className="fw-bold text-primary mb-3">
                                          <FaImage className="me-2" /> Module Exercise: Match the Images to Their Names
                                        </h6>
                                        
                                        {/* Feedback Message */}
                                        {exerciseFeedback.message && (
                                          <div className={`feedback ${exerciseFeedback.type} mb-3 p-2 rounded`}>
                                            {exerciseFeedback.message}
                                          </div>
                                        )}

                                        <div className="game-container">
                                          {/* Left Side: Images to Drag */}
                                          <div className="game-column images-column">
                                            <h6 className="mb-2 text-muted">Images</h6>
                                            {module.exercises.filter(exercise => 
                                              !correctMatches.some(correct => correct.img_name === exercise.img_name)
                                            ).length === 0 ? (
                                              <div className="no-items text-center py-4">
                                                <i className="bi bi-check-circle-fill text-success mb-2"></i>
                                                <p className="mb-0 text-success">All exercises completed!</p>
                                                <Button 
                                                  variant="outline-success" 
                                                  size="sm"
                                                  onClick={() => {
                                                    setCorrectMatches([])
                                                    setExerciseFeedback({ type: '', message: '' })
                                                  }}
                                                >
                                                  Reset Exercise
                                                </Button>
                                              </div>
                                            ) : (
                                              <div className="items-grid images-grid">
                                                {module.exercises.filter(exercise => 
                                                  !correctMatches.some(correct => correct.img_name === exercise.img_name)
                                                ).map((exercise, index) => (
                                                  <div
                                                    key={index}
                                                    className="draggable-item image-item p-2 bg-white rounded border"
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, exercise)}
                                                    onDragEnd={handleDragEnd}
                                                    onTouchStart={(e) => handleTouchStart(e, exercise)}
                                                    onTouchMove={handleTouchMove}
                                                    onTouchEnd={handleTouchEnd}
                                                  >
                                                    <img
                                                      src={`https://brjobsedu.com/girls_course/girls_course_backend${exercise.img}`}
                                                      alt={exercise.img_name}
                                                      onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextElementSibling.style.display = 'block';
                                                      }}
                                                    />
                                                    <div className="no-image" style={{ display: 'none' }}>
                                                      No Image
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>

                                          {/* Right Side: Target Names */}
                                          <div className="game-column targets-column">
                                            <h6 className="mb-2 text-muted">Names</h6>
                                            <div className="items-grid targets-grid">
                                              {module.exercises.map((exercise, index) => {
                                                const isMatched = correctMatches.some(correct => correct.img_name === exercise.img_name);
                                                
                                                return (
                                                  <div
                                                    key={index}
                                                    className={`target-item p-3 bg-white rounded border ${isMatched ? 'matched' : ''}`}
                                                    data-target={exercise.img_name}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDrop(e, exercise.img_name)}
                                                    onTouchEnd={handleTouchEnd}
                                                  >
                                                    {isMatched ? (
                                                      <div className="matched-content">
                                                        <i className="bi bi-check-circle text-success me-2"></i>
                                                        <span className="text-success">{exercise.img_name}</span>
                                                      </div>
                                                    ) : (
                                                      <span>{exercise.img_name}</span>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
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
                                          <div className="d-flex gap-1">
                                            {isTestPassed ? (
                                              // If test is passed, show nothing (already completed)
                                              null
                                            ) : !isCompleted && !isOngoing ? (
                                              <>
                                                <Button 
                                                  variant="success" 
                                                  onClick={() => markModuleComplete(moduleIndex)}
                                                  className="d-flex align-items-center px-3 py-1"
                                                  size="sm"
                                                >
                                                  <FaCheckCircle className="me-2" />
                                                  Complete
                                                </Button>
                                                <Button 
                                                  variant={testButtonVariant} 
                                                  onClick={() => handleTestClick(moduleIndex)}
                                                  className="d-flex align-items-center px-3 py-1"
                                                  disabled={!isCompleted && !isOngoing || isTestDisabled}
                                                  size="sm"
                                                >
                                                  <FaQuestionCircle className="me-2" />
                                                  {testButtonText}
                                                </Button>
                                              </>
                                            ) : (
                                              <Button 
                                                variant={testButtonVariant} 
                                                onClick={() => handleTestClick(moduleIndex)}
                                                className="d-flex align-items-center px-3 py-1"
                                                disabled={isTestDisabled}
                                                size="sm"
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
                                            className="d-flex align-items-center px-3 py-1"
                                            size="sm"
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
                    {/* Tab Navigation */}
                    <div className="d-flex gap-2 mb-4" style={{ borderBottom: '2px solid #e0e0e0', paddingBottom: '10px' }}>
                      <Button 
                        variant={activeTab === 'my-courses' ? 'primary' : 'outline-primary'}
                        onClick={() => setActiveTab('my-courses')}
                        className="fw-semibold"
                      >
                        <FaBook className="me-2" />
                        My Courses ({courses.length})
                      </Button>
                      {userRoleType === 'student-unpaid' && (
                        <Button 
                          variant={activeTab === 'all-courses' ? 'primary' : 'outline-primary'}
                          onClick={() => setActiveTab('all-courses')}
                          className="fw-semibold"
                        >
                          <FaGraduationCap className="me-2" />
                          All Courses ({allCourses.filter(c => c.course_status === 'unpaid').length})
                        </Button>
                      )}
                    </div>

                    {/* My Courses Tab */}
                    {activeTab === 'my-courses' && (
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
                                <Card className="shadow-sm border-0 h-100 " style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                  <div className="card-header-gradient" style={{ 
                                    height: '100%', 
                                    width:'100%',
                                    padding: '0',
                                    border: 'none',
                                    padding:'8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    background: isAllModulesCompleted(course) 
                                      ? 'linear-gradient(135deg, #10b981, #059669)' // Green gradient for completed
                                      : 'linear-gradient(135deg, #667eea, #667eea)' // Purple gradient for in-progress
                                  }}>
                                    {/* Check if all modules are completed instead of relying on course.is_completed */}
                                    {isAllModulesCompleted(course) ? (
                                      <FaCertificate className="text-white" style={{ fontSize: '28px', animation: 'pulse 2s infinite' }} />
                                    ) : (
                                      <FaGraduationCap className="text-white" style={{ fontSize: '28px', animation: 'float 3s ease-in-out infinite' }} />
                                    )}
                                    {isAllModulesCompleted(course) && (
                                      <div className=" top-2 end-2">
                                        <Badge bg="success" className="p-2 badge-custom fs-7">
                                          <FaCheckCircle className="me-1" /> Completed
                                        </Badge>
                                      </div>
                                    )}
                                    {!isAllModulesCompleted(course) && (
                                      <div className="position-absolute top-2 start-2">
                                        <Badge bg="warning" className="p-2 badge-custom in-prohrace fs-7">
                                          <FaClock className="me-1" /> In Progress
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                  <Card.Body className="p-4">
                                    <div className="text-center mb-2">
                                      <h6 className="mb-1 course-title">{renderContentWithLineBreaks(course.course_name)}</h6>
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
                                      {/* Time Remaining - calculated from start_date to end_date */}
                                      {course.start_date && course.end_date && (
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                          <span className="text-muted small">
                                            <FaClock className="me-1" /> Time Remaining
                                          </span>
                                          <span className={`fw-semibold ${(() => {
                                            const time = calculateTimeRemaining(course.start_date, course.end_date);
                                            return time?.status === 'expired' ? 'text-danger' : time?.status === 'upcoming' ? 'text-info' : 'text-success';
                                          })()}`}>
                                            {calculateTimeRemaining(course.start_date, course.end_date)?.text || 'N/A'}
                                          </span>
                                        </div>
                                      )}
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
                                        <div className="bg-gradient-primary text-white rounded-circle d-flex align-items-center justify-content-center" >
                                          {course.student_name ? course.student_name.charAt(0) : 'S'}
                                        </div>
                                        <div className="">
                                          <p className="mb-0 fw-semibold">{course.student_name || 'Student'}</p>
                                          <small className="text-muted">Learner</small>
                                        </div>
                                      </div>
                                      <div className="d-flex gap-2">
                                        {isCourseExpired(course) ? (
                                          <Button 
                                            variant="success" 
                                            onClick={() => {
                                              if (course.certificate_file) {
                                                window.open(`https://brjobsedu.com/girls_course/girls_course_backend${course.certificate_file}`, '_blank')
                                              } else {
                                                alert('Certificate not available yet')
                                              }
                                            }}
                                            className="d-flex align-items-center btn-custom"
                                            style={{
                                              background: 'linear-gradient(135deg, #10b981, #059669)',
                                              border: 'none'
                                            }}
                                          >
                                            <FaCertificate className="me-2" />
                                            View Certificate
                                          </Button>
                                        ) : (
                                          <Button 
                                            variant={isAllModulesCompleted(course) ? "success" : "primary"} 
                                            onClick={() => handleViewCourse(course)}
                                            className="d-flex align-items-center btn-custom"
                                            style={{
                                              background: 'linear-gradient(135deg, #667eea, #667eea)',
                                              border: 'none'
                                            }}
                                          >
                                            {isAllModulesCompleted(course) ? (
                                              <>
                                                <FaCheckCircle className="me-2" />
                                                Completed
                                              </>
                                            ) : (
                                              <>
                                                <FaPlay className="me-2" />
                                                Start
                                              </>
                                            )}
                                          </Button>
                                        )}
                                        {/* Refund Request Button - Only for paid users with pending status and no existing pending refund */}
                                        {userRoleType !== 'student-unpaid' && !isAllModulesCompleted(course) && !refundRequests.some(req => req.status === 'pending') && (
                                          <Button 
                                            variant="outline-danger" 
                                            onClick={() => {
                                              // Navigate to refund request with course details to auto-fill
                                              navigate('/RefundRequest', {
                                                state: {
                                                  course: course,
                                                  userData: {
                                                    ...userData,
                                                    status: userData?.status || 'pending',
                                                    amount: course.course_fee || userData?.course_fee || userData?.amount || '' // Use course fee if available
                                                  }
                                                }
                                              })
                                            }}
                                            className="d-flex align-items-center"
                                          >
                                            <i className="bi bi-currency-exchange me-2"></i>
                                            Refund
                                          </Button>
                                        )}
                                        {/* Show pending status if refund request is pending */}
                                        {refundRequests.some(req => req.status === 'pending') && (
                                          <Badge bg="warning" className="d-flex align-items-center p-2">
                                            <i className="bi bi-clock me-2"></i>
                                            Refund Pending
                                          </Badge>
                                        )}
                                        {/* Feedback Button - Only show when course is completed */}
                                        {isAllModulesCompleted(course) && (
                                          <Button 
                                            variant="outline-primary" 
                                            onClick={() => handleOpenFeedbackModal(course)}
                                            className="d-flex align-items-center"
                                          >
                                            <FaStar className="me-2" />
                                            Feedback
                                          </Button>
                                        )}
                                      </div>
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

                    {/* All Courses Tab - Only visible to unpaid users */}
                    {activeTab === 'all-courses' && userRoleType === 'student-unpaid' && (
                      <div>
                        <h4 className="mb-3">All Courses</h4>
                        
                        {allCoursesLoading ? (
                          <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" style={{ width: '60px', height: '60px' }} />
                            <p className="mt-3">Loading all courses...</p>
                          </div>
                        ) : allCourses.filter(c => c.course_status === 'unpaid').length > 0 ? (
                          <Row>
                            {allCourses.filter(c => c.course_status === 'unpaid').map((course, index) => {
                              const isEnrolled = courses.some(ec => ec.course_id === course.course_id)
                              return (
                                <Col md={6} lg={4} key={course.id || index} className="mb-4">
                                  <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                    <div className="card-header-gradient" style={{ 
                                      height: '150px', 
                                      width:'100%',
                                      padding: '0',
                                      border: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      position: 'relative',
                                      background: isEnrolled 
                                        ? 'linear-gradient(135deg, #10b981, #059669)' // Green for enrolled
                                        : 'linear-gradient(135deg, #667eea, #667eea)' // Purple for available
                                    }}>
                                      {isEnrolled ? (
                                        <div className="text-center">
                                          <FaCertificate className="text-white" style={{ fontSize: '40px', marginBottom: '8px' }} />
                                          <p className="text-white fw-bold mb-0">Already Enrolled</p>
                                        </div>
                                      ) : (
                                        <FaBook className="text-white" style={{ fontSize: '48px' }} />
                                      )}
                                    </div>
                                    <Card.Body className="p-4">
                                      <div className="mb-3">
                                        <h6 className="mb-2 course-title">{renderContentWithLineBreaks(course.course_name)}</h6>
                                      </div>
                                      
                                      {/* Time Remaining - calculated from start_date to end_date */}
                                      {course.start_date && course.end_date && (
                                        <div className="mb-2 p-2 bg-light rounded d-flex justify-content-between align-items-center">
                                          <span className="text-muted small">
                                            <FaClock className="me-1" /> Duration
                                          </span>
                                          <span className={`fw-semibold ${(() => {
                                            const time = calculateTimeRemaining(course.start_date, course.end_date);
                                            return time?.status === 'expired' ? 'text-danger' : time?.status === 'upcoming' ? 'text-info' : 'text-success';
                                          })()}`}>
                                            {calculateTimeRemaining(course.start_date, course.end_date)?.text || 'N/A'}
                                          </span>
                                        </div>
                                      )}
                                      
                                      {course.course_description && (
                                        <p className="text-muted small mb-3">{course.course_description.substring(0, 100)}...</p>
                                      )}
                                      
                                      <div className="d-flex gap-2 mt-3">
                                        {isEnrolled ? (
                                          isCourseExpired(course) ? (
                                            <Button 
                                              variant="success" 
                                              onClick={() => {
                                                const enrolledCourse = courses.find(ec => ec.course_id === course.course_id)
                                                if (enrolledCourse && enrolledCourse.certificate_file) {
                                                  window.open(`https://brjobsedu.com/girls_course/girls_course_backend${enrolledCourse.certificate_file}`, '_blank')
                                                } else {
                                                  alert('Certificate not available yet')
                                                }
                                              }}
                                              className="w-100 d-flex align-items-center justify-content-center"
                                              style={{
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                border: 'none'
                                              }}
                                            >
                                              <FaCertificate className="me-2" />
                                              View Certificate
                                            </Button>
                                          ) : (
                                            <Button 
                                              variant="success" 
                                              onClick={() => handleViewCourse(courses.find(ec => ec.course_id === course.course_id))}
                                              className="w-100 d-flex align-items-center justify-content-center"
                                            >
                                              <FaPlay className="me-2" />
                                              Continue Learning
                                            </Button>
                                          )
                                        ) : (
                                          <Button 
                                            variant="primary" 
                                            onClick={() => handleEnrollCourse(course.course_id)}
                                            className="w-100 d-flex align-items-center justify-content-center"
                                          >
                                            <FaCheckCircle className="me-2" />
                                            Enroll Now
                                          </Button>
                                        )}
                                      </div>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              )
                            })}
                          </Row>
                        ) : (
                          <div className="text-center py-5">
                            <FaGraduationCap className="text-muted mb-3" style={{ fontSize: '48px' }} />
                            <p className="text-muted fs-4">No free courses available</p>
                          </div>
                        )}
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
    {showExerciseView && renderExerciseView()}
    
    {/* Course Feedback Modal */}
    {showFeedbackModal && feedbackCourse && (
      <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea, #667eea)', border: 'none' }}>
              <h5 className="modal-title text-white">
                <FaStar className="me-2" />
                Course Feedback
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={handleCloseFeedbackModal}
                disabled={feedbackSubmitting}
              ></button>
            </div>
            <div className="modal-body p-4">
              {feedbackError && (
                <Alert variant="danger" className="mb-3">
                  {feedbackError}
                </Alert>
              )}
              
              <div className="mb-4">
                <h6 className="fw-bold text-primary mb-3">Course: {feedbackCourse.course_name}</h6>
                <p className="text-muted small">Please rate your experience with this course.</p>
              </div>
              
              {/* Question 1 */}
              <div className="mb-3">
                <label className="form-label fw-semibold">1. How would you rate the overall course content?</label>
                <select 
                  className="form-select"
                  value={feedbackData.question_1}
                  onChange={(e) => handleFeedbackChange('question_1', e.target.value)}
                  disabled={feedbackSubmitting}
                >
                  <option value="">Select rating</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              
              {/* Question 2 */}
              <div className="mb-3">
                <label className="form-label fw-semibold">2. How would you rate the course materials and resources?</label>
                <select 
                  className="form-select"
                  value={feedbackData.question_2}
                  onChange={(e) => handleFeedbackChange('question_2', e.target.value)}
                  disabled={feedbackSubmitting}
                >
                  <option value="">Select rating</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              
              {/* Question 3 */}
              <div className="mb-3">
                <label className="form-label fw-semibold">3. How would you rate the instructor's teaching quality?</label>
                <select 
                  className="form-select"
                  value={feedbackData.question_3}
                  onChange={(e) => handleFeedbackChange('question_3', e.target.value)}
                  disabled={feedbackSubmitting}
                >
                  <option value="">Select rating</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              
              {/* Question 4 */}
              <div className="mb-3">
                <label className="form-label fw-semibold">4. How would you rate the course difficulty level?</label>
                <select 
                  className="form-select"
                  value={feedbackData.question_4}
                  onChange={(e) => handleFeedbackChange('question_4', e.target.value)}
                  disabled={feedbackSubmitting}
                >
                  <option value="">Select rating</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              
              {/* Question 5 */}
              <div className="mb-3">
                <label className="form-label fw-semibold">5. How likely are you to recommend this course to others?</label>
                <select 
                  className="form-select"
                  value={feedbackData.question_5}
                  onChange={(e) => handleFeedbackChange('question_5', e.target.value)}
                  disabled={feedbackSubmitting}
                >
                  <option value="">Select rating</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              
              {/* Comment */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Additional Comments (Optional)</label>
                <textarea 
                  className="form-control" 
                  rows="4"
                  placeholder="Share your thoughts about the course..."
                  value={feedbackData.comment}
                  onChange={(e) => handleFeedbackChange('comment', e.target.value)}
                  disabled={feedbackSubmitting}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid #e0e0e0' }}>
              <Button 
                variant="secondary" 
                onClick={handleCloseFeedbackModal}
                disabled={feedbackSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmitFeedback}
                disabled={feedbackSubmitting}
                style={{
                  background: 'linear-gradient(135deg, #667eea, #667eea)',
                  border: 'none'
                }}
              >
                {feedbackSubmitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="me-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}
    
    </div>
  )

  // Render exercise view with drag and drop interface
  function renderExerciseView() {
    if (!currentExerciseModule) return null

    const remainingExercises = currentExerciseModule.exercises.filter(exercise => 
      !correctMatches.some(correct => correct.img_name === exercise.img_name)
    )

    return (
      <div className="exercise-view fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4 page-header">
          <Button variant="outline-secondary" size="sm" onClick={() => setShowExerciseView(false)}>
            <FaArrowLeft /> Back to Module
          </Button>
          <h4 className="mb-0">Exercise: Match the Images to Their Names</h4>
        </div>

        {/* Feedback Message */}
        {exerciseFeedback.message && (
          <div className={`feedback ${exerciseFeedback.type}`}>
            {exerciseFeedback.message}
          </div>
        )}

        <div className="game-container">
          {/* Left Side: Images to Drag */}
          <div className="game-column images-column">
            <h3>Images</h3>
            {remainingExercises.length === 0 ? (
              <div className="no-items">
                <i className="bi bi-check-circle-fill"></i>
                <p>All exercises completed!</p>
                <Button 
                  className="reset-button"
                  onClick={() => {
                    setCorrectMatches([])
                    setExerciseFeedback({ type: '', message: '' })
                  }}
                >
                  Reset Exercise
                </Button>
              </div>
            ) : (
              <div className="items-grid images-grid">
                {remainingExercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="draggable-item image-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, exercise)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={(e) => handleTouchStart(e, exercise)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img
                      src={`https://brjobsedu.com/girls_course/girls_course_backend${exercise.img}`}
                      alt={exercise.img_name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                    <div className="no-image" style={{ display: 'none' }}>
                      No Image
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Target Names */}
          <div className="game-column targets-column">
            <h3>Names</h3>
            <div className="items-grid targets-grid">
              {currentExerciseModule.exercises.map((exercise, index) => {
                const isMatched = correctMatches.some(correct => correct.img_name === exercise.img_name);
                
                return (
                  <div
                    key={index}
                    className={`target-item ${isMatched ? 'matched' : ''}`}
                    data-target={exercise.img_name}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, exercise.img_name)}
                    onTouchEnd={handleTouchEnd}
                  >
                    {isMatched ? (
                      <div className="matched-content">
                        <i className="bi bi-check-circle"></i>
                        <span>{exercise.img_name}</span>
                      </div>
                    ) : (
                      <span>{exercise.img_name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default UserDashboard