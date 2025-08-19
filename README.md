# 🎓 B.Tech Question Bank System

A comprehensive **MERN Stack** web application designed for B.Tech students and faculty to manage, upload, and access academic questions with secure file handling and administrative controls.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://mongodb.com/)

## 🌟 **Live Demo**
🔗 **Frontend**: [Your deployment URL here]
🔗 **Backend API**: [Your API URL here]

---

## 📋 **Table of Contents**
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 **Features**

### 👨‍🎓 **For Students**
- ✅ **Question Upload**: Single and bulk upload capabilities
- ✅ **File Support**: PDF, DOC, DOCX, images, and more (10MB limit)
- ✅ **Secure Downloads**: Access verified questions only
- ✅ **Search & Filter**: Find questions by course, semester, type
- ✅ **User Dashboard**: Track uploaded questions and downloads

### 👨‍🏫 **For Faculty/Admins**
- ✅ **Question Verification**: Approve/reject uploaded content
- ✅ **Admin Dashboard**: Comprehensive management interface
- ✅ **User Management**: View and manage user accounts
- ✅ **Analytics**: Track platform usage and statistics
- ✅ **Full Access**: Download any content regardless of verification status

### 🔐 **Security & Technical**
- ✅ **JWT Authentication**: Secure 24-hour login sessions
- ✅ **Role-Based Access**: Different permissions for users and admins
- ✅ **Cloud Storage**: Integrated with Cloudinary for reliable file storage
- ✅ **Input Validation**: Comprehensive server-side validation
- ✅ **CORS Protection**: Secure cross-origin resource sharing

---

## 🛠️ **Technology Stack**

### **Frontend**
- **React.js 18+** - Modern UI framework with hooks
- **Vite** - Fast development build tool
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API communication
- **CSS3 & Flexbox** - Responsive styling
- **React Context API** - State management

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Token authentication
- **Multer + Cloudinary** - File upload and cloud storage
- **bcryptjs** - Password hashing and security

### **DevOps & Tools**
- **MongoDB Atlas** - Cloud database hosting
- **Cloudinary** - File storage and media management
- **Nodemon** - Development server auto-restart
- **Express Validator** - Input validation middleware

---

## 📸 **Screenshots**

### Dashboard View
*[Add screenshot of main dashboard here]*

### Question Upload Interface
*[Add screenshot of upload interface here]*

### Admin Panel
*[Add screenshot of admin dashboard here]*

---

## 📦 **Installation**

