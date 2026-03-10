import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { MdArrowForwardIos } from "react-icons/md";
import "../../assets/css/Footer.css";
import Logo from "../../assets/brainrock_logo.png";

function Footer() {
  return (
    <footer className='footer-bg'>
      <Container fluid>
        <Row className='g-4 py-5'>
          <Col lg={6} md={6} sm={12} className='d-flex flex-column justify-content-center'>
            <div className='footer-widget about-us'>
              <a href="/home">
                <div className='footer-logo mb-4'>
                  <img src={Logo} alt="logo" className="logo-wecd" />
                </div>
              </a>
              <p>BrainRock Consulting Services is one of the most reliable website development and industrial internship providers in the entire Dehradun, Uttarakhand. </p>
            </div>
          </Col>
          <Col lg={3} md={6} sm={12} className='d-flex flex-column justify-content-center'>
            <div className='footer-widget footer-link'>
              <h4 className='footer-widget-title'>
                Important Links
                <span className='footer-title-line'></span>
              </h4>
              <ul className='footer-list'>
                <a href="/Login"><li> <i><MdArrowForwardIos className='i-space' /></i>Home</li></a>
                <a href="/Login"><li> <i><MdArrowForwardIos className='i-space' /></i>Login</li></a>
                <a href="/Registration"><li> <i><MdArrowForwardIos className='i-space' /></i>Register</li></a>

               
              </ul>
            </div>
          </Col>
          <Col lg={3} md={6} sm={12} className='d-flex flex-column justify-content-center'>
            <div className='footer-widget footer-recent-post'>
              <h4 className='footer-widget-title'>
                Our Location
                <span className='footer-title-line'></span>
              </h4>
              <div
                className="footer-map-container"
                style={{ cursor: "pointer" }}
                onClick={() => window.open("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3444.0949168590623!2d78.0170128!3d30.319817899999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39092bb4f9cc1c19%3A0x7e1f8bfd41e158f2!2sBrainrock%20Consulting%20Services%20India!5e0!3m2!1sen!2sin!4v1764934647758!5m2!1sen!2sin", "_blank")}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3444.0949168590623!2d78.0170128!3d30.319817899999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39092bb4f9cc1c19%3A0x7e1f8bfd41e158f2!2sBrainrock%20Consulting%20Services%20India!5e0!3m2!1sen!2sin!4v1764934647758!5m2!1sen!2sin"
                  width="100%"
                  height="200"
                  style={{ border: 0, pointerEvents: "none" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="footer-map-iframe"
                  title="company-location"
                ></iframe>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
