import React from 'react'
import { Navbar, Nav, Button } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../../assets/css/AdminTopNav.css'

const AdminTopNav = () => {
  const { userRole, uniqueId, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Navbar bg="white" expand="md" className="admin-top-nav shadow-sm border-bottom">
      <Navbar.Brand href="/AdminDashboard" className="ms-3">
        <h5 className="mb-0">Admin Dashboard</h5>
      </Navbar.Brand>
      
      {/* Logout button visible on all views, to the right of the toggle */}
      <Button 
        variant="outline-danger" 
        onClick={handleLogout}
        className="logout-btn d-flex align-items-center ms-auto"
        size="sm"
      >
        <i className="bi bi-box-arrow-right me-1"></i> Logout
      </Button>
      
      <Navbar.Toggle aria-controls="admin-topnav" className="border-0 shadow-none ms-2" />
      
      <Navbar.Collapse id="admin-topnav" className="justify-content-end">
        <Nav className="align-items-center">
          {/* Additional nav items can go here if needed */}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default AdminTopNav