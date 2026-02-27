import React, { useState } from 'react'
import { Navbar, Nav, Dropdown } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../../assets/css/AdminTopNav.css'

const AdminTopNav = () => {
  const { userRole, uniqueId, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Navbar bg="white" expand="lg" className="admin-top-nav shadow-sm border-bottom">
      <Navbar.Brand href="/AdminDashboard" className="ms-3">
        <h5 className="mb-0">Admin Dashboard</h5>
      </Navbar.Brand>
      
      <Navbar.Toggle aria-controls="admin-topnav" className="border-0 shadow-none" />
      
      <Navbar.Collapse id="admin-topnav" className="justify-content-end">
        <Nav className="align-items-center">
          <Dropdown 
            show={showDropdown}
            onToggle={(isOpen) => setShowDropdown(isOpen)}
            align="end"
            className="user-dropdown me-3"
          >
            <Dropdown.Toggle 
              as="div" // Render as div to remove default button styles
              className="d-flex align-items-center"
              id="dropdown-custom-components"
            >
              <div className="user-info d-flex align-items-center">
                <div className="user-avatar">
                  <i className="bi bi-person-fill"></i>
                </div>
                <div className="user-details">
                  <small className="user-role">{userRole || 'Admin'}</small>
                  <span className="user-name">{uniqueId || 'User'}</span>
                </div>
              </div>
              <i className="bi bi-chevron-down ms-2"></i>
            </Dropdown.Toggle>
            
            <Dropdown.Menu className="profile-dropdown-menu">
              <Dropdown.Item className="logout-item" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right dropdown-icon"></i> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default AdminTopNav