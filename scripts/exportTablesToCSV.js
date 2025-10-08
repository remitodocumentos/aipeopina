const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:qPSgQngWimrOGGuvQBFUCjgLmbtCvKFt@yamabiko.proxy.rlwy.net:51796/railway',
  ssl: { rejectUnauthorized: false }
});

const exportFolder = path.join(__dirname, '../exports');

// Función para formatear CSV con mejor separación
function formatCSV(rows) {
  if (rows.length === 0) return '';
  
  const headers = Object.keys(rows[0]);
  
  // Calcular el ancho máximo para cada columna
  const columnWidths = headers.map(header => {
    const maxDataWidth = Math.max(...rows.map(row => 
      String(row[header] || '').length
    ));
    return Math.max(header.length, maxDataWidth);
  });
  
  // Crear línea de separación
  const separator = columnWidths.map(width => '-'.repeat(width + 2)).join('+');
  
  // Crear encabezados formateados
  const formattedHeaders = headers.map((header, i) => 
    ` ${header.padEnd(columnWidths[i])} `
  ).join('|');
  
  // Crear filas de datos formateadas
  const formattedRows = rows.map(row =>
    headers.map((header, i) => 
      ` ${String(row[header] || '').padEnd(columnWidths[i])} `
    ).join('|')
  );
  
  // Combinar todo
  return [
    formattedHeaders,
    separator,
    ...formattedRows,
    separator
  ].join('\n');
}

// Función para crear CSV con columnas bien separadas
function createFormattedCSV(rows, filename) {
  if (rows.length === 0) return;
  
  const headers = Object.keys(rows[0]);
  
  // CSV con separadores visibles
  const csvContent = [
    headers.join(' | '),
    headers.map(h => '-'.repeat(h.length)).join('-+-'),
    ...rows.map(row => 
      headers.map(h => String(row[h] || '')).join(' | ')
    )
  ].join('\n');
  
  const filePath = path.join(exportFolder, filename);
  fs.writeFileSync(filePath, csvContent, 'utf8');
}

// Función para crear CSV estándar (compatible con Excel)
function createStandardCSV(rows, filename) {
  if (rows.length === 0) return;
  
  const headers = Object.keys(rows[0]);
  const csvRows = rows.map(row =>
    headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(',')
  );
  
  const csvContent = [headers.join(','), ...csvRows].join('\n');
  const filePath = path.join(exportFolder, filename);
  fs.writeFileSync(filePath, csvContent, 'utf8');
}

