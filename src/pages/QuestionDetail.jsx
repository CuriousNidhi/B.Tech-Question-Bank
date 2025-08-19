import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { questionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Download, 
  Eye, 
  Calendar, 
  User, 
  CheckCircle, 
  FileText, 
  Tag, 
  Edit, 
  Trash2, 
  Shield,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await questionsAPI.getQuestionById(id);
      setQuestion(response.data);
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error('Failed to load question');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      toast.error('Please login to download questions');
      return;
    }

    // Check if user has permission to download
    if (!question.isVerified && !isOwner && !isAdmin) {
      toast.error('This question is not verified yet. Only verified questions can be downloaded.');
      return;
    }

    try {
      setDownloading(true);
      console.log('Starting download for question:', id);
      
      const response = await questionsAPI.downloadQuestion(id);
      console.log('Download response received:', response);
      
      // Create blob with correct MIME type
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/pdf' 
      });
      
      // Get filename from response headers or use default
      let filename = question.fileName || `question-${id}.pdf`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      console.log('Creating download with filename:', filename);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      // Update download count locally
      setQuestion(prev => ({
        ...prev,
        downloads: (prev.downloads || 0) + 1
      }));
      
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
      setDownloading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setVerifying(true);
      const response = await questionsAPI.verifyQuestion(id);
      console.log('Verification response:', response.data);
      
      // Update the question with the response data if available, otherwise just mark as verified
      if (response.data.question) {
        setQuestion(response.data.question);
      } else {
        setQuestion(prev => ({ 
          ...prev, 
          isVerified: true,
          verifiedBy: user._id,
          verifiedAt: new Date()
        }));
      }
      
      toast.success('Question verified successfully!');
      
      // Refresh the question data to ensure it's up to date
      setTimeout(() => {
        fetchQuestion();
      }, 1000);
      
    } catch (error) {
      console.error('Error verifying question:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to verify questions');
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to verify question');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      await questionsAPI.deleteQuestion(id);
      toast.success('Question deleted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getQuestionTypeColor = (type) => {
    switch (type) {
      case 'MCQ':
        return 'bg-blue-100 text-blue-800';
      case 'Short Answer':
        return 'bg-purple-100 text-purple-800';
      case 'Long Answer':
        return 'bg-indigo-100 text-indigo-800';
      case 'Practical':
        return 'bg-orange-100 text-orange-800';
      case 'Assignment':
        return 'bg-pink-100 text-pink-800';
      case 'Project':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Question not found</h2>
          <p className="text-gray-600 mb-4">The question you're looking for doesn't exist.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && question.uploadedBy._id === user.id;
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Questions
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
                {question.isVerified && (
                  <CheckCircle className="h-6 w-6 text-green-500" title="Verified Question" />
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span className="font-medium">{question.subject}</span>
                <span>•</span>
                <span>{question.course}</span>
                <span>•</span>
                <span>Year {question.year}</span>
                <span>•</span>
                <span>{question.semester} Semester</span>
              </div>

              {/* Tags */}
              {question.tags && question.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Question Type and Difficulty */}
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getQuestionTypeColor(question.questionType)}`}>
                  <FileText className="h-4 w-4 mr-1" />
                  {question.questionType}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              {question.fileUrl && (
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      !question.isVerified && !isOwner && !isAdmin
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {downloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download
                      </>
                    )}
                  </button>
                  
                  {/* Download Access Info */}
                  <div className="text-xs text-gray-500 text-right">
                    {!question.isVerified && !isOwner && !isAdmin ? (
                      <span className="text-orange-600">⚠️ Verification required</span>
                    ) : (
                      <span>✅ Available for download</span>
                    )}
                  </div>
                </div>
              )}
              
              {isOwner && (
                <Link
                  to={`/question/${id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
              )}
              
              {isAdmin && !question.isVerified && (
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Verify
                    </>
                  )}
                </button>
              )}
              
              {(isOwner || isAdmin) && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Question Content */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Question Content</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{question.content}</p>
            </div>
          </div>

          {/* Solution */}
          {question.solution && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Solution</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{question.solution}</p>
              </div>
            </div>
          )}

          {/* File Attachment */}
          {question.fileUrl && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Attached File</h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{question.fileName}</p>
                    <p className="text-xs text-gray-500">Click download to get the file</p>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Stats and Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Statistics</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Downloads</span>
                  <span className="text-sm font-medium text-gray-900">{question.downloads || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Views</span>
                  <span className="text-sm font-medium text-gray-900">{question.views || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-sm font-medium ${
                    question.isVerified ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {question.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Upload Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {question.uploadedBy.firstName} {question.uploadedBy.lastName}
                    {question.uploadedBy.studentId && (
                      <span className="text-gray-500 ml-1">({question.uploadedBy.studentId})</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Uploaded on {formatDate(question.createdAt)}
                  </span>
                </div>
                {question.isVerified && question.verifiedBy && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">
                      Verified by {question.verifiedBy.firstName} {question.verifiedBy.lastName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
