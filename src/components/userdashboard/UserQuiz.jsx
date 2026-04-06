import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, ProgressBar, Modal } from 'react-bootstrap'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNavigate } from 'react-router-dom'
import UserTopNav from './UserTopNav'
import UseLeftNav from './UseLeftNav'
import TransText from '../TransText'
import { FaArrowLeft, FaClock, FaQuestion, FaTrophy, FaCheckCircle, FaTimesCircle, FaChevronRight, FaMedal } from 'react-icons/fa'
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
  const [participatedQuizzes, setParticipatedQuizzes] = useState({})
  const [quizRanks, setQuizRanks] = useState({})
  const [showRankModal, setShowRankModal] = useState(false)
  const [selectedQuizRank, setSelectedQuizRank] = useState(null)
  
  // Quiz taking state
  const [takingQuiz, setTakingQuiz] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [attemptId, setAttemptId] = useState(null)
  
  // Results state
  const [showResults, setShowResults] = useState(false)
  const [quizResults, setQuizResults] = useState(null)
  const [showWrongAnswersModal, setShowWrongAnswersModal] = useState(false)
  const [wrongAnswers, setWrongAnswers] = useState([])

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
        alert('Failed to load quizzes. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    const fetchParticipatedQuizzes = async () => {
      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
        const response = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/quiz-participants/', config)
        
        if (response.data.status && response.data.data) {
          const participated = {}
          const ranks = {}
          
          response.data.data.forEach(participant => {
            if (participant.student?.student_id === uniqueId) {
              participated[participant.quiz_id] = true
              
              if (participant.attempt?.rank) {
                if (!ranks[participant.quiz_id]) {
                  ranks[participant.quiz_id] = {
                    userRank: participant.attempt.rank,
                    userScore: participant.attempt.score,
                    totalParticipants: 0,
                    topThree: []
                  }
                }
              }
            }
          })
          setParticipatedQuizzes(participated)
          setQuizRanks(ranks)
          
          const quizIds = [...new Set(response.data.data.map(p => p.quiz_id))]
          const rankPromises = quizIds.map(async (quizId) => {
            try {
              const rankResponse = await axios.get(
                `https://brjobsedu.com/girls_course/girls_course_backend/api/quiz-participants/?quiz_id=${quizId}`,
                config
              )
              if (rankResponse.data.status && rankResponse.data.data) {
                const participants = rankResponse.data.data
                const sorted = participants
                  .filter(p => p.attempt?.rank)
                  .sort((a, b) => a.attempt.rank - b.attempt.rank)
                  .slice(0, 3)
                
                setQuizRanks(prev => ({
                  ...prev,
                  [quizId]: {
                    ...prev[quizId],
                    totalParticipants: participants.length,
                    topThree: sorted.map(p => ({
                      student_id: p.student?.student_id,
                      full_name: p.student?.full_name,
                      rank: p.attempt?.rank,
                      score: p.attempt?.score,
                      status: p.attempt?.status
                    }))
                  }
                }))
              }
            } catch (err) {
              console.error('Error fetching rank for quiz', quizId, err)
            }
          })
          await Promise.all(rankPromises)
        }
      } catch (error) {
        console.error('Error fetching participated quizzes:', error)
      }
    }

    fetchQuizzes()
    fetchParticipatedQuizzes()
  }, [accessToken, uniqueId])

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

  // Format date as dd/mm/yy
  const formatDateDDMMYY = (date) => {
    const d = String(date.getDate()).padStart(2, '0')
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const y = String(date.getFullYear()).slice(-2)
    return `${d}/${m}/${y}`
  }

  const startQuiz = async (quiz) => {
    try {
      // Register as quiz participant and fetch questions
      const participantData = {
        quiz_id: quiz.quiz_id,
        student_id: uniqueId
      }

      console.log('Registering quiz participant:', participantData)

      const participantResponse = await axios.post(
        'https://brjobsedu.com/girls_course/girls_course_backend/api/quiz-participants/',
        participantData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Quiz participant response:', participantResponse.data)
      const responseData = participantResponse.data

      // Validate response
      if (!responseData.status) {
        if (responseData.message && responseData.message.toLowerCase().includes('already')) {
          alert('Already participated.')
        } else {
          alert(responseData.message || 'Failed to start quiz. Please try again.')
        }
        return
      }

      // Extract data from response
      const now = new Date()
      const endTime = new Date(quiz.end_date_time)

      const quizData = {
        id: quiz.quiz_id,
        quiz_id: quiz.quiz_id,
        title: quiz.title,
        description: quiz.description,
        start_date_time: quiz.start_date_time,
        end_date_time: quiz.end_date_time,
        questions: responseData.questions || [],
        total_questions: responseData.total_questions || (responseData.questions ? responseData.questions.length : 0),
        attempt_id: responseData.attempt_id
      }

      console.log('Quiz data loaded:', {
        quiz_id: quizData.quiz_id,
        student_id: uniqueId,
        attempt_id: quizData.attempt_id,
        total_questions: quizData.total_questions,
        questions_received: quizData.questions.length
      })

      // Store attempt ID for submission
      setAttemptId(responseData.attempt_id)

      // Initialize quiz with data from API response
      setCurrentQuiz(quizData)
      setTakingQuiz(true)
      setCurrentQuestionIndex(0)
      setAnswers({})

      // Calculate duration in seconds
      const duration = (endTime.getTime() - now.getTime()) / 1000
      setTimeRemaining(Math.max(60, Math.min(duration, 3600))) // Between 1 min and 1 hour
    } catch (error) {
      console.error('Error starting quiz:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message
      
      if (error.response?.status === 404) {
        alert('Quiz endpoint not found. ' + errorMessage)
      } else if (error.response?.status === 401) {
        alert('Unauthorized. ' + errorMessage)
      } else if (error.response?.status === 400) {
        alert(errorMessage)
      } else if (error.response?.status === 403) {
        alert('Access denied. ' + errorMessage)
      } else if (error.response?.status === 500) {
        alert('Server error. ' + errorMessage)
      } else {
        alert(errorMessage || 'Failed to start quiz. Please try again.')
      }
      return
    }
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
    console.log('Next clicked, current index:', currentQuestionIndex)
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      const newIndex = currentQuestionIndex + 1
      console.log('Moving to index:', newIndex)
      setCurrentQuestionIndex(newIndex)
    }
  }

  const handlePreviousQuestion = () => {
    console.log('Previous clicked, current index:', currentQuestionIndex)
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1
      console.log('Moving to index:', newIndex)
      setCurrentQuestionIndex(newIndex)
    }
  }

  const handleSubmitQuiz = () => {
    console.log('Submit quiz clicked, answers:', answers)
    // Check if all questions are answered
    if (Object.keys(answers).length !== currentQuiz.questions.length) {
      alert(getTranslation('quiz.answerAll', language))
      return
    }

    confirmSubmitQuiz()
  }

  const confirmSubmitQuiz = async () => {
    try {
      // Prepare submission payload as per required format
      const submissionData = {
        student_id: uniqueId,
        quiz_id: currentQuiz.quiz_id,
        answers: Object.keys(answers).map(index => ({
          question_id: currentQuiz.questions[parseInt(index)].id,
          selected_option: answers[index]
        }))
      }

      console.log('Submitting quiz:', submissionData)

      // Submit quiz to backend
      const submitResponse = await axios.post(
        'https://brjobsedu.com/girls_course/girls_course_backend/api/submit-quiz/',
        submissionData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const responseData = submitResponse.data
      console.log('Submit quiz response:', responseData)

      // Handle server response for scoring
      let correctCount = responseData.correct_answers || 0
      let totalQuestions = responseData.total_questions || currentQuiz.total_questions
      let serverScore = responseData.score !== undefined ? responseData.score : correctCount
      let serverPercentage = responseData.percentage || ((correctCount / totalQuestions) * 100).toFixed(2)

      // Collect wrong answers
      let wrongAnswersArray = []
      if (!responseData.correct_answers) {
        currentQuiz.questions.forEach((question, index) => {
          if (answers[index] !== question.correct_answer) {
            wrongAnswersArray.push({
              questionIndex: index,
              question_text: question.question_text,
              question_text_hindi: question.question_text_hindi,
              options: question.options,
              options_hindi: question.options_hindi,
              userAnswer: answers[index],
              correctAnswer: question.correct_answer
            })
          }
        })
        totalQuestions = currentQuiz.questions.length
        serverScore = correctCount
        serverPercentage = ((correctCount / totalQuestions) * 100).toFixed(2)
      }

      setQuizResults({
        quizTitle: currentQuiz.title,
        correctAnswers: correctCount,
        wrongAnswers: totalQuestions - correctCount,
        totalQuestions,
        score: serverScore,
        totalMarks: totalQuestions,
        percentage: serverPercentage,
        status: correctCount >= (totalQuestions * 0.6) ? 'passed' : 'failed'
      })

      // Store wrong answers for potential viewing
      if (wrongAnswersArray.length > 0) {
        setWrongAnswers(wrongAnswersArray)
      }

      setShowResults(true)
      setTakingQuiz(false)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message
      
      if (error.response?.status === 401) {
        alert('Unauthorized. ' + errorMessage)
      } else if (error.response?.status === 400) {
        alert(errorMessage)
      } else if (error.response?.status === 404) {
        alert('Endpoint not found. ' + errorMessage)
      } else if (error.response?.status === 500) {
        alert('Server error. ' + errorMessage)
      } else {
        alert(errorMessage || 'Failed to submit quiz. Please try again.')
      }
    }
  }

  const handleRetakeQuiz = () => {
    setShowResults(false)
    setQuizResults(null)
    setAnswers({})
    // Call startQuiz with original quiz object from state
    const originalQuiz = quizzes.find(q => q.quiz_id === currentQuiz.quiz_id)
    if (originalQuiz) {
      startQuiz(originalQuiz)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = getCurrentQuestion()

  // Wrong Answers Modal Component
  const WrongAnswersModal = () => (
    <Modal show={showWrongAnswersModal} onHide={() => setShowWrongAnswersModal(false)} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Wrong Answers Review</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {wrongAnswers.length > 0 ? (
          wrongAnswers.map((wrongAnswer, idx) => (
            <Card key={idx} className="mb-3" style={{ borderLeft: '4px solid #dc3545' }}>
              <Card.Body>
                <h6 style={{ color: '#dc3545', fontWeight: 'bold' }}>
                  Question {wrongAnswer.questionIndex + 1}
                </h6>
                <p className="mb-2">
                  <strong>
                    {language === 'hi' && wrongAnswer.question_text_hindi
                      ? wrongAnswer.question_text_hindi
                      : wrongAnswer.question_text}
                  </strong>
                </p>
                
                <div className="mb-2">
                  <small style={{ color: '#6c757d' }}>Your Answer:</small>
                  <p style={{ 
                    backgroundColor: '#f8d7da', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    marginBottom: '8px',
                    color: '#721c24'
                  }}>
                    <strong>
                      {String.fromCharCode(65 + wrongAnswer.userAnswer)}.{' '}
                      {language === 'hi' && wrongAnswer.options_hindi
                        ? wrongAnswer.options_hindi[wrongAnswer.userAnswer]
                        : wrongAnswer.options[wrongAnswer.userAnswer]}
                    </strong>
                  </p>
                </div>

                <div>
                  <small style={{ color: '#6c757d' }}>Correct Answer:</small>
                  <p style={{ 
                    backgroundColor: '#d4edda', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    color: '#155724'
                  }}>
                    <strong>
                      {String.fromCharCode(65 + wrongAnswer.correctAnswer)}.{' '}
                      {language === 'hi' && wrongAnswer.options_hindi
                        ? wrongAnswer.options_hindi[wrongAnswer.correctAnswer]
                        : wrongAnswer.options[wrongAnswer.correctAnswer]}
                    </strong>
                  </p>
                </div>
              </Card.Body>
            </Card>
          ))
        ) : (
          <Alert variant="success">All answers are correct!</Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowWrongAnswersModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )

  // Rank Modal Component
  const RankModal = () => (
    <Modal show={showRankModal} onHide={() => setShowRankModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaMedal className="me-2 text-warning" />
          Quiz Rankings
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedQuizRank && (
          <>
            {selectedQuizRank.userRank && (
              <div className="mb-4 p-3 bg-primary text-white rounded" style={{ backgroundColor: '#0d6efd' }}>
                <div className="text-center">
                  <h5 className="mb-1">Your Rank</h5>
                  <h2 className="mb-0">#{selectedQuizRank.userRank}</h2>
                  <small>Score: {selectedQuizRank.userScore}</small>
                </div>
              </div>
            )}
            
            {selectedQuizRank.topThree && selectedQuizRank.topThree.length > 0 && (
              <>
                <h6 className="mb-3">Top 3 Participants</h6>
                {selectedQuizRank.topThree
                  .filter(p => p.rank >= 1 && p.rank <= 3)
                  .map((participant, idx) => {
                  const isUser = participant.student_id === uniqueId
                  const medalColor = participant.rank === 1 ? '#FFD700' : participant.rank === 2 ? '#C0C0C0' : '#CD7F32'
                  return (
                    <div 
                      key={idx} 
                      className={`d-flex align-items-center p-3 mb-2 rounded ${isUser ? 'bg-info bg-opacity-10' : 'bg-light'}`}
                      style={{ borderLeft: `4px solid ${medalColor}` }}
                    >
                      <div className="me-3" style={{ width: '30px', textAlign: 'center', fontSize: '20px' }}>
                        {participant.rank === 1 ? '🥇' : participant.rank === 2 ? '🥈' : '🥉'}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-bold">
                          {participant.full_name}
                          {isUser && <Badge bg="primary" className="ms-2">You</Badge>}
                        </div>
                        <small className="text-muted">{participant.student_id}</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">Score: {participant.score}</div>
                        <small className={participant.status === 'passed' ? 'text-success' : 'text-danger'}>
                          {participant.status === 'passed' ? 'Passed' : 'Failed'}
                        </small>
                      </div>
                    </div>
                  )
                })}
                
                {selectedQuizRank.userRank && selectedQuizRank.userRank > 3 && (
                  <div className="mt-3 p-3 bg-light rounded text-center">
                    <small className="text-muted">Your rank is #{selectedQuizRank.userRank}, not in top 3</small>
                  </div>
                )}
              </>
            )}
            
            {selectedQuizRank.totalParticipants && (
              <div className="text-center mt-3 text-muted">
                <small>Total Participants: {selectedQuizRank.totalParticipants}</small>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowRankModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )

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

                      return (
                        <Col md={6} lg={4} key={quiz.quiz_id} className="mb-4">
                          <Card className="h-100 quiz-card shadow-sm" style={{ borderRadius: '12px', cursor: 'pointer' }}>
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
                                  <TransText k="quiz.startTime" as="span" />: {formatDateDDMMYY(startTime)}{' '}
                                  {startTime.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </small>
                                <small className="text-muted d-block">
                                  <TransText k="quiz.endTime" as="span" />: {formatDateDDMMYY(endTime)}{' '}
                                  {endTime.toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </small>
                              </div>

                              <div className="mt-auto">
                                {participatedQuizzes[quiz.quiz_id] ? (
                                  <div className="d-flex flex-column gap-2">
                                    {quizRanks[quiz.quiz_id]?.userRank && (
                                      <div className="text-center mb-2">
                                        <Badge bg="warning" className="py-2 px-3">
                                          <FaMedal className="me-1" />
                                          Rank #{quizRanks[quiz.quiz_id].userRank}
                                        </Badge>
                                      </div>
                                    )}
                                    {quizRanks[quiz.quiz_id]?.userScore !== undefined && (
                                      <div className="text-center">
                                        <Badge bg="success" className="py-2 px-3">
                                          Score: {quizRanks[quiz.quiz_id].userScore}
                                        </Badge>
                                      </div>
                                    )}
                                    <Button
                                      variant="info"
                                      className="w-100"
                                      onClick={() => {
                                        setSelectedQuizRank({ quizId: quiz.quiz_id, ...quizRanks[quiz.quiz_id] })
                                        setShowRankModal(true)
                                      }}
                                    >
                                      <TransText k="quiz.viewRank" as="span" />
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      className="w-100"
                                      disabled
                                    >
                                      <TransText k="quiz.alreadyAttempted" as="span" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="primary"
                                    className="w-100"
                                    onClick={() => startQuiz(quiz)}
                                  >
                                    <>
                                      <TransText k="quiz.startQuiz" as="span" />
                                      <FaChevronRight className="ms-2" />
                                    </>
                                  </Button>
                                )}
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
                    <TransText k="quiz.greatJob" as="span" /> {quizResults.score}/{quizResults.totalMarks || quizResults.totalQuestions}
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

                   <div className="d-flex gap-2 justify-content-center mt-3 flex-wrap">
                     <Button
                       variant="primary"
                       onClick={handleRetakeQuiz}
                       className="d-flex align-items-center"
                     >
                       <TransText k="quiz.retakeQuiz" as="span" />
                     </Button>
                     {wrongAnswers.length > 0 && (
                       <Button
                         variant="warning"
                         onClick={() => setShowWrongAnswersModal(true)}
                         className="d-flex align-items-center"
                       >
                         <FaTimesCircle className="me-2" />
                         <TransText k="quiz.viewWrongAnswers" as="span" />
                       </Button>
                     )}
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

                  <div className="d-flex justify-content-between gap-3 mb-4 mt-3">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => {
                        console.log('Button clicked')
                        handlePreviousQuestion()
                      }}
                      disabled={currentQuestionIndex === 0}
                      style={{ 
                        minWidth: '120px', 
                        fontWeight: '600', 
                        padding: '12px 24px',
                        cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      <TransText k="quiz.previous" as="span" />
                    </Button>
                    
                    <div style={{ flex: 1 }} />
                    
                    {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
                      <Button 
                        variant="primary" 
                        onClick={() => {
                          console.log('Next clicked')
                          handleNextQuestion()
                        }}
                        style={{ 
                          minWidth: '120px', 
                          fontWeight: '600', 
                          padding: '12px 24px',
                          fontSize: '16px'
                        }}
                      >
                        <TransText k="quiz.next" as="span" />
                      </Button>
                    ) : (
                      <Button 
                        variant="success" 
                        onClick={() => {
                          console.log('Submit clicked')
                          handleSubmitQuiz()
                        }}
                        style={{ 
                          minWidth: '120px', 
                          fontWeight: '600', 
                          padding: '12px 24px',
                          fontSize: '16px'
                        }}
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

      <WrongAnswersModal />
      <RankModal />
    </div>
  )
}

export default UserQuiz
