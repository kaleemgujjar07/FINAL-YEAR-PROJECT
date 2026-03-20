require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });
const { globSync } = require('glob');
const fs = require('fs');
const { generate: uniqueId } = require('shortid');
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);

async function setupApp() {
  try {
    const Admin = require('../models/coreModels/Admin');
    const AdminPassword = require('../models/coreModels/AdminPassword');
    const newAdminPassword = new AdminPassword();

    const salt = uniqueId();

    const passwordHash = newAdminPassword.generateHash(salt, 'admin123');

    const demoAdmin = {
      email: 'admin@admin.com',
      name: 'Cognivio',
      surname: 'Admin',
      enabled: true,
      role: 'owner',
    };
    const result = await new Admin(demoAdmin).save();

    const AdminPasswordData = {
      password: passwordHash,
      emailVerified: true,
      salt: salt,
      user: result._id,
    };
    await new AdminPassword(AdminPasswordData).save();

    console.log('👍 Admin created : Done!');

    const Setting = require('../models/coreModels/Setting');

    const settingFiles = [];

    const settingsFiles = globSync('./src/setup/defaultSettings/**/*.json');

    for (const filePath of settingsFiles) {
      const file = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      settingFiles.push(...file);
    }

    await Setting.insertMany(settingFiles);

    console.log('👍 Settings created : Done!');

    const Expense = require('../models/appModels/Expense');
    const Employee = require('../models/appModels/Employee');
    const Attendance = require('../models/appModels/Attendance');

    const employees = await Employee.insertMany([
      {
        name: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        phone: '123456789',
        department: 'Engineering',
        position: 'Software Engineer',
        salary: 5000,
        createdBy: result._id,
      },
      {
        name: 'Jane',
        surname: 'Smith',
        email: 'jane.smith@example.com',
        phone: '987654321',
        department: 'HR',
        position: 'HR Manager',
        salary: 4500,
        createdBy: result._id,
      },
    ]);
    console.log('👍 Employees created : Done!');

    await Attendance.insertMany(
      employees.map((emp) => ({
        employee: emp._id,
        date: new Date(),
        status: 'Present',
        createdBy: result._id,
      }))
    );
    console.log('👍 Attendance created : Done!');

    await Expense.insertMany([
      {
        title: 'Office Supplies',
        amount: 250,
        category: 'Office',
        createdBy: result._id,
      },
      {
        title: 'Internet Bill',
        amount: 100,
        category: 'Utilities',
        createdBy: result._id,
      },
    ]);
    console.log('👍 Expense created : Done!');

    console.log('👍 Payroll setup : Skipped initial data (requires employee)');

    console.log('🥳 Setup completed :Success!');
    process.exit();
  } catch (e) {
    console.log('\n🚫 Error! The Error info is below');
    console.log(e);
    process.exit();
  }
}

setupApp();
