const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDefaultUsers() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'travel_tourism_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database');

    // Hash password
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    // Delete existing test users
    await connection.query(
      "DELETE FROM users WHERE email IN ('admin@travel.com', 'john@example.com', 'jane@example.com')"
    );
    console.log('✅ Cleaned up existing test users');

    // Create Admin User
    await connection.query(
      `INSERT INTO users (username, email, password, full_name, phone, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin', 'admin@travel.com', hashedPassword, 'Admin User', '+1234567890', 'admin']
    );
    console.log('✅ Admin user created');
    console.log('   Email: admin@travel.com');
    console.log('   Password: password123');
    console.log('');

    // Create Regular Users
    await connection.query(
      `INSERT INTO users (username, email, password, full_name, phone, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['john_doe', 'john@example.com', hashedPassword, 'John Doe', '+1234567891', 'customer']
    );
    console.log('✅ User 1 created');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');
    console.log('');

    await connection.query(
      `INSERT INTO users (username, email, password, full_name, phone, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['jane_smith', 'jane@example.com', hashedPassword, 'Jane Smith', '+1234567892', 'customer']
    );
    console.log('✅ User 2 created');
    console.log('   Email: jane@example.com');
    console.log('   Password: password123');
    console.log('');

    console.log('\n🎉 All default users created successfully!\n');
    console.log('═══════════════════════════════════════════');
    console.log('You can now login with:');
    console.log('═══════════════════════════════════════════');
    console.log('👨‍💼 ADMIN:');
    console.log('   Email: admin@travel.com');
    console.log('   Password: password123');
    console.log('');
    console.log('👤 USER:');
    console.log('   Email: john@example.com');
    console.log('   Password: password123');
    console.log('═══════════════════════════════════════════\n');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating users:', error.message);
    console.error('\nPlease check:');
    console.error('1. MySQL is running');
    console.error('2. Database "travel_tourism_db" exists');
    console.error('3. .env file has correct database credentials');
    console.error('4. Run "npm install" if you see module errors\n');
    
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

createDefaultUsers();
