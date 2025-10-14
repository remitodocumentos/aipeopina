//routes/export-public.js
const express = require('express');
const router = express.Router();
const db = require('../db/queries');

// Función auxiliar para obtener respuestas de funcionarios AGRUPADAS POR PARTICIPANTE
const getRespuestasFuncionariosAgrupadas = async () => {
    const result = await db.query(`
        SELECT 
            p.id AS participante_id,
            p.nombre AS participante_nombre,
            p.dispositivo_id,
            CASE 
                WHEN p.nombre IS NULL OR p.nombre = '' THEN 'Anónimo'
                ELSE 'Con nombre' 
            END AS tipo_participacion,
            f.nombre AS funcionario_nombre,
            f.cargo,
            f.seccion,
            pf.texto AS pregunta_texto,
            pf.categoria,
            rf.respuesta,
            TO_CHAR(rf.fecha, 'DD/MM/YYYY HH24:MI:SS') AS fecha_respuesta
        FROM respuestas_funcionarios rf
        JOIN participantes p ON rf.participante_id = p.id
        JOIN funcionarios f ON rf.funcionario_id = f.id
        JOIN preguntas_funcionarios pf ON rf.pregunta_id = pf.id
        ORDER BY 
            p.id ASC,
            f.nombre ASC,
            pf.categoria ASC
    `);
    return result.rows;
};

// Función auxiliar para obtener respuestas administrativas AGRUPADAS POR PARTICIPANTE
const getRespuestasAdministrativasAgrupadas = async () => {
    const result = await db.query(`
        SELECT 
            p.id AS participante_id,
            p.nombre AS participante_nombre,
            p.dispositivo_id,
            CASE 
                WHEN p.nombre IS NULL OR p.nombre = '' THEN 'Anónimo'
                ELSE 'Con nombre' 
            END AS tipo_participacion,
            sa.nombre AS seccion_nombre,
            pa.texto AS pregunta_texto,
            ra.respuesta,
            TO_CHAR(ra.fecha, 'DD/MM/YYYY HH24:MI:SS') AS fecha_respuesta
        FROM respuestas_administrativas ra
        JOIN participantes p ON ra.participante_id = p.id
        JOIN secciones_administrativas sa ON ra.seccion_id = sa.id
        JOIN preguntas_administrativas pa ON ra.pregunta_id = pa.id
        ORDER BY 
            p.id ASC,
            sa.nombre ASC,
            pa.texto ASC
    `);
    return result.rows;
};

// Exportar respuestas de funcionarios - AGRUPADO POR PARTICIPANTE
router.get('/respuestas-funcionarios', async (req, res) => {
    try {
        console.log('=== EXPORT PÚBLICO - RESPUESTAS FUNCIONARIOS AGRUPADAS ===');
        
        const respuestas = await getRespuestasFuncionariosAgrupadas();

        if (respuestas.length === 0) {
            return res.status(404).send('No hay respuestas de funcionarios para exportar');
        }

        // Agrupar por participante
        const respuestasPorParticipante = {};
        respuestas.forEach(row => {
            const participanteId = row.participante_id;
            if (!respuestasPorParticipante[participanteId]) {
                respuestasPorParticipante[participanteId] = {
                    nombre: row.participante_nombre || 'Anónimo',
                    tipo: row.tipo_participacion,
                    dispositivo_id: row.dispositivo_id,
                    respuestas: []
                };
            }
            respuestasPorParticipante[participanteId].respuestas.push(row);
        });

        // Crear contenido de texto AGRUPADO POR PARTICIPANTE
        let contenido = 'RESPUESTAS DE EVALUACIÓN DE FUNCIONARIOS - AGRUPADO POR PARTICIPANTE\n';
        contenido += '===================================================================\n\n';
        contenido += `Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}\n`;
        contenido += `Total de participantes: ${Object.keys(respuestasPorParticipante).length}\n`;
        contenido += `Total de respuestas: ${respuestas.length}\n\n`;
        
        // Para cada participante
        Object.values(respuestasPorParticipante).forEach((participante, index) => {
            contenido += `\n${'='.repeat(80)}\n`;
            contenido += `PARTICIPANTE ${index + 1}: ${participante.nombre} (${participante.tipo})\n`;
            contenido += `ID Dispositivo: ${participante.dispositivo_id}\n`;
            contenido += `${'='.repeat(80)}\n\n`;
            
            // Encabezados para este participante
            const headers = ['Funcionario', 'Cargo', 'Sección', 'Pregunta', 'Categoría', 'Calificación', 'Fecha'];
            contenido += headers.join(' | ') + '\n';
            contenido += headers.map(h => '-'.repeat(h.length)).join('-+-') + '\n';
            
            // Respuestas de este participante
            participante.respuestas.forEach(row => {
                const fila = [
                    row.funcionario_nombre,
                    row.cargo,
                    row.seccion,
                    row.pregunta_texto,
                    row.categoria,
                    row.respuesta,
                    row.fecha_respuesta
                ];
                contenido += fila.join(' | ') + '\n';
            });
        });

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="resultados_funcionarios_por_participante.txt"');
        res.send(contenido);

    } catch (error) {
        console.error('❌ Error al exportar respuestas de funcionarios:', error);
        res.status(500).send('Error al generar el archivo de exportación');
    }
});

