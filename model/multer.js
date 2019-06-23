const multer = require('multer');
const pify = require('pify');
const error = require('./error');

// Temp director is 'project_root/tmp/'
const TEMP_DIRECTORY_FOR_IMAGE = 'tmp/';
// Maximum file size allowed for now
const MAX_3MB = 3 * 1024 * 1024;
// File filter function to restrict which files user can upload. For now we are only
// allowing the JPEG/JPG files
const jpegFileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    // File type not allowed hence throw error
    const errorObj = new Error();
    errorObj.message = error.errList.internalError.ERR_EMP_IMAGE_UPLOAD_WRONG_TYPE.message;
    errorObj.code = error.errList.internalError.ERR_EMP_IMAGE_UPLOAD_WRONG_TYPE.code;
    cb(errorObj);
    // cb(null, false) this will not throw error
  }
};

/**
 * Helper function which lets you upload single images from the HTML form
 *
 * Possible ERRORS:
 * 1. Wrong type of file uploaded (Compare with error.errList.internalError.ERR_EMP_IMAGE_UPLOAD_WRONG_TYPE.message)
 * { Error: Only jpg/jepg files are allowed
 *   message: 'Only jpg/jepg files are allowed',
 *   code: '50143',
 *   storageErrors: [] }
 * 2. File Size exceeded
 * { MulterError: File too large
 *   name: 'MulterError',
 *   message: 'File too large',
 *   code: 'LIMIT_FILE_SIZE',
 *   field: 'img',
 *   storageErrors: [] }
 *
 * @param {Object} req Express Request object
 * @param {Object} res Express Response Object
 * @param {String} fieldname Filedname of the form which is sending multipart/form-data
 */

async function singleImage(req, res, fieldname) {
  // Init Upload
  const uploadImage = pify(
    multer({
      // tmp direction in current project
      dest: TEMP_DIRECTORY_FOR_IMAGE,
      // 3MB file size allowed
      limits: { fileSize: MAX_3MB },
      // Only allow JPEG files
      fileFilter: jpegFileFilter,
    }).single(fieldname),
  );
  await uploadImage(req, res);
}

/**
 * Helper function which lets you upload multiple images from the HTML form
 *
 * Possible ERRORS:
 * 1. More than max count uploaded
 * { MulterError: Unexpected field
 *   name: 'MulterError',
 *   message: 'Unexpected field',
 *   code: 'LIMIT_UNEXPECTED_FILE',
 *   field: 'img',
 *   storageErrors: [] }
 * 2. Wrong type of file uploaded (Compare with error.errList.internalError.ERR_EMP_IMAGE_UPLOAD_WRONG_TYPE.message)
 * { Error: Only jpg/jepg files are allowed
 *   message: 'Only jpg/jepg files are allowed',
 *   code: '50143',
 *   storageErrors: [] }
 * 3. File Size exceeded
 * { MulterError: File too large
 *  name: 'MulterError',
 *  message: 'File too large',
 *  code: 'LIMIT_FILE_SIZE',
 *  field: 'img',
 *  storageErrors: [] }
 *
 * @param {Object} req Express Request object
 * @param {Object} res Express Response Object
 * @param {String} fieldname Filedname of the form which is sending multipart/form-data
 * @param {number} maxCount Max number of image we can expect
 */

async function multipleImages(req, res, fieldname, maxCount) {
  // Init Upload
  const uploadImage = pify(
    multer({
      // tmp direction in current project
      dest: TEMP_DIRECTORY_FOR_IMAGE,
      // 3MB file size allowed
      limits: { fileSize: MAX_3MB },
      // Only allow JPEG files
      fileFilter: jpegFileFilter,
    }).array(fieldname, maxCount),
  );
  await uploadImage(req, res);
}

module.exports.singleImage = singleImage;
module.exports.multipleImages = multipleImages;
