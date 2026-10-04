function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // Standard RFC-compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

function validatePassword(password) {
  const errors = [];
  if (!password || typeof password !== 'string') {
    return ['Password is required.'];
  }
  if (password.length < 8 || password.length > 16) {
    errors.push('Password must be between 8 and 16 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (e.g. !@#$%^&*).');
  }
  return errors;
}

function validateName(name) {
  const errors = [];
  if (!name || typeof name !== 'string') {
    return ['Name is required.'];
  }
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    errors.push('Name must be between 20 and 60 characters long.');
  }
  return errors;
}

function validateAddress(address) {
  const errors = [];
  if (!address || typeof address !== 'string') {
    return ['Address is required.'];
  }
  const trimmed = address.trim();
  if (trimmed.length === 0) {
    errors.push('Address cannot be empty.');
  }
  if (trimmed.length > 400) {
    errors.push('Address must not exceed 400 characters.');
  }
  return errors;
}

function validateSignup(req, res, next) {
  const { name, email, password, address } = req.body;
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

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = {};

  if (!email || !validateEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }
  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid credentials provided.',
      errors
    });
  }

  next();
}

function validatePasswordUpdate(req, res, next) {
  const { currentPassword, newPassword } = req.body;
  const errors = {};

  if (!currentPassword) {
    errors.currentPassword = 'Current password is required.';
  }

  const passwordErrors = validatePassword(newPassword);
  if (passwordErrors.length > 0) {
    errors.newPassword = passwordErrors[0];
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Password validation failed.',
      errors
    });
  }

  next();
}

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateAddress,
  validateSignup,
  validateLogin,
  validatePasswordUpdate
};
