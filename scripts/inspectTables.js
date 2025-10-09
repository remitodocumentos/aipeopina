const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:qPSgQngWimrOGGuvQBFUCjgLmbtCvKFt@yamabiko.proxy.rlwy.net:51796/railway',
  ssl: { rejectUnauthorized: false }
});

const tablas = [
  'funcionarios',
  'preguntas_funcionarios',
  'secciones_administrativas',
  'preguntas_administrativas',
  'respuestas_funcionarios',
  'respuestas_administrativas',
  'participantes',
  'session'
];

(async () => {
  try {
    await client.connect();
    console.log('🔍 Conectado a PostgreSQL\n');

    for (const tabla of tablas) {
      console.log(`📦 Tabla: ${tabla}`);
      const res = await client.query(`SELECT * FROM ${tabla} LIMIT 50`);
      if (res.rows.length === 0) {
        console.log('  (vacía)\n');
      } else {
        res.rows.forEach((row, i) => {
          console.log(`  [${i + 1}]`, row);
        });
        console.log('');
      }
    }
  } catch (err) {
    console.error('❌ Error al consultar:', err.message);
  } finally {
    await client.end();
    console.log('✅ Conexión cerrada');
  }
})();

