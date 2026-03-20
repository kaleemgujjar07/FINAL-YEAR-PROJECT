const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day', 'Leave'],
    required: true,
  },
  checkIn: {
    type: String,
  },
  checkOut: {
    type: String,
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

attendanceSchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
