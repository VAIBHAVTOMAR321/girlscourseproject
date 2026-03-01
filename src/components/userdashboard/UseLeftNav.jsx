import React, { useState, useEffect } from 'react'
import { Nav, Button, Offcanvas } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import '../../assets/css/UserLeftNav.css'

const UseLeftNav = ({ showOffcanvas, setShowOffcanvas }) => {
  const [show, setShow] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setShow(false) // Hide sidebar on mobile by default
        setShowOffcanvas(false) // Close offcanvas on mobile resize
      } else {
        setShow(true) // Show sidebar on desktop by default
        setShowOffcanvas(false) // Close offcanvas on desktop resize
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
      setShow(!show)
    }
  }

  return (
    <>
      {/* Desktop sidebar */}
      {!isMobile && (
        <>
          {show ? (
            <div className="user-left-nav d-flex flex-column ">
              <div className="p-3 border-bottom border-light">
                <Button 
                  variant="outline-light" 
                  onClick={handleToggle} 
                  className="w-100"
                >
                  <i className="bi bi-arrow-left-short me-2"></i> Hide
                </Button>
              </div>
               <Nav className="flex-column p-3">
                 <Nav.Link as={Link} to="/UserDashboard" className="text-white">
                   <i className="bi bi-grid-3x3-gap me-2"></i> Dashboard
                 </Nav.Link>
                 
                  <Nav.Link as={Link} to="/UserProfile" className="text-white">
                   <i className="bi bi-person-circle me-2"></i> User Profile
                 </Nav.Link>
                 
                  {/* <Nav.Link as={Link} to="/UserTest" className="text-white">
                   <i className="bi bi-clipboard-check me-2"></i> Test Dashboard
                 </Nav.Link> */}
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
                 <Nav.Link as={Link} to="/UserDashboard" className="text-white">
                   <i className="bi bi-grid-3x3-gap fs-5"></i>
                 </Nav.Link>
                 <Nav.Link as={Link} to="/UserProfile" className="text-white">
                   <i className="bi bi-person-circle fs-5"></i>
                 </Nav.Link>
                 <Nav.Link as={Link} to="/UserTest" className="text-white">
                   <i className="bi bi-clipboard-check fs-5"></i>
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
               <Nav.Link as={Link} to="/UserDashboard" className="text-white" onClick={() => setShowOffcanvas(false)}>
                 <i className="bi bi-grid-3x3-gap me-2"></i> Dashboard
               </Nav.Link>
               <Nav.Link as={Link} to="/UserProfile" className="text-white" onClick={() => setShowOffcanvas(false)}>
                 <i className="bi bi-person-circle me-2"></i> User Profile
               </Nav.Link>
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