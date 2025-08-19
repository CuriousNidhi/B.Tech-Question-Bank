import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg
      }))
    });
  }
  next();
};

// Registration validation
export const validateRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Student ID must be between 3 and 20 characters'),
  body('course')
    .trim()
    .notEmpty()
    .withMessage('Course is required'),
  body('semester')
    .isIn(['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'])
    .withMessage('Please select a valid semester'),
  handleValidationErrors
];

// Login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Question creation validation
export const validateQuestion = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('course')
    .trim()
    .notEmpty()
    .withMessage('Course is required'),
  body('year')
    .isInt({ min: 2000, max: new Date().getFullYear() })
    .withMessage('Please provide a valid year'),
  body('semester')
    .isIn(['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'])
    .withMessage('Please select a valid semester'),
  body('questionType')
    .isIn(['MCQ', 'Short Answer', 'Long Answer', 'Essay', 'Practical', 'Assignment', 'Project', 'Case Study', 'Problem Solving', 'Programming', 'Lab Work', 'Presentation'])
    .withMessage('Please select a valid question type'),
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard', 'Very Hard'])
    .withMessage('Please select a valid difficulty level'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Question content must be at least 10 characters long'),
  body('solution')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5 })
    .withMessage('Solution must be at least 5 characters long'),
  body('tags')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Tags must be a comma-separated string'),
  body('marks')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Marks must be a positive number'),
  body('timeLimit')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Time limit must be a positive number'),
  body('instructions')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Instructions cannot exceed 1000 characters'),
  handleValidationErrors
];

// Question update validation
export const validateQuestionUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('subject')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Subject cannot be empty'),
  body('course')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Course cannot be empty'),
  body('year')
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() })
    .withMessage('Please provide a valid year'),
  body('semester')
    .optional()
    .isIn(['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'])
    .withMessage('Please select a valid semester'),
  body('questionType')
    .optional()
    .isIn(['MCQ', 'Short Answer', 'Long Answer', 'Essay', 'Practical', 'Assignment', 'Project', 'Case Study', 'Problem Solving', 'Programming', 'Lab Work', 'Presentation'])
    .withMessage('Please select a valid question type'),
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard', 'Very Hard'])
    .withMessage('Please select a valid difficulty level'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Question content must be at least 10 characters long'),
  body('solution')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 5 })
    .withMessage('Solution must be at least 5 characters long'),
  body('tags')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Tags must be a comma-separated string'),
  body('marks')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Marks must be a positive number'),
  body('timeLimit')
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage('Time limit must be a positive number'),
  body('instructions')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Instructions cannot exceed 1000 characters'),
  handleValidationErrors
];

// User profile update validation
export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Student ID must be between 3 and 20 characters'),
  body('course')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Course cannot be empty'),
  body('semester')
    .optional()
    .isIn(['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'])
    .withMessage('Please select a valid semester'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  handleValidationErrors
];

// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  handleValidationErrors
];
