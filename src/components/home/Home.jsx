import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaLaptopCode, FaBullhorn, FaQuestionCircle, FaShieldAlt, FaLightbulb, FaUserTie, FaDollarSign, FaChalkboardTeacher, FaHandsHelping, FaUserGraduate, FaUserCheck, FaRocket, FaAward } from 'react-icons/fa';
import axios from 'axios';
import digitalBetiLogo from '../../assets/image.png';
import '../../assets/css/Home.css';

const heroIllustration = digitalBetiLogo;
const dashboardPreview = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop';
const adminPreview = 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2006&auto=format&fit=crop';
const institutionPreview = 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=2070&auto=format&fit=crop';

const Home = () => {
  const [stats, setStats] = useState({
    students_enrolled: '0',
    courses_available: '0',
    certificates_issued: '0'
  });
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

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
  }, [featuredCourses]); // Re-run when courses are loaded

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
          // Log an error if the API response was not successful
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
          <div className="container hero-content">
            <div className="hero-text animate-on-scroll">
              <h1 className=" ">Empowering Every Girl Through <span className="highlight">Digital Education</span></h1>
              <p className=" ">Join Digital Saksham Beti to unlock your potential with in-demand digital skills, from AI to financial literacy, and build a successful career.</p>
              <div className="hero-cta">
                <a href="#courses" className="btn btn-primary">Explore Courses</a>
                <Link to="/Registration" className="btn btn-outline-light">Register Now</Link>
              </div>
            </div>
            <div className="hero-image  ">
              <img src={heroIllustration} alt="Girls learning on digital devices" />
            </div>
          </div>
        </section>

        {/* 2. About Section */}
        <section id="about" className="about-section container">
          <h2 className="section-title animate-on-scroll">About Digital Saksham Beti</h2>
          <p className="section-subtitle animate-on-scroll">Our mission is to equip every girl with the digital tools and knowledge to thrive in the modern world.</p>
          <div className="about-grid">
            {aboutCards.map((card, index) => (
              <div className="about-card animate-on-scroll" key={index} style={{ '--i': index + 1 }}>
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
                  <a href="#courses" className="course-card-link" key={course.id}>
                    <div className="course-card animate-on-scroll" style={{ '--i': index + 1 }}>
                      <div className="course-icon">{course.icon}</div>
                      <h3>{course.name}</h3>
                      <p className="course-intro">{course.intro}</p>
                    </div>
                  </a>
                ))
              ) : (
                <p>Could not load courses at this time. Please try again later.</p>
              )}
            </div>
          </div>
        </section>

        {/* 4. Learning Journey Section */}
        <section id="journey" className="learning-journey-section container">
          <h2 className="section-title animate-on-scroll">Your Learning Journey</h2>
          <div className="timeline">
            {timelineItems.map((item, index) => (
              <div className="timeline-item animate-on-scroll" key={index}>
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
              <img src={dashboardPreview} alt="Student Progress Dashboard" className="dashboard-image" />
            </div>
          </div>
        </section>

        {/* 8. & 9. Management Section */}
        <section className="management-section">
          <div className="container">
            <div className="management-grid">
              {/* Institution Card */}
              <div className="management-card animate-on-scroll">
                <div className="management-text">
                  <h3>For Institutions</h3>
                  <p>Manage student registrations, monitor progress, and access detailed analytics through a dedicated dashboard for coordinators.</p>
                </div>
                <div className="management-image">
                  <img src={institutionPreview} alt="Institution Dashboard" />
                </div>
              </div>
              {/* Admin Panel Card */}
              <div className="management-card admin-card animate-on-scroll" style={{ '--i': 2 }}>
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
              <div className="stat-item animate-on-scroll">
                <h3>{stats.students_enrolled}+</h3>
                <p>Students Enrolled</p>
              </div>
              <div className="stat-item animate-on-scroll" style={{ '--i': 2 }}>
                <h3>{stats.courses_available}+</h3>
                <p>Courses Available</p>
              </div>
              <div className="stat-item animate-on-scroll" style={{ '--i': 3 }}>
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
            <div className="testimonial-card animate-on-scroll">
              <p>"Digital Saksham Beti transformed my career. The digital marketing course helped me get a great job!"</p>
              <h4>Priya Sharma</h4>
              <span>Student</span>
            </div>
            <div className="testimonial-card animate-on-scroll" style={{ '--i': 2 }}>
              <p>"The platform is so easy to use, and the content is top-notch. I feel much more confident now."</p>
              <h4>Anjali Verma</h4>
              <span>Student</span>
            </div>
          </div>
        </section>


    
      </main>

    </div>
  );
};

export default Home;