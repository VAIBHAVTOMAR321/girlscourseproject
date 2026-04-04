import React, { useState, useEffect, useRef } from 'react'
import { Container, Card, Button, Row, Col, Badge, Form, ProgressBar, Modal, Alert, Tab, Nav } from 'react-bootstrap'
import { FaGraduationCap, FaLightbulb, FaArrowLeft, FaFlask, FaCalculator, FaBook, FaBalanceScale, FaBrain, FaUserTie, FaWrench, FaCog, FaCertificate, FaCheckCircle, FaInfoCircle, FaUniversity, FaBusinessTime, FaCode, FaDna, FaBookOpen, FaPercentage } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import UseLeftNav from './UseLeftNav'
import UserTopNav from './UserTopNav'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import TransText from '../TransText'
import { getTranslation } from '../../utils/translations'
import axios from 'axios'
import '../../assets/css/UserSettings.css'
import CounselingForm from './CounselingForm'

const UserSettings = () => {
  const { uniqueId, userRoleType, accessToken } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [showCounseling, setShowCounseling] = useState(false)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [selectedStream, setSelectedStream] = useState('')
  const [percentage, setPercentage] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedCareerPath, setSelectedCareerPath] = useState(null)
  const [loading, setLoading] = useState(true)
  const resultsRef = useRef()
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
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  const handleMenuToggle = () => {
    if (isMobile) {
      setShowOffcanvas(!showOffcanvas)
    }
  }

  const streams = [
    { 
      id: 'science', 
      name: <TransText k="settings.science" as="span" />, 
      icon: <FaFlask />, 
      subjectsKey: 'settings.scienceSubjects'
    },
    { 
      id: 'commerce', 
      name: <TransText k="settings.commerce" as="span" />, 
      icon: <FaCalculator />, 
      subjectsKey: 'settings.commerceSubjects'
    },
    { 
      id: 'arts', 
      name: <TransText k="settings.arts" as="span" />, 
      icon: <FaBook />, 
      subjectsKey: 'settings.artsSubjects'
    },
    { 
      id: 'vocational', 
      name: <TransText k="settings.vocational" as="span" />, 
      icon: <FaWrench />, 
      subjectsKey: 'settings.vocationalSubjects'
    }
  ]

  // Stream mapping to handle any ID variations
  const getStreamKey = (streamId) => {
    const streamMap = {
      'science': 'science',
      'science-stream': 'science',
      'commerce': 'commerce',
      'commerce-stream': 'commerce',
      'arts': 'arts',
      'arts-stream': 'arts',
      'vocational': 'vocational',
      'vocational-stream': 'vocational'
    }
    return streamMap[streamId] || streamId
  }

  const getEleventhStreamsByTenthStreamAndPercentage = (stream, userPerc) => {
    // Normalize the stream key
    const streamKey = getStreamKey(stream)
    
    const eleventhStreamsData = {
      science: {
        high: [
          { 
            name: 'PCB (Physics, Chemistry, Biology)', 
            icon: <FaFlask />, 
            description: 'For students interested in medical and biological sciences', 
            careers: ['Doctor', 'Pharmacist', 'Biotechnologist', 'Research Scientist'],
            careerPaths: [
              { path: 'PCB → MBBS → Doctor', steps: ['Complete 11th-12th with PCB', 'Clear NEET exam', 'Complete MBBS (5.5 years)', 'Intern for 1 year', 'Become a doctor'], salary: '₹10-50 LPA', growth: 'Junior Doctor → Senior Doctor → Head of Department' }
            ]
          },
          { 
            name: 'PCM (Physics, Chemistry, Mathematics)', 
            icon: <FaCalculator />, 
            description: 'For students interested in engineering and technology', 
            careers: ['Engineer', 'Architect', 'Data Scientist', 'Pilot'],
            careerPaths: [
              { path: 'PCM → B.Tech → Engineer', steps: ['Complete 11th-12th with PCM', 'Clear JEE exam', 'Complete B.Tech (4 years)', 'Get campus placement', 'Grow to senior roles'], salary: '₹6-25 LPA', growth: 'Junior Engineer → Senior Engineer → Tech Lead' }
            ]
          }
        ],
        medium: [
          { 
            name: 'PCB (Physics, Chemistry, Biology)', 
            icon: <FaFlask />, 
            description: 'For students interested in medical and biological sciences', 
            careers: ['Nurse', 'Lab Technician', 'Pharmacist'],
            careerPaths: [
              { path: 'PCB → B.Sc Nursing → Nurse', steps: ['Complete 11th-12th with PCB', 'Clear nursing entrance', 'Complete B.Sc Nursing (4 years)', 'Register with nursing council', 'Work in hospital'], salary: '₹3-8 LPA', growth: 'Staff Nurse → Nursing Supervisor → Nursing Director' }
            ]
          }
        ],
        low: [
          { 
            name: 'Science with Computer Science', 
            icon: <FaCode />, 
            description: 'For students interested in computer applications', 
            careers: ['Computer Operator', 'Data Entry Operator', 'IT Support'],
            careerPaths: [
              { path: 'Science → BCA → IT Support', steps: ['Complete 11th-12th with Science', 'Complete BCA (3 years)', 'Learn IT support skills', 'Join company as IT support', 'Gain experience'], salary: '₹2-6 LPA', growth: 'IT Support → Senior Support → IT Manager' }
            ]
          }
        ]
      },
      commerce: {
        high: [
          { 
            name: 'Commerce with Mathematics', 
            icon: <FaCalculator />, 
            description: 'For students interested in finance and accounting', 
            careers: ['Chartered Accountant', 'Financial Analyst', 'Investment Banker'],
            careerPaths: [
              { path: 'Commerce → CA → Chartered Accountant', steps: ['Complete 11th-12th with Commerce', 'Register for CA Foundation', 'Clear IPCC', 'Complete articleship', 'Clear CA Final'], salary: '₹8-50 LPA', growth: 'Junior CA → Senior CA → Partner' }
            ]
          }
        ],
        medium: [
          { 
            name: 'Commerce with Informatics Practices', 
            icon: <FaCode />, 
            description: 'For students interested in business and technology', 
            careers: ['Business Analyst', 'Accountant', 'Tax Consultant'],
            careerPaths: [
              { path: 'Commerce → B.Com → Accountant', steps: ['Complete 11th-12th with Commerce', 'Complete B.Com (3 years)', 'Learn accounting software', 'Join company as accountant', 'Gain experience'], salary: '₹3-8 LPA', growth: 'Junior Accountant → Senior Accountant → Finance Manager' }
            ]
          }
        ],
        low: [
          { 
            name: 'Commerce with Entrepreneurship', 
            icon: <FaBusinessTime />, 
            description: 'For students interested in business management', 
            careers: ['Office Assistant', 'Sales Executive', 'Customer Service'],
            careerPaths: [
              { path: 'Commerce → BBA → Sales Executive', steps: ['Complete 11th-12th with Commerce', 'Complete BBA (3 years)', 'Join company as sales executive', 'Learn sales skills', 'Grow to manager'], salary: '₹2-6 LPA', growth: 'Sales Executive → Sales Manager → Sales Director' }
            ]
          }
        ]
      },
      arts: {
        high: [
          { 
            name: 'Arts with Psychology', 
            icon: <FaBrain />, 
            description: 'For students interested in human behavior', 
            careers: ['Psychologist', 'Counselor', 'HR Manager', 'Social Worker'],
            careerPaths: [
              { path: 'Arts → BA Psychology → Psychologist', steps: ['Complete 11th-12th with Arts', 'Complete BA Psychology (3 years)', 'Complete MA Psychology (2 years)', 'Get licensed', 'Start practice'], salary: '₹4-15 LPA', growth: 'Counselor → Psychologist → Clinical Psychologist' }
            ]
          }
        ],
        medium: [
          { 
            name: 'Arts with Political Science', 
            icon: <FaBalanceScale />, 
            description: 'For students interested in politics and law', 
            careers: ['Journalist', 'Content Writer', 'Office Assistant'],
            careerPaths: [
              { path: 'Arts → BA → Journalist', steps: ['Complete 11th-12th with Arts', 'Complete BA (3 years)', 'Pursue BJMC (3 years)', 'Intern with media house', 'Work as reporter'], salary: '₹3-12 LPA', growth: 'Reporter → Senior Journalist → Editor' }
            ]
          }
        ],
        low: [
          { 
            name: 'Arts with History', 
            icon: <FaBook />, 
            description: 'For students interested in history and civil services', 
            careers: ['Office Assistant', 'Data Entry Operator', 'Customer Service'],
            careerPaths: [
              { path: 'Arts → BA → Office Assistant', steps: ['Complete 11th-12th with Arts', 'Complete BA (3 years)', 'Learn office software', 'Join company as office assistant', 'Handle administrative tasks'], salary: '₹2-6 LPA', growth: 'Office Assistant → Office Manager → Admin Head' }
            ]
          }
        ]
      },
      vocational: {
        high: [
          { 
            name: 'ITI (Industrial Training Institute)', 
            icon: <FaWrench />, 
            description: 'For students interested in technical trades', 
            careers: ['Electrician', 'Fitter', 'Mechanic', 'Welder'],
            careerPaths: [
              { path: 'ITI → Electrician', steps: ['Complete 11th-12th', 'Join ITI (2 years)', 'Learn electrical work', 'Get certified', 'Join company or start own business'], salary: '₹3-10 LPA', growth: 'Electrician → Senior Electrician → Contractor' }
            ]
          }
        ],
        medium: [
          { 
            name: 'Polytechnic Diploma', 
            icon: <FaCog />, 
            description: 'For students interested in engineering diploma', 
            careers: ['Technician', 'Junior Engineer', 'Supervisor'],
            careerPaths: [
              { path: 'Polytechnic → Technician', steps: ['Complete 11th-12th', 'Join Polytechnic (3 years)', 'Learn engineering skills', 'Join company as technician', 'Gain experience'], salary: '₹2-6 LPA', growth: 'Technician → Senior Technician → Supervisor' }
            ]
          }
        ],
        low: [
          { 
            name: 'Certificate Courses', 
            icon: <FaCertificate />, 
            description: 'For students interested in skill-based training', 
            careers: ['Computer Operator', 'Data Entry Operator', 'Office Assistant'],
            careerPaths: [
              { path: 'Certificate → Computer Operator', steps: ['Complete 11th-12th', 'Complete certificate course (6 months-1 year)', 'Learn computer skills', 'Join company as computer operator', 'Handle data entry'], salary: '₹2-5 LPA', growth: 'Operator → Assistant → Office Manager' }
            ]
          }
        ]
      }
    }

    // Check if stream exists in data
    if (!eleventhStreamsData[streamKey]) {
      console.error('Stream not found:', streamKey)
      console.error('Available streams:', Object.keys(eleventhStreamsData))
      return []
    }

    // Get streams based on percentage
    const perc = Number(userPerc)
    if (perc >= 75) {
      return eleventhStreamsData[streamKey].high || []
    } else if (perc >= 60) {
      return eleventhStreamsData[streamKey].medium || []
    } else {
      return eleventhStreamsData[streamKey].low || []
    }
  }

  // Get translation key for stream description based on name
  const getStreamDescriptionKey = (streamName) => {
    const descriptionMap = {
      'PCB (Physics, Chemistry, Biology)': 'card.pcbHighDesc',
      'PCM (Physics, Chemistry, Mathematics)': 'card.pcmHighDesc',
      'PCMB (Physics, Chemistry, Mathematics, Biology)': 'settings.pcmbDesc',
      'Commerce with Mathematics': 'card.commerceMathHighDesc',
      'Commerce with Informatics Practices': 'settings.commerceITDesc',
      'Commerce with Entrepreneurship': 'settings.commerceEntDesc',
      'Arts with History': 'settings.artsHistDesc',
      'Arts with Political Science': 'settings.artsPolyDesc',
      'Arts with Psychology': 'settings.artsPsychDesc',
      'Arts with Sociology': 'settings.artsSocDesc',
      'ITI (Industrial Training Institute)': 'card.itiHighDesc',
      'Polytechnic Diploma': 'settings.polytechnicDesc',
      'Certificate Courses': 'settings.certificateDesc',
    }
    return descriptionMap[streamName] || null
  }

  const handleStreamChange = (e) => {
    setSelectedStream(e.target.value)
    setShowResults(false)
    setPercentage('')
  }

  const handlePercentageChange = (e) => {
    const value = e.target.value
    if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
      setPercentage(value)
    }
  }

  const handleGetGuidance = () => {
    if (!selectedStream) {
      alert('Please select your 10th stream first')
      return
    }
    if (!percentage || Number(percentage) <= 0) {
      alert('Please enter a valid percentage greater than 0')
      return
    }
    if (Number(percentage) > 100) {
      alert('Percentage cannot be more than 100')
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
        course: courseName
      } 
    })
  }

  const getPerformanceLevel = () => {
    const perc = Number(percentage)
    if (perc >= 75) return { level: 'Excellent', color: 'success', icon: <FaCheckCircle /> }
    if (perc >= 60) return { level: 'Good', color: 'warning', icon: <FaInfoCircle /> }
    return { level: 'Average', color: 'danger', icon: <FaInfoCircle /> }
  }

  const eleventhStreams = showResults ? getEleventhStreamsByTenthStreamAndPercentage(selectedStream, percentage) : []
  const performance = showResults ? getPerformanceLevel() : null
  
  // Get all 11th streams for the selected 10th stream
  const getAllEleventhStreamsForTenthStream = (stream) => {
    const streamKey = getStreamKey(stream)
    
    const allStreamsData = {
      science: [
        { 
          name: 'PCB (Physics, Chemistry, Biology)', 
          icon: <FaFlask />, 
          description: 'For students interested in medical and biological sciences', 
          careers: ['Doctor', 'Pharmacist', 'Biotechnologist', 'Research Scientist'],
          careerPaths: [
            { path: 'PCB → MBBS → Doctor', steps: ['Complete 11th-12th with PCB', 'Clear NEET exam', 'Complete MBBS (5.5 years)', 'Intern for 1 year', 'Become a doctor'], salary: '₹10-50 LPA', growth: 'Junior Doctor → Senior Doctor → Head of Department' }
          ]
        },
        { 
          name: 'PCM (Physics, Chemistry, Mathematics)', 
          icon: <FaCalculator />, 
          description: 'For students interested in engineering and technology', 
          careers: ['Engineer', 'Architect', 'Data Scientist', 'Pilot'],
          careerPaths: [
            { path: 'PCM → B.Tech → Engineer', steps: ['Complete 11th-12th with PCM', 'Clear JEE exam', 'Complete B.Tech (4 years)', 'Get campus placement', 'Grow to senior roles'], salary: '₹6-25 LPA', growth: 'Junior Engineer → Senior Engineer → Tech Lead' }
          ]
        },
        { 
          name: 'PCMB (Physics, Chemistry, Mathematics, Biology)', 
          icon: <FaDna />, 
          description: 'For students interested in both medical and engineering fields', 
          careers: ['Biomedical Engineer', 'Biotechnologist', 'Research Scientist'],
          careerPaths: [
            { path: 'PCMB → B.Tech Biomedical → Biomedical Engineer', steps: ['Complete 11th-12th with PCMB', 'Clear entrance exam', 'Complete B.Tech Biomedical (4 years)', 'Join hospital or medical device company', 'Grow to senior roles'], salary: '₹6-20 LPA', growth: 'Junior Engineer → Senior Engineer → R&D Head' }
          ]
        }
      ],
      commerce: [
        { 
          name: 'Commerce with Mathematics', 
          icon: <FaCalculator />, 
          description: 'For students interested in finance and accounting with strong math skills', 
          careers: ['Chartered Accountant', 'Financial Analyst', 'Investment Banker'],
          careerPaths: [
            { path: 'Commerce → B.Com → CA', steps: ['Complete 11th-12th with Commerce', 'Register for CA Foundation', 'Clear IPCC', 'Complete articleship', 'Clear CA Final'], salary: '₹8-50 LPA', growth: 'Junior CA → Senior CA → Partner' }
          ]
        },
        { 
          name: 'Commerce with Informatics Practices', 
          icon: <FaCode />, 
          description: 'For students interested in business and technology', 
          careers: ['Business Analyst', 'IT Consultant', 'E-commerce Manager'],
          careerPaths: [
            { path: 'Commerce → BBA → Business Analyst', steps: ['Complete 11th-12th with Commerce', 'Complete BBA (3 years)', 'Learn business analytics tools', 'Join company as analyst', 'Grow to senior roles'], salary: '₹5-20 LPA', growth: 'Junior Analyst → Senior Analyst → Manager' }
          ]
        },
        { 
          name: 'Commerce with Entrepreneurship', 
          icon: <FaBusinessTime />, 
          description: 'For students interested in starting their own business', 
          careers: ['Entrepreneur', 'Business Owner', 'Startup Founder'],
          careerPaths: [
            { path: 'Commerce → BBA → Entrepreneur', steps: ['Complete 11th-12th with Commerce', 'Complete BBA (3 years)', 'Identify business opportunity', 'Start own business', 'Scale operations'], salary: 'Variable', growth: 'Startup → Established Business → Industry Leader' }
          ]
        }
      ],
      arts: [
        { 
          name: 'Arts with History', 
          icon: <FaBook />, 
          description: 'For students interested in history and civil services', 
          careers: ['IAS Officer', 'Historian', 'Archaeologist', 'Professor'],
          careerPaths: [
            { path: 'Arts → BA History → UPSC', steps: ['Complete 11th-12th with Arts', 'Complete BA History (3 years)', 'Prepare for UPSC exam', 'Clear Prelims and Mains', 'Clear Interview'], salary: '₹10-25 LPA', growth: 'IAS Officer → District Collector → Secretary' }
          ]
        },
        { 
          name: 'Arts with Political Science', 
          icon: <FaBalanceScale />, 
          description: 'For students interested in politics and law', 
          careers: ['Lawyer', 'Politician', 'Political Analyst', 'Journalist'],
          careerPaths: [
            { path: 'Arts → BA Political Science → LLB', steps: ['Complete 11th-12th with Arts', 'Complete BA Political Science (3 years)', 'Pursue LLB (3 years)', 'Enroll with Bar Council', 'Practice under senior lawyer'], salary: '₹5-50 LPA', growth: 'Junior Lawyer → Senior Lawyer → Senior Advocate' }
          ]
        },
        { 
          name: 'Arts with Psychology', 
          icon: <FaBrain />, 
          description: 'For students interested in human behavior and counseling', 
          careers: ['Psychologist', 'Counselor', 'HR Manager', 'Social Worker'],
          careerPaths: [
            { path: 'Arts → BA Psychology → MA Psychology', steps: ['Complete 11th-12th with Arts', 'Complete BA Psychology (3 years)', 'Complete MA Psychology (2 years)', 'Get licensed', 'Start practice'], salary: '₹4-15 LPA', growth: 'Counselor → Psychologist → Clinical Psychologist' }
          ]
        },
        { 
          name: 'Arts with Sociology', 
          icon: <FaUserTie />, 
          description: 'For students interested in social issues and community work', 
          careers: ['Social Worker', 'NGO Worker', 'Community Developer', 'Researcher'],
          careerPaths: [
            { path: 'Arts → BA Sociology → MSW', steps: ['Complete 11th-12th with Arts', 'Complete BA Sociology (3 years)', 'Pursue MSW (2 years)', 'Join NGO', 'Lead social programs'], salary: '₹3-10 LPA', growth: 'Social Worker → Program Manager → Director' }
          ]
        }
      ],
      vocational: [
        { 
          name: 'ITI (Industrial Training Institute)', 
          icon: <FaWrench />, 
          description: 'For students interested in technical trades', 
          careers: ['Electrician', 'Fitter', 'Mechanic', 'Welder'],
          careerPaths: [
            { path: 'ITI → Electrician', steps: ['Complete 11th-12th', 'Join ITI (2 years)', 'Learn electrical work', 'Get certified', 'Join company or start own business'], salary: '₹3-10 LPA', growth: 'Electrician → Senior Electrician → Contractor' }
          ]
        },
        { 
          name: 'Polytechnic Diploma', 
          icon: <FaCog />, 
          description: 'For students interested in engineering diploma', 
          careers: ['Junior Engineer', 'Technician', 'Supervisor'],
          careerPaths: [
            { path: 'Polytechnic → Junior Engineer', steps: ['Complete 11th-12th', 'Join Polytechnic (3 years)', 'Learn engineering skills', 'Join manufacturing company', 'Gain experience'], salary: '₹3-8 LPA', growth: 'Technician → Supervisor → Manager' }
          ]
        },
        { 
          name: 'Certificate Courses', 
          icon: <FaCertificate />, 
          description: 'For students interested in skill-based training', 
          careers: ['Computer Operator', 'Data Entry Operator', 'Office Assistant'],
          careerPaths: [
            { path: 'Certificate → Computer Operator', steps: ['Complete 11th-12th', 'Complete certificate course (6 months-1 year)', 'Learn computer skills', 'Join company as computer operator', 'Handle data entry'], salary: '₹2-5 LPA', growth: 'Operator → Assistant → Office Manager' }
          ]
        }
      ]
    }
    
    return allStreamsData[streamKey] || []
  }
  
  // Get all 11th streams from all streams (not just selected stream)
  const getAllEleventhStreams = () => {
    // Get all streams from all streams
    return [
      ...getAllEleventhStreamsForTenthStream('science'),
      ...getAllEleventhStreamsForTenthStream('commerce'),
      ...getAllEleventhStreamsForTenthStream('arts'),
      ...getAllEleventhStreamsForTenthStream('vocational')
    ]
  }
  
  const allEleventhStreams = showResults ? getAllEleventhStreams() : []

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
                <TransText k="settings.backToDashboard" as="span" />
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" style={{ width: '60px', height: '60px' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3"><TransText k="settings.loading" as="span" /></p>
              </div>
            ) : (
              <div>
                {/* Header Card */}
                <Card className="shadow-sm mb-4 border-0 notifications-header-card" style={{ borderRadius: '10px' }}>
                  <Card.Body className="card-mobile">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                      <div>
                        <h3 className="mb-2">
                          <FaGraduationCap className="me-2 text-primary" />
                          <TransText k="settings.guidanceTitle" as="span" />
                        </h3>
                        <p className="text-muted mb-0">
                          <TransText k="settings.guidanceSubtitle" as="span" />
                        </p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Counseling Form */}
                <CounselingForm
                  onSubmit={handleCounselingSubmit}
                  showForm={showCounseling}
                  onToggle={setShowCounseling}
                  initialData={userData}
                  userRoleType={userRoleType}
                />

                {/* Step 1: Select Stream */}
                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                  <Card.Body className="card-mobile">
                    <h5 className="mb-3">
                      <Badge bg="primary" className="me-2"><TransText k="settings.step1" as="span" /></Badge>
                      <TransText k="settings.selectStream" as="span" />
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
                              <h6 className="mb-1">{stream.name}</h6>
                              <small className="text-muted">{getTranslation(stream.subjectsKey, language)}</small>
                              {selectedStream === stream.id && (
                                <Badge bg="primary" className="mt-2">
                                  <FaCheckCircle className="me-1" /> <TransText k="settings.selected" as="span" />
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
                    <Card.Body className="">
                      <h5 className="mb-3">
                        <Badge bg="primary" className="me-2"><TransText k="settings.step2" as="span" /></Badge>
                        <TransText k="settings.enterPercentage" as="span" />
                      </h5>
                      <Row className="align-items-center">
                        <Col md={6}>
                          <div className="percentage-input-wrapper">
                            <Form.Control
                              type="number"
                              placeholder="Enter your percentage (e.g., 75)"
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
                            <TransText k="settings.getGuidance" as="span" />
                          </Button>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                )}

                {/* Step 3: Results */}
                {showResults && (
                  <div ref={resultsRef}>
                    {eleventhStreams.length === 0 ? (
                      <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                        <Card.Body className=" text-center">
                          <FaInfoCircle className="text-warning mb-3" style={{ fontSize: '48px' }} />
                          <h4><TransText k="settings.noRecommendations" as="span" /></h4>
                          <p className="text-muted mb-0">
                            <TransText k="settings.noRecDesc" as="span" />
                          </p>
                        </Card.Body>
                      </Card>
                    ) : (
                      <>
                        {/* Performance Summary */}
                        <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                          <Card.Body className="">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <h5 className="mb-1"><TransText k="settings.performanceTitle" as="span" /></h5>
                                <p className="text-muted mb-0">
                                  <TransText k="settings.basedOn" as="span" /> {percentage}% <TransText k="settings.in" as="span" /> {streams.find(s => s.id === selectedStream)?.name}
                                </p>
                              </div>
                              <div className="text-end">
                                <Badge bg={performance.color} className="fs-5 p-3">
                                  {performance.icon} <TransText k={`settings.${performance.level.toLowerCase()}`} as="span" />
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

                        {/* Streams Tabs */}
                        <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                          <Card.Header className="bg-white border-0 pt-4 pb-0">
                            <h5 className="mb-0">
                              <FaUniversity className="me-2 text-primary" />
                              <TransText k="settings.eleventhStreamRec" as="span" />
                            </h5>
                            <p className="text-muted mb-0">
                              Browse recommended 11th streams based on your percentage and all available streams for your 10th stream
                            </p>
                          </Card.Header>
                          <Card.Body className="">
                            <Tab.Container id="streams-tabs" defaultActiveKey="recommended">
                              <Nav variant="tabs" className="mb-4">
                                <Nav.Item>
                                  <Nav.Link eventKey="recommended">
                                    <FaUniversity className="me-2" />
                                    <TransText k="settings.recommendedStreams" as="span" />
                                  </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                  <Nav.Link eventKey="all">
                                    <FaBookOpen className="me-2" />
                                    <TransText k="settings.allStreams" as="span" /> {streams.find(s => s.id === selectedStream)?.name}
                                  </Nav.Link>
                                </Nav.Item>
                              </Nav>
                              <Tab.Content>
                                <Tab.Pane eventKey="recommended">
                                  <Row>
                                    {eleventhStreams.map((stream, index) => (
                                      <Col lg={4} md={6} className="mb-4" key={index}>
                                        <Card 
                                          className="h-100 border course-card"
                                          style={{ cursor: 'pointer' }}
                                          onClick={() => handleCourseClick(stream)}
                                        >
                                          <Card.Body className="">
                                            <div className="d-flex align-items-start gap-3 mb-3">
                                              <div className="course-icon-large">
                                                {stream.icon}
                                              </div>
                                              <div>
                                                <h6 className="mb-1">{stream.name}</h6>
                                                <Badge bg="info">{stream.careers.length} <TransText k="card.careerOptions" as="span" /></Badge>
                                              </div>
                                            </div>
                                            <p className="text-muted small mb-3">
                                              {getStreamDescriptionKey(stream.name) ? getTranslation(getStreamDescriptionKey(stream.name), language) : stream.description}
                                            </p>
                                            <div className="mt-auto">
                                              <small className="text-muted d-block mb-2">Career Opportunities:</small>
                                              <div className="d-flex flex-wrap gap-1">
                                                {stream.careers.slice(0, 3).map((career, idx) => (
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
                                </Tab.Pane>
                                <Tab.Pane eventKey="all">
                                  <Row>
                                    {allEleventhStreams.map((stream, index) => (
                                      <Col lg={4} md={6} className="mb-4" key={index}>
                                        <Card 
                                          className="h-100 border course-card"
                                          style={{ cursor: 'pointer' }}
                                          onClick={() => handleCourseClick(stream)}
                                        >
                                          <Card.Body className="">
                                            <div className="d-flex align-items-start gap-3 mb-3">
                                              <div className="course-icon-large">
                                                {stream.icon}
                                              </div>
                                              <div>
                                                <h6 className="mb-1">{stream.name}</h6>
                                                <Badge bg="info">{stream.careers.length} <TransText k="card.careerOptions" as="span" /></Badge>
                                              </div>
                                            </div>
                                            <p className="text-muted small mb-3">
                                              {getStreamDescriptionKey(stream.name) ? getTranslation(getStreamDescriptionKey(stream.name), language) : stream.description}
                                            </p>
                                            <div className="mt-auto">
                                              <small className="text-muted d-block mb-2">Career Opportunities:</small>
                                              <div className="d-flex flex-wrap gap-1">
                                                {stream.careers.slice(0, 3).map((career, idx) => (
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
                                </Tab.Pane>
                              </Tab.Content>
                            </Tab.Container>
                          </Card.Body>
                        </Card>

                        {/* Additional Guidance */}
                        <Card className="shadow-sm border-0 guidance-card" style={{ borderRadius: '10px' }}>
                          <Card.Body className="">
                            <h5 className="mb-3">
                              <FaLightbulb className="me-2 text-warning" />
                              <TransText k="settings.additionalGuidance" as="span" />
                            </h5>
                            <Row>
                              <Col md={6}>
                                <h6><TransText k="settings.guidanceFor" as="span" /> {streams.find(s => s.id === selectedStream)?.name} <TransText k="settings.students" as="span" />:</h6>
                                <ul className="text-muted">
                                  <li>Focus on your core subjects and build strong fundamentals</li>
                                  <li>Participate in extracurricular activities related to your stream</li>
                                  <li>Consider internships and practical experience</li>
                                  <li>Prepare for competitive exams if applicable</li>
                                </ul>
                              </Col>
                              <Col md={6}>
                                <h6><TransText k="settings.careerTips" as="span" />:</h6>
                                <ul className="text-muted">
                                  <li>Research about the streams and their career prospects</li>
                                  <li>Talk to professionals in your field of interest</li>
                                  <li>Build a strong portfolio or resume</li>
                                  <li>Stay updated with industry trends</li>
                                </ul>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </>
                    )}
                    
                  </div>
                )}

                {/* Instructions */}
                {!selectedStream && (
                  <Card className="shadow-sm border-0 instructions-card" style={{ borderRadius: '10px' }}>
                    <Card.Body className="">
                     
                      <h4><TransText k="settings.howToGetGuidance" as="span" /></h4>
                      <p className="text-muted mb-0">
                        <strong><TransText k="settings.step1" as="span" />:</strong> Select your 10th stream from the options above<br />
                        <strong><TransText k="settings.step2" as="span" />:</strong> Enter your 10th percentage<br />
                        <strong><TransText k="settings.step3" as="span" />:</strong> Click "<TransText k="settings.getGuidance" as="span" />" to see personalized 11th stream recommendations and career paths
                      </p>
                    </Card.Body>
                  </Card>
                )}
              </div>
            )}
          </Container>
        </div>
      </div>

      {/* Stream Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            {selectedCourse?.icon}
            <span className="ms-2">{selectedCourse?.name}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
              {selectedCourse && (
            <div>
              <div className="mb-4">
                <h6 className="text-muted mb-2"><TransText k="settings.description" as="span" /></h6>
                <p>
                  {getStreamDescriptionKey(selectedCourse.name) ? getTranslation(getStreamDescriptionKey(selectedCourse.name), language) : selectedCourse.description}
                </p>
              </div>
              
              {/* Career Paths Section */}
              {selectedCourse.careerPaths && selectedCourse.careerPaths.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-muted mb-3">
                    <FaLightbulb className="me-2 text-warning" />
                    <TransText k="settings.stepByStep" as="span" />
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
                                <h6 className="text-muted mb-2"><TransText k="settings.stepsToAchieve" as="span" />:</h6>
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
              
              {/* Career Opportunities */}
              <div className="mb-4">
                <h6 className="text-muted mb-2"><TransText k="settings.careerOpportunities" as="span" /></h6>
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
                <strong>Tip:</strong> <TransText k="settings.tip" as="span" />
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            setShowModal(false)
            navigate('/UserDashboard')
          }}>
            Go to Dashboard
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default UserSettings