import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { auth, adminAuth, optionalAuth } from '../middleware/auth.js';
import { validateQuestion, validateQuestionUpdate } from '../middleware/validation.js';
import multer from 'multer';
import axios from 'axios';
import { cloudinary, storage } from '../config/cloudinary.js';

const router = express.Router();

// ESM-compatible __dirname for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads with Cloudinary
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('🔍 File filter check:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Extended list of allowed file extensions
    const allowedTypes = /pdf|doc|docx|txt|rtf|odt|xls|xlsx|ppt|pptx|jpg|jpeg|png|gif|webp|bmp|tiff|tif|svg|ico/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    
    // Extended list of allowed MIME types
    const allowedMimeTypes = [
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
    
    if (allowedMimeTypes.includes(file.mimetype) && extname) {
      console.log('✅ File type validation passed');
      console.log('📄 Accepted file type:', file.mimetype, '| Extension:', file.originalname.split('.').pop().toLowerCase());
      return cb(null, true);
    } else {
      console.log('❌ File type validation failed:', {
        mimetype: file.mimetype,
        extension: file.originalname.split('.').pop().toLowerCase(),
        allowedExtensions: 'pdf|doc|docx|txt|rtf|odt|xls|xlsx|ppt|pptx|jpg|jpeg|png|gif|webp|bmp|tiff|svg|ico'
      });
      cb(new Error('Unsupported file type! Allowed formats: PDF, DOC, DOCX, TXT, RTF, ODT, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF, WEBP, BMP, TIFF, SVG, ICO'));
    }
  }
});

// Get all questions with filters
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      subject,
      course,
      year,
      semester,
      questionType,
      difficulty,
      search,
      verified,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    console.log('🔍 BACKEND - Incoming query params:', req.query);
    console.log('📋 BACKEND - Verified filter value:', verified, 'Type:', typeof verified);

    // Apply filters
    if (subject) query.subject = new RegExp(subject, 'i');
    if (course) query.course = new RegExp(course, 'i');
    if (year) query.year = parseInt(year);
    if (semester) query.semester = semester;
    if (questionType) query.questionType = questionType;
    if (difficulty) query.difficulty = difficulty;
    if (verified !== undefined && verified !== '' && verified !== null) {
      query.isVerified = verified === 'true';
      console.log('✅ BACKEND - Applied verified filter:', query.isVerified);
    } else {
      console.log('✅ BACKEND - No verified filter applied (showing ALL questions - verified and unverified)');
      // Explicitly do NOT add isVerified to query - this shows all questions
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('🔍 BACKEND - Final MongoDB query:', JSON.stringify(query, null, 2));
    console.log('📊 BACKEND - Sort options:', sortOptions);

    const questions = await Question.find(query)
      .populate('uploadedBy', 'firstName lastName username studentId course')
      .populate('verifiedBy', 'firstName lastName username')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Question.countDocuments(query);
    
    console.log('✅ BACKEND - Found questions:', questions.length);
    console.log('📊 BACKEND - Total matching questions:', total);
    console.log('📋 BACKEND - Question IDs returned:', questions.map(q => ({ id: q._id, title: q.title, isVerified: q.isVerified })));

    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
});

// Get question by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName username studentId course')
      .populate('verifiedBy', 'firstName lastName username');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment view count
    await question.incrementViews();

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching question', error: error.message });
  }
});

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.log('❌ MULTER ERROR:', err.code, err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large',
        error: 'File size must be less than 10MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files',
        error: 'Only one file can be uploaded at a time'
      });
    }
    return res.status(400).json({
      message: 'File upload error',
      error: err.message
    });
  }
  
  // Handle custom file filter errors
  if (err.message.includes('Unsupported file type')) {
    console.log('❌ FILE TYPE ERROR:', err.message);
    return res.status(400).json({
      message: 'Invalid file type',
      error: err.message
    });
  }
  
  // Handle Cloudinary errors
  if (err.message.includes('cloudinary') || err.http_code) {
    console.log('❌ CLOUDINARY ERROR:', err.message);
    return res.status(500).json({
      message: 'Cloud storage error',
      error: 'Failed to upload file to cloud storage. Please try again.'
    });
  }
  
  next(err);
};

// Add request logging middleware
router.use((req, res, next) => {
  console.log('📥 Questions Route Request:', {
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? '***TOKEN***' : 'none',
      'origin': req.headers['origin']
    }
  });
  next();
});

