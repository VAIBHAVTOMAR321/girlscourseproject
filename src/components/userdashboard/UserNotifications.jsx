import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Card, Button, Form, ProgressBar, Badge, Modal, Alert, Nav, Tab } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import CounselingForm from './CounselingForm'
import TransText from '../TransText'
import { getTranslation } from '../../utils/translations'
import { FaArrowLeft, FaGraduationCap, FaChartLine, FaLightbulb, FaRocket, FaBook, FaCode, FaPalette, FaCalculator, FaLanguage, FaMusic, FaHeartbeat, FaBusinessTime, FaPercentage, FaUniversity, FaTools, FaLaptopMedical, FaBriefcase, FaCog, FaFlask, FaBalanceScale, FaNewspaper, FaChalkboardTeacher, FaUserTie, FaPaintBrush, FaGuitar, FaRunning, FaHome, FaWrench, FaIndustry, FaPlane, FaCar, FaBuilding, FaHospital, FaSeedling, FaMicrochip, FaNetworkWired, FaDatabase, FaShieldAlt, FaRobot, FaBrain, FaChartBar, FaProjectDiagram, FaBookOpen, FaBolt, FaDna, FaCheckCircle, FaInfoCircle, FaTrain, FaLandmark, FaMoneyBillWave, FaUserShield, FaFlag } from 'react-icons/fa'
import '../../assets/css/UserNotifications.css'

  const UserNotifications = () => {
  const { uniqueId, userRoleType, accessToken } = useAuth()
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedStream, setSelectedStream] = useState('')
  const [percentage, setPercentage] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedCareerPath, setSelectedCareerPath] = useState(null)
  const [showCounseling, setShowCounseling] = useState(false)
  const [userData, setUserData] = useState(null)
  const [prepType, setPrepType] = useState('private') // 'private', 'govtCollege', or 'govtJob'
  const [selectedGovtExam, setSelectedGovtExam] = useState('IIT-JEE')
  const [selectedGovtCollege, setSelectedGovtCollege] = useState('IIT')
  const navigate = useNavigate()
  const resultsRef = useRef(null)

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

  const handleMenuToggle = () => {
    setShowOffcanvas(!showOffcanvas)
  }

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let response

        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }

        // Fetch data based on user role
        if (userRoleType === 'student-unpaid') {
          // For unpaid students, fetch from student-unpaid endpoint with student_id
          response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/student-unpaid/?student_id=${uniqueId}`, config)
        } else {
          // For regular students, use the existing endpoint
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

    if (uniqueId) {
      fetchUserData()
    }
  }, [uniqueId, userRoleType, accessToken])

  // Simulate loading
  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  // 12th Streams
  
  const streams = [
    { id: 'science', nameKey: 'notifications.scienceStream', icon: <FaRocket className="" />, subjectsKey: 'notifications.scienceSubjects' },
    { id: 'commerce', nameKey: 'notifications.commerceStream', icon: <FaChartLine className="" />, subjectsKey: 'notifications.commerceSubjects' },
    { id: 'arts', nameKey: 'notifications.artsStream', icon: <FaPalette className="" />, subjectsKey: 'notifications.artsSubjects' },
    { id: 'computer', nameKey: 'notifications.computerScience', icon: <FaCode className="" />, subjectsKey: 'notifications.computerSubjects' }
  ]

  const govtExamTypes = ['IIT-JEE', 'NEET', 'UPSC', 'SSC', 'Banking', 'Railway', 'StatePSC']

  const govtExamData = {
    'IIT-JEE': {
      title: 'IIT-JEE (Engineering)',
      icon: <FaCog />,
      fullPath: '12th (PCM) → JEE Main → JEE Advanced → IIT/NIT/IIIT → B.Tech',
      steps: [
        { step: 1, title: 'Complete 12th with PCM', description: 'Complete 12th with Physics, Chemistry, Mathematics with 75%+', duration: '2 Years' },
        { step: 2, title: 'Prepare for JEE Main', description: 'Cover complete syllabus of PCM', duration: '1-2 Years' },
        { step: 3, title: 'Appear for JEE Main', description: 'Clear JEE Main exam', duration: 'Exam' },
        { step: 4, title: 'Prepare for JEE Advanced', description: 'If qualified in JEE Main', duration: '6-12 Months' },
        { step: 5, title: 'JoSAA Counseling', description: 'Participate in counseling', duration: 'After Results' },
        { step: 6, title: 'Complete B.Tech', description: '4-year engineering degree', duration: '4 Years' }
      ],
      colleges: [
        { name: 'IIT Bombay', location: 'Mumbai', seats: '~1000' },
        { name: 'IIT Delhi', location: 'Delhi', seats: '~900' },
        { name: 'IIT Madras', location: 'Chennai', seats: '~800' },
        { name: 'NIT Trichy', location: 'Tiruchirappalli', seats: '~1500' },
        { name: 'NIT Surathkal', location: 'Karnataka', seats: '~1200' }
      ]
    },
    'NEET': {
      title: 'NEET (Medical)',
      icon: <FaHeartbeat />,
      fullPath: '12th (PCB) → NEET → MBBS → Doctor',
      steps: [
        { step: 1, title: 'Complete 12th with PCB', description: 'Complete 12th with Physics, Chemistry, Biology', duration: '2 Years' },
        { step: 2, title: 'Prepare for NEET', description: 'Cover complete PCB syllabus', duration: '1-2 Years' },
        { step: 3, title: 'Appear for NEET', description: 'Clear NEET exam', duration: 'Exam' },
        { step: 4, title: ' counseling', description: 'Participate in All India Quota', duration: 'After Results' },
        { step: 5, title: 'Complete MBBS', description: '5.5 years including internship', duration: '5.5 Years' }
      ],
      colleges: [
        { name: 'AIIMS Delhi', location: 'Delhi', seats: '~100' },
        { name: 'Maulana Azad Medical College', location: 'Delhi', seats: '~250' },
        { name: 'Lady Hardinge Medical College', location: 'Delhi', seats: '~200' },
        { name: 'Grant Medical College', location: 'Mumbai', seats: '~200' }
      ]
    },
    'UPSC': {
      title: 'UPSC Civil Services',
      icon: <FaLandmark />,
      fullPath: 'Graduate → UPSC CSE → IAS/IPS/IFS',
      steps: [
        { step: 1, title: 'Complete Graduation', description: 'Graduate in any stream', duration: '3 Years' },
        { step: 2, title: 'Basic Preparation', description: 'Read NCERTs, basic books', duration: '6-12 Months' },
        { step: 3, title: 'Deep Preparation', description: 'Standard books, answer writing', duration: '1-2 Years' },
        { step: 4, title: 'Appear for Prelims', description: 'Clear UPSC Prelims', duration: 'Exam' },
        { step: 5, title: 'Appear for Mains', description: 'Clear Mains (9 papers)', duration: 'Exam' },
        { step: 6, title: 'Interview', description: 'Personality Test', duration: '30 Minutes' },
        { step: 7, title: 'Service Allocation', description: 'Get IAS/IPS/IFS service', duration: 'After Result' }
      ],
      colleges: [
        { name: 'IAS (Indian Administrative Service)', location: 'All India', seats: 'Various' },
        { name: 'IPS (Indian Police Service)', location: 'All India', seats: 'Various' },
        { name: 'IFS (Indian Foreign Service)', location: 'All India', seats: 'Various' }
      ]
    },
    'SSC': {
      title: 'SSC Exams',
      icon: <FaUserShield />,
      fullPath: '12th/Graduate → SSC Exams → Government Job',
      steps: [
        { step: 1, title: 'Check Eligibility', description: 'Check education qualification', duration: 'Before Exam' },
        { step: 2, title: 'Basic Preparation', description: 'English, Math, Reasoning, GK', duration: '3-6 Months' },
        { step: 3, title: 'Deep Preparation', description: 'Solve previous papers', duration: '6-12 Months' },
        { step: 4, title: 'Appear for Tier 1', description: 'Clear CBT exam', duration: 'Exam' },
        { step: 5, title: 'Tier 2 & DV', description: 'Descriptive/Typing + Document Verification', duration: 'After Tier 1' },
        { step: 6, title: 'Joining', description: 'Get joining letter', duration: 'After DV' }
      ],
      colleges: [
        { name: 'Income Tax Inspector', location: 'Central', seats: 'Various' },
        { name: 'Excise Inspector', location: 'Central', seats: 'Various' },
        { name: 'Assistant Section Officer', location: 'Ministries', seats: 'Various' }
      ]
    },
    'Banking': {
      title: 'Banking Exams',
      icon: <FaMoneyBillWave />,
      fullPath: 'Graduate → PO/Clerk Exam → Bank Job',
      steps: [
        { step: 1, title: 'Complete Graduation', description: 'Graduate in any stream', duration: '3 Years' },
        { step: 2, title: 'Check Eligibility', description: 'Check age limit, percentage', duration: 'Before Exam' },
        { step: 3, title: 'Basic Preparation', description: 'Quant, Reasoning, English, GA', duration: '3-6 Months' },
        { step: 4, title: 'Appear for Prelims', description: 'Clear Prelims', duration: 'Exam' },
        { step: 5, title: 'Appear for Mains', description: 'Clear Mains', duration: 'After Prelims' },
        { step: 6, title: 'GD & Interview', description: 'Group Discussion + PI', duration: 'After Mains' },
        { step: 7, title: 'Joining', description: 'Get PO/Clerk position', duration: 'After Result' }
      ],
      colleges: [
        { name: 'SBI PO', location: 'All India', seats: 'Various' },
        { name: 'IBPS PO', location: 'All India', seats: 'Various' },
        { name: 'RRB Clerk', location: 'State-wise', seats: 'Various' }
      ]
    },
    'Railway': {
      title: 'Railway Exams (RRB)',
      icon: <FaTrain />,
      fullPath: '12th/Graduate → RRB Exam → Railway Job',
      steps: [
        { step: 1, title: 'Check Eligibility', description: 'Check qualification, age', duration: 'Before Exam' },
        { step: 2, title: 'Basic Preparation', description: 'Math, Reasoning, GA', duration: '2-3 Months' },
        { step: 3, title: 'Deep Preparation', description: 'Solve previous papers', duration: '6-12 Months' },
        { step: 4, title: 'Appear for CBT', description: 'Clear Computer Based Test', duration: 'Exam' },
        { step: 5, title: 'Skill Test/DV', description: 'Typing + Document Verification', duration: 'After CBT' },
        { step: 6, title: 'Medical', description: 'Clear medical test', duration: 'After Skill Test' },
        { step: 7, title: 'Joining', description: 'Join Railway', duration: 'After Medical' }
      ],
      colleges: [
        { name: 'RRB NTPC', location: 'All India', seats: 'Various' },
        { name: 'RRB Group D', location: 'All India', seats: 'Various' },
        { name: 'RRB JE', location: 'All India', seats: 'Various' }
      ]
    },
    'StatePSC': {
      title: 'State PSC Exams',
      icon: <FaFlag />,
      fullPath: 'Graduate → State PSC Exam → State Government Job',
      steps: [
        { step: 1, title: 'Complete Graduation', description: 'Graduate in any stream', duration: '3 Years' },
        { step: 2, title: 'Check Notification', description: 'Check state PSC notification', duration: 'When Notified' },
        { step: 3, title: 'Prepare for Preliminary', description: 'State syllabus, papers', duration: '3-6 Months' },
        { step: 4, title: 'Prepare for Mains', description: 'State-specific topics', duration: '6-12 Months' },
        { step: 5, title: 'Interview', description: 'Personality Test', duration: 'After Mains' },
        { step: 6, title: 'Joining', description: 'Join state department', duration: 'After Result' }
      ],
      colleges: [
        { name: 'State Administrative Service', location: 'State Capital', seats: 'Various' },
        { name: 'State Police Service', location: 'State-wide', seats: 'Various' },
        { name: 'Various Dept Jobs', location: 'State-wide', seats: 'Various' }
      ]
    }
  }

  const govtCollegeTypes = ['IIT', 'NIT', 'IIIT', 'Medical', 'NDA']

  const govtCollegeData = {
    'IIT': {
      title: 'IIT (Indian Institutes of Technology)',
      icon: <FaCog />,
      fullPath: '12th (PCM) → JEE Main → JEE Advanced → IIT Admission',
      eligibility: '75%+ in PCM, JEE Main + Advanced qualified',
      seats: '~17,000 seats across all IITs',
      courses: ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'MBA', 'PhD'],
      steps: [
        { step: 1, title: 'Complete 12th with PCM', description: 'Physics, Chemistry, Mathematics with 75%+', duration: '2 Years' },
        { step: 2, title: 'Prepare for JEE Main', description: 'Cover complete PCM syllabus', duration: '1-2 Years' },
        { step: 3, title: 'Appear for JEE Main', description: 'Clear JEE Main exam', duration: 'Exam' },
        { step: 4, title: 'Prepare for JEE Advanced', description: 'If qualified in JEE Main', duration: '6-12 Months' },
        { step: 5, title: 'JoSAA Counseling', description: 'Participate in counseling', duration: 'After Results' },
        { step: 6, title: 'Get IIT Seat', description: 'Lock seat in choice filling', duration: 'Process' }
      ],
      colleges: [
        { name: 'IIT Bombay', location: 'Mumbai', ranking: '#1', seats: '~1000' },
        { name: 'IIT Delhi', location: 'Delhi', ranking: '#2', seats: '~900' },
        { name: 'IIT Madras', location: 'Chennai', ranking: '#3', seats: '~800' },
        { name: 'IIT Kanpur', location: 'Kanpur', ranking: '#4', seats: '~850' },
        { name: 'IIT Kharagpur', location: 'Kharagpur', ranking: '#5', seats: '~900' }
      ]
    },
    'NIT': {
      title: 'NIT (National Institutes of Technology)',
      icon: <FaUniversity />,
      fullPath: '12th (PCM) → JEE Main → CSAB Counseling → NIT Admission',
      eligibility: '75%+ in PCM, JEE Main qualified',
      seats: '~25,000 seats across all NITs',
      courses: ['B.Tech', 'M.Tech', 'MBA', 'M.Sc', 'PhD'],
      steps: [
        { step: 1, title: 'Complete 12th with PCM', description: 'Physics, Chemistry, Mathematics with 75%+', duration: '2 Years' },
        { step: 2, title: 'Prepare for JEE Main', description: 'Cover complete PCM syllabus', duration: '1-2 Years' },
        { step: 3, title: 'Appear for JEE Main', description: 'Clear JEE Main exam', duration: 'Exam' },
        { step: 4, title: 'Check Result & Rank', description: 'Check your JEE Main rank', duration: 'After Result' },
        { step: 5, title: 'CSAB Counseling', description: 'Participate in counseling', duration: 'After Result' },
        { step: 6, title: 'Get NIT Seat', description: 'Lock seat in choice filling', duration: 'Process' }
      ],
      colleges: [
        { name: 'NIT Trichy', location: 'Tiruchirappalli', ranking: '#1', seats: '~1500' },
        { name: 'NIT Surathkal', location: 'Karnataka', ranking: '#2', seats: '~1200' },
        { name: 'NIT Warangal', location: 'Telangana', ranking: '#3', seats: '~1000' },
        { name: 'NIT Calicut', location: 'Kerala', ranking: '#4', seats: '~1100' },
        { name: 'NIT Rourkela', location: 'Odisha', ranking: '#5', seats: '~900' }
      ]
    },
    'IIIT': {
      title: 'IIIT (Indian Institutes of Information Technology)',
      icon: <FaMicrochip />,
      fullPath: '12th (PCM) → JEE Main → CSAB/JoSAA → IIIT Admission',
      eligibility: '75%+ in PCM, JEE Main qualified',
      seats: '~5000 seats across all IIITs',
      courses: ['B.Tech', 'M.Tech', 'PhD'],
      steps: [
        { step: 1, title: 'Complete 12th with PCM', description: 'Physics, Chemistry, Mathematics with 75%+', duration: '2 Years' },
        { step: 2, title: 'Prepare for JEE Main', description: 'Focus on Mathematics and Physics', duration: '1-2 Years' },
        { step: 3, title: 'Appear for JEE Main', description: 'Clear JEE Main exam', duration: 'Exam' },
        { step: 4, title: 'Check Result & Rank', description: 'Check your JEE Main rank', duration: 'After Result' },
        { step: 5, title: 'Counseling', description: 'Participate in counseling', duration: 'After Result' },
        { step: 6, title: 'Get IIIT Seat', description: 'Lock seat in choice filling', duration: 'Process' }
      ],
      colleges: [
        { name: 'IIIT Hyderabad', location: 'Hyderabad', ranking: '#1', seats: '~300' },
        { name: 'IIIT Bangalore', location: 'Bangalore', ranking: '#2', seats: '~200' },
        { name: 'IIIT Delhi', location: 'Delhi', ranking: '#3', seats: '~150' },
        { name: 'IIIT Allahabad', location: 'Prayagraj', ranking: '#4', seats: '~250' },
        { name: 'IIIT Pune', location: 'Pune', ranking: '#5', seats: '~180' }
      ]
    },
    'Medical': {
      title: 'Government Medical Colleges',
      icon: <FaHeartbeat />,
      fullPath: '12th (PCB) → NEET → AIQ/State Counseling → MBBS',
      eligibility: '50%+ in PCB (GEN), NEET qualified',
      seats: '~50,000 seats (Govt + Pvt)',
      courses: ['MBBS', 'BDS', 'BAMS', 'BHMS', 'BNYS', 'BVSc', 'B.Sc Nursing'],
      steps: [
        { step: 1, title: 'Complete 12th with PCB', description: 'Physics, Chemistry, Biology', duration: '2 Years' },
        { step: 2, title: 'Prepare for NEET', description: 'Cover complete PCB syllabus', duration: '1-2 Years' },
        { step: 3, title: 'Appear for NEET', description: 'Clear NEET exam', duration: 'Exam' },
        { step: 4, title: 'Check Result', description: 'Check your NEET score and rank', duration: 'After Result' },
        { step: 5, title: 'AIQ Counseling', description: 'All India Quota counseling', duration: 'After Result' },
        { step: 6, title: 'Get Medical College', description: 'Lock seat in choice filling', duration: 'Process' }
      ],
      colleges: [
        { name: 'AIIMS Delhi', location: 'Delhi', ranking: '#1', seats: '~100' },
        { name: 'Maulana Azad Medical College', location: 'Delhi', ranking: '#2', seats: '~250' },
        { name: 'Lady Hardinge Medical College', location: 'Delhi', ranking: '#3', seats: '~200' },
        { name: 'Grant Medical College', location: 'Mumbai', ranking: '#4', seats: '~200' },
        { name: 'King George Medical University', location: 'Lucknow', ranking: '#5', seats: '~250' }
      ]
    },
    'NDA': {
      title: 'NDA (National Defence Academy)',
      icon: <FaFlag />,
      fullPath: '12th → NDA Exam → SSB Interview → Academy Training',
      eligibility: '12th Pass (Science for Army), Age 16.5-19.5 years',
      seats: '~400 seats per course',
      courses: ['B.Sc', 'B.A', 'B.Com', 'BBA'],
      steps: [
        { step: 1, title: 'Complete 12th', description: 'Pass 12th in any stream', duration: '2 Years' },
        { step: 2, title: 'Check Eligibility', description: 'Age 16.5-19.5 years', duration: 'Before Exam' },
        { step: 3, title: 'Apply for NDA', description: 'Fill NDA application form', duration: 'When Notified' },
        { step: 4, title: 'Appear for Written', description: 'Clear NDA written exam', duration: 'Exam' },
        { step: 5, title: 'SSB Interview', description: '5-day selection process', duration: 'After Result' },
        { step: 6, title: 'Training', description: '3-year training at NDA', duration: '3 Years' }
      ],
      colleges: [
        { name: 'NDA (Army)', location: 'Pune', seats: '~300' },
        { name: 'NDA (Navy)', location: 'Pune', seats: '~50' },
        { name: 'NDA (Air Force)', location: 'Pune', seats: '~50' },
        { name: 'IMA Dehradun', location: 'Dehradun', seats: '~250' },
        { name: 'AFCAT Entry', location: 'Various', seats: 'Various' }
      ]
    }
  }

  // Helper function to get stream display name
  const getStreamName = (streamId) => {
    const stream = streams.find(s => s.id === streamId)
    return stream ? getTranslation(stream.nameKey, language) : 'Unknown'
  }

  // Mapping of course names to their translation keys
  const courseTranslationMap = {
    'B.Tech (Bachelor of Technology)': 'course.btech',
    'MBBS (Bachelor of Medicine)': 'course.mbbs',
    'B.Sc (Bachelor of Science)': 'course.bsc',
    'B.Pharma (Bachelor of Pharmacy)': 'course.bpharma',
    'BDS (Bachelor of Dental Surgery)': 'course.bds',
    'B.Sc Nursing': 'course.nursing',
    'B.Sc Agriculture': 'course.agriculture',
    'B.Sc Biotechnology': 'course.biotech',
    'Diploma in Engineering': 'course.diploma_eng',
    'B.Com (Bachelor of Commerce)': 'course.bcom',
    'BBA (Bachelor of Business Administration)': 'course.bba',
    'CA (Chartered Accountancy)': 'course.ca',
    'CS (Company Secretary)': 'course.cs',
    'CMA (Cost Management Accounting)': 'course.cma',
    'BBA LLB': 'course.bballb',
    'B.Com (Hons)': 'course.bcomhons',
    'BBA (Marketing)': 'course.bbamarketing',
    'Diploma in Accounting': 'course.diploma_acc',
    'BA (Bachelor of Arts)': 'course.ba',
    'LLB (Bachelor of Laws)': 'course.llb',
    'BJMC (Journalism & Mass Communication)': 'course.bjmc',
    'B.Ed (Bachelor of Education)': 'course.bed',
    'BFA (Bachelor of Fine Arts)': 'course.bfa',
    'BSW (Bachelor of Social Work)': 'course.bsw',
    'Diploma in Journalism': 'course.diploma_jour',
    'BCA (Bachelor of Computer Applications)': 'course.bca',
    'B.Tech CSE (Computer Science)': 'course.btech_cse',
    'B.Tech IT (Information Technology)': 'course.btech_it',
    'B.Sc Computer Science': 'course.bsc_cs',
    'B.Tech AI & ML': 'course.btech_aiml',
    'B.Tech Data Science': 'course.btech_ds',
    'B.Sc IT (Information Technology)': 'course.bsc_it',
    'Diploma in Computer Engineering': 'course.diploma_comp',
    'Diploma in Computer Applications': 'course.diploma_ca'
  }

  // Helper function to get course translation key
  const getCourseName = (courseName) => {
    const key = courseTranslationMap[courseName]
    return key ? getTranslation(key, language) : courseName
  }

  // Helper function to get course description translation key
  const getCourseDescription = (courseName) => {
    const key = courseTranslationMap[courseName]
    const descKey = key ? key + 'Desc' : null
    return descKey ? getTranslation(descKey, language) : ''
  }

  // Courses based on stream and percentage
  const getCoursesByStreamAndPercentage = (stream, perc) => {
    const userPerc = Number(perc)
    
    const coursesData = {
      science: {
        high: [ // 75%+
          { 
            name: 'B.Tech (Bachelor of Technology)', 
            duration: '4 Years', 
            icon: <FaCog />, 
            description: 'Engineering degree in various specializations', 
            careers: ['Software Engineer', 'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer'],
            careerPaths: [
              { path: 'B.Tech → Software Engineer', steps: ['Complete B.Tech in CS/IT', 'Learn programming languages', 'Build projects', 'Apply for software jobs', 'Grow to senior roles'], salary: '₹6-25 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' },
              { path: 'B.Tech → MBA → Manager', steps: ['Complete B.Tech', 'Work for 2-3 years', 'Pursue MBA', 'Get management role', 'Grow to leadership'], salary: '₹10-40 LPA', growth: 'Engineer → Manager → Director' },
              { path: 'B.Tech → M.Tech → Researcher', steps: ['Complete B.Tech', 'Pursue M.Tech', 'Specialize in research area', 'Join research organization', 'Become research scientist'], salary: '₹8-20 LPA', growth: 'Research Associate → Scientist → Principal Scientist' }
            ]
          },
          { 
            name: 'MBBS (Bachelor of Medicine)', 
            duration: '5.5 Years', 
            icon: <FaHospital />, 
            description: 'Medical degree to become a doctor', 
            careers: ['Doctor', 'Surgeon', 'Medical Officer', 'Specialist'],
            careerPaths: [
              { path: 'MBBS → MD → Specialist', steps: ['Complete MBBS', 'Intern for 1 year', 'Clear NEET PG', 'Pursue MD/MS (3 years)', 'Become specialist doctor'], salary: '₹10-50 LPA', growth: 'Junior Doctor → Senior Doctor → Head of Department' },
              { path: 'MBBS → Government Doctor', steps: ['Complete MBBS', 'Clear UPSC CMS exam', 'Join government hospital', 'Serve as medical officer', 'Promote to senior positions'], salary: '₹8-20 LPA', growth: 'Medical Officer → Senior MO → Director' }
            ]
          },

          { 
            name: 'B.Sc (Bachelor of Science)', 
            duration: '3 Years', 
            icon: <FaFlask />, 
            description: 'Science degree in various subjects', 
            careers: ['Scientist', 'Researcher', 'Lab Technician', 'Teacher'],
            careerPaths: [
              { path: 'B.Sc → M.Sc → Scientist', steps: ['Complete B.Sc', 'Pursue M.Sc', 'Clear NET/SET', 'Join research lab', 'Become scientist'], salary: '₹6-15 LPA', growth: 'Research Associate → Scientist → Senior Scientist' },
              { path: 'B.Sc → B.Ed → Teacher', steps: ['Complete B.Sc', 'Pursue B.Ed', 'Clear TET exam', 'Join school', 'Grow to principal'], salary: '₹4-10 LPA', growth: 'Teacher → Senior Teacher → Principal' }
            ]
          },

          { 
            name: 'B.Pharma (Bachelor of Pharmacy)', 
            duration: '4 Years', 
            icon: <FaLaptopMedical />, 
            description: 'Pharmacy degree for drug manufacturing', 
            careers: ['Pharmacist', 'Medical Representative', 'Drug Inspector'],
            careerPaths: [
              { path: 'B.Pharma → Pharmacist', steps: ['Complete B.Pharma', 'Register with Pharmacy Council', 'Join hospital/retail pharmacy', 'Manage pharmacy operations', 'Open own pharmacy'], salary: '₹4-12 LPA', growth: 'Pharmacist → Senior Pharmacist → Pharmacy Manager' },
              { path: 'B.Pharma → M.Pharma → Researcher', steps: ['Complete B.Pharma', 'Pursue M.Pharma', 'Join pharmaceutical company', 'Work in R&D', 'Become research head'], salary: '₹6-20 LPA', growth: 'Research Associate → Scientist → R&D Head' }
            ]
          },
          { 
            name: 'BDS (Bachelor of Dental Surgery)', 
            duration: '5 Years', 
            icon: <FaHospital />, 
            description: 'Dental degree for dental care', 
            careers: ['Dentist', 'Dental Surgeon', 'Orthodontist'],
            careerPaths: [
              { path: 'BDS → MDS → Specialist', steps: ['Complete BDS', 'Practice for 2-3 years', 'Pursue MDS (3 years)', 'Specialize in orthodontics', 'Open dental clinic'], salary: '₹8-30 LPA', growth: 'Dentist → Specialist → Head of Department' }
            ]
          },
          { 
            name: 'B.Sc Nursing', 
            duration: '4 Years', 
            icon: <FaHeartbeat />, 
            description: 'Nursing degree for healthcare', 
            careers: ['Nurse', 'Nursing Officer', 'Healthcare Administrator'],
            careerPaths: [
              { path: 'B.Sc Nursing → Staff Nurse', steps: ['Complete B.Sc Nursing', 'Register with Nursing Council', 'Join hospital', 'Work as staff nurse', 'Promote to senior nurse'], salary: '₹3-8 LPA', growth: 'Staff Nurse → Senior Nurse → Nursing Superintendent' }
            ]
          }
        ],
        medium: [ // 60-74%
          { 
            name: 'B.Sc (Bachelor of Science)', 
            duration: '3 Years', 
            icon: <FaFlask />, 
            description: 'Science degree in various subjects', 
            careers: ['Scientist', 'Researcher', 'Lab Technician', 'Teacher'],
            careerPaths: [
              { path: 'B.Sc → M.Sc → Scientist', steps: ['Complete B.Sc', 'Pursue M.Sc', 'Clear NET/SET', 'Join research lab', 'Become scientist'], salary: '₹6-15 LPA', growth: 'Research Associate → Scientist → Senior Scientist' },
              { path: 'B.Sc → B.Ed → Teacher', steps: ['Complete B.Sc', 'Pursue B.Ed', 'Clear TET exam', 'Join school', 'Grow to principal'], salary: '₹4-10 LPA', growth: 'Teacher → Senior Teacher → Principal' }
            ]
          },
          { 
            name: 'B.Pharma (Bachelor of Pharmacy)', 
            duration: '4 Years', 
            icon: <FaLaptopMedical />, 
            description: 'Pharmacy degree for drug manufacturing', 
            careers: ['Pharmacist', 'Medical Representative', 'Drug Inspector'],
            careerPaths: [
              { path: 'B.Pharma → Pharmacist', steps: ['Complete B.Pharma', 'Register with Pharmacy Council', 'Join hospital/retail pharmacy', 'Manage pharmacy operations', 'Open own pharmacy'], salary: '₹4-12 LPA', growth: 'Pharmacist → Senior Pharmacist → Pharmacy Manager' },
              { path: 'B.Pharma → M.Pharma → Researcher', steps: ['Complete B.Pharma', 'Pursue M.Pharma', 'Join pharmaceutical company', 'Work in R&D', 'Become research head'], salary: '₹6-20 LPA', growth: 'Research Associate → Scientist → R&D Head' }
            ]
          },
          { 
            name: 'B.Sc Nursing', 
            duration: '4 Years', 
            icon: <FaHeartbeat />, 
            description: 'Nursing degree for healthcare', 
            careers: ['Nurse', 'Nursing Officer', 'Healthcare Administrator'],
            careerPaths: [
              { path: 'B.Sc Nursing → Staff Nurse', steps: ['Complete B.Sc Nursing', 'Register with Nursing Council', 'Join hospital', 'Work as staff nurse', 'Promote to senior nurse'], salary: '₹3-8 LPA', growth: 'Staff Nurse → Senior Nurse → Nursing Superintendent' }
            ]
          },
          { 
            name: 'B.Sc Agriculture', 
            duration: '4 Years', 
            icon: <FaSeedling />, 
            description: 'Agriculture and farming science', 
            careers: ['Agricultural Officer', 'Farm Manager', 'Agricultural Scientist'],
            careerPaths: [
              { path: 'B.Sc Agriculture → Agricultural Officer', steps: ['Complete B.Sc Agriculture', 'Clear ICAR exam', 'Join government agriculture department', 'Work as agricultural officer', 'Promote to senior positions'], salary: '₹4-12 LPA', growth: 'Officer → Senior Officer → Director' }
            ]
          },
          { 
            name: 'B.Sc Biotechnology', 
            duration: '3 Years', 
            icon: <FaDna />, 
            description: 'Biological technology and research', 
            careers: ['Biotechnologist', 'Research Scientist', 'Lab Technician'],
            careerPaths: [
              { path: 'B.Sc Biotech → Research Scientist', steps: ['Complete B.Sc Biotechnology', 'Pursue M.Sc Biotechnology', 'Join research lab', 'Work on research projects', 'Become research scientist'], salary: '₹5-15 LPA', growth: 'Research Associate → Scientist → Senior Scientist' }
            ]
          }
        ],
        low: [ // Below 60%
          { 
            name: 'B.Sc (Bachelor of Science)', 
            duration: '3 Years', 
            icon: <FaFlask />, 
            description: 'Science degree in various subjects', 
            careers: ['Scientist', 'Researcher', 'Lab Technician', 'Teacher'],
            careerPaths: [
              { path: 'B.Sc → M.Sc → Scientist', steps: ['Complete B.Sc', 'Pursue M.Sc', 'Clear NET/SET', 'Join research lab', 'Become scientist'], salary: '₹6-15 LPA', growth: 'Research Associate → Scientist → Senior Scientist' },
              { path: 'B.Sc → B.Ed → Teacher', steps: ['Complete B.Sc', 'Pursue B.Ed', 'Clear TET exam', 'Join school', 'Grow to principal'], salary: '₹4-10 LPA', growth: 'Teacher → Senior Teacher → Principal' }
            ]
          },
          { 
            name: 'B.Sc Nursing', 
            duration: '4 Years', 
            icon: <FaHeartbeat />, 
            description: 'Nursing degree for healthcare', 
            careers: ['Nurse', 'Nursing Officer', 'Healthcare Administrator'],
            careerPaths: [
              { path: 'B.Sc Nursing → Staff Nurse', steps: ['Complete B.Sc Nursing', 'Register with Nursing Council', 'Join hospital', 'Work as staff nurse', 'Promote to senior nurse'], salary: '₹3-8 LPA', growth: 'Staff Nurse → Senior Nurse → Nursing Superintendent' }
            ]
          },
          { 
            name: 'B.Sc Agriculture', 
            duration: '4 Years', 
            icon: <FaSeedling />, 
            description: 'Agriculture and farming science', 
            careers: ['Agricultural Officer', 'Farm Manager', 'Agricultural Scientist'],
            careerPaths: [
              { path: 'B.Sc Agriculture → Agricultural Officer', steps: ['Complete B.Sc Agriculture', 'Clear ICAR exam', 'Join government agriculture department', 'Work as agricultural officer', 'Promote to senior positions'], salary: '₹4-12 LPA', growth: 'Officer → Senior Officer → Director' }
            ]
          },
          { 
            name: 'Diploma in Engineering', 
            duration: '3 Years', 
            icon: <FaTools />, 
            description: 'Engineering diploma courses', 
            careers: ['Technician', 'Supervisor', 'Junior Engineer'],
            careerPaths: [
              { path: 'Diploma → Junior Engineer', steps: ['Complete Diploma in Engineering', 'Join manufacturing company', 'Work as technician', 'Gain experience', 'Promote to supervisor'], salary: '₹3-8 LPA', growth: 'Technician → Supervisor → Manager' }
            ]
          }
        ]
      },
      
      commerce: {
        high: [ // 75%+
          { 
            name: 'B.Com (Bachelor of Commerce)', 
            duration: '3 Years', 
            icon: <FaBriefcase />, 
            description: 'Commerce degree for business and finance', 
            careers: ['Accountant', 'Financial Analyst', 'Tax Consultant'],
            careerPaths: [
              { path: 'B.Com → M.Com → Professor', steps: ['Complete B.Com', 'Pursue M.Com', 'Clear NET/SET', 'Pursue PhD', 'Join college as professor'], salary: '₹6-15 LPA', growth: 'Assistant Professor → Professor → Dean' },
              { path: 'B.Com → CA → Chartered Accountant', steps: ['Complete B.Com', 'Register for CA', 'Clear IPCC', 'Complete articleship', 'Clear CA Final'], salary: '₹8-30 LPA', growth: 'Junior CA → Senior CA → Partner' },
              { path: 'B.Com → MBA → Finance Manager', steps: ['Complete B.Com', 'Pursue MBA Finance', 'Get placement in company', 'Work as financial analyst', 'Promote to finance manager'], salary: '₹6-25 LPA', growth: 'Analyst → Manager → CFO' }
            ]
          },
          { 
            name: 'BBA (Bachelor of Business Administration)', 
            duration: '3 Years', 
            icon: <FaUserTie />, 
            description: 'Business administration degree', 
            careers: ['Manager', 'Business Analyst', 'HR Manager'],
            careerPaths: [
              { path: 'BBA → MBA → Manager', steps: ['Complete BBA', 'Pursue MBA (2 years)', 'Specialize in HR/Marketing', 'Get placement', 'Grow to management roles'], salary: '₹6-25 LPA', growth: 'Executive → Manager → Director' },
              { path: 'BBA → Entrepreneur', steps: ['Complete BBA', 'Identify business opportunity', 'Start own business', 'Scale operations', 'Build successful company'], salary: 'Variable', growth: 'Startup → Established Business → Industry Leader' }
            ]
          },
          { 
            name: 'CA (Chartered Accountancy)', 
            duration: '4-5 Years', 
            icon: <FaBalanceScale />, 
            description: 'Professional accounting qualification', 
            careers: ['Chartered Accountant', 'Auditor', 'Financial Advisor'],
            careerPaths: [
              { path: 'CA → Practice → Senior CA', steps: ['Complete CA', 'Join CA firm', 'Handle client accounts', 'Build expertise', 'Start own practice'], salary: '₹8-50 LPA', growth: 'Junior CA → Senior CA → Partner' },
              { path: 'CA → CFO', steps: ['Complete CA', 'Join corporate', 'Work in finance department', 'Become finance manager', 'Promote to CFO'], salary: '₹15-60 LPA', growth: 'Accountant → Finance Manager → CFO' }
            ]
          },
          { 
            name: 'CS (Company Secretary)', 
            duration: '3-4 Years', 
            icon: <FaBuilding />, 
            description: 'Corporate governance professional', 
            careers: ['Company Secretary', 'Compliance Officer', 'Legal Advisor'],
            careerPaths: [
              { path: 'CS → Practice → Senior CS', steps: ['Complete CS', 'Register with ICSI', 'Join company', 'Handle compliance', 'Become senior CS'], salary: '₹6-25 LPA', growth: 'Junior CS → Senior CS → Partner' }
            ]
          },
          { 
            name: 'CMA (Cost Management Accounting)', 
            duration: '3-4 Years', 
            icon: <FaChartBar />, 
            description: 'Cost and management accounting', 
            careers: ['Cost Accountant', 'Financial Controller', 'Management Accountant'],
            careerPaths: [
              { path: 'CMA → Cost Accountant', steps: ['Complete CMA', 'Join manufacturing company', 'Handle cost accounting', 'Optimize costs', 'Become cost controller'], salary: '₹6-20 LPA', growth: 'Cost Accountant → Senior CA → Finance Director' }
            ]
          },
          { 
            name: 'BBA LLB', 
            duration: '5 Years', 
            icon: <FaBalanceScale />, 
            description: 'Integrated business and law degree', 
            careers: ['Corporate Lawyer', 'Legal Advisor', 'Business Consultant'],
            careerPaths: [
              { path: 'BBA LLB → Corporate Lawyer', steps: ['Complete BBA LLB', 'Enroll with Bar Council', 'Join law firm', 'Specialize in corporate law', 'Become partner'], salary: '₹8-40 LPA', growth: 'Associate → Senior Associate → Partner' }
            ]
          }
        ],
        medium: [ // 60-74%
          { 
            name: 'B.Com (Bachelor of Commerce)', 
            duration: '3 Years', 
            icon: <FaBriefcase />, 
            description: 'Commerce degree for business and finance', 
            careers: ['Accountant', 'Financial Analyst', 'Tax Consultant'],
            careerPaths: [
              { path: 'B.Com → M.Com → Professor', steps: ['Complete B.Com', 'Pursue M.Com', 'Clear NET/SET', 'Pursue PhD', 'Join college as professor'], salary: '₹6-15 LPA', growth: 'Assistant Professor → Professor → Dean' },
              { path: 'B.Com → CA → Chartered Accountant', steps: ['Complete B.Com', 'Register for CA', 'Clear IPCC', 'Complete articleship', 'Clear CA Final'], salary: '₹8-30 LPA', growth: 'Junior CA → Senior CA → Partner' },
              { path: 'B.Com → MBA → Finance Manager', steps: ['Complete B.Com', 'Pursue MBA Finance', 'Get placement in company', 'Work as financial analyst', 'Promote to finance manager'], salary: '₹6-25 LPA', growth: 'Analyst → Manager → CFO' }
            ]
          },
          { 
            name: 'BBA (Bachelor of Business Administration)', 
            duration: '3 Years', 
            icon: <FaUserTie />, 
            description: 'Business administration degree', 
            careers: ['Manager', 'Business Analyst', 'HR Manager'],
            careerPaths: [
              { path: 'BBA → MBA → Manager', steps: ['Complete BBA', 'Pursue MBA (2 years)', 'Specialize in HR/Marketing', 'Get placement', 'Grow to management roles'], salary: '₹6-25 LPA', growth: 'Executive → Manager → Director' },
              { path: 'BBA → Entrepreneur', steps: ['Complete BBA', 'Identify business opportunity', 'Start own business', 'Scale operations', 'Build successful company'], salary: 'Variable', growth: 'Startup → Established Business → Industry Leader' }
            ]
          },
          { 
            name: 'B.Com (Hons)', 
            duration: '3 Years', 
            icon: <FaBriefcase />, 
            description: 'Honors commerce degree', 
            careers: ['Accountant', 'Financial Analyst', 'Banker'],
            careerPaths: [
              { path: 'B.Com Hons → Banker', steps: ['Complete B.Com Hons', 'Clear bank exams', 'Join bank as officer', 'Handle banking operations', 'Promote to manager'], salary: '₹4-12 LPA', growth: 'Officer → Manager → Branch Manager' }
            ]
          },
          { 
            name: 'BBA (Marketing)', 
            duration: '3 Years', 
            icon: <FaChartLine />, 
            description: 'Marketing specialization', 
            careers: ['Marketing Manager', 'Sales Manager', 'Brand Manager'],
            careerPaths: [
              { path: 'BBA Marketing → Marketing Manager', steps: ['Complete BBA Marketing', 'Join company as marketing executive', 'Handle marketing campaigns', 'Build brand strategy', 'Become marketing manager'], salary: '₹5-20 LPA', growth: 'Executive → Manager → Director' }
            ]
          }
        ],
        low: [ // Below 60%
          { 
            name: 'B.Com (Bachelor of Commerce)', 
            duration: '3 Years', 
            icon: <FaBriefcase />, 
            description: 'Commerce degree for business and finance', 
            careers: ['Accountant', 'Financial Analyst', 'Tax Consultant'],
            careerPaths: [
              { path: 'B.Com → M.Com → Professor', steps: ['Complete B.Com', 'Pursue M.Com', 'Clear NET/SET', 'Pursue PhD', 'Join college as professor'], salary: '₹6-15 LPA', growth: 'Assistant Professor → Professor → Dean' },
              { path: 'B.Com → CA → Chartered Accountant', steps: ['Complete B.Com', 'Register for CA', 'Clear IPCC', 'Complete articleship', 'Clear CA Final'], salary: '₹8-30 LPA', growth: 'Junior CA → Senior CA → Partner' },
              { path: 'B.Com → MBA → Finance Manager', steps: ['Complete B.Com', 'Pursue MBA Finance', 'Get placement in company', 'Work as financial analyst', 'Promote to finance manager'], salary: '₹6-25 LPA', growth: 'Analyst → Manager → CFO' }
            ]
          },
          { 
            name: 'BBA (Bachelor of Business Administration)', 
            duration: '3 Years', 
            icon: <FaUserTie />, 
            description: 'Business administration degree', 
            careers: ['Manager', 'Business Analyst', 'HR Manager'],
            careerPaths: [
              { path: 'BBA → MBA → Manager', steps: ['Complete BBA', 'Pursue MBA (2 years)', 'Specialize in HR/Marketing', 'Get placement', 'Grow to management roles'], salary: '₹6-25 LPA', growth: 'Executive → Manager → Director' },
              { path: 'BBA → Entrepreneur', steps: ['Complete BBA', 'Identify business opportunity', 'Start own business', 'Scale operations', 'Build successful company'], salary: 'Variable', growth: 'Startup → Established Business → Industry Leader' }
            ]
          },
          { 
            name: 'Diploma in Accounting', 
            duration: '1-2 Years', 
            icon: <FaChartBar />, 
            description: 'Accounting and bookkeeping', 
            careers: ['Accountant', 'Bookkeeper', 'Accounts Assistant'],
            careerPaths: [
              { path: 'Diploma → Accountant', steps: ['Complete Diploma in Accounting', 'Learn accounting software', 'Join company as accounts assistant', 'Handle bookkeeping', 'Promote to accountant'], salary: '₹2-6 LPA', growth: 'Assistant → Accountant → Senior Accountant' }
            ]
          }
        ]
      },
      arts: {
        high: [ // 75%+
          { 
            name: 'BA (Bachelor of Arts)', 
            duration: '3 Years', 
            icon: <FaBook />, 
            description: 'Arts degree in various humanities subjects', 
            careers: ['Teacher', 'Writer', 'Content Creator', 'Journalist'],
            careerPaths: [
              { path: 'BA → B.Ed → Teacher', steps: ['Complete BA in your subject', 'Pursue B.Ed (2 years)', 'Clear CTET/TET exam', 'Apply for teaching positions'], salary: '₹3-8 LPA', growth: 'Senior Teacher → Head of Department → Principal' },
              { path: 'BA → MA → Professor', steps: ['Complete BA', 'Pursue MA in specialization', 'Clear NET/SET exam', 'Pursue PhD', 'Apply for Assistant Professor'], salary: '₹6-15 LPA', growth: 'Assistant Professor → Associate Professor → Professor' },
              { path: 'BA → LLB → Lawyer', steps: ['Complete BA', 'Pursue LLB (3 years)', 'Enroll with Bar Council', 'Practice under senior lawyer', 'Start independent practice'], salary: '₹4-20 LPA', growth: 'Junior Lawyer → Senior Lawyer → Judge' },
              { path: 'BA → BJMC → Journalist', steps: ['Complete BA', 'Pursue BJMC (3 years)', 'Intern with media house', 'Work as reporter', 'Become senior journalist'], salary: '₹3-12 LPA', growth: 'Reporter → Senior Journalist → Editor' },
              { path: 'BA → MBA → Manager', steps: ['Complete BA', 'Pursue MBA (2 years)', 'Specialize in HR/Marketing', 'Get placement in company', 'Grow to management roles'], salary: '₹6-25 LPA', growth: 'Executive → Manager → Director' }
            ]
          },
          { 
            name: 'LLB (Bachelor of Laws)', 
            duration: '3 Years', 
            icon: <FaBalanceScale />, 
            description: 'Law degree for legal practice', 
            careers: ['Lawyer', 'Legal Advisor', 'Judge', 'Legal Consultant'],
            careerPaths: [
              { path: 'LLB → Practice → Senior Advocate', steps: ['Complete LLB', 'Enroll with Bar Council', 'Practice under senior lawyer', 'Build client base', 'Become senior advocate'], salary: '₹5-50 LPA', growth: 'Junior Lawyer → Senior Lawyer → Senior Advocate' },
              { path: 'LLB → LLM → Corporate Lawyer', steps: ['Complete LLB', 'Pursue LLM (2 years)', 'Specialize in corporate law', 'Join law firm', 'Become partner'], salary: '₹8-40 LPA', growth: 'Associate → Senior Associate → Partner' },
              { path: 'LLB → Judiciary → Judge', steps: ['Complete LLB', 'Practice for 7+ years', 'Clear Judicial Services exam', 'Become Magistrate', 'Promote to Judge'], salary: '₹10-25 LPA', growth: 'Magistrate → District Judge → High Court Judge' }
            ]
          },
          { 
            name: 'BJMC (Journalism & Mass Communication)', 
            duration: '3 Years', 
            icon: <FaNewspaper />, 
            description: 'Journalism and media studies', 
            careers: ['Journalist', 'News Anchor', 'Content Writer', 'PR Manager'],
            careerPaths: [
              { path: 'BJMC → Reporter → News Anchor', steps: ['Complete BJMC', 'Intern with news channel', 'Work as reporter', 'Develop on-screen presence', 'Become news anchor'], salary: '₹4-20 LPA', growth: 'Reporter → Senior Reporter → News Anchor' },
              { path: 'BJMC → Content Writer → Editor', steps: ['Complete BJMC', 'Start as content writer', 'Work for publications', 'Become senior writer', 'Promote to editor'], salary: '₹3-15 LPA', growth: 'Writer → Senior Writer → Editor' },
              { path: 'BJMC → PR Executive → PR Manager', steps: ['Complete BJMC', 'Join PR agency', 'Handle client accounts', 'Build media relations', 'Become PR manager'], salary: '₹4-18 LPA', growth: 'Executive → Manager → Director' }
            ]
          },
          { 
            name: 'B.Ed (Bachelor of Education)', 
            duration: '2 Years', 
            icon: <FaChalkboardTeacher />, 
            description: 'Teaching degree for educators', 
            careers: ['Teacher', 'Principal', 'Education Counselor'],
            careerPaths: [
              { path: 'B.Ed → TET → Government Teacher', steps: ['Complete B.Ed', 'Clear CTET/TET exam', 'Apply for government schools', 'Get selected', 'Grow to senior positions'], salary: '₹4-10 LPA', growth: 'Teacher → Senior Teacher → Headmaster' },
              { path: 'B.Ed → MA → Professor', steps: ['Complete B.Ed', 'Pursue MA in subject', 'Clear NET/SET', 'Pursue PhD', 'Join college as professor'], salary: '₹6-15 LPA', growth: 'Assistant Professor → Professor → Dean' }
            ]
          },
          { 
            name: 'BFA (Bachelor of Fine Arts)', 
            duration: '4 Years', 
            icon: <FaPaintBrush />, 
            description: 'Fine arts and visual arts degree', 
            careers: ['Artist', 'Designer', 'Animator', 'Art Director'],
            careerPaths: [
              { path: 'BFA → Freelance Artist', steps: ['Complete BFA', 'Build portfolio', 'Exhibit work in galleries', 'Sell artwork', 'Build reputation'], salary: '₹3-20 LPA', growth: 'Emerging Artist → Established Artist → Master Artist' },
              { path: 'BFA → Graphic Designer → Art Director', steps: ['Complete BFA', 'Learn design software', 'Work as junior designer', 'Become senior designer', 'Promote to art director'], salary: '₹4-18 LPA', growth: 'Junior Designer → Senior Designer → Art Director' }
            ]
          },
          { 
            name: 'BSW (Bachelor of Social Work)', 
            duration: '3 Years', 
            icon: <FaHeartbeat />, 
            description: 'Social work and community service', 
            careers: ['Social Worker', 'Counselor', 'NGO Worker'],
            careerPaths: [
              { path: 'BSW → MSW → Social Worker', steps: ['Complete BSW', 'Pursue MSW (2 years)', 'Specialize in community work', 'Join NGO', 'Lead social programs'], salary: '₹3-10 LPA', growth: 'Worker → Program Manager → Director' }
            ]
          }
        ],
        medium: [ // 60-74%
          { 
            name: 'BA (Bachelor of Arts)', 
            duration: '3 Years', 
            icon: <FaBook />, 
            description: 'Arts degree in various humanities subjects', 
            careers: ['Teacher', 'Writer', 'Content Creator', 'Journalist'],
            careerPaths: [
              { path: 'BA → B.Ed → Teacher', steps: ['Complete BA in your subject', 'Pursue B.Ed (2 years)', 'Clear CTET/TET exam', 'Apply for teaching positions'], salary: '₹3-8 LPA', growth: 'Senior Teacher → Head of Department → Principal' },
              { path: 'BA → MA → Professor', steps: ['Complete BA', 'Pursue MA in specialization', 'Clear NET/SET exam', 'Pursue PhD', 'Apply for Assistant Professor'], salary: '₹6-15 LPA', growth: 'Assistant Professor → Associate Professor → Professor' },
              { path: 'BA → LLB → Lawyer', steps: ['Complete BA', 'Pursue LLB (3 years)', 'Enroll with Bar Council', 'Practice under senior lawyer', 'Start independent practice'], salary: '₹4-20 LPA', growth: 'Junior Lawyer → Senior Lawyer → Judge' },
              { path: 'BA → BJMC → Journalist', steps: ['Complete BA', 'Pursue BJMC (3 years)', 'Intern with media house', 'Work as reporter', 'Become senior journalist'], salary: '₹3-12 LPA', growth: 'Reporter → Senior Journalist → Editor' },
              { path: 'BA → MBA → Manager', steps: ['Complete BA', 'Pursue MBA (2 years)', 'Specialize in HR/Marketing', 'Get placement in company', 'Grow to management roles'], salary: '₹6-25 LPA', growth: 'Executive → Manager → Director' }
            ]
          },
          { 
            name: 'BJMC (Journalism & Mass Communication)', 
            duration: '3 Years', 
            icon: <FaNewspaper />, 
            description: 'Journalism and media studies', 
            careers: ['Journalist', 'News Anchor', 'Content Writer', 'PR Manager'],
            careerPaths: [
              { path: 'BJMC → Reporter → News Anchor', steps: ['Complete BJMC', 'Intern with news channel', 'Work as reporter', 'Develop on-screen presence', 'Become news anchor'], salary: '₹4-20 LPA', growth: 'Reporter → Senior Reporter → News Anchor' },
              { path: 'BJMC → Content Writer → Editor', steps: ['Complete BJMC', 'Start as content writer', 'Work for publications', 'Become senior writer', 'Promote to editor'], salary: '₹3-15 LPA', growth: 'Writer → Senior Writer → Editor' },
              { path: 'BJMC → PR Executive → PR Manager', steps: ['Complete BJMC', 'Join PR agency', 'Handle client accounts', 'Build media relations', 'Become PR manager'], salary: '₹4-18 LPA', growth: 'Executive → Manager → Director' }
            ]
          },
          { 
            name: 'B.Ed (Bachelor of Education)', 
            duration: '2 Years', 
            icon: <FaChalkboardTeacher />, 
            description: 'Teaching degree for educators', 
            careers: ['Teacher', 'Principal', 'Education Counselor'],
            careerPaths: [
              { path: 'B.Ed → TET → Government Teacher', steps: ['Complete B.Ed', 'Clear CTET/TET exam', 'Apply for government schools', 'Get selected', 'Grow to senior positions'], salary: '₹4-10 LPA', growth: 'Teacher → Senior Teacher → Headmaster' },
              { path: 'B.Ed → MA → Professor', steps: ['Complete B.Ed', 'Pursue MA in subject', 'Clear NET/SET', 'Pursue PhD', 'Join college as professor'], salary: '₹6-15 LPA', growth: 'Assistant Professor → Professor → Dean' }
            ]
          },
          { 
            name: 'BSW (Bachelor of Social Work)', 
            duration: '3 Years', 
            icon: <FaHeartbeat />, 
            description: 'Social work and community service', 
            careers: ['Social Worker', 'Counselor', 'NGO Worker'],
            careerPaths: [
              { path: 'BSW → MSW → Social Worker', steps: ['Complete BSW', 'Pursue MSW (2 years)', 'Specialize in community work', 'Join NGO', 'Lead social programs'], salary: '₹3-10 LPA', growth: 'Worker → Program Manager → Director' }
            ]
          }
        ],
        low: [ // Below 60%
          { 
            name: 'BA (Bachelor of Arts)', 
            duration: '3 Years', 
            icon: <FaBook />, 
            description: 'Arts degree in various humanities subjects', 
            careers: ['Teacher', 'Writer', 'Content Creator', 'Journalist'],
            careerPaths: [
              { path: 'BA → B.Ed → Teacher', steps: ['Complete BA in your subject', 'Pursue B.Ed (2 years)', 'Clear CTET/TET exam', 'Apply for teaching positions'], salary: '₹3-8 LPA', growth: 'Senior Teacher → Head of Department → Principal' },
              { path: 'BA → MA → Professor', steps: ['Complete BA', 'Pursue MA in specialization', 'Clear NET/SET exam', 'Pursue PhD', 'Apply for Assistant Professor'], salary: '₹6-15 LPA', growth: 'Assistant Professor → Associate Professor → Professor' },
              { path: 'BA → LLB → Lawyer', steps: ['Complete BA', 'Pursue LLB (3 years)', 'Enroll with Bar Council', 'Practice under senior lawyer', 'Start independent practice'], salary: '₹4-20 LPA', growth: 'Junior Lawyer → Senior Lawyer → Judge' },
              { path: 'BA → BJMC → Journalist', steps: ['Complete BA', 'Pursue BJMC (3 years)', 'Intern with media house', 'Work as reporter', 'Become senior journalist'], salary: '₹3-12 LPA', growth: 'Reporter → Senior Journalist → Editor' },
              { path: 'BA → MBA → Manager', steps: ['Complete BA', 'Pursue MBA (2 years)', 'Specialize in HR/Marketing', 'Get placement in company', 'Grow to management roles'], salary: '₹6-25 LPA', growth: 'Executive → Manager → Director' }
            ]
          },
          { 
            name: 'B.Ed (Bachelor of Education)', 
            duration: '2 Years', 
            icon: <FaChalkboardTeacher />, 
            description: 'Teaching degree for educators', 
            careers: ['Teacher', 'Principal', 'Education Counselor'],
            careerPaths: [
              { path: 'B.Ed → TET → Government Teacher', steps: ['Complete B.Ed', 'Clear CTET/TET exam', 'Apply for government schools', 'Get selected', 'Grow to senior positions'], salary: '₹4-10 LPA', growth: 'Teacher → Senior Teacher → Headmaster' },
              { path: 'B.Ed → MA → Professor', steps: ['Complete B.Ed', 'Pursue MA in subject', 'Clear NET/SET', 'Pursue PhD', 'Join college as professor'], salary: '₹6-15 LPA', growth: 'Assistant Professor → Professor → Dean' }
            ]
          },
          { 
            name: 'Diploma in Journalism', 
            duration: '1-2 Years', 
            icon: <FaNewspaper />, 
            description: 'Journalism and media', 
            careers: ['Reporter', 'Content Writer', 'Media Assistant'],
            careerPaths: [
              { path: 'Diploma → Reporter', steps: ['Complete Diploma in Journalism', 'Intern with local newspaper', 'Work as junior reporter', 'Cover local news', 'Become senior reporter'], salary: '₹2-8 LPA', growth: 'Junior Reporter → Reporter → Senior Reporter' }
            ]
          }
        ]
      },
      computer: {
        high: [ // 75%+
          { 
            name: 'BCA (Bachelor of Computer Applications)', 
            duration: '3 Years', 
            icon: <FaLaptopMedical />, 
            description: 'Computer applications and programming', 
            careers: ['Software Developer', 'Web Developer', 'System Administrator'],
            careerPaths: [
              { path: 'BCA → MCA → Software Developer', steps: ['Complete BCA', 'Pursue MCA (3 years)', 'Learn programming languages', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' },
              { path: 'BCA → Web Developer', steps: ['Complete BCA', 'Learn web technologies', 'Build portfolio', 'Freelance or join company', 'Grow to senior roles'], salary: '₹3-12 LPA', growth: 'Junior Developer → Senior Developer → Project Manager' }
            ]
          },
          { 
            name: 'B.Tech CSE (Computer Science)', 
            duration: '4 Years', 
            icon: <FaMicrochip />, 
            description: 'Computer science engineering', 
            careers: ['Software Engineer', 'Data Scientist', 'AI Engineer'],
            careerPaths: [
              { path: 'B.Tech → Software Engineer', steps: ['Complete B.Tech CSE', 'Learn programming', 'Build projects', 'Apply for software jobs', 'Grow to senior roles'], salary: '₹6-25 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' },
              { path: 'B.Tech → MBA → Manager', steps: ['Complete B.Tech', 'Work for 2-3 years', 'Pursue MBA', 'Get management role', 'Grow to leadership'], salary: '₹10-40 LPA', growth: 'Engineer → Manager → Director' }
            ]
          },
          { 
            name: 'B.Tech IT (Information Technology)', 
            duration: '4 Years', 
            icon: <FaNetworkWired />, 
            description: 'Information technology engineering', 
            careers: ['IT Manager', 'Network Engineer', 'System Analyst'],
            careerPaths: [
              { path: 'B.Tech IT → IT Manager', steps: ['Complete B.Tech IT', 'Join IT company', 'Handle IT operations', 'Manage IT team', 'Become IT manager'], salary: '₹6-25 LPA', growth: 'IT Executive → IT Manager → CTO' }
            ]
          },
          { 
            name: 'B.Sc Computer Science', 
            duration: '3 Years', 
            icon: <FaCode />, 
            description: 'Science degree in computer science', 
            careers: ['Software Developer', 'Web Developer', 'IT Consultant'],
            careerPaths: [
              { path: 'B.Sc CS → M.Sc CS → Software Developer', steps: ['Complete B.Sc CS', 'Pursue M.Sc CS', 'Learn programming', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }
            ]
          },
          { 
            name: 'B.Tech AI & ML', 
            duration: '4 Years', 
            icon: <FaRobot />, 
            description: 'Artificial intelligence and machine learning', 
            careers: ['AI Engineer', 'ML Engineer', 'Data Scientist'],
            careerPaths: [
              { path: 'B.Tech AI → AI Engineer', steps: ['Complete B.Tech AI & ML', 'Learn AI/ML frameworks', 'Build AI projects', 'Apply for AI jobs', 'Grow to senior AI roles'], salary: '₹8-30 LPA', growth: 'AI Developer → AI Engineer → AI Architect' }
            ]
          },
          { 
            name: 'B.Tech Data Science', 
            duration: '4 Years', 
            icon: <FaDatabase />, 
            description: 'Data science and analytics', 
            careers: ['Data Scientist', 'Data Analyst', 'Business Analyst'],
            careerPaths: [
              { path: 'B.Tech DS → Data Scientist', steps: ['Complete B.Tech Data Science', 'Learn data analytics tools', 'Build data projects', 'Apply for data jobs', 'Grow to senior data roles'], salary: '₹8-30 LPA', growth: 'Data Analyst → Data Scientist → Chief Data Officer' }
            ]
          }
        ],
        medium: [ // 60-74%
          { 
            name: 'BCA (Bachelor of Computer Applications)', 
            duration: '3 Years', 
            icon: <FaLaptopMedical />, 
            description: 'Computer applications and programming', 
            careers: ['Software Developer', 'Web Developer', 'System Administrator'],
            careerPaths: [
              { path: 'BCA → MCA → Software Developer', steps: ['Complete BCA', 'Pursue MCA (3 years)', 'Learn programming languages', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' },
              { path: 'BCA → Web Developer', steps: ['Complete BCA', 'Learn web technologies', 'Build portfolio', 'Freelance or join company', 'Grow to senior roles'], salary: '₹3-12 LPA', growth: 'Junior Developer → Senior Developer → Project Manager' }
            ]
          },
          { 
            name: 'B.Sc Computer Science', 
            duration: '3 Years', 
            icon: <FaCode />, 
            description: 'Science degree in computer science', 
            careers: ['Software Developer', 'Web Developer', 'IT Consultant'],
            careerPaths: [
              { path: 'B.Sc CS → M.Sc CS → Software Developer', steps: ['Complete B.Sc CS', 'Pursue M.Sc CS', 'Learn programming', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }
            ]
          },
          { 
            name: 'B.Sc IT (Information Technology)', 
            duration: '3 Years', 
            icon: <FaNetworkWired />, 
            description: 'Information technology', 
            careers: ['IT Support', 'Network Administrator', 'Web Developer'],
            careerPaths: [
              { path: 'B.Sc IT → IT Support', steps: ['Complete B.Sc IT', 'Learn IT support skills', 'Join company as IT support', 'Handle technical issues', 'Promote to IT administrator'], salary: '₹3-10 LPA', growth: 'Support → Administrator → IT Manager' }
            ]
          },
          { 
            name: 'Diploma in Computer Engineering', 
            duration: '3 Years', 
            icon: <FaCog />, 
            description: 'Computer hardware and software', 
            careers: ['Technician', 'Hardware Engineer', 'Network Support'],
            careerPaths: [
              { path: 'Diploma → Hardware Engineer', steps: ['Complete Diploma in Computer Engineering', 'Learn hardware troubleshooting', 'Join IT company', 'Handle hardware repairs', 'Promote to senior engineer'], salary: '₹3-8 LPA', growth: 'Technician → Engineer → Senior Engineer' }
            ]
          }
        ],
        low: [ // Below 60%
          { 
            name: 'BCA (Bachelor of Computer Applications)', 
            duration: '3 Years', 
            icon: <FaLaptopMedical />, 
            description: 'Computer applications and programming', 
            careers: ['Software Developer', 'Web Developer', 'System Administrator'],
            careerPaths: [
              { path: 'BCA → MCA → Software Developer', steps: ['Complete BCA', 'Pursue MCA (3 years)', 'Learn programming languages', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' },
              { path: 'BCA → Web Developer', steps: ['Complete BCA', 'Learn web technologies', 'Build portfolio', 'Freelance or join company', 'Grow to senior roles'], salary: '₹3-12 LPA', growth: 'Junior Developer → Senior Developer → Project Manager' }
            ]
          },
          { 
            name: 'B.Sc Computer Science', 
            duration: '3 Years', 
            icon: <FaCode />, 
            description: 'Science degree in computer science', 
            careers: ['Software Developer', 'Web Developer', 'IT Consultant'],
            careerPaths: [
              { path: 'B.Sc CS → M.Sc CS → Software Developer', steps: ['Complete B.Sc CS', 'Pursue M.Sc CS', 'Learn programming', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }
            ]
          },
          { 
            name: 'Diploma in Computer Applications', 
            duration: '1 Year', 
            icon: <FaLaptopMedical />, 
            description: 'Computer applications diploma', 
            careers: ['Computer Operator', 'Data Entry', 'Office Assistant'],
            careerPaths: [
              { path: 'Diploma → Computer Operator', steps: ['Complete Diploma in Computer Applications', 'Learn office software', 'Join company as computer operator', 'Handle data entry', 'Promote to office assistant'], salary: '₹2-5 LPA', growth: 'Operator → Assistant → Office Manager' }
            ]
          }
        ]
      }
    }

    if (!coursesData[stream]) return []

    if (userPerc >= 75) {
      return coursesData[stream].high
    } else if (userPerc >= 60) {
      return coursesData[stream].medium
    } else {
      return coursesData[stream].low
    }
  }

  const handleStreamChange = (e) => {
    setSelectedStream(e.target.value)
    setShowResults(false)
    setPercentage('')
    setPrepType('private')
  }

  const handlePercentageChange = (e) => {
    const value = e.target.value
    // Allow empty value or values between 1 and 100
    if (value === '' || (Number(value) >= 1 && Number(value) <= 100)) {
      setPercentage(value)
    }
  }

  const handleGetGuidance = () => {
    if (!selectedStream) {
      alert(getTranslation('notifications.alertSelectStream', language))
      return
    }
    if (!percentage || Number(percentage) <= 0) {
      alert(getTranslation('notifications.alertValidPercentage', language))
      return
    }
    if (Number(percentage) > 100) {
      alert(getTranslation('notifications.alertMaxPercentage', language))
      return
    }
    if (Number(percentage) < 33) {
      alert(getTranslation('notifications.notEligible', language) || 'You are not eligible for career guidance. You need at least 33% to get recommendations.')
      return
    }
    setShowResults(true)
    // Auto-scroll to results after a short delay
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleCourseClick = (course) => {
    setSelectedCourse(course)
    setSelectedCareerPath(null)
    setShowModal(true)
  }

  const handleCareerPathClick = (path, courseName) => {
    setSelectedCareerPath(path)
    // Navigate to occupation details
    navigate('/OccupationDetails', { 
      state: { 
        occupation: path.path.split('→').pop().trim(),
        stream: selectedStream,
        percentage: percentage,
        course: courseName,
        prepType: prepType
      } 
    })
  }

  const getPerformanceLevel = () => {
    const perc = Number(percentage)
    if (perc >= 75) return { level: 'Excellent', color: 'success', icon: <FaCheckCircle /> }
    if (perc >= 60) return { level: 'Good', color: 'warning', icon: <FaInfoCircle /> }
    return { level: 'Average', color: 'danger', icon: <FaInfoCircle /> }
  }

  // Handle counseling form submission
  const handleCounselingSubmit = async (counselingData) => {
    try {
      console.log('Counseling data submitted:', counselingData)

      // Send counseling request to backend
      const response = await axios.post(
        'https://brjobsedu.com/girls_course/girls_course_backend/api/student-cousult/',
        {
          ...counselingData,
          student_id: uniqueId, // Ensure student_id is from auth
          mobile: counselingData.phone, // Map phone to mobile
          other_category: counselingData.otherCategory || '',
          category: counselingData.category_consulting.join(', '), // Join the array
          message: `Career counseling request from student dashboard - Category: ${counselingData.category_consulting.join(', ')}`,
          student_name: userData?.full_name || userData?.candidate_name || 'Student',
          stream: selectedStream || 'Not specified',
          percentage: percentage || 'Not specified'
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        // Success is handled in the CounselingForm component
        return true
      } else {
        throw new Error(response.data.message || 'Failed to submit counseling request')
      }
    } catch (error) {
      console.error('Counseling submission error:', error)
      throw error // Re-throw to let CounselingForm handle the error
    }
  }

  const courses = showResults ? getCoursesByStreamAndPercentage(selectedStream, percentage) : []
  const performance = showResults ? getPerformanceLevel() : null
  
  // Get all courses for the selected stream
  const getAllCoursesForStream = (stream) => {
    const coursesData = {
      science: [
        { 
          name: 'B.Tech (Bachelor of Technology)', 
          duration: '4 Years', 
          icon: <FaCog />, 
          description: 'Engineering degree in various specializations', 
          careers: ['Software Engineer', 'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer'],
          careerPaths: [
            { path: 'B.Tech → Software Engineer', steps: ['Complete B.Tech in CS/IT', 'Learn programming languages', 'Build projects', 'Apply for software jobs', 'Grow to senior roles'], salary: '₹6-25 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' },
            { path: 'B.Tech → MBA → Manager', steps: ['Complete B.Tech', 'Work for 2-3 years', 'Pursue MBA', 'Get management role', 'Grow to leadership'], salary: '₹10-40 LPA', growth: 'Engineer → Manager → Director' },
            { path: 'B.Tech → M.Tech → Researcher', steps: ['Complete B.Tech', 'Pursue M.Tech', 'Specialize in research area', 'Join research organization', 'Become research scientist'], salary: '₹8-20 LPA', growth: 'Research Associate → Scientist → Principal Scientist' }
          ]
        },
        { 
          name: 'MBBS (Bachelor of Medicine)', 
          duration: '5.5 Years', 
          icon: <FaHospital />, 
          description: 'Medical degree to become a doctor', 
          careers: ['Doctor', 'Surgeon', 'Medical Officer', 'Specialist'],
          careerPaths: [
            { path: 'MBBS → MD → Specialist', steps: ['Complete MBBS', 'Intern for 1 year', 'Clear NEET PG', 'Pursue MD/MS (3 years)', 'Become specialist doctor'], salary: '₹10-50 LPA', growth: 'Junior Doctor → Senior Doctor → Head of Department' },
            { path: 'MBBS → Government Doctor', steps: ['Complete MBBS', 'Clear UPSC CMS exam', 'Join government hospital', 'Serve as medical officer', 'Promote to senior positions'], salary: '₹8-20 LPA', growth: 'Medical Officer → Senior MO → Director' }
          ]
        },
        { 
          name: 'B.Sc (Bachelor of Science)', 
          duration: '3 Years', 
          icon: <FaFlask />, 
          description: 'Science degree in various subjects', 
          careers: ['Scientist', 'Researcher', 'Lab Technician', 'Teacher'],
          careerPaths: [
            { path: 'B.Sc → M.Sc → Scientist', steps: ['Complete B.Sc', 'Pursue M.Sc', 'Clear NET/SET', 'Join research lab', 'Become scientist'], salary: '₹6-15 LPA', growth: 'Research Associate → Scientist → Senior Scientist' },
            { path: 'B.Sc → B.Ed → Teacher', steps: ['Complete B.Sc', 'Pursue B.Ed', 'Clear TET exam', 'Join school', 'Grow to principal'], salary: '₹4-10 LPA', growth: 'Teacher → Senior Teacher → Principal' }
          ]
        },
        { 
          name: 'B.Pharma (Bachelor of Pharmacy)', 
          duration: '4 Years', 
          icon: <FaLaptopMedical />, 
          description: 'Pharmacy degree for drug manufacturing', 
          careers: ['Pharmacist', 'Medical Representative', 'Drug Inspector'],
          careerPaths: [
            { path: 'B.Pharma → Pharmacist', steps: ['Complete B.Pharma', 'Register with Pharmacy Council', 'Join hospital/retail pharmacy', 'Manage pharmacy operations', 'Open own pharmacy'], salary: '₹4-12 LPA', growth: 'Pharmacist → Senior Pharmacist → Pharmacy Manager' },
            { path: 'B.Pharma → M.Pharma → Researcher', steps: ['Complete B.Pharma', 'Pursue M.Pharma', 'Join pharmaceutical company', 'Work in R&D', 'Become research head'], salary: '₹6-20 LPA', growth: 'Research Associate → Scientist → R&D Head' }
          ]
        },
        { 
          name: 'BDS (Bachelor of Dental Surgery)', 
          duration: '5 Years', 
          icon: <FaHospital />, 
          description: 'Dental degree for dental care', 
          careers: ['Dentist', 'Dental Surgeon', 'Orthodontist'],
          careerPaths: [
            { path: 'BDS → MDS → Specialist', steps: ['Complete BDS', 'Practice for 2-3 years', 'Pursue MDS (3 years)', 'Specialize in orthodontics', 'Open dental clinic'], salary: '₹8-30 LPA', growth: 'Dentist → Specialist → Head of Department' }
          ]
        },
        { 
          name: 'B.Sc Nursing', 
          duration: '4 Years', 
          icon: <FaHeartbeat />, 
          description: 'Nursing degree for healthcare', 
          careers: ['Nurse', 'Nursing Officer', 'Healthcare Administrator'],
          careerPaths: [
            { path: 'B.Sc Nursing → Staff Nurse', steps: ['Complete B.Sc Nursing', 'Register with Nursing Council', 'Join hospital', 'Work as staff nurse', 'Promote to senior nurse'], salary: '₹3-8 LPA', growth: 'Staff Nurse → Senior Nurse → Nursing Superintendent' }
          ]
        },
        { 
          name: 'B.Sc Agriculture', 
          duration: '4 Years', 
          icon: <FaSeedling />, 
          description: 'Agriculture and farming science', 
          careers: ['Agricultural Officer', 'Farm Manager', 'Agricultural Scientist'],
          careerPaths: [
            { path: 'B.Sc Agriculture → Agricultural Officer', steps: ['Complete B.Sc Agriculture', 'Clear ICAR exam', 'Join government agriculture department', 'Work as agricultural officer', 'Promote to senior positions'], salary: '₹4-12 LPA', growth: 'Officer → Senior Officer → Director' }
          ]
        },
        { 
          name: 'B.Sc Biotechnology', 
          duration: '3 Years', 
          icon: <FaDna />, 
          description: 'Biological technology and research', 
          careers: ['Biotechnologist', 'Research Scientist', 'Lab Technician'],
          careerPaths: [
            { path: 'B.Sc Biotech → Research Scientist', steps: ['Complete B.Sc Biotechnology', 'Pursue M.Sc Biotechnology', 'Join research lab', 'Work on research projects', 'Become research scientist'], salary: '₹5-15 LPA', growth: 'Research Associate → Scientist → Senior Scientist' }
          ]
        },
        { 
          name: 'Diploma in Engineering', 
          duration: '3 Years', 
          icon: <FaTools />, 
          description: 'Engineering diploma courses', 
          careers: ['Technician', 'Supervisor', 'Junior Engineer'],
          careerPaths: [
            { path: 'Diploma → Junior Engineer', steps: ['Complete Diploma in Engineering', 'Join manufacturing company', 'Work as technician', 'Gain experience', 'Promote to supervisor'], salary: '₹3-8 LPA', growth: 'Technician → Supervisor → Manager' }
          ]
        }
      ],
      commerce: [
        { 
          name: 'B.Com (Bachelor of Commerce)', 
          duration: '3 Years', 
          icon: <FaBriefcase />, 
          description: 'Commerce degree for business and finance', 
          careers: ['Accountant', 'Financial Analyst', 'Tax Consultant'],
          careerPaths: [
            { path: 'B.Com → M.Com → Professor', steps: ['Complete B.Com', 'Pursue M.Com', 'Clear NET/SET', 'Pursue PhD', 'Join college as professor'], salary: '₹6-15 LPA', growth: 'Assistant Professor → Professor → Dean' },
            { path: 'B.Com → CA → Chartered Accountant', steps: ['Complete B.Com', 'Register for CA', 'Clear IPCC', 'Complete articleship', 'Clear CA Final'], salary: '₹8-30 LPA', growth: 'Junior CA → Senior CA → Partner' },
            { path: 'B.Com → MBA → Finance Manager', steps: ['Complete B.Com', 'Pursue MBA Finance', 'Get placement in company', 'Work as financial analyst', 'Promote to finance manager'], salary: '₹6-25 LPA', growth: 'Analyst → Manager → CFO' }
          ]
        },
        { 
          name: 'BBA (Bachelor of Business Administration)', 
          duration: '3 Years', 
          icon: <FaUserTie />, 
          description: 'Business administration degree', 
          careers: ['Manager', 'Business Analyst', 'HR Manager'],
          careerPaths: [
            { path: 'BBA → MBA → Manager', steps: ['Complete BBA', 'Pursue MBA (2 years)', 'Specialize in HR/Marketing', 'Get placement', 'Grow to management roles'], salary: '₹6-25 LPA', growth: 'Executive → Manager → Director' },
            { path: 'BBA → Entrepreneur', steps: ['Complete BBA', 'Identify business opportunity', 'Start own business', 'Scale operations', 'Build successful company'], salary: 'Variable', growth: 'Startup → Established Business → Industry Leader' }
          ]
        },
        { 
          name: 'CA (Chartered Accountancy)', 
          duration: '4-5 Years', 
          icon: <FaBalanceScale />, 
          description: 'Professional accounting qualification', 
          careers: ['Chartered Accountant', 'Auditor', 'Financial Advisor'],
          careerPaths: [
            { path: 'CA → Practice → Senior CA', steps: ['Complete CA', 'Join CA firm', 'Handle client accounts', 'Build expertise', 'Start own practice'], salary: '₹8-50 LPA', growth: 'Junior CA → Senior CA → Partner' },
            { path: 'CA → CFO', steps: ['Complete CA', 'Join corporate', 'Work in finance department', 'Become finance manager', 'Promote to CFO'], salary: '₹15-60 LPA', growth: 'Accountant → Finance Manager → CFO' }
          ]
        },
        { 
          name: 'CS (Company Secretary)', 
          duration: '3-4 Years', 
          icon: <FaBuilding />, 
          description: 'Corporate governance professional', 
          careers: ['Company Secretary', 'Compliance Officer', 'Legal Advisor'],
          careerPaths: [
            { path: 'CS → Practice → Senior CS', steps: ['Complete CS', 'Register with ICSI', 'Join company', 'Handle compliance', 'Become senior CS'], salary: '₹6-25 LPA', growth: 'Junior CS → Senior CS → Partner' }
          ]
        },
        { 
          name: 'CMA (Cost Management Accounting)', 
          duration: '3-4 Years', 
          icon: <FaChartBar />, 
          description: 'Cost and management accounting', 
          careers: ['Cost Accountant', 'Financial Controller', 'Management Accountant'],
          careerPaths: [
            { path: 'CMA → Cost Accountant', steps: ['Complete CMA', 'Join manufacturing company', 'Handle cost accounting', 'Optimize costs', 'Become cost controller'], salary: '₹6-20 LPA', growth: 'Cost Accountant → Senior CA → Finance Director' }
          ]
        },
        { 
          name: 'BBA LLB', 
          duration: '5 Years', 
          icon: <FaBalanceScale />, 
          description: 'Integrated business and law degree', 
          careers: ['Corporate Lawyer', 'Legal Advisor', 'Business Consultant'],
          careerPaths: [
            { path: 'BBA LLB → Corporate Lawyer', steps: ['Complete BBA LLB', 'Enroll with Bar Council', 'Join law firm', 'Specialize in corporate law', 'Become partner'], salary: '₹8-40 LPA', growth: 'Associate → Senior Associate → Partner' }
          ]
        },
        { 
          name: 'B.Com (Hons)', 
          duration: '3 Years', 
          icon: <FaBriefcase />, 
          description: 'Honors commerce degree', 
          careers: ['Accountant', 'Financial Analyst', 'Banker'],
          careerPaths: [
            { path: 'B.Com Hons → Banker', steps: ['Complete B.Com Hons', 'Clear bank exams', 'Join bank as officer', 'Handle banking operations', 'Promote to manager'], salary: '₹4-12 LPA', growth: 'Officer → Manager → Branch Manager' }
          ]
        },
        { 
          name: 'BBA (Marketing)', 
          duration: '3 Years', 
          icon: <FaChartLine />, 
          description: 'Marketing specialization', 
          careers: ['Marketing Manager', 'Sales Manager', 'Brand Manager'],
          careerPaths: [
            { path: 'BBA Marketing → Marketing Manager', steps: ['Complete BBA Marketing', 'Join company as marketing executive', 'Handle marketing campaigns', 'Build brand strategy', 'Become marketing manager'], salary: '₹5-20 LPA', growth: 'Executive → Manager → Director' }
          ]
        },
        { 
          name: 'Diploma in Accounting', 
          duration: '1-2 Years', 
          icon: <FaChartBar />, 
          description: 'Accounting and bookkeeping', 
          careers: ['Accountant', 'Bookkeeper', 'Accounts Assistant'],
          careerPaths: [
            { path: 'Diploma → Accountant', steps: ['Complete Diploma in Accounting', 'Learn accounting software', 'Join company as accounts assistant', 'Handle bookkeeping', 'Promote to accountant'], salary: '₹2-6 LPA', growth: 'Assistant → Accountant → Senior Accountant' }
          ]
        }
      ],
      arts: [
        { 
          name: 'BA (Bachelor of Arts)', 
          duration: '3 Years', 
          icon: <FaBook />, 
          description: 'Arts degree in various humanities subjects', 
          careers: ['Teacher', 'Writer', 'Content Creator', 'Journalist'],
          careerPaths: [
            { path: 'BA → B.Ed → Teacher', steps: ['Complete BA in your subject', 'Pursue B.Ed (2 years)', 'Clear CTET/TET exam', 'Apply for teaching positions'], salary: '₹3-8 LPA', growth: 'Senior Teacher → Head of Department → Principal' },
            { path: 'BA → MA → Professor', steps: ['Complete BA', 'Pursue MA in specialization', 'Clear NET/SET exam', 'Pursue PhD', 'Apply for Assistant Professor'], salary: '₹6-15 LPA', growth: 'Assistant Professor → Associate Professor → Professor' },
            { path: 'BA → LLB → Lawyer', steps: ['Complete BA', 'Pursue LLB (3 years)', 'Enroll with Bar Council', 'Practice under senior lawyer', 'Start independent practice'], salary: '₹4-20 LPA', growth: 'Junior Lawyer → Senior Lawyer → Judge' },
            { path: 'BA → BJMC → Journalist', steps: ['Complete BA', 'Pursue BJMC (3 years)', 'Intern with media house', 'Work as reporter', 'Become senior journalist'], salary: '₹3-12 LPA', growth: 'Reporter → Senior Journalist → Editor' },
            { path: 'BA → MBA → Manager', steps: ['Complete BA', 'Pursue MBA (2 years)', 'Specialize in HR/Marketing', 'Get placement in company', 'Grow to management roles'], salary: '₹6-25 LPA', growth: 'Executive → Manager → Director' }
          ]
        },
        { 
          name: 'LLB (Bachelor of Laws)', 
          duration: '3 Years', 
          icon: <FaBalanceScale />, 
          description: 'Law degree for legal practice', 
          careers: ['Lawyer', 'Legal Advisor', 'Judge', 'Legal Consultant'],
          careerPaths: [
            { path: 'LLB → Practice → Senior Advocate', steps: ['Complete LLB', 'Enroll with Bar Council', 'Practice under senior lawyer', 'Build client base', 'Become senior advocate'], salary: '₹5-50 LPA', growth: 'Junior Lawyer → Senior Lawyer → Senior Advocate' },
            { path: 'LLB → LLM → Corporate Lawyer', steps: ['Complete LLB', 'Pursue LLM (2 years)', 'Specialize in corporate law', 'Join law firm', 'Become partner'], salary: '₹8-40 LPA', growth: 'Associate → Senior Associate → Partner' },
            { path: 'LLB → Judiciary → Judge', steps: ['Complete LLB', 'Practice for 7+ years', 'Clear Judicial Services exam', 'Become Magistrate', 'Promote to Judge'], salary: '₹10-25 LPA', growth: 'Magistrate → District Judge → High Court Judge' }
          ]
        },
        { 
          name: 'BJMC (Journalism & Mass Communication)', 
          duration: '3 Years', 
          icon: <FaNewspaper />, 
          description: 'Journalism and media studies', 
          careers: ['Journalist', 'News Anchor', 'Content Writer', 'PR Manager'],
          careerPaths: [
            { path: 'BJMC → Reporter → News Anchor', steps: ['Complete BJMC', 'Intern with news channel', 'Work as reporter', 'Develop on-screen presence', 'Become news anchor'], salary: '₹4-20 LPA', growth: 'Reporter → Senior Reporter → News Anchor' },
            { path: 'BJMC → Content Writer → Editor', steps: ['Complete BJMC', 'Start as content writer', 'Work for publications', 'Become senior writer', 'Promote to editor'], salary: '₹3-15 LPA', growth: 'Writer → Senior Writer → Editor' },
            { path: 'BJMC → PR Executive → PR Manager', steps: ['Complete BJMC', 'Join PR agency', 'Handle client accounts', 'Build media relations', 'Become PR manager'], salary: '₹4-18 LPA', growth: 'Executive → Manager → Director' }
          ]
        },
        { 
          name: 'B.Ed (Bachelor of Education)', 
          duration: '2 Years', 
          icon: <FaChalkboardTeacher />, 
          description: 'Teaching degree for educators', 
          careers: ['Teacher', 'Principal', 'Education Counselor'],
          careerPaths: [
            { path: 'B.Ed → TET → Government Teacher', steps: ['Complete B.Ed', 'Clear CTET/TET exam', 'Apply for government schools', 'Get selected', 'Grow to senior positions'], salary: '₹4-10 LPA', growth: 'Teacher → Senior Teacher → Headmaster' },
            { path: 'B.Ed → MA → Professor', steps: ['Complete B.Ed', 'Pursue MA in subject', 'Clear NET/SET', 'Pursue PhD', 'Join college as professor'], salary: '₹6-15 LPA', growth: 'Assistant Professor → Professor → Dean' }
          ]
        },
        { 
          name: 'BFA (Bachelor of Fine Arts)', 
          duration: '4 Years', 
          icon: <FaPaintBrush />, 
          description: 'Fine arts and visual arts degree', 
          careers: ['Artist', 'Designer', 'Animator', 'Art Director'],
          careerPaths: [
            { path: 'BFA → Freelance Artist', steps: ['Complete BFA', 'Build portfolio', 'Exhibit work in galleries', 'Sell artwork', 'Build reputation'], salary: '₹3-20 LPA', growth: 'Emerging Artist → Established Artist → Master Artist' },
            { path: 'BFA → Graphic Designer → Art Director', steps: ['Complete BFA', 'Learn design software', 'Work as junior designer', 'Become senior designer', 'Promote to art director'], salary: '₹4-18 LPA', growth: 'Junior Designer → Senior Designer → Art Director' }
          ]
        },
        { 
          name: 'BSW (Bachelor of Social Work)', 
          duration: '3 Years', 
          icon: <FaHeartbeat />, 
          description: 'Social work and community service', 
          careers: ['Social Worker', 'Counselor', 'NGO Worker'],
          careerPaths: [
            { path: 'BSW → MSW → Social Worker', steps: ['Complete BSW', 'Pursue MSW (2 years)', 'Specialize in community work', 'Join NGO', 'Lead social programs'], salary: '₹3-10 LPA', growth: 'Worker → Program Manager → Director' }
          ]
        },
        { 
          name: 'Diploma in Journalism', 
          duration: '1-2 Years', 
          icon: <FaNewspaper />, 
          description: 'Journalism and media', 
          careers: ['Reporter', 'Content Writer', 'Media Assistant'],
          careerPaths: [
            { path: 'Diploma → Reporter', steps: ['Complete Diploma in Journalism', 'Intern with local newspaper', 'Work as junior reporter', 'Cover local news', 'Become senior reporter'], salary: '₹2-8 LPA', growth: 'Junior Reporter → Reporter → Senior Reporter' }
          ]
        }
      ],
      computer: [
        { 
          name: 'BCA (Bachelor of Computer Applications)', 
          duration: '3 Years', 
          icon: <FaLaptopMedical />, 
          description: 'Computer applications and programming', 
          careers: ['Software Developer', 'Web Developer', 'System Administrator'],
          careerPaths: [
            { path: 'BCA → MCA → Software Developer', steps: ['Complete BCA', 'Pursue MCA (3 years)', 'Learn programming languages', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' },
            { path: 'BCA → Web Developer', steps: ['Complete BCA', 'Learn web technologies', 'Build portfolio', 'Freelance or join company', 'Grow to senior roles'], salary: '₹3-12 LPA', growth: 'Junior Developer → Senior Developer → Project Manager' }
          ]
        },
        { 
          name: 'B.Tech CSE (Computer Science)', 
          duration: '4 Years', 
          icon: <FaMicrochip />, 
          description: 'Computer science engineering', 
          careers: ['Software Engineer', 'Data Scientist', 'AI Engineer'],
          careerPaths: [
            { path: 'B.Tech → Software Engineer', steps: ['Complete B.Tech CSE', 'Learn programming', 'Build projects', 'Apply for software jobs', 'Grow to senior roles'], salary: '₹6-25 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' },
            { path: 'B.Tech → MBA → Manager', steps: ['Complete B.Tech', 'Work for 2-3 years', 'Pursue MBA', 'Get management role', 'Grow to leadership'], salary: '₹10-40 LPA', growth: 'Engineer → Manager → Director' }
          ]
        },
        { 
          name: 'B.Tech IT (Information Technology)', 
          duration: '4 Years', 
          icon: <FaNetworkWired />, 
          description: 'Information technology engineering', 
          careers: ['IT Manager', 'Network Engineer', 'System Analyst'],
          careerPaths: [
            { path: 'B.Tech IT → IT Manager', steps: ['Complete B.Tech IT', 'Join IT company', 'Handle IT operations', 'Manage IT team', 'Become IT manager'], salary: '₹6-25 LPA', growth: 'IT Executive → IT Manager → CTO' }
          ]
        },
        { 
          name: 'B.Sc Computer Science', 
          duration: '3 Years', 
          icon: <FaCode />, 
          description: 'Science degree in computer science', 
          careers: ['Software Developer', 'Web Developer', 'IT Consultant'],
          careerPaths: [
            { path: 'B.Sc CS → M.Sc CS → Software Developer', steps: ['Complete B.Sc CS', 'Pursue M.Sc CS', 'Learn programming', 'Build projects', 'Apply for software jobs'], salary: '₹4-15 LPA', growth: 'Junior Developer → Senior Developer → Tech Lead' }
          ]
        },
        { 
          name: 'B.Tech AI & ML', 
          duration: '4 Years', 
          icon: <FaRobot />, 
          description: 'Artificial intelligence and machine learning', 
          careers: ['AI Engineer', 'ML Engineer', 'Data Scientist'],
          careerPaths: [
            { path: 'B.Tech AI → AI Engineer', steps: ['Complete B.Tech AI & ML', 'Learn AI/ML frameworks', 'Build AI projects', 'Apply for AI jobs', 'Grow to senior AI roles'], salary: '₹8-30 LPA', growth: 'AI Developer → AI Engineer → AI Architect' }
          ]
        },
        { 
          name: 'B.Tech Data Science', 
          duration: '4 Years', 
          icon: <FaDatabase />, 
          description: 'Data science and analytics', 
          careers: ['Data Scientist', 'Data Analyst', 'Business Analyst'],
          careerPaths: [
            { path: 'B.Tech DS → Data Scientist', steps: ['Complete B.Tech Data Science', 'Learn data analytics tools', 'Build data projects', 'Apply for data jobs', 'Grow to senior data roles'], salary: '₹8-30 LPA', growth: 'Data Analyst → Data Scientist → Chief Data Officer' }
          ]
        },
        { 
          name: 'B.Sc IT (Information Technology)', 
          duration: '3 Years', 
          icon: <FaNetworkWired />, 
          description: 'Information technology', 
          careers: ['IT Support', 'Network Administrator', 'Web Developer'],
          careerPaths: [
            { path: 'B.Sc IT → IT Support', steps: ['Complete B.Sc IT', 'Learn IT support skills', 'Join company as IT support', 'Handle technical issues', 'Promote to IT administrator'], salary: '₹3-10 LPA', growth: 'Support → Administrator → IT Manager' }
          ]
        },
        { 
          name: 'Diploma in Computer Engineering', 
          duration: '3 Years', 
          icon: <FaCog />, 
          description: 'Computer hardware and software', 
          careers: ['Technician', 'Hardware Engineer', 'Network Support'],
          careerPaths: [
            { path: 'Diploma → Hardware Engineer', steps: ['Complete Diploma in Computer Engineering', 'Learn hardware troubleshooting', 'Join IT company', 'Handle hardware repairs', 'Promote to senior engineer'], salary: '₹3-8 LPA', growth: 'Technician → Engineer → Senior Engineer' }
          ]
        },
        { 
          name: 'Diploma in Computer Applications', 
          duration: '1 Year', 
          icon: <FaLaptopMedical />, 
          description: 'Computer applications diploma', 
          careers: ['Computer Operator', 'Data Entry', 'Office Assistant'],
          careerPaths: [
            { path: 'Diploma → Computer Operator', steps: ['Complete Diploma in Computer Applications', 'Learn office software', 'Join company as computer operator', 'Handle data entry', 'Promote to office assistant'], salary: '₹2-5 LPA', growth: 'Operator → Assistant → Office Manager' }
          ]
        }
      ]
    }
    return coursesData[stream] || []
  }
  
  const allCourses = showResults ? getAllCoursesForStream(selectedStream) : []

  return (
    <div className="d-flex flex-column">
      <UserTopNav onMenuToggle={handleMenuToggle} isMobile={isMobile} />
      <div className="d-flex flex-1">
        <UseLeftNav 
          showOffcanvas={showOffcanvas} 
          setShowOffcanvas={setShowOffcanvas} 
        />
        
        <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '220px', padding: isMobile ? '10px' : '20px', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid className='fixed-notifications'>
            {/* Back Button */}
            <div className="mb-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/UserDashboard')} 
                className="d-flex align-items-center"
              >
                <FaArrowLeft className="me-2" />
                <TransText k="notifications.backToDashboard" as="span" />
              </Button>
            </div>

        

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" style={{ width: '60px', height: '60px' }}>
                  <span className="visually-hidden"><TransText k="notifications.loading" as="span" /></span>
                </div>
                <p className="mt-3"><TransText k="notifications.loading" as="span" /></p>
              </div>
            ) : (
              <>
                {/* Step 1: Select Stream */}
                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                      {/* Header Card */}
            <Card className="shadow-sm mb-4 border-0 notifications-header-card" style={{ borderRadius: '10px' }}>
              <Card.Body className="">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                  <div>
                    <h3 className="mb-2">
                      <FaGraduationCap className="me-2 text-primary" />
                      <TransText k="notifications.title" as="span" />
                    </h3>
                    <p className="text-muted mb-0">
                      <TransText k="notifications.subtitle" as="span" />
                    </p>

                  </div>
                  
                </div>
              </Card.Body>
               {/* Counseling Form */}
                <CounselingForm
                  onSubmit={handleCounselingSubmit}
                  showForm={showCounseling}
                  onToggle={setShowCounseling}
                  initialData={userData}
                  userRoleType={userRoleType}
                />
            </Card>
                  <Card.Body className="">
                    <h5 className="mb-3">
                        <Badge bg="primary" className="me-2"><TransText k="notifications.step1" as="span" /></Badge>
                        <TransText k="notifications.selectStream" as="span" />
                    </h5>
                    <Row>
                      {streams.map((stream) => (
                        <Col lg={3} md={6} className="mb-3" key={stream.id}>
                          <Card 
                            className={`h-100 border stream-selection-card ${selectedStream === stream.id ? 'selected' : ''}`}
                            style={{ 
                              cursor: 'pointer',
                              borderColor: selectedStream === stream.id ? '#667eea' : '#dee2e6',
                              backgroundColor: selectedStream === stream.id ? '#f0f4ff' : 'white'
                            }}
                            onClick={() => handleStreamChange({ target: { value: stream.id } })}
                          >
                            <Card.Body className="p-3 text-center">
                              <div className="stream-icon-large mb-2">
                                {stream.icon}
                              </div>
                              <h6 className="mb-1">{getTranslation(stream.nameKey, language)}</h6>
                              <small className="text-muted">{getTranslation(stream.subjectsKey, language)}</small>
                              {selectedStream === stream.id && (
                                <Badge bg="primary" className="mt-2">
                                  <FaCheckCircle className="me-1" /> <TransText k="notifications.selected" as="span" />
                                </Badge>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>

                {/* Step 2: Enter Percentage */}
                {selectedStream && (
                  <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                    <Card.Body className="p-4">
                      <h5 className="mb-3">
                        <Badge bg="primary" className="me-2"><TransText k="notifications.step2" as="span" /></Badge>
                        <TransText k="notifications.enterPercentage" as="span" />
                      </h5>
                      <Row className="align-items-center">
                        <Col md={6}>
                          <div className="percentage-input-wrapper">
                            <Form.Control
                              type="number"
                              placeholder={<TransText k="notifications.percentagePlaceholder" as="span" />}
                              value={percentage}
                              onChange={handlePercentageChange}
                              min="0"
                              max="100"
                              className="percentage-input-large"
                            />
                            <FaPercentage className="percentage-icon-large" />
                          </div>
                        </Col>
                        <Col md={6} className='mobile-btn-sty'>
                          <Button 
                            variant="primary" 
                            size="lg"
                            onClick={handleGetGuidance}
                            disabled={!percentage}
                            className="w-100 mobile-btn-get"
                          >
                            <FaLightbulb className="me-2" />
                            <TransText k="notifications.getCourseGuidance" as="span" />
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                )}

                {/* Step 3: Results */}
                {showResults && courses.length > 0 && (
                  <div ref={resultsRef}>
                    {/* Performance Summary */}
                    <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="mb-1"><TransText k="notifications.yourPerformance" as="span" /></h5>
                            <p className="text-muted mb-0">
                              <TransText k="notifications.basedOn" as="span" /> {percentage}% <TransText k="notifications.in" as="span" /> {getStreamName(selectedStream)}
                            </p>
                          </div>
                          <div className="text-end">
                            <Badge bg={performance.color} className="fs-5 p-3">
                              {performance.icon} {performance.level}
                            </Badge>
                          </div>
                        </div>
                        <ProgressBar 
                          now={Number(percentage)} 
                          className="mt-3"
                          variant={performance.color}
                          style={{ height: '15px' }}
                          label={`${percentage}%`}
                        />
                      </Card.Body>
                    </Card>

                    {/* Private/Govt College/Govt Job Selection */}
                    <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                      <Card.Body className="p-4">
                        <h5 className="mb-3">Choose Your Path:</h5>
                        <p className="text-muted mb-3">Select your preferred career path</p>
                        <Row className="g-3">
                          <Col md={4}>
                            <Card 
                              className={`h-100 border ${prepType === 'private' ? 'border-primary' : ''}`}
                              style={{ cursor: 'pointer', borderRadius: '10px' }}
                              onClick={() => setPrepType('private')}
                            >
                              <Card.Body className="p-4 text-center">
                                <FaBriefcase className={`fs-2 mb-2 ${prepType === 'private' ? 'text-primary' : 'text-muted'}`} />
                                <h6>Private College Path</h6>
                                <small className="text-muted">Admission in private colleges for degree programs</small>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={4}>
                            <Card 
                              className={`h-100 border ${prepType === 'govtCollege' ? 'border-primary' : ''}`}
                              style={{ cursor: 'pointer', borderRadius: '10px' }}
                              onClick={() => setPrepType('govtCollege')}
                            >
                              <Card.Body className="p-4 text-center">
                                <FaUniversity className={`fs-2 mb-2 ${prepType === 'govtCollege' ? 'text-primary' : 'text-muted'}`} />
                                <h6>Govt College Path</h6>
                                <small className="text-muted">IIT, NIT, IIIT, Medical & premier govt institutions</small>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={4}>
                            <Card 
                              className={`h-100 border ${prepType === 'govtJob' ? 'border-primary' : ''}`}
                              style={{ cursor: 'pointer', borderRadius: '10px' }}
                              onClick={() => setPrepType('govtJob')}
                            >
                              <Card.Body className="p-4 text-center">
                                <FaShieldAlt className={`fs-2 mb-2 ${prepType === 'govtJob' ? 'text-primary' : 'text-muted'}`} />
                                <h6>Government Job Path</h6>
                                <small className="text-muted">Prepare for competitive exams (UPSC, SSC, Banking, etc.)</small>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    {/* Courses Tabs */}
                    <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
<Card.Header className="bg-white border-0 pt-4 pb-0">
                        <h5 className="mb-0">
                          {prepType === 'govtJob' ? (
                            <>
                              <FaShieldAlt className="me-2 text-primary" />
                              Government Job Preparation Roadmap
                            </>
                          ) : prepType === 'govtCollege' ? (
                            <>
                              <FaUniversity className="me-2 text-primary" />
                              Government College Admission Roadmap
                            </>
                          ) : (
                            <>
                              <FaBriefcase className="me-2 text-primary" />
                              <TransText k="notifications.courseRecommendations" as="span" />
                            </>
                          )}
                        </h5>
                        <p className="text-muted mb-0">
                          {prepType === 'govtJob' 
                            ? "Select a government exam to see complete preparation roadmap and colleges"
                            : prepType === 'govtCollege'
                            ? "Select a college type to see admission roadmap and top institutions"
                            : <TransText k="notifications.coursesBrowseDesc" as="span" />
                          }
                        </p>
                      </Card.Header>
                      <Card.Body className="p-4">
                        {prepType === 'govtJob' ? (
                          /* Govt Jobs Content */
                          <div className="mb-4">
                            {/* Exam Selection Cards */}
                            <Row className="mb-4">
                              {govtExamTypes.map((examType, index) => {
                                const examInfo = govtExamData[examType]
                                if (!examInfo) return null
                                return (
                                  <Col md={4} key={index} className="mb-3">
                                    <Card 
                                      className={`h-100 border ${selectedGovtExam === examType ? 'border-primary' : ''}`}
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => setSelectedGovtExam(examType)}
                                    >
                                      <Card.Body className="p-3">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                          <div className="course-icon-large">
                                            {examInfo.icon}
                                          </div>
                                          <h6 className="mb-0">{examInfo.title}</h6>
                                        </div>
                                        <p className="small text-muted mb-2">
                                          {examInfo.fullPath.substring(0, 50)}...
                                        </p>
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                )
                              })}
                            </Row>
                            
                            {/* Detailed Exam Roadmap */}
                            {selectedGovtExam && govtExamData[selectedGovtExam] && (
                              <Card className="border bg-light">
                                <Card.Body className="p-4">
                                  <div className="mb-4">
                                    <h5 className="mb-3">
                                      {govtExamData[selectedGovtExam].icon}
                                      <span className="ms-2">{govtExamData[selectedGovtExam].title}</span>
                                    </h5>
                                    <p className="text-muted mb-3">
                                      <strong>Complete Path:</strong> {govtExamData[selectedGovtExam].fullPath}
                                    </p>
                                  </div>
                                  
                                  <h6 className="mb-3">Step-by-Step Roadmap:</h6>
                                  <Row className="mb-4">
                                    {govtExamData[selectedGovtExam].steps.map((step, idx) => (
                                      <Col md={6} key={idx} className="mb-3">
                                        <Card className="h-100 border">
                                          <Card.Body className="p-3">
                                            <div className="d-flex align-items-start gap-2">
                                              <Badge bg="primary" className="fs-6">{step.step}</Badge>
                                              <div>
                                                <h6 className="mb-1">{step.title}</h6>
                                                <p className="small text-muted mb-1">{step.description}</p>
                                                <Badge bg="secondary">{step.duration}</Badge>
                                              </div>
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </Col>
                                    ))}
                                  </Row>
                                  
                                  <h6 className="mb-3">Top Colleges/Recruitment:</h6>
                                  <Row>
                                    {govtExamData[selectedGovtExam].colleges.map((college, idx) => (
                                      <Col md={6} key={idx} className="mb-2">
                                        <Card className="h-100 border">
                                          <Card.Body className="p-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                              <div>
                                                <h6 className="mb-0">{college.name}</h6>
                                                <small className="text-muted">{college.location}</small>
                                              </div>
                                              <Badge bg="success">{college.seats}</Badge>
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </Col>
                                    ))}
                                  </Row>
                                </Card.Body>
                              </Card>
                            )}
                          </div>
                        ) : prepType === 'govtCollege' ? (
                          /* Govt College Content */
                          <div className="mb-4">
                            {/* College Type Selection Cards */}
                            <Row className="mb-4">
                              {govtCollegeTypes.map((collegeType, index) => {
                                const collegeInfo = govtCollegeData[collegeType]
                                if (!collegeInfo) return null
                                return (
                                  <Col md={4} key={index} className="mb-3">
                                    <Card 
                                      className={`h-100 border ${selectedGovtCollege === collegeType ? 'border-primary' : ''}`}
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => setSelectedGovtCollege(collegeType)}
                                    >
                                      <Card.Body className="p-3">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                          <div className="course-icon-large">
                                            {collegeInfo.icon}
                                          </div>
                                          <h6 className="mb-0">{collegeInfo.title}</h6>
                                        </div>
                                        <p className="small text-muted mb-2">
                                          {collegeInfo.fullPath.substring(0, 50)}...
                                        </p>
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                )
                              })}
                            </Row>
                            
                            {/* Detailed College Roadmap */}
                            {selectedGovtCollege && govtCollegeData[selectedGovtCollege] && (
                              <Card className="border bg-light">
                                <Card.Body className="p-4">
                                  <div className="mb-4">
                                    <h5 className="mb-3">
                                      {govtCollegeData[selectedGovtCollege].icon}
                                      <span className="ms-2">{govtCollegeData[selectedGovtCollege].title}</span>
                                    </h5>
                                    <p className="text-muted mb-2">
                                      <strong>Complete Path:</strong> {govtCollegeData[selectedGovtCollege].fullPath}
                                    </p>
                                    <p className="text-muted mb-2">
                                      <strong>Eligibility:</strong> {govtCollegeData[selectedGovtCollege].eligibility}
                                    </p>
                                    <p className="text-muted mb-0">
                                      <strong>Total Seats:</strong> {govtCollegeData[selectedGovtCollege].seats}
                                    </p>
                                  </div>
                                  
                                  <h6 className="mb-3">Step-by-Step Roadmap:</h6>
                                  <Row className="mb-4">
                                    {govtCollegeData[selectedGovtCollege].steps.map((step, idx) => (
                                      <Col md={6} key={idx} className="mb-3">
                                        <Card className="h-100 border">
                                          <Card.Body className="p-3">
                                            <div className="d-flex align-items-start gap-2">
                                              <Badge bg="primary" className="fs-6">{step.step}</Badge>
                                              <div>
                                                <h6 className="mb-1">{step.title}</h6>
                                                <p className="small text-muted mb-1">{step.description}</p>
                                                <Badge bg="secondary">{step.duration}</Badge>
                                              </div>
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </Col>
                                    ))}
                                  </Row>
                                  
                                  <h6 className="mb-3">Available Courses:</h6>
                                  <div className="mb-4">
                                    {govtCollegeData[selectedGovtCollege].courses.map((course, idx) => (
                                      <Badge bg="info" className="me-2 mb-2" key={idx}>{course}</Badge>
                                    ))}
                                  </div>
                                  
                                  <h6 className="mb-3">Top Colleges:</h6>
                                  <Row>
                                    {govtCollegeData[selectedGovtCollege].colleges.map((college, idx) => (
                                      <Col md={6} key={idx} className="mb-2">
                                        <Card className="h-100 border">
                                          <Card.Body className="p-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                              <div>
                                                <h6 className="mb-0">{college.name}</h6>
                                                <small className="text-muted">{college.location}</small>
                                              </div>
                                              <div className="text-end">
                                                <Badge bg="success">Rank #{college.ranking}</Badge>
                                                <Badge bg="secondary" className="ms-1">{college.seats}</Badge>
                                              </div>
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </Col>
                                    ))}
                                  </Row>
                                </Card.Body>
                              </Card>
                            )}
                          </div>
                        ) : (
                          /* Private Courses Content */
                          <Tab.Container id="courses-tabs" defaultActiveKey="recommended">
                            <Nav variant="tabs" className="mb-4">
                              <Nav.Item>
                                <Nav.Link eventKey="recommended">
                                  <FaUniversity className="me-2" />
                                  <TransText k="notifications.recommendedCourses" as="span" />
                                </Nav.Link>
                              </Nav.Item>
                              <Nav.Item>
                                <Nav.Link eventKey="all">
                                  <FaBookOpen className="me-2" />
                                  <TransText k="notifications.allCoursesFor" as="span" /> {getStreamName(selectedStream)}
                                </Nav.Link>
                              </Nav.Item>
                            </Nav>
                            <Tab.Content>
                              <Tab.Pane eventKey="recommended">
                                {courses.length > 0 ? (
                                  <Row>
                                    {courses.map((course, index) => (
                                      <Col lg={4} md={6} className="mb-4" key={index}>
                                        <Card 
                                          className="h-100 border course-card"
                                          style={{ cursor: 'pointer' }}
                                          onClick={() => handleCourseClick(course)}
                                        >
                                          <Card.Body className="p-4">
                                            <div className="d-flex align-items-start gap-3 mb-3">
                                              <div className="course-icon-large">
                                                {course.icon}
                                              </div>
                                              <div>
                                                <h6 className="mb-1">{getCourseName(course.name)}</h6>
                                                <Badge bg="info">{course.duration}</Badge>
                                              </div>
                                            </div>
                                            <p className="text-muted small mb-3">{getCourseDescription(course.name)}</p>
                                            <div className="mt-auto">
                                              <small className="text-muted d-block mb-2"><TransText k="notifications.careerOpportunities" as="span" /></small>
                                              <div className="d-flex flex-wrap gap-1">
                                                {course.careers.slice(0, 3).map((career, idx) => (
                                                  <Badge bg="light" text="dark" key={idx} className="small">
                                                    {career}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </Col>
                                    ))}
                                  </Row>
                                ) : (
                                  <Alert variant="info">
                                    <FaInfoCircle className="me-2" />
                                    No recommended courses available. Please adjust your percentage or select a different stream.
                                  </Alert>
                                )}
                              </Tab.Pane>
                              <Tab.Pane eventKey="all">
                                {allCourses.length > 0 ? (
                                  <Row>
                                    {allCourses.map((course, index) => (
                                      <Col lg={4} md={6} className="mb-4" key={index}>
                                        <Card 
                                          className="h-100 border course-card"
                                          style={{ cursor: 'pointer' }}
                                          onClick={() => handleCourseClick(course)}
                                        >
                                          <Card.Body className="p-4">
                                            <div className="d-flex align-items-start gap-3 mb-3">
                                              <div className="course-icon-large">
                                                {course.icon}
                                              </div>
                                              <div>
                                                <h6 className="mb-1">{getCourseName(course.name)}</h6>
                                                <Badge bg="info">{course.duration}</Badge>
                                              </div>
                                            </div>
                                            <p className="text-muted small mb-3">{getCourseDescription(course.name)}</p>
                                            <div className="mt-auto">
                                              <small className="text-muted d-block mb-2">Career Opportunities:</small>
                                              <div className="d-flex flex-wrap gap-1">
                                                {course.careers.slice(0, 3).map((career, idx) => (
                                                  <Badge bg="light" text="dark" key={idx} className="small">
                                                    {career}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </Col>
                                    ))}
                                  </Row>
                                ) : (
                                  <Alert variant="info">
                                    <FaInfoCircle className="me-2" />
                                    No courses available for this stream.
                                  </Alert>
                                )}
                              </Tab.Pane>
                            </Tab.Content>
                          </Tab.Container>
                        )}
                      </Card.Body>
                    </Card>

                    {/* Additional Guidance */}
                    <Card className="shadow-sm border-0 guidance-card" style={{ borderRadius: '10px' }}>
                      <Card.Body className="p-4">
                        <h5 className="mb-3">
                          <FaLightbulb className="me-2 text-warning" />
                          <TransText k="notifications.additionalGuidance" as="span" />
                        </h5>
                        <Row>
                          <Col md={6}>
                            <h6>
                            {selectedStream === 'science' && <TransText k="notifications.guidanceForScience" as="span" />}
                            {selectedStream === 'commerce' && <TransText k="notifications.guidanceForCommerce" as="span" />}
                            {selectedStream === 'arts' && <TransText k="notifications.guidanceForArts" as="span" />}
                            {selectedStream === 'computer' && <TransText k="notifications.guidanceForComputer" as="span" />}
                          </h6>
                            <ul className="text-muted">
                              <li><TransText k="notifications.guidanceTip1" as="span" /></li>
                              <li><TransText k="notifications.guidanceTip2" as="span" /></li>
                              <li><TransText k="notifications.guidanceTip3" as="span" /></li>
                              <li><TransText k="notifications.guidanceTip4" as="span" /></li>
                            </ul>
                          </Col>
                          <Col md={6}>
                            <h6><TransText k="notifications.careerTips" as="span" />:</h6>
                            <ul className="text-muted">
                              <li><TransText k="notifications.careerTip1" as="span" /></li>
                              <li><TransText k="notifications.careerTip2" as="span" /></li>
                              <li><TransText k="notifications.careerTip3" as="span" /></li>
                              <li><TransText k="notifications.careerTip4" as="span" /></li>
                            </ul>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </div>
                )}

                {/* Instructions */}
                {!selectedStream && (
                  <Card className="shadow-sm border-0 instructions-card" style={{ borderRadius: '10px' }}>
                    <Card.Body className="p-4">

                      <h4><TransText k="notifications.howToGetGuidance" as="span" /></h4>
                      <p className="text-muted mb-0">
                        <strong><TransText k="notifications.step1" as="span" />:</strong> <TransText k="notifications.instructionStep1" as="span" /><br />
                        <strong><TransText k="notifications.step2" as="span" />:</strong> <TransText k="notifications.instructionStep2" as="span" /><br />
                        <strong><TransText k="notifications.step3" as="span" />:</strong> <TransText k="notifications.instructionStep3" as="span" />
                      </p>
                    </Card.Body>
                  </Card>
                )}

               
              </>
            )}
          </Container>
        </div>
      </div>

      {/* Course Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            {selectedCourse?.icon}
            <span className="ms-2">{getCourseName(selectedCourse?.name)}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCourse && (
            <div>
              <div className="mb-4">
                <h6 className="text-muted mb-2"><TransText k="notifications.courseDuration" as="span" /></h6>
                <Badge bg="info" className="fs-6">{selectedCourse.duration}</Badge>
              </div>
              
              <div className="mb-4">
                <h6 className="text-muted mb-2"><TransText k="notifications.description" as="span" /></h6>
                <p>{getCourseDescription(selectedCourse.name)}</p>
              </div>
              
              {/* Career Paths Section */}
              {selectedCourse.careerPaths && selectedCourse.careerPaths.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-3">
                    <FaLightbulb className="me-2 text-warning" />
                    Step-by-Step Career Guidance
                  </h6>
                  <Row>
                    {selectedCourse.careerPaths.map((path, index) => (
                      <Col md={6} key={index} className="mb-3">
                        <Card 
                          className={`h-100 border career-path-card ${selectedCareerPath === path ? 'selected' : ''}`}
                          style={{ cursor: 'pointer', borderRadius: '8px', overflow: 'hidden' }}
                          onClick={() => handleCareerPathClick(path, selectedCourse?.name)}
                        >
                          <Card.Body className="p-3" style={{ maxHeight: selectedCareerPath === path ? '400px' : 'auto', overflowY: selectedCareerPath === path ? 'auto' : 'visible' }}>
                            <h6 className="mb-2 text-primary">{path.path}</h6>
                            <div className="d-flex justify-content-between mb-2">
                              <Badge bg="success">{path.salary}</Badge>
                              <Badge bg="secondary">{path.growth}</Badge>
                            </div>
                            {selectedCareerPath === path && (
                              <div className="mt-3">
                                <h6 className="text-muted mb-2"><TransText k="notifications.stepsToAchieve" as="span" /></h6>
                                <ol className="ps-3 mb-0">
                                  {path.steps.map((step, idx) => (
                                    <li key={idx} className="mb-1 small">{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
              
              <div className="mb-4">
                <h6 className="text-muted mb-2">Career Opportunities</h6>
                <Row>
                  {selectedCourse.careers.map((career, index) => (
                    <Col md={6} key={index} className="mb-2">
                      <Badge bg="primary" className="w-100 py-2">
                        <FaCheckCircle className="me-2" />
                        {career}
                      </Badge>
                    </Col>
                  ))}
                </Row>
              </div>
              
              <Alert variant="info">
                <FaInfoCircle className="me-2" />
                <TransText k="notifications.tip" as="span" />
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <TransText k="button.close" as="span" />
          </Button>
          <Button variant="primary" onClick={() => {
            setShowModal(false)
            navigate('/UserDashboard')
          }}>
            <TransText k="settings.toDashboard" as="span" />
          </Button>
        </Modal.Footer>
      </Modal>


    </div>
  )
}

export default UserNotifications
