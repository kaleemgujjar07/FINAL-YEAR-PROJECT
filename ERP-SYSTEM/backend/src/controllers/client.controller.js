const Client = require('../models/appModels/Client');

exports.createClientFromEcommerce = async (req, res) => {
  try {
    const { userId, name, email, phone, country, address } = req.body;

    const exists = await Client.findOne({ userId });
    if (exists) {
      return res.status(409).json({ message: 'Client already exists' });
    }

    const client = await Client.create({
      userId,
      name,
      email,
      phone,     // ✅ add this
      country,   // ✅ add this
      address,   // ✅ add this
      enabled: true,
    });

    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
