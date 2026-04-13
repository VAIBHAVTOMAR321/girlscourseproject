import React, { useState, useEffect, useRef } from 'react'
import { 
  Container, Row, Col, Card, Spinner, Button, Modal, Form, 
  Accordion, Badge, InputGroup, FormControl, Image, Nav, Tab, Table 
} from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../../assets/css/AdminDashboard.css'
import { renderContentWithLineBreaks } from '../../utils/contentRenderer'
import { 
  FaPlus, FaArrowLeft, FaBook, FaUsers, FaLayerGroup, 
  FaTrash, FaImage, FaList, FaEye, FaEdit, FaComments, FaQuestionCircle 
} from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'


const AdminDashboard = () => {
  const navigate = useNavigate()
  const isMounted = useRef(true) // Prevents double fetch in React 18 Strict Mode
  // const [showSidebar, setShowSidebar] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  
  const authData = useAuth();
  const authToken = authData?.accessToken;
  
  // State for Data
  const [paidEnrollmentCount, setPaidEnrollmentCount] = useState(0)
  const [unpaidEnrollmentCount, setUnpaidEnrollmentCount] = useState(0)
  const [courses, setCourses] = useState([])
  const [courseType, setCourseType] = useState('paid') // 'paid' or 'unpaid'
  const [loading, setLoading] = useState(true)
  
  // State for Views
  const [currentView, setCurrentView] = useState('dashboard')
  
  // State for Course Detail Modal
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // State for Simple Course Form
  const [courseFormData, setCourseFormData] = useState({
    course_name: '',
    start_date: '',
    end_date: ''
  })
  
  // Prevent double submission
  const [submitting, setSubmitting] = useState(false)

  // State for Module Management
  const [moduleViewData, setModuleViewData] = useState(null) // { course }
  const [modules, setModules] = useState([])
  const [moduleFormData, setModuleFormData] = useState({
    mod_title: '',
    mod_title_hindi: '',
    order: 1,
    video_link: ''
  })
  const [loadingModules, setLoadingModules] = useState(false)

  // State for Submodules Management
  const [submodulesViewData, setSubmodulesViewData] = useState(null) // { course, module }
  const [submodules, setSubmodules] = useState([])
  const [submoduleFormData, setSubmoduleFormData] = useState({
    sub_modu_title: '',
    sub_modu_title_hindi: '',
    sub_modu_description: '',
    sub_modu_description_hindi: '',
    sub_mod: [{ title: '', description: '' }],
    sub_mod_hindi: [{ title: '', description: '' }],
    image: null,
    order: 1
  })
  const [loadingSubmodules, setLoadingSubmodules] = useState(false)

  // State for Questions Management
  const [questionsViewData, setQuestionsViewData] = useState(null) // { course, module }
  const [questions, setQuestions] = useState([])
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    question_text_hindi: '',
    options: ['', '', '', ''],
    options_hindi: ['', '', '', ''],
    correct_answer: 0,
    marks: 1
  })
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  // State for Exercises Management
  const [exercisesViewData, setExercisesViewData] = useState(null) // { course, module }
  const [exercises, setExercises] = useState([])
  const [exerciseFormData, setExerciseFormData] = useState({
    img_name: '',
    img: null
  })
  const [loadingExercises, setLoadingExercises] = useState(false)

  // State for Counseling Management
  const [counselingData, setCounselingData] = useState([])
  const [selectedCounseling, setSelectedCounseling] = useState(null)
  const [showCounselingModal, setShowCounselingModal] = useState(false)
  const [counselingPage, setCounselingPage] = useState(1)
  const counselingItemsPerPage = 10

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
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const config = getAuthConfig()
      
       // Fetch paid enrollment count (same endpoint as Enrollments.jsx)
       try {
         const paidEnrollRes = await axios.get('https://brainrock.in/brainrock/backend/api/course-registration/', config)
         if (paidEnrollRes.data && paidEnrollRes.data.success) {
           setPaidEnrollmentCount(paidEnrollRes.data.data.length)
         }
       } catch (paidEnrollError) {
         // Fallback to girls_course API if payment API fails (same as Enrollments.jsx)
         const fallbackRes = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/', config)
         if (fallbackRes.data && fallbackRes.data.success) {
           setPaidEnrollmentCount(fallbackRes.data.data.length)
         }
       }
      
      // Fetch unpaid enrollment count
      try {
        const unpaidEnrollRes = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/student-unpaid/', config)
        if (unpaidEnrollRes.data && unpaidEnrollRes.data.success) {
          setUnpaidEnrollmentCount(unpaidEnrollRes.data.data.length)
        }
      } catch (unpaidEnrollError) {
        setUnpaidEnrollmentCount(0)
      }

      // Fetch courses data from new endpoint
      try {
        const courseRes = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/course-items/', config)
        if (courseRes.data && courseRes.data.success) {
          setCourses(courseRes.data.data)
        }
      } catch (courseError) {
        setCourses([])
      }

      // Fetch counseling data
      try {
        const counselingRes = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/student-cousult/', config)
        if (counselingRes.data && counselingRes.data.status) {
          setCounselingData(counselingRes.data.data)
        }
      } catch (counselingError) {
        setCounselingData([])
      }

    } catch (error) {
      // Fallback data in case of error
      setPaidEnrollmentCount(0)
      setUnpaidEnrollmentCount(0)
      setCourses([])
      setCounselingData([])
    } finally {
      setLoading(false)
    }
  }

  // --- Navigation Handlers ---
  const handleEnrollmentsClick = (type = 'paid') => navigate('/Enrollments', { state: { enrollmentType: type } })
  const handleCounselingClick = () => {
    setCounselingPage(1)
    setCurrentView('counseling')
  }

  const handleViewCounseling = (counseling) => {
    setSelectedCounseling(counseling)
    setShowCounselingModal(true)
  }

  const handleCloseCounselingModal = () => {
    setShowCounselingModal(false)
    setSelectedCounseling(null)
  }
  const handleCoursesClick = (type = 'paid') => {
    setCourseType(type)
    setCurrentView('list')
  }
  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    fetchData() // Refresh data when returning to dashboard
  }
  const handleAddCourseClick = () => {
    setCourseFormData({ course_name: '', start_date: '', end_date: '' })
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
      alert('Failed to fetch course details. Please check the console for details.')
    }
    setShowModal(true)
  }

  const handleEditCourse = (course) => {
    setCourseFormData({
      course_id: course.course_id,
      course_name: course.course_name,
      start_date: course.start_date || '',
      end_date: course.end_date || ''
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
        alert('Failed to delete course. Please check the console for details.')
      }
    }
  }

  const handleAddModule = (course) => {
    setModuleViewData({ course })
    setCurrentView('modules')
    setModules([])
    fetchModules(course.course_id)
  }

  const fetchModules = async (course_id) => {
    setLoadingModules(true)
    try {
      const config = getAuthConfig()
      const response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/course-module/?course_id=${course_id}`, config)
      if (response.data && response.data.success) {
        const fetchedModules = response.data.data.modules || []
        setModules(fetchedModules)
        // Set initial order to next sequential number
        setModuleFormData(prev => ({
          ...prev,
          order: fetchedModules.length + 1
        }))
      }
    } catch (error) {
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
        mod_title_hindi: moduleFormData.mod_title_hindi,
        order: moduleFormData.order,
        video_link: moduleFormData.video_link
      }

      if (moduleFormData.module_id) {
        // Update existing module (PUT request)
        await axios.put('https://brjobsedu.com/girls_course/girls_course_backend/api/module-items/', {
          ...dataToSend,
          module_id: moduleFormData.module_id
        }, config)
        alert('Module updated successfully!')
      } else {
        // Create new module (POST request)
        await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/module-items/', dataToSend, config)
        alert('Module added successfully!')
      }
      
      // Reset form and fetch updated modules
      setModuleFormData({
        mod_title: '',
        mod_title_hindi: '',
        order: 1,
        video_link: ''
      })
      fetchModules(moduleViewData.course.course_id)
    } catch (error) {
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
      mod_title_hindi: module.mod_title_hindi || '',
      order: module.order,
      video_link: module.video_link || ''
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
      sub_modu_title_hindi: '',
      sub_modu_description: '',
      sub_modu_description_hindi: '',
      sub_mod: [{ title: '', description: '' }],
      sub_mod_hindi: [{ title: '', description: '' }],
      image: null,
      order: 1
    })
    fetchSubmodules(course.course_id, module.module_id)
  }

  const fetchSubmodules = async (course_id, module_id) => {
    setLoadingSubmodules(true)
    try {
      const config = getAuthConfig()
      const response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/course-module/?course_id=${course_id}`, config)
      if (response.data && response.data.success) {
        // Find the module and get its submodules
        const targetModule = response.data.data.modules.find(m => m.module_id === module_id)
        const parsedSubmodules = targetModule?.sub_modules?.map(submodule => ({
          ...submodule,
          sub_mod: typeof submodule.sub_mod === 'string' ? JSON.parse(submodule.sub_mod) : (submodule.sub_mod || []),
          sub_mod_hindi: typeof submodule.sub_mod_hindi === 'string' ? JSON.parse(submodule.sub_mod_hindi) : (submodule.sub_mod_hindi || [])
        })) || []
        setSubmodules(parsedSubmodules)
        // Set initial order to next sequential number
        setSubmoduleFormData(prev => ({
          ...prev,
          order: parsedSubmodules.length + 1
        }))
      }
    } catch (error) {
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
      formData.append('sub_modu_title_hindi', submoduleFormData.sub_modu_title_hindi)
      formData.append('sub_modu_description', submoduleFormData.sub_modu_description)
      formData.append('sub_modu_description_hindi', submoduleFormData.sub_modu_description_hindi)
      formData.append('sub_mod', JSON.stringify(submoduleFormData.sub_mod))
      formData.append('sub_mod_hindi', JSON.stringify(submoduleFormData.sub_mod_hindi))
      formData.append('order', submoduleFormData.order)
      if (submoduleFormData.image) {
        formData.append('image', submoduleFormData.image)
      }
      if (submoduleFormData.sub_module_id) {
        formData.append('sub_module_id', submoduleFormData.sub_module_id)
      }

      if (submoduleFormData.sub_module_id) {
        // Update existing submodule (PUT request)
        await axios.put('https://brjobsedu.com/girls_course/girls_course_backend/api/submodule-items/', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Submodule updated successfully!')
      } else {
        // Create new submodule (POST request)
        await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/submodule-items/', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Submodule added successfully!')
      }
      
      // Reset form and fetch updated submodules
      setSubmoduleFormData({
        sub_modu_title: '',
        sub_modu_title_hindi: '',
        sub_modu_description: '',
        sub_modu_description_hindi: '',
        sub_mod: [{ title: '', description: '' }],
        sub_mod_hindi: [{ title: '', description: '' }],
        image: null,
        order: 1
      })
      fetchSubmodules(submodulesViewData.course.course_id, submodulesViewData.module.module_id)
    } catch (error) {
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
      sub_modu_title_hindi: submodule.sub_modu_title_hindi || '',
      sub_modu_description: submodule.sub_modu_description,
      sub_modu_description_hindi: submodule.sub_modu_description_hindi || '',
      sub_mod: submodule.sub_mod || [{ title: '', description: '' }],
      sub_mod_hindi: submodule.sub_mod_hindi || [{ title: '', description: '' }],
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
        alert('Failed to delete submodule. Please check the console for details.')
      }
    }
  }

  const handleAddSubModSection = () => {
    setSubmoduleFormData({
      ...submoduleFormData,
      sub_mod: [...submoduleFormData.sub_mod, { title: '', description: '' }],
      sub_mod_hindi: [...(submoduleFormData.sub_mod_hindi || []), { title: '', description: '' }]
    })
  }

  const handleRemoveSubModSection = (index) => {
    if (submoduleFormData.sub_mod.length > 1) {
      const newSubMod = [...submoduleFormData.sub_mod]
      newSubMod.splice(index, 1)
      const newSubModHindi = [...(submoduleFormData.sub_mod_hindi || [])]
      newSubModHindi.splice(index, 1)
      setSubmoduleFormData({
        ...submoduleFormData,
        sub_mod: newSubMod,
        sub_mod_hindi: newSubModHindi
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
      question_text_hindi: '',
      options: ['', '', '', ''],
      options_hindi: ['', '', '', ''],
      correct_answer: 0,
      marks: 1
    })
    if (module) {
      fetchQuestions(course.course_id, module.module_id)
    }
  }

  const handleAddExercises = (course, module) => {
    console.log('handleAddExercises called with:', { course, module })
    setExercisesViewData({ course, module })
    setCurrentView('exercises')
    setExercises([])
    setExerciseFormData({
      img_name: '',
      img: null
    })
    fetchExercises(module.module_id)
  }

  const fetchExercises = async (module_id) => {
    setLoadingExercises(true)
    try {
      console.log('Fetching exercises for module_id:', module_id)
      
      // Validate module_id
      if (!module_id || module_id === 'undefined') {
        console.error('Invalid module_id:', module_id)
        setExercises([])
        return
      }
      
      const config = getAuthConfig()
      const response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/exercise-img/?module_id=${module_id}`, config)
      console.log('API Response:', response)
      if (response.data && response.data.success) {
        setExercises(response.data.data)
      } else {
        console.log('API returned success: false or no data')
        setExercises([])
      }
    } catch (error) {
      console.error('Error fetching exercises:', error)
      alert('Failed to fetch exercises. Please check the console for details.')
      setExercises([])
    } finally {
      setLoadingExercises(false)
    }
  }

  const handleAddExerciseSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const config = getAuthConfig()
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('course_id', exercisesViewData.course.course_id)
      formData.append('module_id', exercisesViewData.module.module_id)
      formData.append('img_name', exerciseFormData.img_name)
      if (exerciseFormData.img) {
        formData.append('img', exerciseFormData.img)
      }
      if (exerciseFormData.id) {
        formData.append('id', exerciseFormData.id)
      }

      if (exerciseFormData.id) {
        // Update existing exercise
        await axios.put('https://brjobsedu.com/girls_course/girls_course_backend/api/exercise-img/', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Exercise updated successfully!')
      } else {
        // Create new exercise
        await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/exercise-img/', formData, {
          ...config,
          headers: {
            ...config.headers,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Exercise added successfully!')
      }
      
      // Reset form and fetch updated exercises
      setExerciseFormData({
        img_name: '',
        img: null
      })
      fetchExercises(exercisesViewData.module.module_id)
    } catch (error) {
      if (error.response) {
        alert(`Failed: ${error.response.data.message || error.response.data.detail || 'Check console for details'}`)
      } else {
        alert('Failed: ' + error.message)
      }
    }
  }

  const handleEditExercise = (exercise) => {
    setExerciseFormData({
      id: exercise.id,
      img_name: exercise.img_name,
      img: null
    })
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteExercise = async (exercise) => {
    if (window.confirm(`Are you sure you want to delete the exercise "${exercise.img_name}"?`)) {
      try {
        const config = getAuthConfig()
        await axios.delete('https://brjobsedu.com/girls_course/girls_course_backend/api/exercise-img/', {
          data: { id: exercise.id },
          ...config
        })
        fetchExercises(exercisesViewData.module.module_id)
      } catch (error) {
        alert('Failed to delete exercise. Please check the console for details.')
      }
    }
  }

  const handleExerciseImageChange = (e) => {
    const file = e.target.files[0]
    setExerciseFormData({
      ...exerciseFormData,
      img: file
    })
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
        question_text_hindi: questionFormData.question_text_hindi,
        options: questionFormData.options,
        options_hindi: questionFormData.options_hindi,
        correct_answer: questionFormData.correct_answer,
        marks: questionFormData.marks
      }

      if (questionFormData.id) {
        dataToSend.id = questionFormData.id
        await axios.put('https://brjobsedu.com/girls_course/girls_course_backend/api/module-questions/', dataToSend, config)
        alert('Question updated successfully!')
      } else {
        await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/module-questions/', dataToSend, config)
        alert('Question added successfully!')
      }
      
      // Reset form and fetch updated questions
      setQuestionFormData({
        question_text: '',
        question_text_hindi: '',
        options: ['', '', '', ''],
        options_hindi: ['', '', '', ''],
        correct_answer: 0,
        marks: 1
      })
      fetchQuestions(questionsViewData.course.course_id, questionsViewData.module.module_id)
    } catch (error) {
      if (error.response) {
        alert(`Failed: ${error.response.data.message || error.response.data.detail || 'Check console for details'}`)
      } else {
        alert('Failed: ' + error.message)
      }
    }
  }

  const handleEditQuestion = (question) => {
    setQuestionFormData({
      id: question.id,
      question_text: question.question_text,
      question_text_hindi: question.question_text_hindi || '',
      options: question.options || ['', '', '', ''],
      options_hindi: question.options_hindi || ['', '', '', ''],
      correct_answer: question.correct_answer,
      marks: question.marks
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteQuestion = async (question) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const config = getAuthConfig()
        await axios.delete('https://brjobsedu.com/girls_course/girls_course_backend/api/module-questions/', {
          data: { id: question.id },
          ...config
        })
        fetchQuestions(questionsViewData.course.course_id, questionsViewData.module.module_id)
        alert('Question deleted successfully!')
      } catch (error) {
        alert('Failed to delete question. Please check the console for details.')
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
          course_name: courseFormData.course_name,
          course_status: courseFormData.course_status || 'unpaid',
          start_date: courseFormData.start_date,
          end_date: courseFormData.end_date
        }, config)
        alert('Course updated successfully!')
      } else {
        // Create new course - only create unpaid courses
        await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/course-items/', {
          course_name: courseFormData.course_name,
          course_status: 'unpaid', // Explicitly set to unpaid
          start_date: courseFormData.start_date,
          end_date: courseFormData.end_date
        }, config)
        alert('Unpaid course created successfully!')
      }
      
      fetchData()
      setCurrentView('list')
    } catch (error) {
      if (error.response) {
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
    <div className="fade-in">
      <Row className="g-4 mob-top-view">
        <Col xs={12} sm={6} md={3} lg={3}>
          <Card className="stat-card h-100 shadow-sm border-0" onClick={() => handleEnrollmentsClick('paid')}>
            <Card.Body className="d-flex align-items-center card-box-mob" >
              <div className="stat-icon-wrapper users me-3">
                <FaUsers className="stat-icon" />
              </div>
              <div>
                <h6 className="stat-label text-muted mb-1">Paid Enrollments</h6>
                <h2 className="stat-value mb-0">{loading ? <Spinner size="sm" animation="border" /> : paidEnrollmentCount}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3} lg={3}>
          <Card className="stat-card h-100 shadow-sm border-0" onClick={() => handleEnrollmentsClick('unpaid')}>
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-wrapper users me-3">
                <FaUsers className="stat-icon" />
              </div>
              <div>
                <h6 className="stat-label text-muted mb-1">Unpaid Enrollments</h6>
                <h2 className="stat-value mb-0">{loading ? <Spinner size="sm" animation="border" /> : unpaidEnrollmentCount}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3} lg={3}>
          <Card className="stat-card h-100 shadow-sm border-0" onClick={() => handleCoursesClick('paid')}>
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-wrapper courses me-3">
                <FaBook className="stat-icon" />
              </div>
              <div>
                <h6 className="stat-label text-muted mb-1">Paid Courses</h6>
                <h2 className="stat-value mb-0">{loading ? <Spinner size="sm" animation="border" /> : courses.filter(c => c.course_status === 'paid').length}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={3} lg={3}>
          <Card className="stat-card h-100 shadow-sm border-0" onClick={() => handleCoursesClick('unpaid')}>
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-wrapper courses me-3">
                <FaBook className="stat-icon" />
              </div>
              <div>
                <h6 className="stat-label text-muted mb-1">Unpaid Courses</h6>
                <h2 className="stat-value mb-0">{loading ? <Spinner size="sm" animation="border" /> : courses.filter(c => c.course_status === 'unpaid').length}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="g-4 mt-2">
        <Col xs={12} sm={6} md={3} lg={3}>
          <Card className="stat-card h-100 shadow-sm border-0" onClick={handleCounselingClick} style={{ cursor: 'pointer' }}>
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon-wrapper courses me-3">
                <FaComments className="stat-icon" />
              </div>
              <div>
                <h6 className="stat-label text-muted mb-1">Counseling Requests</h6>
                <h2 className="stat-value mb-0">{loading ? <Spinner size="sm" animation="border" /> : counselingData.length}</h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )

  const renderCoursesListView = () => {
    // Filter courses based on selected type
    const filteredCourses = courses.filter(course => course.course_status === courseType)

    return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <div>
          <Button variant="outline-secondary" size="sm" onClick={handleBackToDashboard} className="me-2">
            <FaArrowLeft /> Dashboard
          </Button>
          <h4 className="d-inline-block align-middle mb-0">All Courses</h4>
        </div>
        {courseType === 'unpaid' && (
          <Button variant="primary" onClick={handleAddCourseClick}>
            <FaPlus className="me-2" /> Add New Course
          </Button>
        )}
      </div>

      <Card className="courses-table-card border">
        <Card.Header className="bg-light border-bottom py-2 px-3">
          <Nav variant="tabs" activeKey={courseType} onSelect={(eventKey) => setCourseType(eventKey)}>
            <Nav.Item>
              <Nav.Link eventKey="paid">
                <FaBook className="me-2" /> Paid Courses
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="unpaid">
                <FaBook className="me-2" /> Unpaid Courses
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        
        <Card.Header className="bg-light border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center paid-btn gap-2">
            <h5 className="mb-0 fw-semibold text-secondary">
              {courseType === 'paid' ? 'Paid' : 'Unpaid'} Courses
            </h5>
          </div>
          <span className="text-muted small">
            Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
          </span>
        </Card.Header>
        
        <Card.Body className="">
          <Row className="g-4">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <Col key={course.id} xs={12} md={6} lg={4}>
                  <Card className="course-card h-100 shadow-sm border-0">
                    <Card.Body className="d-flex flex-column">
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Badge bg="primary" className="">ID: {course.course_id}</Badge>
                          <Badge bg={course.course_status === 'paid' ? 'success' : 'info'} className="">
                            {course.course_status === 'paid' ? 'Paid' : 'Free'}
                          </Badge>
                        </div>
                        {course.start_date && course.end_date && (
                          <div className="mb-2 text-muted small">
                            <i className="far fa-calendar-alt me-1"></i>
                            {course.start_date} to {course.end_date}
                          </div>
                        )}
                        <Card.Title className="fw-bold">{renderContentWithLineBreaks(course.course_name)}</Card.Title>
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
              ))
            ) : (
              <Col xs={12}>
                <Card className="shadow-sm border-0 text-center p-5">
                  <p className="text-muted mb-0">No {courseType} courses found</p>
                </Card>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>
    </div>
  )
  }

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
            <FaBook className="me-2" /> {renderContentWithLineBreaks(moduleViewData?.course?.course_name)}
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
              <Form.Label>Module Title (English)</Form.Label>
              <Form.Control
                type="text"
                value={moduleFormData.mod_title}
                onChange={(e) => setModuleFormData({ ...moduleFormData, mod_title: e.target.value })}
                placeholder="e.g. Introduction to Python"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Module Title (Hindi)</Form.Label>
              <Form.Control
                type="text"
                value={moduleFormData.mod_title_hindi}
                onChange={(e) => setModuleFormData({ ...moduleFormData, mod_title_hindi: e.target.value })}
                placeholder="e.g. पायथन का परिचय"
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

            {moduleViewData?.course?.course_status === 'unpaid' && (
              <Form.Group className="mb-3">
                <Form.Label>Video Link</Form.Label>
                <Form.Control
                  type="url"
                  value={moduleFormData.video_link}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, video_link: e.target.value })}
                  placeholder="e.g. https://youtube.com/watch?v=..."
                />
              </Form.Group>
            )}

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
                <Card key={module.module_id} className="mb-3 border-left-primary">
                  <Card.Body>
                     <div className="d-flex justify-content-between align-items-start mb-3">
                       <div className="flex-grow-1">
                         <h6 className="fw-bold mb-1">
                           Module {module.order}: {renderContentWithLineBreaks(module.mod_title)}
                         </h6>
                         {module.mod_title_hindi && (
                           <p className="small text-muted mb-0 fst-italic">
                             {renderContentWithLineBreaks(module.mod_title_hindi)}
                           </p>
                         )}
                       </div>
                       <Badge bg="secondary">ID: {module.module_id}</Badge>
                     </div>
                     {module.video_link && (
                       <div className="mb-2">
                         <a href={module.video_link} target="_blank" rel="noopener noreferrer" className="text-info small">
                           <FaEye className="me-1" /> Watch Video
                         </a>
                       </div>
                     )}
                     {module.sub_modules && module.sub_modules.length > 0 && (
                       <div className="mb-3 p-2 border rounded bg-light">
                         <h6 className="small fw-bold mb-2">Submodules ({module.sub_modules.length})</h6>
                         {module.sub_modules.map((submod, subIndex) => (
                           <div key={subIndex} className="mb-2 p-2 border rounded bg-white">
                             <p className="small fw-bold mb-1">{renderContentWithLineBreaks(submod.sub_modu_title)}</p>
                             {submod.sub_modu_title_hindi && (
                               <p className="small text-muted mb-1 fst-italic">{renderContentWithLineBreaks(submod.sub_modu_title_hindi)}</p>
                             )}
                             <p className="small mb-1">{renderContentWithLineBreaks(submod.sub_modu_description)}</p>
                             {submod.sub_modu_description_hindi && (
                               <p className="small text-muted mb-2 fst-italic">{renderContentWithLineBreaks(submod.sub_modu_description_hindi)}</p>
                             )}
                           </div>
                         ))}
                       </div>
                     )}
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
                        variant="outline-info" 
                        size="sm" 
                        onClick={() => handleAddExercises(moduleViewData.course, module)}
                      >
                        <FaImage className="me-1" /> Add Exercises
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

            <Form.Group className="mb-4">
              <Form.Label>Start Date</Form.Label>
              <Form.Control 
                type="date" 
                value={courseFormData.start_date}
                onChange={(e) => setCourseFormData({...courseFormData, start_date: e.target.value})}
                required 
                disabled={submitting}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>End Date</Form.Label>
              <Form.Control 
                type="date" 
                value={courseFormData.end_date}
                onChange={(e) => setCourseFormData({...courseFormData, end_date: e.target.value})}
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
            <FaBook className="me-2" /> {renderContentWithLineBreaks(submodulesViewData?.course?.course_name)}
          </h5>
          <p className="text-muted small">
            Course ID: {submodulesViewData?.course?.course_id}
          </p>
          <p className="text-muted small">
            Module: {renderContentWithLineBreaks(submodulesViewData?.module?.mod_title)} (ID: {submodulesViewData?.module?.module_id})
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
              <Form.Label>Submodule Title (English)</Form.Label>
              <Form.Control
                type="text"
                value={submoduleFormData.sub_modu_title}
                onChange={(e) => setSubmoduleFormData({ ...submoduleFormData, sub_modu_title: e.target.value })}
                placeholder="e.g. Introduction"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Submodule Title (Hindi)</Form.Label>
              <Form.Control
                type="text"
                value={submoduleFormData.sub_modu_title_hindi}
                onChange={(e) => setSubmoduleFormData({ ...submoduleFormData, sub_modu_title_hindi: e.target.value })}
                placeholder="e.g. परिचय"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Submodule Description (English)</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={submoduleFormData.sub_modu_description}
                onChange={(e) => setSubmoduleFormData({ ...submoduleFormData, sub_modu_description: e.target.value })}
                placeholder="e.g. Basic concepts"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Submodule Description (Hindi)</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                value={submoduleFormData.sub_modu_description_hindi}
                onChange={(e) => setSubmoduleFormData({ ...submoduleFormData, sub_modu_description_hindi: e.target.value })}
                placeholder="e.g. मूल अवधारणाएं"
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
                    <Form.Label className="small">Section Title (English)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Introduction to Python"
                      value={section.title}
                      onChange={(e) => handleSubModSectionChange(sectionIndex, 'title', e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small">Section Title (Hindi)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. पायथन का परिचय"
                      value={submoduleFormData.sub_mod_hindi && submoduleFormData.sub_mod_hindi[sectionIndex]?.title || ''}
                      onChange={(e) => {
                        const newSubModHindi = [...(submoduleFormData.sub_mod_hindi || [])]
                        if (!newSubModHindi[sectionIndex]) {
                          newSubModHindi[sectionIndex] = { title: '', description: '' }
                        }
                        newSubModHindi[sectionIndex].title = e.target.value
                        setSubmoduleFormData({ ...submoduleFormData, sub_mod_hindi: newSubModHindi })
                      }}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="small">Section Description (English)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      placeholder="e.g. Basic concepts and fundamentals"
                      value={section.description}
                      onChange={(e) => handleSubModSectionChange(sectionIndex, 'description', e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small">Section Description (Hindi)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      placeholder="e.g. मूल अवधारणाएं और बुनियादी बातें"
                      value={submoduleFormData.sub_mod_hindi && submoduleFormData.sub_mod_hindi[sectionIndex]?.description || ''}
                      onChange={(e) => {
                        const newSubModHindi = [...(submoduleFormData.sub_mod_hindi || [])]
                        if (!newSubModHindi[sectionIndex]) {
                          newSubModHindi[sectionIndex] = { title: '', description: '' }
                        }
                        newSubModHindi[sectionIndex].description = e.target.value
                        setSubmoduleFormData({ ...submoduleFormData, sub_mod_hindi: newSubModHindi })
                      }}
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
                <Card key={submodule.sub_module_id} className="mb-3 border-left-primary">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">
                          Submodule {submodule.order}: {renderContentWithLineBreaks(submodule.sub_modu_title)}
                        </h6>
                        {submodule.sub_modu_title_hindi && (
                          <p className="small text-muted mb-0 fst-italic">{renderContentWithLineBreaks(submodule.sub_modu_title_hindi)}</p>
                        )}
                      </div>
                      <Badge bg="secondary">ID: {submodule.sub_module_id}</Badge>
                    </div>
                    
                    <div className="mb-3">
                      <p className="mb-1">{renderContentWithLineBreaks(submodule.sub_modu_description)}</p>
                      {submodule.sub_modu_description_hindi && (
                        <p className="text-muted small fst-italic mb-0">{renderContentWithLineBreaks(submodule.sub_modu_description_hindi)}</p>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="small fw-bold mb-2">Sections (English):</h6>
                      {submodule.sub_mod && submodule.sub_mod.length > 0 ? (
                        submodule.sub_mod.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="mb-2 p-2 border rounded bg-light">
                            <h6 className="small fw-bold mb-1">
                              Section {sectionIndex + 1}: {renderContentWithLineBreaks(section.title || 'Untitled Section')}
                            </h6>
                            {section.description && (
                              <p className="small mb-0">{renderContentWithLineBreaks(section.description)}</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="small text-muted">No English sections found</p>
                      )}
                    </div>

                    {submodule.sub_mod_hindi && submodule.sub_mod_hindi.length > 0 && (
                      <div className="mb-3">
                        <h6 className="small fw-bold mb-2">Sections (हिंदी):</h6>
                        {submodule.sub_mod_hindi.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="mb-2 p-2 border rounded bg-light">
                            <h6 className="small fw-bold mb-1">
                              Section {sectionIndex + 1}: {renderContentWithLineBreaks(section.title || 'Untitled Section')}
                            </h6>
                            {section.description && (
                              <p className="small mb-0">{renderContentWithLineBreaks(section.description)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
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

  const renderExercisesView = () => (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 page-header">
        <Button variant="outline-secondary" size="sm" onClick={() => setCurrentView('modules')}>
          <FaArrowLeft /> Back to Modules
        </Button>
        <h4 className="mb-0">Exercises Management</h4>
      </div>

      {/* Course and Module Information */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          <h5 className="mb-3">
            <FaBook className="me-2" /> {renderContentWithLineBreaks(exercisesViewData?.course?.course_name)}
          </h5>
          <p className="text-muted small">
            Course ID: {exercisesViewData?.course?.course_id}
          </p>
          <p className="text-muted small">
            Module: {renderContentWithLineBreaks(exercisesViewData?.module?.mod_title)} (ID: {exercisesViewData?.module?.module_id})
          </p>
        </Card.Body>
      </Card>

      {/* Add Exercise Form */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-primary text-white">
          <FaPlus className="me-2" /> {exerciseFormData.id ? 'Edit Exercise' : 'Add New Exercise'}
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleAddExerciseSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Image Name</Form.Label>
              <Form.Control
                type="text"
                value={exerciseFormData.img_name}
                onChange={(e) => setExerciseFormData({ ...exerciseFormData, img_name: e.target.value })}
                placeholder="e.g. bike"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleExerciseImageChange}
              />
              {exerciseFormData.img && (
                <div className="mt-2">
                  <Image 
                    src={URL.createObjectURL(exerciseFormData.img)} 
                    alt="Preview" 
                    thumbnail 
                    className="img-fluid" 
                    style={{ maxWidth: '200px' }}
                  />
                </div>
              )}
            </Form.Group>

            <Button variant="primary" type="submit">
              <FaPlus className="me-2" /> {exerciseFormData.id ? 'Update Exercise' : 'Add Exercise'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Exercises List */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-info text-white">
          <FaImage className="me-2" /> Exercises ({exercises.length})
        </Card.Header>
        <Card.Body>
          {loadingExercises ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading exercises...</p>
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center text-muted">
              <p>No exercises found.</p>
              <p>Add your first exercise above!</p>
            </div>
          ) : (
            <div className="exercises-list">
              {exercises.map((exercise) => (
                <Card key={exercise.id} className="mb-2 border-left-primary">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">
                          {renderContentWithLineBreaks(exercise.img_name)}
                        </h6>
                        <Badge bg="secondary" className="small">ID: {exercise.id}</Badge>
                      </div>
                      {exercise.img && (
                        <div className="me-3">
                          <Image 
                            src={`https://brjobsedu.com/girls_course/girls_course_backend${exercise.img}`} 
                            alt={exercise.img_name} 
                            thumbnail 
                            className="img-fluid"
                            style={{ maxWidth: '80px', maxHeight: '60px' }}
                          />
                        </div>
                      )}
                      <div className="d-flex gap-1">
                        <Button 
                          variant="outline-warning" 
                          size="sm"
                          onClick={() => handleEditExercise(exercise)}
                        >
                          <FaEdit className="me-1" /> Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteExercise(exercise)}
                        >
                          <FaTrash className="me-1" /> Delete
                        </Button>
                      </div>
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
            <FaBook className="me-2" /> {renderContentWithLineBreaks(questionsViewData?.course?.course_name)}
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
                  {renderContentWithLineBreaks(module.mod_title)}
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
              <FaPlus className="me-2" /> {questionFormData.id ? 'Edit Question' : 'Add New Question'}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddQuestion}>
                <Form.Group className="mb-3">
                  <Form.Label>Question Text (English)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={questionFormData.question_text}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question_text: e.target.value })}
                    placeholder="Enter your question here..."
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Question Text (Hindi)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={questionFormData.question_text_hindi}
                    onChange={(e) => setQuestionFormData({ ...questionFormData, question_text_hindi: e.target.value })}
                    placeholder="अपना प्रश्न यहाँ दर्ज करें..."
                    required
                  />
                </Form.Group>

                <div className="mb-3">
                  <Form.Label>Options (English)</Form.Label>
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

                <div className="mb-3">
                  <Form.Label>Options (Hindi)</Form.Label>
                  {questionFormData.options_hindi.map((option, index) => (
                    <Form.Group key={index} className="mb-2">
                      <InputGroup>
                        <InputGroup.Text>{String.fromCharCode(65 + index)}</InputGroup.Text>
                        <Form.Control
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionFormData.options_hindi]
                            newOptions[index] = e.target.value
                            setQuestionFormData({ ...questionFormData, options_hindi: newOptions })
                          }}
                          placeholder={`विकल्प ${String.fromCharCode(65 + index)}`}
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
                  <FaPlus className="me-2" /> {questionFormData.id ? 'Update Question' : 'Add Question'}
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
                        <p className="mb-1 fw-bold">{question.question_text}</p>
                        {question.question_text_hindi && (
                          <p className="mb-3 text-muted small fst-italic">{question.question_text_hindi}</p>
                        )}
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
                              {question.options_hindi && question.options_hindi[optIndex] && (
                                <span className="ms-2 text-muted small fst-italic">({question.options_hindi[optIndex]})</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="text-muted small mb-2">
                          Correct Answer: <span className="fw-bold text-success">
                            {String.fromCharCode(65 + question.correct_answer)}
                          </span>
                        </div>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-warning" 
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                          >
                            <FaEdit className="me-1" /> Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteQuestion(question)}
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
        </>
      )}
    </div>
  )

  const renderCounselingView = () => {
    const totalPages = Math.ceil(counselingData.length / counselingItemsPerPage)
    const startIndex = (counselingPage - 1) * counselingItemsPerPage
    const endIndex = startIndex + counselingItemsPerPage
    const currentItems = counselingData.slice(startIndex, endIndex)

    return (
      <div className="fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4 page-header">
          <Button variant="outline-secondary" size="sm" onClick={handleBackToDashboard}>
            <FaArrowLeft /> Dashboard
          </Button>
          <h4 className="mb-0">Counseling Requests</h4>
        </div>

        <Card className="shadow-sm border-0">
          <Card.Header className="bg-info text-white">
            <FaComments className="me-2" /> Counseling Details
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading...</p>
              </div>
            ) : counselingData.length === 0 ? (
              <p className="text-muted text-center mb-0">No counseling requests found</p>
            ) : (
              <>
                <div className="table-responsive">
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Full Name</th>
                        <th>Phone</th>
                        <th>District</th>
                        <th>Block</th>
                        <th>State</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((counseling) => (
                        <tr key={counseling.id}>
                          <td>{counseling.student_id}</td>
                          <td>{counseling.full_name}</td>
                          <td>{counseling.phone}</td>
                          <td>{counseling.district}</td>
                          <td>{counseling.block}</td>
                          <td>{counseling.state}</td>
                          <td>{Array.isArray(counseling.category_consulting) ? counseling.category_consulting.join(', ') : counseling.category_consulting}</td>
                          <td>
                            <Badge bg={counseling.status === 'pending' ? 'warning' : counseling.status === 'approved' ? 'success' : 'danger'}>
                              {counseling.status}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="info" size="sm" onClick={() => handleViewCounseling(counseling)}>
                              <FaEye className="me-1" /> View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-muted small">
                      Showing {startIndex + 1}-{Math.min(endIndex, counselingData.length)} of {counselingData.length}
                    </span>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setCounselingPage(prev => Math.max(1, prev - 1))}
                        disabled={counselingPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="d-flex align-items-center px-2">
                        Page {counselingPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => setCounselingPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={counselingPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>
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
              {currentView === 'dashboard' && renderDashboardView()}
              {currentView === 'list' && renderCoursesListView()}
              {currentView === 'form' && renderCourseForm()}
              {currentView === 'modules' && renderModulesView()}
              {currentView === 'submodules' && renderSubmodulesView()}
              {currentView === 'questions' && renderQuestionsView()}
              {currentView === 'exercises' && renderExercisesView()}
              {currentView === 'counseling' && renderCounselingView()}
            </Container>
          </div>
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
          <Modal.Title className="fw-bold fs-5">{renderContentWithLineBreaks(selectedCourse?.course_name)}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          {selectedCourse && (
            <div>
              <p><strong>Course ID:</strong> {selectedCourse.course_id}</p>
              <p><strong>Course Name:</strong> {renderContentWithLineBreaks(selectedCourse.course_name)}</p>
              {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                <div className="mt-4">
                  <h5>Modules ({selectedCourse.modules.length})</h5>
                  <div className="modules-list">
                    {selectedCourse.modules.map((mod, index) => (
                      <div key={index} className="module-item mb-4 p-3 border rounded">
                        <h6 className="fw-bold mb-1">
                          Module {mod.order}: {renderContentWithLineBreaks(mod.mod_title)}
                          <Badge bg="secondary" className="ms-2">ID: {mod.module_id}</Badge>
                        </h6>
                        {mod.mod_title_hindi && (
                          <p className="small text-muted mb-2 fst-italic">{renderContentWithLineBreaks(mod.mod_title_hindi)}</p>
                        )}
                        
                        {mod.sub_modules && mod.sub_modules.length > 0 && (
                          <div className="mt-3">
                            <h7 className="fw-bold text-muted">Sub-modules ({mod.sub_modules.length})</h7>
                            <div className="submodules-list mt-2">
                              {mod.sub_modules.map((subMod, subIndex) => (
                                <div key={subIndex} className="submodule-item mb-3 p-2 border rounded bg-light">
                                  <h7 className="fw-bold mb-1">
                                    {renderContentWithLineBreaks(subMod.sub_modu_title)}
                                    <Badge bg="secondary" className="ms-2">ID: {subMod.sub_module_id}</Badge>
                                  </h7>
                                  {subMod.sub_modu_title_hindi && (
                                    <p className="small text-muted mb-1 fst-italic">{renderContentWithLineBreaks(subMod.sub_modu_title_hindi)}</p>
                                  )}
                                  
                                  {subMod.sub_modu_description && (
                                    <p className="small mt-1">{renderContentWithLineBreaks(subMod.sub_modu_description)}</p>
                                  )}
                                  {subMod.sub_modu_description_hindi && (
                                    <p className="small text-muted fst-italic mt-1">{renderContentWithLineBreaks(subMod.sub_modu_description_hindi)}</p>
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
                                      <h8 className="fw-bold text-muted small">Sections (English):</h8>
                                      <div className="sections-list mt-1">
                                        {subMod.sub_mod.map((section, sectionIndex) => (
                                          <div key={sectionIndex} className="section-item mb-2 p-1 border rounded">
                                            <h8 className="fw-bold small">
                                              {renderContentWithLineBreaks(section.title || 'Untitled Section')}
                                            </h8>
                                            {section.description && (
                                              <p className="small mt-1">{renderContentWithLineBreaks(section.description)}</p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {subMod.sub_mod_hindi && subMod.sub_mod_hindi.length > 0 && (
                                    <div className="mt-2">
                                      <h8 className="fw-bold text-muted small">Sections (हिंदी):</h8>
                                      <div className="sections-list mt-1">
                                        {subMod.sub_mod_hindi.map((section, sectionIndex) => (
                                          <div key={sectionIndex} className="section-item mb-2 p-1 border rounded">
                                            <h8 className="fw-bold small">
                                              {renderContentWithLineBreaks(section.title || 'Untitled Section')}
                                            </h8>
                                            {section.description && (
                                              <p className="small mt-1">{renderContentWithLineBreaks(section.description)}</p>
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

      <Modal show={showCounselingModal} onHide={handleCloseCounselingModal} size="lg" centered>
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title>
            <FaComments className="me-2" /> Counseling Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCounseling && (
            <div>
              <Row className="g-3">
                <Col md={6}>
                  <Card className="h-100 shadow-sm border-0">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">Personal Information</h6>
                    </Card.Header>
                    <Card.Body>
                      <p><strong>ID:</strong> {selectedCounseling.id}</p>
                      <p><strong>Student ID:</strong> {selectedCounseling.student_id}</p>
                      <p><strong>Full Name:</strong> {selectedCounseling.full_name}</p>
                      <p><strong>Aadhaar No:</strong> {selectedCounseling.aadhaar_no}</p>
                      <p><strong>Phone:</strong> {selectedCounseling.phone}</p>
                      <p><strong>Email:</strong> {selectedCounseling.email || 'N/A'}</p>
                      <p><strong>Associate Wings:</strong> {selectedCounseling.associate_wings || 'N/A'}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100 shadow-sm border-0">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">Location Details</h6>
                    </Card.Header>
                    <Card.Body>
                      <p><strong>State:</strong> {selectedCounseling.state}</p>
                      <p><strong>District:</strong> {selectedCounseling.district}</p>
                      <p><strong>Block:</strong> {selectedCounseling.block}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={12}>
                  <Card className="shadow-sm border-0 mt-2">
                    <Card.Header className="bg-light">
                      <h6 className="mb-0">Counseling Information</h6>
                    </Card.Header>
                    <Card.Body>
                      <p><strong>Category Consulting:</strong> {Array.isArray(selectedCounseling.category_consulting) ? selectedCounseling.category_consulting.join(', ') : selectedCounseling.category_consulting}</p>
                      <p><strong>Status:</strong> <Badge bg={selectedCounseling.status === 'pending' ? 'warning' : selectedCounseling.status === 'approved' ? 'success' : 'danger'}>{selectedCounseling.status}</Badge></p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCounselingModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default AdminDashboard