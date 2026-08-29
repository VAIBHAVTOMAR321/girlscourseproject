import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Form, Badge } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import '../../assets/css/Enrollments.css'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaReply, FaCheck, FaTimes, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa'

const API_URL = 'https://brjobsedu.com/girls_course/girls_course_backend/api/student-issue/'

const LearnersManagement = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [queries, setQueries] = useState([])
  const [filteredQueries, setFilteredQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(15)
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedCards, setExpandedCards] = useState({})

  // Reply form state
  const [replyData, setReplyData] = useState({
    extra_remark: '',
    status: ''
  })

  useEffect(() => {
    fetchQueries()
  }, [])


  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredQueries.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredQueries.length / recordsPerPage)

 

 



  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

 

 

 


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
                  <Button variant="outline-secondary" size="sm" onClick={() => navigate('/AdminDashboard')} className="me-2">
                    <FaArrowLeft /> Dashboard
                  </Button>
                  <h4 className="mb-0">Student Issues / Queries</h4>
                </div>
              </div>

              
            </Container>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            Reply to Query - {selectedQuery?.query_id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          {selectedQuery && (
            <div>
              <Row className="mb-3">
                <Col md={6} xs={12}>
                  <p className="mb-1"><strong>Student Name:</strong></p>
                  <p className="text-muted">{selectedQuery.full_name}</p>
                </Col>
                <Col md={6} xs={12}>
                  <p className="mb-1"><strong>Student ID:</strong></p>
                  <p className="text-muted">{selectedQuery.student_id}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <p className="mb-1"><strong>Title:</strong></p>
                  <p className="text-muted">{selectedQuery.title}</p>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <p className="mb-1"><strong>Issue:</strong></p>
                  <p className="text-muted">{selectedQuery.issue}</p>
                </Col>
              </Row>
              <hr />
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Update Status</strong></Form.Label>
                  <Form.Select
                    value={replyData.status}
                    onChange={(e) => setReplyData({ ...replyData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label><strong>Reply / Extra Remark</strong></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={replyData.extra_remark}
                    onChange={(e) => setReplyData({ ...replyData, extra_remark: e.target.value })}
                    placeholder="Enter your reply or remark..."
                  />
                </Form.Group>
              </Form>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submitReply}>
            <FaCheck className="me-1" /> Submit Reply
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-bottom py-2 px-3">
          <Modal.Title className="fw-semibold fs-6">
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="">
          <p>Are you sure you want to delete this query?</p>
          <p className="text-muted">Query ID: {selectedQuery?.query_id}</p>
        </Modal.Body>
        <Modal.Footer className="border-top py-2 px-3">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <FaTrash className="me-1" /> Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default LearnersManagement
