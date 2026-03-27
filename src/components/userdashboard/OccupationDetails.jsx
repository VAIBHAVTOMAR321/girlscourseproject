import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Alert, Accordion } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import { FaArrowLeft, FaGraduationCap, FaChalkboardTeacher, FaBalanceScale, FaNewspaper, FaPaintBrush, FaHeartbeat, FaCog, FaHospital, FaFlask, FaLaptopMedical, FaSeedling, FaDna, FaBriefcase, FaUserTie, FaBuilding, FaChartBar, FaCode, FaMicrochip, FaNetworkWired, FaDatabase, FaRobot, FaCheckCircle, FaInfoCircle, FaLightbulb, FaBook, FaAward, FaCertificate, FaClock, FaRupeeSign, FaChartLine, FaUsers, FaBookOpen, FaClipboardList, FaStar, FaTrophy, FaRocket } from 'react-icons/fa'

const OccupationDetails = () => {
  const { uniqueId, userRoleType } = useAuth()
  const [loading, setLoading] = useState(true)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { occupation, stream, percentage } = location.state || {}

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
        { step: 1, title: 'Complete 12th Standard', description: 'Complete your 12th standard with good percentage', duration: '2 Years', tips: ['Focus on academics', 'Develop relevant skills'] },
        { step: 2, title: 'Pursue Relevant Degree', description: 'Complete bachelor\'s degree in relevant field', duration: '3-4 Years', tips: ['Choose good college', 'Build practical skills'] },
        { step: 3, title: 'Gain Experience', description: 'Gain practical experience through internships', duration: '1-2 Years', tips: ['Learn from professionals', 'Build network'] },
        { step: 4, title: 'Start Career', description: 'Start your professional career', duration: 'Ongoing', tips: ['Apply for jobs', 'Continue learning'] }
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

  if (!occupation) {
    return (
      <div className="d-flex flex-column">
        <UserTopNav onMenuToggle={handleMenuToggle} isMobile={isMobile} />
        <div className="d-flex flex-1">
          <UseLeftNav showOffcanvas={showOffcanvas} setShowOffcanvas={setShowOffcanvas} />
          <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '280px', padding: isMobile ? '10px' : '20px', minHeight: 'calc(100vh - 70px)' }}>
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
        
        <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '280px', padding: isMobile ? '10px' : '20px', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid>
            {/* Back Button */}
            <div className="mb-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/UserNotifications')} 
                className="d-flex align-items-center"
              >
                <FaArrowLeft className="me-2" />
                Back to Guidance
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" style={{ width: '60px', height: '60px' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading occupation details...</p>
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
                          <p className="text-muted mb-0">{occupationDetails.description}</p>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Badge bg="success" className="fs-6 p-2">
                          <FaRupeeSign className="me-1" />
                          {occupationDetails.salaryRange}
                        </Badge>
                        <Badge bg="info" className="fs-6 p-2">
                          <FaChartLine className="me-1" />
                          {occupationDetails.growthPotential} Growth
                        </Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Quick Stats */}
                <Row className="mb-4">
                  <Col md={4}>
                    <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '10px' }}>
                      <Card.Body className="p-4 text-center">
                        <FaRupeeSign className="text-success mb-3" style={{ fontSize: '36px' }} />
                        <h5>Salary Range</h5>
                        <p className="text-muted mb-0">{occupationDetails.salaryRange}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '10px' }}>
                      <Card.Body className="p-4 text-center">
                        <FaChartLine className="text-info mb-3" style={{ fontSize: '36px' }} />
                        <h5>Growth Potential</h5>
                        <p className="text-muted mb-0">{occupationDetails.growthPotential}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '10px' }}>
                      <Card.Body className="p-4 text-center">
                        <FaUsers className="text-warning mb-3" style={{ fontSize: '36px' }} />
                        <h5>Demand Level</h5>
                        <p className="text-muted mb-0">{occupationDetails.demandLevel}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Step-by-Step Guide */}
                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                  <Card.Header className="bg-white border-0 pt-4 pb-0">
                    <h4 className="mb-0">
                      <FaRocket className="me-2 text-primary" />
                      Step-by-Step Career Path
                    </h4>
                    <p className="text-muted mb-0">Follow these steps to become a {occupationDetails.title}</p>
                  </Card.Header>
                  <Card.Body className="p-4">
                    {occupationDetails.steps.map((step, index) => (
                      <Card key={index} className="mb-3 border step-card">
                        <Card.Body className="p-3">
                          <div className="d-flex align-items-start gap-3">
                            <div className="step-number">
                              <Badge bg="primary" className="rounded-circle p-3" style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {step.step}
                              </Badge>
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h5 className="mb-1">{step.title}</h5>
                                <Badge bg="secondary">
                                  <FaClock className="me-1" />
                                  {step.duration}
                                </Badge>
                              </div>
                              <p className="text-muted mb-2">{step.description}</p>
                              <div className="mt-2">
                                <small className="text-muted d-block mb-1">Tips:</small>
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
                    ))}
                  </Card.Body>
                </Card>

                {/* Required Skills */}
                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                  <Card.Header className="bg-white border-0 pt-4 pb-0">
                    <h4 className="mb-0">
                      <FaStar className="me-2 text-warning" />
                      Required Skills
                    </h4>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <div className="d-flex flex-wrap gap-2">
                      {occupationDetails.skills.map((skill, index) => (
                        <Badge key={index} bg="light" text="dark" className="p-2 fs-6">
                          <FaCheckCircle className="me-1 text-success" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </Card.Body>
                </Card>

                {/* Career Path */}
                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                  <Card.Header className="bg-white border-0 pt-4 pb-0">
                    <h4 className="mb-0">
                      <FaChartLine className="me-2 text-success" />
                      Career Progression
                    </h4>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Row>
                      {occupationDetails.careerPath.map((level, index) => (
                        <Col md={4} key={index} className="mb-3">
                          <Card className="h-100 border career-level-card">
                            <Card.Body className="p-3 text-center">
                              <FaTrophy className="text-warning mb-2" style={{ fontSize: '24px' }} />
                              <h6 className="mb-1">{level.level}</h6>
                              <small className="text-muted d-block mb-2">{level.experience}</small>
                              <Badge bg="success">{level.salary}</Badge>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>

                {/* Entrance Exams */}
                {occupationDetails.exams.length > 0 && (
                  <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                    <Card.Header className="bg-white border-0 pt-4 pb-0">
                      <h4 className="mb-0">
                        <FaClipboardList className="me-2 text-info" />
                        Entrance Exams
                      </h4>
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
                                  <small className="text-muted">Eligibility</small>
                                  <p className="mb-0">{exam.eligibility}</p>
                                </Col>
                                <Col md={4}>
                                  <small className="text-muted">Frequency</small>
                                  <p className="mb-0">{exam.frequency}</p>
                                </Col>
                                <Col md={4}>
                                  <small className="text-muted">Difficulty</small>
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

                {/* Top Colleges */}
                {occupationDetails.topColleges.length > 0 && (
                  <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                    <Card.Header className="bg-white border-0 pt-4 pb-0">
                      <h4 className="mb-0">
                        <FaUniversity className="me-2 text-primary" />
                        Top Colleges
                      </h4>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <Row>
                        {occupationDetails.topColleges.map((college, index) => (
                          <Col md={6} key={index} className="mb-3">
                            <Card className="h-100 border college-card">
                              <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <h6 className="mb-1">{college.name}</h6>
                                    <small className="text-muted">{college.location}</small>
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

                {/* Action Buttons */}
                <Card className="shadow-sm border-0" style={{ borderRadius: '10px' }}>
                  <Card.Body className="p-4 text-center">
                    <h5 className="mb-3">Ready to Start Your Journey?</h5>
                    <p className="text-muted mb-4">
                      You've selected {occupationDetails.title} as your career path. Start preparing today!
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <Button variant="primary" size="lg" onClick={() => navigate('/UserDashboard')}>
                        <FaRocket className="me-2" />
                        Go to Dashboard
                      </Button>
                      <Button variant="outline-primary" size="lg" onClick={() => navigate('/UserNotifications')}>
                        <FaArrowLeft className="me-2" />
                        Explore More Careers
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </>
            )}
          </Container>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .occupation-header-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .occupation-header-card .text-muted {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        
        .occupation-icon-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          font-size: 36px;
        }
        
        .step-card {
          transition: all 0.3s ease;
        }
        
        .step-card:hover {
          transform: translateX(5px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .step-number {
          flex-shrink: 0;
        }
        
        .career-level-card {
          transition: all 0.3s ease;
        }
        
        .career-level-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .college-card {
          transition: all 0.3s ease;
        }
        
        .college-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
          .occupation-header-card .card-body {
            padding: 1.5rem !important;
          }
          
          .occupation-icon-large {
            width: 60px;
            height: 60px;
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  )
}

export default OccupationDetails
