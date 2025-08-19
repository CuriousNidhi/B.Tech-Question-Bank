import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

// Configure Cloudinary
console.log('🌩️ Configuring Cloudinary...');
console.log('📡 Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('🔑 API Key:', process.env.CLOUDINARY_API_KEY);
console.log('🔒 API Secret:', process.env.CLOUDINARY_API_SECRET ? '***configured***' : '❌ MISSING');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection on startup
cloudinary.api.ping()
  .then(result => {
    console.log('✅ Cloudinary connection successful!');
    console.log('📊 Rate limit remaining:', result.rate_limit_remaining);
  })
  .catch(error => {
    console.log('❌ Cloudinary connection failed:', error.message);
  });

// Configure Cloudinary storage for multer
console.log('📁 Configuring Cloudinary Storage...');
console.log('📂 Target folder: question-bank');
console.log('📄 Allowed formats: All document and image formats (PDF, DOC, DOCX, TXT, RTF, ODT, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, GIF, WEBP, BMP, TIFF, SVG, ICO)');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'question-bank', // Folder name in Cloudinary
    allowed_formats: [
      // Document formats
      'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt',
      // Spreadsheet formats  
      'xls', 'xlsx',
      // Presentation formats
      'ppt', 'pptx',
      // Image formats
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'svg', 'ico'
    ],
    resource_type: 'auto', // Automatically detect file type
    public_id: (req, file) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const publicId = `${file.fieldname}-${uniqueSuffix}`;
      console.log('🔧 Generating public ID for file:', file.originalname, '→', publicId);
      return publicId;
    },
    transformation: (req, file) => {
      // Log transformation details
      console.log('🔄 Processing file:', file.originalname, 'MIME:', file.mimetype);
      return {}; // No transformations for documents
    }
  },
});

console.log('✅ Cloudinary Storage configured successfully');
console.log('📋 SUPPORTED FILE TYPES:');
console.log('   📄 Documents: PDF, DOC, DOCX, TXT, RTF, ODT');
console.log('   📊 Spreadsheets: XLS, XLSX');
console.log('   📽️ Presentations: PPT, PPTX');
console.log('   🖼️ Images: JPG, JPEG, PNG, GIF, WEBP, BMP, TIFF, SVG, ICO');
console.log('   📏 File size limit: 10MB');
console.log('========================');

export { cloudinary, storage };