### **Prerequisites**
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [Cloudinary](https://cloudinary.com/) account

### **Step 1: Clone Repository**
```bash
git clone https://github.com/CuriousNidhi/B.Tech-Question-Bank.git
cd B.Tech-Question-Bank
```

### **Step 2: Install Dependencies**

**Frontend Dependencies:**
```bash
npm install
```

**Backend Dependencies:**
```bash
cd server
npm install
```

### **Step 3: Environment Configuration**
Create `server/config.env` file (copy from `config.env.example`):

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/btech_question_bank

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server Configuration
PORT=5000
NODE_ENV=development
```

### **Step 4: Create Admin Account**
```bash
cd server
npm run create-admin
```

**Default Admin Credentials:**
- 📧 Email: `admin@questionbank.com`
- 🔑 Password: `admin123456`

> ⚠️ **Important**: Change the admin password immediately after first login!

---

## 🚀 **Usage**

### **Development Mode**
Run both frontend and backend simultaneously:
```bash
# From project root
npm run dev-all
```

### **Production Mode**
```bash
# Start backend
cd server
npm start

# Start frontend (in new terminal)
npm run build
npm run preview
```

### **Application URLs**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 📚 **API Documentation**

### **Authentication Endpoints**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/profile` | Get user profile | Private |
| PUT | `/api/auth/profile` | Update profile | Private |

### **Question Management**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/questions` | Get all questions | Private |
| POST | `/api/questions` | Upload question | Private |
| GET | `/api/questions/:id` | Get specific question | Private |
| PUT | `/api/questions/:id` | Update question | Private |
| DELETE | `/api/questions/:id` | Delete question | Private |
| GET | `/api/questions/:id/download` | Download file | Private |
| PATCH | `/api/questions/:id/verify` | Verify question | Admin Only |

---

## 📁 **Project Structure**

```
B.Tech-Question-Bank/
├── 📁 public/                 # Static assets
├── 📁 src/                   # Frontend source code
│   ├── 📁 components/        # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── QuestionCard.jsx
│   │   └── LoadingSpinner.jsx
│   ├── 📁 contexts/         # React Context providers
│   │   └── AuthContext.jsx
│   ├── 📁 pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── UploadQuestion.jsx
│   │   ├── BulkUpload.jsx
│   │   └── AdminDashboard.jsx
│   ├── 📁 services/         # API services
│   │   └── api.js
│   └── 📁 utils/            # Utility functions
├── 📁 server/               # Backend source code
│   ├── 📁 config/          # Configuration files
│   │   └── cloudinary.js
│   ├── 📁 middleware/      # Custom middleware
│   │   ├── auth.js
│   │   └── validation.js
│   ├── 📁 models/          # Database models
│   │   ├── User.js
│   │   └── Question.js
│   ├── 📁 routes/          # API routes
│   │   ├── auth.js
│   │   └── questions.js
│   ├── 📁 scripts/         # Utility scripts
│   │   └── createAdmin.js
│   └── server.js           # Main server file
├── 📄 .gitignore           # Git ignore rules
├── 📄 package.json         # Frontend dependencies
├── 📄 README.md           # Project documentation
└── 📄 LICENSE             # MIT License
```

---

## 🎯 **User Roles & Permissions**

### **👨‍🎓 Regular Users (Students)**
- Upload questions (single/bulk)
- View all questions in the system
- Download **verified questions only**
- Manage personal profile
- Track upload history

### **👨‍🏫 Administrators (Faculty)**
- All user permissions **PLUS:**
- Verify/reject uploaded questions
- Download **any question** (verified or not)
- Access admin dashboard
- View detailed platform analytics
- Manage user accounts

---

## 🔧 **Configuration Options**

### **File Upload Settings**
- **Maximum file size**: 10MB
- **Supported formats**: PDF, DOC, DOCX, TXT, RTF, ODT, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF, WEBP, BMP, TIFF, SVG, ICO
- **Storage**: Cloudinary cloud storage

### **Authentication Settings**
- **Session duration**: 24 hours
- **Password requirements**: Minimum 6 characters
- **JWT token**: Secure HTTP-only implementation

---

## 🐛 **Troubleshooting**

### **Common Issues & Solutions**

**1. Backend Connection Refused**
```bash
# Check if backend is running
netstat -ano | findstr :5000

# Start backend
cd server && npm start
```

**2. File Upload Fails**
- Verify file size is under 10MB
- Check if file format is supported
- Ensure Cloudinary credentials are correct

**3. Login Issues**
- Clear browser localStorage
- Check network connection
- Verify MongoDB connection

**4. Port Already in Use**
```bash
# Kill existing processes
taskkill /f /im node.exe

# Or change port in config.env
PORT=5001
```

---

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow existing code style
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation if needed

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
- [Cloudinary](https://cloudinary.com/) for file storage solutions
- [React](https://reactjs.org/) community for excellent documentation
- [Express.js](https://expressjs.com/) team for the robust framework
- All B.Tech students and faculty who inspired this project

---

## 📞 **Support & Contact**

- 🐛 **Bug Reports**: [Create an Issue](https://github.com/CuriousNidhi/B.Tech-Question-Bank/issues)
- 💡 **Feature Requests**: [Discussions](https://github.com/CuriousNidhi/B.Tech-Question-Bank/discussions)
- 📧 **Email**: [Your email here]

---

<div align="center">

**⭐ Star this repository if it helped you! ⭐**

**Built with ❤️ for the B.Tech Community**

![Footer](https://img.shields.io/badge/Made%20with-MERN%20Stack-blue?style=for-the-badge)

</div>