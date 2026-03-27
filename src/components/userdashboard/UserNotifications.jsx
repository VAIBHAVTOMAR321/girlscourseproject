import React, { useState, useEffect, useRef } from 'react'
import { Container, Row, Col, Card, Button, Form, ProgressBar, Badge, Modal, Alert, Nav, Tab } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import { FaArrowLeft, FaGraduationCap, FaChartLine, FaLightbulb, FaRocket, FaBook, FaCode, FaPalette, FaCalculator, FaLanguage, FaMusic, FaHeartbeat, FaBusinessTime, FaPercentage, FaUniversity, FaTools, FaLaptopMedical, FaBriefcase, FaCog, FaFlask, FaBalanceScale, FaNewspaper, FaChalkboardTeacher, FaUserTie, FaPaintBrush, FaGuitar, FaRunning, FaHome, FaWrench, FaIndustry, FaPlane, FaCar, FaBuilding, FaHospital, FaSeedling, FaMicrochip, FaNetworkWired, FaDatabase, FaShieldAlt, FaRobot, FaBrain, FaChartBar, FaProjectDiagram, FaBookOpen, FaBolt, FaDna, FaCheckCircle, FaInfoCircle } from 'react-icons/fa'

  const UserNotifications = () => {
  const { uniqueId, userRoleType } = useAuth()
  const [loading, setLoading] = useState(true)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedStream, setSelectedStream] = useState('')
  const [percentage, setPercentage] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedCareerPath, setSelectedCareerPath] = useState(null)
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
        contentArea.style.marginLeft = '280px'
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

  // 12th Streams
  
  const streams = [
    { id: 'science', name: 'Science Stream', icon: <FaRocket className="text-primary" />, subjects: 'Physics, Chemistry, Biology/Mathematics' },
    { id: 'commerce', name: 'Commerce Stream', icon: <FaChartLine className="text-success" />, subjects: 'Accountancy, Business Studies, Economics' },
    { id: 'arts', name: 'Arts Stream', icon: <FaPalette className="text-warning" />, subjects: 'History, Political Science, Sociology, Psychology' },
    { id: 'computer', name: 'Computer Science', icon: <FaCode className="text-info" />, subjects: 'Programming, Data Structures, Algorithms' }
  ]

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
      alert('Please select your 12th stream first')
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
        
        <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '280px', padding: isMobile ? '10px' : '20px', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid className='fixed-notifications'>
            {/* Back Button */}
            <div className="mb-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/UserDashboard')} 
                className="d-flex align-items-center"
              >
                <FaArrowLeft className="me-2" />
                Back to Dashboard
              </Button>
            </div>

            {/* Header Card */}
            <Card className="shadow-sm mb-4 border-0 notifications-header-card" style={{ borderRadius: '10px' }}>
              <Card.Body className="p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                  <div>
                    <h3 className="mb-2">
                      <FaGraduationCap className="me-2 text-primary" />
                      Future Guidance & Course Suggestions
                    </h3>
                    <p className="text-muted mb-0">
                      Select your 12th stream and enter your percentage to get personalized course and career guidance
                    </p>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" style={{ width: '60px', height: '60px' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading guidance...</p>
              </div>
            ) : (
              <>
                {/* Step 1: Select Stream */}
                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                  <Card.Body className="p-4">
                    <h5 className="mb-3">
                      <Badge bg="primary" className="me-2">Step 1</Badge>
                      Select Your 12th Stream
                    </h5>
                    <Row>
                      {streams.map((stream) => (
                        <Col lg={3} md={6} className="mb-3" key={stream.id}>
                          <Card 
                            className={`h-100 border stream-selection-card ${selectedStream === stream.id ? 'selected' : ''}`}
                            style={{ 
                              borderRadius: '10px',
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
                              <small className="text-muted">{stream.subjects}</small>
                              {selectedStream === stream.id && (
                                <Badge bg="primary" className="mt-2">
                                  <FaCheckCircle className="me-1" /> Selected
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
                        <Badge bg="primary" className="me-2">Step 2</Badge>
                        Enter Your 12th Percentage
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
                        <Col md={6}>
                          <Button 
                            variant="primary" 
                            size="lg"
                            onClick={handleGetGuidance}
                            disabled={!percentage}
                            className="w-100"
                          >
                            <FaLightbulb className="me-2" />
                            Get Course Guidance
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
                            <h5 className="mb-1">Your Performance</h5>
                            <p className="text-muted mb-0">
                              Based on {percentage}% in {streams.find(s => s.id === selectedStream)?.name}
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

                    {/* Courses Tabs */}
                    <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                      <Card.Header className="bg-white border-0 pt-4 pb-0">
                        <h5 className="mb-0">
                          <FaUniversity className="me-2 text-primary" />
                          Course Recommendations
                        </h5>
                        <p className="text-muted mb-0">
                          Browse recommended courses based on your percentage and all available courses in your stream
                        </p>
                      </Card.Header>
                      <Card.Body className="p-4">
                        <Tab.Container id="courses-tabs" defaultActiveKey="recommended">
                          <Nav variant="tabs" className="mb-4">
                            <Nav.Item>
                              <Nav.Link eventKey="recommended">
                                <FaUniversity className="me-2" />
                                Recommended Courses
                              </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                              <Nav.Link eventKey="all">
                                <FaBookOpen className="me-2" />
                                All Courses for {streams.find(s => s.id === selectedStream)?.name}
                              </Nav.Link>
                            </Nav.Item>
                          </Nav>
                          <Tab.Content>
                            <Tab.Pane eventKey="recommended">
                              <Row>
                                {courses.map((course, index) => (
                                  <Col lg={4} md={6} className="mb-4" key={index}>
                                    <Card 
                                      className="h-100 border course-card"
                                      style={{ borderRadius: '10px', cursor: 'pointer' }}
                                      onClick={() => handleCourseClick(course)}
                                    >
                                      <Card.Body className="p-4">
                                        <div className="d-flex align-items-start gap-3 mb-3">
                                          <div className="course-icon-large">
                                            {course.icon}
                                          </div>
                                          <div>
                                            <h6 className="mb-1">{course.name}</h6>
                                            <Badge bg="info">{course.duration}</Badge>
                                          </div>
                                        </div>
                                        <p className="text-muted small mb-3">{course.description}</p>
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
                            </Tab.Pane>
                            <Tab.Pane eventKey="all">
                              <Row>
                                {allCourses.map((course, index) => (
                                  <Col lg={4} md={6} className="mb-4" key={index}>
                                    <Card 
                                      className="h-100 border course-card"
                                      style={{ borderRadius: '10px', cursor: 'pointer' }}
                                      onClick={() => handleCourseClick(course)}
                                    >
                                      <Card.Body className="p-4">
                                        <div className="d-flex align-items-start gap-3 mb-3">
                                          <div className="course-icon-large">
                                            {course.icon}
                                          </div>
                                          <div>
                                            <h6 className="mb-1">{course.name}</h6>
                                            <Badge bg="info">{course.duration}</Badge>
                                          </div>
                                        </div>
                                        <p className="text-muted small mb-3">{course.description}</p>
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
                            </Tab.Pane>
                          </Tab.Content>
                        </Tab.Container>
                      </Card.Body>
                    </Card>

                    {/* Additional Guidance */}
                    <Card className="shadow-sm border-0 guidance-card" style={{ borderRadius: '10px' }}>
                      <Card.Body className="p-4">
                        <h5 className="mb-3">
                          <FaLightbulb className="me-2 text-warning" />
                          Additional Guidance
                        </h5>
                        <Row>
                          <Col md={6}>
                            <h6>For {streams.find(s => s.id === selectedStream)?.name} Students:</h6>
                            <ul className="text-muted">
                              <li>Focus on your core subjects and build strong fundamentals</li>
                              <li>Participate in extracurricular activities related to your stream</li>
                              <li>Consider internships and practical experience</li>
                              <li>Prepare for competitive exams if applicable</li>
                            </ul>
                          </Col>
                          <Col md={6}>
                            <h6>Career Tips:</h6>
                            <ul className="text-muted">
                              <li>Research about the courses and their career prospects</li>
                              <li>Talk to professionals in your field of interest</li>
                              <li>Build a strong portfolio or resume</li>
                              <li>Stay updated with industry trends</li>
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
                    <Card.Body className="p-4 text-center">
                      <FaLightbulb className="text-warning mb-3" style={{ fontSize: '48px' }} />
                      <h4>How to Get Course Guidance</h4>
                      <p className="text-muted mb-0">
                        <strong>Step 1:</strong> Select your 12th stream from the options above<br />
                        <strong>Step 2:</strong> Enter your 12th percentage<br />
                        <strong>Step 3:</strong> Click "Get Course Guidance" to see personalized course recommendations and career paths
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
            <span className="ms-2">{selectedCourse?.name}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCourse && (
            <div>
              <div className="mb-4">
                <h6 className="text-muted mb-2">Course Duration</h6>
                <Badge bg="info" className="fs-6">{selectedCourse.duration}</Badge>
              </div>
              
              <div className="mb-4">
                <h6 className="text-muted mb-2">Description</h6>
                <p>{selectedCourse.description}</p>
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
                          style={{ cursor: 'pointer', borderRadius: '8px' }}
                          onClick={() => handleCareerPathClick(path, selectedCourse?.name)}
                        >
                          <Card.Body className="p-3">
                            <h6 className="mb-2 text-primary">{path.path}</h6>
                            <div className="d-flex justify-content-between mb-2">
                              <Badge bg="success">{path.salary}</Badge>
                              <Badge bg="secondary">{path.growth}</Badge>
                            </div>
                            {selectedCareerPath === path && (
                              <div className="mt-3">
                                <h6 className="text-muted mb-2">Steps to Achieve:</h6>
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
                <strong>Tip:</strong> Research about the admission process, entrance exams, and top colleges for this course. Start preparing early to secure a seat in a good institution.
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

      {/* Styles */}
      <style jsx>{`
        .notifications-header-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .notifications-header-card .text-muted {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        
        .stream-selection-card {
          transition: all 0.3s ease;
        }
        
        .stream-selection-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }
        
        .stream-selection-card.selected {
          border-width: 2px !important;
        }
        
        .stream-icon-large {
          font-size: 36px;
        }
        
        .percentage-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .percentage-input-large {
          padding-right: 40px;
          font-weight: 600;
          font-size: 1.2rem;
          height: 50px;
        }
        
        .percentage-icon-large {
          position: absolute;
          right: 15px;
          color: #6c757d;
          font-size: 1.2rem;
        }
        
        .course-card {
          transition: all 0.3s ease;
        }
        
        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
        }
        
        .course-icon-large {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 24px;
          flex-shrink: 0;
        }
        
        .guidance-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .instructions-card {
          background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
        }
        
        .career-path-card {
          transition: all 0.3s ease;
        }
        
        .career-path-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .career-path-card.selected {
          border-color: #667eea !important;
          background-color: #f0f4ff;
        }
        
        @media (max-width: 768px) {
          .notifications-header-card .card-body {
            padding: 1.5rem !important;
          }
          
          .percentage-input-wrapper {
            width: 100%;
            margin-bottom: 1rem;
          }
          
          .percentage-input-large {
            width: 100% !important;
          }
          
          .stream-icon-large {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  )
}

export default UserNotifications
