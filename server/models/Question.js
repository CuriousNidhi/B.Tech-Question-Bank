import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  semester: {
    type: String,
    required: true,
    enum: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']
  },
  questionType: {
    type: String,
    required: true,
    enum: ['MCQ', 'Short Answer', 'Long Answer', 'Essay', 'Practical', 'Assignment', 'Project', 'Case Study', 'Problem Solving', 'Programming', 'Lab Work', 'Presentation']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard', 'Very Hard']
  },
  marks: {
    type: Number,
    min: 0
  },
  timeLimit: {
    type: Number,
    min: 0,
    comment: 'Time limit in minutes'
  },
  instructions: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  solution: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  cloudinaryPublicId: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better search performance
questionSchema.index({ subject: 1, course: 1, year: 1, semester: 1 });
questionSchema.index({ title: 'text', content: 'text', tags: 'text' });
questionSchema.index({ uploadedBy: 1 });
questionSchema.index({ isVerified: 1 });

// Virtual for formatted year
questionSchema.virtual('formattedYear').get(function() {
  return `${this.year}-${this.year + 1}`;
});

// Method to increment downloads
questionSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

// Method to increment views
questionSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to verify question
questionSchema.methods.verify = function(adminId) {
  this.isVerified = true;
  this.verifiedBy = adminId;
  this.verifiedAt = new Date();
  return this.save();
};

const Question = mongoose.model('Question', questionSchema);

export default Question;
