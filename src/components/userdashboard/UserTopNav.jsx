import React, { useState, useEffect } from 'react'
import { Navbar, Nav, Dropdown, Button } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../../assets/css/UserTopNav.css'

const UserTopNav = ({ onMenuToggle, isMobile }) => {
  const { userRole, uniqueId, logout, isAuthenticated, accessToken } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch user data when component mounts or uniqueId changes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/?student_id=${uniqueId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
        const data = await response.json()
        
        if (data.success) {
          setUserData(data.data)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (uniqueId) {
      fetchUserData()
    }
  }, [uniqueId])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Navbar bg="white" expand="lg" className="user-top-nav shadow-sm border-bottom">
      {isMobile && (
        <Button 
          variant="primary" 
          onClick={onMenuToggle} 
          className="mobile-menu-btn me-2"
          style={{ 
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            color: '#667eea',
            transition: 'all 0.2s ease'
          }}
        >
          <i className="bi bi-list"></i>
        </Button>
      )}
      
      <Navbar.Brand href="/UserDashboard" className="ms-3">
        <h5 className="mb-0 text-primary">User Dashboard</h5>
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
              as="div"
              className="d-flex align-items-center"
              id="dropdown-custom-components"
            >
              <div className="user-info d-flex align-items-center">
                <div className="user-avatar">
                  <i className="bi bi-person-fill"></i>
                </div>
                <div className="user-details">
                  <span className="user-name">{loading ? 'Loading...' : (userData?.full_name || uniqueId)}</span>
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

export default UserTopNav