// Upload new question
router.post('/', auth, upload.single('file'), handleMulterError, validateQuestion, async (req, res) => {
  try {
    // Enhanced logging for debugging
    console.log('=== FILE UPLOAD DEBUG ===');
    console.log('🌩️ Cloudinary Status: ACTIVE');
    console.log('📡 Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('📂 Target Folder: question-bank');
    console.log('👤 User:', req.user.username, '(ID:', req.user.id, ')');
    console.log('📝 Request body:', req.body);
    console.log('📎 File object:', req.file);
    
    if (req.file) {
      console.log('📄 File details:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
        filename: req.file.filename,
        path: req.file.path,
        fieldname: req.file.fieldname
      });
      console.log('🔗 CLOUDINARY UPLOAD SUCCESSFUL!');
      console.log('🌐 Cloudinary URL:', req.file.path);
      console.log('🆔 Cloudinary Public ID:', req.file.filename);
    } else {
      console.log('⚠️ No file received in request');
    }
    
    const {
      title,
      subject,
      course,
      year,
      semester,
      questionType,
      difficulty,
      content,
      solution,
      tags,
      marks,
      timeLimit,
      instructions
    } = req.body;

    const questionData = {
      title,
      subject,
      course,
      year: parseInt(year),
      semester,
      questionType,
      difficulty,
      content,
      solution: solution || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      marks: marks && marks.trim() !== '' ? parseInt(marks) : undefined,
      timeLimit: timeLimit && timeLimit.trim() !== '' ? parseInt(timeLimit) : undefined,
      instructions: instructions || '',
      uploadedBy: req.user.id
    };

    // Handle file upload with Cloudinary
    if (req.file) {
      console.log('✅ PROCESSING CLOUDINARY FILE DATA');
      console.log('📁 Storing file information in database:');
      console.log('   - Original filename:', req.file.originalname);
      console.log('   - Cloudinary URL:', req.file.path);
      console.log('   - Cloudinary Public ID:', req.file.filename);
      console.log('   - File size:', req.file.size, 'bytes');
      
      questionData.fileUrl = req.file.path; // Cloudinary URL
      questionData.fileName = req.file.originalname;
      questionData.cloudinaryPublicId = req.file.filename; // Store Cloudinary public_id for deletion
      
      // Verify Cloudinary URL is accessible
      try {
        console.log('🔍 Verifying Cloudinary file accessibility...');
        const testResponse = await axios.head(req.file.path);
        console.log('✅ Cloudinary file is accessible! Status:', testResponse.status);
      } catch (verifyError) {
        console.log('⚠️ Warning: Could not verify Cloudinary file accessibility:', verifyError.message);
      }
    } else {
      console.log('❌ No file to upload to Cloudinary');
    }

    console.log('💾 Saving question to database...');
    const question = new Question(questionData);
    await question.save();
    console.log('✅ Question saved successfully with ID:', question._id);

    // Increment user's upload count
    console.log('📊 Updating user statistics...');
    await User.findByIdAndUpdate(req.user.id, { $inc: { uploadsCount: 1, reputation: 5 } });

    const populatedQuestion = await Question.findById(question._id)
      .populate('uploadedBy', 'firstName lastName username studentId course');

    console.log('🎉 UPLOAD COMPLETE! Question created successfully');
    console.log('=== UPLOAD SUMMARY ===');
    if (req.file) {
      console.log('📎 File uploaded to Cloudinary: YES');
      console.log('🔗 Cloudinary URL:', req.file.path);
      console.log('🆔 Public ID:', req.file.filename);
    } else {
      console.log('📎 File uploaded: NO');
    }
    console.log('📝 Question ID:', question._id);
    console.log('👤 Uploaded by:', req.user.username);
    console.log('========================');

    res.status(201).json({
      message: 'Question uploaded successfully',
      question: populatedQuestion
    });
  } catch (error) {
    console.log('❌ UPLOAD ERROR OCCURRED');
    console.log('Error type:', error.name);
    console.log('Error message:', error.message);
    console.log('Stack trace:', error.stack);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      console.log('Validation errors:', error.errors);
      return res.status(400).json({ 
        message: 'Validation error', 
        error: error.message,
        details: error.errors 
      });
    }
    
    if (error.code === 11000) {
      console.log('Duplicate key error:', error.keyValue);
      return res.status(409).json({ 
        message: 'Question already exists', 
        error: 'A question with this data already exists' 
      });
    }
    
    // Handle Cloudinary-related errors
    if (error.message.includes('cloudinary') || error.message.includes('upload')) {
      console.log('Cloudinary upload error detected');
      return res.status(500).json({ 
        message: 'File upload failed', 
        error: 'There was an issue uploading your file. Please try again.' 
      });
    }
    
    // Generic error handler
    console.log('Generic error handler triggered');
    res.status(500).json({ 
      message: 'Error uploading question', 
      error: error.message 
    });
  }
});

