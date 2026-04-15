import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Alert, Accordion, Tab, Nav } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import TransText from '../TransText'
import { getTranslation } from '../../utils/translations'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaGraduationCap, FaChalkboardTeacher, FaBalanceScale, FaNewspaper, FaPaintBrush, FaHeartbeat, FaCog, FaHospital, FaFlask, FaLaptopMedical, FaSeedling, FaDna, FaBriefcase, FaUserTie, FaBuilding, FaChartBar, FaCode, FaMicrochip, FaNetworkWired, FaDatabase, FaRobot, FaCheckCircle, FaInfoCircle, FaLightbulb, FaBook, FaAward, FaCertificate, FaClock, FaRupeeSign, FaChartLine, FaUsers, FaBookOpen, FaClipboardList, FaStar, FaTrophy, FaRocket, FaUniversity, FaMapMarkerAlt, FaShieldAlt, FaTrain, FaLandmark, FaMoneyBillWave, FaUserShield, FaUserGraduate, FaFlag, FaBusAlt } from 'react-icons/fa'
import '../../assets/css/OccupationDetails.css'

const OccupationDetails = () => {
  const { uniqueId, userRoleType } = useAuth()
  const { language } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedGovtExam, setSelectedGovtExam] = useState('IIT-JEE')
  const navigate = useNavigate()
  const location = useLocation()
  const { occupation, stream, percentage, course, prepType: initialPrepType } = location.state || {}
  
  console.log('OccupationDetails - Course:', course)
  console.log('OccupationDetails - Occupation:', occupation)
  
  const [prepType, setPrepType] = useState(initialPrepType || 'private')

  // Helper function to get related occupations based on course
  const getRelatedOccupations = () => {
    const allOccupations = ['Teacher', 'Lawyer', 'Software Engineer', 'Doctor']
    
    console.log('getRelatedOccupations - Course:', course)
    console.log('getRelatedOccupations - Occupation:', occupation)
    
    if (!course) {
      console.log('No course, returning all occupations except current')
      return allOccupations.filter(occ => occ !== occupation)
    }
    
    const courseLower = course.toLowerCase()
    console.log('Course lowercase:', courseLower)
    
// Map courses to related occupations - using more flexible matching
    const courseOccupationMap = {
      'mbbs': ['Doctor'],
      'medicine': ['Doctor'],
      'medical': ['Doctor'],
      'b.tech': ['Software Engineer'],
      'b.sc': ['Teacher', 'Software Engineer'],
      'bca': ['Software Engineer'],
      'm.sc': ['Teacher', 'Software Engineer'],
      'engineering': ['Software Engineer'],
      'bca': ['Software Engineer'],
      'bba': ['Teacher', 'Lawyer'],
      'b.com': ['Teacher', 'Lawyer'],
      'b com': ['Teacher', 'Lawyer'],
      'ba': ['Teacher', 'Lawyer'],
      'b a': ['Teacher', 'Lawyer'],
      'llb': ['Lawyer'],
      'law': ['Lawyer'],
      'bjmc': ['Teacher'],
      'journalism': ['Teacher'],
      'b.ed': ['Teacher'],
      'b ed': ['Teacher'],
      'education': ['Teacher'],
      'nursing': ['Doctor'],
      'pharma': ['Doctor'],
      'pharmacy': ['Doctor'],
      'bds': ['Doctor'],
      'dental': ['Doctor'],
      'bsc nursing': ['Doctor'],
      'bsc': ['Teacher', 'Software Engineer'],
      'bachelor of technology': ['Software Engineer'],
      'bachelor of science': ['Teacher', 'Software Engineer'],
      'bachelor of arts': ['Teacher', 'Lawyer'],
      'bachelor of commerce': ['Teacher', 'Lawyer'],
      'bachelor of business': ['Teacher', 'Lawyer'],
      'bachelor of computer': ['Software Engineer'],
      'bachelor of medicine': ['Doctor'],
      'bachelor of nursing': ['Doctor'],
      'master': ['Teacher', 'Software Engineer'],
      'diploma': ['Teacher', 'Software Engineer'],
      'iti': ['Teacher', 'Software Engineer'],
      'polytechnic': ['Software Engineer'],
      'technology': ['Software Engineer'],
      'science': ['Teacher', 'Software Engineer'],
      'computer': ['Software Engineer'],
      'information technology': ['Software Engineer']
    }
    
    // Find related occupations based on course - check any key that matches
    let related = []
    for (const [key, occs] of Object.entries(courseOccupationMap)) {
      if (courseLower.includes(key)) {
        console.log('Match found:', key, '->', occs)
        related = [...related, ...occs]
      }
    }
    
    console.log('Related occupations:', related)
    
    // If no match, return all occupations except current
    if (related.length === 0) {
      console.log('No match found, returning all except current')
      return allOccupations.filter(occ => occ !== occupation)
    }
    
    // Remove duplicates and current occupation
    const result = [...new Set(related)].filter(occ => occ !== occupation)
    console.log('Final result:', result)
    return result
  }

  // Helper function to get translated occupation descriptions
  const getOccupationTranslationKey = (occupationName) => {
    const occupationMap = {
      'Teacher': 'occupation.teacher',
      'Lawyer': 'occupation.lawyer',
      'Software Engineer': 'occupation.softwareEngineer',
      'Doctor': 'occupation.doctor',
    }
    return occupationMap[occupationName]
  }

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

  // Simulate loading
  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  // Update selectedGovtExam when stream changes
  useEffect(() => {
    const validExamTypes = ['IIT-JEE', 'NEET', 'UPSC', 'SSC', 'Banking', 'Railway', 'StatePSC', 'NDA']
    if (stream && validExamTypes.includes(stream)) {
      setSelectedGovtExam(stream)
    }
  }, [stream])

  // Occupation details data
  const getOccupationDetails = (occupationName) => {
    const occupations = {
      'Teacher': {
        title: 'Teacher',
        icon: <FaChalkboardTeacher className="text-primary" />,
        description: 'Teachers educate students at various levels, from primary schools to universities. They play a crucial role in shaping the future of students.',
        salaryRange: '₹3-15 LPA',
        growthPotential: 'High',
        demandLevel: 'Very High',
        steps: [
          {
            step: 1,
            title: 'Complete 12th Standard',
            description: 'Complete your 12th standard with good percentage (preferably 60%+)',
            duration: '2 Years',
            tips: ['Focus on your favorite subjects', 'Participate in teaching-related activities', 'Develop communication skills']
          },
          {
            step: 2,
            title: 'Pursue Bachelor\'s Degree',
            description: 'Complete BA/B.Sc/B.Com in your preferred subject',
            duration: '3 Years',
            tips: ['Choose subjects you want to teach', 'Maintain good academic record', 'Participate in college events']
          },
          {
            step: 3,
            title: 'Complete B.Ed',
            description: 'Pursue Bachelor of Education (B.Ed) from a recognized university',
            duration: '2 Years',
            tips: ['Choose good B.Ed college', 'Learn teaching methodologies', 'Practice teaching in schools']
          },
          {
            step: 4,
            title: 'Clear Teaching Exams',
            description: 'Clear CTET/TET/STET exams as per your state requirements',
            duration: '3-6 Months',
            tips: ['Study previous year papers', 'Focus on child psychology', 'Practice mock tests']
          },
          {
            step: 5,
            title: 'Apply for Teaching Positions',
            description: 'Apply for government or private school teaching positions',
            duration: 'Ongoing',
            tips: ['Prepare for interviews', 'Create a good resume', 'Apply to multiple schools']
          }
        ],
        exams: [
          { name: 'CTET (Central Teacher Eligibility Test)', eligibility: 'B.Ed qualified', frequency: 'Twice a year', difficulty: 'Moderate' },
          { name: 'TET (Teacher Eligibility Test)', eligibility: 'B.Ed qualified', frequency: 'State-wise', difficulty: 'Moderate' },
          { name: 'STET (State Teacher Eligibility Test)', eligibility: 'B.Ed qualified', frequency: 'State-wise', difficulty: 'Moderate' },
          { name: 'UGC NET (for College Teachers)', eligibility: 'Post-Graduation', frequency: 'Twice a year', difficulty: 'High' }
        ],
        skills: ['Communication Skills', 'Patience', 'Subject Knowledge', 'Classroom Management', 'Creativity', 'Adaptability'],
        careerPath: [
          { level: 'Primary Teacher', experience: '0-5 years', salary: '₹3-6 LPA' },
          { level: 'TGT (Trained Graduate Teacher)', experience: '5-10 years', salary: '₹6-10 LPA' },
          { level: 'PGT (Post Graduate Teacher)', experience: '10-15 years', salary: '₹10-15 LPA' },
          { level: 'Vice Principal', experience: '15-20 years', salary: '₹12-18 LPA' },
          { level: 'Principal', experience: '20+ years', salary: '₹15-25 LPA' }
        ],
        topColleges: [
          { name: 'Delhi University', location: 'Delhi', ranking: 'Top 10' },
          { name: 'Jamia Millia Islamia', location: 'Delhi', ranking: 'Top 20' },
          { name: 'Banaras Hindu University', location: 'Varanasi', ranking: 'Top 10' },
          { name: 'University of Mumbai', location: 'Mumbai', ranking: 'Top 20' }
        ]
      },
      'Lawyer': {
        title: 'Lawyer',
        icon: <FaBalanceScale className="text-primary" />,
        description: 'Lawyers provide legal advice and representation to individuals, businesses, and government agencies. They play a vital role in the justice system.',
        salaryRange: '₹4-50 LPA',
        growthPotential: 'Very High',
        demandLevel: 'High',
        steps: [
          {
            step: 1,
            title: 'Complete 12th Standard',
            description: 'Complete your 12th standard with good percentage',
            duration: '2 Years',
            tips: ['Focus on humanities subjects', 'Develop reading habits', 'Participate in debates']
          },
          {
            step: 2,
            title: 'Pursue LLB',
            description: 'Complete LLB (3 years after graduation) or BA LLB (5 years integrated)',
            duration: '3-5 Years',
            tips: ['Choose good law college', 'Study case laws', 'Participate in moot courts']
          },
          {
            step: 3,
            title: 'Enroll with Bar Council',
            description: 'Register with State Bar Council after completing LLB',
            duration: '1-2 Months',
            tips: ['Complete all formalities', 'Get Bar Council registration', 'Start internship']
          },
          {
            step: 4,
            title: 'Complete Internship',
            description: 'Intern under a senior lawyer to gain practical experience',
            duration: '1-2 Years',
            tips: ['Learn court procedures', 'Draft legal documents', 'Build network']
          },
          {
            step: 5,
            title: 'Start Practice',
            description: 'Start independent practice or join a law firm',
            duration: 'Ongoing',
            tips: ['Build client base', 'Specialize in a field', 'Continue learning']
          }
        ],
        exams: [
          { name: 'CLAT (Common Law Admission Test)', eligibility: '12th Pass', frequency: 'Once a year', difficulty: 'High' },
          { name: 'AILET (All India Law Entrance Test)', eligibility: '12th Pass', frequency: 'Once a year', difficulty: 'High' },
          { name: 'LSAT (Law School Admission Test)', eligibility: '12th Pass', frequency: 'Multiple times', difficulty: 'Moderate' }
        ],
        skills: ['Analytical Skills', 'Communication Skills', 'Research Skills', 'Negotiation Skills', 'Ethics', 'Problem Solving'],
        careerPath: [
          { level: 'Junior Lawyer', experience: '0-5 years', salary: '₹4-10 LPA' },
          { level: 'Senior Lawyer', experience: '5-10 years', salary: '₹10-25 LPA' },
          { level: 'Associate Partner', experience: '10-15 years', salary: '₹25-50 LPA' },
          { level: 'Senior Partner', experience: '15-20 years', salary: '₹50-100 LPA' },
          { level: 'Judge', experience: '20+ years', salary: '₹15-25 LPA (Government)' }
        ],
        topColleges: [
          { name: 'National Law School of India University', location: 'Bangalore', ranking: 'Top 1' },
          { name: 'NALSAR University of Law', location: 'Hyderabad', ranking: 'Top 3' },
          { name: 'National Law University', location: 'Delhi', ranking: 'Top 5' },
          { name: 'Faculty of Law, Delhi University', location: 'Delhi', ranking: 'Top 10' }
        ]
      },
      'Software Engineer': {
        title: 'Software Engineer',
        icon: <FaCode className="text-primary" />,
        description: 'Software engineers design, develop, and maintain software applications. They are the backbone of the IT industry.',
        salaryRange: '₹6-25 LPA',
        growthPotential: 'Very High',
        demandLevel: 'Very High',
        steps: [
          {
            step: 1,
            title: 'Complete 12th Standard',
            description: 'Complete your 12th standard with Physics, Chemistry, and Mathematics',
            duration: '2 Years',
            tips: ['Focus on Mathematics', 'Learn basic programming', 'Participate in coding competitions']
          },
          {
            step: 2,
            title: 'Pursue B.Tech/BCA',
            description: 'Complete B.Tech in Computer Science/IT or BCA',
            duration: '3-4 Years',
            tips: ['Learn multiple programming languages', 'Build projects', 'Participate in hackathons']
          },
          {
            step: 3,
            title: 'Learn Programming Languages',
            description: 'Master programming languages like Java, Python, JavaScript, etc.',
            duration: 'Ongoing',
            tips: ['Practice daily', 'Build real projects', 'Contribute to open source']
          },
          {
            step: 4,
            title: 'Build Portfolio',
            description: 'Create a portfolio of projects to showcase your skills',
            duration: '6-12 Months',
            tips: ['Build diverse projects', 'Document your work', 'Host on GitHub']
          },
          {
            step: 5,
            title: 'Apply for Jobs',
            description: 'Apply for software engineering positions in IT companies',
            duration: 'Ongoing',
            tips: ['Prepare for interviews', 'Practice coding problems', 'Network with professionals']
          }
        ],
        exams: [
          { name: 'GATE (Graduate Aptitude Test in Engineering)', eligibility: 'B.Tech', frequency: 'Once a year', difficulty: 'High' },
          { name: 'Company-specific Tests', eligibility: 'B.Tech/BCA', frequency: 'As per recruitment', difficulty: 'Moderate to High' }
        ],
        skills: ['Programming Languages', 'Problem Solving', 'Data Structures', 'Algorithms', 'Database Management', 'Version Control'],
        careerPath: [
          { level: 'Junior Developer', experience: '0-3 years', salary: '₹6-10 LPA' },
          { level: 'Senior Developer', experience: '3-6 years', salary: '₹10-18 LPA' },
          { level: 'Tech Lead', experience: '6-10 years', salary: '₹18-25 LPA' },
          { level: 'Engineering Manager', experience: '10-15 years', salary: '₹25-40 LPA' },
          { level: 'CTO', experience: '15+ years', salary: '₹40-100 LPA' }
        ],
        topColleges: [
          { name: 'IIT Bombay', location: 'Mumbai', ranking: 'Top 1' },
          { name: 'IIT Delhi', location: 'Delhi', ranking: 'Top 2' },
          { name: 'IIT Madras', location: 'Chennai', ranking: 'Top 3' },
          { name: 'BITS Pilani', location: 'Pilani', ranking: 'Top 5' }
        ]
      },
      'Doctor': {
        title: 'Doctor',
        icon: <FaHospital className="text-primary" />,
        description: 'Doctors diagnose and treat illnesses, injuries, and diseases. They are essential healthcare professionals.',
        salaryRange: '₹10-50 LPA',
        growthPotential: 'Very High',
        demandLevel: 'Very High',
        steps: [
          {
            step: 1,
            title: 'Complete 12th Standard',
            description: 'Complete your 12th standard with Physics, Chemistry, and Biology',
            duration: '2 Years',
            tips: ['Focus on Biology', 'Develop empathy', 'Volunteer in healthcare']
          },
          {
            step: 2,
            title: 'Clear NEET Exam',
            description: 'Qualify NEET (National Eligibility cum Entrance Test)',
            duration: '1 Year',
            tips: ['Study NCERT thoroughly', 'Practice previous papers', 'Take mock tests']
          },
          {
            step: 3,
            title: 'Complete MBBS',
            description: 'Pursue MBBS (Bachelor of Medicine and Bachelor of Surgery)',
            duration: '5.5 Years',
            tips: ['Study regularly', 'Gain practical experience', 'Develop bedside manners']
          },
          {
            step: 4,
            title: 'Complete Internship',
            description: 'Complete mandatory internship in hospital',
            duration: '1 Year',
            tips: ['Learn from seniors', 'Handle different cases', 'Build patient relationships']
          },
          {
            step: 5,
            title: 'Specialize (Optional)',
            description: 'Pursue MD/MS for specialization',
            duration: '3 Years',
            tips: ['Choose your specialization', 'Clear NEET PG', 'Join good hospital']
          }
        ],
        exams: [
          { name: 'NEET (National Eligibility cum Entrance Test)', eligibility: '12th with PCB', frequency: 'Once a year', difficulty: 'Very High' },
          { name: 'NEET PG', eligibility: 'MBBS', frequency: 'Once a year', difficulty: 'Very High' },
          { name: 'AIIMS PG', eligibility: 'MBBS', frequency: 'Once a year', difficulty: 'Very High' }
        ],
        skills: ['Medical Knowledge', 'Empathy', 'Communication Skills', 'Problem Solving', 'Decision Making', 'Patience'],
        careerPath: [
          { level: 'Junior Resident', experience: '0-3 years', salary: '₹10-15 LPA' },
          { level: 'Senior Resident', experience: '3-6 years', salary: '₹15-25 LPA' },
          { level: 'Consultant', experience: '6-10 years', salary: '₹25-40 LPA' },
          { level: 'Senior Consultant', experience: '10-15 years', salary: '₹40-60 LPA' },
          { level: 'Head of Department', experience: '15+ years', salary: '₹60-100 LPA' }
        ],
        topColleges: [
          { name: 'AIIMS Delhi', location: 'Delhi', ranking: 'Top 1' },
          { name: 'CMC Vellore', location: 'Vellore', ranking: 'Top 3' },
          { name: 'AFMC Pune', location: 'Pune', ranking: 'Top 5' },
          { name: 'Maulana Azad Medical College', location: 'Delhi', ranking: 'Top 10' }
        ]
      }
    }

    return occupations[occupationName] || {
      title: occupationName,
      icon: <FaGraduationCap className="text-primary" />,
      description: `Detailed information about ${occupationName} career path.`,
      salaryRange: 'Varies',
      growthPotential: 'High',
      demandLevel: 'High',
      steps: [
        { step: 1, titleKey: 'step.complete12thStandard', descriptionKey: 'stepDesc.complete12thStandard', durationKey: 'duration.2Years', tips: ['Focus on academics', 'Develop relevant skills'] },
        { step: 2, titleKey: 'step.pursueDegree', descriptionKey: 'stepDesc.pursueDegree', durationKey: 'duration.3to4Years', tips: ['Choose good college', 'Build practical skills'] },
        { step: 3, titleKey: 'step.gainExperience', descriptionKey: 'stepDesc.gainExperience', durationKey: 'duration.1to2Years', tips: ['Learn from professionals', 'Build network'] },
        { step: 4, titleKey: 'step.startCareer', descriptionKey: 'stepDesc.startCareer', durationKey: 'duration.ongoing', tips: ['Apply for jobs', 'Continue learning'] }
      ],
      exams: [],
      skills: ['Communication Skills', 'Problem Solving', 'Teamwork', 'Adaptability'],
      careerPath: [
        { level: 'Entry Level', experience: '0-3 years', salary: 'Varies' },
        { level: 'Mid Level', experience: '3-7 years', salary: 'Varies' },
        { level: 'Senior Level', experience: '7-12 years', salary: 'Varies' },
        { level: 'Leadership', experience: '12+ years', salary: 'Varies' }
      ],
      topColleges: []
    }
  }

  const occupationDetails = occupation ? getOccupationDetails(occupation) : null

  const getGovtExamDetails = (examType) => {
    const govtExams = {
      'IIT-JEE': {
        title: 'IIT-JEE (Joint Entrance Examination)',
        icon: <FaCog className="text-warning" />,
        description: 'Crack JEE to get admission in IITs, NITs, and other top government engineering colleges for B.Tech',
        salaryRange: '₹8-50 LPA',
        growthPotential: 'Very High',
        demandLevel: 'Very High',
        fullPath: '12th (PCM) → JEE Main → JEE Advanced → Admission in IIT/NIT/IIIT → B.Tech → Campus Placement → Job in Top Companies',
        steps: [
          { step: 1, title: 'Complete 12th with PCM', description: 'Complete 12th with Physics, Chemistry, Mathematics (PCM) with minimum 75%', duration: '2 Years', tips: ['Focus on NCERT concepts', 'Practice numerical problems daily', 'Join coaching if needed'] },
          { step: 2, title: 'Prepare for JEE Main', description: 'Cover complete syllabus of Physics, Chemistry, Mathematics for JEE Main', duration: '1-2 Years', tips: ['Solve previous year papers', 'Take mock tests', 'Focus on speed and accuracy'] },
          { step: 3, title: 'Appear for JEE Main', description: 'Appear for JEE Main exam (conducted twice a year)', duration: 'Exam Season', tips: ['Manage time well', 'Attempt easier questions first', 'Stay calm'] },
          { step: 4, title: 'Prepare for JEE Advanced (if qualified)', description: 'If qualified in JEE Main, prepare for JEE Advanced for IITs', duration: '6-12 Months', tips: ['Focus on conceptual clarity', 'Solve advanced problems', 'Take mock tests'] },
          { step: 5, title: 'Participate in Counseling', description: 'Participate in JoSAA counseling for college allocation', duration: 'After Results', tips: ['Fill choices strategically', 'Research colleges', 'Consider branch preferences'] },
          { step: 6, title: 'Complete B.Tech', description: 'Complete B.Tech from allocated college', duration: '4 Years', tips: ['Focus on studies', 'Do internships', 'Build projects'] },
          { step: 7, title: 'Campus Placement', description: 'Appear for campus placement in top companies', duration: 'Final Year', tips: ['Prepare resume', 'Practice coding', 'Apply to multiple companies'] }
        ],
        exams: [
          { name: 'JEE Main', eligibility: '12th Pass with PCM', frequency: 'Twice a year', difficulty: 'High' },
          { name: 'JEE Advanced', eligibility: 'Qualified in JEE Main', frequency: 'Once a year', difficulty: 'Very High' },
          { name: 'JoSAA Counseling', eligibility: 'Qualified in JEE Main/Advanced', frequency: 'Once a year', difficulty: 'Counseling' }
        ],
        colleges: [
          { name: 'IIT Bombay', location: 'Mumbai', ranking: 'Top 1', seats: 'Total ~1000' },
          { name: 'IIT Delhi', location: 'Delhi', ranking: 'Top 2', seats: 'Total ~900' },
          { name: 'IIT Madras', location: 'Chennai', ranking: 'Top 3', seats: 'Total ~800' },
          { name: 'IIT Kharagpur', location: 'Kharagpur', ranking: 'Top 4', seats: 'Total ~900' },
          { name: 'IIT Kanpur', location: 'Kanpur', ranking: 'Top 5', seats: 'Total ~800' },
          { name: 'NIT Trichy', location: 'Tiruchirappalli', ranking: 'Top 1 NIT', seats: 'Total ~1500' },
          { name: 'NIT Surathkal', location: 'Surathkal', ranking: 'Top 2 NIT', seats: 'Total ~1200' },
          { name: 'NIT Warangal', location: 'Warangal', ranking: 'Top 3 NIT', seats: 'Total ~1000' }
        ],
        skills: ['Physics', 'Chemistry', 'Mathematics', 'Problem Solving', 'Analytical Thinking', 'Time Management']
      },
      'NEET': {
        title: 'NEET (National Eligibility cum Entrance Test)',
        icon: <FaHospital className="text-danger" />,
        description: 'Crack NEET to get admission in Government Medical Colleges for MBBS/BDS',
        salaryRange: '₹10-100 LPA',
        growthPotential: 'Very High',
        demandLevel: 'Very High',
        fullPath: '12th (PCB) → NEET → Admission in Government Medical College → MBBS → Internship → License → Job/PG',
        steps: [
          { step: 1, title: 'Complete 12th with PCB', description: 'Complete 12th with Physics, Chemistry, Biology (PCB) with minimum 50%', duration: '2 Years', tips: ['Focus on Biology', 'Understand NCERT thoroughly', 'Practice diagrams'] },
          { step: 2, title: 'Prepare for NEET', description: 'Cover complete syllabus of PCB for NEET', duration: '1-2 Years', tips: ['Focus on NCERT', 'Solve previous year papers', 'Take mock tests'] },
          { step: 3, title: 'Appear for NEET', description: 'Appear for NEET exam (conducted once a year)', duration: 'Exam Season', tips: ['Manage time well', 'Focus on accuracy', 'Stay calm'] },
          { step: 4, title: 'Participate in Counseling', description: 'Participate in All India Quota counseling for college allocation', duration: 'After Results', tips: ['Fill choices wisely', 'Research colleges', 'Consider location'] },
          { step: 5, title: 'Complete MBBS', description: 'Complete MBBS course (5.5 years including internship)', duration: '5.5 Years', tips: ['Focus on studies', 'Gain clinical experience', 'Build skills'] },
          { step: 6, title: 'Complete Internship', description: 'Complete mandatory internship in hospital', duration: '1 Year', tips: ['Learn from seniors', 'Handle different cases', 'Build patient relationships'] },
          { step: 7, title: 'Start Career', description: 'Start working as doctor or pursue PG', duration: 'Ongoing', tips: ['Register with Medical Council', 'Apply for jobs', 'Consider specialization'] }
        ],
        exams: [
          { name: 'NEET UG', eligibility: '12th Pass with PCB', frequency: 'Once a year', difficulty: 'Very High' },
          { name: 'NEET PG', eligibility: 'MBBS Pass', frequency: 'Once a year', difficulty: 'Very High' },
          { name: 'AIIMS PG', eligibility: 'MBBS Pass', frequency: 'Once a year', difficulty: 'Very High' }
        ],
        colleges: [
          { name: 'AIIMS Delhi', location: 'Delhi', ranking: 'Top 1', seats: 'Total ~100' },
          { name: 'Maulana Azad Medical College', location: 'Delhi', ranking: 'Top 2', seats: 'Total ~250' },
          { name: 'VMMC & Safdarjung Hospital', location: 'Delhi', ranking: 'Top 3', seats: 'Total ~200' },
          { name: 'Lady Hardinge Medical College', location: 'Delhi', ranking: 'Top 10', seats: 'Total ~200' },
          { name: 'Grant Medical College', location: 'Mumbai', ranking: 'Top 15', seats: 'Total ~200' },
          { name: 'King George Medical University', location: 'Lucknow', ranking: 'Top 20', seats: 'Total ~250' }
        ],
        skills: ['Biology', 'Physics', 'Chemistry', 'Medical Knowledge', 'Empathy', 'Communication Skills']
      },
      'UPSC': {
        title: 'UPSC (Union Public Service Commission)',
        icon: <FaLandmark className="text-primary" />,
        description: 'CrackCivil Services Exam to become IAS, IPS, IFS and other Group A services',
        salaryRange: '₹7-50 LPA',
        growthPotential: 'Very High',
        demandLevel: 'High',
        fullPath: 'Graduate → UPSC CSE (Pre+Mains+Interview) → IAS/IPS/IFS → Service',
        steps: [
          { step: 1, title: 'Complete Graduation', description: 'Complete graduation in any stream', duration: '3 Years', tips: ['Choose subjects of interest', 'Read newspapers', 'Develop analytical skills'] },
          { step: 2, title: 'Basic Preparation', description: 'Start basic preparation - read NCERTs, basic books', duration: '6-12 Months', tips: ['Read NCERT thoroughly', 'Follow current affairs', 'Start answer writing'] },
          { step: 3, title: '深化 Preparation', description: 'Deep preparation for all subjects', duration: '1-2 Years', tips: ['Refer standard books', 'Practice answer writing', 'Join test series'] },
          { step: 4, title: 'Appear for UPSC Prelims', description: 'Appear for UPSC Prelims (CSAT + GS)', duration: 'Exam Season', tips: ['Clear cutoff', 'Manage time', 'Stay focused'] },
          { step: 5, title: 'Appear for UPSC Mains', description: 'Appear for UPSC Mains (9 papers)', duration: 'Exam Season', tips: ['Focus on answer structure', 'Write neatly', 'Manage time'] },
          { step: 6, title: 'Interview', description: 'Appear for Personality Test/Interview', duration: '30-45 Minutes', tips: ['Be confident', 'Know current affairs', 'Be honest'] },
          { step: 7, title: 'Service Allocation', description: 'Get allocated to service based on rank', duration: 'After Result', tips: ['Fill preferences wisely', 'Stay updated', 'Join training'] }
        ],
        exams: [
          { name: 'UPSC CSE Prelims', eligibility: 'Graduate', frequency: 'Once a year', difficulty: 'Very High' },
          { name: 'UPSC CSE Mains', eligibility: 'Qualified Prelims', frequency: 'Once a year', difficulty: 'Very High' },
          { name: 'UPSC Interview', eligibility: 'Qualified Mains', frequency: 'Once a year', difficulty: 'High' }
        ],
        colleges: [
          { name: 'IAS (Indian Administrative Service)', location: 'All India', ranking: 'Top 1', seats: 'Various' },
          { name: 'IPS (Indian Police Service)', location: 'All India', ranking: 'Top 2', seats: 'Various' },
          { name: 'IFS (Indian Foreign Service)', location: 'All India', ranking: 'Top 3', seats: 'Various' },
          { name: 'IRS (Indian Revenue Service)', location: 'All India', ranking: 'Top 4', seats: 'Various' },
          { name: 'Indian Audit & Accounts Service', location: 'All India', ranking: 'Top 5', seats: 'Various' }
        ],
        skills: ['Current Affairs', 'Analytical Skills', 'Communication', 'Leadership', 'Decision Making', 'Time Management']
      },
      'SSC': {
        title: 'SSC (Staff Selection Commission)',
        icon: <FaUserShield className="text-success" />,
        description: 'Crack SSC exams to get Group B and C government jobs',
        salaryRange: '₹5-18 LPA',
        growthPotential: 'High',
        demandLevel: 'Very High',
        fullPath: '12th/Graduate → SSC Exams → Document Verification → Joining',
        steps: [
          { step: 1, title: 'Check Eligibility', description: 'Check eligibility for SSC exams (10th/12th/Graduate as per exam)', duration: 'Before Exam', tips: ['Know eligibility criteria', 'Choose right exam', 'Check age limit'] },
          { step: 2, title: 'Basic Preparation', description: 'Start preparation with basics of English, Math, Reasoning, GK', duration: '3-6 Months', tips: ['Read NCERT for basics', 'Practice daily', 'Learn formulas'] },
          { step: 3, title: 'Deep Preparation', description: 'Deep preparation for all sections', duration: '6-12 Months', tips: ['Solve previous papers', 'Take mock tests', 'Focus on weak areas'] },
          { step: 4, title: 'Appear for Tier 1', description: 'Appear for CBT exam (Objective)', duration: 'Exam Season', tips: ['Clear cutoff', 'Manage time well', 'Attempt all questions'] },
          { step: 5, title: 'Appear for Tier 2', description: 'Appear for Descriptive/Typing test', duration: 'After Tier 1', tips: ['Practice typing', 'Write essays', 'Prepare for English/Hindi'] },
          { step: 6, title: 'Document Verification', description: 'Submit documents for verification', duration: 'After Tier 2', tips: ['Keep documents ready', 'Verify details', 'Carry originals'] },
          { step: 7, title: 'Joining', description: 'Get joining letter and join department', duration: 'After DV', tips: ['Check official website', 'Join on time', 'Complete formalities'] }
        ],
        exams: [
          { name: 'SSC CGL', eligibility: 'Graduate', frequency: 'Once a year', difficulty: 'High' },
          { name: 'SSC CHSL', eligibility: '12th Pass', frequency: 'Once a year', difficulty: 'Moderate' },
          { name: 'SSC MTS', eligibility: '10th Pass', frequency: 'Once a year', difficulty: 'Easy' },
          { name: 'SSC GD', eligibility: '10th Pass', frequency: 'Once a year', difficulty: 'Easy' }
        ],
        colleges: [
          { name: 'Income Tax Inspector', location: 'Central', ranking: 'Popular', seats: 'Various' },
          { name: 'Excise Inspector', location: 'Central', ranking: 'Popular', seats: 'Various' },
          { name: 'Assistant Section Officer', location: ' Ministries', ranking: 'Good', seats: 'Various' },
          { name: 'Auditor/A Accountant', location: 'Various', ranking: 'Good', seats: 'Various' },
          { name: 'Upper Division Clerk', location: 'Various', ranking: 'Good', seats: 'Various' }
        ],
        skills: ['Quantitative Aptitude', 'English', 'General Awareness', 'Reasoning', 'Computer Knowledge', 'Time Management']
      },
      'Banking': {
        title: 'Banking Exams (IBPS/SBI)',
        icon: <FaMoneyBillWave className="text-success" />,
        description: 'Crack Banking exams to get Officer/Clerk positions in Public Sector Banks',
        salaryRange: '₹7-30 LPA',
        growthPotential: 'High',
        demandLevel: 'Very High',
        fullPath: 'Graduate → PO/Clerk Exam → GD/Interview → Appointment in Bank',
        steps: [
          { step: 1, title: 'Complete Graduation', description: 'Complete graduation in any stream', duration: '3 Years', tips: ['Maintain good percentage', 'Learn basic banking', 'Read financial news'] },
          { step: 2, title: 'Check Eligibility', description: 'Check eligibility for Banking exams', duration: 'Before Exam', tips: ['Check age limit', 'Check required percentage', 'Check nationality'] },
          { step: 3, title: 'Basic Preparation', description: 'Start preparation with basics of Quant, Reasoning, English, GA', duration: '3-6 Months', tips: ['Learn formulas', 'Practice tables', 'Read newspapers'] },
          { step: 4, title: 'Appear for Preliminary', description: 'Appear for Prelims (Quant, Reasoning, English)', duration: 'Exam Season', tips: ['Clear cutoff', 'Manage time', 'Focus on accuracy'] },
          { step: 5, title: 'Appear for Mains', description: 'Appear for Mains (All sections + Computer)', duration: 'After Prelims', tips: ['Prepare thoroughly', 'Take mock tests', 'Focus on speed'] },
          { step: 6, title: 'Group Discussion', description: 'Appear for Group Discussion', duration: 'After Mains', tips: ['Know current topics', 'Give opinions confidently', 'Be polite'] },
          { step: 7, title: 'Personal Interview', description: 'Appear for Personal Interview', duration: 'After GD', tips: ['Be confident', 'Know about bank', 'Dress properly'] },
          { step: 8, title: 'Joining', description: 'Get joining and become PO/Clerk', duration: 'After Result', tips: ['Check website', 'Join on time', 'Complete training'] }
        ],
        exams: [
          { name: 'IBPS PO', eligibility: 'Graduate', frequency: 'Once a year', difficulty: 'High' },
          { name: 'IBPS Clerk', eligibility: 'Graduate', frequency: 'Once a year', difficulty: 'Moderate' },
          { name: 'SBI PO', eligibility: 'Graduate', frequency: 'Once a year', difficulty: 'High' },
          { name: 'SBI Clerk', eligibility: 'Graduate', frequency: 'Once a year', difficulty: 'Moderate' },
          { name: 'RRB PO', eligibility: 'Graduate', frequency: 'Once a year', difficulty: 'Moderate' },
          { name: 'RRB Clerk', eligibility: 'Graduate', frequency: 'Once a year', difficulty: 'Easy' }
        ],
        colleges: [
          { name: 'Public Sector Banks (SBI, PNB, BOB, etc.)', location: 'All India', ranking: 'Top', seats: 'Various' },
          { name: 'Regional Rural Banks', location: 'State-wise', ranking: 'Good', seats: 'Various' },
          { name: 'Private Sector Banks (HDFC, ICICI, etc.)', location: 'All India', ranking: 'High Pay', seats: 'Various' }
        ],
        skills: ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness', 'Computer Knowledge', 'Communication']
      },
      'Railway': {
        title: 'Railway Exams (RRB)',
        icon: <FaTrain className="text-warning" />,
        description: 'Crack RRB exams to get jobs in Indian Railways (Group C/D)',
        salaryRange: '₹5-18 LPA',
        growthPotential: 'Medium',
        demandLevel: 'Very High',
        fullPath: '12th/Graduate → RRB Exam → Document Verification → Joining',
        steps: [
          { step: 1, title: 'Check Eligibility', description: 'Check eligibility for RRB exams (10th/12th/Graduate)', duration: 'Before Exam', tips: ['Check notification', 'Check age limit', 'Check required qualification'] },
          { step: 2, title: 'Basic Preparation', description: 'Start preparation with basics', duration: '2-3 Months', tips: ['Read NCERT', 'Practice Math', 'Learn Reasoning'] },
          { step: 3, title: 'Deep Preparation', description: 'Prepare for all subjects thoroughly', duration: '6-12 Months', tips: ['Solve previous papers', 'Take mock tests', 'Focus on weak areas'] },
          { step: 4, title: 'Appear for CBT', description: 'Appear for Computer Based Test', duration: 'Exam Season', tips: ['Clear cutoff', 'Manage time', 'Focus on accuracy'] },
          { step: 5, title: 'Skill Test (if applicable)', description: 'Appear for Typing/Document verification', duration: 'After CBT', tips: ['Practice typing', 'Keep documents ready'] },
          { step: 6, title: 'Medical Examination', description: 'Clear medical examination', duration: 'After Skill Test', tips: ['Know medical standards', 'Prepare accordingly'] },
          { step: 7, title: 'Joining', description: 'Get joining and join Railway', duration: 'After Medical', tips: ['Check website', 'Join on time', 'Complete training'] }
        ],
        exams: [
          { name: 'RRB NTPC', eligibility: '12th/Graduate', frequency: 'When notified', difficulty: 'High' },
          { name: 'RRB Group D', eligibility: '10th Pass', frequency: 'When notified', difficulty: 'Moderate' },
          { name: 'RRB JE', eligibility: 'Diploma/Graduate', frequency: 'When notified', difficulty: 'High' },
          { name: 'RRB Paramedical', eligibility: 'Various qualifications', frequency: 'When notified', difficulty: 'Moderate' }
        ],
        colleges: [
          { name: 'Indian Railways', location: 'All India', ranking: 'Largest Employer', seats: 'Various' },
          { name: 'Central Railway', location: 'Mumbai', ranking: 'Zone', seats: 'Various' },
          { name: 'Northern Railway', location: 'Delhi', ranking: 'Zone', seats: 'Various' },
          { name: 'Southern Railway', location: 'Chennai', ranking: 'Zone', seats: 'Various' },
          { name: 'Eastern Railway', location: 'Kolkata', ranking: 'Zone', seats: 'Various' }
        ],
        skills: [' Mathematics', 'General Intelligence', 'Reasoning', 'General Awareness', 'Basic English', 'Physical Fitness']
      },
      'StatePSC': {
        title: 'State PSC Exams',
        icon: <FaFlag className="text-info" />,
        description: 'Crack State PSC exams to get state government jobs',
        salaryRange: '₹6-25 LPA',
        growthPotential: 'High',
        demandLevel: 'High',
        fullPath: 'Graduate → State PSC Exam → Interview → Joining',
        steps: [
          { step: 1, title: 'Complete Graduation', description: 'Complete graduation in any stream', duration: '3 Years', tips: ['Choose subjects strategically', 'Read state-related topics', 'Stay updated with state news'] },
          { step: 2, title: 'Check State PSC Notification', description: 'Check notification for your state PSC exam', duration: 'When Notified', tips: ['Visit state PSC website', 'Check eligibility', 'Check exam pattern'] },
          { step: 3, title: 'Prepare for Preliminary', description: 'Prepare for Preliminary exam (if applicable)', duration: '3-6 Months', tips: ['Know state syllabus', 'Solve previous papers', 'Take mock tests'] },
          { step: 4, title: 'Prepare for Mains', description: 'Prepare for Mains exam', duration: '6-12 Months', tips: ['Prepare state-specific topics', 'Practice answer writing', 'Read about state'] },
          { step: 5, title: 'Interview', description: 'Appear for Personality Test', duration: 'After Mains', tips: ['Know about state', 'Be confident', 'Know current issues'] },
          { step: 6, title: 'Joining', description: 'Get joining in state department', duration: 'After Result', tips: ['Check website', 'Join on time', 'Complete training'] }
        ],
        exams: [
          { name: 'UPPSC', eligibility: 'Graduate', frequency: 'When notified', difficulty: 'High' },
          { name: 'MPSC (Maharashtra)', eligibility: 'Graduate', frequency: 'When notified', difficulty: 'High' },
          { name: 'KPSC (Karnataka)', eligibility: 'Graduate', frequency: 'When notified', difficulty: 'High' },
          { name: 'TPSC (Tamil Nadu)', eligibility: 'Graduate', frequency: 'When notified', difficulty: 'High' },
          { name: 'BPSC (Bihar)', eligibility: 'Graduate', frequency: 'When notified', difficulty: 'High' },
          { name: 'RPSC (Rajasthan)', eligibility: 'Graduate', frequency: 'When notified', difficulty: 'High' }
        ],
        colleges: [
          { name: 'State Administrative Service', location: 'State Capital', ranking: 'Top', seats: 'Various' },
          { name: 'State Police Service', location: 'State-wide', ranking: 'Good', seats: 'Various' },
          { name: 'State Revenue Service', location: 'State-wide', ranking: 'Good', seats: 'Various' },
          { name: 'Various Department Jobs', location: 'State-wide', ranking: 'Various', seats: 'Various' }
        ],
        skills: ['State-specific Knowledge', 'Current Affairs', 'General Studies', 'Communication', 'Leadership', 'Time Management']
      },
      'NDA': {
        title: 'NDA (National Defense Academy)',
        icon: <FaShieldAlt className="text-primary" />,
        description: 'Crack NDA to join Indian Defense Forces (Army, Navy, Air Force)',
        salaryRange: '₹7-25 LPA',
        growthPotential: 'Very High',
        demandLevel: 'High',
        fullPath: '12th → NDA Exam → SSB Interview → Medical → Joining → Training',
        steps: [
          { step: 1, title: 'Complete 12th', description: 'Complete 12th in any stream (Science for Air Force/Navy)', duration: '2 Years', tips: ['Maintain fitness', 'Focus on studies', 'Stay updated'] },
          { step: 2, title: 'Apply for NDA', description: 'Apply for NDA when notification is out', duration: 'When Notified', tips: ['Check eligibility', 'Know exam pattern', 'Choose preferred force'] },
          { step: 3, title: 'Prepare for Written Exam', description: 'Prepare for Mathematics and General Ability', duration: '6-12 Months', tips: ['Focus on NCERT', 'Practice previous papers', 'Take mock tests'] },
          { step: 4, title: 'Appear for Written Exam', description: 'Appear for NDA written exam', duration: 'Exam Season', tips: ['Manage time', 'Attempt all questions', 'Stay calm'] },
          { step: 5, title: 'SSB Interview', description: 'Appear for Services Selection Board (SSB) interview', duration: '5 Days', tips: ['Be confident', 'Know about forces', 'Show leadership'] },
          { step: 6, title: 'Medical Examination', description: 'Clear medical examination', duration: 'During SSB', tips: ['Know medical standards', 'Stay fit', 'Be honest'] },
          { step: 7, title: 'Joining & Training', description: 'Join NDA for training', duration: '3 Years', tips: ['Stay disciplined', 'Focus on training', 'Build camaraderie'] }
        ],
        exams: [
          { name: 'NDA (Army)', eligibility: '12th Pass', frequency: 'Twice a year', difficulty: 'High' },
          { name: 'NDA (Navy)', eligibility: '12th Pass (Science)', frequency: 'Twice a year', difficulty: 'High' },
          { name: 'NDA (Air Force)', eligibility: '12th Pass (Science)', frequency: 'Twice a year', difficulty: 'High' },
          { name: 'NAVY SSB', eligibility: 'Graduate', frequency: 'When notified', difficulty: 'High' }
        ],
        colleges: [
          { name: 'NDA (Pune)', location: 'Pune', ranking: 'Top 1', seats: 'Total ~400' },
          { name: 'IMA (Army Dehradun)', location: 'Dehradun', ranking: 'Top', seats: 'Various' },
          { name: 'INA (Ezhimala)', location: 'Kerala', ranking: 'Top', seats: 'Various' },
          { name: 'AFA (Dundigul)', location: 'Hyderabad', ranking: 'Top', seats: 'Various' }
        ],
        skills: ['Mathematics', 'General Knowledge', 'English', 'Physical Fitness', 'Leadership', 'Discipline']
      }
    }
    return govtExams[examType] || null
  }

  const govtExamTypes = ['IIT-JEE', 'NEET', 'UPSC', 'SSC', 'Banking', 'Railway', 'StatePSC', 'NDA']

  const getFilteredExamTypesByStream = () => {
    if (stream === 'science') {
      return ['IIT-JEE', 'NEET', 'Banking', 'SSC', 'Railway', 'StatePSC', 'NDA']
    } else if (stream === 'commerce') {
      return ['Banking', 'UPSC', 'SSC', 'Railway', 'StatePSC', 'NDA']
    } else if (stream === 'arts') {
      return ['UPSC', 'SSC', 'Banking', 'Railway', 'StatePSC', 'NDA']
    } else if (stream === 'computer') {
      return ['IIT-JEE', 'NEET', 'Banking', 'SSC', 'Railway', 'StatePSC', 'NDA']
    }
    return govtExamTypes
  }

  const filteredExamTypes = stream ? getFilteredExamTypesByStream() : govtExamTypes

  if (!occupation) {
    return (
      <div className="d-flex flex-column">
        <UserTopNav onMenuToggle={handleMenuToggle} isMobile={isMobile} />
        <div className="d-flex flex-1">
          <UseLeftNav showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas} />
          <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '220px', padding: isMobile ? '10px' : '20px', minHeight: 'calc(100vh - 70px)' }}>
            <Container fluid>
              <Alert variant="warning">
                <FaInfoCircle className="me-2" />
                No occupation selected. Please go back and select an occupation.
              </Alert>
              <Button variant="primary" onClick={() => navigate('/UserNotifications')}>
                <FaArrowLeft className="me-2" />
                Back to Guidance
              </Button>
            </Container>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column">
      <UserTopNav onMenuToggle={handleMenuToggle} isMobile={isMobile} />
      <div className="d-flex flex-1">
        <UseLeftNav showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas} />
        
        <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '220px', padding: isMobile ? '10px' : '20px', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid>
            
            {/* Back Button */}
            <div className="mb-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/UserNotifications')} 
                className="d-flex align-items-center"
              >
                <FaArrowLeft className="me-2" />
                <TransText k="occupation.backToGuidance" as="span" />
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" style={{ width: '60px', height: '60px' }}>
                  <span className="visually-hidden"><TransText k="occupation.loading" as="span" /></span>
                </div>
                <p className="mt-3"><TransText k="occupation.loading" as="span" /></p>
              </div>
            ) : occupationDetails && (
              <>
                {/* Header Card */}
                <Card className="shadow-sm mb-4 border-0 occupation-header-card" style={{ borderRadius: '10px' }}>
                  <Card.Body className="p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="occupation-icon-large">
                          {occupationDetails.icon}
                        </div>
                        <div>
                          <h2 className="mb-2">{occupationDetails.title}</h2>
                          <p className="text-muted mb-0">
                            {getOccupationTranslationKey(occupation) ? getTranslation(getOccupationTranslationKey(occupation) + 'Desc', language) : occupationDetails.description}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Badge bg="success" className="fs-6 p-2">
                          <FaRupeeSign className="me-1" />
                          {occupationDetails.salaryRange}
                        </Badge>
                        <Badge bg="info" className="fs-6 p-2">
                          <FaChartLine className="me-1" />
                          {occupationDetails.growthPotential} <TransText k="occupation.growthPotential" as="span" />
                        </Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Tabs for Career Opportunities and Step-by-Step Guide */}
                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                  <Card.Body className="p-4">
                    <Tab.Container id="occupation-tabs" defaultActiveKey={prepType === 'govtJob' || prepType === 'govtCollege' ? 'govt-exams' : 'career-opportunities'}>
                      <Nav variant="tabs" className="mb-4">
                        {(prepType === 'govtJob' || prepType === 'govtCollege') && (
                          <Nav.Item>
                            <Nav.Link eventKey="govt-exams">
                              <FaShieldAlt className="me-2" />
                              <TransText k="occupation.govtExamPrep" as="span" />
                            </Nav.Link>
                          </Nav.Item>
                        )}
                        <Nav.Item>
                          <Nav.Link eventKey="career-opportunities">
                            <FaRocket className="me-2" />
                            <TransText k="occupation.careerOpportunities" as="span" />
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="step-by-step">
                            <FaClipboardList className="me-2" />
                            <TransText k="occupation.stepByStepPath" as="span" />
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="skills-exams">
                            <FaStar className="me-2" />
                            <TransText k="occupation.skillsExams" as="span" />
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="colleges">
                            <FaUniversity className="me-2" />
                            <TransText k="occupation.topColleges" as="span" />
                          </Nav.Link>
                        </Nav.Item>
                      </Nav>

                      <Tab.Content>
                        {(prepType === 'govtJob' || prepType === 'govtCollege') ? (
                          <>
                            <Tab.Pane eventKey="govt-exams">
                              <div className="mb-4">
                                <h5 className="mb-3">
                                  <FaShieldAlt className="me-2 text-primary" />
                                  <TransText k="occupation.govtExamPrep" as="span" />
                                </h5>
                                <p className="text-muted mb-4">
                                  <TransText k="occupation.govtExamDesc" as="span" />
                                </p>
                                
                                <Row>
                                  {filteredExamTypes.map((examType, index) => {
                                    const examDetails = getGovtExamDetails(examType)
                                    if (!examDetails) return null
                                    return (
                                      <Col md={4} key={index} className="mb-3">
                                        <Card 
                                          className="h-100 border career-opportunity-card" 
                                          style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                          onClick={() => {
                                            setSelectedGovtExam(examType)
                                            document.getElementById('occupation-tabs')?.scrollIntoView({ behavior: 'smooth' })
                                          }}
                                        >
                                          <Card.Body className="p-3">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                              <div className="icon-wrapper">
                                                {examDetails.icon}
                                              </div>
                                              <h6 className="mb-0">{examDetails.title}</h6>
                                            </div>
                                            <p className="small text-muted mb-2">
                                              {examDetails.fullPath.substring(0, 80)}...
                                            </p>
                                        <div className="d-flex justify-content-between align-items-center">
                                          <Badge bg="success">
                                            <FaRupeeSign className="me-1" />
                                            {examDetails.salaryRange}
                                          </Badge>
                                          <Badge bg="info">
                                            <FaChartLine className="me-1" />
                                            {examDetails.growthPotential}
                                          </Badge>
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                )
                              })}
                            </Row>
                          </div>

                          {selectedGovtExam && getGovtExamDetails(selectedGovtExam) && (
                            <div className="mb-4">
                              <h5 className="mb-3">
                                <FaRocket className="me-2 text-success" />
                                {selectedGovtExam} - <TransText k="occupation.completeRoadmap" as="span" />
                              </h5>
                              <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                                <Card.Header className="bg-white border-0 pt-4 pb-0">
                                  <div className="d-flex align-items-center gap-2">
                                    {getGovtExamDetails(selectedGovtExam).icon}
                                    <h5 className="mb-0">{getGovtExamDetails(selectedGovtExam).title}</h5>
                                  </div>
                                </Card.Header>
                                <Card.Body className="p-4">
                                  <Alert variant="info" className="mb-4">
                                    <FaLightbulb className="me-2" />
                                    <strong>Complete Path:</strong> {getGovtExamDetails(selectedGovtExam).fullPath}
                                  </Alert>
                                  <p className="text-muted mb-4">{getGovtExamDetails(selectedGovtExam).description}</p>
                                  
                                  <h6 className="mb-3"><TransText k="occupation.stepByStepPath" as="span" /></h6>
                                  <Row>
                                    {getGovtExamDetails(selectedGovtExam).steps.map((step, idx) => (
                                      <Col md={6} key={idx}>
                                        <Card className="mb-3 border step-card">
                                          <Card.Body className="p-3">
                                            <div className="d-flex align-items-start gap-3">
                                              <div className="step-number">
                                                <Badge bg="primary" className="rounded-circle p-3">
                                                  {step.step}
                                                </Badge>
                                              </div>
                                              <div className="flex-grow-1">
                                                <h6 className="mb-1">{step.title}</h6>
                                                <p className="mb-2 fw-bold" style={{ fontSize: '1.1rem' }}>{step.description}</p>
                                                <Badge bg="info" className="mb-2">{step.duration}</Badge>
                                                <div className="mt-2">
                                                  <small className="text-muted d-block mb-1"><TransText k="occupation.tips" as="span" />:</small>
                                                  <ul className="mb-0 ps-3">
                                                    {step.tips.map((tip, tipIdx) => (
                                                      <li key={tipIdx} className="small text-muted">{tip}</li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              </div>
                                            </div>
                                          </Card.Body>
                                        </Card>
                                      </Col>
                                    ))}
                                  </Row>
                                </Card.Body>
                              </Card>

                              {/* Colleges for Government Exam */}
                              {getGovtExamDetails(selectedGovtExam).colleges && getGovtExamDetails(selectedGovtExam).colleges.length > 0 && (
                                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                                  <Card.Header className="bg-white border-0 pt-4 pb-0">
                                    <div className="d-flex align-items-center gap-2">
                                      <FaUniversity className="text-primary" />
                                      <h5 className="mb-0"><TransText k="occupation.topColleges" as="span" /></h5>
                                    </div>
                                  </Card.Header>
                                  <Card.Body className="p-4">
                                    <Row>
                                      {getGovtExamDetails(selectedGovtExam).colleges.map((college, idx) => (
                                        <Col md={6} key={idx} className="mb-3">
                                          <Card className="h-100 border college-card">
                                            <Card.Body className="p-3">
                                              <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                  <h6 className="mb-1">{college.name}</h6>
                                                  <small className="text-muted">
                                                    <FaMapMarkerAlt className="me-1" />
                                                    {college.location}
                                                  </small>
                                                </div>
                                                <Badge bg="warning">{college.ranking}</Badge>
                                              </div>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                      ))}
                                    </Row>
                                  </Card.Body>
                                </Card>
                              )}

                              {/* Required Exams for Government Path */}
                              {getGovtExamDetails(selectedGovtExam).exams && getGovtExamDetails(selectedGovtExam).exams.length > 0 && (
                                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                                  <Card.Header className="bg-white border-0 pt-4 pb-0">
                                    <div className="d-flex align-items-center gap-2">
                                      <FaClipboardList className="text-info" />
                                      <h5 className="mb-0"><TransText k="occupation.entranceExams" as="span" /></h5>
                                    </div>
                                  </Card.Header>
                                  <Card.Body className="p-4">
                                    <Accordion>
                                      {getGovtExamDetails(selectedGovtExam).exams.map((exam, idx) => (
                                        <Accordion.Item key={idx} eventKey={idx.toString()}>
                                          <Accordion.Header>
                                            <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                              <span>{exam.name}</span>
                                              <Badge bg="info">{exam.difficulty}</Badge>
                                            </div>
                                          </Accordion.Header>
                                          <Accordion.Body>
                                            <Row>
                                              <Col md={4}>
                                                <small className="text-muted"><TransText k="occupation.eligibility" as="span" /></small>
                                                <p className="mb-0">{exam.eligibility}</p>
                                              </Col>
                                              <Col md={4}>
                                                <small className="text-muted"><TransText k="occupation.frequency" as="span" /></small>
                                                <p className="mb-0">{exam.frequency}</p>
                                              </Col>
                                              <Col md={4}>
                                                <small className="text-muted"><TransText k="occupation.difficulty" as="span" /></small>
                                                <p className="mb-0">{exam.difficulty}</p>
                                              </Col>
                                            </Row>
                                          </Accordion.Body>
                                        </Accordion.Item>
                                      ))}
                                    </Accordion>
                                  </Card.Body>
                                </Card>
                              )}
                            </div>
                          )}

                          {!selectedGovtExam && (
                            <Alert variant="info">
                              <FaInfoCircle className="me-2" />
                              <TransText k="occupation.selectExamType" as="span" />
                            </Alert>
                          )}
                        </Tab.Pane>
                        </>
                        ) : null}

                        {/* Career Opportunities Tab */}
                        <Tab.Pane eventKey="career-opportunities">
                          <div className="mb-4">
                            <h5 className="mb-3">
                              <FaRocket className="me-2 text-primary" />
                              <TransText k="occupation.availableCareerOpps" as="span" />
                            </h5>
                            <p className="text-muted mb-4">
                              {course ? <><TransText k="occupation.relatedCareers" as="span" /> {course}</> : <TransText k="occupation.explorePaths" as="span" />}
                            </p>
                            <Row>
                              {getRelatedOccupations().map((occ, index) => {
                                const details = getOccupationDetails(occ)
                                return (
                                  <Col md={4} key={index} className="mb-3">
                                    <Card 
                                      className="h-100 border career-opportunity-card" 
                                      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                      onClick={() => navigate('/OccupationDetails', { state: { occupation: occ, stream, percentage, course } })}
                                    >
                                      <Card.Body className="p-3">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                          <div className="icon-wrapper">
                                            {details.icon}
                                          </div>
                                          <h6 className="mb-0">{details.title}</h6>
                                        </div>
                                        <p className="small text-muted mb-2">
                                          {getOccupationTranslationKey(occ) ? getTranslation(getOccupationTranslationKey(occ) + 'Desc', language) : details.description.substring(0, 80)}...
                                        </p>
                                        <div className="d-flex justify-content-between align-items-center">
                                          <Badge bg="success">
                                            <FaRupeeSign className="me-1" />
                                            {details.salaryRange}
                                          </Badge>
                                          <Badge bg="info">
                                            <FaChartLine className="me-1" />
                                            {details.growthPotential}
                                          </Badge>
                                        </div>
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                )
                              })}
                            </Row>
                          </div>

                          <div className="mb-4">
                            <h5 className="mb-3">
                              <FaChartLine className="me-2 text-success" />
                              <TransText k="occupation.careerProgressionPath" as="span" /> {occupationDetails.title}
                            </h5>
                            <Row>
                              {occupationDetails.careerPath.map((level, index) => (
                                <Col md={4} key={index} className="mb-3">
                                  <Card 
                                    className="h-100 border career-level-card"
                                  >
                                    <Card.Body className="p-3 text-center">
                                      <div className="icon-wrapper">
                                        <FaTrophy />
                                      </div>
                                      <h6 className="mb-1">{level.level}</h6>
                                      <small className="text-muted d-block mb-2">{level.experience}</small>
                                      <Badge bg="success">{level.salary}</Badge>
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))}
                            </Row>
                          </div>
                        </Tab.Pane>

                        {/* Step-by-Step Guidance Tab */}
                        <Tab.Pane eventKey="step-by-step">
                          <h5 className="mb-3">
                            <FaRocket className="me-2 text-primary" />
                            <TransText k="occupation.stepByStepPath" as="span" />
                          </h5>
                          <p className="text-muted mb-4">
                            <TransText k="occupation.followSteps" as="span" /> {occupationDetails.title}
                          </p>
                          <Row>
                            {occupationDetails.steps.map((step, index) => (
                              <Col md={6} key={index}>
                                <Card 
                                  className="mb-3 border step-card"
                                >
                                  <Card.Body className="p-3">
                                    <div className="d-flex align-items-start gap-3">
                                      <div className="step-number">
                                        <Badge bg="primary" className="rounded-circle p-3">
                                          {step.step}
                                        </Badge>
                                      </div>
                                      <div className="flex-grow-1">
                                        <h6 className="mb-1">{step.titleKey ? getTranslation(step.titleKey, language) : step.title}</h6>
                                        <p className="mb-2 fw-bold" style={{ fontSize: '1.1rem' }}>{step.descriptionKey ? getTranslation(step.descriptionKey, language) : step.description}</p>
                                        <Badge bg="info" className="mb-2">{step.durationKey ? getTranslation(step.durationKey, language) : step.duration}</Badge>
                                        <div className="mt-2">
                                          <small className="text-muted d-block mb-1"><TransText k="occupation.tips" as="span" />:</small>
                                          <ul className="mb-0 ps-3">
                                            {step.tips.map((tip, idx) => (
                                              <li key={idx} className="small text-muted">{tip}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </Tab.Pane>

                        {/* Skills & Exams Tab */}
                        <Tab.Pane eventKey="skills-exams">
                          <Row>
                            <Col md={6}>
                              <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                                <Card.Header className="bg-white border-0 pt-4 pb-0">
                                  <div className="d-flex align-items-center gap-2">
                                    <FaStar className="text-warning" />
                                    <h5 className="mb-0"><TransText k="occupation.requiredSkills" as="span" /></h5>
                                  </div>
                                </Card.Header>
                                <Card.Body className="p-4">
                                  <div className="d-flex flex-wrap gap-2">
                                    {occupationDetails.skills.map((skill, index) => (
                                      <Badge 
                                        key={index} 
                                        bg="light" 
                                        text="dark" 
                                        className="p-2 fs-6"
                                      >
                                        <FaCheckCircle className="me-1 text-success" />
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </Card.Body>
                              </Card>
                            </Col>
                            <Col md={6}>
                              {occupationDetails.exams.length > 0 && (
                                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                                  <Card.Header className="bg-white border-0 pt-4 pb-0">
                                    <div className="d-flex align-items-center gap-2">
                                      <FaClipboardList className="text-info" />
                                      <h5 className="mb-0"><TransText k="occupation.entranceExams" as="span" /></h5>
                                    </div>
                                  </Card.Header>
                                  <Card.Body className="p-4">
                                    <Accordion>
                                      {occupationDetails.exams.map((exam, index) => (
                                        <Accordion.Item key={index} eventKey={index.toString()}>
                                          <Accordion.Header>
                                            <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                              <span>{exam.name}</span>
                                              <Badge bg="info">{exam.difficulty}</Badge>
                                            </div>
                                          </Accordion.Header>
                                          <Accordion.Body>
                                            <Row>
                                              <Col md={4}>
                                                <small className="text-muted"><TransText k="occupation.eligibility" as="span" /></small>
                                                <p className="mb-0">{exam.eligibility}</p>
                                              </Col>
                                              <Col md={4}>
                                                <small className="text-muted"><TransText k="occupation.frequency" as="span" /></small>
                                                <p className="mb-0">{exam.frequency}</p>
                                              </Col>
                                              <Col md={4}>
                                                <small className="text-muted"><TransText k="occupation.difficulty" as="span" /></small>
                                                <p className="mb-0">{exam.difficulty}</p>
                                              </Col>
                                            </Row>
                                          </Accordion.Body>
                                        </Accordion.Item>
                                      ))}
                                    </Accordion>
                                  </Card.Body>
                                </Card>
                              )}
                            </Col>
                          </Row>
                        </Tab.Pane>

                        {/* Top Colleges Tab */}
                        <Tab.Pane eventKey="colleges">
                          {occupationDetails.topColleges.length > 0 && (
                            <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                              <Card.Header className="bg-white border-0 pt-4 pb-0">
                                <div className="d-flex align-items-center gap-2">
                                  <FaUniversity className="text-primary" />
                                  <h5 className="mb-0"><TransText k="occupation.topColleges" as="span" /></h5>
                                </div>
                              </Card.Header>
                              <Card.Body className="p-4">
                                <Row>
                                  {occupationDetails.topColleges.map((college, index) => (
                                    <Col md={6} key={index} className="mb-3">
                                      <Card 
                                        className="h-100 border college-card"
                                      >
                                        <Card.Body className="p-3">
                                          <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                              <h6 className="mb-1">{college.name}</h6>
                                              <small className="text-muted">
                                                <FaMapMarkerAlt className="me-1" />
                                                {college.location}
                                              </small>
                                            </div>
                                            <Badge bg="warning">{college.ranking}</Badge>
                                          </div>
                                        </Card.Body>
                                      </Card>
                                    </Col>
                                  ))}
                                </Row>
                              </Card.Body>
                            </Card>
                          )}
                        </Tab.Pane>
                      </Tab.Content>
                    </Tab.Container>
                  </Card.Body>
                </Card>

                {/* Action Buttons */}
                <Card className="shadow-sm border-0" style={{ borderRadius: '10px' }}>
                  <Card.Body className="p-4 text-center">
                    <h5 className="mb-3"><TransText k="occupation.readyToStart" as="span" /></h5>
                    <p className="text-muted mb-4">
                      <TransText k="occupation.selectedCareer" as="span" /> {occupationDetails.title} <TransText k="occupation.asCareerPath" as="span" />
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <Button variant="primary" size="lg" onClick={() => navigate('/UserDashboard')}>
                        <FaRocket className="me-2" />
                        <TransText k="occupation.goToDashboard" as="span" />
                      </Button>
                      <Button variant="outline-primary" size="lg" onClick={() => navigate('/UserNotifications')}>
                        <FaArrowLeft className="me-2" />
                        <TransText k="occupation.exploreMoreCareers" as="span" />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </>
            )}
          </Container>
        </div>
      </div>


    </div>
  )
}

export default OccupationDetails
