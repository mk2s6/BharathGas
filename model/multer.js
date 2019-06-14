const multer = require('multer');
const path = require('path');
const constant = require('./constant');
const error = require('./error');

// Set The Storage Engine
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, constant.employeeImageStorageBaseLocation.DEFAULT);
  },
  filename(req, file, cb) {
    cb(null, req.user.id + path.extname(file.originalname));
  },
});

// Init Upload
const uploadEmpImage = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    checkEmpImageFileType(file, cb);
  },
}).single('employee_image');

// Check File Type
function checkEmpImageFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png/;
  // Check extensions
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime-type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  const fileUploadErrorWithWrongType = error.errList.internalError.ERR_EMP_IMAGE_UPLOAD_WRONG_TYPE;
  cb(fileUploadErrorWithWrongType);
}

module.exports.uploadEmpImage = uploadEmpImage;
