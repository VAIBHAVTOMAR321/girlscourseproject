import React, { useState, useEffect } from 'react'
import { Nav, Button, Offcanvas } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import '../../assets/css/AdminLeftNav.css' // Import specific CSS

const AdminLeftNav = () => {
  const [show, setShow] = useState(true)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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
          variant="primary" 
          onClick={() => setShowOffcanvas(true)} 
          className="mobile-menu-btn"
          style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 1050 }}
        >
          <i className="bi bi-list"></i>
        </Button>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className={`admin-left-nav ${show ? '' : 'compact'} d-flex flex-column vh-100`}>
          <div className="nav-header">
            <button className="sidebar-toggle-btn" onClick={handleToggle}>
              <i className={`bi ${show ? 'bi-arrow-left' : 'bi-arrow-right'}`}></i>
            </button>
          </div>
          
          <Nav className="nav-menu flex-column">
            <Nav.Link as={Link} to="/AdminDashboard" className="nav-link-custom active">
              <i className="bi bi-grid-fill nav-icon"></i>
              <span className="nav-text">Dashboard</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/Enrollments" className="nav-link-custom">
              <i className="bi bi-person-lines-fill nav-icon"></i>
              <span className="nav-text">Enrollments</span>
            </Nav.Link>
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
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="fw-bold">AdminPanel</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="nav-menu mobile-menu flex-column">
            <Nav.Link as={Link} to="/AdminDashboard" className="nav-link-custom" onClick={() => setShowOffcanvas(false)}>
              <i className="bi bi-grid-fill nav-icon me-2"></i> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/Enrollments" className="nav-link-custom" onClick={() => setShowOffcanvas(false)}>
              <i className="bi bi-person-lines-fill nav-icon me-2"></i> Enrollments
            </Nav.Link>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default AdminLeftNav