// Update question
router.put('/:id', auth, upload.single('file'), validateQuestionUpdate, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is the owner or admin
    if (question.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this question' });
    }

    const updateData = { ...req.body };
    
    // Handle file upload with Cloudinary
    if (req.file) {
      // Delete old file from Cloudinary if it exists
      if (question.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(question.cloudinaryPublicId);
        } catch (error) {
          console.error('Error deleting old file from Cloudinary:', error);
        }
      }
      
      updateData.fileUrl = req.file.path; // Cloudinary URL
      updateData.fileName = req.file.originalname;
      updateData.cloudinaryPublicId = req.file.filename; // Store Cloudinary public_id
    }

    // Handle tags
    if (req.body.tags) {
      updateData.tags = req.body.tags.split(',').map(tag => tag.trim());
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('uploadedBy', 'firstName lastName username studentId course');

    res.json({
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating question', error: error.message });
  }
});

// Delete question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is the owner or admin
    if (question.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this question' });
    }

    // Delete file from Cloudinary if it exists
    if (question.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(question.cloudinaryPublicId);
      } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
      }
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
});

// Download question file
router.get('/:id/download', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (!question.fileUrl) {
      return res.status(404).json({ message: 'No file attached to this question' });
    }

    // Check access permissions
    const isOwner = question.uploadedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isVerified = question.isVerified;

    // Only allow download if:
    // 1. User is the owner, OR
    // 2. User is admin, OR
    // 3. Question is verified
    if (!isOwner && !isAdmin && !isVerified) {
      return res.status(403).json({ 
        message: 'This question is not verified yet. Only verified questions can be downloaded by other users.' 
      });
    }

    // Increment download count
    await question.incrementDownloads();
    await User.findByIdAndUpdate(req.user.id, { $inc: { downloadsCount: 1 } });

    // Log download activity
    console.log(`Download: User ${req.user.username} (${req.user.id}) downloaded question ${question._id} (${question.title})`);

    // Log the file URL for debugging
    console.log('File URL:', question.fileUrl);
    console.log('Cloudinary Public ID:', question.cloudinaryPublicId);
    
    // For Cloudinary URLs, fetch and serve the file
    if (question.fileUrl.includes('cloudinary.com')) {
      try {
        // Use imported axios for file fetching - get as buffer
        const fileResponse = await axios.get(question.fileUrl, {
          responseType: 'arraybuffer'
        });
        
        // Set appropriate headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${question.fileName}"`);
        res.setHeader('Content-Type', fileResponse.headers['content-type'] || 'application/pdf');
        res.setHeader('Content-Length', fileResponse.headers['content-length']);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
        
        // Send the file buffer
        res.send(Buffer.from(fileResponse.data));
        
        console.log('File served successfully from Cloudinary');
      } catch (downloadError) {
        console.error('Error fetching file from Cloudinary:', downloadError.response?.status, downloadError.response?.headers?.['x-cld-error'] || downloadError.message);

        // Robust fallback: try generating signed URLs for both authenticated and upload delivery
        try {
          if (question.cloudinaryPublicId) {
            const filename = question.fileName || '';
            const extFromName = filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
            const extFromUrl = (() => {
              try {
                const urlPath = new URL(question.fileUrl).pathname;
                const last = urlPath.split('/').pop() || '';
                return last.includes('.') ? last.split('.').pop().toLowerCase() : '';
              } catch (_) { return ''; }
            })();
            const fileExtension = extFromName || extFromUrl || 'pdf';

            // Prefer raw for documents, image for image formats
            const docExts = ['pdf','doc','docx','txt','rtf','odt','xls','xlsx','ppt','pptx'];
            const imgExts = ['jpg','jpeg','png','gif','webp','bmp','tiff','tif','svg','ico'];
            const primaryResource = docExts.includes(fileExtension) ? 'raw' : (imgExts.includes(fileExtension) ? 'image' : 'raw');
            const altResource = primaryResource === 'raw' ? 'image' : 'raw';

            // Extract version from URL if present
            const versionMatch = question.fileUrl.match(/\/v(\d+)\//);
            const version = versionMatch ? versionMatch[1] : undefined;

            const attempts = [
              { type: 'authenticated', resource_type: primaryResource },
              { type: 'authenticated', resource_type: altResource },
              { type: 'upload', resource_type: primaryResource },
              { type: 'upload', resource_type: altResource },
            ];

            for (const attempt of attempts) {
              try {
                const signedUrl = cloudinary.url(question.cloudinaryPublicId, {
                  resource_type: attempt.resource_type,
                  type: attempt.type,
                  sign_url: true,
                  secure: true,
                  version,
                  expires_at: Math.floor(Date.now() / 1000) + 300,
                  attachment: true,
                  flags: 'attachment'
                });
                const signedResp = await axios.get(signedUrl, { responseType: 'arraybuffer' });
                res.setHeader('Content-Disposition', `attachment; filename="${filename || `download.${fileExtension}`}"`);
                res.setHeader('Content-Type', signedResp.headers['content-type'] || 'application/octet-stream');
                if (signedResp.headers['content-length']) {
                  res.setHeader('Content-Length', signedResp.headers['content-length']);
                }
                res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
                return res.send(Buffer.from(signedResp.data));
              } catch (e) {
                console.warn(`Signed URL attempt failed (${attempt.type}/${attempt.resource_type}):`, e.response?.status || e.message);
              }
            }
          }
        } catch (signedErr) {
          console.error('Signed URL generation failed:', signedErr.response?.status, signedErr.response?.headers?.['x-cld-error'] || signedErr.message);
        }

        // Fallback 2: try serving from local uploads directory if present
        try {
          const localPath = path.join(__dirname, '..', 'uploads', question.fileName || '');
          if (question.fileName && fs.existsSync(localPath)) {
            console.log('Serving file from local uploads fallback:', localPath);
            return res.download(localPath, question.fileName);
          }
        } catch (localErr) {
          console.warn('Local uploads fallback failed:', localErr.message);
        }

        // If all attempts failed, return not found (likely deleted or access-controlled asset)
        res.status(404).json({ message: 'File could not be retrieved from storage' });
      }
    } else {
      // For local files (fallback)
      res.status(404).json({ message: 'File format not supported for download' });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Error downloading file', error: error.message });
  }
});

