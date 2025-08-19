import React, { useState, useEffect } from 'react';
import { questionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Shield, 
  CheckCircle, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  FileText,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState({});
  const [downloading, setDownloading] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'verified', 'unverified'

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchQuestions();
    }
  }, [user, filter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50, // Show more questions for admin
        verified: filter === 'verified' ? 'true' : filter === 'unverified' ? 'false' : undefined
      };
      
      const response = await questionsAPI.getAllQuestions(params);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (questionId) => {
    try {
      setVerifying(prev => ({ ...prev, [questionId]: true }));
      const response = await questionsAPI.verifyQuestion(questionId);
      
      // Update the question in the list
      setQuestions(prev => prev.map(q => 
        q._id === questionId 
          ? { ...q, isVerified: true, verifiedBy: user._id, verifiedAt: new Date() }
          : q
      ));
      
      toast.success('Question verified successfully!');
      
      // Log the verification for debugging
      console.log('✅ ADMIN DASHBOARD - Question verified:', {
        questionId,
        title: questions.find(q => q._id === questionId)?.title,
        wasVerified: questions.find(q => q._id === questionId)?.isVerified,
        nowVerified: true
      });
      
      // Trigger a global refresh event for home page
      window.dispatchEvent(new CustomEvent('questionVerified', { 
        detail: { questionId, verified: true } 
      }));
    } catch (error) {
      console.error('Error verifying question:', error);
      toast.error(error.response?.data?.message || 'Failed to verify question');
    } finally {
      setVerifying(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleDownload = async (questionId, fileName) => {
    try {
      setDownloading(prev => ({ ...prev, [questionId]: true }));
      console.log('Starting download for question:', questionId);
      
      const response = await questionsAPI.downloadQuestion(questionId);
      console.log('Download response received:', response);
      
      // Create blob with correct MIME type
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/pdf' 
      });
      
      // Get filename from response headers or use provided filename
      let downloadFilename = fileName || `question-${questionId}.pdf`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          downloadFilename = filenameMatch[1];
        }
      }
      
      console.log('Creating download with filename:', downloadFilename);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('File downloaded successfully!');
    } catch (error) {
      console.error('Error downloading file:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to download this question');
      } else if (error.response?.status === 404) {
        toast.error('File not found or has been removed');
      } else if (error.response?.status === 500) {
        toast.error('Server error while downloading file');
      } else {
        toast.error(error.response?.data?.message || 'Failed to download file');
      }
    } finally {
      setDownloading(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="text-red-500 mb-4">
          <AlertCircle className="h-16 w-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="gov-banner mb-6">
        <h1 className="text-2xl font-bold">ADMIN DASHBOARD</h1>
        <p className="text-sm text-teal-100 mt-1">Question Verification & Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">
                {questions.filter(q => q.isVerified).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {questions.filter(q => !q.isVerified).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Questions
          </button>
          <button
            onClick={() => setFilter('unverified')}
            className={`px-4 py-2 rounded-md ${
              filter === 'unverified' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending Verification
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded-md ${
              filter === 'verified' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Verified Questions
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Questions {filter !== 'all' && `(${filter})`}
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-gray-600">No questions match the current filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {questions.map((question) => (
                  <tr key={question._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {question.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {question.course} • {question.semester} • {question.year}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{question.subject}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {question.uploadedBy?.firstName} {question.uploadedBy?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(question.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {question.isVerified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <a
                        href={`/question/${question._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4 inline mr-1" />
                        View
                      </a>
                      
                      {question.fileUrl && (
                        <button
                          onClick={() => handleDownload(question._id, question.fileName)}
                          disabled={downloading[question._id]}
                          className="text-green-600 hover:text-green-900 ml-2 disabled:opacity-50"
                        >
                          {downloading[question._id] ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 inline mr-1"></div>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 inline mr-1" />
                              Download
                            </>
                          )}
                        </button>
                      )}
                      
                      {!question.isVerified && (
                        <button
                          onClick={() => handleVerify(question._id)}
                          disabled={verifying[question._id]}
                          className="text-green-600 hover:text-green-900 ml-2 disabled:opacity-50"
                        >
                          {verifying[question._id] ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 inline mr-1"></div>
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Shield className="h-4 w-4 inline mr-1" />
                              Verify
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
