import React, { useState } from 'react'
import { Card, Row, Col, Badge, Modal, Button, Accordion } from 'react-bootstrap'
import { FaGovernment } from 'react-icons/fa'
import { useLanguage } from '../../contexts/LanguageContext'
import TransText from '../TransText'
import { getTranslation } from '../../utils/translations'

const GovernmentSchemes = () => {
  const { language } = useLanguage()
  const [showModal, setShowModal] = useState(false)
  const [selectedScheme, setSelectedScheme] = useState(null)

  const schemes = [
    {
      id: 'pmay',
      name: language === 'hi' ? 'प्रधानमंत्री आवास योजना' : 'Pradhan Mantri Awas Yojana',
      nameKey: 'schemes.pmay',
      description: language === 'hi' 
        ? 'गरीब परिवारों को आवास प्रदान करने की योजना'
        : 'Scheme to provide housing for poor families',
      descriptionKey: 'schemes.pmayDesc',
      eligibility: language === 'hi' 
        ? 'एससी/एसटी, ओबीसी, अल्पसंख्यक, दिव्यांग व्यक्ति'
        : 'SC/ST, OBC, Minorities, Physically Handicapped',
      eligibilityKey: 'schemes.eligibility',
      benefit: language === 'hi' 
        ? '₹1.5 लाख तक की वित्तीय सहायता'
        : 'Financial assistance up to ₹1.5 lakh',
      benefitKey: 'schemes.pmayBenefit',
      link: 'https://pmaymis.gov.in/'
    },
    {
      id: 'pmjay',
      name: language === 'hi' ? 'आयुष्मान भारत' : 'Ayushman Bharat',
      nameKey: 'schemes.pmjay',
      description: language === 'hi' 
        ? 'प्रधानमंत्री जन आरोग्य योजना - स्वास्थ्य बीमा'
        : 'Pradhan Mantri Jan Arogya Yojana - Health Insurance',
      descriptionKey: 'schemes.pmjayDesc',
      eligibility: language === 'hi' 
        ? 'गरीब परिवार (सेक्युलर राशन कार्ड धारक)'
        : 'Poor families (Secular Ration Card holders)',
      eligibilityKey: 'schemes.eligibility',
      benefit: language === 'hi' 
        ? '₹5 लाख तक का स्वास्थ्य बीमा कवर'
        : 'Health insurance cover up to ₹5 lakh',
      benefitKey: 'schemes.pmjayBenefit',
      link: 'https://pmjay.gov.in/'
    },
    {
      id: 'pmkvy',
      name: language === 'hi' ? 'प्रधानमंत्री कौशल विकास योजना' : 'Pradhan Mantri Kaushal Vikas Yojana',
      nameKey: 'schemes.pmkvy',
      description: language === 'hi' 
        ? 'युवाओं को रोजगार के लिए कौशल प्रशिक्षण'
        : 'Skill training for youth for employment',
      descriptionKey: 'schemes.pmkvyDesc',
      eligibility: language === 'hi' 
        ? '15-45 वर्ष के बेरोजगार युवा'
        : 'Unemployed youth aged 15-45 years',
      eligibilityKey: 'schemes.eligibility',
      benefit: language === 'hi' 
        ? 'मुफ्त कौशल प्रशिक्षण और प्रमाणपत्र'
        : 'Free skill training and certification',
      benefitKey: 'schemes.pmkvyBenefit',
      link: 'https://pmkvy.gov.in/'
    },
    {
      id: 'pmyss',
      name: language === 'hi' ? 'प्रधानमंत्री छात्रवृत्ति योजना' : 'Pradhan Mantri Student Scholarship',
      nameKey: 'schemes.pmyss',
      description: language === 'hi' 
        ? 'विद्यार्थियों को छात्रवृत्ति प्रदान करना'
        : 'Scholarship for students',
      descriptionKey: 'schemes.pmyssDesc',
      eligibility: language === 'hi' 
        ? '10वीं/12वीं पास विद्यार्थी, पारिवारिक आय सीमा'
        : '10th/12th passed students, family income limit',
      eligibilityKey: 'schemes.eligibility',
      benefit: language === 'hi' 
        ? '₹1,000 - ₹75,000 तक छात्रवृत्ति'
        : 'Scholarship from ₹1,000 to ₹75,000',
      benefitKey: 'schemes.pmyssBenefit',
      link: 'https://scholarship.gov.in/'
    },
    {
      id: 'nsp',
      name: language === 'hi' ? 'राष्ट्रीय छात्रवृत्ति पोर्टल' : 'National Scholarship Portal',
      nameKey: 'schemes.nsp',
      description: language === 'hi' 
        ? 'केंद्र और राज्य सरकार की छात्रवृत्ति योजनाओं का एकल पोर्टल'
        : 'Single portal for Central and State scholarship schemes',
      descriptionKey: 'schemes.nspDesc',
      eligibility: language === 'hi' 
        ? 'विभिन्न श्रेणियों के विद्यार्थी'
        : 'Students from various categories',
      eligibilityKey: 'schemes.eligibility',
      benefit: language === 'hi' 
        ? 'विभिन्न छात्रवृत्ति योजनाओं तक पहुंच'
        : 'Access to various scholarship schemes',
      benefitKey: 'schemes.nspBenefit',
      link: 'https://scholarship.gov.in/'
    },
    {
      id: 'pmrel',
      name: language === 'hi' ? 'प्रधानमंत्री रोजगार लेखा' : 'Pradhan Mantri Rojgar Protsahan Yojana',
      nameKey: 'schemes.pmrel',
      description: language === 'hi' 
        ? 'नियोक्ताओं को कर्मचारियों के EPF का अंशदान'
        : 'Govt contributes employer EPF for employees',
      descriptionKey: 'schemes.pmrelDesc',
      eligibility: language === 'hi' 
        ? 'नए कर्मचारी रखने वाले नियोक्ता'
        : 'Employers registering new employees',
      eligibilityKey: 'schemes.eligibility',
      benefit: language === 'hi' 
        ? 'कर्मचारी के EPF पर 12% अंशदान'
        : '12% contribution on employee EPF',
      benefitKey: 'schemes.pmrelBenefit',
      link: 'https://myaadhaar.uidai.gov.in/'
    },
    {
      id: 'pmayg',
      name: language === 'hi' ? 'प्रधानमंत्री आवास (ग्रामीण)' : 'PMAY (Rural)',
      nameKey: 'schemes.pmayg',
      description: language === 'hi' 
        ? 'ग्रामीण क्षेत्रों में पक्के घर निर्माण'
        : 'Pucca house construction in rural areas',
      descriptionKey: 'schemes.pmaygDesc',
      eligibility: language === 'hi' 
        ? 'ग्रामीण क्षेत्र के गरीब परिवार'
        : 'Poor families in rural areas',
      eligibilityKey: 'schemes.eligibility',
      benefit: language === 'hi' 
        ? '₹1.20 लाख (पहाड़ी क्षेत्रों में ₹1.30 लाख)'
        : '₹1.20 lakh (₹1.30 lakh in hilly areas)',
      benefitKey: 'schemes.pmaygBenefit',
      link: 'https://pmayg.nic.in/'
    },
    {
      id: 'standup',
      name: language === 'hi' ? 'स्टैंड-अप इंडिया' : 'Stand-Up India',
      nameKey: 'schemes.standup',
      description: language === 'hi' 
        ? 'एससी/एसटी और महिला उद्यमियों के लिए ऋण'
        : 'Loans for SC/ST and Women entrepreneurs',
      descriptionKey: 'schemes.standupDesc',
      eligibility: language === 'hi' 
        ? 'एससी/एसटी और महिला उद्यमी'
        : 'SC/ST and Women entrepreneurs',
      eligibilityKey: 'schemes.eligibility',
      benefit: language === 'hi' 
        ? '₹10 लाख से ₹1 करोड़ तक ऋण'
        : 'Loan from ₹10 lakh to ₹1 crore',
      benefitKey: 'schemes.standupBenefit',
      link: 'https://standupmitra.in/'
    }
  ]

  const handleSchemeClick = (scheme) => {
    setSelectedScheme(scheme)
    setShowModal(true)
  }

  return (
    <>
      <Row>
        {schemes.map((scheme, index) => (
          <Col lg={6} md={6} className="mb-4" key={index}>
            <Card 
              className="h-100 border scheme-card"
              style={{ cursor: 'pointer', borderRadius: '10px' }}
              onClick={() => handleSchemeClick(scheme)}
            >
              <Card.Body className="p-4">
                <div className="d-flex align-items-start gap-3">
                  <div className="scheme-icon-large">
                    <FaGovernment className="text-primary p-2" style={{ fontSize: '24px' }} />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-2 fw-bold">
                      {scheme.nameKey ? getTranslation(scheme.nameKey, language) : scheme.name}
                    </h6>
                    <p className="text-muted small mb-2">
                      {scheme.descriptionKey ? getTranslation(scheme.descriptionKey, language) : scheme.description}
                    </p>
                    <Badge bg="success" className="me-2">
                      <TransText k="schemes.eligibility" as="span" />: {scheme.eligibility}
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Scheme Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            {selectedScheme && (
              <>
                {selectedScheme.nameKey ? getTranslation(selectedScheme.nameKey, language) : selectedScheme.name}
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedScheme && (
            <div>
              <div className="mb-4">
                <h6 className="text-muted mb-2"><TransText k="schemes.description" as="span" /></h6>
                <p>
                  {selectedScheme.descriptionKey 
                    ? getTranslation(selectedScheme.descriptionKey, language) 
                    : selectedScheme.description}
                </p>
              </div>

              <Accordion className="mb-3">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    <TransText k="schemes.eligibility" as="span" />
                  </Accordion.Header>
                  <Accordion.Body>
                    {selectedScheme.eligibility}
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>
                    <TransText k="schemes.benefits" as="span" />
                  </Accordion.Header>
                  <Accordion.Body>
                    {selectedScheme.benefitKey 
                      ? getTranslation(selectedScheme.benefitKey, language) 
                      : selectedScheme.benefit}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>

              <div className="mb-3">
                <Badge bg="info" className="p-2">
                  <TransText k="schemes.website" as="span" />: 
                  <a 
                    href={selectedScheme.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="ms-2 text-white"
                  >
                    {selectedScheme.link}
                  </a>
                </Badge>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <TransText k="button.close" as="span" />
          </Button>
          <Button variant="primary" onClick={() => {
            setShowModal(false)
          }}>
            <TransText k="schemes.apply" as="span" />
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default GovernmentSchemes
