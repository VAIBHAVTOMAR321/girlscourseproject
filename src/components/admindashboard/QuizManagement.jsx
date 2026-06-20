import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Modal, Form, Badge, Table, Spinner, Alert } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import axios from 'axios'
import { FaPlus, FaEdit, FaTrash, FaEye, FaTimes, FaArrowLeft, FaChartBar, FaTrophy, FaMedal, FaUsers, FaCheckCircle, FaClock, FaChevronLeft, FaChevronRight, FaInfoCircle, FaList } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'

import '../../assets/css/AdminDashboard.css'

const QuizManagement = () => {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [showSidebar, setShowSidebar] = useState(true)
  const [loading, setLoading] = useState(true)
  const [quizzes, setQuizzes] = useState([])
  
  // Modal States
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showOverallAnalysisModal, setShowOverallAnalysisModal] = useState(false)
  
  // Data States
  const [editingQuiz, setEditingQuiz] = useState(null)
  const [viewingQuiz, setViewingQuiz] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [showAnalysisView, setShowAnalysisView] = useState(false)
  const [selectedQuizForAnalysis, setSelectedQuizForAnalysis] = useState(null)
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 20

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
    if (field === 'options' || field === 'options_hindi') {
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

  const handleViewAnalysis = async (quiz) => {
    setSelectedQuizForAnalysis(quiz)
    setShowAnalysisView(true)
    setAnalysisData(null)
    setAnalysisLoading(true)
    setCurrentPage(1)
    try {
      const response = await axios.get(
        `https://brjobsedu.com/girls_course/girls_course_backend/api/quiz-batch-rank-admin/?quiz_id=${quiz.quiz_id}`
      )
      if (response.data.status) setAnalysisData(response.data)
    } catch (error) {
      console.error('Error fetching analysis:', error)
    } finally {
      setAnalysisLoading(false)
    }
  }

  const renderRankIcon = (rank) => {
    if (rank === 1) return <FaTrophy className="text-warning me-1" />
    if (rank === 2) return <FaMedal className="text-primary me-1" />
    if (rank === 3) return <FaMedal className="text-warning me-1" />
    return null
  }

  const getRankColor = (rank) => {
    if (rank === 1) return '#28a745'
    if (rank === 2) return '#0d6efd'
    if (rank === 3) return '#ffc107'
    return '#dc3545'
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  // Data processing for Analysis View
  const allStudents = analysisData ? analysisData.batches.flatMap(b => b.students.map(s => ({...s, batch_name: b.student_batch}))) : []
  const sortedStudents = [...allStudents].sort((a, b) => a.rank - b.rank)
  const totalQuestions = selectedQuizForAnalysis?.number_of_questions || 1

  const totalStudents = allStudents.length
  const passedStudents = allStudents.filter(s => s.status === 'passed').length
  const avgScore = totalStudents > 0 ? (allStudents.reduce((acc, curr) => acc + curr.score, 0) / totalStudents).toFixed(1) : 0
  const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : 0

  const totalPages = Math.ceil(sortedStudents.length / recordsPerPage)
  const currentRecords = sortedStudents.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)

  const completionChartData = [
    { name: 'Passed', value: passedStudents, color: '#28a745' },
    { name: 'Failed', value: totalStudents - passedStudents, color: '#dc3545' }
  ]

  const performanceLevelsData = [
    { name: 'High (>=75%)', value: sortedStudents.filter(r => (r.score / totalQuestions) >= 0.75).length, color: '#28a745' },
    { name: 'Average (40-74%)', value: sortedStudents.filter(r => { const pct = (r.score / totalQuestions); return pct >= 0.4 && pct < 0.75; }).length, color: '#0dcaf0' },
    { name: 'Low (<40%)', value: sortedStudents.filter(r => (r.score / totalQuestions) < 0.4).length, color: '#dc3545' }
  ]

  return (
    <div className="admin-layout">
      <div className="admin-wrapper d-flex">
        <AdminLeftNav show={showSidebar} setShow={setShowSidebar} />
        <div className={`admin-main-content flex-grow-1 ${!showSidebar ? 'sidebar-compact' : ''}`}>
          <AdminTopNav />
          <div className="content-area">
            <Container fluid className='mob-top-view'>
              
              {!showAnalysisView ? (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4 page-header">
                    <div className="d-flex align-items-center all-en-box gap-3">
                      <Button variant="outline-secondary" size="sm" onClick={() => navigate('/AdminDashboard')} className="me-2">
                        <FaArrowLeft /> Dashboard
                      </Button>
                      <h4 className="mb-0">Quiz Management</h4>
                    </div>
                    <Button variant="primary" onClick={openCreateModal}>
                      <FaPlus className="me-2" /> Create Quiz
                    </Button>
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                    </div>
                  ) : (
                    <Card className="shadow-sm border-0">
                      <Card.Body className="p-0">
                        <Table responsive hover className="mb-0">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Title</th>
                              <th>Category</th>
                              <th>Questions</th>
                              <th>Status</th>
                              <th>Analysis</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {quizzes.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="text-center text-muted py-4">
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
                                    <Button variant="outline-info" size="sm" onClick={() => handleViewAnalysis(quiz)}>
                                      <FaChartBar />
                                    </Button>
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
                      </Card.Body>
                    </Card>
                  )}
                </>
              ) : (
                <div className="ranking-dashboard">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0 text-dark fw-bold">Performance Analytics: {selectedQuizForAnalysis?.title}</h5>
                    <div>
                      <Button variant="outline-secondary" className="me-2" onClick={() => setShowAnalysisView(false)}>
                        <FaArrowLeft className="me-1" /> Back to Quizzes
                      </Button>
                      <Button variant="outline-primary" onClick={() => setShowOverallAnalysisModal(true)}>
                        <FaChartBar className="me-2" /> View Overall Analysis
                      </Button>
                    </div>
                  </div>

                  {analysisLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="mt-2">Loading ranking data...</p>
                    </div>
                  ) : (
                    <>
                      {/* Stats Summary Cards */}
                      <Row className="mb-4 g-3">
                        <Col md={3}>
                          <Card className="border-0 shadow-sm text-center py-3 bg-primary text-white">
                            <FaUsers className="mb-2 fs-3" />
                            <h6 className="small text-uppercase">Total Students</h6>
                            <h4>{totalStudents}</h4>
                          </Card>
                        </Col>
                        <Col md={3}>
                          <Card className="border-0 shadow-sm text-center py-3 bg-success text-white">
                            <FaCheckCircle className="mb-2 fs-3" />
                            <h6 className="small text-uppercase">Avg. Score</h6>
                            <h4>{avgScore}</h4>
                          </Card>
                        </Col>
                        <Col md={3}>
                          <Card className="border-0 shadow-sm text-center py-3 bg-info text-white">
                            <FaClock className="mb-2 fs-3" />
                            <h6 className="small text-uppercase">Pass Rate</h6>
                            <h4>{passRate}%</h4>
                          </Card>
                        </Col>
                        <Col md={3}>
                          <Card className="border-0 shadow-sm text-center py-3 bg-warning text-dark">
                            <FaList className="mb-2 fs-3" />
                            <h6 className="small text-uppercase">Total Batches</h6>
                            <h4>{analysisData?.batch_count || 0}</h4>
                          </Card>
                        </Col>
                      </Row>

                      {/* Top 3 Podium and Chart */}
                      <Row className="mb-4 g-4">
                        <Col lg={4}>
                          <h5 className="mb-3 text-secondary"><FaTrophy className="text-warning me-2"/>Top Performers</h5>
                          {sortedStudents.slice(0, 3).map((student, idx) => (
                            <Card key={student.student_id} className={`mb-3 border-0 shadow-sm border-start border-4 ${idx === 0 ? 'border-success' : idx === 1 ? 'border-primary' : 'border-warning'}`}>
                              <Card.Body className="d-flex align-items-center py-3">
                                <div className="rank-badge me-3" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getRankColor(idx + 1) }}>
                                  #{idx + 1}
                                </div>
                                <div className="flex-grow-1">
                                  <h6 className="mb-0 fw-bold">{student.full_name}</h6>
                                  <small className="text-muted">{student.student_id}</small>
                                </div>
                                <div className="text-end">
                                  <h5 className="mb-0 text-primary">{student.score}</h5>
                                  <small className="text-muted">Pts</small>
                                </div>
                              </Card.Body>
                            </Card>
                          ))}
                          {sortedStudents.length === 0 && <div className="text-center py-4 bg-light rounded text-muted">No data available yet</div>}
                        </Col>
                        <Col lg={8}>
                          <Card className="h-100 border-0 shadow-sm">
                            <Card.Header className="bg-white py-3 border-0">
                              <h6 className="mb-0 text-secondary">Score Distribution (Top 10)</h6>
                            </Card.Header>
                            <Card.Body>
                              <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                  <BarChart data={sortedStudents.slice(0, 10)} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="full_name" hide />
                                    <YAxis />
                                    <Tooltip 
                                      cursor={{fill: 'transparent'}}
                                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                      {sortedStudents.slice(0, 10).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getRankColor(index + 1)} />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>

                      {/* Full Rankings Table */}
                      <Card className="border-0 shadow-sm overflow-hidden mb-4">
                        <Card.Header className="bg-light py-3">
                          <h6 className="mb-0 fw-semibold text-secondary">Full Leaderboard</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                          <Table hover responsive className="mb-0">
                            <thead className="bg-light">
                              <tr>
                                <th className="ps-4">Rank</th>
                                <th>Student Name</th>
                                <th>Student ID</th>
                                <th>Batch</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th className="text-center">Certificate</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentRecords.length > 0 ? currentRecords.map((r, index) => (
                                <tr key={r.student_id || index}>
                                  <td className="ps-4 fw-bold">
                                    {renderRankIcon(r.rank)} {r.rank}
                                  </td>
                                  <td>{r.full_name}</td>
                                  <td><Badge bg="light" text="dark" className="border">{r.student_id}</Badge></td>
                                  <td><Badge bg="secondary">{r.batch_name}</Badge></td>
                                  <td className="text-primary fw-semibold">{r.score}</td>
                                  <td>
                                    <Badge bg={r.status === 'passed' ? 'success' : 'danger'}>
                                      {r.status}
                                    </Badge>
                                  </td>
                                  <td className="text-center">
                                    {r.certificate_file ? (
                                      <Button 
                                        variant="link" 
                                        size="sm" 
                                        onClick={() => window.open(`https://brjobsedu.com/girls_course/girls_course_backend${r.certificate_file}`, '_blank')}
                                        className="text-decoration-none p-0"
                                      >
                                        <FaEye className="me-1" /> View
                                      </Button>
                                    ) : '—'}
                                  </td>
                                </tr>
                              )) : (
                                <tr>
                                  <td colSpan="7" className="text-center py-4 text-muted">No student records found.</td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </Card.Body>
                        {totalPages > 1 && (
                          <Card.Footer className="bg-white border-top py-3 d-flex justify-content-center">
                            <Button 
                              variant="light" 
                              className="me-2" 
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                              <FaChevronLeft />
                            </Button>
                            <div className="d-flex align-items-center px-3 fw-medium">
                              {currentPage} / {totalPages}
                            </div>
                            <Button 
                              variant="light" 
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                              <FaChevronRight />
                            </Button>
                          </Card.Footer>
                        )}
                      </Card>
                    </>
                  )}
                </div>
              )}
            </Container>
          </div>
        </div>
      </div>

      {/* Overall Analysis Modal */}
      <Modal 
        show={showOverallAnalysisModal} 
        onHide={() => setShowOverallAnalysisModal(false)} 
        centered 
        size="lg"
        className="analysis-modal"
      >
        <style>
          {`
            @media print {
              body * { visibility: hidden; }
              .analysis-modal, .analysis-modal * { visibility: visible; }
              .analysis-modal { position: absolute; left: 0; top: 0; width: 100%; }
              .modal-header .btn-close, .modal-footer { display: none !important; }
              .modal-content { border: none !important; }
              .modal-body { padding: 0 !important; }
              .card { border: 1px solid #eee !important; box-shadow: none !important; }
              .recharts-responsive-container { min-height: 250px !important; }
            }
          `}
        </style>
        <Modal.Header closeButton className="bg-primary text-white border-0">
          <Modal.Title className="fs-5">Workshop Batch Analysis</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 print-analysis-area">
          <Row className="g-4 text-center">
            <Col md={4}>
              <div className="p-3 bg-light rounded shadow-sm h-100">
                <h3 className="text-primary fw-bold mb-1">{totalStudents}</h3>
                <small className="text-uppercase text-muted">Total Participated</small>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 bg-light rounded shadow-sm h-100">
                <h3 className="text-success fw-bold mb-1">{avgScore}</h3>
                <small className="text-uppercase text-muted">Average Marks Scored</small>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-3 bg-light rounded shadow-sm h-100">
                <h3 className="text-info fw-bold mb-1">{passRate}%</h3>
                <small className="text-uppercase text-muted">Total Pass Rate</small>
              </div>
            </Col>
          </Row>

          {/* Batch Visual Analysis */}
          <Row className="g-3 border-top pt-4 mt-3">
            <Col md={6} sm={6} className="print-col-6">
              <div className="text-center mb-3">
                <h6 className="fw-bold text-secondary">Pass/Fail Status</h6>
                <small className="text-muted">Proportion of passed vs failed students</small>
              </div>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={completionChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {completionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Col>
            <Col md={6} sm={6} className="print-col-6">
              <div className="text-center mb-3">
                <h6 className="fw-bold text-secondary">Score Performance Levels</h6>
                <small className="text-muted">Student performance based on accuracy</small>
              </div>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={performanceLevelsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {performanceLevelsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>

          <div className="mt-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2">Insights & Observations</h6>
            <ul className="text-secondary">
              <li className="mb-2">The highest score in this quiz is <strong>{sortedStudents[0]?.score || 0}</strong>.</li>
              <li className="mb-2">There are currently <strong>{analysisData?.batch_count || 0}</strong> batches that participated.</li>
              <li className="mb-2">Based on current trends, the average student is scoring approximately <strong>{((avgScore / totalQuestions) * 100).toFixed(1)}%</strong>.</li>
            </ul>
          </div>
          <div className="mt-3 bg-light p-3 rounded small text-muted">
            <FaInfoCircle className="me-2" />
            Note: Rankings are based on the scores fetched from the backend.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowOverallAnalysisModal(false)}>Close</Button>
          <Button variant="primary" onClick={() => { setTimeout(() => window.print(), 100); }}>
            <FaEdit className="me-1" /> Export Report
          </Button>
        </Modal.Footer>
      </Modal>

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
