import React, { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Card, Table, Button, Form, Badge } from 'react-bootstrap'
import AdminLeftNav from './AdminLeftNav'
import AdminTopNav from './AdminTopNav'
import '../../assets/css/Enrollments.css'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaSearch, FaChevronDown, FaChevronUp, FaMapMarkerAlt, FaBook } from 'react-icons/fa'

const studentsData = [
  { id: 1, name: 'Aarohi Singh', address: '123, Rajendra Nagar, New Delhi - 110060', course: 'Digital Marketing', image: 'https://i.pravatar.cc/150?img=1', status: 'active' },
  { id: 2, name: 'Meera Patel', address: '45, Satellite Road, Ahmedabad - 380015', course: 'AI Tools', image: 'https://i.pravatar.cc/150?img=5', status: 'active' },
  { id: 3, name: 'Kavya Sharma', address: '78, Malviya Nagar, Jaipur - 302017', course: 'Financial Literacy', image: 'https://i.pravatar.cc/150?img=9', status: 'active' },
  { id: 4, name: 'Ishita Gupta', address: '22, Hazratganj, Lucknow - 226001', course: 'Cyber Security', image: 'https://i.pravatar.cc/150?img=16', status: 'completed' },
  { id: 5, name: 'Riya Verma', address: '56, FC Road, Pune - 411004', course: 'Computer Basics', image: 'https://i.pravatar.cc/150?img=20', status: 'active' },
  { id: 6, name: 'Ananya Joshi', address: '89, Koramangala, Bangalore - 560034', course: 'Entrepreneurship', image: 'https://i.pravatar.cc/150?img=25', status: 'active' },
  { id: 7, name: 'Diya Reddy', address: '34, Banjara Hills, Hyderabad - 500034', course: 'Communication Skills', image: 'https://i.pravatar.cc/150?img=32', status: 'completed' },
  { id: 8, name: 'Sneha Nair', address: '67, Anna Nagar, Chennai - 600040', course: 'Career Readiness', image: 'https://i.pravatar.cc/150?img=38', status: 'active' },
  { id: 9, name: 'Pooja Mehta', address: '12, CG Road, Ahmedabad - 380006', course: 'Digital Marketing', image: 'https://i.pravatar.cc/150?img=44', status: 'active' },
  { id: 10, name: 'Kriti Agarwal', address: '90, Salt Lake, Kolkata - 700091', course: 'AI Tools', image: 'https://i.pravatar.cc/150?img=48', status: 'completed' },
  { id: 11, name: 'Tanvi Desai', address: '45, Vesu, Surat - 395007', course: 'Personality Development', image: 'https://i.pravatar.cc/150?img=53', status: 'active' },
  { id: 12, name: 'Neha Kapoor', address: '23, Sector 17, Chandigarh - 160017', course: 'Computer Learning with AI Tools', image: 'https://i.pravatar.cc/150?img=60', status: 'active' },
  { id: 13, name: 'Swati Kulkarni', address: '78, Dharampeth, Nagpur - 440010', course: 'Digital Marketing', image: 'https://i.pravatar.cc/150?img=65', status: 'completed' },
  { id: 14, name: 'Ritu Bansal', address: '56, Gomti Nagar, Lucknow - 226010', course: 'Financial Literacy', image: 'https://i.pravatar.cc/150?img=47', status: 'active' },
  { id: 15, name: 'Aarti Mehta', address: '34, Adajan, Surat - 395009', course: 'AI Tools', image: 'https://i.pravatar.cc/150?img=41', status: 'active' },
  { id: 16, name: 'Prachi Sharma', address: '11, Dwarka Sector 7, New Delhi - 110075', course: 'Cyber Security', image: 'https://i.pravatar.cc/150?img=28', status: 'active' },
  { id: 17, name: 'Nisha Yadav', address: '67, Kukatpally, Hyderabad - 500072', course: 'Entrepreneurship', image: 'https://i.pravatar.cc/150?img=33', status: 'completed' },
  { id: 18, name: 'Sakshi Jain', address: '90, Vaishali Nagar, Jaipur - 302021', course: 'Communication Skills', image: 'https://i.pravatar.cc/150?img=36', status: 'active' },
  { id: 19, name: 'Megha Reddy', address: '23, Madhapur, Hyderabad - 500081', course: 'Computer Basics', image: 'https://i.pravatar.cc/150?img=23', status: 'active' },
  { id: 20, name: 'Divya Joshi', address: '45, Shivaji Nagar, Pune - 411005', course: 'Career Readiness', image: 'https://i.pravatar.cc/150?img=29', status: 'completed' }
]

const LearnersManagement = () => {
  const navigate = useNavigate()
  const [showSidebar, setShowSidebar] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(10)
  const [expandedCards, setExpandedCards] = useState({})



  // Filtered students
  const filteredStudents = useMemo(() => {
    let result = [...studentsData]

    if (filterCourse !== 'all') {
      result = result.filter(s => s.course === filterCourse)
    }

    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus)
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.address.toLowerCase().includes(term) ||
        s.course.toLowerCase().includes(term)
      )
    }

    return result
  }, [searchTerm, filterCourse, filterStatus])

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = filteredStudents.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(filteredStudents.length / recordsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCourse, filterStatus])

  const toggleCardExpansion = (id) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const getStatusBadge = (status) => {
    return status === 'completed' ? 'success' : 'primary'
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="admin-layout">
      <div className="admin-wrapper d-flex">
        <AdminLeftNav show={showSidebar} setShow={setShowSidebar} />
        <div className={`admin-main-content flex-grow-1 ${!showSidebar ? 'sidebar-compact' : ''}`}>
          <AdminTopNav />
          <div className="content-area">
            <Container fluid className='mob-top-view'>
              <div className="d-flex justify-content-between align-items-center mb-4 page-header">
                <div className="d-flex align-items-center all-en-box gap-3">
                  <Button variant="outline-secondary" size="sm" onClick={() => navigate('/AdminDashboard')} className="me-2">
                    <FaArrowLeft /> Dashboard
                  </Button>
                  <h4 className="mb-0">Manage Students</h4>
                </div>
              </div>

             

              
            </Container>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearnersManagement