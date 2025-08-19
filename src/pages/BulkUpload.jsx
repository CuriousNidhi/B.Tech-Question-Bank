import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsAPI } from '../services/api';
import { Upload, FileText, X, Plus, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const BulkUpload = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [processedFiles, setProcessedFiles] = useState([]);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Allow all supported file types
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
      
      // Image formats
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
    
    const validFiles = selectedFiles.filter(file => 
      allowedTypes.includes(file.type)
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error('Some files have unsupported formats. Only documents and images are allowed for bulk upload.');
    }

    const newFiles = validFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      status: 'pending', // pending, processing, success, error
      questionData: null,
      error: null
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const extractQuestionData = (fileName) => {
    // Extract information from filename
    const name = fileName.replace('.pdf', '');
    const parts = name.split('_');
    
    let subject = '';
    let course = '';
    let year = new Date().getFullYear();
    let semester = '';
    let questionType = 'Assignment';
    let title = fileName;

    // Parse filename patterns
    if (parts.length >= 2) {
      // Pattern: CS2014_Assessment I_21Sept2023.pdf
      if (parts[0].match(/^[A-Z]{2}\d{4}$/)) {
        course = parts[0];
        if (parts[1].toLowerCase().includes('assessment')) {
          questionType = 'Assignment';
          if (parts[1].toLowerCase().includes('i')) {
            semester = '1st';
          } else if (parts[1].toLowerCase().includes('ii')) {
            semester = '2nd';
          }
        }
        title = `${course} - ${parts[1]}`;
      }
      // Pattern: EC2021_SEMICONDUCTOR DEVICES_ASSESSMENT I.pdf
      else if (parts[0].match(/^[A-Z]{2}\d{4}$/)) {
        course = parts[0];
        subject = parts[1].replace(/_/g, ' ');
        if (parts[2] && parts[2].toLowerCase().includes('assessment')) {
          questionType = 'Assignment';
          if (parts[2].toLowerCase().includes('i')) {
            semester = '1st';
          } else if (parts[2].toLowerCase().includes('ii')) {
            semester = '2nd';
          }
        }
        title = `${course} - ${subject} - ${parts[2] || 'Question Paper'}`;
      }
      // Pattern: MA2013-Assessment I.pdf
      else if (parts[0].match(/^[A-Z]{2}\d{4}$/)) {
        course = parts[0];
        if (parts[1] && parts[1].toLowerCase().includes('assessment')) {
          questionType = 'Assignment';
          if (parts[1].toLowerCase().includes('i')) {
            semester = '1st';
          } else if (parts[1].toLowerCase().includes('ii')) {
            semester = '2nd';
          }
        }
        title = `${course} - ${parts[1] || 'Question Paper'}`;
      }
    }

    // Extract year from filename if present
    const yearMatch = fileName.match(/\d{4}/);
    if (yearMatch) {
      year = parseInt(yearMatch[0]);
    }

    return {
      title,
      subject: subject || 'Computer Science',
      course: course || 'Computer Science',
      year,
      semester: semester || '1st',
      questionType: questionType === 'Assessment' ? 'Assignment' : questionType || 'Assignment',
      difficulty: 'Medium',
      content: `Question paper: ${fileName}. This contains multiple questions covering various topics in the subject.`,
      solution: '',
      tags: [course, subject, questionType].filter(Boolean).join(', '),
      marks: '',
      timeLimit: '',
      instructions: 'This is a bulk uploaded question paper.'
    };
  };

  const processFile = async (fileItem) => {
    const { file } = fileItem;
    
    try {
      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'processing' } : f
      ));

      // Extract question data from filename
      const questionData = extractQuestionData(file.name);
      
      // Create question data object with file
      const questionDataWithFile = {
        ...questionData,
        file: file
      };

      // Upload to server
      const response = await questionsAPI.createQuestion(questionDataWithFile);
      
      // Update status to success
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { 
          ...f, 
          status: 'success', 
          questionData: response.data.question 
        } : f
      ));

      setProcessedFiles(prev => [...prev, response.data.question]);
      toast.success(`Successfully uploaded: ${file.name}`);

    } catch (error) {
      console.error('Error processing file:', error);
      
      // Update status to error
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { 
          ...f, 
          status: 'error', 
          error: error.response?.data?.message || 'Upload failed' 
        } : f
      ));

      toast.error(`Failed to upload: ${file.name}`);
    }
  };

  const uploadAllFiles = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    setUploading(true);
    setUploadProgress({});

    try {
      // Process files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        
        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [fileItem.id]: { current: i + 1, total: files.length }
        }));

        await processFile(fileItem);
        
        // Small delay between uploads
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast.success(`Successfully uploaded ${processedFiles.length} questions!`);
      
      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
        setProcessedFiles([]);
        setUploadProgress({});
      }, 2000);

    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Some files failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-5 w-5 text-gray-400" />;
      case 'processing':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing...';
      case 'success':
        return 'Uploaded';
      case 'error':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* CBSE-style Header */}
      <div className="gov-banner mb-6">
        <h1 className="text-2xl font-bold">BULK UPLOAD</h1>
        <p className="text-sm text-teal-100 mt-1">B.Tech Engineering Question Papers - Multiple Upload</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Bulk Upload Questions</h2>
        <p className="text-gray-600">
          Upload multiple B.Tech question papers at once. Only PDF files are supported for bulk upload.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        {/* File Upload Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Files (Documents & Images)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.tif,.svg,.ico"
              multiple
              className="hidden"
              id="bulk-file-upload"
            />
            <label htmlFor="bulk-file-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to select files
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                All documents and images supported (PDF, DOC, DOCX, images, etc.)
              </p>
            </label>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Selected Files ({files.length})
            </h3>
            <div className="space-y-3">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(fileItem.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {fileItem.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {uploadProgress[fileItem.id] && (
                        <p className="text-xs text-blue-600">
                          Progress: {uploadProgress[fileItem.id].current} / {uploadProgress[fileItem.id].total}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      fileItem.status === 'success' ? 'bg-green-100 text-green-800' :
                      fileItem.status === 'error' ? 'bg-red-100 text-red-800' :
                      fileItem.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusText(fileItem.status)}
                    </span>
                    {fileItem.error && (
                      <p className="text-xs text-red-600 max-w-xs">{fileItem.error}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(fileItem.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                setFiles([]);
                setProcessedFiles([]);
                setUploadProgress({});
              }}
              className="px-6 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50 transition-colors"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={uploadAllFiles}
              disabled={uploading || files.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Upload All ({files.length})
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Summary */}
        {processedFiles.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800 mb-2">
              Successfully Uploaded ({processedFiles.length} questions)
            </h4>
            <div className="space-y-1">
              {processedFiles.map((question, index) => (
                <p key={index} className="text-sm text-green-700">
                  • {question.title}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;
