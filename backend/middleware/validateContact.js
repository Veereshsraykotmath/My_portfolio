const validator = require('validator');

/**
 * Strips HTML tags and trims whitespace so submitted text can't inject
 * markup into the notification email or a future admin dashboard.
 */
function sanitize(value) {
  if (typeof value !== 'string') return '';
  return validator.escape(value.trim());
}

/**
 * Validates and sanitizes the incoming contact-form payload.
 * On failure, responds with 400 + a field-keyed list of messages.
 * On success, attaches the cleaned data as req.contactData and calls next().
 */
function validateContact(req, res, next) {
  const errors = {};
  const { name, email, subject, message, honeypot } = req.body || {};

  // Honeypot field: real visitors never fill this hidden field in.
  // Bots that auto-fill every input will trip it.
  if (honeypot && honeypot.trim() !== '') {
    // Silently pretend success so bots don't learn the trap worked.
    return res.status(200).json({
      success: true,
      message: "Thank you! Your message has been sent successfully. I'll get back to you soon.",
    });
  }

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }

  if (!email || typeof email !== 'string' || !validator.isEmail(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
    errors.subject = 'Please enter a subject (at least 3 characters).';
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    errors.message = 'Your message should be at least 10 characters long.';
  } else if (message.trim().length > 5000) {
    errors.message = 'Your message is too long (max 5000 characters).';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  req.contactData = {
    name: sanitize(name),
    email: validator.normalizeEmail(email.trim()) || sanitize(email),
    subject: sanitize(subject),
    message: sanitize(message),
  };

  next();
}

module.exports = validateContact;
