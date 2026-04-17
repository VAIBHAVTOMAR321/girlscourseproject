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
  const [prepType, setPrepType] = useState('govtCollege') // 'private', 'govtCollege', or 'govtJob'
  const [selectedGovtExam, setSelectedGovtExam] = useState('IIT-JEE')
  const [selectedGovtCollege, setSelectedGovtCollege] = useState('IIT')
  const [selectedCollegeTab, setSelectedCollegeTab] = useState('recommended')
  const navigate = useNavigate()
  const resultsRef = useRef(null)
  const tabsRef = useRef(null)
  const examRoadmapRef = useRef(null)
  const collegeRoadmapRef = useRef(null)
  const courseDetailsRef = useRef(null)

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

  const govtExamTypes = ['IIT-JEE', 'NEET', 'UPSC', 'GATE', 'SSC', 'Banking', 'Railway', 'StatePSC']

  const getFilteredExamTypes = () => {
    if (selectedStream === 'science') {
      return ['IIT-JEE', 'NEET', 'UPSC', 'GATE', 'Banking', 'SSC', 'Railway', 'StatePSC', 'NDA']
    } else if (selectedStream === 'commerce') {
      return ['UPSC', 'Banking', 'SSC', 'Railway', 'StatePSC', 'NDA']
    } else if (selectedStream === 'arts') {
      return ['UPSC', 'SSC', 'Banking', 'Railway', 'StatePSC', 'NDA']
    } else if (selectedStream === 'computer') {
      return ['IIT-JEE', 'NEET', 'UPSC', 'GATE', 'Banking', 'SSC', 'Railway', 'StatePSC', 'NDA']
    }
    return govtExamTypes
  }

  const filteredExamTypes = selectedStream ? getFilteredExamTypes() : govtExamTypes

  // Get translated exam data based on current language
  const getExamData = () => {
    const isHindi = language === 'hi'
    return {
      'IIT-JEE': {
        title: isHindi ? getTranslation('exam.iitJee', language) : 'IIT-JEE (Engineering)',
        titleKey: 'exam.iitJee',
        icon: <FaCog />,
        fullPath: isHindi ? '12वीं (PCM) → JEE Main → JEE Advanced → IIT/NIT/IIIT → B.Tech' : '12th (PCM) → JEE Main → JEE Advanced → IIT/NIT/IIIT → B.Tech',
        steps: [
          { step: 1, titleKey: 'step.complete12thPcm', title: isHindi ? getTranslation('step.complete12thPcm', language) : 'Complete 12th with PCM', description: isHindi ? 'Physics, Chemistry, Mathematics पूरा करें' : 'Complete 12th with Physics, Chemistry, Mathematics', duration: isHindi ? '2 साल' : '2 Years' },
          { step: 2, titleKey: 'step.prepareJeeMain', title: isHindi ? getTranslation('step.prepareJeeMain', language) : 'Prepare for JEE Main', description: isHindi ? 'PCM का पूरा पाठ्यक्रम कवर करें' : 'Cover complete syllabus of PCM', duration: isHindi ? '1-2 साल' : '1-2 Years' },
          { step: 3, titleKey: 'step.appearJeeMain', title: isHindi ? getTranslation('step.appearJeeMain', language) : 'Appear for JEE Main', description: isHindi ? 'JEE Main exam क्लियर करें' : 'Clear JEE Main exam', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 4, titleKey: 'step.prepareJeeAdvanced', title: isHindi ? getTranslation('step.prepareJeeAdvanced', language) : 'Prepare for JEE Advanced', description: isHindi ? 'JEE Main क्वालिफाई होने पर' : 'If qualified in JEE Main', duration: isHindi ? '6-12 महीने' : '6-12 Months' },
          { step: 5, titleKey: 'step.josaaCounseling', title: isHindi ? getTranslation('step.josaaCounseling', language) : 'JoSAA Counseling', description: isHindi ? 'काउंसलिंग में भाग लें' : 'Participate in counseling', duration: isHindi ? 'परिणाम के बाद' : 'After Results' },
          { step: 6, titleKey: 'step.completeBtech', title: isHindi ? getTranslation('step.completeBtech', language) : 'Complete B.Tech', description: isHindi ? '4 साल का इंजीनियरिंग डिग्री' : '4-year engineering degree', duration: isHindi ? '4 साल' : '4 Years' }
        ],
        colleges: [
          { name: isHindi ? 'IIT मुंबई' : 'IIT Bombay', location: isHindi ? 'मुंबई' : 'Mumbai', seats: '~1000' },
          { name: isHindi ? 'IIT दिल्ली' : 'IIT Delhi', location: isHindi ? 'दिल्ली' : 'Delhi', seats: '~900' },
          { name: isHindi ? 'IIT मद्रास' : 'IIT Madras', location: isHindi ? 'चेन्नई' : 'Chennai', seats: '~800' },
          { name: isHindi ? 'NIT त्रिची' : 'NIT Trichy', location: isHindi ? 'तिरुचिरापल्ली' : 'Tiruchirappalli', seats: '~1500' },
          { name: isHindi ? 'NIT सुराथकल' : 'NIT Surathkal', location: isHindi ? 'कर्नाटक' : 'Karnataka', seats: '~1200' }
        ]
      },
      'NEET': {
        title: isHindi ? getTranslation('exam.neet', language) : 'NEET (Medical)',
        titleKey: 'exam.neet',
        icon: <FaHeartbeat />,
        fullPath: isHindi ? '12वीं (PCB) → NEET → MBBS → डॉक्टर' : '12th (PCB) → NEET → MBBS → Doctor',
        steps: [
          { step: 1, titleKey: 'step.complete12thPcb', title: isHindi ? getTranslation('step.complete12thPcb', language) : 'Complete 12th with PCB', description: isHindi ? 'Physics, Chemistry, Biology के साथ 12वीं पूरा करें' : 'Complete 12th with Physics, Chemistry, Biology', duration: isHindi ? '2 साल' : '2 Years' },
          { step: 2, titleKey: 'step.prepareNeet', title: isHindi ? getTranslation('step.prepareNeet', language) : 'Prepare for NEET', description: isHindi ? 'PCB का पूरा पाठ्यक्रम कवर करें' : 'Cover complete PCB syllabus', duration: isHindi ? '1-2 साल' : '1-2 Years' },
          { step: 3, titleKey: 'step.appearNeet', title: isHindi ? getTranslation('step.appearNeet', language) : 'Appear for NEET', description: isHindi ? 'NEET exam क्लियर करें' : 'Clear NEET exam', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 4, titleKey: 'step.neetCounseling', title: isHindi ? getTranslation('step.neetCounseling', language) : 'NEET Counseling', description: isHindi ? 'All India Quota में भाग लें' : 'Participate in All India Quota', duration: isHindi ? 'परिणाम के बाद' : 'After Results' },
          { step: 5, titleKey: 'step.completeMbbs', title: isHindi ? getTranslation('step.completeMbbs', language) : 'Complete MBBS', description: isHindi ? 'इंटर्नशिप सहित 5.5 साल' : '5.5 years including internship', duration: isHindi ? '5.5 साल' : '5.5 Years' }
        ],
        colleges: [
          { name: isHindi ? 'AIIMS दिल्ली' : 'AIIMS Delhi', location: isHindi ? 'दिल्ली' : 'Delhi', seats: '~100' },
          { name: isHindi ? 'मौलाना आजाद मेडिकल कॉलेज' : 'Maulana Azad Medical College', location: isHindi ? 'दिल्ली' : 'Delhi', seats: '~250' },
          { name: isHindi ? 'लेडी हार्डिंग मेडिकल कॉलेज' : 'Lady Hardinge Medical College', location: isHindi ? 'दिल्ली' : 'Delhi', seats: '~200' },
          { name: isHindi ? 'ग्रांट मेडिकल कॉलेज' : 'Grant Medical College', location: isHindi ? 'मुंबई' : 'Mumbai', seats: '~200' }
        ]
      },
      'UPSC': {
        title: isHindi ? getTranslation('exam.upsc', language) : 'UPSC Civil Services',
        titleKey: 'exam.upsc',
        icon: <FaLandmark />,
        fullPath: isHindi ? 'ग्रेजुएशन → UPSC CSE → IAS/IPS/IFS' : 'Graduate → UPSC CSE → IAS/IPS/IFS',
        steps: [
          { step: 1, titleKey: 'step.completeGraduation', title: isHindi ? getTranslation('step.completeGraduation', language) : 'Complete Graduation', description: isHindi ? 'किसी भी स्ट्रीम में ग्रेजुएट करें' : 'Graduate in any stream', duration: isHindi ? '3 साल' : '3 Years' },
          { step: 2, titleKey: 'step.basicPrep', title: isHindi ? getTranslation('step.basicPrep', language) : 'Basic Preparation', description: isHindi ? 'NCERTs, बुनियादी किताबें पढ़ें' : 'Read NCERTs, basic books', duration: isHindi ? '6-12 महीने' : '6-12 Months' },
          { step: 3, titleKey: 'step.deepPrep', title: isHindi ? getTranslation('step.deepPrep', language) : 'Deep Preparation', description: isHindi ? 'मानक किताबें, उत्तर लेखन' : 'Standard books, answer writing', duration: isHindi ? '1-2 साल' : '1-2 Years' },
          { step: 4, titleKey: 'step.appearPrelims', title: isHindi ? getTranslation('step.appearPrelims', language) : 'Appear for Prelims', description: isHindi ? 'UPSC Prelims क्लियर करें' : 'Clear UPSC Prelims', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 5, titleKey: 'step.appearMains', title: isHindi ? getTranslation('step.appearMains', language) : 'Appear for Mains', description: isHindi ? 'Mains क्लियर करें (9 पेपर)' : 'Clear Mains (9 papers)', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 6, titleKey: 'step.interview', title: isHindi ? getTranslation('step.interview', language) : 'Interview', description: isHindi ? 'व्यक्तित्व परीक्षण' : 'Personality Test', duration: isHindi ? '30 मिनट' : '30 Minutes' },
          { step: 7, titleKey: 'step.serviceAllocation', title: isHindi ? getTranslation('step.serviceAllocation', language) : 'Service Allocation', description: isHindi ? 'IAS/IPS/IFS सेवा प्राप्त करें' : 'Get IAS/IPS/IFS service', duration: isHindi ? 'परिणाम के बाद' : 'After Result' }
        ],
        colleges: [
          { name: isHindi ? 'IAS (भारतीय प्रशासनिक सेवा)' : 'IAS (Indian Administrative Service)', location: isHindi ? 'पूरा भारत' : 'All India', seats: isHindi ? 'विभिन्न' : 'Various' },
          { name: isHindi ? 'IPS (भारतीय पुलिस सेवा)' : 'IPS (Indian Police Service)', location: isHindi ? 'पूरा भारत' : 'All India', seats: isHindi ? 'विभिन्न' : 'Various' },
          { name: isHindi ? 'IFS (भारतीय विदेश सेवा)' : 'IFS (Indian Foreign Service)', location: isHindi ? 'पूरा भारत' : 'All India', seats: isHindi ? 'विभिन्न' : 'Various' }
        ]
      },
      'SSC': {
        title: isHindi ? getTranslation('exam.ssc', language) : 'SSC Exams',
        titleKey: 'exam.ssc',
        icon: <FaUserShield />,
        fullPath: isHindi ? '12वीं/ग्रेजुएशन → SSC Exams → सरकारी नौकरी' : '12th/Graduate → SSC Exams → Government Job',
        steps: [
          { step: 1, titleKey: 'step.checkEligibility', title: isHindi ? getTranslation('step.checkEligibility', language) : 'Check Eligibility', description: isHindi ? 'शैक्षिक योग्यता जांचें' : 'Check education qualification', duration: isHindi ? 'परीक्षा से पहले' : 'Before Exam' },
          { step: 2, titleKey: 'step.basicPrep', title: isHindi ? getTranslation('step.basicPrep', language) : 'Basic Preparation', description: isHindi ? 'English, Math, Reasoning, GK' : 'English, Math, Reasoning, GK', duration: isHindi ? '3-6 महीने' : '3-6 Months' },
          { step: 3, titleKey: 'step.deepPrep', title: isHindi ? getTranslation('step.deepPrep', language) : 'Deep Preparation', description: isHindi ? 'पिछले पेपर सॉल्व करें' : 'Solve previous papers', duration: isHindi ? '6-12 महीने' : '6-12 Months' },
          { step: 4, titleKey: 'step.appearTier1', title: isHindi ? getTranslation('step.appearTier1', language) : 'Appear for Tier 1', description: isHindi ? 'CBT exam क्लियर करें' : 'Clear CBT exam', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 5, titleKey: 'step.tier2Dv', title: isHindi ? getTranslation('step.tier2Dv', language) : 'Tier 2 & DV', description: isHindi ? 'Descriptive/Typing + Document Verification' : 'Descriptive/Typing + Document Verification', duration: isHindi ? 'Tier 1 के बाद' : 'After Tier 1' },
          { step: 6, titleKey: 'step.joining', title: isHindi ? getTranslation('step.joining', language) : 'Joining', description: isHindi ? 'जॉइनिंग लेटर प्राप्त करें' : 'Get joining letter', duration: isHindi ? 'DV के बाद' : 'After DV' }
        ],
        colleges: [
          { name: isHindi ? 'इनकम टैक्स इंस्पेक्टर' : 'Income Tax Inspector', location: isHindi ? 'केंद्रीय' : 'Central', seats: isHindi ? 'विभिन्न' : 'Various' },
          { name: isHindi ? 'एक्साइज इंस्पेक्टर' : 'Excise Inspector', location: isHindi ? 'केंद्रीय' : 'Central', seats: isHindi ? 'विभिन्न' : 'Various' },
          { name: isHindi ? 'सहायक वर्ग अधिकारी' : 'Assistant Section Officer', location: isHindi ? 'मंत्रालय' : 'Ministries', seats: isHindi ? 'विभिन्न' : 'Various' }
        ]
      },
      'Banking': {
        title: isHindi ? getTranslation('exam.banking', language) : 'Banking Exams',
        titleKey: 'exam.banking',
        icon: <FaMoneyBillWave />,
        fullPath: isHindi ? 'ग्रेजुएशन → PO/Clerk Exam → बैंक नौकरी' : 'Graduate → PO/Clerk Exam → Bank Job',
        steps: [
          { step: 1, titleKey: 'step.completeGraduation', title: isHindi ? getTranslation('step.completeGraduation', language) : 'Complete Graduation', description: isHindi ? 'किसी भी स्ट्रीम में ग्रेजुएट करें' : 'Graduate in any stream', duration: isHindi ? '3 साल' : '3 Years' },
          { step: 2, titleKey: 'step.checkEligibility', title: isHindi ? getTranslation('step.checkEligibility', language) : 'Check Eligibility', description: isHindi ? 'उम्र सीमा, प्रतिशत जांचें' : 'Check age limit, percentage', duration: isHindi ? 'परीक्षा से पहले' : 'Before Exam' },
          { step: 3, titleKey: 'step.basicPrep', title: isHindi ? getTranslation('step.basicPrep', language) : 'Basic Preparation', description: isHindi ? 'Quant, Reasoning, English, GA' : 'Quant, Reasoning, English, GA', duration: isHindi ? '3-6 महीने' : '3-6 Months' },
          { step: 4, titleKey: 'step.appearPrelims', title: isHindi ? getTranslation('step.appearPrelims', language) : 'Appear for Prelims', description: isHindi ? 'Prelims क्लियर करें' : 'Clear Prelims', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 5, titleKey: 'step.appearMains', title: isHindi ? getTranslation('step.appearMains', language) : 'Appear for Mains', description: isHindi ? 'Mains क्लियर करें' : 'Clear Mains', duration: isHindi ? 'Prelims के बाद' : 'After Prelims' },
          { step: 6, titleKey: 'step.interview', title: isHindi ? getTranslation('step.interview', language) : 'GD & Interview', description: isHindi ? 'Group Discussion + PI' : 'Group Discussion + PI', duration: isHindi ? 'Mains के बाद' : 'After Mains' },
          { step: 7, titleKey: 'step.joining', title: isHindi ? getTranslation('step.joining', language) : 'Joining', description: isHindi ? 'PO/Clerk पद प्राप्त करें' : 'Get PO/Clerk position', duration: isHindi ? 'परिणाम के बाद' : 'After Result' }
        ],
        colleges: [
          { name: isHindi ? 'SBI PO' : 'SBI PO', location: isHindi ? 'पूरा भारत' : 'All India', seats: isHindi ? 'विभिन्न' : 'Various' },
          { name: isHindi ? 'IBPS PO' : 'IBPS PO', location: isHindi ? 'पूरा भारत' : 'All India', seats: isHindi ? 'विभिन्न' : 'Various' },
          { name: isHindi ? 'RRB क्लर्क' : 'RRB Clerk', location: isHindi ? 'राज्यवार' : 'State-wise', seats: isHindi ? 'विभिन्न' : 'Various' }
        ]
      },
      'Railway': {
        title: isHindi ? getTranslation('exam.railway', language) : 'Railway Exams (RRB)',
        titleKey: 'exam.railway',
        icon: <FaTrain />,
        fullPath: isHindi ? '12वीं/ग्रेजुएशन → RRB Exam → रेलवे नौकरी' : '12th/Graduate → RRB Exam → Railway Job',
        steps: [
          { step: 1, titleKey: 'step.checkEligibility', title: isHindi ? getTranslation('step.checkEligibility', language) : 'Check Eligibility', description: isHindi ? 'योग्यता, उम्र जांचें' : 'Check qualification, age', duration: isHindi ? 'परीक्षा से पहले' : 'Before Exam' },
          { step: 2, titleKey: 'step.basicPrep', title: isHindi ? getTranslation('step.basicPrep', language) : 'Basic Preparation', description: isHindi ? 'Math, Reasoning, GA' : 'Math, Reasoning, GA', duration: isHindi ? '2-3 महीने' : '2-3 Months' },
          { step: 3, titleKey: 'step.deepPrep', title: isHindi ? getTranslation('step.deepPrep', language) : 'Deep Preparation', description: isHindi ? 'पिछले पेपर सॉल्व करें' : 'Solve previous papers', duration: isHindi ? '6-12 महीने' : '6-12 Months' },
          { step: 4, titleKey: 'step.appearCBT', title: isHindi ? 'CBT में बैठें' : 'Appear for CBT', description: isHindi ? 'Computer Based Test क्लियर करें' : 'Clear Computer Based Test', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 5, titleKey: 'step.skillTest', title: isHindi ? 'Skill Test/DV' : 'Skill Test/DV', description: isHindi ? 'Typing + Document Verification' : 'Typing + Document Verification', duration: isHindi ? 'CBT के बाद' : 'After CBT' },
          { step: 6, titleKey: 'step.medical', title: isHindi ? 'मेडिकल' : 'Medical', description: isHindi ? 'मेडिकल टेस्ट क्लियर करें' : 'Clear medical test', duration: isHindi ? 'Skill Test के बाद' : 'After Skill Test' },
          { step: 7, titleKey: 'step.joining', title: isHindi ? getTranslation('step.joining', language) : 'Joining', description: isHindi ? 'रेलवे में शामिल हों' : 'Join Railway', duration: isHindi ? 'मेडिकल के बाद' : 'After Medical' }
        ],
        colleges: [
          { name: isHindi ? 'RRB NTPC' : 'RRB NTPC', location: isHindi ? 'पूरा भारत' : 'All India', seats: isHindi ? 'विभिन्न' : 'Various' },
          { name: isHindi ? 'RRB Group D' : 'RRB Group D', location: isHindi ? 'पूरा भारत' : 'All India', seats: isHindi ? 'विभिन्न' : 'Various' },
          { name: isHindi ? 'RRB JE' : 'RRB JE', location: isHindi ? 'पूरा भारत' : 'All India', seats: isHindi ? 'विभिन्न' : 'Various' }
        ]
      },
      'StatePSC': {
        title: isHindi ? getTranslation('exam.statePsc', language) : 'State PSC Exams',
        titleKey: 'exam.statePsc',
        icon: <FaFlag />,
        fullPath: isHindi ? 'ग्रेजुएशन → State PSC Exam → राज्य सरकारी नौकरी' : 'Graduate → State PSC Exam → State Government Job',
        steps: [
          { step: 1, titleKey: 'step.completeGraduation', title: isHindi ? getTranslation('step.completeGraduation', language) : 'Complete Graduation', description: isHindi ? 'किसी भी स्ट्रीम में ग्रेजुएट करें' : 'Graduate in any stream', duration: isHindi ? '3 साल' : '3 Years' },
          { step: 2, titleKey: 'step.checkNotification', title: isHindi ? getTranslation('step.checkNotification', language) : 'Check Notification', description: isHindi ? 'State PSC सूचना जांचें' : 'Check state PSC notification', duration: isHindi ? 'सूचना मिलने पर' : 'When Notified' },
          { step: 3, titleKey: 'step.preliminary', title: isHindi ? getTranslation('step.preliminary', language) : 'Prepare for Preliminary', description: isHindi ? 'राज्य पाठ्यक्रम, पेपर' : 'State syllabus, papers', duration: isHindi ? '3-6 महीने' : '3-6 Months' },
          { step: 4, titleKey: 'step.mains', title: isHindi ? getTranslation('step.mains', language) : 'Prepare for Mains', description: isHindi ? 'राज्य-विशिष्ट विषय' : 'State-specific topics', duration: isHindi ? '6-12 महीने' : '6-12 Months' },
          { step: 5, titleKey: 'step.interview', title: isHindi ? getTranslation('step.interview', language) : 'Interview', description: isHindi ? 'व्यक्तित्व परीक्षण' : 'Personality Test', duration: isHindi ? 'Mains के बाद' : 'After Mains' },
          { step: 6, titleKey: 'step.joining', title: isHindi ? getTranslation('step.joining', language) : 'Joining', description: isHindi ? 'राज्य विभाग में शामिल हों' : 'Join state department', duration: isHindi ? 'परिणाम के बाद' : 'After Result' }
        ],
        colleges: [
          { name: isHindi ? 'राज्य प्रशासनिक सेवा' : 'State Administrative Service', location: isHindi ? 'राज्य की राजधानी' : 'State Capital', seats: isHindi ? 'विभिन्न' : 'Various' },
          { name: isHindi ? 'राज्य पुलिस सेवा' : 'State Police Service', location: isHindi ? 'पूरा राज्य' : 'State-wide', seats: isHindi ? 'विभिन्न' : 'Various' },
          { name: isHindi ? 'विभिन्न विभाग नौकरियां' : 'Various Dept Jobs', location: isHindi ? 'पूरा राज्य' : 'State-wide', seats: isHindi ? 'विभिन्न' : 'Various' }
        ]
      },
      'GATE': {
        title: isHindi ? getTranslation('exam.gate', language) : 'GATE (Graduate Aptitude Test in Engineering)',
        titleKey: 'exam.gate',
        icon: <FaFlask />,
        fullPath: isHindi ? 'ग्रेजुएशन (इंजीनियरिंग) → GATE → M.Tech/PSU जॉब' : 'Graduate (Engineering) → GATE → M.Tech/PSU Job',
        steps: [
          { step: 1, titleKey: 'step.completeBtech', title: isHindi ? getTranslation('step.completeBtech', language) : 'Complete B.Tech', description: isHindi ? 'इंजीनियरिंग में ग्रेजुएट करें' : 'Complete engineering graduation', duration: isHindi ? '4 साल' : '4 Years' },
          { step: 2, titleKey: 'step.gateSyllabus', title: isHindi ? 'GATE सिलेबस पढ़ें' : 'Study GATE Syllabus', description: isHindi ? 'अपने स्ट्रीम के अनुसार सिलेबस कवर करें' : 'Cover syllabus according to your stream', duration: isHindi ? '6-12 महीने' : '6-12 Months' },
          { step: 3, titleKey: 'step.gatePrep', title: isHindi ? 'GATE की तैयारी करें' : 'Prepare for GATE', description: isHindi ? 'पिछले पेपर सॉल्व करें, मॉक टेस्ट दें' : 'Solve previous papers, take mock tests', duration: isHindi ? '6-12 महीने' : '6-12 Months' },
          { step: 4, titleKey: 'step.appearGate', title: isHindi ? 'GATE में बैठें' : 'Appear for GATE', description: isHindi ? 'GATE exam क्लियर करें' : 'Clear GATE exam', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 5, titleKey: 'step.gateCounseling', title: isHindi ? 'GATE काउंसलिंग' : 'GATE Counseling', description: isHindi ? 'COAP CCMT में भाग लें' : 'Participate in COAP/CCMT', duration: isHindi ? 'परिणाम के बाद' : 'After Result' },
          { step: 6, titleKey: 'step.completeMtech', title: isHindi ? 'M.Tech पूरी करें' : 'Complete M.Tech', description: isHindi ? '2 साल का M.Tech कोर्स' : '2-year M.Tech course', duration: isHindi ? '2 साल' : '2 Years' }
        ],
        colleges: [
          { name: isHindi ? 'IIT मुंबई' : 'IIT Bombay', location: isHindi ? 'मुंबई' : 'Mumbai', seats: isHindi ? 'विभिन्न' : 'Various' },
          { name: isHindi ? 'IIT दिल्ली' : 'IIT Delhi', location: isHindi ? 'दिल्ली' : 'Delhi', seats: isHindi ? 'विभिन्न' : 'Various' },
          { name: isHindi ? 'IIT मद्रास' : 'IIT Madras', location: isHindi ? 'चेन्नई' : 'Chennai', seats: isHindi ? 'विभिन्न' : 'Various' },
          { name: isHindi ? 'IIT कानपुर' : 'IIT Kanpur', location: isHindi ? 'कानपुर' : 'Kanpur', seats: isHindi ? 'विभिन्न' : 'Various' },
          { name: isHindi ? 'NIT त्रिची' : 'NIT Trichy', location: isHindi ? 'तिरुचिरापल्ली' : 'Tiruchirappalli', seats: isHindi ? 'विभिन्न' : 'Various' }
        ]
      }
    }
  }

  const govtCollegeTypes = ['IIT', 'NIT', 'IIIT', 'Medical', 'NDA', 'ArtsCollege', 'CommerceCollege']

  const getFilteredCollegeTypes = () => {
    if (selectedStream === 'science') {
      return ['IIT', 'NIT', 'IIIT', 'Medical']
    } else if (selectedStream === 'commerce') {
      return ['CommerceCollege', 'NDA', 'ArtsCollege']
    } else if (selectedStream === 'arts') {
      return ['ArtsCollege', 'NDA', 'CommerceCollege']
    } else if (selectedStream === 'computer') {
      return ['IIT', 'NIT', 'IIIT']
    }
    return govtCollegeTypes
  }

  const filteredCollegeTypes = selectedStream ? getFilteredCollegeTypes() : govtCollegeTypes

  // Get govt college description based on selected stream
  const getGovtCollegeDescription = () => {
    const isHindi = language === 'hi'

    if (!selectedStream) {
      return isHindi ? "सभी स्ट्रीम और करियर विकल्प एक्सप्लोर करें" : "Explore all streams and career options"
    }

    switch (selectedStream) {
      case 'science':
        return isHindi ? "इंजीनियरिंग, मेडिकल और रिसर्च पथ" : "Engineering, medical & research pathways"
      case 'commerce':
        return isHindi ? "बिजनेस, फाइनेंस और प्रोफेशनल करियर" : "Business, finance & professional careers"
      case 'arts':
        return isHindi ? "मानविकी, रचनात्मकता और सिविल सर्विसेज पथ" : "Humanities, creativity & civil services paths"
      case 'computer':
        return isHindi ? "टेक्नोलॉजी, कोडिंग और इनोवेशन करियर" : "Technology, coding & innovation careers"
      default:
        return isHindi ? "सभी स्ट्रीम और करियर विकल्प एक्सप्लोर करें" : "Explore all streams and career options"
    }
  }

  useEffect(() => {
    if (selectedStream && filteredCollegeTypes.length > 0) {
      setSelectedGovtCollege(filteredCollegeTypes[0])
    }
  }, [selectedStream])

  const [govtExamData, setGovtExamData] = useState({})
  const [govtCollegeData, setGovtCollegeData] = useState({})

  useEffect(() => {
    setGovtExamData(getExamData())
  }, [language])

  useEffect(() => {
    setGovtCollegeData(getCollegeData())
  }, [language])

  // Get translated college data based on current language
  const getCollegeData = () => {
    const isHindi = language === 'hi'
    return {
      'IIT': {
        title: isHindi ? 'IIT (भारतीय प्रौद्योगिकी संस्थान)' : 'IIT (Indian Institutes of Technology)',
        titleKey: 'college.iit',
        icon: <FaCog />,
        fullPath: isHindi ? '12वीं (PCM) → JEE Main → JEE Advanced → IIT प्रवेश' : '12th (PCM) → JEE Main → JEE Advanced → IIT Admission',
        eligibility: isHindi ? 'PCM में JEE Main + Advanced क्वालिफाई' : 'JEE Main + Advanced qualified',
        seats: isHindi ? 'सभी IIT में ~17,000 सीट' : '~17,000 seats across all IITs',
        courses: isHindi ? ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'MBA', 'PhD'] : ['B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'MBA', 'PhD'],
        steps: [
          { step: 1, title: isHindi ? 'PCM के साथ 12वीं पूरी करें' : 'Complete 12th with PCM', description: isHindi ? 'Physics, Chemistry, Mathematics' : 'Physics, Chemistry, Mathematics', duration: isHindi ? '2 साल' : '2 Years' },
          { step: 2, title: isHindi ? 'JEE Main की तैयारी करें' : 'Prepare for JEE Main', description: isHindi ? 'PCM का पूरा पाठ्यक्रम कवर करें' : 'Cover complete PCM syllabus', duration: isHindi ? '1-2 साल' : '1-2 Years' },
          { step: 3, title: isHindi ? 'JEE Main में बैठें' : 'Appear for JEE Main', description: isHindi ? 'JEE Main exam क्लियर करें' : 'Clear JEE Main exam', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 4, title: isHindi ? 'JEE Advanced की तैयारी करें' : 'Prepare for JEE Advanced', description: isHindi ? 'JEE Main क्वालिफाई होने पर' : 'If qualified in JEE Main', duration: isHindi ? '6-12 महीने' : '6-12 Months' },
          { step: 5, title: isHindi ? 'JoSAA काउंसलिंग' : 'JoSAA Counseling', description: isHindi ? 'काउंसलिंग में भाग लें' : 'Participate in counseling', duration: isHindi ? 'परिणाम के बाद' : 'After Results' },
          { step: 6, title: isHindi ? 'IIT सीट प्राप्त करें' : 'Get IIT Seat', description: isHindi ? 'चॉइस फिलिंग में सीट लॉक करें' : 'Lock seat in choice filling', duration: isHindi ? 'प्रक्रिया' : 'Process' }
        ],
        colleges: [
          { name: isHindi ? 'IIT मुंबई' : 'IIT Bombay', location: isHindi ? 'मुंबई' : 'Mumbai', ranking: '#1', seats: '~1000' },
          { name: isHindi ? 'IIT दिल्ली' : 'IIT Delhi', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#2', seats: '~900' },
          { name: isHindi ? 'IIT मद्रास' : 'IIT Madras', location: isHindi ? 'चेन्नई' : 'Chennai', ranking: '#3', seats: '~800' },
          { name: isHindi ? 'IIT कानपुर' : 'IIT Kanpur', location: isHindi ? 'कानपुर' : 'Kanpur', ranking: '#4', seats: '~850' },
          { name: isHindi ? 'IIT खड़गपुर' : 'IIT Kharagpur', location: isHindi ? 'खड़गपुर' : 'Kharagpur', ranking: '#5', seats: '~900' },
          { name: isHindi ? 'IIT रुड़की' : 'IIT Roorkee', location: isHindi ? 'रुड़की' : 'Roorkee', ranking: '#6', seats: '~700' },
          { name: isHindi ? 'IIT गुवाहाटी' : 'IIT Guwahati', location: isHindi ? 'गुवाहाटी' : 'Guwahati', ranking: '#7', seats: '~650' },
          { name: isHindi ? 'IIT हैदराबाद' : 'IIT Hyderabad', location: isHindi ? 'हैदराबाद' : 'Hyderabad', ranking: '#8', seats: '~500' }
        ]
      },
      'NIT': {
        title: isHindi ? 'NIT (राष्ट्रीय प्रौद्योगिकी संस्थान)' : 'NIT (National Institutes of Technology)',
        titleKey: 'college.nit',
        icon: <FaUniversity />,
        fullPath: isHindi ? '12वीं (PCM) → JEE Main → CSAB काउंसलिंग → NIT प्रवेश' : '12th (PCM) → JEE Main → CSAB Counseling → NIT Admission',
        eligibility: isHindi ? 'PCM में JEE Main क्वालिफाई' : 'JEE Main qualified',
        seats: isHindi ? 'सभी NIT में ~25,000 सीट' : '~25,000 seats across all NITs',
        courses: isHindi ? ['B.Tech', 'M.Tech', 'MBA', 'M.Sc', 'PhD'] : ['B.Tech', 'M.Tech', 'MBA', 'M.Sc', 'PhD'],
        steps: [
          { step: 1, title: isHindi ? 'PCM के साथ 12वीं पूरी करें' : 'Complete 12th with PCM', description: isHindi ? 'Physics, Chemistry, Mathematics' : 'Physics, Chemistry, Mathematics', duration: isHindi ? '2 साल' : '2 Years' },
          { step: 2, title: isHindi ? 'JEE Main की तैयारी करें' : 'Prepare for JEE Main', description: isHindi ? 'PCM का पूरा पाठ्यक्रम कवर करें' : 'Cover complete PCM syllabus', duration: isHindi ? '1-2 साल' : '1-2 Years' },
          { step: 3, title: isHindi ? 'JEE Main में बैठें' : 'Appear for JEE Main', description: isHindi ? 'JEE Main exam क्लियर करें' : 'Clear JEE Main exam', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 4, title: isHindi ? 'रिजल्ट और रैंक जांचें' : 'Check Result & Rank', description: isHindi ? 'अपना JEE Main रैंक जांचें' : 'Check your JEE Main rank', duration: isHindi ? 'परिणाम के बाद' : 'After Result' },
          { step: 5, title: isHindi ? 'CSAB काउंसलिंग' : 'CSAB Counseling', description: isHindi ? 'काउंसलिंग में भाग लें' : 'Participate in counseling', duration: isHindi ? 'परिणाम के बाद' : 'After Result' },
          { step: 6, title: isHindi ? 'NIT सीट प्राप्त करें' : 'Get NIT Seat', description: isHindi ? 'चॉइस फिलिंग में सीट लॉक करें' : 'Lock seat in choice filling', duration: isHindi ? 'प्रक्रिया' : 'Process' }
        ],
        colleges: [
          { name: isHindi ? 'NIT त्रिची' : 'NIT Trichy', location: isHindi ? 'तिरुचिरापल्ली' : 'Tiruchirappalli', ranking: '#1', seats: '~1500' },
          { name: isHindi ? 'NIT सुराथकल' : 'NIT Surathkal', location: isHindi ? 'कर्नाटक' : 'Karnataka', ranking: '#2', seats: '~1200' },
          { name: isHindi ? 'NIT वरंगल' : 'NIT Warangal', location: isHindi ? 'तेलंगाना' : 'Telangana', ranking: '#3', seats: '~1000' },
          { name: isHindi ? 'NIT कालिकट' : 'NIT Calicut', location: isHindi ? 'केरल' : 'Kerala', ranking: '#4', seats: '~1100' },
          { name: isHindi ? 'NIT राउरकेला' : 'NIT Rourkela', location: isHindi ? 'उड़ीसा' : 'Odisha', ranking: '#5', seats: '~900' },
          { name: isHindi ? 'NIT जमशेदपुर' : 'NIT Jamshedpur', location: isHindi ? 'जमशेदपुर' : 'Jamshedpur', ranking: '#6', seats: '~800' },
          { name: isHindi ? 'NIT पुणे' : 'NIT Pune', location: isHindi ? 'पुणे' : 'Pune', ranking: '#7', seats: '~750' },
          { name: isHindi ? 'NIT हमीरपुर' : 'NIT Hamirpur', location: isHindi ? 'हमीरपुर' : 'Hamirpur', ranking: '#8', seats: '~700' }
        ]
      },
      'IIIT': {
        title: isHindi ? 'IIIT (भारतीय सूचना प्रौद्योगिकी संस्थान)' : 'IIIT (Indian Institutes of Information Technology)',
        titleKey: 'college.iiit',
        icon: <FaMicrochip />,
        fullPath: isHindi ? '12वीं (PCM) → JEE Main → CSAB/JoSAA → IIIT प्रवेश' : '12th (PCM) → JEE Main → CSAB/JoSAA → IIIT Admission',
        eligibility: isHindi ? 'PCM में JEE Main क्वालिफाई' : 'JEE Main qualified',
        seats: isHindi ? 'सभी IIIT में ~5,000 सीट' : '~5000 seats across all IIITs',
        courses: isHindi ? ['B.Tech', 'M.Tech', 'PhD'] : ['B.Tech', 'M.Tech', 'PhD'],
        steps: [
          { step: 1, title: isHindi ? 'PCM के साथ 12वीं पूरी करें' : 'Complete 12th with PCM', description: isHindi ? 'Physics, Chemistry, Mathematics' : 'Physics, Chemistry, Mathematics', duration: isHindi ? '2 साल' : '2 Years' },
          { step: 2, title: isHindi ? 'JEE Main की तैयारी करें' : 'Prepare for JEE Main', description: isHindi ? 'Mathematics और Physics पर फोकस करें' : 'Focus on Mathematics and Physics', duration: isHindi ? '1-2 साल' : '1-2 Years' },
          { step: 3, title: isHindi ? 'JEE Main में बैठें' : 'Appear for JEE Main', description: isHindi ? 'JEE Main exam क्लियर करें' : 'Clear JEE Main exam', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 4, title: isHindi ? 'रिजल्ट और रैंक जांचें' : 'Check Result & Rank', description: isHindi ? 'अपना JEE Main रैंक जांचें' : 'Check your JEE Main rank', duration: isHindi ? 'परिणाम के बाद' : 'After Result' },
          { step: 5, title: isHindi ? 'काउंसलिंग' : 'Counseling', description: isHindi ? 'काउंसलिंग में भाग लें' : 'Participate in counseling', duration: isHindi ? 'परिणाम के बाद' : 'After Result' },
          { step: 6, title: isHindi ? 'IIIT सीट प्राप्त करें' : 'Get IIIT Seat', description: isHindi ? 'चॉइस फिलिंग में सीट लॉक करें' : 'Lock seat in choice filling', duration: isHindi ? 'प्रक्रिया' : 'Process' }
        ],
        colleges: [
          { name: isHindi ? 'IIIT हैदराबाद' : 'IIIT Hyderabad', location: isHindi ? 'हैदराबाद' : 'Hyderabad', ranking: '#1', seats: '~300' },
          { name: isHindi ? 'IIIT बैंगलोर' : 'IIIT Bangalore', location: isHindi ? 'बैंगलोर' : 'Bangalore', ranking: '#2', seats: '~200' },
          { name: isHindi ? 'IIIT दिल्ली' : 'IIIT Delhi', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#3', seats: '~150' },
          { name: isHindi ? 'IIIT इलाहाबाद' : 'IIIT Allahabad', location: isHindi ? 'प्रयागराज' : 'Prayagraj', ranking: '#4', seats: '~250' },
          { name: isHindi ? 'IIIT पुणे' : 'IIIT Pune', location: isHindi ? 'पुणे' : 'Pune', ranking: '#5', seats: '~180' }
        ]
      },
      'Medical': {
        title: isHindi ? 'सरकारी मेडिकल कॉलेज' : 'Government Medical Colleges',
        titleKey: 'college.medical',
        icon: <FaHeartbeat />,
        fullPath: isHindi ? '12वीं (PCB) → NEET → AIQ/State काउंसलिंग → MBBS' : '12th (PCB) → NEET → AIQ/State Counseling → MBBS',
        eligibility: isHindi ? 'PCB में NEET क्वालिफाई' : 'PCB, NEET qualified',
        seats: isHindi ? '~50,000 सीट (सरकारी + प्राइवेट)' : '~50,000 seats (Govt + Pvt)',
        courses: isHindi ? ['MBBS', 'BDS', 'BAMS', 'BHMS', 'BNYS', 'BVSc', 'B.Sc Nursing'] : ['MBBS', 'BDS', 'BAMS', 'BHMS', 'BNYS', 'BVSc', 'B.Sc Nursing'],
        steps: [
          { step: 1, title: isHindi ? 'PCB के साथ 12वीं पूरी करें' : 'Complete 12th with PCB', description: isHindi ? 'Physics, Chemistry, Biology' : 'Physics, Chemistry, Biology', duration: isHindi ? '2 साल' : '2 Years' },
          { step: 2, title: isHindi ? 'NEET की तैयारी करें' : 'Prepare for NEET', description: isHindi ? 'PCB का पूरा पाठ्यक्रम कवर करें' : 'Cover complete PCB syllabus', duration: isHindi ? '1-2 साल' : '1-2 Years' },
          { step: 3, title: isHindi ? 'NEET में बैठें' : 'Appear for NEET', description: isHindi ? 'NEET exam क्लियर करें' : 'Clear NEET exam', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 4, title: isHindi ? 'रिजल्ट जांचें' : 'Check Result', description: isHindi ? 'अपना NEET स्कोर और रैंक जांचें' : 'Check your NEET score and rank', duration: isHindi ? 'परिणाम के बाद' : 'After Result' },
          { step: 5, title: isHindi ? 'AIQ काउंसलिंग' : 'AIQ Counseling', description: isHindi ? 'All India Quota काउंसलिंग' : 'All India Quota counseling', duration: isHindi ? 'परिणाम के बाद' : 'After Result' },
          { step: 6, title: isHindi ? 'मेडिकल कॉलेज प्राप्त करें' : 'Get Medical College', description: isHindi ? 'चॉइस फिलिंग में सीट लॉक करें' : 'Lock seat in choice filling', duration: isHindi ? 'प्रक्रिया' : 'Process' }
        ],
        colleges: [
          { name: isHindi ? 'AIIMS दिल्ली' : 'AIIMS Delhi', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#1', seats: '~100' },
          { name: isHindi ? 'मौलाना आजाद मेडिकल कॉलेज' : 'Maulana Azad Medical College', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#2', seats: '~250' },
          { name: isHindi ? 'लेडी हार्डिंग मेडिकल कॉलेज' : 'Lady Hardinge Medical College', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#3', seats: '~200' },
          { name: isHindi ? 'ग्रांट मेडिकल कॉलेज' : 'Grant Medical College', location: isHindi ? 'मुंबई' : 'Mumbai', ranking: '#4', seats: '~200' },
          { name: isHindi ? 'किंग जॉर्ज मेडिकल यूनिवर्सिटी' : 'King George Medical University', location: isHindi ? 'लखनऊ' : 'Lucknow', ranking: '#5', seats: '~250' },
          { name: isHindi ? 'CMC वेल्लोर' : 'CMC Vellore', location: isHindi ? 'वेल्लोर' : 'Vellore', ranking: '#6', seats: '~100' },
          { name: isHindi ? 'AFMC पुणे' : 'AFMC Pune', location: isHindi ? 'पुणे' : 'Pune', ranking: '#7', seats: '~150' },
          { name: isHindi ? 'जिपमर पुडुचेरी' : 'JIPMER Puducherry', location: isHindi ? 'पुडुचेरी' : 'Puducherry', ranking: '#8', seats: '~200' }
        ]
      },
      'NDA': {
        title: isHindi ? 'NDA (राष्ट्रीय रक्षा अकादमी)' : 'NDA (National Defence Academy)',
        titleKey: 'college.nda',
        icon: <FaFlag />,
        fullPath: isHindi ? '12वीं → NDA Exam → SSB Interview → अकादमी प्रशिक्षण' : '12th → NDA Exam → SSB Interview → Academy Training',
        eligibility: isHindi ? '12वीं पास (सेना के लिए Science), उम्र 16.5-19.5 साल' : '12th Pass (Science for Army), Age 16.5-19.5 years',
        seats: isHindi ? 'प्रति कोर्स ~400 सीट' : '~400 seats per course',
        courses: isHindi ? ['B.Sc', 'B.A', 'B.Com', 'BBA'] : ['B.Sc', 'B.A', 'B.Com', 'BBA'],
        steps: [
          { step: 1, title: isHindi ? '12वीं पूरी करें' : 'Complete 12th', description: isHindi ? 'किसी भी स्ट्रीम में 12वीं पास करें' : 'Pass 12th in any stream', duration: isHindi ? '2 साल' : '2 Years' },
          { step: 2, title: isHindi ? 'पात्रता जांचें' : 'Check Eligibility', description: isHindi ? 'उम्र 16.5-19.5 साल' : 'Age 16.5-19.5 years', duration: isHindi ? 'परीक्षा से पहले' : 'Before Exam' },
          { step: 3, title: isHindi ? 'NDA के लिए आवेदन करें' : 'Apply for NDA', description: isHindi ? 'NDA आवेदन पत्र भरें' : 'Fill NDA application form', duration: isHindi ? 'सूचना मिलने पर' : 'When Notified' },
          { step: 4, title: isHindi ? 'लिखित परीक्षा में बैठें' : 'Appear for Written', description: isHindi ? 'NDA लिखित exam क्लियर करें' : 'Clear NDA written exam', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 5, title: isHindi ? 'SSB Interview' : 'SSB Interview', description: isHindi ? '5-दिन का चयन प्रक्रिया' : '5-day selection process', duration: isHindi ? 'परिणाम के बाद' : 'After Result' },
          { step: 6, title: isHindi ? 'प्रशिक्षण' : 'Training', description: isHindi ? 'NDA में 3 साल का प्रशिक्षण' : '3-year training at NDA', duration: isHindi ? '3 साल' : '3 Years' }
        ],
        colleges: [
          { name: isHindi ? 'NDA (सेना)' : 'NDA (Army)', location: isHindi ? 'पुणे' : 'Pune', seats: '~300' },
          { name: isHindi ? 'NDA (नौसेना)' : 'NDA (Navy)', location: isHindi ? 'पुणे' : 'Pune', seats: '~50' },
          { name: isHindi ? 'NDA (वायुसेना)' : 'NDA (Air Force)', location: isHindi ? 'पुणे' : 'Pune', seats: '~50' },
          { name: isHindi ? 'IMA देहरादून' : 'IMA Dehradun', location: isHindi ? 'देहरादून' : 'Dehradun', seats: '~250' },
          { name: isHindi ? 'AFCAT Entry' : 'AFCAT Entry', location: isHindi ? 'विभिन्न' : 'Various', seats: isHindi ? 'विभिन्न' : 'Various' }
        ]
      },
      'ArtsCollege': {
        title: isHindi ? 'सरकारी कला एवं विज्ञान महाविद्यालय' : 'Government Arts & Science Colleges',
        titleKey: 'college.arts',
        icon: <FaBook />,
        fullPath: isHindi ? '12वीं (कला) → CUET/राज्य प्रवेश → BA/B.Com प्रवेश' : '12th (Arts) → CUET/State Admission → BA/B.Com Admission',
        eligibility: isHindi ? '12वीं पास, कुछ कॉलेज में CUET' : '12th Pass, CUET for some colleges',
        seats: isHindi ? 'हजारों सीट' : 'Thousands of seats',
        courses: isHindi ? ['BA', 'B.Com', 'B.Sc', 'MA', 'M.Com'] : ['BA', 'B.Com', 'B.Sc', 'MA', 'M.Com'],
        steps: [
          { step: 1, title: isHindi ? '12वीं पूरी करें' : 'Complete 12th', description: isHindi ? 'किसी भी स्ट्रीम में 12वीं पास करें' : 'Pass 12th in any stream', duration: isHindi ? '2 साल' : '2 Years' },
          { step: 2, title: isHindi ? 'CUET की तैयारी करें' : 'Prepare for CUET', description: isHindi ? 'CUET के लिए आवेदन करें' : 'Apply for CUET', duration: isHindi ? '2-3 महीने' : '2-3 Months' },
          { step: 3, title: isHindi ? 'CUET में बैठें' : 'Appear for CUET', description: isHindi ? 'CUET exam क्लियर करें' : 'Clear CUET exam', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 4, title: isHindi ? 'काउंसलिंग में भाग लें' : 'Participate in Counseling', description: isHindi ? 'कॉलेज चुनें और प्रवेश लें' : 'Choose college and get admission', duration: isHindi ? 'प्रक्रिया' : 'Process' },
          { step: 5, title: isHindi ? 'डिग्री पूरी करें' : 'Complete Degree', description: isHindi ? '3 साल का BA/B.Com कोर्स' : '3-year BA/B.Com course', duration: isHindi ? '3 साल' : '3 Years' }
        ],
        colleges: [
          { name: isHindi ? 'दिल्ली विश्वविद्यालय (DU)' : 'Delhi University (DU)', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#1', seats: '~5000' },
          { name: isHindi ? 'बनारस हिन्दू विश्वविद्यालय (BHU)' : 'Banaras Hindu University (BHU)', location: isHindi ? 'वाराणसी' : 'Varanasi', ranking: '#2', seats: '~3000' },
          { name: isHindi ? 'जवाहरलाल नेहरू विश्वविद्यालय (JNU)' : 'Jawaharlal Nehru University (JNU)', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#3', seats: '~2000' },
          { name: isHindi ? 'अलीगढ़ मुस्लिम विश्वविद्यालय (AMU)' : 'Aligarh Muslim University (AMU)', location: isHindi ? 'अलीगढ़' : 'Aligarh', ranking: '#4', seats: '~2500' },
          { name: isHindi ? 'हैदराबाद विश्वविद्यालय (UoH)' : 'University of Hyderabad (UoH)', location: isHindi ? 'हैदराबाद' : 'Hyderabad', ranking: '#5', seats: '~1500' },
          { name: isHindi ? 'जामिया मिलिया इस्लामिया (JMI)' : 'Jamia Millia Islamia (JMI)', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#6', seats: '~2000' },
          { name: isHindi ? 'पंजाब विश्वविद्यालय' : 'Punjab University', location: isHindi ? 'चंडीगढ़' : 'Chandigarh', ranking: '#7', seats: '~2500' },
          { name: isHindi ? 'कलकत्ता विश्वविद्यालय' : 'University of Calcutta', location: isHindi ? 'कोलकाता' : 'Kolkata', ranking: '#8', seats: '~3000' }
        ]
      },
      'CommerceCollege': {
        title: isHindi ? 'सरकारी वाणिज्य महाविद्यालय' : 'Government Commerce Colleges',
        titleKey: 'college.commerce',
        icon: <FaBriefcase />,
        fullPath: isHindi ? '12वीं (वाणिज्य/कला) → CUET/राज्य प्रवेश → B.Com प्रवेश' : '12th (Commerce/Arts) → CUET/State Admission → B.Com Admission',
        eligibility: isHindi ? '12वीं पास, कुछ कॉलेज में CUET' : '12th Pass, CUET for some colleges',
        seats: isHindi ? 'हजारों सीट' : 'Thousands of seats',
        courses: isHindi ? ['B.Com', 'BBA', 'M.Com', 'MBA'] : ['B.Com', 'BBA', 'M.Com', 'MBA'],
        steps: [
          { step: 1, title: isHindi ? '12वीं पूरी करें' : 'Complete 12th', description: isHindi ? 'वाणिज्य या कला स्ट्रीम में 12वीं' : '12th in Commerce or Arts stream', duration: isHindi ? '2 साल' : '2 Years' },
          { step: 2, title: isHindi ? 'CUET की तैयारी करें' : 'Prepare for CUET', description: isHindi ? 'CUET के लिए आवेदन करें' : 'Apply for CUET', duration: isHindi ? '2-3 महीने' : '2-3 Months' },
          { step: 3, title: isHindi ? 'CUET में बैठें' : 'Appear for CUET', description: isHindi ? 'CUET exam क्लियर करें' : 'Clear CUET exam', duration: isHindi ? 'परीक्षा' : 'Exam' },
          { step: 4, title: isHindi ? 'काउंसलिंग में भाग लें' : 'Participate in Counseling', description: isHindi ? 'कॉलेज चुनें और प्रवेश लें' : 'Choose college and get admission', duration: isHindi ? 'प्रक्रिया' : 'Process' },
          { step: 5, title: isHindi ? 'डिग्री पूरी करें' : 'Complete Degree', description: isHindi ? '3 साल का B.Com कोर्स' : '3-year B.Com course', duration: isHindi ? '3 साल' : '3 Years' }
        ],
        colleges: [
          { name: isHindi ? 'श्री राम कॉलेज ऑफ कॉमर्स (SRCC)' : 'Sri Ram College of Commerce (SRCC)', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#1', seats: '~1000' },
          { name: isHindi ? 'दिल्ली स्कूल ऑफ इकोनॉमिक्स (DSE)' : 'Delhi School of Economics (DSE)', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#2', seats: '~800' },
          { name: isHindi ? 'मिरांडा हाउस' : 'Miranda House', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#3', seats: '~600' },
          { name: isHindi ? 'हंसराज कॉलेज' : 'Hansraj College', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#4', seats: '~700' },
          { name: isHindi ? 'लेडी श्री राम कॉलेज' : 'Lady Shri Ram College', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#5', seats: '~500' },
          { name: isHindi ? 'सेंट स्टीफंस कॉलेज' : 'St. Stephens College', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#6', seats: '~500' },
          { name: isHindi ? 'हिंदू कॉलेज' : 'Hindu College', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#7', seats: '~700' },
          { name: isHindi ? 'श्रीवानाथ कॉलेज' : 'Shri Ram College of Commerce', location: isHindi ? 'दिल्ली' : 'Delhi', ranking: '#8', seats: '~600' }
        ]
      }
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
  const getCourseDescription = (courseName, fallbackDescription = '') => {
    const key = courseTranslationMap[courseName]
    const descKey = key ? key + 'Desc' : null
    return descKey ? getTranslation(descKey, language) : fallbackDescription
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
setPrepType('govtCollege')
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
    if (perc >= 75) return { levelKey: 'notifications.excellent', color: 'success', icon: <FaCheckCircle /> }
    if (perc >= 60) return { levelKey: 'notifications.good', color: 'warning', icon: <FaInfoCircle /> }
    return { levelKey: 'notifications.average', color: 'danger', icon: <FaInfoCircle /> }
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
        
        <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '220px', padding: isMobile ? '10px' : '20px 0px 0px 0px', minHeight: 'calc(100vh - 70px)' }}>
          <Container className='fixed-notifications'>
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
                              placeholder="Enter percentage"  
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
                              <TransText k="notifications.basedOn" as="span" /> {percentage}<TransText k="notifications.percentIn" as="span" /> {getStreamName(selectedStream)}
                            </p>
                          </div>
                          <div className="text-end govt-job-performance">
                            <Badge bg={performance.color} className="fs-5 p-3">
                              {performance.icon} <TransText k={performance.levelKey} as="span" />
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
                        <h5 className="mb-3"><TransText k="notifications.choosePath" as="span" /></h5>
                        <p className="text-muted mb-3"><TransText k="notifications.selectPreferredPath" as="span" /></p>
                        <Row className="g-3">
                          <Col lg={4} md={4} sm={12}>
                            <Card 
                              className={`h-100 border ${prepType === 'govtCollege' ? 'border-primary' : ''}`}
                              style={{ cursor: 'pointer', borderRadius: '10px', backgroundColor: prepType === 'govtCollege' ? '#4a90d9' : 'white', transition: 'all 0.3s ease' }}
                              onClick={() => { setPrepType('govtCollege'); setTimeout(() => { if (tabsRef.current) tabsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 100) }}
                            >
                              <Card.Body className="p-4 text-center">
                                <FaUniversity className={`fs-2 mb-2 ${prepType === 'govtCollege' ? 'text-white' : 'text-muted'}`} style={prepType === 'govtCollege' ? { filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' } : {}} />
                                <h6 className={prepType === 'govtCollege' ? 'text-white fw-bold' : 'text-muted'}><TransText k="notifications.govtCollegePath" as="span" /></h6>
                                <small className={prepType === 'govtCollege' ? 'text-white' : 'text-muted'}>{getGovtCollegeDescription()}</small>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col lg={4} md={4} sm={12}>
                            <Card 
                              className={`h-100 border ${prepType === 'govtJob' ? 'border-primary' : ''}`}
                              style={{ cursor: 'pointer', borderRadius: '10px', backgroundColor: prepType === 'govtJob' ? '#e7f1ff' : 'white' }}
                              onClick={() => { setPrepType('govtJob'); setTimeout(() => { if (tabsRef.current) tabsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 100) }}
                            >
                              <Card.Body className="p-4 text-center">
                                <FaShieldAlt className={`fs-2 mb-2 ${prepType === 'govtJob' ? 'text-primary' : 'text-muted'}`} />
                                <h6 className={prepType === 'govtJob' ? 'text-primary fw-bold' : ''}><TransText k="notifications.govtJobPath" as="span" /></h6>
                                <small className="text-muted"><TransText k="notifications.govtJobDesc" as="span" /></small>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col lg={4} md={4} sm={12}>
                            <Card 
                              className={`h-100 border ${prepType === 'private' ? 'border-primary' : ''}`}
                              style={{ cursor: 'pointer', borderRadius: '10px', backgroundColor: prepType === 'private' ? '#e7f1ff' : 'white' }}
                              onClick={() => { setPrepType('private'); setTimeout(() => { if (tabsRef.current) tabsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 100) }}
                            >
                              <Card.Body className="p-4 text-center">
                                <FaBriefcase className={`fs-2 mb-2 ${prepType === 'private' ? 'text-primary' : 'text-muted'}`} />
                                <h6 className={prepType === 'private' ? 'text-primary fw-bold' : ''}><TransText k="notifications.privatePath" as="span" /></h6>
                                <small className="text-muted"><TransText k="notifications.privateDesc" as="span" /></small>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    {/* Courses Tabs */}
                    <Card ref={tabsRef} className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                      <Card.Header className="bg-white border-0 pt-4 pb-0">
                        <h5 className="mb-0">
                          {prepType === 'govtJob' ? (
                            <>
                              <FaShieldAlt className="me-2 text-primary" />
                              <TransText k="notifications.govtJobRoadmap" as="span" />
                            </>
                          ) : prepType === 'govtCollege' ? (
                            <>
                              <FaUniversity className="me-2 text-white" />
                              <TransText k="notifications.govtCollegeRoadmap" as="span" />
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
                            ? <TransText k="notifications.selectExamPath" as="span" />
                            : prepType === 'govtCollege'
                            ? <TransText k="notifications.selectCollegePath" as="span" />
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
                              {filteredExamTypes.map((examType, index) => {
                                const examInfo = govtExamData[examType]
                                if (!examInfo) return null
                                return (
                                  <Col lg={4} md={6} sm={12} key={index} className="mb-4">
                                    <Card 
                                      className={`h-100 border ${selectedGovtExam === examType ? 'border-primary' : ''}`}
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => { setSelectedGovtExam(examType); setTimeout(() => { if (examRoadmapRef.current) examRoadmapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 100) }}
                                    >
                                      <Card.Body className="">
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
                              <Card ref={examRoadmapRef} className="border bg-light">
                                <Card.Body className="">
                                  <div className="mb-4">
                                    <h5 className="mb-3">
                                      {govtExamData[selectedGovtExam].icon}
                                      <span className="ms-2">{govtExamData[selectedGovtExam].title}</span>
                                    </h5>
                                    <p className="text-muted mb-3">
                                      <strong><TransText k="notifications.completePath" as="span" /></strong> {govtExamData[selectedGovtExam].fullPath}
                                    </p>
                                  </div>
                                  
                                  <h6 className="mb-3"><TransText k="notifications.stepByStepRoadmap" as="span" /></h6>
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
                                </Card.Body>
                              </Card>
                            )}
                          </div>
                        ) : prepType === 'govtCollege' ? (
                            /* Govt College Content */
                          <div className="mb-4">
                            <Tab.Container id="govt-college-tabs" defaultActiveKey="colleges">
                              <Nav variant="tabs" className="mb-4">
                                <Nav.Item>
                                  <Nav.Link eventKey="colleges">
<FaUniversity className="me-2" style={{ color: '#fff' }} />
                                    <TransText k="notifications.topColleges" as="span" />
                                  </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                  <Nav.Link eventKey="universities">
                                    <FaBuilding className="me-2" style={{ color: '#fff' }} />
                                    <TransText k="notifications.topUniversities" as="span" />
                                  </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                  <Nav.Link eventKey="recommended">
                                    <FaLightbulb className="me-2" />
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
                                <Tab.Pane eventKey="colleges">
                                  {filteredCollegeTypes.length === 0 ? (
                                    <Alert variant="info">
                                      <TransText k="notifications.noCollegeOptions" as="p" />
                                    </Alert>
                                  ) : (
                                  <>
                                  {/* College Type Selection Cards */}
                                  <Row className="mb-4">
                                    {filteredCollegeTypes.map((collegeType, index) => {
                                      const collegeInfo = govtCollegeData[collegeType]
                                      if (!collegeInfo) return null
                                      return (
                                        <Col lg={4} md={6} sm={12} key={index} className="mb-4">
                                          <Card 
                                            className={`h-100 border ${selectedGovtCollege === collegeType ? 'border-primary' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => { setSelectedGovtCollege(collegeType); setTimeout(() => { if (collegeRoadmapRef.current) collegeRoadmapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 100) }}
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
                                    <Card ref={collegeRoadmapRef} className="border bg-light">
                                      <Card.Body className="p-4">
                                        <div className="mb-4">
                                          <h5 className="mb-3">
                                            {govtCollegeData[selectedGovtCollege].icon}
                                            <span className="ms-2">{govtCollegeData[selectedGovtCollege].title}</span>
                                          </h5>
                                          <p className="text-muted mb-2">
                                            <strong><TransText k="notifications.completePath" as="span" /></strong> {govtCollegeData[selectedGovtCollege].fullPath}
                                          </p>
                                    <p className="text-muted mb-0">
                                      <strong><TransText k="notifications.eligibility" as="span" /></strong> {govtCollegeData[selectedGovtCollege].eligibility}
                                    </p>
                                  </div>
                                  
                                  <h6 className="mb-3"><TransText k="notifications.stepByStepRoadmap" as="span" /></h6>
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
                                </Card.Body>
                              </Card>
                            )}
                                  </>
                                  )}
                                </Tab.Pane>
                                <Tab.Pane eventKey="universities">
                                  <Row>
                                    {selectedStream === 'science' && (
                                      <>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">IIT Bombay</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Mumbai, Maharashtra</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">IIT Delhi</h6>
                                              </div>
                                              <p className="small text-muted mb-2">New Delhi</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">IIT Madras</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Chennai, Tamil Nadu</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">IIT Kharagpur</h6>
                                              </div>
                                              <p className="small text-muted mb-2">West Bengal</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">IIT Kanpur</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Uttar Pradesh</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">AIIMS Delhi</h6>
                                              </div>
                                              <p className="small text-muted mb-2">New Delhi</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaHospital className="text-danger" />
                                                </div>
                                                <h6 className="mb-0">PGIMER</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Chandigarh</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaHospital className="text-danger" />
                                                </div>
                                                <h6 className="mb-0">JIPMER</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Puducherry</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaHospital className="text-danger" />
                                                </div>
                                                <h6 className="mb-0">AFMC Pune</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Maharashtra</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                      </>
                                    )}
                                    {selectedStream === 'commerce' && (
                                      <>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">Delhi University</h6>
                                              </div>
                                              <p className="small text-muted mb-2">New Delhi</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaBriefcase className="" />
                                                </div>
                                                <h6 className="mb-0">SRCC</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Delhi</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">Lady Shri Ram</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Delhi</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">St. Stephen's</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Delhi</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">Christ University</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Bangalore</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">Symbiosis</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Pune</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                      </>
                                    )}
                                    {selectedStream === 'arts' && (
                                      <>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">Delhi University</h6>
                                              </div>
                                              <p className="small text-muted mb-2">New Delhi</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">Jamia Millia</h6>
                                              </div>
                                              <p className="small text-muted mb-2">New Delhi</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">BHU</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Varanasi</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">JNU</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Delhi</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">AMU</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Aligarh</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaGraduationCap style={{ color: '#fff' }} />
                                                </div>
                                                <h6 className="mb-0">UoH</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Hyderabad</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                      </>
                                    )}
                                    {selectedStream === 'computer' && (
                                      <>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaCode className="text-primary" />
                                                </div>
                                                <h6 className="mb-0">IIT Bombay</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Mumbai</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaCode className="text-primary" />
                                                </div>
                                                <h6 className="mb-0">IIT Delhi</h6>
                                              </div>
                                              <p className="small text-muted mb-2">New Delhi</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaCode className="text-primary" />
                                                </div>
                                                <h6 className="mb-0">IIT Madras</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Chennai</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaCode className="text-primary" />
                                                </div>
                                                <h6 className="mb-0">IIT Bangalore</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Karnataka</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaMicrochip className="text-warning" />
                                                </div>
                                                <h6 className="mb-0">IIIT Hyderabad</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Telangana</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                        <Col lg={4} md={6} sm={12} className="mb-4">
                                          <Card className="h-100 border" style={{ cursor: 'pointer' }}>
                                            <Card.Body className="p-3">
                                              <div className="d-flex align-items-center gap-2 mb-2">
                                                <div className="course-icon-large">
                                                  <FaMicrochip className="text-warning" />
                                                </div>
                                                <h6 className="mb-0">IIIT Bangalore</h6>
                                              </div>
                                              <p className="small text-muted mb-2">Karnataka</p>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                      </>
                                    )}
                                  </Row>
                                </Tab.Pane>
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
                                              <p className="text-muted small mb-3">{getCourseDescription(course.name, course.description)}</p>
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
                                      <TransText k="notifications.noRecommendedCourses" as="span" />
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
                                              <p className="text-muted small mb-3">{getCourseDescription(course.name, course.description)}</p>
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
                                      <TransText k="notifications.noCoursesAvailable" as="span" />
                                    </Alert>
                                  )}
                                </Tab.Pane>
                              </Tab.Content>
                            </Tab.Container>
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
                                            <p className="text-muted small mb-3">{getCourseDescription(course.name, course.description)}</p>
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
                                    <TransText k="notifications.noRecommendedCourses" as="span" />
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
                                            <p className="text-muted small mb-3">{getCourseDescription(course.name, course.description)}</p>
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
                                    <TransText k="notifications.noCoursesAvailable" as="span" />
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
                <p>{getCourseDescription(selectedCourse.name, selectedCourse.description)}</p>
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
                            <div className="d-flex justify-content-start mb-2">
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
