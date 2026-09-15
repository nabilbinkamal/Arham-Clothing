require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'aureon_user',
    password: process.env.DB_PASSWORD || 'aureon_pass123!',
    database: process.env.DB_NAME || 'aureon_db'
  });
  
  try {
    console.log('Adding specifications column...');
    await connection.query('ALTER TABLE products ADD COLUMN specifications JSON');
    console.log('Success!');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') console.log('specifications column already exists.');
    else console.error(err);
  }
  
  try {
    console.log('Adding size_chart column...');
    await connection.query('ALTER TABLE products ADD COLUMN size_chart JSON');
    console.log('Success!');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') console.log('size_chart column already exists.');
    else console.error(err);
  }

  await connection.end();
}

main();
