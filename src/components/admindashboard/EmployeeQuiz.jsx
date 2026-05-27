import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Table, Button, Spinner, Modal, Form, Badge, Nav, Tab, InputGroup } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import '../../assets/css/AdminDashboard.css'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaEye, FaTimes } from 'react-icons/fa'

const API_URL = 'https://brjobsedu.com/girls_course/girls_course_backend/api/workshop-questions/'

const EmployeeQuiz = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [showSidebar, setShowSidebar] = useState(true)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('postQuestions') // 'postQuestions' or 'allTests'

  // State for Questions Management
  const [questions, setQuestions] = useState([])
  const [questionFormData, setQuestionFormData] = useState({
    question_text: '',
    question_text_hindi: '',
    options: ['', '', '', ''], // Default 4 options
    options_hindi: ['', '', '', ''], // Default 4 options
    correct_answer: 0, // Index of the correct option
    marks: 1
  })
  const [editingQuestion, setEditingQuestion] = useState(null) // Stores the question being edited
  const [showQuestionModal, setShowQuestionModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null) // For delete confirmation

  useEffect(() => {
    if (activeTab === 'postQuestions') {
      fetchQuestions()
    }
  }, [activeTab, accessToken]) // Re-fetch when tab changes or token changes

  const getAuthConfig = () => ({
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const config = getAuthConfig()
      const response = await axios.get(API_URL, config)
      if (response.data && response.data.success) {
        setQuestions(response.data.data)
      } else {
        setQuestions([])
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionFormChange = (e) => {
    const { name, value } = e.target
    setQuestionFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleOptionChange = (index, value, isHindi = false) => {
    setQuestionFormData(prev => {
      const newOptions = isHindi ? [...prev.options_hindi] : [...prev.options]
      newOptions[index] = value
      return { ...prev, [isHindi ? 'options_hindi' : 'options']: newOptions }
    })
  }

  const handleAddOption = (isHindi = false) => {
    setQuestionFormData(prev => ({
      ...prev,
      [isHindi ? 'options_hindi' : 'options']: [...(isHindi ? prev.options_hindi : prev.options), '']
    }))
  }

  const handleRemoveOption = (index, isHindi = false) => {
    setQuestionFormData(prev => {
      const newOptions = isHindi ? [...prev.options_hindi] : [...prev.options]
      if (newOptions.length > 1) { // Ensure at least one option remains
        newOptions.splice(index, 1)
      }
      return { ...prev, [isHindi ? 'options_hindi' : 'options']: newOptions }
    })
  }

  const handleOpenQuestionModal = (question = null) => {
    if (question) {
      setEditingQuestion(question)
      setQuestionFormData({
        question_text: question.question_text || '',
        question_text_hindi: question.question_text_hindi || '',
        options: question.options || ['', '', '', ''],
        options_hindi: question.options_hindi || ['', '', '', ''],
        correct_answer: question.correct_answer ?? 0,
        marks: question.marks ?? 1
      })
    } else {
      setEditingQuestion(null)
      setQuestionFormData({
        question_text: '',
        question_text_hindi: '',
        options: ['', '', '', ''],
        options_hindi: ['', '', '', ''],
        correct_answer: 0,
        marks: 1
      })
    }
    setShowQuestionModal(true)
  }

  const handleCloseQuestionModal = () => {
    setShowQuestionModal(false)
    setEditingQuestion(null)
    setQuestionFormData({
      question_text: '',
      question_text_hindi: '',
      options: ['', '', '', ''],
      options_hindi: ['', '', '', ''],
      correct_answer: 0,
      marks: 1
    })
  }

  const handleSubmitQuestion = async (e) => {
    e.preventDefault()
    setLoading(true) // Set loading for submission

    try {
      const config = getAuthConfig()
      const payload = {
        question_text: questionFormData.question_text,
        question_text_hindi: questionFormData.question_text_hindi,
        options: questionFormData.options,
        options_hindi: questionFormData.options_hindi,
        correct_answer: questionFormData.correct_answer,
        marks: questionFormData.marks
      }

      if (editingQuestion) {
        payload.id = editingQuestion.id // Add ID for PUT request
        await axios.put(API_URL, payload, config)
        alert('Question updated successfully!')
      } else {
        await axios.post(API_URL, payload, config)
        alert('Question added successfully!')
      }
      
      handleCloseQuestionModal()
      fetchQuestions() // Refresh list
    } catch (error) {
      console.error('Error submitting question:', error)
      alert('Failed to submit question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = (question) => {
    setSelectedQuestion(question)
    setShowDeleteModal(true)
  }

  const confirmDeleteQuestion = async () => {
    setLoading(true)
    try {
      const config = getAuthConfig()
      await axios.delete(API_URL, { data: { id: selectedQuestion.id }, ...config })
      alert('Question deleted successfully!')
      setShowDeleteModal(false)
      fetchQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question. Please try again.')
    } finally {
      setLoading(false)
    }
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
                  <h4 className="mb-0">Employee Quiz Management</h4>
                </div>
                <Button variant="primary" onClick={() => handleOpenQuestionModal()}>
                  <FaPlus className="me-2" /> Add New Question
                </Button>
              </div>

              <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav variant="tabs" className="mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="postQuestions">
                      <FaPlus className="me-1" /> Post Questions
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="allTests">
                      <FaEye className="me-1" /> All Tests (Coming Soon)
                    </Nav.Link>
                  </Nav.Item>
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="postQuestions">
                    {loading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2">Loading questions...</p>
                      </div>
                    ) : (
                      <Card className="shadow-sm border-0">
                        <Card.Header className="bg-light border-bottom py-2 px-3">
                          <h6 className="mb-0 fw-semibold text-secondary">Existing Questions</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                          {questions.length === 0 ? (
                            <div className="text-center text-muted py-4">
                              No questions found. Add one using the button above!
                            </div>
                          ) : (
                            <Table hover responsive className="mb-0">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Question (English)</th>
                                  <th>Question (Hindi)</th>
                                  <th>Marks</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {questions.map(q => (
                                  <tr key={q.id}>
                                    <td>{q.id}</td>
                                    <td>{q.question_text}</td>
                                    <td>{q.question_text_hindi}</td>
                                    <td>{q.marks}</td>
                                    <td>
                                      <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleOpenQuestionModal(q)}>
                                        <FaEdit />
                                      </Button>
                                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteQuestion(q)}>
                                        <FaTrash />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          )}
                        </Card.Body>
                      </Card>
                    )}
                  </Tab.Pane>
                  <Tab.Pane eventKey="allTests">
                    <Card className="shadow-sm border-0">
                      <Card.Body className="text-center py-5 text-muted">
                        All Tests analysis coming soon!
                      </Card.Body>
                    </Card>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Container>
          </div>
        </div>
      </div>

      {/* Question Add/Edit Modal */}
      <Modal show={showQuestionModal} onHide={handleCloseQuestionModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingQuestion ? 'Edit Question' : 'Add New Question'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitQuestion}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Question Text (English) *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="question_text"
                value={questionFormData.question_text}
                onChange={handleQuestionFormChange}
                placeholder="Enter question text in English"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Question Text (Hindi)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="question_text_hindi"
                value={questionFormData.question_text_hindi}
                onChange={handleQuestionFormChange}
                placeholder="Enter question text in Hindi"
              />
            </Form.Group>

            <h6 className="mt-4 mb-2">Options (English)</h6>
            {questionFormData.options.map((option, index) => (
              <InputGroup key={index} className="mb-2">
                <InputGroup.Text>{String.fromCharCode(65 + index)}</InputGroup.Text>
                <Form.Control
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  required
                />
                <Button variant="outline-danger" onClick={() => handleRemoveOption(index)} disabled={questionFormData.options.length <= 1}>
                  <FaTimes />
                </Button>
              </InputGroup>
            ))}
            <Button variant="outline-primary" size="sm" className="mt-2" onClick={() => handleAddOption()}>
              <FaPlus className="me-1" /> Add Option
            </Button>

            <h6 className="mt-4 mb-2">Options (Hindi)</h6>
            {questionFormData.options_hindi.map((option, index) => (
              <InputGroup key={index} className="mb-2">
                <InputGroup.Text>{String.fromCharCode(65 + index)}</InputGroup.Text>
                <Form.Control
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value, true)}
                  placeholder={`विकल्प ${String.fromCharCode(65 + index)}`}
                />
                <Button variant="outline-danger" onClick={() => handleRemoveOption(index, true)} disabled={questionFormData.options_hindi.length <= 1}>
                  <FaTimes />
                </Button>
              </InputGroup>
            ))}
            <Button variant="outline-primary" size="sm" className="mt-2" onClick={() => handleAddOption(true)}>
              <FaPlus className="me-1" /> Add Option (Hindi)
            </Button>

            <Form.Group className="mb-3 mt-4">
              <Form.Label>Correct Answer *</Form.Label>
              <Form.Select
                name="correct_answer"
                value={questionFormData.correct_answer}
                onChange={handleQuestionFormChange}
                required
              >
                {questionFormData.options.map((_, index) => (
                  <option key={index} value={index}>
                    {String.fromCharCode(65 + index)} - {questionFormData.options[index]}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Marks *</Form.Label>
              <Form.Control
                type="number"
                name="marks"
                value={questionFormData.marks}
                onChange={handleQuestionFormChange}
                min="1"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseQuestionModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the question: <strong>"{selectedQuestion?.question_text}"</strong>?</p>
          <p className="text-muted small">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteQuestion}>
            <FaTrash className="me-1" /> Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default EmployeeQuiz