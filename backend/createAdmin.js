require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const mongoose = require('mongoose');
const User     = require('./models/User');

mongoose
  .connect(process.env.MONGO_URI, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 10000,
  })
  .then(async () => {
    console.log('✅ MongoDB Connected');

    // Delete existing admin if any
    await User.deleteOne({ email: 'admin@apnadukaan.com' });

    // Create fresh admin
    const admin = await User.create({
      name:     'Admin',
      email:    'admin@apnadukaan.com',
      password: 'admin123',   // will be hashed automatically by User model
      role:     'admin',
      isActive: true,
    });

    console.log('Admin created successfully!');
    console.log('   Email    :', admin.email);
    console.log('   Password : admin123');
    console.log('   Role     :', admin.role);
    process.exit(0);
  })
  .catch((err) => {
    console.error(' Error:', err.message);
    process.exit(1);
  });