(async () => {
  try {
    await client.connect();
    console.log('🔗 Conectado a PostgreSQL');

    // Crear carpeta de exportación si no existe
    if (!fs.existsSync(exportFolder)) {
      fs.mkdirSync(exportFolder);
    }

    console.log('📊 Exportando datos enriquecidos...\n');

    // 1. Exportar respuestas de funcionarios con información detallada (FORMATEADO)
    console.log('📦 Exportando respuestas de funcionarios (formateado)');
    const respuestasFuncionariosDetalladas = await client.query(`
      SELECT 
        rf.id AS "ID Respuesta",
        p.nombre AS "Nombre Participante",
        p.dispositivo_id AS "ID Dispositivo",
        CASE 
          WHEN p.nombre IS NULL OR p.nombre = '' THEN 'Anónimo'
          ELSE 'Con nombre' 
        END AS "Tipo Participación",
        f.nombre AS "Nombre Funcionario",
        f.cargo AS "Cargo Funcionario",
        f.seccion AS "Sección Funcionario",
        pf.texto AS "Pregunta",
        pf.categoria AS "Categoría Pregunta",
        rf.respuesta AS "Calificación",
        TO_CHAR(rf.fecha, 'DD/MM/YYYY HH24:MI:SS') AS "Fecha Respuesta"
      FROM respuestas_funcionarios rf
      LEFT JOIN participantes p ON rf.participante_id = p.id
      JOIN funcionarios f ON rf.funcionario_id = f.id
      JOIN preguntas_funcionarios pf ON rf.pregunta_id = pf.id
      ORDER BY rf.fecha DESC
    `);

    if (respuestasFuncionariosDetalladas.rows.length > 0) {
      // Versión formateada para lectura
      createFormattedCSV(respuestasFuncionariosDetalladas.rows, 'respuestas_funcionarios_formateado.txt');
      
      // Versión CSV estándar para Excel
      createStandardCSV(respuestasFuncionariosDetalladas.rows, 'respuestas_funcionarios_excel.csv');
      
      console.log(`  ✅ Exportado: exports/respuestas_funcionarios_formateado.txt (${respuestasFuncionariosDetalladas.rows.length} registros)`);
      console.log(`  ✅ Exportado: exports/respuestas_funcionarios_excel.csv (para Excel)`);
    } else {
      console.log('  ⚠️ No hay respuestas de funcionarios');
    }

    // 2. Exportar respuestas administrativas con información detallada (FORMATEADO)
    console.log('\n📦 Exportando respuestas administrativas (formateado)');
    const respuestasAdministrativasDetalladas = await client.query(`
      SELECT 
        ra.id AS "ID Respuesta",
        p.nombre AS "Nombre Participante",
        p.dispositivo_id AS "ID Dispositivo",
        CASE 
          WHEN p.nombre IS NULL OR p.nombre = '' THEN 'Anónimo'
          ELSE 'Con nombre' 
        END AS "Tipo Participación",
        sa.nombre AS "Sección Administrativa",
        pa.texto AS "Pregunta",
        ra.respuesta AS "Calificación",
        TO_CHAR(ra.fecha, 'DD/MM/YYYY HH24:MI:SS') AS "Fecha Respuesta"
      FROM respuestas_administrativas ra
      LEFT JOIN participantes p ON ra.participante_id = p.id
      JOIN secciones_administrativas sa ON ra.seccion_id = sa.id
      JOIN preguntas_administrativas pa ON ra.pregunta_id = pa.id
      ORDER BY ra.fecha DESC
    `);

    if (respuestasAdministrativasDetalladas.rows.length > 0) {
      // Versión formateada para lectura
      createFormattedCSV(respuestasAdministrativasDetalladas.rows, 'respuestas_administrativas_formateado.txt');
      
      // Versión CSV estándar para Excel
      createStandardCSV(respuestasAdministrativasDetalladas.rows, 'respuestas_administrativas_excel.csv');
      
      console.log(`  ✅ Exportado: exports/respuestas_administrativas_formateado.txt (${respuestasAdministrativasDetalladas.rows.length} registros)`);
      console.log(`  ✅ Exportado: exports/respuestas_administrativas_excel.csv (para Excel)`);
    } else {
      console.log('  ⚠️ No hay respuestas administrativas');
    }

    // 3. Exportar resumen de participantes (FORMATEADO)
    console.log('\n📦 Exportando resumen de participantes (formateado)');
    const resumenParticipantes = await client.query(`
      SELECT 
        p.id AS "ID Participante",
        p.nombre AS "Nombre",
        p.dispositivo_id AS "ID Dispositivo",
        CASE 
          WHEN p.nombre IS NULL OR p.nombre = '' THEN 'Anónimo'
          ELSE 'Con nombre'
        END AS "Tipo Participación",
        TO_CHAR(p.fecha_registro, 'DD/MM/YYYY HH24:MI:SS') AS "Fecha Registro",
        COUNT(DISTINCT rf.id) AS "Respuestas Funcionarios",
        COUNT(DISTINCT ra.id) AS "Respuestas Administrativas",
        (COUNT(DISTINCT rf.id) + COUNT(DISTINCT ra.id)) AS "Total Respuestas"
      FROM participantes p
      LEFT JOIN respuestas_funcionarios rf ON p.id = rf.participante_id
      LEFT JOIN respuestas_administrativas ra ON p.id = ra.participante_id
      GROUP BY p.id, p.nombre, p.dispositivo_id, p.fecha_registro
      ORDER BY p.fecha_registro DESC
    `);

    if (resumenParticipantes.rows.length > 0) {
      createFormattedCSV(resumenParticipantes.rows, 'resumen_participantes_formateado.txt');
      createStandardCSV(resumenParticipantes.rows, 'resumen_participantes_excel.csv');
      console.log(`  ✅ Exportado: exports/resumen_participantes_formateado.txt (${resumenParticipantes.rows.length} registros)`);
      console.log(`  ✅ Exportado: exports/resumen_participantes_excel.csv (para Excel)`);
    } else {
      console.log('  ⚠️ No hay participantes');
    }

    // 4. Exportar tablas básicas (formateadas)
    console.log('\n📦 Exportando tablas básicas de referencia (formateadas)');
    const tablasBasicas = [
      { nombre: 'funcionarios', query: 'SELECT id AS "ID", nombre AS "Nombre", cargo AS "Cargo", seccion AS "Sección" FROM funcionarios ORDER BY id' },
      { nombre: 'preguntas_funcionarios', query: 'SELECT id AS "ID", texto AS "Pregunta", categoria AS "Categoría" FROM preguntas_funcionarios ORDER BY id' },
      { nombre: 'secciones_administrativas', query: 'SELECT id AS "ID", nombre AS "Nombre Sección" FROM secciones_administrativas ORDER BY id' },
      { nombre: 'preguntas_administrativas', query: 'SELECT id AS "ID", texto AS "Pregunta", seccion_id AS "ID Sección" FROM preguntas_administrativas ORDER BY seccion_id, id' }
    ];

    for (const tabla of tablasBasicas) {
      console.log(`  📋 Exportando: ${tabla.nombre}`);
      const res = await client.query(tabla.query);

      if (res.rows.length === 0) {
        console.log(`    ⚠️ Tabla "${tabla.nombre}" está vacía`);
        continue;
      }

      createFormattedCSV(res.rows, `${tabla.nombre}_formateado.txt`);
      createStandardCSV(res.rows, `${tabla.nombre}_excel.csv`);
      console.log(`    ✅ Exportado: exports/${tabla.nombre}_formateado.txt`);
      console.log(`    ✅ Exportado: exports/${tabla.nombre}_excel.csv`);
    }

    // 5. Exportar reporte consolidado (FORMATEADO)
    console.log('\n📦 Generando reporte consolidado (formateado)');
    const reporteConsolidado = await client.query(`
      SELECT 
        'Funcionarios' AS "Tipo Evaluación",
        COUNT(*) AS "Total Respuestas",
        COUNT(DISTINCT participante_id) AS "Total Participantes",
        COUNT(DISTINCT funcionario_id) AS "Funcionarios Evaluados"
      FROM respuestas_funcionarios
      UNION ALL
      SELECT 
        'Administrativa' AS "Tipo Evaluación",
        COUNT(*) AS "Total Respuestas",
        COUNT(DISTINCT participante_id) AS "Total Participantes",
        COUNT(DISTINCT seccion_id) AS "Secciones Evaluadas"
      FROM respuestas_administrativas
    `);

    if (reporteConsolidado.rows.length > 0) {
      createFormattedCSV(reporteConsolidado.rows, 'reporte_consolidado_formateado.txt');
      createStandardCSV(reporteConsolidado.rows, 'reporte_consolidado_excel.csv');
      console.log(`  ✅ Exportado: exports/reporte_consolidado_formateado.txt`);
      console.log(`  ✅ Exportado: exports/reporte_consolidado_excel.csv`);
    }

    console.log('\n🎉 Exportación completada exitosamente!');
    console.log('\n📁 Archivos generados:');
    console.log('   📄 Archivos .txt - Formato legible con columnas separadas');
    console.log('   📊 Archivos .csv - Formato Excel compatible');
    console.log('\n📋 Archivos principales:');
    console.log('   👥 respuestas_funcionarios_* - Evaluaciones de funcionarios');
    console.log('   🏢 respuestas_administrativas_* - Evaluaciones administrativas');
    console.log('   📈 resumen_participantes_* - Resumen por participante');
    console.log('   📋 Tablas de referencia');
    console.log('   📊 reporte_consolidado_* - Estadísticas generales');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
})();