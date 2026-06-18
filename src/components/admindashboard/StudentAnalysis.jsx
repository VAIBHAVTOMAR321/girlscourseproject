import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import '../../assets/css/Enrollments.css'
import axios from 'axios'
import { FaBook, FaInfoCircle } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'

const API_URL = 'https://brjobsedu.com/girls_course/girls_course_backend/api/unpaid-courses/'

const StudentAnalysis = () => {
  const [showSidebar, setShowSidebar] = useState(true)
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [error, setError] = useState(null)
  const { accessToken } = useAuth()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true)
        setError(null)
        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
        const response = await axios.get(API_URL, config)
        if (response.data && response.data.status) {
          setCourses(response.data.courses)
        } else {
          setCourses([])
          setError(response.data.message || 'Failed to fetch courses.')
        }
      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Network error or unable to fetch courses.')
        setCourses([])
      } finally {
        setLoadingCourses(false)
      }
    }

    if (accessToken) {
      fetchCourses()
    }
  }, [accessToken])

  return (
    <div className="admin-layout">
      <div className="admin-wrapper d-flex">
        <AdminLeftNav show={showSidebar} setShow={setShowSidebar} />
        <div className={`admin-main-content flex-grow-1 ${!showSidebar ? 'sidebar-compact' : ''}`}>
          <AdminTopNav />
          <div className="content-area">
            <Container fluid className='mob-top-view'>
              <div className="d-flex justify-content-between align-items-center mb-4 page-header">
                <div className="d-flex align-items-center all-en-box gap-3">
                  <h4 className="mb-0">Student Analysis</h4>
                </div>
              </div>

              <Row>
                <Col xs={12}>
                  {loadingCourses ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Loading courses...</p>
                    </div>
                  ) : error ? (
                    <Alert variant="danger">
                      <FaInfoCircle className="me-2" />
                      {error}
                    </Alert>
                  ) : courses.length === 0 ? (
                    <Card className="enrollments-table-card border p-4 shadow-sm">
                      <Card.Body>
                        <h5 className="text-secondary mb-3">No Courses Found</h5>
                        <p className="text-muted">There are no courses to display for student analysis.</p>
                      </Card.Body>
                    </Card>
                  ) : (
                    <Row className="g-4">
                      {courses.map((course) => (
                        <Col key={course.course_id} xs={12} sm={6} md={4} lg={3}>
                          <Card className="h-100 shadow-sm border-0">
                            <Card.Body>
                              <h5 className="card-title fw-bold text-primary">{course.course_name}</h5>
                              <p className="card-text text-muted mb-2">ID: {course.course_id}</p>
                              <Badge bg={course.course_status === 'unpaid' ? 'info' : 'success'}>
                                {course.course_status}
                              </Badge>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                  {/* Original placeholder card - can be removed or repurposed */}
                   <Card className="enrollments-table-card border p-4 shadow-sm">
                    <Card.Body>
                      <h5 className="text-secondary mb-3">Analysis Dashboard</h5>
                      <p className="text-muted">This component is ready for student performance analysis and metrics visualization.</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

            </Container>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentAnalysis