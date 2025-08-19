import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { questionsAPI } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Filter, Search, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states - Default to showing ALL questions (verified and unverified)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    subject: searchParams.get('subject') || '',
    course: searchParams.get('course') || '',
    year: searchParams.get('year') || '',
    semester: searchParams.get('semester') || '',
    questionType: searchParams.get('questionType') || '',
    difficulty: searchParams.get('difficulty') || '',
    verified: searchParams.get('verified') || '', // Empty = show all questions
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      // Clean up filters - only send non-empty values
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value && value.trim() !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      const params = {
        page: currentPage,
        limit: 12,
        ...cleanFilters
      };

      console.log('🔍 HOME PAGE - Fetching questions with params:', params);
      console.log('📋 Current filters:', filters);

      const response = await questionsAPI.getAllQuestions(params);
      console.log('✅ HOME PAGE - Questions received:', response.data.questions.length);
      console.log('📊 HOME PAGE - Total questions available:', response.data.total);
      
      setQuestions(response.data.questions);
      setTotalPages(response.data.totalPages);
      setTotalQuestions(response.data.total);
    } catch (error) {
      console.error('❌ HOME PAGE - Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🏠 HOME PAGE - Component mounted/updated');
    console.log('🏠 HOME PAGE - Current page:', currentPage);
    console.log('🏠 HOME PAGE - Current filters:', filters);
    fetchQuestions();
  }, [currentPage, filters]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Listen for question verification events to refresh the list
  useEffect(() => {
    const handleQuestionVerified = (event) => {
      console.log('🔄 HOME PAGE - Question was verified, refreshing list:', event.detail);
      fetchQuestions();
    };

    window.addEventListener('questionVerified', handleQuestionVerified);
    
    return () => {
      window.removeEventListener('questionVerified', handleQuestionVerified);
    };
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    console.log('🔄 HOME PAGE - Clearing all filters to show ALL questions');
    setFilters({
      search: '',
      subject: '',
      course: '',
      year: '',
      semester: '',
      questionType: '',
      difficulty: '',
      verified: '', // Empty string = show all questions (verified + unverified)
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownload = async (questionId) => {
    try {
      const response = await questionsAPI.downloadQuestion(questionId);
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `question-${questionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Question downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download question');
    }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* CBSE-style Header Banner */}
      <div className="gov-banner mb-6">
        <h1 className="text-2xl font-bold">QUESTION BANK</h1>
        <p className="text-sm text-teal-100 mt-1">B.Tech Engineering Question Papers & Resources</p>
      </div>

      {/* B.Tech Categories Banner */}
      <div className="gov-sub-banner mb-6">
        <div className="flex items-center justify-center space-x-8">
          <span className="font-medium">B.Tech Branches:</span>
          <Link 
            to="/course/computer-science"
            className={`btech-badge btech-badge-cs cursor-pointer transition-colors duration-200 ${
              filters.course === 'Computer Science' 
                ? 'bg-blue-200 text-blue-900 ring-2 ring-blue-500' 
                : 'hover:bg-blue-200 hover:text-blue-900'
            }`}
          >
            Computer Science
          </Link>
          <Link 
            to="/course/information-technology"
            className={`btech-badge btech-badge-it cursor-pointer transition-colors duration-200 ${
              filters.course === 'Information Technology' 
                ? 'bg-purple-200 text-purple-900 ring-2 ring-purple-500' 
                : 'hover:bg-purple-200 hover:text-purple-900'
            }`}
          >
            Information Technology
          </Link>
          <Link 
            to="/course/electronics-communication"
            className={`btech-badge btech-badge-ece cursor-pointer transition-colors duration-200 ${
              filters.course === 'Electronics & Communication' 
                ? 'bg-green-200 text-green-900 ring-2 ring-green-500' 
                : 'hover:bg-green-200 hover:text-green-900'
            }`}
          >
            Electronics & Communication
          </Link>
          <Link 
            to="/course/electrical-electronics"
            className={`btech-badge btech-badge-eee cursor-pointer transition-colors duration-200 ${
              filters.course === 'Electrical & Electronics' 
                ? 'bg-red-200 text-red-900 ring-2 ring-red-500' 
                : 'hover:bg-red-200 hover:text-red-900'
            }`}
          >
            Electrical & Electronics
          </Link>
          <Link 
            to="/course/mechanical-engineering"
            className={`btech-badge btech-badge-mech cursor-pointer transition-colors duration-200 ${
              filters.course === 'Mechanical Engineering' 
                ? 'bg-orange-200 text-orange-900 ring-2 ring-orange-500' 
                : 'hover:bg-orange-200 hover:text-orange-900'
            }`}
          >
            Mechanical Engineering
          </Link>
          <button 
            onClick={() => handleFilterChange('course', '')}
            className={`btech-badge bg-gray-100 text-gray-800 cursor-pointer transition-colors duration-200 ${
              !filters.course 
                ? 'bg-gray-200 text-gray-900 ring-2 ring-gray-500' 
                : 'hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            View All
          </button>
        </div>
      </div>

      {/* CBSE-style Table View */}
      {filters.course && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-teal-600 text-white px-6 py-4">
              <h2 className="text-xl font-bold">B.Tech {filters.course} Question Papers</h2>
              <p className="text-teal-100 text-sm mt-1">Previous Year Question Papers & Resources</p>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sr. No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      College/University
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Semester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center">
                        <LoadingSpinner size="md" />
                      </td>
                    </tr>
                  ) : questions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No questions found for {filters.course}</p>
                        <p className="text-sm">Try uploading some questions for this branch</p>
                      </td>
                    </tr>
                  ) : (
                    questions.map((question, index) => (
                      <tr key={question._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {((currentPage - 1) * 12) + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-teal-600 font-bold text-xs">U</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">University Name</div>
                              <div className="text-gray-500 text-xs">Department of {filters.course}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{question.subject}</div>
                            <div className="text-gray-500 text-xs">{question.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            question.questionType === 'MCQ' ? 'bg-blue-100 text-blue-800' :
                            question.questionType === 'Long Answer' ? 'bg-green-100 text-green-800' :
                            question.questionType === 'Practical' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {question.questionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {question.semester}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {question.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/question/${question._id}`}
                              className="text-teal-600 hover:text-teal-900 transition-colors"
                            >
                              View Details
                            </Link>
                            {question.fileName && (
                              <button
                                onClick={() => handleDownload(question._id)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                              >
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
            
            {/* Pagination for Table */}
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
                        Showing <span className="font-medium">{((currentPage - 1) * 12) + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * 12, totalQuestions)}</span> of{' '}
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
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                        ))}
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
      )}

             {/* Header - Only show when no course is selected */}
       {!filters.course && (
         <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900 mb-2">
             Question Bank
           </h1>
           <p className="text-gray-600">
             Find and share previous year questions from various subjects and courses
           </p>
         </div>
       )}

             {/* Search and Filters - Only show when no course is selected */}
       {!filters.course && (
         <div className="mb-6">
           <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
             {/* Search Bar */}
             <div className="flex-1 max-w-md">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                 <input
                   type="text"
                   placeholder="Search questions..."
                   value={filters.search}
                   onChange={(e) => handleFilterChange('search', e.target.value)}
                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 />
               </div>
             </div>

             {/* Filter Toggle */}
             <div className="flex items-center gap-2">
               <button
                 onClick={() => setShowFilters(!showFilters)}
                 className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
               >
                 <Filter className="h-5 w-5" />
                 <span>Filters</span>
               </button>
               {(filters.subject || filters.course || filters.year || filters.semester || filters.questionType || filters.difficulty) && (
                 <button
                   onClick={clearFilters}
                   className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                 >
                   <X className="h-4 w-4" />
                   <span>Clear</span>
                 </button>
               )}
             </div>
           </div>

           {/* Filters Panel */}
           {showFilters && (
             <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {/* Subject */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Subject
                   </label>
                   <input
                     type="text"
                     placeholder="e.g., Mathematics"
                     value={filters.subject}
                     onChange={(e) => handleFilterChange('subject', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>

                 {/* Course */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Course
                   </label>
                   <input
                     type="text"
                     placeholder="e.g., Computer Science"
                     value={filters.course}
                     onChange={(e) => handleFilterChange('course', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>

                 {/* Year */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Year
                   </label>
                   <input
                     type="number"
                     placeholder="e.g., 2023"
                     value={filters.year}
                     onChange={(e) => handleFilterChange('year', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>

                 {/* Semester */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Semester
                   </label>
                   <select
                     value={filters.semester}
                     onChange={(e) => handleFilterChange('semester', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="">All Semesters</option>
                     <option value="1st">1st Semester</option>
                     <option value="2nd">2nd Semester</option>
                     <option value="3rd">3rd Semester</option>
                     <option value="4th">4th Semester</option>
                     <option value="5th">5th Semester</option>
                     <option value="6th">6th Semester</option>
                     <option value="7th">7th Semester</option>
                     <option value="8th">8th Semester</option>
                   </select>
                 </div>

                 {/* Question Type */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Question Type
                   </label>
                   <select
                     value={filters.questionType}
                     onChange={(e) => handleFilterChange('questionType', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="">All Types</option>
                     <option value="MCQ">MCQ</option>
                     <option value="Short Answer">Short Answer</option>
                     <option value="Long Answer">Long Answer</option>
                     <option value="Practical">Practical</option>
                     <option value="Assignment">Assignment</option>
                     <option value="Project">Project</option>
                   </select>
                 </div>

                 {/* Difficulty */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Difficulty
                   </label>
                   <select
                     value={filters.difficulty}
                     onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="">All Difficulties</option>
                     <option value="Easy">Easy</option>
                     <option value="Medium">Medium</option>
                     <option value="Hard">Hard</option>
                   </select>
                 </div>

                 {/* Verified */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Verification
                   </label>
                   <select
                     value={filters.verified}
                     onChange={(e) => handleFilterChange('verified', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="">All Questions</option>
                     <option value="true">Verified Only</option>
                     <option value="false">Unverified Only</option>
                   </select>
                 </div>

                 {/* Sort */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Sort By
                   </label>
                   <select
                     value={`${filters.sortBy}-${filters.sortOrder}`}
                     onChange={(e) => {
                       const [sortBy, sortOrder] = e.target.value.split('-');
                       handleFilterChange('sortBy', sortBy);
                       handleFilterChange('sortOrder', sortOrder);
                     }}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="createdAt-desc">Newest First</option>
                     <option value="createdAt-asc">Oldest First</option>
                     <option value="downloads-desc">Most Downloaded</option>
                     <option value="views-desc">Most Viewed</option>
                     <option value="title-asc">Title A-Z</option>
                     <option value="title-desc">Title Z-A</option>
                   </select>
                 </div>
               </div>
             </div>
           )}
         </div>
       )}

             {/* Results Count and Card View - Only show when no course is selected */}
       {!filters.course && (
         <>
           {/* Results Count */}
           <div className="mb-6">
             <p className="text-gray-600">
               Showing {questions.length} of {totalQuestions} questions
             </p>
           </div>

           {/* Questions Grid */}
           {loading ? (
             <div className="flex items-center justify-center py-12">
               <LoadingSpinner size="lg" />
             </div>
           ) : questions.length === 0 ? (
             <div className="text-center py-12">
               <div className="text-gray-400 mb-4">
                 <Search className="h-16 w-16 mx-auto" />
               </div>
               <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
               <p className="text-gray-600">
                 Try adjusting your search criteria or filters
               </p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {questions.map((question) => (
                 <QuestionCard key={question._id} question={question} />
               ))}
             </div>
           )}

           {/* Pagination */}
           {totalPages > 1 && (
             <div className="mt-8 flex justify-center">
               <nav className="flex items-center space-x-2">
                 <button
                   onClick={() => handlePageChange(currentPage - 1)}
                   disabled={currentPage === 1}
                   className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Previous
                 </button>
                 
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                   <button
                     key={page}
                     onClick={() => handlePageChange(page)}
                     className={`px-3 py-2 text-sm font-medium rounded-md ${
                       currentPage === page
                         ? 'bg-blue-600 text-white'
                         : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                     }`}
                   >
                     {page}
                   </button>
                 ))}
                 
                 <button
                   onClick={() => handlePageChange(currentPage + 1)}
                   disabled={currentPage === totalPages}
                   className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Next
                 </button>
               </nav>
             </div>
           )}
         </>
       )}
    </div>
  );
};

export default Home;
