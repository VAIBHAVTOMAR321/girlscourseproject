import React, { useState, useEffect } from 'react'
import { Nav, Button, Offcanvas, Dropdown } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import '../../assets/css/UserLeftNav.css'
import { useAuth } from '../../contexts/AuthContext'
import TransText from '../TransText'
import { IoIosSend } from "react-icons/io"


const UseLeftNav = ({ showOffcanvas, setShowOffcanvas, onNavAttempt }) => {
  const { userRoleType } = useAuth()
  const navigate = useNavigate()
  const [show, setShow] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [showGuidelines, setShowGuidelines] = useState(false)

  // Handle navigation with callback
  const handleNavClick = (path) => {
    if (onNavAttempt) {
      onNavAttempt(path)
    } else {
      navigate(path)
    }
  }

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setShow(false) // Hide sidebar on mobile by default
        setShowOffcanvas(false) // Close offcanvas on mobile resize
        document.body.classList.remove('sidebar-compact')
      } else {
        setShow(true) // Show sidebar on desktop by default
        setShowOffcanvas(false) // Close offcanvas on desktop resize
        document.body.classList.remove('sidebar-compact')
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setShowOffcanvas])

  const handleToggle = () => {
    if (isMobile) {
      setShowOffcanvas(!showOffcanvas)
    } else {
      const newShow = !show
      setShow(newShow)
      // Directly update the content area margin based on sidebar state
      const contentArea = document.querySelector('.flex-grow-1')
      if (contentArea) {
        if (newShow) {
          // Show sidebar - set full margin
          contentArea.style.marginLeft = '280px'
        } else {
          // Hide sidebar - set compact margin
          contentArea.style.marginLeft = '100px'
        }
      }
    }
  }

  return (
    <>
      {/* Desktop sidebar */}
      {!isMobile && (
        <>
          {show ? (
            <div className="user-left-nav d-flex flex-column fixed-sidebar">
              <div className=" border-bottom border-light">
                <Button 
                  variant="outline-light" 
                  onClick={handleToggle} 
                  className=" btn-hide"
                >
                  <i className="bi bi-arrow-left-short me-2"></i>
                </Button>
              </div>
                <Nav className="flex-column p-3">
                  <Nav.Link className="text-white" onClick={() => handleNavClick('/UserDashboard')} style={{ cursor: 'pointer' }}>
                    <i className="bi bi-grid-3x3-gap me-2"></i> <TransText k="dashboard.title" as="span" />
                  </Nav.Link>
                  
                   <Nav.Link className="text-white" onClick={() => handleNavClick('/UserProfile')} style={{ cursor: 'pointer' }}>
                    <i className="bi bi-person-circle me-2"></i> <TransText k="menu.profile" as="span" />
                  </Nav.Link>
                  <Nav.Link className="text-white" onClick={() => handleNavClick('/UserQuery')} style={{ cursor: 'pointer' }}>
                    <IoIosSend className="me-2"></IoIosSend> <TransText k="menu.query" as="span" />
                  </Nav.Link>
<Nav.Link className="text-white" onClick={() => handleNavClick('/UserQuiz')} style={{ cursor: 'pointer' }}>
                    <i className="bi bi-clipboard-check me-2"></i> <TransText k="quiz.title" as="span" />
                  </Nav.Link>
                   <Nav.Link className="text-white" onClick={() => handleNavClick('/UserEvents')} style={{ cursor: 'pointer' }}>
                     <i className="bi bi-calendar-event me-2"></i> <TransText k="menu.events" as="span" />
                   </Nav.Link>
                   
                   {/* Refund Request only visible to paid users */}
                   {userRoleType !== 'student-unpaid' && (
                     <Nav.Link className="text-white" onClick={() => handleNavClick('/RefundRequest')} style={{ cursor: 'pointer' }}>
                       <i className="bi bi-currency-exchange me-2"></i> <TransText k="menu.refund" as="span" />
                     </Nav.Link>
                   )}

<Nav.Link className="text-white" onClick={() => handleNavClick('/GovernmentSchemes')} style={{ cursor: 'pointer' }}>
                       <i className="bi bi-file-earmark-text me-2"></i> <TransText k="settings.govtSchemes" as="span" />
                     </Nav.Link>
                    <Nav.Link className="text-white" onClick={() => handleNavClick('/JobOpenings')} style={{ cursor: 'pointer' }}>
                      <i className="bi bi-briefcase me-2"></i> <TransText k="menu.jobOpenings" as="span" />
                    </Nav.Link>
                   
                   <div className="guidelines-menu">
                     <div 
                       className="text-white text-decoration-none w-100 text-start d-flex align-items-center justify-content-between cursor-pointer py-2"
                       onClick={() => setShowGuidelines(!showGuidelines)}
                       style={{ cursor: 'pointer' }}
                     >
                       <span className='mx-3'><i className="bi bi-book me-2"></i> <TransText k="menu.guidance" as="span" /></span>
                       <i className={`bi bi-chevron-${showGuidelines ? 'up' : 'down'}`}></i>
                     </div>
                     {showGuidelines && (
                       <div className="guidelines-submenu ps-4">
                         <Nav.Link className="text-white py-1" onClick={() => handleNavClick('/UserNotifications')} style={{ cursor: 'pointer' }}>
                           <i className="bi bi-chevron-right me-2"></i> 12th
                         </Nav.Link>
                         <Nav.Link className="text-white py-1" onClick={() => handleNavClick('/UserSettings')} style={{ cursor: 'pointer' }}>
                           <i className="bi bi-chevron-right me-2"></i> 10th
                         </Nav.Link>
                       </div>
                     )}
                   </div>
                  
                </Nav>
              
            </div>
          ) : (
            <div className="user-left-nav compact d-flex flex-column vh-100">
                <div className='show-btn p-3'>
                <Button 
                  variant="outline-light" 
                  onClick={handleToggle} 
                  className="w-100"
                >
                  <i className="bi bi-arrow-right-short"></i> 
                </Button>
                </div>
                <Nav className="flex-column p-3 align-items-center">
                  <Nav.Link className="text-white" onClick={() => handleNavClick('/UserDashboard')} style={{ cursor: 'pointer' }}>
                    <i className="bi bi-grid-3x3-gap fs-5"></i>
                  </Nav.Link>
                  <Nav.Link className="text-white" onClick={() => handleNavClick('/UserProfile')} style={{ cursor: 'pointer' }}>
                    <i className="bi bi-person-circle fs-5"></i>
                  </Nav.Link>
                  <Nav.Link className="text-white" onClick={() => handleNavClick('/UserQuery')} title="Query" style={{ cursor: 'pointer' }}>
                    <IoIosSend className="fs-5"></IoIosSend>
                  </Nav.Link>
                  {/* Refund Request only visible to paid users */}
                  {userRoleType !== 'student-unpaid' && (
                    <Nav.Link className="text-white" onClick={() => handleNavClick('/RefundRequest')} style={{ cursor: 'pointer' }}>
                      <i className="bi bi-currency-exchange fs-5"></i>
                    </Nav.Link>
                  )}
<Nav.Link className="text-white" onClick={() => handleNavClick('/GovernmentSchemes')} title="Govt. Schemes" style={{ cursor: 'pointer' }}>
                      <i className="bi bi-file-earmark-text fs-5"></i>
                    </Nav.Link>
                  <Nav.Link className="text-white" onClick={() => handleNavClick('/JobOpenings')} title="Job Openings" style={{ cursor: 'pointer' }}>
                    <i className="bi bi-briefcase fs-5"></i>
                  </Nav.Link>
                  <Nav.Link className="text-white" onClick={() => handleNavClick('/UserNotifications')} style={{ cursor: 'pointer' }}>
                    <i className="bi bi-bell fs-5"></i>
                  </Nav.Link>
                  <Nav.Link className="text-white" onClick={() => handleNavClick('/UserSettings')} style={{ cursor: 'pointer' }}>
                    <i className="bi bi-gear fs-5"></i>
                  </Nav.Link>
                  <Nav.Link className="text-white" onClick={() => handleNavClick('/UserQuiz')} style={{ cursor: 'pointer' }}>
                    <i className="bi bi-clipboard-check fs-5"></i>
                  </Nav.Link>
                  <Nav.Link className="text-white" onClick={() => handleNavClick('/UserEvents')} style={{ cursor: 'pointer' }}>
                    <i className="bi bi-calendar-event fs-5"></i>
                  </Nav.Link>
                </Nav>
            </div>
          )}
        </>
      )}

      {/* Mobile offcanvas sidebar */}
      {isMobile && (
        <Offcanvas 
          show={showOffcanvas} 
          onHide={() => setShowOffcanvas(false)} 
          placement="start"
          className="user-left-nav mobile"
        >
          <Offcanvas.Header closeButton closeVariant="white">
            <Offcanvas.Title className="text-white">User Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
              <Nav className="nav-menu mobile-menu flex-column">
                <Nav.Link className="text-white" onClick={() => { setShowOffcanvas(false); handleNavClick('/UserDashboard'); }} style={{ cursor: 'pointer' }}>
                  <i className="bi bi-grid-3x3-gap me-2"></i> Dashboard
                </Nav.Link>
                <Nav.Link className="text-white" onClick={() => { setShowOffcanvas(false); handleNavClick('/UserProfile'); }} style={{ cursor: 'pointer' }}>
                  <i className="bi bi-person-circle me-2"></i> User Profile
                </Nav.Link>
                <Nav.Link className="text-white" onClick={() => { setShowOffcanvas(false); handleNavClick('/UserQuery'); }} style={{ cursor: 'pointer' }}>
                  <IoIosSend className="me-2"></IoIosSend> Query
                </Nav.Link>
                <Nav.Link className="text-white" onClick={() => { setShowOffcanvas(false); handleNavClick('/UserQuiz'); }} style={{ cursor: 'pointer' }}>
                  <i className="bi bi-clipboard-check me-2"></i> <TransText k="quiz.title" as="span" />
                </Nav.Link>
                 <Nav.Link className="text-white" onClick={() => { setShowOffcanvas(false); handleNavClick('/UserEvents'); }} style={{ cursor: 'pointer' }}>
                   <i className="bi bi-calendar-event me-2"></i> <TransText k="menu.events" as="span" />
                 </Nav.Link>
                {/* Refund Request only visible to paid users */}
                {userRoleType !== 'student-unpaid' && (
                  <Nav.Link className="text-white" onClick={() => { setShowOffcanvas(false); handleNavClick('/RefundRequest'); }} style={{ cursor: 'pointer' }}>
                    <i className="bi bi-currency-exchange me-2"></i> Refund Request
                  </Nav.Link>
                )}
<Nav.Link className="text-white" onClick={() => { setShowOffcanvas(false); handleNavClick('/GovernmentSchemes'); }} style={{ cursor: 'pointer' }}>
                   <i className="bi bi-file-earmark-text me-2"></i> <TransText k="settings.govtSchemes" as="span" />
                 </Nav.Link>
                <Nav.Link className="text-white" onClick={() => { setShowOffcanvas(false); handleNavClick('/JobOpenings'); }} style={{ cursor: 'pointer' }}>
                  <i className="bi bi-briefcase me-2"></i> <TransText k="menu.jobOpenings" as="span" />
                </Nav.Link>
                <div className="guidelines-menu">
                  <div 
                    className="text-white text-decoration-none w-100 text-start d-flex align-items-center justify-content-between cursor-pointer py-2"
                    onClick={() => setShowGuidelines(!showGuidelines)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className='mx-3'><i className="bi bi-book me-2"></i> <TransText k="menu.guidance" as="span" /></span>
                  <i className={`bi bi-chevron-${showGuidelines ? 'up' : 'down'} ms-auto me-3`}></i>
                  </div>
                  {showGuidelines && (
                    <div className="guidelines-submenu">
                      <Nav.Link className="text-white py-1" onClick={() => { setShowOffcanvas(false); handleNavClick('/UserNotifications'); }} style={{ cursor: 'pointer' }}>
                        <i className="bi bi-chevron-right me-2"></i> 12th
                      </Nav.Link>
                      <Nav.Link className="text-white py-1" onClick={() => { setShowOffcanvas(false); handleNavClick('/UserSettings'); }} style={{ cursor: 'pointer' }}>
                        <i className="bi bi-chevron-right me-2"></i> 10th
                      </Nav.Link>
                    </div>
                  )}
                </div>
                {/* <Nav.Link as={Link} to="/UserTest" className="text-white" onClick={() => setShowOffcanvas(false)}>
                  <i className="bi bi-clipboard-check me-2"></i> Test Dashboard
                </Nav.Link> */}
              </Nav>
          </Offcanvas.Body>
        </Offcanvas>
      )}
    </>
  )
}

export default UseLeftNav