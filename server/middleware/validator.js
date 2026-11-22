// SecureScan Server-Side Validation Middleware

// RFC 1123 compliant Domain Name Regex (blocks IP literals, schemes, paths, ports)
const DOMAIN_REGEX = /^(?!:\/\/)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateDomainInput(req, res, next) {
  let { domain } = req.body;

  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'Domain name is required.' });
  }

  // Clean domain
  domain = domain.trim().toLowerCase();

  // Explicitly reject protocol schemes if provided
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    domain = domain.replace(/^https?:\/\//i, '');
  }

  // Reject paths, query params, ports
  if (domain.includes('/') || domain.includes(':') || domain.includes('?')) {
    return res.status(400).json({
      error: 'Invalid target format. Enter domain name only (e.g. example.com), without protocol, port, or path.',
    });
  }

  // Explicitly block IP literals
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  if (ipv4Regex.test(domain) || ipv6Regex.test(domain) || domain.includes('[')) {
    return res.status(400).json({
      error: 'Direct IP targets are rejected by SecureScan SSRF protection policy. Provide a valid domain name.',
    });
  }

  // Block localhost and standard test aliases
  if (domain === 'localhost' || domain.endsWith('.localhost') || domain.endsWith('.local') || domain.endsWith('.internal')) {
    return res.status(400).json({
      error: 'Local and internal domains are prohibited for security protection.',
    });
  }

  // Validate FQDN structure
  if (!DOMAIN_REGEX.test(domain)) {
    return res.status(400).json({
      error: 'Invalid domain name structure. Please provide a standard fully qualified domain name (e.g. example.com).',
    });
  }

  req.cleanedDomain = domain;
  next();
}

function validateRegisterInput(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Full name must be at least 2 characters.' });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  req.cleanedEmail = email.trim().toLowerCase();
  req.cleanedName = name.trim();
  next();
}

function validateLoginInput(req, res, next) {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required.' });
  }

  req.cleanedEmail = email.trim().toLowerCase();
  next();
}

module.exports = {
  validateDomainInput,
  validateRegisterInput,
  validateLoginInput,
};
