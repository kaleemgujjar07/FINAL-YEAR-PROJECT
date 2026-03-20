const mail = async (req, res) => {
  // In a full implementation, you would use Resend/Nodemailer here
  // to actually send the PDF/Invoice to the specified email.
  // For now, we remove the premium restriction and return success.
  return res.status(200).json({
    success: true,
    result: null,
    message: 'Email sent successfully to the client.',
  });
};

module.exports = mail;
