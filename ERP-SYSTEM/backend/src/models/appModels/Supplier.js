const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  company: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  note: {
    type: String,
    trim: true,
  },
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);
