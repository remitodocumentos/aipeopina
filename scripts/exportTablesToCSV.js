const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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

const exportFolder = path.join(__dirname, '../exports');

(async () => {
  try {
    await client.connect();
    console.log('🔗 Conectado a PostgreSQL');

    // Crear carpeta de exportación si no existe
    if (!fs.existsSync(exportFolder)) {
      fs.mkdirSync(exportFolder);
    }

    for (const tabla of tablas) {
      console.log(`📦 Exportando tabla: ${tabla}`);
      const res = await client.query(`SELECT * FROM ${tabla}`);

      if (res.rows.length === 0) {
        console.log(`  ⚠️ Tabla "${tabla}" está vacía\n`);
        continue;
      }

      const headers = Object.keys(res.rows[0]);
      const csvRows = res.rows.map(row =>
        headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(',')
      );

      const csvContent = [headers.join(','), ...csvRows].join('\n');
      const filePath = path.join(exportFolder, `${tabla}.csv`);
      fs.writeFileSync(filePath, csvContent, 'utf8');

      console.log(`  ✅ Exportado a: exports/${tabla}.csv\n`);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
    console.log('✅ Conexión cerrada');
  }
})();

// para correr:
// node scripts/exportTablesToCSV.js