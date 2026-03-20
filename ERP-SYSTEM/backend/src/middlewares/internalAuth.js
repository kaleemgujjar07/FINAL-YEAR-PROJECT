module.exports = (req, res, next) => {
  const headerKey = req.headers['x-internal-key'];
  const envKey = process.env.ERP_INTERNAL_KEY;
  
  if (headerKey !== envKey) {
    console.error('🛡️ ERP Auth Failed: Header Key:', headerKey, 'Env Key:', envKey ? '[HIDDEN]' : 'UNDEFINED');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

