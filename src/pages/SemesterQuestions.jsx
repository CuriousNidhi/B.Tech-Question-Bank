import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { questionsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Download, Eye, FileText, Calendar, BookOpen, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const SemesterQuestions = () => {
  const { course, semester } = useParams();
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Course configurations
  const courseConfig = {
    'computer-science': {
      name: 'Computer Science & Engineering',
      code: 'CSE',
      color: 'blue',
      semesters: {
        1: ['Mathematics I', 'Physics', 'Chemistry', 'Engineering Graphics', 'Basic Electrical Engineering'],
        2: ['Mathematics II', 'Physics II', 'Chemistry II', 'Programming in C', 'Environmental Science'],
        3: ['Data Structures', 'Computer Organization', 'Discrete Mathematics', 'Object Oriented Programming', 'Digital Electronics'],
        4: ['Database Management Systems', 'Computer Networks', 'Operating Systems', 'Software Engineering', 'Theory of Computation'],
        5: ['Compiler Design', 'Computer Graphics', 'Artificial Intelligence', 'Web Technologies', 'Mobile Computing'],
        6: ['Machine Learning', 'Information Security', 'Cloud Computing', 'Distributed Systems', 'Project Work I'],
        7: ['Big Data Analytics', 'Internet of Things', 'Blockchain Technology', 'Advanced Algorithms', 'Project Work II'],
        8: ['Industrial Training', 'Major Project', 'Seminar', 'Comprehensive Exam', 'Ethics in Engineering']
      }
    },
    'information-technology': {
      name: 'Information Technology',
      code: 'IT',
      color: 'purple',
      semesters: {
        1: ['Mathematics I', 'Physics', 'Chemistry', 'Engineering Graphics', 'Basic Computer Programming'],
        2: ['Mathematics II', 'Physics II', 'Chemistry II', 'Data Structures', 'Digital Electronics'],
        3: ['Computer Networks', 'Database Systems', 'Object Oriented Programming', 'System Analysis & Design', 'Microprocessors'],
        4: ['Software Engineering', 'Web Technologies', 'Operating Systems', 'Computer Graphics', 'Information Systems'],
        5: ['Mobile Application Development', 'E-Commerce', 'Network Security', 'Human Computer Interaction', 'Software Testing'],
        6: ['Cloud Computing', 'Data Mining', 'Wireless Networks', 'Project Management', 'Project Work I'],
        7: ['Internet of Things', 'Cyber Security', 'Business Intelligence', 'Advanced Web Technologies', 'Project Work II'],
        8: ['Industrial Training', 'Major Project', 'Technical Seminar', 'Comprehensive Exam', 'Professional Ethics']
      }
    },
    'electronics-communication': {
      name: 'Electronics & Communication Engineering',
      code: 'ECE',
      color: 'green',
      semesters: {
        1: ['Mathematics I', 'Physics', 'Chemistry', 'Engineering Graphics', 'Basic Electrical Engineering'],
        2: ['Mathematics II', 'Physics II', 'Chemistry II', 'Circuit Analysis', 'Electronic Devices'],
        3: ['Analog Electronics', 'Digital Electronics', 'Signals & Systems', 'Network Analysis', 'Electromagnetic Fields'],
        4: ['Microprocessors', 'Communication Systems', 'Control Systems', 'VLSI Design', 'Antenna Theory'],
        5: ['Digital Signal Processing', 'Microwave Engineering', 'Optical Communication', 'Embedded Systems', 'Power Electronics'],
        6: ['Satellite Communication', 'Mobile Communication', 'Digital Image Processing', 'VLSI Technology', 'Project Work I'],
        7: ['Wireless Networks', 'RF Circuit Design', 'Biomedical Electronics', 'Nanotechnology', 'Project Work II'],
        8: ['Industrial Training', 'Major Project', 'Technical Seminar', 'Comprehensive Exam', 'Engineering Economics']
      }
    },
    'electrical-electronics': {
      name: 'Electrical & Electronics Engineering',
      code: 'EEE',
      color: 'red',
      semesters: {
        1: ['Mathematics I', 'Physics', 'Chemistry', 'Engineering Graphics', 'Basic Electrical Engineering'],
        2: ['Mathematics II', 'Physics II', 'Chemistry II', 'Electrical Circuits', 'Electronic Devices'],
        3: ['Electrical Machines I', 'Power Electronics', 'Analog Electronics', 'Electrical Measurements', 'Control Systems'],
        4: ['Electrical Machines II', 'Power Systems I', 'Digital Electronics', 'Microprocessors', 'Electric Drives'],
        5: ['Power Systems II', 'High Voltage Engineering', 'Renewable Energy Systems', 'Industrial Automation', 'Smart Grid'],
        6: ['Power System Protection', 'Electric Traction', 'Energy Management', 'HVDC Transmission', 'Project Work I'],
        7: ['Power Quality', 'Electric Vehicles', 'Energy Storage Systems', 'Advanced Control Systems', 'Project Work II'],
        8: ['Industrial Training', 'Major Project', 'Technical Seminar', 'Comprehensive Exam', 'Power System Economics']
      }
    },
    'mechanical-engineering': {
      name: 'Mechanical Engineering',
      code: 'MECH',
      color: 'orange',
      semesters: {
        1: ['Mathematics I', 'Physics', 'Chemistry', 'Engineering Graphics', 'Workshop Technology'],
        2: ['Mathematics II', 'Physics II', 'Chemistry II', 'Engineering Mechanics', 'Material Science'],
        3: ['Thermodynamics', 'Strength of Materials', 'Manufacturing Processes', 'Machine Drawing', 'Fluid Mechanics'],
        4: ['Heat Transfer', 'Machine Design I', 'Production Technology', 'Kinematics of Machines', 'Metrology'],
        5: ['IC Engines', 'Machine Design II', 'Dynamics of Machines', 'Automobile Engineering', 'Industrial Engineering'],
        6: ['Refrigeration & Air Conditioning', 'CNC Machines', 'Finite Element Analysis', 'Operations Research', 'Project Work I'],
        7: ['Robotics', 'Advanced Manufacturing', 'Composite Materials', 'Energy Engineering', 'Project Work II'],
        8: ['Industrial Training', 'Major Project', 'Technical Seminar', 'Comprehensive Exam', 'Engineering Management']
      }
    }
  };

  const currentCourseConfig = courseConfig[course];
  const semesterSubjects = currentCourseConfig?.semesters[parseInt(semester)] || [];

  useEffect(() => {
    fetchQuestions();
  }, [course, semester, currentPage]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        course: currentCourseConfig?.name,
        semester: `${semester}${getSemesterSuffix(semester)}`
      };

      const response = await questionsAPI.getAllQuestions(params);
      setQuestions(response.data?.questions || []);
      setTotalPages(response.data?.totalPages || 1);
      setTotalQuestions(response.data?.total || 0);
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Set empty data in case of error
      setQuestions([]);
      setTotalPages(1);
      setTotalQuestions(0);
    } finally {
      setLoading(false);
    }
  };

  const getSemesterSuffix = (sem) => {
    const suffixes = { 1: 'st', 2: 'nd', 3: 'rd' };
    return suffixes[sem] || 'th';
  };

  const handleDownload = async (questionId) => {
    try {
      const response = await questionsAPI.downloadQuestion(questionId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `question-${questionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Question paper downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download question paper');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentCourseConfig) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* CBSE-style Header */}
      <div className="gov-banner mb-6">
        <h1 className="text-2xl font-bold">B.TECH QUESTION BANK</h1>
        <p className="text-sm text-teal-100 mt-1">Previous Year Question Papers & Resources</p>
      </div>

      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-6">
        <div className={`bg-${currentCourseConfig.color}-600 text-white px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{currentCourseConfig.name}</h2>
              <p className="text-sm opacity-90">Semester {semester} - Question Papers Collection</p>
            </div>
            <div className="text-right">
              <div className={`bg-${currentCourseConfig.color}-500 px-3 py-1 rounded-full text-sm font-medium`}>
                {currentCourseConfig.code} - SEM {semester}
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-gray-50 px-6 py-3 border-b">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            <span className="text-gray-400">/</span>
            <Link to={`/course/${course}`} className="text-blue-600 hover:text-blue-800">
              {currentCourseConfig.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Semester {semester}</span>
          </nav>
        </div>

        {/* Semester Subjects */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Subjects in Semester {semester}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {semesterSubjects.map((subject, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                <div className="flex items-center">
                  <div className={`w-8 h-8 bg-${currentCourseConfig.color}-100 rounded-full flex items-center justify-center mr-3`}>
                    <span className={`text-${currentCourseConfig.color}-600 font-bold text-xs`}>
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{subject}</div>
                    <div className="text-xs text-gray-500">{currentCourseConfig.code} {semester}{getSemesterSuffix(semester)} Sem</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Papers Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-teal-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Question Papers Available</h3>
              <p className="text-teal-100 text-sm mt-1">
                Semester {semester} - {totalQuestions} Question Papers Found
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-teal-500 px-3 py-1 rounded-full text-sm">
                {totalQuestions} Papers
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sr. No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academic Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University/College
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <LoadingSpinner size="md" />
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <FileText className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Question Papers Available
                    </h3>
                    <p className="text-gray-600 mb-4">
                      No question papers found for {currentCourseConfig.name} - Semester {semester}
                    </p>
                    <Link
                      to="/upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Upload Question Paper
                    </Link>
                  </td>
                </tr>
              ) : (
                questions.map((question, index) => (
                  <tr key={question._id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {((currentPage - 1) * 20) + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{question.subject || 'N/A'}</div>
                        <div className="text-gray-500 text-xs">{question.title || 'No title'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        question.questionType === 'Mid Term' ? 'bg-blue-100 text-blue-800' :
                        question.questionType === 'End Term' ? 'bg-red-100 text-red-800' :
                        question.questionType === 'Sessional' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {question.questionType || 'End Term'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {question.year || '2024'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <GraduationCap className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-medium">University</div>
                          <div className="text-gray-500 text-xs">Engineering College</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'Recently'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link
                          to={`/question/${question._id || '#'}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                        {question.fileName && (
                          <button
                            onClick={() => handleDownload(question._id)}
                            className="text-green-600 hover:text-green-900 transition-colors flex items-center"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <nav className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((currentPage - 1) * 20) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * 20, totalQuestions)}</span> of{' '}
                    <span className="font-medium">{totalQuestions}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-teal-50 border-teal-500 text-teal-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default SemesterQuestions;
