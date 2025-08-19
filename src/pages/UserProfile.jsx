import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, questionsAPI } from '../services/api';
import { User, Users, Calendar, MapPin, Link as LinkIcon, Download, Eye, FileText } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import QuestionCard from '../components/QuestionCard';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('questions');

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUserById(userId);
      const userData = response.data.user;
      setUser(userData);
      fetchUserQuestions();
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserQuestions = async () => {
    try {
      setQuestionsLoading(true);
      const response = await questionsAPI.getQuestionsByUser(userId, { limit: 10 });
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching user questions:', error);
    } finally {
      setQuestionsLoading(false);
    }
  };



  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
        <p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-6">
            <img
              src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=3b82f6&color=fff&size=128`}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600 mb-2">@{user.username}</p>
              {user.bio && (
                <p className="text-gray-700 mb-3">{user.bio}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          

        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{questions.length}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{user.uploadsCount || 0}</div>
            <div className="text-sm text-gray-600">Uploads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{user.downloadsCount || 0}</div>
            <div className="text-sm text-gray-600">Downloads</div>
          </div>
        </div>
      </div>

              {/* Tabs */}
        <div className="card mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'questions'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Questions
              </button>
            </nav>
          </div>

        {/* Tab Content */}
        <div className="py-4">
          {activeTab === 'questions' && (
            <div>
              {questionsLoading ? (
                <LoadingSpinner />
              ) : questions.length > 0 ? (
                <div className="space-y-6">
                  {questions.map((question) => (
                    <QuestionCard key={question._id} question={question} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                  <p className="text-gray-600">
                    {isOwnProfile 
                      ? "You haven't uploaded any questions yet. Start sharing previous year questions!"
                      : `${user.firstName} hasn't uploaded any questions yet.`
                    }
                  </p>
                  {isOwnProfile && (
                    <Link to="/upload" className="btn-primary mt-4">
                      Upload Your First Question
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
