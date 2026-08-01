import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaLaptopCode, FaBullhorn, FaQuestionCircle, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaShieldAlt, FaLightbulb, FaUserTie, FaDollarSign, FaChalkboardTeacher, FaCertificate, FaHandsHelping, FaUserGraduate, FaUserCheck, FaRocket, FaAward } from 'react-icons/fa';
import '../../assets/css/Home.css';
import Footer from '../footer/Footer';

// Online image URLs
const heroIllustration = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop';
const dashboardPreview = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop';
const adminPreview = 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2006&auto=format&fit=crop';
const institutionPreview = 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=2070&auto=format&fit=crop';

const Home = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, {
      threshold: 0.1
    });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => elements.forEach(el => observer.unobserve(el));
  }, []);


  const featuredCourses = [
    { name: 'AI Tools', intro: 'Explore the world of Artificial Intelligence and learn to use powerful AI tools.', icon: <FaLaptopCode /> },
    { name: 'Digital Marketing', intro: 'Master the fundamentals of online marketing, from SEO to social media.', icon: <FaBullhorn /> },
    { name: 'Computer Basics', intro: 'Get started with the essential computer skills for today\'s digital world.', icon: <FaLaptopCode /> },
    { name: 'Financial Literacy', intro: 'Learn to manage your finances, from budgeting to investing.', icon: <FaDollarSign /> },
    { name: 'Communication Skills', intro: 'Enhance your verbal and written communication for personal and professional success.', icon: <FaLightbulb /> },
    { name: 'Entrepreneurship', intro: 'Discover how to start and grow your own business from the ground up.', icon: <FaUserTie /> },
    { name: 'Career Readiness', intro: 'Prepare for the job market with resume building, interview skills, and more.', icon: <FaBook /> },
    { name: 'Cyber Security', intro: 'Understand the basics of cybersecurity and how to protect yourself online.', icon: <FaShieldAlt /> }
  ];

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
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <div className="home-page">
    

      <main>
        {/* 1. Hero Section */}
        <section className="hero-section">
          <div className="container hero-content">
            <div className="hero-text animate-on-scroll">
              <h1 className=" ">Empowering Every Girl Through <span className="highlight">Digital Education</span></h1>
              <p className=" ">Join Digital Saksham Beti to unlock your potential with in-demand digital skills, from AI to financial literacy, and build a successful career.</p>
              <div className="hero-cta  ">
                <a href="#courses" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Explore Courses</a>
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
              {featuredCourses.map((course, index) => (
                <a href="#courses" className="course-card-link" key={course.name}>
                  <div className="course-card animate-on-scroll" style={{ '--i': index + 1 }}>
                    <div className="course-icon">{course.icon}</div>
                    <h3>{course.name}</h3>
                    <p className="course-intro">{course.intro}</p>
                  </div>
                </a>
              ))}
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
                <h3>10,000+</h3>
                <p>Students Enrolled</p>
              </div>
              <div className="stat-item animate-on-scroll" style={{ '--i': 2 }}>
                <h3>500+</h3>
                <p>Institutions Registered</p>
              </div>
              <div className="stat-item animate-on-scroll" style={{ '--i': 3 }}>
                <h3>50+</h3>
                <p>Courses Available</p>
              </div>
              <div className="stat-item animate-on-scroll" style={{ '--i': 4 }}>
                <h3>8,000+</h3>
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