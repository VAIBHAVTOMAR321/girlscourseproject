import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBook, FaLaptopCode, FaBullhorn, FaQuestionCircle, FaShieldAlt, FaLightbulb, FaUserTie, FaDollarSign, FaChalkboardTeacher, FaHandsHelping, FaUserGraduate, FaUserCheck, FaRocket, FaAward, FaChevronLeft, FaChevronRight, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import digitalBetiLogo from '../../assets/digital_saksham_banner.jpeg';
import proBar from '../../assets/pro_bar.jpeg';
import institutionImg from '../../assets/ins_img.jpeg';
import '../../assets/css/Home.css';
import Gallery from './Gallery.jsx';
import HeroGalleryCarousel from './HeroGalleryCarousel.jsx';

const heroIllustration = digitalBetiLogo;
const adminPreview = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop';
const institutionPreview = institutionImg;
const API_URL = 'https://brjobsedu.com/girls_course/girls_course_backend/api/meet-our-learner/';
const TOP_STUDENTS_API = 'https://brjobsedu.com/girls_course/girls_course_backend/api/course-batch-top-students/';
const BASE_URL = 'https://brjobsedu.com/girls_course/girls_course_backend';

const getLearnerImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/media')) return BASE_URL + img;
  return img;
};

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  const [stats, setStats] = useState({
    students_enrolled: '0',
    courses_available: '0',
    certificates_issued: '0'
  });
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [learners, setLearners] = useState([]);
  const [learnersLoading, setLearnersLoading] = useState(true);
  const [topStudentsData, setTopStudentsData] = useState([]);
  const [topStudentsLoading, setTopStudentsLoading] = useState(true);

  const handleCardClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/login');
  };

  const handleImageClick = (e, imageSrc) => {
    e.stopPropagation();
    setSelectedImage(imageSrc);
  };

  const goToSlide = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    if (index < 0) {
      setCurrentSlide(studentSlides.length - 1);
    } else if (index >= studentSlides.length) {
      setCurrentSlide(0);
    } else {
      setCurrentSlide(index);
    }
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const nextSlide = () => {
    goToSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    goToSlide(currentSlide - 1);
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 4000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [currentSlide]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, [featuredCourses, learners, learnersLoading]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/home-count/');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching home page stats:", error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const response = await axios.get('https://brjobsedu.com/girls_course/girls_course_backend/api/courses-home/');
        if (response.data.success) {
          const iconMap = {
            'AI Tools': <FaLaptopCode />,
            'Digital Marketing': <FaBullhorn />,
            'Computer Basics': <FaLaptopCode />,
            'Financial Literacy': <FaDollarSign />,
            'Communication Skills': <FaLightbulb />,
            'Entrepreneurship': <FaUserTie />,
            'Career Readiness': <FaBook />,
            'Cyber Security': <FaShieldAlt />,
            'Personality Development': <FaUserGraduate />,
            'Computer Learning with AI Tools': <FaLaptopCode />,
          };
          const coursesWithIcons = response.data.data.map(course => ({
            id: course.id,
            name: course.course_name,
            intro: course.cour_desc ? course.cour_desc : `Learn about ${course.course_name}.`,
            icon: iconMap[course.course_name] || <FaBook />
          }));
          setFeaturedCourses(coursesWithIcons);
        } else {
          console.error("Failed to fetch courses:", response.data.message || "API returned success: false");
        }
      } catch (error) {
        console.error("An error occurred while fetching featured courses:", error);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchLearners = async () => {
      setLearnersLoading(true);
      try {
        const response = await axios.get(API_URL);
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setLearners(response.data.data);
        } else {
          setLearners([]);
        }
      } catch (error) {
        console.error('Error fetching learners for home carousel:', error);
        setLearners([]);
      } finally {
        setLearnersLoading(false);
      }
    };

    fetchLearners();
  }, []);

  useEffect(() => {
    const fetchTopStudents = async () => {
      setTopStudentsLoading(true);
      try {
        const response = await axios.get(TOP_STUDENTS_API);
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setTopStudentsData(response.data.data);
        } else {
          setTopStudentsData([]);
        }
      } catch (error) {
        console.error('Error fetching top students:', error);
        setTopStudentsData([]);
      } finally {
        setTopStudentsLoading(false);
      }
    };

    fetchTopStudents();
  }, []);

  const studentSlides = useMemo(() => {
    const slides = [];
    const learnersPerSlide = 4;
    for (let i = 0; i < learners.length; i += learnersPerSlide) {
      slides.push(learners.slice(i, i + learnersPerSlide));
    }
    return slides.length > 0 ? slides : [[]];
  }, [learners]);

  const aboutCards = [
    { title: 'Digital Literacy', text: 'Providing foundational to advanced digital skills for all.', icon: <FaLaptopCode /> },
    { title: 'Employability', text: 'Enhancing job prospects with industry-relevant courses.', icon: <FaUserTie /> },
    { title: 'Women Empowerment', text: 'Fostering independence and confidence through education.', icon: <FaHandsHelping /> },
    { title: 'Career Readiness', text: 'Preparing students for the professional world with practical skills.', icon: <FaUserGraduate /> }
  ];

  const timelineItems = [
    { title: '1. Register', text: 'Create your account and enroll in a course.', icon: <FaUserCheck /> },
    { title: '2. Learn', text: 'Access high-quality video lessons and materials.', icon: <FaChalkboardTeacher /> },
    { title: '3. Practice', text: 'Apply your knowledge with hands-on exercises.', icon: <FaRocket /> },
    { title: '4. Quiz', text: 'Test your understanding with interactive quizzes.', icon: <FaQuestionCircle /> },
    { title: '5. Certificate', text: 'Receive your digital certificate upon completion.', icon: <FaAward /> }
  ];

  return (
    <div className="home-page">
      <main>
        {/* 1. Hero Section */}
        <section className="hero-section">
          <HeroGalleryCarousel />
        </section>

        {/* Student Carousel Section */}
        <section className="student-carousel-section">
          <div className="container">
            <h2 className="section-title animate-on-scroll">Meet Our Learners</h2>
            <p className="section-subtitle animate-on-scroll">Thousands of girls across Uttarakhand are transforming their futures with Digital Saksham Beti</p>
            <div
              className="carousel-wrapper"
              ref={carouselRef}
              onMouseEnter={stopAutoPlay}
              onMouseLeave={startAutoPlay}
            >
              <button
                className="carousel-arrow carousel-arrow-prev"
                onClick={prevSlide}
                aria-label="Previous slide"
                type="button"
              >
                <FaChevronLeft />
              </button>

              <div className="carousel-viewport">
                <div
                  className="carousel-track"
                  style={{
                    transform: `translateX(-${currentSlide * 100}%)`
                  }}
                >
                  {studentSlides.map((slide, slideIndex) => (
                    <div className="carousel-slide" key={slideIndex}>
                      <div className="student-cards-grid">
                        {slide.map((learner, cardIndex) => {
                          const learnerImage = getLearnerImageUrl(learner.img);
                          const displayName = learner.sch_name || `Learner #${learner.id}`
                          return (
                            <div
                              className="student-card animate-on-scroll"
                              key={learner.id || cardIndex}
                              style={{ '--i': cardIndex + 1 }}
                              onClick={handleCardClick}
                            >
                              <div className="student-card-image-wrapper">
                                {learnerImage ? (
                                  <img
                                    src={learnerImage}
                                    alt={displayName}
                                    className="student-card-image"
                                    onClick={(e) => handleImageClick(e, learnerImage)}
                                  />
                                ) : (
                                  <div className="student-card-image student-card-image-fallback">
                                    <FaUserGraduate />
                                  </div>
                                )}
                                <div className="student-card-badge">
                                </div>
                              </div>
                              <div className="student-card-content">
                                <h4 className="student-card-name">{displayName}</h4>
                                <p className="student-card-course">{learner.cour_name}</p>
                                <span className="student-card-location"><FaMapMarkerAlt style={{ marginRight: 4 }} />{learner.address}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="carousel-arrow carousel-arrow-next"
                onClick={nextSlide}
                aria-label="Next slide"
                type="button"
              >
                <FaChevronRight />
              </button>
            </div>

            <div className="carousel-dots">
              {studentSlides.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${currentSlide === index ? 'carousel-dot-active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  type="button"
                />
              ))}
            </div>
          </div>
        </section>

        {/* 2. About Section */}
        <section id="about" className="about-section container">
          <h2 className="section-title animate-on-scroll">About Digital Saksham Beti</h2>
          <p className="section-subtitle animate-on-scroll">Our mission is to equip every girl with the digital tools and knowledge to thrive in the modern world.</p>
          <div className="about-grid">
            {aboutCards.map((card, index) => (
              <div className="about-card animate-on-scroll" key={index} style={{ '--i': index + 1 }} onClick={handleCardClick}>
                <div className="about-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Featured Courses Section */}
        <section id="courses" className="featured-courses-section">
          <div className="container">
            <h2 className="section-title animate-on-scroll">Featured Courses</h2>
            <div className="course-grid">
              {coursesLoading ? (
                <p>Loading courses...</p>
              ) : featuredCourses.length > 0 ? (
                featuredCourses.map((course, index) => (
                  <div key={course.id}>
                    <div className="course-card animate-on-scroll" style={{ '--i': index + 1 }} onClick={handleCardClick}>
                      <div className="course-icon">{course.icon}</div>
                      <h3>{course.name}</h3>
                      <p className="course-intro">{course.intro}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>Could not load courses at this time. Please try again later.</p>
              )}
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <Gallery />

        {/* Top Students Chart Section */}
        <section className="top-students-section container">
          <h2 className="section-title animate-on-scroll">Top Students by Batch</h2>
          <p className="section-subtitle animate-on-scroll">Batch-wise top 5 students based on average score</p>
          {topStudentsLoading ? (
            <div className="text-center py-5">
              <div className="top-students-spinner"></div>
              <p className="mt-2 text-muted">Loading top students...</p>
            </div>
          ) : topStudentsData.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-0">No top student data available at this time.</p>
            </div>
          ) : (
            <div className="top-students-charts">
              {topStudentsData
                .map((course) => ({
                  ...course,
                  batches: (course.batches || []).filter(
                    (batch) => Array.isArray(batch.top_5_students) && batch.top_5_students.length > 0 && !batch.student_batch.includes('Uttarkashi')
                  )
                }))
                .filter((course) => course.batches.length > 0)
                .map((course) => (
                  <div key={course.course_id} className="course-batch-group mb-5">
                    <h4 className="course-batch-title">{course.course_name}</h4>
                    {course.batches.map((batch, batchIndex) => {
                      const topStudents = batch.top_5_students || [];
                      return (
                        <div key={batchIndex} className="batch-chart-card">
                          <div className="batch-header">
                            <h5>{batch.student_batch}</h5>
                            <span className="batch-stats">
                              Enrolled: {batch.total_enrolled} | Completed: {batch.total_completed}
                            </span>
                          </div>
                          <div className="leaderboard-cards">
                            {topStudents.map((student, idx) => {
                              const getMedalEmoji = (rank) => {
                                if (rank === 0) return '🥇';
                                if (rank === 1) return '🥈';
                                if (rank === 2) return '🥉';
                                return '';
                              };
                              return (
                                <div key={student.student_id || idx} className={`leaderboard-card rank-${idx + 1}`}>
                                  <div className="card-rank">
                                    <span className="medal">{getMedalEmoji(idx)}</span>
                                    <span className="rank-number">#{idx + 1}</span>
                                  </div>
                                  <div className="card-content">
                                    <h6 className="student-name">{student.student_name}</h6>
                                    <div className="score-display">
                                      <span className="score-label">Score:</span>
                                      <span className="score-value">{student.average_score}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* 4. Learning Journey Section */}
        <section id="journey" className="learning-journey-section container">
          <h2 className="section-title animate-on-scroll">Your Learning Journey</h2>
          <div className="timeline">
            {timelineItems.map((item, index) => (
              <div className="timeline-item animate-on-scroll" key={index} onClick={handleCardClick}>
                <div className="timeline-icon">{item.icon}</div>
                <div className="timeline-content">
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. Student Progress Dashboard Preview */}
        <section className="dashboard-preview-section animate-on-scroll">
          <div className="container dashboard-preview-content">
            <div className="dashboard-text">
              <h2 className="section-title">Track Your Progress</h2>
              <p className="section-subtitle">Our intuitive dashboard helps you monitor your learning journey, stay on top of deadlines, and visualize your achievements.</p>
            </div>
            <div className="dashboard-image-wrapper">
              <img src={proBar} alt="Student Progress Dashboard" className="dashboard-image" />
            </div>
          </div>
        </section>

        {/* 8. & 9. Management Section */}
        <section className="management-section">
          <div className="container">
            <div className="management-grid">
              <div className="management-card animate-on-scroll" onClick={handleCardClick}>
                <div className="management-text">
                  <h3>For Institutions</h3>
                  <p>Manage student registrations, monitor progress, and access detailed analytics through a dedicated dashboard for coordinators.</p>
                </div>
                <div className="management-image">
                  <img src={institutionPreview} alt="Institution Dashboard" />
                </div>
              </div>
              <div className="management-card admin-card animate-on-scroll" style={{ '--i': 2 }} onClick={handleCardClick}>
                <div className="management-text">
                  <h3>Powerful Admin Panel</h3>
                  <p>A centralized system for complete oversight and management of the entire platform ecosystem, from courses to real-time analytics.</p>
                </div>
                <div className="management-image">
                  <img src={adminPreview} alt="Admin Panel" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Statistics Section */}
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-item animate-on-scroll" onClick={handleCardClick}>
                <h3>{stats.students_enrolled}+</h3>
                <p>Students Enrolled</p>
              </div>
              <div className="stat-item animate-on-scroll" style={{ '--i': 2 }} onClick={handleCardClick}>
                <h3>{stats.courses_available}+</h3>
                <p>Courses Available</p>
              </div>
              <div className="stat-item animate-on-scroll" style={{ '--i': 3 }} onClick={handleCardClick}>
                <h3>{stats.certificates_issued}+</h3>
                <p>Certificates Issued</p>
              </div>
            </div>
          </div>
        </section>

        {/* 11. Testimonials Section */}
        <section className="testimonials-section container">
          <h2 className="section-title animate-on-scroll">Success Stories</h2>
          <div className="testimonial-grid">
            <div className="testimonial-card animate-on-scroll" onClick={handleCardClick}>
              <p>"Digital Saksham Beti transformed my career. The digital marketing course helped me get a great job!"</p>
              <h4>Priya Sharma</h4>
              <span>Student</span>
            </div>
            <div className="testimonial-card animate-on-scroll" style={{ '--i': 2 }} onClick={handleCardClick}>
              <p>"The platform is so easy to use, and the content is top-notch. I feel much more confident now."</p>
              <h4>Anjali Verma</h4>
              <span>Student</span>
            </div>
          </div>
        </section>
      </main>

      {selectedImage && (
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setSelectedImage(null)} aria-label="Close modal">
              ×
            </button>
            <img src={selectedImage} alt="Preview" className="image-modal-img" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;