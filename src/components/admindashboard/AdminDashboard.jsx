import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
  const [enrollmentCount, setEnrollmentCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEnrollmentCount = async () => {
      try {
        const response = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/all-registration/')
        if (response.data.success) {
          setEnrollmentCount(response.data.data.length)
        }
      } catch (error) {
        console.error('Error fetching enrollment count:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEnrollmentCount()
  }, [])

  const handleEnrollmentsClick = () => {
    navigate('/Enrollments')
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <AdminTopNav />
      <div className="d-flex flex-1">
        <AdminLeftNav />
        <div className="flex-1 p-4 pt-lg-4 pt-16"> {/* Add padding for mobile fixed button */}
          <Container fluid>
            <Row className="justify-content-center">
              <Col xs={12} md={10} lg={8}>
                <div className="mt-4">
                  <Row>
                    <Col xs={12}>
                      <Card 
                        className="text-center cursor-pointer" 
                        onClick={handleEnrollmentsClick}
                        style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-5px)'
                          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <Card.Body>
                          <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                            <span className="fs-3">📅</span>
                          </div>
                          <Card.Title>Enrollments</Card.Title>
                          {loading ? (
                            <Spinner animation="border" variant="warning" style={{ width: '40px', height: '40px' }} />
                          ) : (
                            <Card.Text className="fs-4 fw-bold">{enrollmentCount}</Card.Text>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
