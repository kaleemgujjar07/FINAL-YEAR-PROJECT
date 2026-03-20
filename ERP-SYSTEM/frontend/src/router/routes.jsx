import { lazy } from 'react';

import { Navigate } from 'react-router-dom';

const Logout = lazy(() => import('@/pages/Logout.jsx'));
const NotFound = lazy(() => import('@/pages/NotFound.jsx'));

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Customer = lazy(() => import('@/pages/Customer'));
const Invoice = lazy(() => import('@/pages/Invoice'));
const InvoiceCreate = lazy(() => import('@/pages/Invoice/InvoiceCreate'));

const InvoiceRead = lazy(() => import('@/pages/Invoice/InvoiceRead'));
const InvoiceUpdate = lazy(() => import('@/pages/Invoice/InvoiceUpdate'));
const InvoiceRecordPayment = lazy(() => import('@/pages/Invoice/InvoiceRecordPayment'));
const Employee = lazy(() => import('@/pages/Employee/index'));
const EmployeeCreate = lazy(() => import('@/pages/Employee/EmployeeCreate'));
const EmployeeRead = lazy(() => import('@/pages/Employee/EmployeeRead'));
const EmployeeUpdate = lazy(() => import('@/pages/Employee/EmployeeUpdate'));
const Attendance = lazy(() => import('@/pages/Attendance/index'));
const AttendanceCreate = lazy(() => import('@/pages/Attendance/AttendanceCreate'));
const AttendanceRead = lazy(() => import('@/pages/Attendance/AttendanceRead'));
const AttendanceUpdate = lazy(() => import('@/pages/Attendance/AttendanceUpdate'));

const Settings = lazy(() => import('@/pages/Settings/Settings'));
const Payroll = lazy(() => import('@/pages/Payroll'));
const PayrollRead = lazy(() => import('@/pages/Payroll/PayrollRead'));
const PayrollUpdate = lazy(() => import('@/pages/Payroll/PayrollUpdate'));
const Expense = lazy(() => import('@/pages/Expense'));
const Product = lazy(() => import('@/pages/Product/index'));
const ProductRead = lazy(() => import('@/pages/Product/ProductRead'));
const ProductUpdate = lazy(() => import('@/pages/Product/ProductUpdate'));

const Profile = lazy(() => import('@/pages/Profile'));

let routes = {
  expense: [],
  default: [
    {
      path: '/login',
      element: <Navigate to="/" />,
    },
    {
      path: '/logout',
      element: <Logout />,
    },
    {
      path: '/',
      element: <Dashboard />,
    },
    {
      path: '/customer',
      element: <Customer />,
    },

    {
      path: '/invoice',
      element: <Invoice />,
    },
    {
      path: '/invoice/create',
      element: <InvoiceCreate />,
    },
    {
      path: '/invoice/read/:id',
      element: <InvoiceRead />,
    },
    {
      path: '/invoice/update/:id',
      element: <InvoiceUpdate />,
    },
    {
      path: '/invoice/pay/:id',
      element: <InvoiceRecordPayment />,
    },
    {
      path: '/employee',
      element: <Employee />,
    },
    {
      path: '/employee/create',
      element: <EmployeeCreate />,
    },
    {
      path: '/employee/read/:id',
      element: <EmployeeRead />,
    },
    {
      path: '/employee/update/:id',
      element: <EmployeeUpdate />,
    },
    {
      path: '/attendance',
      element: <Attendance />,
    },
    {
      path: '/attendance/create',
      element: <AttendanceCreate />,
    },
    {
      path: '/attendance/read/:id',
      element: <AttendanceRead />,
    },
    {
      path: '/attendance/update/:id',
      element: <AttendanceUpdate />,
    },

    {
      path: '/settings',
      element: <Settings />,
    },
    {
      path: '/settings/edit/:settingsKey',
      element: <Settings />,
    },
    {
      path: '/payroll',
      element: <Payroll />,
    },
    {
      path: '/payroll/read/:id',
      element: <PayrollRead />,
    },
    {
      path: '/payroll/update/:id',
      element: <PayrollUpdate />,
    },
    {
      path: '/expense',
      element: <Expense />,
    },
    {
      path: '/product',
      element: <Product />,
    },
    {
      path: '/product/read/:id',
      element: <ProductRead />,
    },
    {
      path: '/product/update/:id',
      element: <ProductUpdate />,
    },

    {
      path: '/profile',
      element: <Profile />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ],
};

export default routes;
