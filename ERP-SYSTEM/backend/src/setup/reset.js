require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);

async function deleteData() {
  const Admin = require('../models/coreModels/Admin');
  const AdminPassword = require('../models/coreModels/AdminPassword');
  const Setting = require('../models/coreModels/Setting');
  const Employee = require('../models/appModels/Employee');
  const Attendance = require('../models/appModels/Attendance');
  const Payroll = require('../models/appModels/Payroll');
  const Expense = require('../models/appModels/Expense');

  await Admin.deleteMany();
  await AdminPassword.deleteMany();
  await Employee.deleteMany();
  await Attendance.deleteMany();
  await Payroll.deleteMany();
  await Expense.deleteMany();
  console.log('👍 Admin Deleted. To setup demo admin data, run\n\n\t npm run setup\n\n');
  await Setting.deleteMany();
  console.log('👍 Setting Deleted. To setup Setting data, run\n\n\t npm run setup\n\n');

  process.exit();
}

deleteData();
