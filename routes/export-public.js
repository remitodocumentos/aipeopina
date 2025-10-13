//routes/export-public.js
const express = require('express');
const router = express.Router();
const db = require('../db/queries');

// Exportar respuestas de funcionarios - PÚBLICO
router.get('/respuestas-funcionarios', async (req, res) => {
    try {
        console.log('=== EXPORT PÚBLICO - RESPUESTAS FUNCIONARIOS ===');
        
        const respuestas = await db.query(`
            SELECT 
                p.nombre AS "Nombre Participante",
                CASE 
                    WHEN p.nombre IS NULL OR p.nombre = '' THEN 'Anónimo'
                    ELSE 'Con nombre' 
                END AS "Tipo Participación",
                f.nombre AS "Nombre Funcionario",
                f.cargo AS "Cargo",
                f.seccion AS "Sección",
                pf.texto AS "Pregunta",
                pf.categoria AS "Categoría",
                rf.respuesta AS "Calificación",
                TO_CHAR(rf.fecha, 'DD/MM/YYYY HH24:MI:SS') AS "Fecha Respuesta"
            FROM respuestas_funcionarios rf
            LEFT JOIN participantes p ON rf.participante_id = p.id
            JOIN funcionarios f ON rf.funcionario_id = f.id
            JOIN preguntas_funcionarios pf ON rf.pregunta_id = pf.id
            ORDER BY f.nombre ASC, pf.categoria ASC
        `);

        if (respuestas.rows.length === 0) {
            return res.status(404).send('No hay respuestas de funcionarios para exportar');
        }

        // Crear contenido de texto
        let contenido = 'RESPUESTAS DE EVALUACIÓN DE FUNCIONARIOS - AIPE OPINA\n';
        contenido += '==========================================================\n\n';
        contenido += `Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}\n`;
        contenido += `Total de respuestas: ${respuestas.rows.length}\n\n`;
        
        const headers = ['Nombre Participante', 'Tipo Participación', 'Nombre Funcionario', 'Cargo', 'Pregunta', 'Calificación', 'Fecha'];
        contenido += headers.join(' | ') + '\n';
        contenido += headers.map(h => '-'.repeat(h.length)).join('-+-') + '\n';
        
        respuestas.rows.forEach(row => {
            const fila = [
                row['Nombre Participante'] || 'Anónimo',
                row['Tipo Participación'],
                row['Nombre Funcionario'],
                row['Cargo'],
                row['Pregunta'],
                row['Calificación'],
                row['Fecha Respuesta']
            ];
            contenido += fila.join(' | ') + '\n';
        });

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="resultados_funcionarios_aipe.txt"');
        res.send(contenido);

    } catch (error) {
        console.error('❌ Error al exportar respuestas de funcionarios:', error);
        res.status(500).send('Error al generar el archivo de exportación');
    }
});

// Exportar respuestas administrativas - PÚBLICO
router.get('/respuestas-administrativas', async (req, res) => {
    try {
        console.log('=== EXPORT PÚBLICO - RESPUESTAS ADMINISTRATIVAS ===');
        
        const respuestas = await db.query(`
            SELECT 
                p.nombre AS "Nombre Participante",
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
            ORDER BY sa.nombre ASC, pa.texto ASC
        `);

        if (respuestas.rows.length === 0) {
            return res.status(404).send('No hay respuestas administrativas para exportar');
        }

        // Crear contenido de texto
        let contenido = 'RESPUESTAS DE EVALUACIÓN ADMINISTRATIVA - AIPE OPINA\n';
        contenido += '=========================================================\n\n';
        contenido += `Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}\n`;
        contenido += `Total de respuestas: ${respuestas.rows.length}\n\n`;
        
        const headers = ['Nombre Participante', 'Tipo Participación', 'Sección', 'Pregunta', 'Calificación', 'Fecha'];
        contenido += headers.join(' | ') + '\n';
        contenido += headers.map(h => '-'.repeat(h.length)).join('-+-') + '\n';
        
        respuestas.rows.forEach(row => {
            const fila = [
                row['Nombre Participante'] || 'Anónimo',
                row['Tipo Participación'],
                row['Sección Administrativa'],
                row['Pregunta'],
                row['Calificación'],
                row['Fecha Respuesta']
            ];
            contenido += fila.join(' | ') + '\n';
        });

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="resultados_administrativos_aipe.txt"');
        res.send(contenido);

    } catch (error) {
        console.error('❌ Error al exportar respuestas administrativas:', error);
        res.status(500).send('Error al generar el archivo de exportación');
    }
});

module.exports = router;