const mysql = require('mysql2/promise');
(async () => {
  const c = await mysql.createConnection({
    host: '193.203.175.121', port: 3306,
    user: 'u830440565_alexis', password: 'LtFv.2025-20-25',
    database: 'u830440565_alexis'
  });

  // 1. ALTER categorias — add slug and imagen_url
  await c.query(`ALTER TABLE categorias 
    ADD COLUMN slug VARCHAR(100) NULL AFTER nombre,
    ADD COLUMN imagen_url VARCHAR(500) NULL AFTER slug
  `).catch(e => console.log('categorias alter:', e.message));

  // 2. ALTER paquetes — add imagen_url, regimen, gastos_reserva, salidas_diarias
  await c.query(`ALTER TABLE paquetes 
    ADD COLUMN imagen_url VARCHAR(500) NULL AFTER estado,
    ADD COLUMN regimen VARCHAR(100) NULL AFTER imagen_url,
    ADD COLUMN gastos_reserva DECIMAL(10,2) DEFAULT 0 AFTER regimen,
    ADD COLUMN salidas_diarias TINYINT(1) DEFAULT 0 AFTER gastos_reserva
  `).catch(e => console.log('paquetes alter:', e.message));

  // Verify
  const [catCols] = await c.query('DESCRIBE categorias');
  console.log('=== categorias ===');
  catCols.forEach(r => console.log(r.Field + ' | ' + r.Type + ' | ' + r.Null));

  const [paqCols] = await c.query('DESCRIBE paquetes');
  console.log('\n=== paquetes ===');
  paqCols.forEach(r => console.log(r.Field + ' | ' + r.Type + ' | ' + r.Null));

  await c.end();
  console.log('\nDone!');
})();
