import React, { useState, useEffect, useRef } from 'react'
import { Container, Card, Button, Row, Col, Badge, Form, Modal, Alert, Tab, Nav, Spinner } from 'react-bootstrap'
import { FaGraduationCap, FaArrowLeft, FaCheckCircle, FaInfoCircle, FaBook, FaMoneyBillWave, FaBriefcase, FaLaptop, FaUniversity, FaBus, FaUtensils, FaHeart, FaShieldAlt, FaLaptopCode, FaUserGraduate, FaAward, FaPiggyBank, FaHandHoldingUsd, FaTools, FaMedal, FaBaby, FaFemale } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import UseLeftNav from './UseLeftNav'
import UserTopNav from './UserTopNav'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import TransText from '../TransText'
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
  const [activeTab, setActiveTab] = useState('category')
  const [apiCategories, setApiCategories] = useState([])
  const [apiSchemesData, setApiSchemesData] = useState({})
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const schemesSectionRef = useRef(null)

  

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch categories and schemes from API
  useEffect(() => {
    const fetchSchemesData = async () => {
      try {
        setError(null)
        
        const response = await axios.get(
          'https://brjobsedu.com/girls_course/girls_course_backend/api/scheme-category-with-schemes/',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        )
        
        if (response.data.success && response.data.data && Array.isArray(response.data.data)) {
          // Transform API data into categories and schemes
          const categoryList = response.data.data
          const schemesMap = {}
          
          categoryList.forEach((category) => {
            if (category.scheme_category_id && category.schemes) {
              const categoryKey = category.scheme_category_id
              schemesMap[categoryKey] = category.schemes.map(scheme => {
                const imgPath = scheme.scheme_image || ''
                const imgUrl = imgPath && !imgPath.startsWith('http') ? `https://brjobsedu.com/girls_course/girls_course_backend${imgPath}` : imgPath
                return {
                  gov_scheme_id: scheme.gov_scheme_id,
                  title: scheme.title || 'Untitled Scheme',
                  title_hindi: scheme.title_hindi || scheme.title || 'योजना',
                  description: scheme.description || 'No description available',
                  description_hindi: scheme.description_hindi || scheme.description || 'विवरण उपलब्ध नहीं',
                  web_link: scheme.web_link || '#',
                  total_amount: scheme.total_amount || '',
                  scheme_image: imgUrl,
                  sub_mod: scheme.sub_mod || [],
                  sub_mod_hindi: scheme.sub_mod_hindi || []
                }
              })
            }
          })
          
          setApiCategories(categoryList)
          setApiSchemesData(schemesMap)
          setError(null)
          setRetryCount(0)
        } else {
          throw new Error('Invalid response format: missing success or data')
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching schemes:', error)
        setLoading(false)
        
        if (error.response) {
          // Server responded with error status
          if (error.response.status === 401) {
            setError('Unauthorized: Please login again')
          } else if (error.response.status === 403) {
            setError('Forbidden: You do not have permission to access this resource')
          } else if (error.response.status === 404) {
            setError('API endpoint not found')
          } else if (error.response.status === 500) {
            setError('Server error: Please try again later')
          } else {
            setError(`Server error: ${error.response.status} ${error.response.statusText}`)
          }
        } else if (error.request) {
          // Request made but no response
          if (error.code === 'ECONNREFUSED') {
            setError('Connection refused: Server may be down')
          } else if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
            setError('Network error: Please check your connection')
          } else if (error.message.includes('CORS')) {
            setError('CORS error: Backend server may not be configured correctly')
          } else {
            setError('Network error: No response from server')
          }
        } else {
          // Other errors
          setError(error.message || 'Unknown error occurred')
        }
      }
    }
    
    if (accessToken) {
      fetchSchemesData()
    }
  }, [accessToken, retryCount])

  const handleMenuToggle = () => {
    if (isMobile) {
      setShowOffcanvas(!showOffcanvas)
    }
  }

  // Build categories from API data for display
  const getCategoriesForDisplay = () => {
    const categoryIconMap = {
      'SCHEME-CAT-00001': <FaGraduationCap />,
      'SCHEME-CAT-00002': <FaPiggyBank />,
      'SCHEME-CAT-00003': <FaTools />,
      'SCHEME-CAT-00004': <FaFemale />
    }

    return apiCategories.map(category => {
      const iconPath = category.icon || ''
      const fullPath = iconPath && !iconPath.startsWith('/media') ? iconPath : (iconPath ? `https://brjobsedu.com/girls_course/girls_course_backend${iconPath}` : '')
      
      return {
        id: category.scheme_category_id,
        nameKey: category.title,
        name: category.title,
        name_hindi: category.title_hindi,
        icon: categoryIconMap[category.scheme_category_id] || <FaAward />,
        descriptionKey: category.description,
        description: category.description,
        description_hindi: category.description_hindi,
        categoryIcon: category.icon,
        image: fullPath
      }
    })
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    if (!categoryId) {
      setActiveTab('all')
    }
    setTimeout(() => {
      if (schemesSectionRef.current) {
        schemesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // Helper to parse comma or newline-separated values into array
  const parseListField = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
      let items = value.split(/,|\n/).map(item => item.trim()).filter(item => item)
      return items
    }
    return [value]
  }

  // Helper to get title from sub_mod item (handles both string and object)
  const getSubModTitle = (item) => {
    if (typeof item === 'string') return item
    if (item && typeof item === 'object') return item.title || item.description || item.name || ''
    return ''
  }

  // Helper to get description from sub_mod item
  const getSubModDesc = (item) => {
    if (item && typeof item === 'object') return item.description || ''
    return ''
  }

  // Check if title matches a section (order matters - more specific first)
  const getSectionFromTitle = (title) => {
    const t = title?.toLowerCase().replace(/^-*\s*/, '') || '' // remove leading dashes/spaces
    if (t.includes('documents needed') || t.includes('आवश्यक दस्तावेज़') || t.includes('documents') || t.includes('दस्तावेज़')) return 'documents'
    if (t.includes('how to apply') || t.includes('आवेदन कैसे करें') || t.includes('apply')) return 'howToApply'
    if (t.includes('important tips') || t.includes('महत्वपूर्ण सुझाव') || t.includes('tips') || t.includes('सुझाव')) return 'tips'
    if (t.includes('who can apply') || t.includes('आवेदन कौन कर सकते हैं') || t.includes('eligibility') || t.includes('कौन')) return 'eligibility'
    if (t.includes('benefits') || t.includes('मुख्य लाभ') || t.includes('लाभ')) return 'benefits'
    if (t.includes('about') || t.includes('योजना के बारे में') || t.includes('विवरण')) return 'about'
    return '' // no default - skip items that don't match any section
  }

  // Enrich scheme data with API information
  const enrichSchemeData = (apiScheme) => {
    const subMod = language === 'hi' ? apiScheme.sub_mod_hindi : apiScheme.sub_mod
    // Section 1: About this Scheme - only description
    const about = language === 'hi' ? apiScheme.description_hindi : apiScheme.description
    
    // Initialize arrays for each section
    let benefits = []
    let eligibility = []
    let documents = []
    let howToApply = []
    let tips = []
    // Get total_amount from API, fallback to "Visit Website"
    const totalAmount = apiScheme.total_amount || 'Visit Website'
    
    // Process sub_mod array - use title to determine section
    if (subMod && Array.isArray(subMod) && subMod.length > 0) {
      subMod.forEach(item => {
        const title = getSubModTitle(item)
        const description = getSubModDesc(item)
        
        // Parse comma/newline separated values from description
        const items = parseListField(description).filter(i => i && i.trim())
        
        // Determine which section based on title
        const section = getSectionFromTitle(title)
        
        if (section === 'eligibility') {
          eligibility = [...eligibility, ...items]
        } else if (section === 'documents') {
          documents = [...documents, ...items]
        } else if (section === 'howToApply') {
          howToApply = [...howToApply, ...items]
        } else if (section === 'tips') {
          tips = [...tips, ...items]
        } else if (section === 'benefits' && items.length > 0) {
          // Only add to benefits if title explicitly contains "benefits"
          benefits = [...benefits, ...items]
        }
        // Items with non-matching titles are skipped
      })
    }
    
    return {
      ...apiScheme,
      icon: <FaAward />,
      about: about || 'No description available',
      benefits,
      eligibility,
      documents,
      howToApply,
      tips,
      amount: totalAmount,
      scheme_image: apiScheme.scheme_image || '',
      officialLink: apiScheme.web_link || 'https://example.com'
    }
  }

  const handleSchemeClick = (scheme) => {
    const enrichedScheme = enrichSchemeData(scheme)
    setSelectedScheme(enrichedScheme)
    setShowModal(true)
  }

  const getCategorySchemes = () => {
    if (!selectedCategory) {
      return []
    }
    const schemes = apiSchemesData[selectedCategory] || []
    return schemes.map(s => enrichSchemeData(s))
  }

  const getAllSchemes = () => {
    const allSchemes = []
    Object.values(apiSchemesData).forEach(categorySchemes => {
      allSchemes.push(...categorySchemes.map(s => enrichSchemeData(s)))
    })
    return allSchemes
  }

  const displayedSchemes = selectedCategory ? getCategorySchemes() : []
  const allSchemes = getAllSchemes()
  const categories = getCategoriesForDisplay()

  const schemesToDisplay = activeTab === 'all' ? allSchemes : displayedSchemes

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
            ) : error ? (
              <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '10px', borderLeft: '5px solid #dc3545' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-start gap-3">
                    <div style={{fontSize: '1.5rem'}}>⚠️</div>
                    <div style={{flex: 1}}>
                      <h5 className="text-danger mb-2">Error Loading Government Schemes</h5>
                      <p className="text-muted mb-3">{error}</p>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => setRetryCount(prev => prev + 1)}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ) : apiCategories.length === 0 ? (
              <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '10px', borderLeft: '5px solid #ffc107' }}>
                <Card.Body className="p-4 text-center">
                  <p className="text-muted mb-0">No government schemes available at the moment. Please try again later.</p>
                </Card.Body>
              </Card>
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
                              overflow: 'hidden',
                              width: '100%'
                            }}
                            onClick={() => handleCategoryChange(category.id)}
                          >
                            {category.image && (
                              <div style={{
                                height: '120px',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                           
                                borderBottom: '1px solid #e0e0e0'
                              }}>
                                <img
                                  src={category.image}
                                  alt={category.name}
                                  style={{
                                    maxHeight: '100%',
                                    maxWidth: '100%',
                                    objectFit: 'contain',
                                    padding: '10px'
                                  }}
                                  onError={(e) => { e.target.style.display = 'none' }}
                                />
                              </div>
                            )}
                            <Card.Body className="p-3 text-center">
                              <h6 className="mb-1">{language === 'hi' ? category.name_hindi : category.name}</h6>
                              <small className="text-muted">{language === 'hi' ? category.description_hindi : category.description}</small>
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

                {(selectedCategory || activeTab === 'all') && (
                  <>
                    <Card ref={schemesSectionRef} className="shadow-sm mb-4 border-0" style={{ borderRadius: '10px' }}>
                      <Card.Header className="bg-white border-0 pt-4 pb-0">
                        <h5 className="mb-0">
                          <FaUniversity className="me-2 text-primary" />
                          <TransText k="schemes.availableSchemes" as="span" /> - {activeTab === 'all' ? (language === 'hi' ? 'सभी योजनाएं' : 'All Schemes') : (language === 'hi' ? categories.find(c => c.id === selectedCategory)?.name_hindi : categories.find(c => c.id === selectedCategory)?.name)}
                        </h5>
                        <p className="text-muted mb-0">
                          <TransText k="schemes.browseSchemes" as="span" />
                        </p>
                      </Card.Header>
                      <Card.Body className="">
                        <Tab.Container id="schemes-tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                          <Nav variant="tabs" className="mb-4">
                            <Nav.Item>
                              <Nav.Link eventKey="category" disabled={!selectedCategory}>
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
                              {selectedCategory ? (
                                <Row>
                                  {displayedSchemes.map((scheme) => (
                                    <Col lg={4} md={6} className="mb-4" key={scheme.id || scheme.gov_scheme_id}>
                                      <Card 
                                        className="h-100 border course-card"
                                        style={{ cursor: 'pointer', overflow: 'hidden', width: '100%' }}
                                        onClick={() => handleSchemeClick(scheme)}
                                      >
                                      {scheme.scheme_image ? (
                                          <div style={{
                                            height: '120px',
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                          
                                            borderBottom: '1px solid #e0e0e0'
                                          }}>
                                            <img
                                              src={scheme.scheme_image}
                                              alt={scheme.title}
                                              style={{
                                                maxHeight: '100%',
                                                maxWidth: '100%',
                                                objectFit: 'contain',
                                                padding: '8px'
                                              }}
                                              onError={(e) => { e.target.style.display = 'none' }}
                                            />
                                          </div>
                                        ) : null}
                                        <Card.Body className="p-3 text-center">
                                          <h6 className="mb-1">{language === 'hi' ? scheme.title_hindi : scheme.title}</h6>
                                          {scheme.amount && scheme.amount !== 'Visit Website' ? (
                                            <Badge bg="success" className="mb-2">₹{Number(scheme.amount).toLocaleString('en-IN')}</Badge>
                                          ) : (
                                            <Badge bg="warning" text="dark" className="mb-2">{scheme.amount}</Badge>
                                          )}
                                          <p className="text-muted small mb-2">
                                            {scheme.about}
                                          </p>
                                          <div className="d-flex flex-wrap gap-1 justify-content-center">
                                            {scheme.benefits?.slice(0, 3).map((benefit, idx) => (
                                              <Badge bg="light" text="dark" key={idx} className="small">
                                                {benefit}
                                              </Badge>
                                            ))}
                                          </div>
                                        </Card.Body>
                                      </Card>
                                    </Col>
                                  ))}
                                </Row>
                              ) : (
                                <div className="text-center py-4">
                                  <p className="text-muted mb-0">
                                    {language === 'hi' ? 'कृपया ऊपर से कोई श्रेणी चुनें' : 'Please select a category above'}
                                  </p>
                                </div>
                              )}
                            </Tab.Pane>
                            <Tab.Pane eventKey="all">
                              <Row>
                                {allSchemes.map((scheme) => (
                                  <Col lg={4} md={6} className="mb-4" key={scheme.id || scheme.gov_scheme_id}>
                                    <Card 
                                      className="h-100 border course-card"
                                      style={{ cursor: 'pointer', overflow: 'hidden', width: '100%' }}
                                      onClick={() => handleSchemeClick(scheme)}
                                    >
                                    {scheme.scheme_image ? (
                                        <div style={{
                                          height: '120px',
                                          width: '100%',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        
                                          borderBottom: '1px solid #e0e0e0'
                                        }}>
                                          <img
                                            src={scheme.scheme_image}
                                            alt={scheme.title}
                                            style={{
                                              maxHeight: '100%',
                                              maxWidth: '100%',
                                              objectFit: 'contain',
                                              padding: '8px'
                                            }}
                                            onError={(e) => { e.target.style.display = 'none' }}
                                          />
                                        </div>
                                      ) : null}
                                      <Card.Body className="p-3 text-center">
                                        <h6 className="mb-1">{language === 'hi' ? scheme.title_hindi : scheme.title}</h6>
                                        {scheme.amount && scheme.amount !== 'Visit Website' ? (
                                          <Badge bg="success" className="mb-2">₹{Number(scheme.amount).toLocaleString('en-IN')}</Badge>
                                        ) : (
                                          <Badge bg="warning" text="dark" className="mb-2">{scheme.amount}</Badge>
                                        )}
                                        <p className="text-muted small mb-2">
                                          {scheme.about}
                                        </p>
                                        <div className="d-flex flex-wrap gap-1 justify-content-center">
                                          {scheme.benefits?.slice(0, 3).map((benefit, idx) => (
                                            <Badge bg="light" text="dark" key={idx} className="small">
                                              {benefit}
                                            </Badge>
                                          ))}
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
        <Modal.Header closeButton className="border-0" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px 8px 0 0'}}>
          <Modal.Title className="w-100">
            <div className="d-flex align-items-center gap-3" style={{color: 'white'}}>
              <div style={{fontSize: '2.5rem', display: 'flex', alignItems: 'center'}}>
                {selectedScheme?.icon}
              </div>
              <div style={{flex: 1}}>
                <h3 className="mb-2 fw-bold" style={{color: 'white', fontSize: '1.5rem'}}>
                  {language === 'hi' ? selectedScheme?.title_hindi : selectedScheme?.title}
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

              {/* Section 1: About this Scheme */}
              <div className="mb-4 p-4 bg-white rounded border-start border-5" style={{borderColor: '#667eea'}}>
                <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                  {language === 'hi' ? '📌 योजना का विवरण' : '📌 About this Scheme'}
                </h6>
                <p className="mb-0 text-muted" style={{lineHeight: '1.6'}}>{selectedScheme.about}</p>
              </div>

              {/* Section 2: Key Benefits */}
              {selectedScheme.benefits && selectedScheme.benefits.length > 0 && (
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
              )}

              {/* Section 3: Who Can Apply? */}
              {selectedScheme.eligibility && selectedScheme.eligibility.length > 0 && (
                <div className="mb-4 p-4 bg-white rounded border-start border-5" style={{borderColor: '#0d6efd'}}>
                  <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                    <span style={{color: '#0d6efd'}}>👤 {language === 'hi' ? 'कौन आवेदन कर सकता है?' : 'Who Can Apply?'}</span>
                  </h6>
                  <div className="ps-2">
                    {selectedScheme.eligibility.map((elig, idx) => (
                      <div key={idx} className="mb-2 d-flex align-items-start">
                        <span style={{color: '#0d6efd', marginRight: '0.75rem', marginTop: '0.25rem', fontSize: '1rem'}}>•</span>
                        <span className="text-muted" style={{fontSize: '0.95rem'}}>{elig}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Documents Needed */}
              {selectedScheme.documents && selectedScheme.documents.length > 0 && (
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
              )}

              {/* Section 5: How to Apply? */}
              {selectedScheme.howToApply && selectedScheme.howToApply.length > 0 && (
                <div className="mb-4 p-4 bg-white rounded border-top border-5" style={{borderColor: '#0dcaf0'}}>
                  <h6 className="text-dark mb-4 fw-bold" style={{fontSize: '1.05rem'}}>
                    <span style={{color: '#0dcaf0'}}>📍 {language === 'hi' ? 'आवेदन कैसे करें?' : 'How to Apply?'}</span>
                  </h6>
                  <div className="ms-2">
                    {selectedScheme.howToApply.map((step, idx) => (
                      <div key={idx} className="mb-3 d-flex gap-3">
                        <div className="d-flex align-items-center justify-content-center" style={{minWidth: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '50%', fontWeight: 'bold', fontSize: '1rem'}}>
                          {idx + 1}
                        </div>
                        <div style={{flex: 1}}>
                          <span className="text-muted" style={{fontSize: '0.95rem'}}>{step}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 6: Important Tips */}
              {selectedScheme.tips && selectedScheme.tips.length > 0 && (
                <div className="mb-4 p-4 rounded" style={{background: '#fff3cd', border: '2px solid #ffc107'}}>
                  <h6 className="text-dark mb-3 fw-bold" style={{fontSize: '1rem'}}>
                    <span style={{color: '#fd7e14'}}>⚠️ {language === 'hi' ? 'महत्वपूर्ण सुझाव' : 'Important Tips'}</span>
                  </h6>
                  <ul className="mb-0 ps-4 small" style={{color: '#856404', fontSize: '0.9rem'}}>
                    {selectedScheme.tips.map((tip, idx) => (
                      <li key={idx} className="mb-2">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Section 7: Official Website */}
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
