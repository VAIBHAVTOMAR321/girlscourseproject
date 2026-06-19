import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Badge,
  Modal,
  Button,
  Table,
  Form,
} from "react-bootstrap";
import AdminLeftNav from "./AdminLeftNav";
import AdminTopNav from "./AdminTopNav";
import "../../assets/css/Enrollments.css";
import axios from "axios";
import { FaBook, FaInfoCircle, FaUsers } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

const API_URL =
  "https://brjobsedu.com/girls_course/girls_course_backend/api/unpaid-courses/";

const StudentAnalysis = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState(null);
  const { accessToken } = useAuth();
  const [courseStudentCounts, setCourseStudentCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(false);

  // New states for student list and analysis
  const [selectedCourseForStudents, setSelectedCourseForStudents] =
    useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [studentsInCourse, setStudentsInCourse] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState(null);

  const [selectedStudentForAnalysis, setSelectedStudentForAnalysis] =
    useState(null);
  const [showStudentAnalysisModal, setShowStudentAnalysisModal] =
    useState(false);
  const [studentProgress, setStudentProgress] = useState([]);
  const [loadingStudentProgress, setLoadingStudentProgress] = useState(false);
  const [studentProgressError, setStudentProgressError] = useState(null);

  const [showBatchSelectionModal, setShowBatchSelectionModal] = useState(false);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [courseEnrollmentDetails, setCourseEnrollmentDetails] = useState(null); // To store detailed enrollments for a selected course
  const [loadingCourseEnrollmentDetails, setLoadingCourseEnrollmentDetails] =
    useState(false);
  const [currentDisplayView, setCurrentDisplayView] = useState("courseCards"); // 'courseCards', 'studentList', 'overallAnalysis'

  const [allEnrollments, setAllEnrollments] = useState([]); // To store all enrollments for counting
  const [enrollmentCounts, setEnrollmentCounts] = useState({}); // { course_id: count }

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        setError(null);
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
        const response = await axios.get(API_URL, config);
        if (response.data && response.data.status) {
          setCourses(response.data.courses);
        } else {
          setCourses([]);
          setError(response.data.message || "Failed to fetch courses.");
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Network error or unable to fetch courses.");
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    if (accessToken) {
      fetchCourses();
    }
  }, [accessToken]);

  useEffect(() => {
    const fetchStudentCounts = async () => {
      if (!courses.length || !accessToken) return;

      setLoadingCounts(true);

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };

        const counts = {};

        await Promise.all(
          courses.map(async (course) => {
            try {
              const response = await axios.get(
                `https://brjobsedu.com/girls_course/girls_course_backend/api/course-enrollment-progress/?course_id=${course.course_id}`,
                config,
              );

              counts[course.course_id] =
                response.data?.enrollments?.length || 0;
            } catch (error) {
              console.error(
                `Error fetching count for ${course.course_id}`,
                error,
              );
              counts[course.course_id] = 0;
            }
          }),
        );

        setCourseStudentCounts(counts);
      } catch (error) {
        console.error("Error fetching student counts:", error);
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchStudentCounts();
  }, [courses, accessToken]);

  const fetchCourseEnrollmentDetails = async (courseId) => {
    setLoadingCourseEnrollmentDetails(true);
    setStudentsError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const response = await axios.get(
        `https://brjobsedu.com/girls_course/girls_course_backend/api/course-enrollment-progress/?course_id=${courseId}`,
        config,
      );
      if (response.data && response.data.course_id) {
        setCourseEnrollmentDetails(response.data);
        const batches = new Set();
        response.data.enrollments.forEach((enrollment) => {
          if (enrollment.student_batch) {
            batches.add(enrollment.student_batch);
          }
        });
        setAvailableBatches(Array.from(batches));
        setSelectedBatch(""); // Reset selected batch
        setShowBatchSelectionModal(true);
      } else {
        setStudentsError(
          response.data.message || "Failed to fetch course enrollment details.",
        );
      }
    } catch (err) {
      setStudentsError(
        "Network error or unable to fetch course enrollment details.",
      );
      console.error("Error fetching course enrollment details:", err);
    } finally {
      setLoadingCourseEnrollmentDetails(false);
    }
  };

  const handleCourseCardClick = (course) => {
    setSelectedCourseForStudents(course);
    fetchCourseEnrollmentDetails(course.course_id);
  };

  const handleViewStudentsInBatch = () => {
    if (
      !selectedCourseForStudents ||
      !selectedBatch ||
      !courseEnrollmentDetails
    )
      return;

    setLoadingStudents(true);
    setStudentsError(null);
    try {
      const students = courseEnrollmentDetails.enrollments
        .filter((enrollment) => enrollment.student_batch === selectedBatch)
        .map((enrollment) => ({
          ...enrollment,
          roleType: "student-unpaid",
          student_id: enrollment.student_code,
        }));
      setStudentsInCourse(students);
      setShowBatchSelectionModal(false); // Close batch selection modal
      setCurrentDisplayView("studentList"); // Show student list page
    } catch (err) {
      setStudentsError("Failed to load students for this batch.");
      console.error("Error filtering students:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleViewStudentAnalysis = (student) => {
    setSelectedStudentForAnalysis(student);
    setStudentProgressError(null);

    // Use the module_progress already available in the student object from the course enrollment API
    if (student.module_progress && Array.isArray(student.module_progress)) {
      setStudentProgress(student.module_progress);
      setShowStudentAnalysisModal(true);
    } else {
      setStudentProgressError(
        "No progress data found for this student in this course.",
      );
      setStudentProgress([]);
      setShowStudentAnalysisModal(true);
    }
  };

  const renderCourseCardsView = () => (
    <Row>
      <Col xs={12}>
        {loadingCourses ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading courses...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">
            <FaInfoCircle className="me-2" />
            {error}
          </Alert>
        ) : courses.length === 0 ? (
          <Card className="enrollments-table-card border p-4 shadow-sm">
            <Card.Body>
              <h5 className="text-secondary mb-3">No Courses Found</h5>
              <p className="text-muted">
                There are no courses to display for student analysis.
              </p>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            {courses.map((course) => (
              <Col key={course.course_id} xs={12} sm={6} md={4} lg={3}>
                <Card
                  className="h-100 shadow-sm border-0"
                  onClick={() => handleCourseCardClick(course)}
                  style={{ cursor: "pointer" }}
                >
                  <Card.Body>
                    <h5 className="card-title fw-bold text-primary">
                      {course.course_name}
                    </h5>
                    <p className="card-text text-muted mb-2">
                      ID: {course.course_id}
                    </p>
                    <Badge
                      bg={
                        course.course_status === "unpaid" ? "info" : "success"
                      }
                    >
                      {course.course_status}
                    </Badge>
                    <p className="card-text mt-2 mb-0">
                      <FaUsers className="me-1" />
                      Enrolled Students:{" "}
                      {courseStudentCounts[course.course_id] || 0}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Col>
    </Row>
  );

  const renderStudentListView = () => (
    <Row>
      <Col xs={12}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h4 className="mb-0">
            Students in {selectedCourseForStudents?.course_name} (
            {selectedBatch})
          </h4>
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentDisplayView("overallAnalysis")}
            >
              View Overall Analysis
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setCurrentDisplayView("courseCards")}
            >
              Back to Courses
            </Button>
          </div>
        </div>
        {loadingStudents ? (
          <div className="text-center py-3">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading students...</p>
          </div>
        ) : studentsError ? (
          <Alert variant="danger">{studentsError}</Alert>
        ) : studentsInCourse.length === 0 ? (
          <Alert variant="info">
            No students found in this batch for this course.
          </Alert>
        ) : (
          <Table
            striped
            bordered
            hover
            responsive
            className="custom-table student-list-table"
          >
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Student Code</th>
                <th>Student Name</th>
                <th>Modules Completed</th>
                <th>Average Score</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {studentsInCourse.map((student, index) => {
                const totalModules = student.module_progress?.length || 0;

                const completedModules =
                  student.module_progress?.filter(
                    (module) => module.is_completed,
                  ).length || 0;

                const totalScore =
                  student.module_progress?.reduce(
                    (sum, module) => sum + (module.test_score || 0),
                    0,
                  ) || 0;

                const averageScore =
                  totalModules > 0 ? (totalScore / totalModules).toFixed(1) : 0;

                return (
                  <tr key={student.student_code}>
                    <td>{index + 1}</td>

                    <td>{student.student_code}</td>

                    <td>{student.student_name}</td>

                    <td>
                      <Badge bg="success">
                        {completedModules} / {totalModules}
                      </Badge>
                    </td>

                    <td>
                      <Badge
                        bg={
                          averageScore >= 80
                            ? "success"
                            : averageScore >= 60
                              ? "warning"
                              : "danger"
                        }
                      >
                        {averageScore}%
                      </Badge>
                    </td>

                    <td className="text-center">
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleViewStudentAnalysis(student)}
                      >
                        View Analysis
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );

  const renderOverallAnalysisView = () => {
    if (!courseEnrollmentDetails) return null;

    const batchStudents = courseEnrollmentDetails.enrollments.filter(
      (e) => e.student_batch === selectedBatch,
    );

    const analyticsData = batchStudents
      .map((student) => {
        const totalModules = student.module_progress?.length || 0;
        const completedModules =
          student.module_progress?.filter((m) => m.is_completed).length || 0;
        const progress =
          totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
        const totalScore =
          student.module_progress?.reduce(
            (acc, m) => acc + (m.test_score || 0),
            0,
          ) || 0;
        const avgScore =
          completedModules > 0 ? totalScore / completedModules : 0;

        return {
          name: student.student_name,
          code: student.student_code,
          progress: Math.round(progress),
          avgScore: Math.round(avgScore),
          completedModules,
          totalModules,
        };
      })
      .sort((a, b) => b.progress - a.progress || b.avgScore - a.avgScore);

    const progressStats = [
      {
        name: "Completed (100%)",
        value: analyticsData.filter((s) => s.progress === 100).length,
        color: "#28a745",
      },
      {
        name: "In Progress (1-99%)",
        value: analyticsData.filter((s) => s.progress > 0 && s.progress < 100)
          .length,
        color: "#ffc107",
      },
      {
        name: "Not Started",
        value: analyticsData.filter((s) => s.progress === 0).length,
        color: "#dc3545",
      },
    ];

    return (
      <div className="fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Overall Batch Analysis: {selectedBatch}</h4>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setCurrentDisplayView("studentList")}
          >
            Back to Student List
          </Button>
        </div>

        <Row className="g-4 mb-4">
          <Col lg={4}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="overall-analysis-card-header">
                Progress Distribution
              </Card.Header>
              <Card.Body className="d-flex justify-content-center align-items-center">
                <div style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={progressStats}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {progressStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={8}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Header className="overall-analysis-card-header">
                Student Progress Comparison (%)
              </Card.Header>
              <Card.Body>
                <div style={{ width: "100%", height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={analyticsData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        fontSize={12}
                        tick={{ fill: "#666" }}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip cursor={{ fill: "#f5f5f5" }} />
                      <Bar
                        dataKey="progress"
                        radius={[4, 4, 0, 0]}
                        label={{ position: "top", fontSize: 10 }}
                      >
                        {analyticsData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index === 0
                                ? "#28a745" // Green for 1st
                                : index === 1
                                  ? "#0d6efd" // Blue for 2nd
                                  : index === 2
                                    ? "#ffc107" // Yellow for 3rd
                                    : "#dc3545" // Red for the rest
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-center text-muted small mt-2">
                  Showing top 10 students by progress
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="shadow-sm border-0">
          <Card.Header className="overall-analysis-card-header">
            Batch Leaderboard (Ranked by Completion)
          </Card.Header>
          <Card.Body className="p-0">
            <Table
              responsive
              hover
              className="mb-0 custom-table leaderboard-table"
            >
              <thead className="bg-light">
                <tr>
                  <th className="ps-3">Rank</th>
                  <th>Student Name</th>
                  <th>Student Code</th>
                  <th>Completion</th>
                  <th>Modules</th>
                  <th>Avg. Quiz Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.map((student, index) => (
                  <tr key={student.code}>
                    <td className="ps-3 fw-bold">#{index + 1}</td>
                    <td className="fw-semibold">{student.name}</td>
                    <td>
                      <Badge bg="light" text="dark" className="border">
                        {student.code}
                      </Badge>
                    </td>
                    <td style={{ width: "200px" }}>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="progress flex-grow-1"
                          style={{ height: "8px" }}
                        >
                          <div
                            className={`progress-bar ${student.progress === 100 ? "bg-success" : "bg-primary"}`}
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="small fw-bold">
                          {student.progress}%
                        </span>
                      </div>
                    </td>
                    <td>
                      {student.completedModules} / {student.totalModules}
                    </td>
                    <td>
                      <span className="text-primary fw-bold">
                        {student.avgScore}%
                      </span>
                    </td>
                    <td>
                      <Badge
                        bg={student.progress === 100 ? "success" : "warning"}
                      >
                        {student.progress === 100 ? "Completed" : "Ongoing"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    );
  };

  return (
    <>
      <div className="admin-layout">
        <div className="admin-wrapper d-flex">
          <AdminLeftNav show={showSidebar} setShow={setShowSidebar} />
          <div
            className={`admin-main-content flex-grow-1 ${!showSidebar ? "sidebar-compact" : ""}`}
          >
            <AdminTopNav />
            <div className="content-area">
              <Container fluid className="mob-top-view">
                <div className="d-flex justify-content-between align-items-center mb-4 page-header">
                  <div className="d-flex align-items-center all-en-box gap-3">
                    <h4 className="mb-0">Student Analysis</h4>
                  </div>
                </div>
                {currentDisplayView === "courseCards" &&
                  renderCourseCardsView()}
                {currentDisplayView === "studentList" &&
                  renderStudentListView()}
                {currentDisplayView === "overallAnalysis" &&
                  renderOverallAnalysisView()}
              </Container>
            </div>
          </div>
        </div>
      </div>
      {/* Batch Selection Modal */}
      <Modal
        show={showBatchSelectionModal}
        onHide={() => setShowBatchSelectionModal(false)}
        centered
      >
        {loadingCourseEnrollmentDetails && (
          <div className="overlay-spinner">
            <Spinner animation="border" />
          </div>
        )}
        <Modal.Header closeButton>
          <Modal.Title>
            Select Batch for {selectedCourseForStudents?.course_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="batchSelect">
            <Form.Label>Available Batches</Form.Label>
            <Form.Select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="">Select a batch</option>
              {availableBatches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowBatchSelectionModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleViewStudentsInBatch}
            disabled={!selectedBatch || loadingCourseEnrollmentDetails}
          >
            View Students
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Student Progress Analysis Modal */}
      <Modal
        show={showStudentAnalysisModal}
        onHide={() => setShowStudentAnalysisModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Progress Analysis for{" "}
            {selectedStudentForAnalysis?.student_name ||
              selectedStudentForAnalysis?.full_name ||
              selectedStudentForAnalysis?.candidate_name}{" "}
            in {selectedCourseForStudents?.course_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingStudentProgress ? (
            <div className="text-center py-3">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading student progress...</p>
            </div>
          ) : studentProgressError ? (
            <Alert variant="danger">{studentProgressError}</Alert>
          ) : studentProgress.length === 0 ? (
            <Alert variant="info">
              No progress data found for this student.
            </Alert>
          ) : (
            <div>
              {studentProgress.map((progress, index) => (
                <Card key={index} className="mb-3">
                  <Card.Header>
                    <strong>Course:</strong>{" "}
                    {selectedCourseForStudents?.course_name ||
                      progress.course_id}
                  </Card.Header>
                  <Card.Body>
                    <p>
                      <strong>Module:</strong>{" "}
                      {progress.module_name || progress.module}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <Badge
                        bg={
                          progress.module_status === "completed"
                            ? "success"
                            : progress.module_status === "ongoing"
                              ? "primary"
                              : "warning"
                        }
                      >
                        {progress.module_status}
                      </Badge>
                    </p>
                    {progress.test_status && (
                      <p>
                        <strong>Test Status:</strong>{" "}
                        <Badge
                          bg={
                            progress.test_status === "passed"
                              ? "success"
                              : "danger"
                          }
                        >
                          {progress.test_status}
                        </Badge>
                      </p>
                    )}
                    {progress.test_score !== undefined && (
                      <p>
                        <strong>Test Score:</strong> {progress.test_score}%
                      </p>
                    )}
                    {progress.attempt_count !== undefined && (
                      <p>
                        <strong>Attempts:</strong> {progress.attempt_count}
                      </p>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowStudentAnalysisModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StudentAnalysis;
