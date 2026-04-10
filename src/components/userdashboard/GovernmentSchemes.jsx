import React, { useState, useEffect } from 'react'
import { Container, Card, Button, Row, Col, Badge, Form, Modal, Alert, Tab, Nav } from 'react-bootstrap'
import { FaGraduationCap, FaArrowLeft, FaCheckCircle, FaInfoCircle, FaBook, FaMoneyBillWave, FaBriefcase, FaLaptop, FaUniversity, FaBus, FaUtensils, FaHouseUser, FaHeart, FaShieldAlt, FaLaptopCode, FaUserGraduate, FaAward, FaPiggyBank, FaHandHoldingUsd, FaTools, FaMedal, FaBaby, FaFemale } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import UseLeftNav from './UseLeftNav'
import UserTopNav from './UserTopNav'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import TransText from '../TransText'
import { getTranslation } from '../../utils/translations'
import '../../assets/css/UserSettings.css'

const GovernmentSchemes = () => {
  const { uniqueId, userRoleType, accessToken } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedScheme, setSelectedScheme] = useState(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  const categories = [
    { 
      id: 'education', 
      nameKey: 'schemes.education', 
      icon: <FaGraduationCap />, 
      descriptionKey: 'schemes.educationDesc'
    },
    { 
      id: 'scholarship', 
      nameKey: 'schemes.scholarship', 
      icon: <FaPiggyBank />, 
      descriptionKey: 'schemes.scholarshipDesc'
    },
    { 
      id: 'skills', 
      nameKey: 'schemes.skills', 
      icon: <FaTools />, 
      descriptionKey: 'schemes.skillsDesc'
    },
    { 
      id: 'women', 
      nameKey: 'schemes.womenWelfare', 
      icon: <FaFemale />, 
      descriptionKey: 'schemes.womenWelfareDesc'
    }
  ]

  const schemesData = {
    education: [
      {
        id: 1,
        nameKey: 'schemes.nsp',
        icon: <FaGraduationCap />,
        descriptionKey: 'schemes.nspDesc',
        description: 'Central Government portal for various scholarships across India',
        benefits: ['Multiple scholarship schemes', 'Single window application', 'Direct benefit transfer'],
        eligibility: 'Students from Class 1 to PhD level',
        documents: ['Aadhaar Card', 'Income Certificate', 'Marksheet', 'Bank Account Details'],
        applicationProcess: 'Online application through national scholarship portal',
        officialLink: 'https://scholarships.gov.in/',
        amount: 'Varies by scheme'
      },
      {
        id: 2,
        nameKey: 'schemes.scScholarship',
        name: 'Post Matric Scholarship for SC Students',
        icon: <FaBook />,
        description: 'Scholarship for SC students pursuing post-matriculation education',
        benefits: ['Tuition fee reimbursement', 'Monthly maintenance allowance', 'Book grant'],
        eligibility: 'SC students with family income below specified limit',
        documents: ['Caste Certificate', 'Income Certificate', 'Previous Year Marksheet', 'Bank Account'],
        applicationProcess: 'Apply through state welfare department',
        officialLink: 'https://socialjustice.gov.in/',
        amount: 'Up to ₹15,000 per annum'
      },
      {
        id: 3,
        nameKey: 'schemes.stScholarship',
        name: 'Post Matric Scholarship for ST Students',
        icon: <FaBook />,
        description: 'Scholarship for ST students for post-matriculation studies',
        benefits: ['Full tuition fee', 'Living allowance', 'Book allowance'],
        eligibility: 'ST students with annual family income below ₹2.5 Lakh',
        documents: ['ST Certificate', 'Income Certificate', 'Marksheets', 'Hostel Certificate (if applicable)'],
        applicationProcess: 'Apply through tribal development department',
        officialLink: 'https://tribal.nic.in/',
        amount: 'Up to ₹15,000 per annum'
      },
      {
        id: 4,
        nameKey: 'schemes.centralScholarship',
        name: 'Central Sector Scheme of Scholarships',
        icon: <FaAward />,
        description: 'Scholarship for top performing students from economically weaker sections',
        benefits: ['₹10,000 per annum for first 3 years', '₹20,000 for 4th and 5th year', 'Book grant'],
        eligibility: 'Students above 80th percentile in Class 12 board exams',
        documents: ['Class 12 Marksheet', 'Income Certificate', 'Aadhaar Card', 'Bank Account'],
        applicationProcess: 'Online application through National Scholarship Portal',
        officialLink: 'https://scholarships.gov.in/',
        amount: '₹10,000 - ₹20,000 per annum'
      },
      {
        id: 5,
        nameKey: 'schemes.nandaGoraHigher',
        name: 'Nanda Gora Higher Education Scheme',
        icon: <FaGraduationCap />,
        description: 'Educational support and loans for meritorious students pursuing higher education after 12th',
        benefits: ['Educational loan up to ₹10 Lakhs', 'Scholarship for merit holders', 'Educational material support', 'Career counseling'],
        eligibility: 'Students who have passed Class 12 with minimum 50% marks and annual family income below ₹3 Lakh',
        documents: ['Class 12 Certificate', 'College Admission Letter', 'Income Certificate', 'Aadhaar Card', 'Bank Account Details'],
        applicationProcess: 'Apply through Ministry of Education or partner financial institutions',
        officialLink: 'https://www.education.gov.in/',
        amount: 'Loan up to ₹10 Lakhs + Merit scholarship'
      }
    ],
    scholarship: [
      {
        id: 6,
        nameKey: 'schemes.pmScholarship',
        name: 'Prime Minister Scholarship Scheme',
        icon: <FaPiggyBank />,
        description: 'Scholarship for wards of Central Armed Police Forces and RPF',
        benefits: ['₹2,500 per month for boys', '₹3,000 per month for girls', 'Annual book grant'],
        eligibility: 'Children of CAPF/RPF personnel pursuing professional courses',
        documents: ['Parent Service Certificate', 'Class 12 Marksheet', 'Admission Letter', 'Aadhaar Card'],
        applicationProcess: 'Online application through National Scholarship Portal',
        officialLink: 'https://scholarships.gov.in/',
        amount: '₹2,500 - ₹3,000 per month'
      },
      {
        id: 7,
        nameKey: 'schemes.obcScholarship',
        name: 'Pre-Matric Scholarship for OBC Students',
        icon: <FaHandHoldingUsd />,
        description: 'Scholarship for OBC students studying in Classes 1 to 10',
        benefits: ['₹600 per month for Classes 1-5', '₹1,000 per month for Classes 6-10'],
        eligibility: 'OBC students with family income below ₹2.5 Lakh per annum',
        documents: ['OBC Certificate', 'Income Certificate', 'School ID', 'Bank Account Details'],
        applicationProcess: 'Apply through state social welfare department',
        officialLink: 'https://www.ncm.nic.in/',
        amount: '₹600 - ₹1,000 per month'
      },
      {
        id: 8,
        nameKey: 'schemes.minorityScholarship',
        name: 'Merit-cum-Means Scholarship',
        icon: <FaMedal />,
        description: 'Scholarship for professional courses for students from minority communities',
        benefits: ['100% tuition fee waiver', '₹10,000 per annum for books', 'Monthly maintenance'],
        eligibility: 'Minority community students with 50% marks and family income below ₹2 Lakh',
        documents: ['Minority Certificate', 'Income Certificate', 'Marksheets', 'College Fee Receipt'],
        applicationProcess: 'Apply through Ministry of Minority Affairs portal',
        officialLink: 'https://minorityaffairs.gov.in/',
        amount: '100% fee waiver + ₹10,000'
      },
      {
        id: 9,
        name: 'Nanda Gora Women Development Scheme',
        nameKey: 'schemes.nandaGora',
        icon: <FaPiggyBank />,
        description: 'Scheme for skill development and livelihood support for women in rural areas',
        descriptionKey: 'schemes.nandaGoraDesc',
        benefits: ['Monthly stipend of ₹3,000', 'Skill development training', 'Business support and mentoring', 'Microfinance assistance up to ₹50,000'],
        eligibility: 'Women from rural areas aged 18-45 years with family income below ₹1.5 Lakh per annum',
        documents: ['Aadhaar Card', 'Address Proof', 'Income Certificate', 'Bank Account Details'],
        applicationProcess: 'Apply through Women Development Block Office or online portal',
        officialLink: 'https://www.nandagaurauk.in/',
        amount: '₹3,000 per month + training'
      }
    ],
    skills: [
      {
        id: 10,
        nameKey: 'schemes.skillIndia',
        name: 'Skill India Mission',
        icon: <FaTools />,
        description: 'National mission for skills training and development',
        benefits: ['Free skill training', 'Industry-recognized certification', 'Placement assistance'],
        eligibility: 'Youth aged 15 years and above',
        documents: ['Aadhaar Card', 'Educational Certificate', 'Photo', 'Bank Account'],
        applicationProcess: 'Register at nearest Skill India Centre or online',
        officialLink: 'https://www.skillindia.gov.in/',
        amount: 'Free training with stipend'
      },
      {
        id: 11,
        nameKey: 'schemes.pmkvy',
        name: 'PMKVY (Pradhan Mantri Kaushal Vikas Yojana)',
        icon: <FaLaptopCode />,
        description: 'Skill certification program under Skill India Mission',
        benefits: ['Free skill training', 'Industry-recognized certificate', 'Placement support', 'Market fee'],
        eligibility: 'Youth seeking skill development and employment',
        documents: ['Aadhaar Card', 'Educational Qualification Proof', 'Bank Account'],
        applicationProcess: 'Enroll at nearest PMKVY center or online portal',
        officialLink: 'https://pmkvylms.org/',
        amount: 'Training free + placement'
      },
      {
        id: 12,
        nameKey: 'schemes.apprenticeship',
        name: 'National Apprenticeship Promotion Scheme',
        icon: <FaBriefcase />,
        description: 'Scheme to promote apprenticeship training',
        benefits: ['Monthly stipend', 'Certificate from NIOS', 'Practical work experience'],
        eligibility: 'Candidates who have completed Class 10 or above',
        documents: ['Aadhaar Card', 'Educational Certificate', 'Bank Account', 'Photo'],
        applicationProcess: 'Apply through apprenticeship portal',
        officialLink: 'https://www.apprenticeshipindia.gov.in/',
        amount: '₹5,000 - ₹9,000 per month'
      },
      {
        id: 13,
        nameKey: 'schemes.digitalIndia',
        name: 'Digital India Program',
        icon: <FaLaptop />,
        description: 'Training program for digital literacy',
        benefits: ['Free computer training', 'Digital certificate', 'Basic IT skills'],
        eligibility: 'All citizens, especially women and rural population',
        documents: ['Aadhaar Card', 'Photo', 'Basic education proof'],
        applicationProcess: 'Enroll at Common Service Centre or online',
        officialLink: 'https://www.digitalindia.gov.in/',
        amount: 'Free training'
      }
    ],
    women: [
      {
        id: 14,
        nameKey: 'schemes.betiBachao',
        name: 'Beti Bachao Beti Padhao',
        icon: <FaFemale />,
        description: 'Scheme for survival, protection and education of girl child',
        benefits: ['Awareness programs', 'Educational support', 'Health services'],
        eligibility: 'Girls from birth to Class 12',
        documents: ['Birth Certificate', 'Aadhaar Card', 'School ID', 'Parent ID'],
        applicationProcess: 'Through local Anganwadi or school',
        officialLink: 'https://wcd.nic.in/bbbp-scheme',
        amount: 'Various benefits'
      },
      {
        id: 15,
        nameKey: 'schemes.sukanya',
        name: 'Sukanya Samriddhi Yojana',
        icon: <FaPiggyBank />,
        description: 'Savings scheme for girl child',
        benefits: ['High interest rate (8.2%)', 'Tax benefits', 'Tax-free maturity amount'],
        eligibility: 'Parents/guardians of girl child below 10 years',
        documents: ['Girl Child Birth Certificate', 'Parent ID Proof', 'Address Proof', 'Photo'],
        applicationProcess: 'Open account at Post Office or authorized bank',
        officialLink: 'https://www.indiapost.gov.in/',
        amount: 'Investment with high returns'
      },
      {
        id: 16,
        nameKey: 'schemes.matruVandana',
        name: 'Pradhan Mantri Matru Vandana Yojana',
        icon: <FaBaby />,
        description: 'Maternity benefit program for pregnant and lactating mothers',
        benefits: ['₹5,000 in three installments', 'DBT to bank account', 'Health checkups'],
        eligibility: 'Pregnant women and lactating mothers',
        documents: ['Aadhaar Card', 'MCP Card', 'Bank Account', 'Pregnancy Proof'],
        applicationProcess: 'Apply through Anganwadi center or hospital',
        officialLink: 'https://wcd.nic.in/',
        amount: '₹5,000 in installments'
      },
      {
        id: 17,
        nameKey: 'schemes.womenHelpline',
        name: 'Women Helpline Scheme',
        icon: <FaShieldAlt />,
        description: '24x7 helpline for women in distress',
        benefits: ['Emergency assistance', 'Legal aid', 'Counseling', 'Shelter referral'],
        eligibility: 'All women in distress',
        documents: ['No documents required for emergency'],
        applicationProcess: 'Call 181 (national) or 1091 (state)',
        officialLink: 'https://wcd.nic.in/',
        amount: 'Free service'
      },
      {
        id: 18,
        nameKey: 'schemes.oneStopCentre',
        name: 'One Stop Centre Scheme',
        icon: <FaHeart />,
        description: 'Integrated support and assistance center for women',
        benefits: ['Legal aid', 'Medical assistance', 'Psychological support', 'Shelter'],
        eligibility: 'All women facing violence',
        documents: ['No documents required'],
        applicationProcess: 'Visit nearest OSC or call 181',
        officialLink: 'https://wcd.nic.in/',
        amount: 'Free services'
      },
      {
        id: 19,
        nameKey: 'schemes.mahilaShakti',
        name: 'Mahila Shakti Kendra',
        icon: <FaFemale />,
        description: 'Empowerment center for rural women',
        benefits: ['Skill training', 'Employment guidance', 'Legal aid', 'Scholarship information'],
        eligibility: 'Women from rural areas',
        documents: ['Aadhaar Card', 'Any ID Proof'],
        applicationProcess: 'Visit nearest MSK center in your block',
        officialLink: 'https://wcd.nic.in/',
        amount: 'Free services'
      }
    ]
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
  }

  const handleSchemeClick = (scheme) => {
    setSelectedScheme(scheme)
    setShowModal(true)
  }

  const getCategorySchemes = () => {
    if (!selectedCategory) {
      return []
    }
    return schemesData[selectedCategory] || []
  }

  const getAllSchemes = () => {
    const allSchemes = []
    Object.values(schemesData).forEach(categorySchemes => {
      allSchemes.push(...categorySchemes)
    })
    return allSchemes
  }

  const displayedSchemes = selectedCategory ? getCategorySchemes() : []
  const allSchemes = getAllSchemes()

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
            <div className="mb-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/UserDashboard')} 
                className="d-flex align-items-center"
              >
                <FaArrowLeft className="me-2" />
                <TransText k="schemes.backToDashboard" as="span" />
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" style={{ width: '60px', height: '60px' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3"><TransText k="schemes.loading" as="span" /></p>
              </div>
            ) : (
              <div>
                <Card className="shadow-sm mb-4 border-0 notifications-header-card" style={{ borderRadius: '10px' }}>
                  <Card.Body className="card-mobile">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                      <div>
                        <h3 className="mb-2">
                          <FaAward className="me-2 text-primary" />
                          <TransText k="schemes.title" as="span" />
                        </h3>
                        <p className="text-muted mb-0">
                          <TransText k="schemes.subtitle" as="span" />
                        </p>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                  <Card.Body className="card-mobile">
                    <h5 className="mb-3">
                      <Badge bg="primary" className="me-2"><TransText k="schemes.selectCategory" as="span" /></Badge>
                      <TransText k="schemes.chooseCategory" as="span" />
                    </h5>
                    <Row>
                      {categories.map((category) => (
                        <Col lg={3} md={6} className="mb-3" key={category.id}>
                          <Card
                            className={`h-100 border stream-selection-card ${selectedCategory === category.id ? 'selected' : ''}`}
                            style={{
                              cursor: 'pointer',
                              borderColor: selectedCategory === category.id ? '#667eea' : '#dee2e6',
                              backgroundColor: selectedCategory === category.id ? '#f0f4ff' : 'white'
                            }}
                            onClick={() => handleCategoryChange(category.id)}
                          >
                            <Card.Body className="p-3 text-center">
                              <div className="stream-icon-large mb-2">
                                {category.icon}
                              </div>
                              <h6 className="mb-1"><TransText k={category.nameKey} as="span" /></h6>
                              <small className="text-muted"><TransText k={category.descriptionKey} as="span" /></small>
                              {selectedCategory === category.id && (
                                <Badge bg="primary" className="mt-2">
                                  <FaCheckCircle className="me-1" /> <TransText k="schemes.selected" as="span" />
                                </Badge>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>

                {selectedCategory && displayedSchemes.length > 0 && (
                  <>
                    <Card className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                      <Card.Header className="bg-white border-0 pt-4 pb-0">
                        <h5 className="mb-0">
                          <FaUniversity className="me-2 text-primary" />
                          <TransText k="schemes.availableSchemes" as="span" /> - <TransText k={categories.find(c => c.id === selectedCategory)?.nameKey} as="span" />
                        </h5>
                        <p className="text-muted mb-0">
                          <TransText k="schemes.browseSchemes" as="span" />
                        </p>
                      </Card.Header>
                      <Card.Body className="">
                        <Tab.Container id="schemes-tabs" defaultActiveKey="category">
                          <Nav variant="tabs" className="mb-4">
                            <Nav.Item>
                              <Nav.Link eventKey="category">
                                <FaBook className="me-2" />
                                <TransText k="schemes.categorySchemes" as="span" />
                              </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                              <Nav.Link eventKey="all">
                                <FaAward className="me-2" />
                                <TransText k="schemes.allSchemes" as="span" />
                              </Nav.Link>
                            </Nav.Item>
                          </Nav>
                          <Tab.Content>
                            <Tab.Pane eventKey="category">
                              <Row>
                                {displayedSchemes.map((scheme) => (
                                  <Col lg={4} md={6} className="mb-4" key={scheme.id}>
                                    <Card 
                                      className="h-100 border course-card"
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => handleSchemeClick(scheme)}
                                    >
                                      <Card.Body className="">
                                        <div className="d-flex align-items-start gap-3 mb-3">
                                          <div className="course-icon-large">
                                            {scheme.icon}
                                          </div>
                                          <div>
                                            <h6 className="mb-1">{scheme.nameKey ? getTranslation(scheme.nameKey, language) : scheme.name}</h6>
                                            <Badge bg="success">{scheme.amount}</Badge>
                                          </div>
                                        </div>
                                        <p className="text-muted small mb-3">
                                          {scheme.description}
                                        </p>
                                        <div className="mt-auto">
                                          <small className="text-muted d-block mb-2"><TransText k="schemes.keyBenefits" as="span" /></small>
                                          <div className="d-flex flex-wrap gap-1">
                                            {scheme.benefits.slice(0, 3).map((benefit, idx) => (
                                              <Badge bg="light" text="dark" key={idx} className="small">
                                                {benefit}
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
                                {allSchemes.map((scheme) => (
                                  <Col lg={4} md={6} className="mb-4" key={scheme.id}>
                                    <Card 
                                      className="h-100 border course-card"
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => handleSchemeClick(scheme)}
                                    >
                                      <Card.Body className="">
                                        <div className="d-flex align-items-start gap-3 mb-3">
                                          <div className="course-icon-large">
                                            {scheme.icon}
                                          </div>
                                          <div>
                                            <h6 className="mb-1">{scheme.nameKey ? getTranslation(scheme.nameKey, language) : scheme.name}</h6>
                                            <Badge bg="success">{scheme.amount}</Badge>
                                          </div>
                                        </div>
                                        <p className="text-muted small mb-3">
                                          {scheme.description}
                                        </p>
                                        <div className="mt-auto">
                                          <small className="text-muted d-block mb-2"><TransText k="schemes.keyBenefits" as="span" /></small>
                                          <div className="d-flex flex-wrap gap-1">
                                            {scheme.benefits.slice(0, 3).map((benefit, idx) => (
                                              <Badge bg="light" text="dark" key={idx} className="small">
                                                {benefit}
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
                  </>
                )}

                {!selectedCategory && (
                  <Card className="shadow-sm border-0 instructions-card" style={{ borderRadius: '10px' }}>
                    <Card.Body className="">
                      <h4><TransText k="schemes.howToApply" as="span" /></h4>
                      <p className="text-muted mb-0">
                        <strong><TransText k="schemes.step1" as="span" />:</strong> <TransText k="schemes.instructionStep1" as="span" /><br />
                        <strong><TransText k="schemes.step2" as="span" />:</strong> <TransText k="schemes.instructionStep2" as="span" /><br />
                        <strong><TransText k="schemes.step3" as="span" />:</strong> <TransText k="schemes.instructionStep3" as="span" />
                      </p>
                    </Card.Body>
                  </Card>
                )}
              </div>
            )}
          </Container>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered scrollable className="government-schemes-modal">
        <Modal.Header closeButton className="border-0" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem 1.5rem', borderRadius: '8px 8px 0 0'}}>
          <Modal.Title className="w-100">
            <div className="d-flex align-items-center gap-3" style={{color: 'white'}}>
              <div style={{fontSize: '2.5rem', display: 'flex', alignItems: 'center'}}>
                {selectedScheme?.icon}
              </div>
              <div style={{flex: 1}}>
                <h3 className="mb-2 fw-bold" style={{color: 'white', fontSize: '1.5rem'}}>
                  {selectedScheme?.nameKey ? getTranslation(selectedScheme.nameKey, language) : selectedScheme?.name}
                </h3>
                <p className="mb-0" style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)'}}>
                  {language === 'hi' ? '✓ सरकारी योजना' : '✓ Government Scheme'}
                </p>
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-4" style={{background: '#f8f9fa'}}>
          {selectedScheme && (
            <div>
              {/* Amount Badge - Prominent */}
              <div className="mb-4">
                <div className="text-center p-4 rounded" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
                  <small style={{fontSize: '0.85rem', opacity: 0.9}}>{language === 'hi' ? 'कुल लाभ की राशि' : 'Total Benefit Amount'}</small>
                  <h2 className="mb-0 mt-2 fw-bold">{selectedScheme.amount}</h2>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4 p-4 bg-white rounded border-start border-5" style={{borderColor: '#667eea'}}>
                <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                  {language === 'hi' ? '📌 योजना का विवरण' : '📌 About this Scheme'}
                </h6>
                <p className="mb-0 text-muted" style={{lineHeight: '1.6'}}>{selectedScheme.description}</p>
              </div>

              {/* Benefits - Highlighted */}
              <div className="mb-4 p-4 bg-white rounded">
                <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                  <span style={{color: '#28a745'}}>✨ {language === 'hi' ? 'मुख्य लाभ' : 'Key Benefits'}</span>
                </h6>
                <div className="ps-2">
                  {selectedScheme.benefits.map((benefit, idx) => (
                    <div key={idx} className="mb-3 d-flex align-items-start">
                      <span style={{color: '#28a745', marginRight: '0.75rem', marginTop: '0.25rem', fontSize: '1.2rem'}}>✓</span>
                      <span className="text-muted" style={{fontSize: '0.95rem'}}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility - Important */}
              <div className="mb-4 p-4 bg-white rounded border-start border-5" style={{borderColor: '#0d6efd'}}>
                <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                  <span style={{color: '#0d6efd'}}>👤 {language === 'hi' ? 'कौन आवेदन कर सकता है?' : 'Who Can Apply?'}</span>
                </h6>
                <p className="mb-0 text-muted" style={{lineHeight: '1.6', fontSize: '0.95rem'}}>{selectedScheme.eligibility}</p>
              </div>

              {/* Documents Required */}
              <div className="mb-4 p-4 bg-white rounded">
                <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                  <span style={{color: '#fd7e14'}}>📄 {language === 'hi' ? 'आवश्यक दस्तावेज़' : 'Documents Needed'}</span>
                </h6>
                <div className="row g-3 ps-2">
                  {selectedScheme.documents.map((doc, idx) => (
                    <div key={idx} className="col-md-6">
                      <div className="p-3 rounded d-flex align-items-start" style={{background: '#fff3cd', border: '1px solid #ffc107'}}>
                        <span style={{color: '#fd7e14', marginRight: '0.75rem', fontSize: '1rem'}}>📋</span>
                        <span className="text-muted small" style={{fontSize: '0.9rem'}}>{doc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step by Step Application Guide */}
              <div className="mb-4 p-4 bg-white rounded border-top border-5" style={{borderColor: '#0dcaf0'}}>
                <h6 className="text-dark mb-4 fw-bold" style={{fontSize: '1.05rem'}}>
                  <span style={{color: '#0dcaf0'}}>📍 {language === 'hi' ? 'आवेदन कैसे करें? (सरल चरण)' : 'How to Apply? (Simple Steps)'}</span>
                </h6>
                <div className="ms-2">
                  {[
                    {
                      title: language === 'hi' ? 'सभी दस्तावेज़ तैयार करें' : 'Gather All Documents',
                      desc: language === 'hi' ? 'ऊपर दिए गए सभी दस्तावेज़ों की मूल प्रति या फोटोकॉपी तैयार करें।' : 'Collect original or photocopy of all documents listed above.'
                    },
                    {
                      title: language === 'hi' ? 'आधिकारिक वेबसाइट पर जाएं' : 'Visit Official Website',
                      desc: language === 'hi' ? 'नीचे दिए गए लिंक पर क्लिक करें और आधिकारिक वेबसाइट खोलें।' : 'Click the link below to open the official government website.'
                    },
                    {
                      title: language === 'hi' ? 'आवेदन फॉर्म भरें' : 'Fill Application Form',
                      desc: language === 'hi' ? 'वेबसाइट पर "आवेदन करें" या "नया आवेदन" बटन खोजें और फॉर्म भरें।' : 'Look for "Apply Now" or "New Application" button and fill in all details.'
                    },
                    {
                      title: language === 'hi' ? 'दस्तावेज़ अपलोड करें' : 'Upload Documents',
                      desc: language === 'hi' ? 'फॉर्म में सभी आवश्यक दस्तावेज़ों की स्कैन प्रति अपलोड करें।' : 'Upload scanned copies of all required documents in the form.'
                    },
                    {
                      title: language === 'hi' ? 'आवेदन सबमिट करें' : 'Submit Application',
                      desc: language === 'hi' ? 'सभी विवरण जांचें और "सबमिट" बटन पर क्लिक करें।' : 'Double-check all details and click "Submit" button.'
                    },
                    {
                      title: language === 'hi' ? 'पुष्टिकरण प्राप्त करें' : 'Get Confirmation',
                      desc: language === 'hi' ? 'आपको एक संदर्भ संख्या/पावती मिलेगी। इसे सुरक्षित रखें।' : 'You will receive a reference number/receipt. Keep it safe for future updates.'
                    }
                  ].map((step, idx) => (
                    <div key={idx} className="mb-3 d-flex gap-3">
                      <div className="d-flex align-items-center justify-content-center" style={{minWidth: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '50%', fontWeight: 'bold', fontSize: '1rem'}}>
                        {idx + 1}
                      </div>
                      <div style={{flex: 1}}>
                        <strong className="text-dark d-block" style={{fontSize: '0.95rem', marginBottom: '0.25rem'}}>{step.title}</strong>
                        <p className="mb-0 text-muted small" style={{fontSize: '0.85rem', lineHeight: '1.5'}}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="mb-4 p-4 rounded" style={{background: '#fff3cd', border: '2px solid #ffc107'}}>
                <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                  <span style={{color: '#fd7e14'}}>⚠️ {language === 'hi' ? 'महत्वपूर्ण सुझाव' : 'Important Tips'}</span>
                </h6>
                <ul className="mb-0 ps-4 small" style={{color: '#856404', fontSize: '0.9rem'}}>
                  <li className="mb-2">{language === 'hi' ? 'गलत या अधूरे आवेदन को अस्वीकार किया जा सकता है।' : 'Incomplete applications may be rejected.'}</li>
                  <li className="mb-2">{language === 'hi' ? 'आवेदन की समय सीमा को मिस न करें।' : 'Do not miss the application deadline.'}</li>
                  <li>{language === 'hi' ? 'सभी दस्तावेज़ स्पष्ट और वैध होने चाहिए।' : 'All documents must be clear and valid.'}</li>
                </ul>
              </div>

              {/* Official Link */}
              <div className="p-4 rounded" style={{background: '#e7f3ff', border: '2px solid #0d6efd'}}>
                <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                  <span style={{color: '#0d6efd'}}>🔗 {language === 'hi' ? 'आधिकारिक वेबसाइट' : 'Official Website'}</span>
                </h6>
                <a href={selectedScheme.officialLink} target="_blank" rel="noopener noreferrer" className="text-break" style={{color: '#0d6efd', textDecoration: 'none', fontWeight: '500'}}>
                  {selectedScheme.officialLink}
                </a>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-white pt-3 pb-3">
          <Button variant="secondary" onClick={() => setShowModal(false)} style={{borderRadius: '8px', padding: '0.5rem 2rem'}}>
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </Button>
          <Button 
            style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '8px', padding: '0.5rem 2rem', fontWeight: 'bold'}} 
            onClick={() => window.open(selectedScheme?.officialLink, '_blank')}
          >
            {language === 'hi' ? '🚀 अभी आवेदन करें' : '🚀 Apply Now'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default GovernmentSchemes
