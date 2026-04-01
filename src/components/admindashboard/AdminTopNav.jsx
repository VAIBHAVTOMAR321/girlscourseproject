import React from 'react'
import { Navbar, Nav, Button } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../../assets/css/AdminTopNav.css'
import Logo from '../../assets/brainrock_logo.png'

const AdminTopNav = () => {
  const { userRole, uniqueId, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Navbar bg="white" expand="md" className="admin-top-nav shadow-sm border-bottom">
      <Navbar.Brand href="/AdminDashboard" className="ms-3 d-flex align-items-center">
        <img src={Logo} alt="BrainRock Logo" className="admin-logo-img me-3" />
        <div className="admin-logo-text">
          <div className="admin-logo-main">Brainrock Consulting Services</div>
          <div className="admin-logo-sub">I.S.O certified 9001:2015</div>
        </div>
      </Navbar.Brand>
      
      {/* Logout button for mobile view - visible only on sm and smaller screens */}
      <Button 
        variant="outline-danger" 
        onClick={handleLogout}
        className="logout-btn d-flex d-md-none align-items-center ms-3"
        size="sm"
      >
        <i className="bi bi-box-arrow-right me-1"></i> Logout
      </Button>
      
      <Navbar.Collapse id="admin-topnav" className="justify-content-end">
        <Nav className="align-items-center">
          {/* Logout button for desktop view - visible only on md and larger screens */}
          <Button 
            variant="outline-danger" 
            onClick={handleLogout}
            className="logout-btn d-none d-md-flex align-items-center"
            size="sm"
          >
            <i className="bi bi-box-arrow-right me-1"></i> Logout
          </Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default AdminTopNav