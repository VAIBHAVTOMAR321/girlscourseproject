import React, { useState, useEffect } from 'react';
import '../../assets/css/GovtEmployee.css';
import { Container } from 'react-bootstrap';

function GovtEmployee() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Test state
  const [testStarted, setTestStarted] = useState(false);
  const [candidateId, setCandidateId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [showWrongAnswers, setShowWrongAnswers] = useState(false);
  const [resultError, setResultError] = useState('');

  // Timer effect
  useEffect(() => {
    if (!testStarted || testSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testSubmitted]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Validate phone number (Indian format - 10 digits)
  const validatePhoneNumber = (phoneNum) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNum);
  };

  // Handle starting test
  const handleStartTest = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!validatePhoneNumber(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        'https://brjobsedu.com/girls_course/girls_course_backend/api/workshop/start-test/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: name,
            phone: phone,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to start test');
      }

      const data = await response.json();

      if (data.success) {
        let shuffledQuestions = data.questions || [];
        // Shuffle the questions to ensure different order for each user
        for (let i = shuffledQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]]; // Swap elements
        }

        setCandidateId(data.candidate_id);
        // Use the shuffled questions
        setQuestions(shuffledQuestions);
        setTestStarted(true);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setTimeRemaining(300);
        setTestSubmitted(false);
        setError('');
      } else {
        setError('Failed to start test. Please try again.');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = (optionIndex) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionIndex,
    });
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  // Submit test
  const handleSubmitTest = async () => {
    if (window.confirm('Are you sure you want to submit the test?')) {
      setSubmittingTest(true);
      setResultError('');

      try {
        // Format answers for API
        const formattedAnswers = Object.entries(answers).map(([questionId, selectedIndex]) => ({
          question_id: parseInt(questionId),
          selected: selectedIndex,
        }));

        const response = await fetch(
          'https://brjobsedu.com/girls_course/girls_course_backend/api/workshop/submit-test/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              candidate_id: candidateId,
              answers: formattedAnswers,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to submit test');
        }

        const data = await response.json();

        if (data.success) {
          setTestResults(data);
          setTestSubmitted(true);
        } else {
          setResultError('Failed to submit test. Please try again.');
        }
      } catch (err) {
        setResultError('Error submitting test: ' + err.message);
      } finally {
        setSubmittingTest(false);
      }
    }
  };

  // Jump to specific question
  const handleJumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    window.scrollTo(0, 0);
  };

  if (testStarted && !testSubmitted) {
    const currentQuestion = questions[currentQuestionIndex];
    const isHindi = language === 'hi';
    const questionText = isHindi ? currentQuestion.question_text_hindi : currentQuestion.question_text;
    const options = isHindi ? currentQuestion.options_hindi : currentQuestion.options;
    const selectedAnswer = answers[currentQuestion.id];

    return (
      <Container className="test-container">
        <div className="test-header">
          <div className="test-info">
            <h2 className="test-title">Workshop Test</h2>
            <p className="candidate-info">Candidate ID: {candidateId}</p>
            <p className="candidate-name">Name: {name}</p>
          </div>
          <div className={`timer ${timeRemaining <= 60 ? 'timer-warning' : ''}`}>
            <div className="timer-icon">⏱️</div>
            <div className="time-left-rem">{formatTime(timeRemaining)}</div>
            <div className="timer-label">Time Left</div>
          </div>
          <button className="language-toggle" onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}>
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>
        </div>

        <div className="test-content">
          <div className="question-panel">
            <div className="question-header">
              <h3>Question {currentQuestionIndex + 1} of {questions.length}</h3>
              <span className="marks-badge">Marks: {currentQuestion.marks}</span>
            </div>

            <div className="question-text">
              <p>{questionText}</p>
            </div>

            <div className="options-container">
              {options.map((option, index) => (
                <label key={index} className={`option-label ${selectedAnswer === index ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={index}
                    checked={selectedAnswer === index}
                    onChange={() => handleAnswerSelect(index)}
                    className="option-input"
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>

            <div className="navigation-buttons">
              <button
                className="btn btn-secondary"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                ← Previous
              </button>
              <button
                className="btn btn-submit"
                onClick={handleSubmitTest}
                disabled={submittingTest}
              >
                {submittingTest ? 'Submitting...' : 'Submit Test'}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next →
              </button>
            </div>
          </div>

          <div className="question-navigator">
            <h4>Question Navigator</h4>
            <div className="question-grid">
              {questions.map((q, index) => (
                <button
                  key={index}
                  className={`question-number ${
                    index === currentQuestionIndex
                      ? 'active'
                      : answers[q.id] !== undefined
                      ? 'answered'
                      : 'unanswered'
                  }`}
                  onClick={() => handleJumpToQuestion(index)}
                  title={`Question ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="legend">
              <div className="legend-item">
                <span className="legend-dot answered"></span> Answered
              </div>
              <div className="legend-item">
                <span className="legend-dot unanswered"></span> Unanswered
              </div>
              <div className="legend-item">
                <span className="legend-dot active"></span> Current
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (testSubmitted && testResults) {
    const isHindi = language === 'hi';

    if (showWrongAnswers) {
      return (
        <div className="result-container">
          <div className="result-wrapper">
            <button
              className="btn-back"
              onClick={() => setShowWrongAnswers(false)}
            >
              ← Back to Results
            </button>

            <div className="wrong-answers-container">
              <div className="wrong-answers-header">
                <h2>Incorrect Answers</h2>
                <p className="wrong-count">
                  {testResults.wrong_answers} out of {testResults.attempted_questions} questions
                </p>
              </div>

              <div className="wrong-answers-list">
                {testResults.incorrect_answers.map((incorrectAnswer, index) => (
                  <div key={index} className="wrong-answer-card">
                    <div className="answer-number">Question {index + 1}</div>

                    <div className="question-display">
                      <p className="question-text">
                        {isHindi ? incorrectAnswer.question_hindi : incorrectAnswer.question}
                      </p>
                    </div>

                    <div className="answer-section">
                      <h4>Your Answer:</h4>
                      <div className="answer-box your-answer-wrong">
                        <span className="answer-label">✗</span>
                        <div>
                          <p className="answer-index">Option {incorrectAnswer.your_answer_index + 1}</p>
                          <p className="answer-value">
                            {isHindi
                              ? incorrectAnswer.options_hindi[incorrectAnswer.your_answer_index]
                              : incorrectAnswer.options[incorrectAnswer.your_answer_index]}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="answer-section">
                      <h4>Correct Answer:</h4>
                      <div className="answer-box correct-answer">
                        <span className="answer-label">✓</span>
                        <div>
                          <p className="answer-index">Option {incorrectAnswer.correct_answer_index + 1}</p>
                          <p className="answer-value">
                            {isHindi
                              ? incorrectAnswer.options_hindi[incorrectAnswer.correct_answer_index]
                              : incorrectAnswer.options[incorrectAnswer.correct_answer_index]}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="all-options">
                      <h4>All Options:</h4>
                      <div className="options-list">
                        {(isHindi ? incorrectAnswer.options_hindi : incorrectAnswer.options).map(
                          (option, idx) => (
                            <div
                              key={idx}
                              className={`option-row ${
                                idx === incorrectAnswer.your_answer_index
                                  ? 'your-choice'
                                  : idx === incorrectAnswer.correct_answer_index
                                  ? 'correct-choice'
                                  : ''
                              }`}
                            >
                              <span className="option-letter">{String.fromCharCode(65 + idx)}.</span>
                              <span className="option-text">{option}</span>
                              {idx === incorrectAnswer.your_answer_index && (
                                <span className="choice-badge wrong">Your Answer</span>
                              )}
                              {idx === incorrectAnswer.correct_answer_index && (
                                <span className="choice-badge correct">Correct</span>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="marks-display">
                      <span className="marks-label">Marks for this question:</span>
                      <span className="marks-value">0 / {incorrectAnswer.marks}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="action-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowWrongAnswers(false)}
                >
                  Back to Results
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="result-container">
        <div className="result-wrapper">
          <div className="result-header">
            <div className="result-title">
              <h1>Test Results</h1>
              <p className="subtitle">Workshop Test - Government Employee Program</p>
            </div>
            <button
              className="language-toggle-result"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            >
              {language === 'en' ? 'हिंदी' : 'English'}
            </button>
          </div>

          <div className="score-card">
            <div className="score-circle">
              <div className="percentage">{testResults.percentage.toFixed(1)}%</div>
              <div className="percentage-label">Score</div>
            </div>

            <div className="score-details">
              <div className="score-item">
                <div className="score-label">Total Marks</div>
                <div className="score-value">{testResults.total_marks}</div>
              </div>
              <div className="score-divider"></div>
              <div className="score-item">
                <div className="score-label">Your Score</div>
                <div className="score-value highlight">{testResults.score}</div>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <div className="stat-label">Attempted</div>
                <div className="stat-number">{testResults.attempted_questions}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✓</div>
              <div className="stat-content">
                <div className="stat-label">Correct</div>
                <div className="stat-number correct">{testResults.correct_answers}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✗</div>
              <div className="stat-content">
                <div className="stat-label">Incorrect</div>
                <div className="stat-number incorrect">{testResults.wrong_answers}</div>
              </div>
            </div>
          </div>

          <div className="candidate-info-card">
            <div className="info-row">
              <span className="info-label">Candidate ID:</span>
              <span className="info-value">{testResults.candidate_id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{name}</span>
            </div>
          </div>

          {resultError && <div className="error-message">{resultError}</div>}

          <div className="action-buttons">
            {testResults.wrong_answers > 0 && (
              <button
                className="btn btn-warning"
                onClick={() => setShowWrongAnswers(true)}
              >
                View Wrong Answers ({testResults.wrong_answers})
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={() => {
                setTestStarted(false);
                setName('');
                setPhone('');
                setLanguage('en');
                setTestSubmitted(false);
                setTestResults(null);
                setQuestions([]);
                setCandidateId('');
                setAnswers({});
                setShowWrongAnswers(false);
              }}
            >
              Take Another Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login Form
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Workshop Test Portal</h1>
          <p className="subtitle">Government Employee Training Program</p>
        </div>

        <form onSubmit={handleStartTest} className="login-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name <span className="required">*</span></label>
            <input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              maxLength="50"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number <span className="required">*</span></label>
            <input
              id="phone"
              type="tel"
              placeholder="Enter your 10-digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="form-input"
              maxLength="10"
            />
            <small className="form-hint">Format: XXXXXXXXXX (10 digits starting with 6-9)</small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? 'Starting Test...' : 'Start Test'}
          </button>

          <p className="form-info">
            ℹ️ A 10-minute timer will start once you begin the test.
          </p>
        </form>
      </div>
    </div>
  );
}

export default GovtEmployee;