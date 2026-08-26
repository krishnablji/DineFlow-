const multer = require('multer');

// Configure multer memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow images and mp4/webm videos
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'video/mp4' ||
    file.mimetype === 'video/webm' ||
    file.mimetype === 'video/quicktime'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are supported!'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 30 * 1024 * 1024, // 30MB max
  },
  fileFilter,
});

module.exports = upload;
