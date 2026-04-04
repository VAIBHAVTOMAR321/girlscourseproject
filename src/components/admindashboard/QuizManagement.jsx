import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Table, Spinner } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import { FaPlus, FaEdit, FaTrash, FaEye, FaTimes } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'

import '../../assets/css/AdminDashboard.css'

const QuizManagement = () => {
  const { accessToken } = useAuth()
  const [showSidebar, setShowSidebar] = useState(true)
  const [loading, setLoading] = useState(true)
  const [quizzes, setQuizzes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [viewingQuiz, setViewingQuiz] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [quizFormData, setQuizFormData] = useState({
    title: '',
    title_hindi: '',
    description: '',
    description_hindi: '',
    quiz_category: '',
    start_date_time: '',
    end_date_time: '',
    questions: [{ 
      question_text: '', 
      question_text_hindi: '',
      options: ['', '', ''], 
      options_hindi: ['', '', ''],
      correct_answer: 0, 
      marks: 1 
    }]
  })

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/quiz-items/')
      if (response.data.success) {
        setQuizzes(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setQuizFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizFormData.questions]
    if (field === 'options') {
      updatedQuestions[index][field] = value.split('|')
    } else if (field === 'options_hindi') {
      updatedQuestions[index][field] = value.split('|')
    } else {
      updatedQuestions[index][field] = value
    }
    setQuizFormData(prev => ({ ...prev, questions: updatedQuestions }))
  }

  const addQuestion = () => {
    setQuizFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { 
        question_text: '', 
        question_text_hindi: '',
        options: ['', '', ''], 
        options_hindi: ['', '', ''],
        correct_answer: 0, 
        marks: 1 
      }]
    }))
  }

  const removeQuestion = (index) => {
    const updatedQuestions = quizFormData.questions.filter((_, i) => i !== index)
    setQuizFormData(prev => ({ ...prev, questions: updatedQuestions }))
  }

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return ''
    return dateTimeStr.includes(':') && !dateTimeStr.match(/:\d{2}:\d{2}/) 
      ? dateTimeStr + ':00' 
      : dateTimeStr
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        title: quizFormData.title,
        title_hindi: quizFormData.title_hindi,
        description: quizFormData.description,
        description_hindi: quizFormData.description_hindi,
        quiz_category: quizFormData.quiz_category,
        start_date_time: formatDateTime(quizFormData.start_date_time),
        end_date_time: formatDateTime(quizFormData.end_date_time),
        questions: quizFormData.questions
      }

      if (editingQuiz) {
        const questionsPayload = []
        
        editingQuiz.questions.forEach((existingQ, index) => {
          const formQ = quizFormData.questions[index]
          if (formQ) {
            questionsPayload.push({
              id: existingQ.id,
              question_text: formQ.question_text,
              question_text_hindi: formQ.question_text_hindi,
              options: formQ.options,
              options_hindi: formQ.options_hindi,
              correct_answer: formQ.correct_answer
            })
          }
        })
        
        quizFormData.questions.slice(editingQuiz.questions.length).forEach(formQ => {
          questionsPayload.push({
            question_text: formQ.question_text,
            question_text_hindi: formQ.question_text_hindi,
            options: formQ.options,
            options_hindi: formQ.options_hindi,
            correct_answer: formQ.correct_answer
          })
        })

        await axios.put(
          `https://brjobsedu.com/girls_course/girls_course_backend/api/quiz-items/`,
          {
            id: editingQuiz.id,
            questions: questionsPayload,
            quiz_id: editingQuiz.quiz_id,
            title: quizFormData.title,
            title_hindi: quizFormData.title_hindi,
            description: quizFormData.description,
            description_hindi: quizFormData.description_hindi,
            quiz_category: quizFormData.quiz_category,
            quiz_image: editingQuiz.quiz_image,
            start_date_time: formatDateTime(quizFormData.start_date_time),
            end_date_time: formatDateTime(quizFormData.end_date_time),
            number_of_questions: questionsPayload.length,
            is_active: editingQuiz.is_active
          }
        )
      } else {
        await axios.post('https://brjobsedu.com/girls_course/girls_course_backend/api/quiz-items/', payload)
      }

      await fetchQuizzes()
      resetForm()
      setShowModal(false)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Failed to submit quiz. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz)
    setQuizFormData({
      title: quiz.title || '',
      title_hindi: quiz.title_hindi || '',
      description: quiz.description || '',
      description_hindi: quiz.description_hindi || '',
      quiz_category: quiz.quiz_category || '',
      start_date_time: quiz.start_date_time || '',
      end_date_time: quiz.end_date_time || '',
      questions: quiz.questions?.length > 0 
        ? quiz.questions.map(q => ({
            question_text: q.question_text || '',
            question_text_hindi: q.question_text_hindi || '',
            options: q.options || ['', '', ''],
            options_hindi: q.options_hindi || ['', '', ''],
            correct_answer: q.correct_answer ?? 0,
            marks: q.marks || 1
          }))
        : [{ question_text: '', question_text_hindi: '', options: ['', '', ''], options_hindi: ['', '', ''], correct_answer: 0, marks: 1 }]
    })
    setShowModal(true)
  }

  const handleView = (quiz) => {
    setViewingQuiz(quiz)
    setShowViewModal(true)
  }

  const handleDelete = async (quiz) => {
    if (!window.confirm(`Are you sure you want to delete "${quiz.title}"?`)) return

    try {
      await axios.delete('https://brjobsedu.com/girls_course/girls_course_backend/api/quiz-items/', {
        data: { quiz_id: quiz.quiz_id }
      })
      await fetchQuizzes()
    } catch (error) {
      console.error('Error deleting quiz:', error)
      alert('Failed to delete quiz. Please try again.')
    }
  }

  const resetForm = () => {
    setEditingQuiz(null)
    setQuizFormData({
      title: '',
      title_hindi: '',
      description: '',
      description_hindi: '',
      quiz_category: '',
      start_date_time: '',
      end_date_time: '',
      questions: [{ 
        question_text: '', 
        question_text_hindi: '',
        options: ['', '', ''], 
        options_hindi: ['', '', ''],
        correct_answer: 0, 
        marks: 1 
      }]
    })
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  return (
    <div className="d-flex flex-column">
      <AdminTopNav onMenuToggle={() => setShowSidebar(!showSidebar)} isMobile={isMobile} />
      <div className="d-flex flex-1">
        <AdminLeftNav show={showSidebar} setShow={setShowSidebar} />
        
        <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : showSidebar ? '220px' : '60px', padding: '20px', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0">Quiz Management</h4>
                  <Button variant="primary" onClick={openCreateModal}>
                    <FaPlus className="me-2" /> Create Quiz
                  </Button>
                </div>

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Questions</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizzes.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center text-muted py-4">
                            No quizzes available
                          </td>
                        </tr>
                      ) : (
                        quizzes.map((quiz) => (
                          <tr key={quiz.id}>
                            <td>{quiz.quiz_id}</td>
                            <td>{quiz.title}</td>
                            <td><Badge bg="info">{quiz.quiz_category}</Badge></td>
                            <td>{quiz.number_of_questions || 0}</td>
                            <td>
                              <Badge bg={quiz.is_active ? 'success' : 'secondary'}>
                                {quiz.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td>
                              <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleView(quiz)}>
                                <FaEye />
                              </Button>
                              <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleEdit(quiz)}>
                                <FaEdit />
                              </Button>
                              <Button variant="outline-danger" size="sm" onClick={() => handleDelete(quiz)}>
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Container>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetForm() }} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingQuiz ? 'Edit Quiz' : 'Create Quiz'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title (English) *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={quizFormData.title}
                    onChange={handleInputChange}
                    placeholder="Enter title in English"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title (Hindi)</Form.Label>
                  <Form.Control
                    type="text"
                    name="title_hindi"
                    value={quizFormData.title_hindi}
                    onChange={handleInputChange}
                    placeholder="Enter title in Hindi"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Control
                    type="text"
                    name="quiz_category"
                    value={quizFormData.quiz_category}
                    onChange={handleInputChange}
                    placeholder="e.g., GK, Science, Math"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description (English)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description"
                    value={quizFormData.description}
                    onChange={handleInputChange}
                    placeholder="Enter description in English"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Description (Hindi)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="description_hindi"
                    value={quizFormData.description_hindi}
                    onChange={handleInputChange}
                    placeholder="Enter description in Hindi"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="start_date_time"
                    value={quizFormData.start_date_time}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="end_date_time"
                    value={quizFormData.end_date_time}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Questions</h5>
              <Button variant="outline-primary" size="sm" onClick={addQuestion}>
                <FaPlus className="me-1" /> Add Question
              </Button>
            </div>

            {quizFormData.questions.map((question, index) => (
              <Card key={index} className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg="primary">Question {index + 1}</Badge>
                    {quizFormData.questions.length > 1 && (
                      <Button variant="outline-danger" size="sm" onClick={() => removeQuestion(index)}>
                        <FaTimes />
                      </Button>
                    )}
                  </div>
                  
                  <Form.Group className="mb-2">
                    <Form.Label>Question Text (English) *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter question text in English"
                      value={question.question_text}
                      onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Question Text (Hindi)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter question text in Hindi"
                      value={question.question_text_hindi}
                      onChange={(e) => handleQuestionChange(index, 'question_text_hindi', e.target.value)}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-2">
                    <Form.Label>Options (English)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Option 1 | Option 2 | Option 3"
                      value={question.options.join('|')}
                      onChange={(e) => handleQuestionChange(index, 'options', e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Options (Hindi)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="विकल्प 1 | विकल्प 2 | विकल्प 3"
                      value={question.options_hindi.join('|')}
                      onChange={(e) => handleQuestionChange(index, 'options_hindi', e.target.value)}
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Correct Answer</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          max={question.options.length - 1}
                          value={question.correct_answer}
                          onChange={(e) => handleQuestionChange(index, 'correct_answer', parseInt(e.target.value))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Marks</Form.Label>
                        <Form.Control
                          type="number"
                          min="1"
                          value={question.marks}
                          onChange={(e) => handleQuestionChange(index, 'marks', parseInt(e.target.value))}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => { setShowModal(false); resetForm() }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingQuiz ? 'Update' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <div>
              <div>{viewingQuiz?.title}</div>
              {viewingQuiz?.title_hindi && <div className=" small">{viewingQuiz?.title_hindi}</div>}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <Col md={6}><strong>Category:</strong> {viewingQuiz?.quiz_category}</Col>
            <Col md={6}><strong>Questions:</strong> {viewingQuiz?.number_of_questions}</Col>
            <Col md={6}><strong>Status:</strong> {viewingQuiz?.is_active ? 'Active' : 'Inactive'}</Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <strong>Description (English):</strong>
              <p className="text-muted">{viewingQuiz?.description}</p>
            </Col>
            {viewingQuiz?.description_hindi && (
              <Col md={6}>
                <strong>Description (Hindi):</strong>
                <p className="text-muted">{viewingQuiz?.description_hindi}</p>
              </Col>
            )}
          </Row>
          <hr />
          <h5>Questions</h5>
          {viewingQuiz?.questions?.map((q, index) => (
            <Card key={q.id} className="mb-3">
              <Card.Body>
                <div className="mb-3">
                  <strong>{index + 1}. Question (English):</strong>
                  <p className="mb-0 ms-2">{q.question_text}</p>
                </div>
                
                {q.question_text_hindi && (
                  <div className="mb-3 p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Question (Hindi):</strong>
                    <p className="mb-0 ms-2" dir="ltr">{q.question_text_hindi}</p>
                  </div>
                )}

                <div className="mb-3">
                  <strong>Options (English):</strong>
                  <ul className="mb-0 ms-3">
                    {q.options?.map((opt, i) => (
                      <li key={i} className={i === q.correct_answer ? 'text-success fw-bold' : ''}>
                        {opt} {i === q.correct_answer && '✓'}
                      </li>
                    ))}
                  </ul>
                </div>

                {q.options_hindi && q.options_hindi.length > 0 && (
                  <div className="p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Options (Hindi):</strong>
                    <ul className="mb-0 ms-3" dir="ltr">
                      {q.options_hindi.map((opt, i) => (
                        <li key={i} className={i === q.correct_answer ? 'text-success fw-bold' : ''}>
                          {opt} {i === q.correct_answer && '✓'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default QuizManagement
