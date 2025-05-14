const multer = require('multer');
const path = require('path');

// Set storage destination and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // save in uploads/ folder
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// Filter file types (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isValidType = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (isValidType) cb(null, true);
  else cb(new Error('Only images allowed'));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
