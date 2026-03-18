const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
  const urlParams = new URL(process.env.DATABASE_URL.replace('mysql+pymysql', 'mysql'));
  const connection = await mysql.createConnection({
    host: urlParams.hostname,
    user: urlParams.username,
    password: urlParams.password,
    database: urlParams.pathname.split('/')[1]
  });
  const [rows] = await connection.execute('SHOW TABLES');
  console.log("TABLES:");
  rows.forEach(r => console.log(Object.values(r)[0]));
  await connection.end();
}
checkTables().catch(console.error);
