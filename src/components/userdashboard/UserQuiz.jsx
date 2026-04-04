import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, ProgressBar } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import TransText from '../TransText'
import { FaArrowLeft, FaClock, FaQuestion, FaTrophy, FaCheckCircle, FaTimesCircle, FaChevronRight } from 'react-icons/fa'
import '../../assets/css/UserQuiz.css'
import { getTranslation } from '../../utils/translations'

const UserQuiz = () => {
  const { uniqueId, userRoleType, accessToken } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showOffcanvas, setShowOffcanvas] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Quiz taking state
  const [takingQuiz, setTakingQuiz] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(null)
  
  // Results state
  const [showResults, setShowResults] = useState(false)
  const [quizResults, setQuizResults] = useState(null)

  // Check mobile view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle responsive margin for mobile
  useEffect(() => {
    const contentArea = document.querySelector('.flex-grow-1')
    if (contentArea) {
      if (isMobile) {
        contentArea.style.marginLeft = '0px'
      } else {
        contentArea.style.marginLeft = '220px'
      }
    }
  }, [isMobile])

  // Fetch quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
        const response = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/quiz-items/', config)
        
        if (response.data.success) {
          setQuizzes(response.data.data || [])
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [accessToken])

  // Quiz timer
  useEffect(() => {
    if (!takingQuiz || !currentQuiz || timeRemaining === null) return

    if (timeRemaining === 0) {
      handleSubmitQuiz()
      return
    }

    const timer = setTimeout(() => {
      setTimeRemaining(timeRemaining - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeRemaining, takingQuiz])

  const handleMenuToggle = () => {
    setShowOffcanvas(!showOffcanvas)
  }

  const startQuiz = (quiz) => {
    // Check if quiz is available
    const now = new Date()
    const startTime = new Date(quiz.start_date_time)
    const endTime = new Date(quiz.end_date_time)

    if (now < startTime) {
      alert(`${getTranslation('quiz.quizStartsSoon', language)} ${startTime.toLocaleDateString()}`)
      return
    }

    if (now > endTime) {
      alert(getTranslation('quiz.quizEnded', language))
      return
    }

    // Initialize quiz
    setCurrentQuiz(quiz)
    setTakingQuiz(true)
    setCurrentQuestionIndex(0)
    setAnswers({})
    
    // Calculate duration in seconds
    const duration = (endTime.getTime() - now.getTime()) / 1000
    setTimeRemaining(Math.max(60, Math.min(duration, 3600))) // Between 1 min and 1 hour
  }

  const getCurrentQuestion = () => {
    if (!currentQuiz || !currentQuiz.questions) return null
    return currentQuiz.questions[currentQuestionIndex]
  }

  const handleAnswerSelect = (optionIndex) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: optionIndex
    })
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitQuiz = () => {
    // Check if all questions are answered
    if (Object.keys(answers).length !== currentQuiz.questions.length) {
      alert(getTranslation('quiz.answerAll', language))
      return
    }

    confirmSubmitQuiz()
  }

  const confirmSubmitQuiz = () => {
    // Calculate score
    let correctCount = 0
    let totalMarks = 0

    currentQuiz.questions.forEach((question, index) => {
      const userAnswer = answers[index]
      if (userAnswer === question.correct_answer) {
        correctCount++
        totalMarks += question.marks || 1
      }
    })

    const totalQuestions = currentQuiz.questions.length
    const wrongCount = totalQuestions - correctCount
    const percentage = (correctCount / totalQuestions) * 100

    setQuizResults({
      quizTitle: currentQuiz.title,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      totalQuestions,
      score: totalMarks,
      percentage: percentage.toFixed(2)
    })

    setShowResults(true)
    setTakingQuiz(false)
  }

  const handleRetakeQuiz = () => {
    setShowResults(false)
    setQuizResults(null)
    startQuiz(currentQuiz)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = getCurrentQuestion()

  return (
    <div className="d-flex flex-column">
      <UserTopNav onMenuToggle={handleMenuToggle} isMobile={isMobile} />
      <div className="d-flex flex-1">
        <UseLeftNav 
          showOffcanvas={showOffcanvas} 
          setShowOffcanvas={setShowOffcanvas} 
        />
        
        <div className="flex-grow-1" style={{ marginLeft: isMobile ? '0px' : '220px', padding: isMobile ? '10px' : '20px', minHeight: 'calc(100vh - 70px)' }}>
          <Container fluid>
            {!takingQuiz && !showResults ? (
              <>
                {/* Quiz List View */}
                <div className="mb-4">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate('/UserDashboard')} 
                    className="d-flex align-items-center"
                  >
                    <FaArrowLeft className="me-2" />
                    <TransText k="quiz.backToDashboard" as="span" />
                  </Button>
                </div>

                <h3 className="mb-4">
                  <TransText k="quiz.title" as="span" />
                </h3>

                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" style={{ width: '60px', height: '60px' }} />
                    <p className="mt-3"><TransText k="quiz.loading" as="span" /></p>
                  </div>
                ) : quizzes.length > 0 ? (
                  <Row>
                    {quizzes.map((quiz) => {
                      const startTime = new Date(quiz.start_date_time)
                      const endTime = new Date(quiz.end_date_time)
                      const now = new Date()
                      const isAvailable = now >= startTime && now <= endTime

                      return (
                        <Col md={6} lg={4} key={quiz.id} className="mb-4">
                          <Card className={`h-100 quiz-card shadow-sm ${!isAvailable ? 'disabled' : ''}`} style={{ borderRadius: '12px', cursor: isAvailable ? 'pointer' : 'default' }}>
                            <Card.Body className="d-flex flex-column">
                              <div className="mb-3">
                                <h5 className="mb-2">{quiz.title}</h5>
                                <p className="text-muted small mb-2">{quiz.description}</p>
                              </div>

                              <div className="mb-3">
                                <div className="d-flex justify-content-between mb-2">
                                  <small className="text-muted">
                                    <FaQuestion className="me-1" />
                                    <TransText k="quiz.questions" as="span" />: {quiz.number_of_questions}
                                  </small>
                                  <Badge bg="info">{quiz.quiz_category}</Badge>
                                </div>
                                <small className="text-muted d-block mb-1">
                                  <TransText k="quiz.startTime" as="span" />: {startTime.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}{' '}
                                  {startTime.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </small>
                                <small className="text-muted d-block">
                                  <TransText k="quiz.endTime" as="span" />: {endTime.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}{' '}
                                  {endTime.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </small>
                              </div>

                              <div className="mt-auto">
                                <Button
                                  variant={isAvailable ? 'primary' : 'secondary'}
                                  className="w-100"
                                  onClick={() => isAvailable && startQuiz(quiz)}
                                  disabled={!isAvailable}
                                >
                                  {isAvailable ? (
                                    <>
                                      <TransText k="quiz.startQuiz" as="span" />
                                      <FaChevronRight className="ms-2" />
                                    </>
                                  ) : (
                                    <TransText k="quiz.quizNotAvailable" as="span" />
                                  )}
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      )
                    })}
                  </Row>
                ) : (
                  <Alert variant="info" className="text-center">
                    <TransText k="quiz.noQuizzesAvailable" as="span" />
                  </Alert>
                )}
              </>
            ) : showResults ? (
              <>
                {/* Results View */}
                <div className="text-center py-5">
                  <div className="mb-4">
                    <FaTrophy className="text-warning" style={{ fontSize: '60px' }} />
                  </div>
                  <h3 className="mb-2">
                    <TransText k="quiz.congratulations" as="span" />
                  </h3>
                  <p className="text-muted mb-4">
                    <TransText k="quiz.greatJob" as="span" /> {quizResults.score}/{quizResults.totalQuestions * (quizResults.totalQuestions / quizResults.totalQuestions)}
                  </p>

                  <Card className="shadow-sm mb-4" style={{ borderRadius: '12px', maxWidth: '500px', margin: '0 auto' }}>
                    <Card.Body>
                      <Row className="mb-4">
                        <Col md={6} className="mb-3">
                          <div className="result-item">
                            <h5 className="text-primary mb-2">{quizResults.correctAnswers}</h5>
                            <small className="text-muted">
                              <FaCheckCircle className="me-1 text-success" />
                              <TransText k="quiz.correctAnswers" as="span" />
                            </small>
                          </div>
                        </Col>
                        <Col md={6} className="mb-3">
                          <div className="result-item">
                            <h5 className="text-danger mb-2">{quizResults.wrongAnswers}</h5>
                            <small className="text-muted">
                              <FaTimesCircle className="me-1 text-danger" />
                              <TransText k="quiz.wrongAnswers" as="span" />
                            </small>
                          </div>
                        </Col>
                      </Row>

                      <div className="mb-3">
                        <small className="text-muted">
                          <TransText k="quiz.percentage" as="span" />
                        </small>
                        <h4 className="mb-2" style={{ color: quizResults.percentage >= 60 ? '#28a745' : '#dc3545' }}>
                          {quizResults.percentage}%
                        </h4>
                        <ProgressBar 
                          now={quizResults.percentage} 
                          variant={quizResults.percentage >= 60 ? 'success' : 'danger'}
                          label={`${quizResults.percentage}%`}
                        />
                      </div>
                    </Card.Body>
                  </Card>

                  <div className="d-flex gap-2 justify-content-center">
                    <Button 
                      variant="primary" 
                      onClick={handleRetakeQuiz}
                      className="d-flex align-items-center"
                    >
                      <TransText k="quiz.retakeQuiz" as="span" />
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => {
                        setShowResults(false)
                        setCurrentQuiz(null)
                        setQuizResults(null)
                      }}
                      className="d-flex align-items-center"
                    >
                      <TransText k="quiz.backToQuizzes" as="span" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Quiz Taking View */}
                <div className="quiz-taking-container">
                  <div className="quiz-header mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4 className="mb-0">{currentQuiz.title}</h4>
                      <div className="timer" style={{ fontSize: '24px', fontWeight: 'bold', color: timeRemaining < 60 ? '#dc3545' : '#007bff' }}>
                        <FaClock className="me-2" />
                        {formatTime(timeRemaining)}
                      </div>
                    </div>
                    <ProgressBar 
                      now={((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100} 
                      label={`${currentQuestionIndex + 1} / ${currentQuiz.questions.length}`}
                    />
                  </div>

                  {currentQuestion && (
                    <Card className="shadow-sm mb-4" style={{ borderRadius: '12px' }}>
                      <Card.Body>
                        <div className="mb-4">
                          <h5 className="mb-3">
                            <TransText k="quiz.question" as="span" /> {currentQuestionIndex + 1} <TransText k="quiz.of" as="span" /> {currentQuiz.questions.length}
                          </h5>
                          <h6 className="mb-3">
                            {language === 'hi' && currentQuestion.question_text_hindi 
                              ? currentQuestion.question_text_hindi 
                              : currentQuestion.question_text}
                          </h6>
                        </div>

                        <div className="options mb-4">
                          {(language === 'hi' && currentQuestion.options_hindi ? currentQuestion.options_hindi : currentQuestion.options).map((option, idx) => {
                            const isSelected = answers[currentQuestionIndex] === idx
                            return (
                              <div key={idx} className="mb-2">
                                <Button 
                                  variant={isSelected ? 'primary' : 'outline-primary'}
                                  className="w-100 text-start option-button"
                                  onClick={() => handleAnswerSelect(idx)}
                                  style={isSelected ? { 
                                    backgroundColor: '#0d6efd',
                                    borderColor: '#0d6efd',
                                    boxShadow: '0 0 0 3px rgba(13, 110, 253, 0.25)',
                                    fontWeight: '600'
                                  } : {
                                    borderWidth: '2px'
                                  }}
                                >
                                  <span className="option-letter me-2">{String.fromCharCode(65 + idx)}</span>
                                  {option}
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  <div className="d-flex justify-content-between gap-2 mb-4 mt-3">
                    <Button 
                      variant="outline-secondary" 
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      <TransText k="quiz.previous" as="span" />
                    </Button>
                    
                    {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
                      <Button 
                        variant="primary" 
                        onClick={handleNextQuestion}
                      >
                        <TransText k="quiz.next" as="span" />
                      </Button>
                    ) : (
                      <Button 
                        variant="success" 
                        onClick={handleSubmitQuiz}
                      >
                        <TransText k="quiz.submit" as="span" />
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </Container>
        </div>
      </div>

   
    </div>
  )
}

export default UserQuiz
