import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../../assets/css/AdminDashboard.css' // Import specific CSS

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
    <div className="admin-dashboard d-flex flex-column min-vh-100">
      <AdminTopNav />
      <div className="d-flex flex-1">
        <AdminLeftNav />
        <div className="flex-1 p-4 pt-lg-4 pt-16">
          <Container fluid>
            <Row className="justify-content-center">
              <Col xs={12} md={10} lg={8}>
                <div className="mt-4">
                  <Row>
                    <Col xs={12}>
                      <Card 
                        className="stat-card text-center cursor-pointer" 
                        onClick={handleEnrollmentsClick}
                      >
                        <Card.Body>
                          <div className="stat-icon yellow d-flex align-items-center justify-content-center mx-auto mb-3">
                            <i className="bi bi-people-fill"></i>
                          </div>
                          <Card.Title className="stat-label">Total Enrollments</Card.Title>
                          {loading ? (
                            <div className="d-flex justify-content-center">
                              <Spinner animation="border" variant="primary" />
                            </div>
                          ) : (
                            <Card.Text className="stat-value">{enrollmentCount}</Card.Text>
                          )}
                          <Card.Text className="stat-change text-muted small">
                            Click to view details
                          </Card.Text>
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