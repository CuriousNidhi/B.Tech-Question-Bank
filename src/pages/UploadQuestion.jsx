import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsAPI } from '../services/api';
import { Upload, FileText, X, Plus, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const UploadQuestion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    course: '',
    year: new Date().getFullYear(),
    semester: '',
    questionType: '',
    difficulty: '',
    content: '',
    solution: '',
    tags: '',
    marks: '',
    timeLimit: '',
    instructions: '',
    file: null
  });

  const [errors, setErrors] = useState({});

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (formData.title || formData.content) {
        handleAutoSave();
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [formData]);

  const handleAutoSave = async () => {
    if (!formData.title || !formData.content) return;
    
    setAutoSaving(true);
    try {
      // Save to localStorage as draft
      localStorage.setItem('questionDraft', JSON.stringify(formData));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('questionDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...draft, file: null })); // Don't restore file
        toast.success('Draft loaded successfully');
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Check file type - Extended support for all image and document formats
      const allowedTypes = [
        // Document formats
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/vnd.oasis.opendocument.text',
        'application/rtf',
        'text/plain',
        'text/rtf',
        
        // Spreadsheet formats
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        
        // Presentation formats
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        
        // Image formats - ALL supported types
        'image/jpeg', 
        'image/jpg',
        'image/png', 
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/tiff',
        'image/tif',
        'image/svg+xml',
        'image/x-icon',
        'image/vnd.microsoft.icon'
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Unsupported file type! Allowed: PDF, DOC, DOCX, TXT, RTF, ODT, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF, WEBP, BMP, TIFF, SVG, ICO');
        return;
      }

      setFormData(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      file: null
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.course.trim()) newErrors.course = 'Course is required';
    if (!formData.semester) newErrors.semester = 'Semester is required';
    if (!formData.questionType) newErrors.questionType = 'Question type is required';
    if (!formData.difficulty) newErrors.difficulty = 'Difficulty level is required';
    if (!formData.content.trim()) newErrors.content = 'Question content is required';
    if (formData.marks && (isNaN(formData.marks) || formData.marks < 0)) {
      newErrors.marks = 'Marks must be a positive number';
    }
    if (formData.timeLimit && (isNaN(formData.timeLimit) || formData.timeLimit < 0)) {
      newErrors.timeLimit = 'Time limit must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 FORM SUBMIT STARTED');
    console.log('📝 Form data:', formData);
    console.log('📎 File selected:', formData.file ? {
      name: formData.file.name,
      size: formData.file.size,
      type: formData.file.type
    } : 'No file');
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    console.log('📤 Sending request to API...');

    try {
      console.log('🔄 Calling questionsAPI.createQuestion...');
      const response = await questionsAPI.createQuestion(formData);
      console.log('✅ Upload successful!', response);
      toast.success('Question uploaded successfully!');
      // Clear draft after successful upload
      localStorage.removeItem('questionDraft');
      navigate(`/question/${response.data.question._id}`);
    } catch (error) {
      console.error('❌ UPLOAD ERROR:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      const message = error.response?.data?.message || 'Failed to upload question';
      toast.error(message);
      
      // Set field-specific errors
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('questionDraft');
    setFormData({
      title: '',
      subject: '',
      course: '',
      year: new Date().getFullYear(),
      semester: '',
      questionType: '',
      difficulty: '',
      content: '',
      solution: '',
      tags: '',
      marks: '',
      timeLimit: '',
      instructions: '',
      file: null
    });
    setErrors({});
    toast.success('Draft cleared');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* CBSE-style Header */}
      <div className="gov-banner mb-6">
        <h1 className="text-2xl font-bold">UPLOAD QUESTION</h1>
        <p className="text-sm text-teal-100 mt-1">B.Tech Engineering Question Paper Submission</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="progress-step active">1</div>
            <div className="progress-line active"></div>
            <div className="progress-step pending">2</div>
            <div className="progress-line"></div>
            <div className="progress-step pending">3</div>
            <div className="progress-line"></div>
            <div className="progress-step pending">4</div>
          </div>
          <div className="text-sm text-gray-600">
            Step 1 of 4: Basic Information
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Basic Info</span>
          <span>Question Content</span>
          <span>File Upload</span>
          <span>Review & Submit</span>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">General Information</h2>
            <p className="text-gray-600">
              Share previous year B.Tech questions to help other engineering students prepare for their exams
            </p>
          </div>
          <div className="flex items-center gap-4">
            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
            {autoSaving && (
              <div className="flex items-center gap-2 text-sm text-blue-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                Auto-saving...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive title for the question"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="e.g., Mathematics, Physics, Computer Science"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.subject ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science, Engineering, Arts"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.course ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.course && <p className="mt-1 text-sm text-red-600">{errors.course}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                min="2000"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester *
              </label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.semester ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Semester</option>
                <option value="1st">1st Semester</option>
                <option value="2nd">2nd Semester</option>
                <option value="3rd">3rd Semester</option>
                <option value="4th">4th Semester</option>
                <option value="5th">5th Semester</option>
                <option value="6th">6th Semester</option>
                <option value="7th">7th Semester</option>
                <option value="8th">8th Semester</option>
              </select>
              {errors.semester && <p className="mt-1 text-sm text-red-600">{errors.semester}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type *
              </label>
              <select
                name="questionType"
                value={formData.questionType}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.questionType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Question Type</option>
                <option value="MCQ">Multiple Choice Question (MCQ)</option>
                <option value="Short Answer">Short Answer</option>
                <option value="Long Answer">Long Answer</option>
                <option value="Essay">Essay</option>
                <option value="Practical">Practical</option>
                <option value="Assignment">Assignment</option>
                <option value="Project">Project</option>
                <option value="Case Study">Case Study</option>
                <option value="Problem Solving">Problem Solving</option>
                <option value="Programming">Programming</option>
                <option value="Lab Work">Lab Work</option>
                <option value="Presentation">Presentation</option>
              </select>
              {errors.questionType && <p className="mt-1 text-sm text-red-600">{errors.questionType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level *
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.difficulty ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Very Hard">Very Hard</option>
              </select>
              {errors.difficulty && <p className="mt-1 text-sm text-red-600">{errors.difficulty}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marks (Optional)
              </label>
              <input
                type="number"
                name="marks"
                value={formData.marks}
                onChange={handleInputChange}
                placeholder="e.g., 10, 25, 50"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.marks ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.marks && <p className="mt-1 text-sm text-red-600">{errors.marks}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (minutes, Optional)
              </label>
              <input
                type="number"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleInputChange}
                placeholder="e.g., 30, 60, 120"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.timeLimit ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.timeLimit && <p className="mt-1 text-sm text-red-600">{errors.timeLimit}</p>}
            </div>
          </div>

          {/* Question Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Question Content *
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
            
            {showPreview ? (
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-2">Preview:</h3>
                <div className="prose max-w-none">
                  <h4 className="text-lg font-semibold">{formData.title || 'Question Title'}</h4>
                  <div className="whitespace-pre-wrap text-gray-700">{formData.content || 'Question content will appear here...'}</div>
                </div>
              </div>
            ) : (
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={8}
                placeholder="Enter the complete question content here. You can use markdown formatting for better presentation..."
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.content ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
          </div>

          {/* Instructions (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions (Optional)
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any special instructions for students attempting this question..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Solution (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Solution (Optional)
            </label>
            <textarea
              name="solution"
              value={formData.solution}
              onChange={handleInputChange}
              rows={6}
              placeholder="Enter the solution or answer to the question..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Enter tags separated by commas (e.g., calculus, algebra, functions)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Tags help other students find your question more easily
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach File (Optional)
            </label>
            {!formData.file ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.tif,.svg,.ico"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    All document types (PDF, DOC, DOCX, TXT, RTF, ODT, XLS, XLSX, PPT, PPTX) and images (JPG, PNG, GIF, WEBP, BMP, TIFF, SVG, ICO) up to 10MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formData.file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={clearDraft}
                className="px-6 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 transition-colors"
              >
                Clear Draft
              </button>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleAutoSave}
                disabled={autoSaving}
                className="flex items-center gap-2 px-6 py-2 border border-blue-300 rounded-md text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {autoSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Upload Question
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadQuestion;