// Exportar respuestas administrativas - AGRUPADO POR PARTICIPANTE
router.get('/respuestas-administrativas', async (req, res) => {
    try {
        console.log('=== EXPORT PÚBLICO - RESPUESTAS ADMINISTRATIVAS AGRUPADAS ===');
        
        const respuestas = await getRespuestasAdministrativasAgrupadas();

        if (respuestas.length === 0) {
            return res.status(404).send('No hay respuestas administrativas para exportar');
        }

        // Agrupar por participante
        const respuestasPorParticipante = {};
        respuestas.forEach(row => {
            const participanteId = row.participante_id;
            if (!respuestasPorParticipante[participanteId]) {
                respuestasPorParticipante[participanteId] = {
                    nombre: row.participante_nombre || 'Anónimo',
                    tipo: row.tipo_participacion,
                    dispositivo_id: row.dispositivo_id,
                    respuestas: []
                };
            }
            respuestasPorParticipante[participanteId].respuestas.push(row);
        });

        // Crear contenido de texto AGRUPADO POR PARTICIPANTE
        let contenido = 'RESPUESTAS DE EVALUACIÓN ADMINISTRATIVA - AGRUPADO POR PARTICIPANTE\n';
        contenido += '====================================================================\n\n';
        contenido += `Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}\n`;
        contenido += `Total de participantes: ${Object.keys(respuestasPorParticipante).length}\n`;
        contenido += `Total de respuestas: ${respuestas.length}\n\n`;
        
        // Para cada participante
        Object.values(respuestasPorParticipante).forEach((participante, index) => {
            contenido += `\n${'='.repeat(80)}\n`;
            contenido += `PARTICIPANTE ${index + 1}: ${participante.nombre} (${participante.tipo})\n`;
            contenido += `ID Dispositivo: ${participante.dispositivo_id}\n`;
            contenido += `${'='.repeat(80)}\n\n`;
            
            // Encabezados para este participante
            const headers = ['Sección', 'Pregunta', 'Calificación', 'Fecha'];
            contenido += headers.join(' | ') + '\n';
            contenido += headers.map(h => '-'.repeat(h.length)).join('-+-') + '\n';
            
            // Respuestas de este participante
            participante.respuestas.forEach(row => {
                const fila = [
                    row.seccion_nombre,
                    row.pregunta_texto,
                    row.respuesta,
                    row.fecha_respuesta
                ];
                contenido += fila.join(' | ') + '\n';
            });
        });

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="resultados_administrativos_por_participante.txt"');
        res.send(contenido);

    } catch (error) {
        console.error('❌ Error al exportar respuestas administrativas:', error);
        res.status(500).send('Error al generar el archivo de exportación');
    }
});

module.exports = router;