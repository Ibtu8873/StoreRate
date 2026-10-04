const { validateEmail, validatePassword, validateName, validateAddress } = require('./authValidator');

function validateCreateUser(req, res, next) {
  const { name, email, password, address, role } = req.body;
  const errors = {};

  const nameErrors = validateName(name);
  if (nameErrors.length > 0) errors.name = nameErrors[0];

  if (!email || !validateEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  const addressErrors = validateAddress(address);
  if (addressErrors.length > 0) errors.address = addressErrors[0];

  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) errors.password = passwordErrors[0];

  const allowedRoles = ['admin', 'user', 'owner'];
  if (!role || !allowedRoles.includes(role)) {
    errors.role = 'Role must be one of: admin, user, owner.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
}

module.exports = {
  validateCreateUser
};