// Verify question (admin only)
router.patch('/:id/verify', adminAuth, async (req, res) => {
  try {
    console.log('Verify request - User:', req.user.username, 'Role:', req.user.role, 'isAdmin:', req.user.isAdmin);
    
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    console.log('🔍 VERIFY - Verifying question:', question._id, 'Current status:', question.isVerified);
    console.log('🔍 VERIFY - Question title:', question.title);
    console.log('🔍 VERIFY - Verified by admin:', req.user.username);
    
    await question.verify(req.user.id);
    
    const updatedQuestion = await Question.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName username studentId course')
      .populate('verifiedBy', 'firstName lastName username');

    console.log('✅ VERIFY - Question verified successfully!');
    console.log('✅ VERIFY - Updated question verification status:', updatedQuestion.isVerified);
    console.log('✅ VERIFY - Verified by:', updatedQuestion.verifiedBy?.username);
    console.log('✅ VERIFY - Verification timestamp:', updatedQuestion.verifiedAt);
    res.json({ 
      message: 'Question verified successfully',
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Error verifying question', error: error.message });
  }
});

// Get questions by user
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const questions = await Question.find({ uploadedBy: req.params.userId })
      .populate('uploadedBy', 'firstName lastName username studentId course')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Question.countDocuments({ uploadedBy: req.params.userId });

    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user questions', error: error.message });
  }
});

// Get statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments();
    const verifiedQuestions = await Question.countDocuments({ isVerified: true });
    const totalDownloads = await Question.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    const totalViews = await Question.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);

    const subjects = await Question.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const courses = await Question.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalQuestions,
      verifiedQuestions,
      totalDownloads: totalDownloads[0]?.total || 0,
      totalViews: totalViews[0]?.total || 0,
      topSubjects: subjects,
      topCourses: courses
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

export default router;
