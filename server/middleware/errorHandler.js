/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log error for server-side tracking
  console.error('Global Error Handler:', err);

  // Determine error status code
  const statusCode = err.statusCode || 500;

  // Prepare error response
  const errorResponse = {
    success: false,
    status: statusCode,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.details 
    })
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    errorResponse.status = 400;
    errorResponse.errors = err.errors;
  }

  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    errorResponse.status = 400;
    errorResponse.message = 'File too large. Maximum upload size exceeded.';
  }

  // Send error response
  res.status(errorResponse.status).json(errorResponse);
};

module.exports = errorHandler;
