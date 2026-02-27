import React, { useState } from 'react'
import { Navbar, Nav, Dropdown } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const AdminTopNav = () => {
  const { userRole, uniqueId, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm border-bottom">
      <Navbar.Brand href="/AdminDashboard" className="ms-3">
        <h5 className="mb-0 text-primary">Admin Dashboard</h5>
      </Navbar.Brand>
      
      <Navbar.Toggle aria-controls="admin-topnav" />
      
      <Navbar.Collapse id="admin-topnav" className="justify-content-end">
        <Nav>
          <Dropdown 
            show={showDropdown}
            onToggle={(isOpen) => setShowDropdown(isOpen)}
            align="end"
            className="me-3"
          >
            <Dropdown.Toggle 
              variant="light" 
              className="d-flex align-items-center"
            >
              <div className="d-flex flex-column align-items-end me-2">
                <small className="text-muted">Admin</small>
                <span className="fw-semibold text-dark">{uniqueId}</span>
              </div>
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-person-fill"></i>
              </div>
              <i className="bi bi-chevron-down ms-2"></i>
            </Dropdown.Toggle>
            
            <Dropdown.Menu className="mt-2" align="end">
              {/* <Dropdown.Item href="/settings">
                <i className="bi bi-gear me-2"></i> Settings
              </Dropdown.Item>
              <Dropdown.Item href="/profile">
                <i className="bi bi-person me-2"></i> Profile
              </Dropdown.Item> */}
              <Dropdown.Item 
                onClick={handleLogout}
                className="text-danger"
              >
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default AdminTopNav
