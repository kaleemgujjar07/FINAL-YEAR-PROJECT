module.exports = (req, res, next) => {
  const headerKey = req.headers['x-internal-key'];
  const envKey = process.env.ERP_INTERNAL_KEY;
  
  if (headerKey !== envKey) {
    try {
      const fs = require('fs');
      fs.appendFileSync('backend_debug.log', `--- ERP Auth Failed ---\nTime: ${new Date().toISOString()}\nHeader: ${headerKey}\nEnv: ${envKey ? 'SET' : 'UNDEFINED'}\n\n`);
    } catch (e) {}
    console.error('🛡️ ERP Auth Failed: Header Key:', headerKey, 'Env Key:', envKey ? '[HIDDEN]' : 'UNDEFINED');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

