const mysql = require('mysql2/promise');
require('dotenv').config({path: '../.env'}); // Need to point to correct .env

async function checkTables() {
  const urlParams = new URL(process.env.DATABASE_URL.replace('mysql+pymysql', 'mysql'));
  const connection = await mysql.createConnection({
    host: urlParams.hostname,
    user: urlParams.username,
    password: urlParams.password,
    database: urlParams.pathname.split('/')[1]
  });
  
  const tables = ['transportes', 'servicios', 'paquete_transporte', 'paquete_servicio'];
  for (const t of tables) {
    const [rows] = await connection.execute(`DESCRIBE ${t}`);
    console.log(`\n=== ${t} ===`);
    rows.forEach(r => console.log(`${r.Field} | ${r.Type} | ${r.Null}`));
  }
  await connection.end();
}
checkTables().catch(console.error);
