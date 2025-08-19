import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, Calendar, User, CheckCircle, FileText, Tag } from 'lucide-react';

const QuestionCard = ({ question }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  return (
    <div className="btech-card">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-teal-600 transition-colors">
            <Link to={`/question/${question._id}`}>
              {question.title}
            </Link>
          </h3>
          {question.isVerified && (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" title="Verified Question" />
          )}
        </div>

        {/* Subject and Course */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">{question.subject}</span>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-600">{question.course}</span>
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {question.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
            {question.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{question.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Question Type and Difficulty */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getQuestionTypeColor(question.questionType)}`}>
            <FileText className="h-3 w-3 mr-1" />
            {question.questionType}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
        </div>

        {/* Year and Semester */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Year: {question.year}</span>
          <span>Semester: {question.semester}</span>
        </div>
      </div>

      {/* Content Preview */}
      <div className="p-6">
        <p className="text-gray-700 text-sm line-clamp-3 mb-4">
          {question.content}
        </p>

        {/* File Attachment */}
        {question.fileName && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-md">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 truncate">{question.fileName}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{question.downloads}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{question.views}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(question.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {question.uploadedBy?.firstName} {question.uploadedBy?.lastName}
            </span>
            {question.uploadedBy?.studentId && (
              <span className="text-xs text-gray-500">({question.uploadedBy.studentId})</span>
            )}
          </div>
          <Link
            to={`/question/${question._id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
