const MODULE_CATEGORIES = {
  BUSINESS: [
    { value: 'gst',               label: 'GST' },
    { value: 'vendor_payment',    label: 'Vendor Payments' },
    { value: 'customer_invoice',  label: 'Customer Invoice Follow-up' },
    { value: 'employee_salary',   label: 'Employee Salary' },
    { value: 'office_rent',       label: 'Office Rent' },
    { value: 'professional_tax',  label: 'Professional Tax' },
    { value: 'tds',               label: 'TDS' },
    { value: 'license_renewal',   label: 'License Renewal' },
    { value: 'amc_renewal',       label: 'AMC Renewal' },
  ],
  FAMILY: [
    { value: 'electricity',       label: 'Electricity Bill' },
    { value: 'water',             label: 'Water Bill' },
    { value: 'gas',               label: 'Gas Booking' },
    { value: 'mobile',            label: 'Mobile Recharge' },
    { value: 'broadband',         label: 'Broadband' },
    { value: 'ott',               label: 'OTT Subscription' },
    { value: 'school_fees',       label: 'School Fees' },
    { value: 'property_tax',      label: 'Property Tax' },
    { value: 'passport',          label: 'Passport Renewal' },
    { value: 'vehicle_service',   label: 'Vehicle Service' },
  ],
  FINANCE: [
    { value: 'credit_card',       label: 'Credit Card' },
    { value: 'emi',               label: 'EMI' },
    { value: 'home_loan',         label: 'Home Loan' },
    { value: 'personal_loan',     label: 'Personal Loan' },
    { value: 'lic',               label: 'LIC Premium' },
    { value: 'health_insurance',  label: 'Health Insurance' },
    { value: 'car_insurance',     label: 'Car Insurance' },
    { value: 'sip',               label: 'SIP' },
    { value: 'fixed_deposit',     label: 'Fixed Deposit' },
    { value: 'income_tax',        label: 'Income Tax' },
  ],
};

// Flat map: value → label
const CATEGORY_LABEL_MAP = {};
Object.values(MODULE_CATEGORIES).forEach((list) =>
  list.forEach((c) => { CATEGORY_LABEL_MAP[c.value] = c.label; })
);

// All valid category values
const ALL_CATEGORY_VALUES = Object.values(MODULE_CATEGORIES).flatMap((l) => l.map((c) => c.value));

module.exports = { MODULE_CATEGORIES, CATEGORY_LABEL_MAP, ALL_CATEGORY_VALUES };
