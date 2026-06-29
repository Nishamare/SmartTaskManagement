const fs     = require('fs');
const path   = require('path');
const mysql  = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const connection = await mysql.createConnection({
    host:               process.env.DB_HOST     || 'localhost',
    port:               process.env.DB_PORT     || 3306,
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('🔧  Running SmartTaskManagement DB init...');

  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await connection.query(sql);

  console.log('✅  Database initialized successfully!');
  console.log('👤  Demo admin → admin@smarttask.com / Admin@123');
  await connection.end();
})().catch((err) => {
  console.error('❌  DB Init failed:', err.message);
  process.exit(1);
});