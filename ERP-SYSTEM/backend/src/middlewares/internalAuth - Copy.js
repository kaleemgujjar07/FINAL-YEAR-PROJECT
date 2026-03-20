module.exports = (req, res, next) => {
  if (req.headers['x-internal-key'] !== process.env.ERP_INTERNAL_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};
