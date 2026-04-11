import React, { useState, useEffect } from 'react'
import { Navbar, Nav, Dropdown, Button } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import '../../assets/css/UserTopNav.css'
import Logo from '../../assets/brainrock_logo.png'

const UserTopNav = ({ onMenuToggle, isMobile }) => {
  const { userRole, userRoleType, uniqueId, logout, isAuthenticated, accessToken, profilePhoto, updateProfilePhoto } = useAuth()
  const { language, toggleLanguage } = useLanguage()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch user data when component mounts or uniqueId changes
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        let response
        
        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
        
        // Fetch data based on user role
        if (userRoleType === 'student-unpaid') {
          // For unpaid students, fetch from student-unpaid endpoint with student_id
          response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/student-unpaid/?student_id=${uniqueId}`, config)
        } else {
          // For regular students, use the existing endpoint
          response = await axios.get(`https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/?student_id=${uniqueId}`, config)
        }
        
        const { data } = response
        
        if (data.success) {
          setUserData(data.data)
          if (userRoleType !== 'student-unpaid' && data.data.profile_photo) {
            updateProfilePhoto(data.data.profile_photo) // Update profile photo in context
          }
        }
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false)
      }
    }

    if (uniqueId) {
      fetchUserData()
    }
  }, [uniqueId, userRoleType, updateProfilePhoto])

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
           
            border: '1px solid rgba(102, 126, 234, 0.2)',
            color: '#fff',
            transition: 'all 0.2s ease'
          }}
        >
          <i className="bi bi-list"></i>
        </Button>
      )}
      
      <Navbar.Brand href="/UserDashboard" className="ms-3 d-flex align-items-center">
        <img src={Logo} alt="BrainRock Logo" className="user-logo-img me-3" />
        <div className="user-logo-text">
          <div className="user-logo-main">Brainrock Consulting Services</div>
          <div className="user-logo-sub">I.S.O certified 9001:2015</div>
        </div>
      </Navbar.Brand>
      
      <Navbar.Toggle aria-controls="admin-topnav" className="border-0 shadow-none" />
      
      <Navbar.Collapse id="admin-topnav" className="justify-content-end">
        <Nav className="align-items-center">
          {/* Language Toggle Button */}
          <Button
            variant="light"
            onClick={toggleLanguage}
            className="me-3 d-flex align-items-center"
            style={{
              borderRadius: '8px',
              padding: '0.5rem 1rem',
             
              border: '1px solid rgba(102, 126, 234, 0.3)',
              color: '#667eea',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
          >
            <i className="bi bi-globe me-2"></i>
            {language === 'en' ? 'EN' : 'HI'}
          </Button>

          <Button
            onClick={() => navigate('/GroomingClasses')}
            className="me-3 d-flex align-items-center"
            style={{
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
              color: 'white',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(240, 147, 251, 0.4)'
            }}
            title={language === 'en' ? 'Grooming Classes' : 'ग्रूमिंग क्लासेस'}
          >
            <i className="bi bi-mortarboard-fill me-2"></i>
            {language === 'en' ? 'Grooming' : 'ग्रूमिंग'}
          </Button>

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
                  {!loading && profilePhoto ? (
                    <img 
                      src={`https://brjobsedu.com/girls_course/girls_course_backend/${profilePhoto}`} 
                      alt="Profile" 
                      className="user-avatar-img rounded-circle"
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                  ) : (
                    <i className="bi bi-person-fill"></i>
                  )}
                </div>
                <div className="user-details">
                  <span className="user-name">{loading ? 'Loading...' : (userRoleType === 'student-unpaid' ? userData?.full_name : userData?.candidate_name) || uniqueId}</span>
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