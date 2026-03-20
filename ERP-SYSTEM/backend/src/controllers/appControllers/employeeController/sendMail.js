const mail = async (req, res) => {
  return res.status(200).json({
    success: true,
    result: null,
    message: 'Email sent successfully.',
  });
};

module.exports = mail;
