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
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

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

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!uniqueId || !accessToken) return
      
      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
        
        const response = await axios.get(
          `https://brjobsedu.com/girls_course/girls_course_backend/api/notifications/?student_id=${uniqueId}`,
          config
        )
        
        if (response.data.status) {
          const allNotifications = [
            ...(response.data.unseen_notifications || []),
            ...(response.data.seen_notifications || [])
          ]
          setNotifications(allNotifications)
          setUnreadCount(response.data.unseen_count || 0)
        }
      } catch (error) {
        // Handle error silently
      }
    }
    
    fetchNotifications()
    
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [uniqueId, accessToken])

  const handleNotificationClick = async (notification) => {
    // Handle navigation based on notification type
    if (notification.type !== 'admin') {
      setShowNotificationDropdown(false)
      switch (notification.type) {
        case 'course':
          navigate('/UserDashboard', { state: { activeTab: 'all-courses' } })
          break
        case 'scheme':
          navigate('/GovernmentSchemes')
          break
        case 'quiz':
          navigate('/UserQuiz')
          break
        case 'grooming':
          navigate('/GroomingClasses')
          break
        case 'job':
          navigate('/JobOpenings', { state: { activeTab: 'jobs' } })
          break
        case 'seminar':
          navigate('/JobOpenings', { state: { activeTab: 'seminars' } })
          break
        case 'workshop':
          navigate('/JobOpenings', { state: { activeTab: 'workshops' } })
          break
        case 'issue_reply':
          navigate('/UserQuery')
          break
        default:
          break
      }
    }
    
    // Mark as seen if not already
    if (!notification.seen) {
      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
        
        await axios.put(
          `https://brjobsedu.com/girls_course/girls_course_backend/api/notifications/multi-seen/`,
          { student_id: uniqueId, notification_ids: [notification.id] },
          config
        )
        
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id 
              ? { ...n, seen: true } 
              : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch (error) {
        // Handle error silently
      }
    }
  }

  const handleMarkAllSeen = async () => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
      
      const unseenIds = notifications.filter(n => !n.seen).map(n => n.id)
      
      if (unseenIds.length === 0) return
      
      await axios.put(
        `https://brjobsedu.com/girls_course/girls_course_backend/api/notifications/multi-seen/`,
        { student_id: uniqueId, notification_ids: unseenIds },
        config
      )
      
      setNotifications(prev => prev.map(n => ({ ...n, seen: true })))
      setUnreadCount(0)
    } catch (error) {
      // Handle error silently
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      quiz: 'bi-journal-check',
      issue_reply: 'bi-chat-dots',
      job: 'bi-briefcase',
      scheme: 'bi-gift',
      seminar: 'bi-people',
      workshop: 'bi-tools'
    }
    return icons[type] || 'bi-bell'
  }

  const formatTime = (timeStr) => {
    try {
      const date = new Date(timeStr)
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return timeStr
    }
  }

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
            className="me-3 d-flex align-items-center grooming-class"
           
            title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
          >
            <i className="bi bi-globe me-2"></i>
            {language === 'en' ? 'EN' : 'HI'}
          </Button>

          <Button
            onClick={() => navigate('/GroomingClasses')}
            className="me-3 d-flex align-items-center grooming-style"
           
            title={language === 'en' ? 'Grooming Classes' : 'ग्रूमिंग क्लासेस'}
          >
            <i className="bi bi-mortarboard-fill me-2"></i>
            {language === 'en' ? 'Grooming' : 'ग्रूमिंग'}
          </Button>

          <Dropdown 
            show={showNotificationDropdown}
            onToggle={(isOpen) => setShowNotificationDropdown(isOpen)}
            className="me-3"
          >
            <Dropdown.Toggle 
              as="div"
              className="notification-bell-wrapper"
              style={{ cursor: 'pointer', position: 'relative', padding: '8px' }}
            >
              <i className="bi bi-bell notification-user" style={{ fontSize: '1.25rem', }}></i>
              {unreadCount > 0 && (
                <span 
                  className="notification-badge"
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Dropdown.Toggle>
            
<Dropdown.Menu 
              style={{ 
                width: '320px', 
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '0',
                right: 0,
                left: 'auto',
              
                color: '#000000'
              }}
            >
              <div 
                className="d-flex justify-content-between align-items-center p-2 border-bottom"
                style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}
              >
                <span style={{ fontWeight: '600' }}>{language === 'en' ? 'Notifications' : 'सूचनाएं'}</span>
                {unreadCount > 0 && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={handleMarkAllSeen}
                    style={{ padding: '0', fontSize: '0.8rem' }}
                  >
                    {language === 'en' ? 'Mark all read' : 'सभी पढ़ें'}
                  </Button>
                )}
              </div>
              
              {notifications.length === 0 ? (
                <div className="p-3 text-center text-muted">
                  {language === 'en' ? 'No notifications' : 'कोई सूचना नहीं'}
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <Dropdown.Item 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    style={{ 
                      backgroundColor: notification.type === 'admin' 
                        ? (notification.seen ? '#fff3cd' : '#fff8e1') 
                        : (notification.seen ? 'white' : '#f8f9fa'),
                      borderBottom: '1px solid #eee',
                      padding: '10px 12px',
                      whiteSpace: 'normal',
                      borderLeft: notification.type === 'admin' ? '3px solid #dc3545' : 'none'
                    }}
                  >
                    <div className="d-flex align-items-start">
                      <div 
                        className="me-2 d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%',
                          backgroundColor: notification.type === 'admin' 
                            ? (notification.seen ? '#ffc107' : '#dc3545') 
                            : (notification.seen ? '#e9ecef' : '#667eea'),
                          color: notification.seen ? '#6c757d' : 'white',
                          flexShrink: 0
                        }}
                      >
                        <i className={`bi ${getNotificationIcon(notification.type)}`}></i>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div 
                          className="fw-semibold" 
                          style={{ fontSize: '0.9rem', color: notification.seen ? '#6c757d' : '#212529' }}
                        >
                          {notification.title}
                        </div>
                        <div 
                          className="text-muted" 
                          style={{ fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {notification.message}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                          {formatTime(notification.time)}
                        </div>
                      </div>
                      {!notification.seen && (
                        <div 
                          style={{ 
                            width: '8px', 
                            height: '8px', 
                            borderRadius: '50%', 
                            backgroundColor: '#dc3545',
                            flexShrink: 0,
                            marginLeft: '8px'
                          }}
                        />
                      )}
                    </div>
                  </Dropdown.Item>
                ))
              )}
            </Dropdown.Menu>
          </Dropdown>

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
             
            </Dropdown.Toggle>
            
            <Dropdown.Menu className="profile-dropdown-menu" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
              <Dropdown.Item className="logout-item" onClick={handleLogout} style={{ color: '#000000' }}>
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