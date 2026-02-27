import React from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import UserLeftNav from './UseLeftNav'
import UserTopNav from './UserTopNav'
import { useAuth } from '../../contexts/AuthContext'

const UserDashboard = () => {
  const { userRole, uniqueId, accessToken } = useAuth()

  return (
    <div className="d-flex flex-column min-vh-100">
      <UserTopNav />
      <div className="d-flex flex-1">
        <UserLeftNav />
        <div className="flex-1 p-4 pt-lg-4 pt-16"> {/* Add padding for mobile fixed button */}
          <Container fluid>
            <Row className="justify-content-center">
              <Col xs={12} md={10} lg={8}>
                <Card>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h3>User Dashboard</h3>
                  </Card.Header>
                  <Card.Body>
                    <h4>Welcome to your dashboard!</h4>
                    <div className="mt-3">
                      <p>You are logged in as: <strong>{userRole}</strong></p>
                      <p>User ID: <strong>{uniqueId}</strong></p>
                      <p>Access Token: <code className="text-truncate">{accessToken}</code></p>
                    </div>
                    <p className="mt-4">This page is protected and only accessible to authenticated users.</p>
                  </Card.Body>
                </Card>
                
                <div className="mt-4">
                  <Row>
                    <Col xs={12} sm={6} md={4}>
                      <Card className="text-center mb-3">
                        <Card.Body>
                          <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                            <span className="fs-3">📚</span>
                          </div>
                          <Card.Title>Enrolled Courses</Card.Title>
                          <Card.Text className="fs-4 fw-bold">3</Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <Card className="text-center mb-3">
                        <Card.Body>
                          <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                            <span className="fs-3">✅</span>
                          </div>
                          <Card.Title>Completed Courses</Card.Title>
                          <Card.Text className="fs-4 fw-bold">1</Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <Card className="text-center mb-3">
                        <Card.Body>
                          <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                            <span className="fs-3">⏰</span>
                          </div>
                          <Card.Title>In Progress</Card.Title>
                          <Card.Text className="fs-4 fw-bold">2</Card.Text>
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

export default UserDashboard