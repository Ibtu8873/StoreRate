const { validateEmail, validateAddress } = require('./authValidator');

function validateCreateStore(req, res, next) {
  const { name, email, address, owner_id } = req.body;
  const errors = {};

  if (!name || typeof name !== 'string') {
    errors.name = 'Store name is required.';
  } else if (name.trim().length < 20 || name.trim().length > 60) {
    errors.name = 'Store name must be between 20 and 60 characters.';
  }

  if (!email || !validateEmail(email)) {
    errors.email = 'Please provide a valid store email address.';
  }

  const addressErrors = validateAddress(address);
  if (addressErrors.length > 0) errors.address = addressErrors[0];

  if (!owner_id || isNaN(parseInt(owner_id, 10))) {
    errors.owner_id = 'A valid Store Owner must be selected.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for new store.',
      errors
    });
  }

  next();
}

function validateRating(req, res, next) {
  const { rating } = req.body;
  const numRating = parseInt(rating, 10);

  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be an integer between 1 and 5.',
      errors: {
        rating: 'Rating must be between 1 and 5.'
      }
    });
  }

  req.body.rating = numRating;
  next();
}

module.exports = {
  validateCreateStore,
  validateRating
};
