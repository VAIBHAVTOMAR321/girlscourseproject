import React, { useState, useEffect } from 'react'
import { Nav, Button, Offcanvas } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import '../../assets/css/AdminLeftNav.css' // Import specific CSS

const AdminLeftNav = ({ show, setShow }) => {
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showSchemesMenu, setShowSchemesMenu] = useState(false)
  const [showGroomingMenu, setShowGroomingMenu] = useState(false)
  const [showJobsMenu, setShowJobsMenu] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 // Standard mobile breakpoint
      setIsMobile(mobile)
      if (mobile) {
        setShow(false)
      } else {
        setShow(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleToggle = () => {
    if (isMobile) {
      setShowOffcanvas(!showOffcanvas)
    } else {
      setShow(!show)
    }
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button 
          variant="light" 
          onClick={() => setShowOffcanvas(true)} 
          className="mobile-menu-btn"
          style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1050, border: '1px solid #dee2e6' }}
          size="sm"
        >
          <i className="bi bi-list"></i>
        </Button>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className={`admin-left-nav ${show ? '' : 'compact'} d-flex flex-column`}>
          <div className="nav-header">
            <button className="sidebar-toggle-btn" onClick={handleToggle}>
              <i className={`bi ${show ? 'bi-arrow-left' : 'bi-arrow-right'}`}></i>
            </button>
          </div>
          
          <Nav className="nav-menu flex-column">
            <Nav.Link as={Link} to="/AdminDashboard" className="nav-link-custom ">
              <i className="bi bi-grid-fill nav-icon"></i>
              <span className="nav-text">Dashboard</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/Enrollments" className="nav-link-custom ">
              <i className="bi bi-person-lines-fill nav-icon"></i>
              <span className="nav-text">Enrollments</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/Feedback" className="nav-link-custom ">
              <i className="bi bi-chat-square-text nav-icon"></i>
              <span className="nav-text">Feedback</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/StudentIssues" className="nav-link-custom ">
              <i className="bi bi-exclamation-circle nav-icon"></i>
              <span className="nav-text">Student Issues</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/QuizManagement" className="nav-link-custom ">
              <i className="bi bi-question-circle nav-icon"></i>
              <span className="nav-text">Quiz Management</span>
            </Nav.Link>

            {/* Schemes Dropdown */}
            <div className="dropdown-menu-wrapper">
              <div 
                className="nav-link-custom d-flex align-items-center justify-content-between"
                onClick={() => setShowSchemesMenu(!showSchemesMenu)}
                style={{ cursor: 'pointer' }}
              >
                <span><i className="bi bi-file-earmark-text nav-icon"></i> <span className="nav-text">Schemes</span></span>
                <i className={`bi bi-chevron-${showSchemesMenu ? 'up' : 'down'}`}></i>
              </div>
              {showSchemesMenu && (
                <div className="dropdown-submenu">
                  <Nav.Link as={Link} to="/ManageGovtSchemes" className="nav-link-custom ">
                    <i className="bi bi-list nav-icon"></i>
                    <span className="nav-text">Manage Schemes</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/AddGovtSchemes" className="nav-link-custom ">
                    <i className="bi bi-plus-circle nav-icon"></i>
                    <span className="nav-text">Add Scheme</span>
                  </Nav.Link>
                </div>
              )}
            </div>

            {/* Grooming Dropdown */}
            <div className="dropdown-menu-wrapper">
              <div 
                className="nav-link-custom d-flex align-items-center justify-content-between"
                onClick={() => setShowGroomingMenu(!showGroomingMenu)}
                style={{ cursor: 'pointer' }}
              >
                <span><i className="bi bi-person-badge nav-icon"></i> <span className="nav-text">Grooming</span></span>
                <i className={`bi bi-chevron-${showGroomingMenu ? 'up' : 'down'}`}></i>
              </div>
              {showGroomingMenu && (
                <div className="dropdown-submenu">
                  <Nav.Link as={Link} to="/CreateGroomingClass" className="nav-link-custom ">
                    <i className="bi bi-plus-circle nav-icon"></i>
                    <span className="nav-text">Create Grooming</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/ManageGroomingClasses" className="nav-link-custom ">
                    <i className="bi bi-calendar-check nav-icon"></i>
                    <span className="nav-text">Manage Grooming</span>
                  </Nav.Link>
                </div>
              )}
            </div>

            {/* Jobs/Seminars/Workshops Dropdown */}
            <div className="dropdown-menu-wrapper">
              <div 
                className="nav-link-custom d-flex align-items-center justify-content-between"
                onClick={() => setShowJobsMenu(!showJobsMenu)}
                style={{ cursor: 'pointer' }}
              >
                <span><i className="bi bi-briefcase nav-icon"></i> <span className="nav-text">Jobs & More</span></span>
                <i className={`bi bi-chevron-${showJobsMenu ? 'up' : 'down'}`}></i>
              </div>
              {showJobsMenu && (
                <div className="dropdown-submenu">
                  <Nav.Link as={Link} to="/AddJob" className="nav-link-custom ">
                    <i className="bi bi-plus-circle nav-icon"></i>
                    <span className="nav-text">Add Job</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/ManageJobs" className="nav-link-custom ">
                    <i className="bi bi-briefcase-fill nav-icon"></i>
                    <span className="nav-text">Manage Jobs</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/AddSeminar" className="nav-link-custom ">
                    <i className="bi bi-plus-circle nav-icon"></i>
                    <span className="nav-text">Add Seminar</span>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/AddWorkshop" className="nav-link-custom ">
                    <i className="bi bi-hammer nav-icon"></i>
                    <span className="nav-text">Add Workshop</span>
                  </Nav.Link>
                </div>
              )}
            </div>
          </Nav>
        </div>
      )}

      {/* Mobile Offcanvas Sidebar */}
      <Offcanvas 
        show={showOffcanvas} 
        onHide={() => setShowOffcanvas(false)} 
        placement="start"
        className="admin-left-nav mobile"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fw-semibold fs-6">Admin Panel</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="nav-menu mobile-menu flex-column">
            <Nav.Link as={Link} to="/AdminDashboard" className="nav-link-custom" onClick={() => setShowOffcanvas(false)}>
              <i className="bi bi-grid-fill nav-icon me-2"></i> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/Enrollments" className="nav-link-custom" onClick={() => setShowOffcanvas(false)}>
              <i className="bi bi-person-lines-fill nav-icon me-2"></i> Enrollments
            </Nav.Link>
            <Nav.Link as={Link} to="/Feedback" className="nav-link-custom" onClick={() => setShowOffcanvas(false)}>
              <i className="bi bi-chat-square-text nav-icon me-2"></i> Feedback
            </Nav.Link>
            <Nav.Link as={Link} to="/StudentIssues" className="nav-link-custom" onClick={() => setShowOffcanvas(false)}>
              <i className="bi bi-exclamation-circle nav-icon me-2"></i> Student Issues
            </Nav.Link>
            <Nav.Link as={Link} to="/QuizManagement" className="nav-link-custom" onClick={() => setShowOffcanvas(false)}>
              <i className="bi bi-question-circle nav-icon me-2"></i> Quiz Management
            </Nav.Link>
            <Nav.Link as={Link} to="/ManageGovtSchemes" className="nav-link-custom" onClick={() => setShowOffcanvas(false)}>
              <i className="bi bi-file-earmark-text nav-icon me-2"></i> Manage Schemes
            </Nav.Link>
            <Nav.Link as={Link} to="/AddGovtSchemes" className="nav-link-custom" onClick={() => setShowOffcanvas(false)}>
              <i className="bi bi-plus-circle nav-icon me-2"></i> Add Scheme
            </Nav.Link>
            <Nav.Link as={Link} to="/CreateGroomingClass" className="nav-link-custom" onClick={() => setShowOffcanvas(false)}>
              <i className="bi bi-person-badge nav-icon me-2"></i> Create Grooming
            </Nav.Link>
            <Nav.Link as={Link} to="/ManageGroomingClasses" className="nav-link-custom" onClick={() => setShowOffcanvas(false)}>
              <i className="bi bi-calendar-check nav-icon me-2"></i> Manage Grooming
            </Nav.Link>
            <Nav.Link as={Link} to="/AddJob" className="nav-link-custom" onClick={() => setShowOffcanvas(false)}>
              <i className="bi bi-briefcase nav-icon me-2"></i> Add Job
            </Nav.Link>
            <Nav.Link as={Link} to="/ManageJobs" className="nav-link-custom" onClick={() => setShowOffcanvas(false)}>
              <i className="bi bi-briefcase-fill nav-icon me-2"></i> Manage Jobs
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default AdminLeftNav