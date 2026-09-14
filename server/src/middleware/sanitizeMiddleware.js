/**
 * NoSQL Injection & Query Parameter Sanitization Middleware
 * Recursively strips keys starting with '$' or containing '.' from request body, query, and params.
 */
function cleanObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(cleanObject);
  }

  const clean = {};
  for (const key of Object.keys(obj)) {
    // Drop keys with Mongo operator prefix ($) or dot notation path injection (.)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = cleanObject(obj[key]);
  }
  return clean;
}

export const mongoSanitize = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = cleanObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = cleanObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = cleanObject(req.params);
  }
  next();
};
