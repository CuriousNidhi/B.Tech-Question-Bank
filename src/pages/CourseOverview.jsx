import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookOpen, Calendar, FileText, GraduationCap, ArrowRight } from 'lucide-react';

const CourseOverview = () => {
  const { course } = useParams();

  // Course configurations
  const courseConfig = {
    'computer-science': {
      name: 'Computer Science & Engineering',
      code: 'CSE',
      color: 'blue',
      description: 'Study algorithms, programming, software development, and computer systems.',
      duration: '4 Years (8 Semesters)',
      subjects: 'Core programming, algorithms, databases, networks, AI/ML, and software engineering.',
      careers: 'Software Developer, Data Scientist, System Analyst, Product Manager, Research Scientist'
    },
    'information-technology': {
      name: 'Information Technology',
      code: 'IT',
      color: 'purple',
      description: 'Focus on software applications, web development, and information systems.',
      duration: '4 Years (8 Semesters)',
      subjects: 'Web technologies, mobile development, database systems, networking, and cyber security.',
      careers: 'Web Developer, System Administrator, IT Consultant, Cyber Security Specialist, Project Manager'
    },
    'electronics-communication': {
      name: 'Electronics & Communication Engineering',
      code: 'ECE',
      color: 'green',
      description: 'Design and develop electronic systems, communication networks, and embedded systems.',
      duration: '4 Years (8 Semesters)',
      subjects: 'Circuit design, signal processing, communication systems, VLSI, and microwave engineering.',
      careers: 'Electronics Engineer, Telecommunications Engineer, Embedded Systems Developer, R&D Engineer'
    },
    'electrical-electronics': {
      name: 'Electrical & Electronics Engineering',
      code: 'EEE',
      color: 'red',
      description: 'Work with electrical power systems, renewable energy, and industrial automation.',
      duration: '4 Years (8 Semesters)',
      subjects: 'Power systems, electrical machines, control systems, renewable energy, and smart grids.',
      careers: 'Electrical Engineer, Power Systems Engineer, Automation Engineer, Energy Consultant'
    },
    'mechanical-engineering': {
      name: 'Mechanical Engineering',
      code: 'MECH',
      color: 'orange',
      description: 'Design, manufacture, and maintain mechanical systems and machinery.',
      duration: '4 Years (8 Semesters)',
      subjects: 'Thermodynamics, manufacturing, machine design, robotics, and automotive engineering.',
      careers: 'Mechanical Engineer, Manufacturing Engineer, Automotive Engineer, Robotics Engineer'
    }
  };

  const currentCourse = courseConfig[course];

  if (!currentCourse) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const semesters = Array.from({ length: 8 }, (_, i) => i + 1);

  const getSemesterSuffix = (sem) => {
    const suffixes = { 1: 'st', 2: 'nd', 3: 'rd' };
    return suffixes[sem] || 'th';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* CBSE-style Header */}
      <div className="gov-banner mb-6">
        <h1 className="text-2xl font-bold">B.TECH QUESTION BANK</h1>
        <p className="text-sm text-teal-100 mt-1">Previous Year Question Papers & Resources</p>
      </div>

      {/* Course Information Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-8">
        <div className={`bg-${currentCourse.color}-600 text-white px-6 py-6`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <GraduationCap className="h-8 w-8 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold">{currentCourse.name}</h1>
                  <p className="text-sm opacity-90">Bachelor of Technology - {currentCourse.code}</p>
                </div>
              </div>
              <p className="text-sm opacity-90 max-w-2xl">{currentCourse.description}</p>
            </div>
            <div className="text-right">
              <div className={`bg-${currentCourse.color}-500 px-4 py-2 rounded-full text-lg font-bold`}>
                {currentCourse.code}
              </div>
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <Calendar className="h-6 w-6 text-blue-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Duration</h3>
                <p className="text-gray-600 text-sm">{currentCourse.duration}</p>
              </div>
            </div>
            <div className="flex items-start">
              <BookOpen className="h-6 w-6 text-green-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Key Subjects</h3>
                <p className="text-gray-600 text-sm">{currentCourse.subjects}</p>
              </div>
            </div>
            <div className="flex items-start">
              <GraduationCap className="h-6 w-6 text-purple-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Career Opportunities</h3>
                <p className="text-gray-600 text-sm">{currentCourse.careers}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm">
          <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{currentCourse.name}</span>
        </nav>
      </div>

      {/* Semester Grid */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-teal-600 text-white px-6 py-4">
          <h2 className="text-xl font-bold">Semester-wise Question Papers</h2>
          <p className="text-teal-100 text-sm mt-1">Select a semester to view available question papers</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {semesters.map((semester) => (
              <Link
                key={semester}
                to={`/course/${course}/semester/${semester}`}
                className="group"
              >
                <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-6 transition-all duration-200 group-hover:shadow-md group-hover:border-gray-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${currentCourse.color}-100 rounded-full flex items-center justify-center`}>
                      <span className={`text-${currentCourse.color}-600 font-bold text-lg`}>
                        {semester}
                      </span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {semester}{getSemesterSuffix(semester)} Semester
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    Question papers and resources for semester {semester}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>View Papers</span>
                    </div>
                    <div className={`bg-${currentCourse.color}-100 text-${currentCourse.color}-700 px-2 py-1 rounded text-xs font-medium`}>
                      SEM {semester}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/upload"
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FileText className="h-5 w-5 mr-2" />
            Upload Question Paper
          </Link>
          <Link
            to="/bulk-upload"
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Bulk Upload Papers
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <ArrowRight className="h-5 w-5 mr-2" />
            View All Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
