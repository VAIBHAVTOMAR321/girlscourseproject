import React, { useState, useEffect } from 'react'
import { Nav, Button, Offcanvas } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const AdminLeftNav = () => {
  const [show, setShow] = useState(true)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setShow(false) // Hide sidebar on mobile by default
      } else {
        setShow(true) // Show sidebar on desktop by default
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
      {/* Desktop sidebar */}
      {!isMobile && (
        <>
          {show ? (
            <div className="d-flex flex-column bg-primary text-white vh-100" style={{ width: '250px', transition: 'width 0.3s ease' }}>
              <div className="p-3 border-bottom border-light">
                <Button 
                  variant="outline-light" 
                  onClick={handleToggle} 
                  className="w-100"
                >
                  <span className="me-2">←</span> Hide
                </Button>
              </div>
              <Nav className="flex-column p-3">
                <Nav.Link as={Link} to="/AdminDashboard" className="text-white">
                  <span className="me-2">📊</span> Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/Enrollments" className="text-white">
                  <span className="me-2">📅</span> Enrollments
                </Nav.Link>
              </Nav>
              
            </div>
          ) : (
            <div className="d-flex flex-column bg-primary text-white vh-100 " style={{ width: '60px', transition: 'width 0.3s ease' }}>
                <div className='show-btn'>
                <Button 
                  variant="outline-light" 
                  onClick={handleToggle} 
                  
                >
                  <span className="me-2">→ Show</span> 
                </Button>
                </div>
              <Nav className="flex-column p-3 align-items-center">
                <Nav.Link as={Link} to="/AdminDashboard" className="text-white">
                  <span className="fs-5">📊</span>
                </Nav.Link>
                <Nav.Link as={Link} to="/Enrollments" className="text-white">
                  <span className="fs-5">📅</span>
                </Nav.Link>
              </Nav>
              <div className="mt-auto p-3 border-top border-light">
                <Button 
                  variant="outline-light" 
                  onClick={handleToggle} 
                  className="w-100"
                >
                  <span>→</span>
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mobile offcanvas sidebar */}
      {isMobile && (
        <>
          <Button 
            variant="primary" 
            onClick={() => setShowOffcanvas(true)} 
            className="d-lg-none fixed-top m-3"
            style={{ zIndex: 1050 }}
          >
            <span>☰</span> Menu
          </Button>

          <Offcanvas 
            show={showOffcanvas} 
            onHide={() => setShowOffcanvas(false)} 
            placement="start"
            className="bg-primary text-white"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title className="text-white">Admin Dashboard</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="flex-column">
                <Nav.Link as={Link} to="/AdminDashboard" className="text-white" onClick={() => setShowOffcanvas(false)}>
                  <span className="me-2">📊</span> Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/Enrollments" className="text-white" onClick={() => setShowOffcanvas(false)}>
                  <span className="me-2">📅</span> Enrollments
                </Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>
        </>
      )}
    </>
  )
}

export default AdminLeftNav
