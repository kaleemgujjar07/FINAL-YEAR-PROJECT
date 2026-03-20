const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin', required: true },
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'Employee',
    required: true,
    autopopulate: true,
  },
  month: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  basicSalary: {
    type: Number,
    required: true,
  },
  deductions: {
    type: Number,
    default: 0,
  },
  netSalary: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Paid'],
    default: 'Draft',
  },
  paymentDate: {
    type: Date,
  },
  notes: {
    type: String,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

payrollSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.models.Payroll || mongoose.model('Payroll', payrollSchema);
