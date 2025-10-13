//routes/export.js
const express = require('express');
const router = express.Router();
const db = require('../db/queries');
const authMiddleware = require('../middleware/auth');

// Exportar respuestas de funcionarios en formato texto
router.get('/respuestas-funcionarios', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        console.log('=== EXPORTANDO RESPUESTAS FUNCIONARIOS ===');
        
        const respuestas = await db.query(`
            SELECT 
                p.nombre AS "Nombre Participante",
                p.dispositivo_id AS "ID Dispositivo",
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
            ORDER BY 
                CASE 
                    WHEN p.nombre IS NULL OR p.nombre = '' THEN 'ZZZ_Anónimo'
                    ELSE p.nombre 
                END ASC,
                f.nombre ASC,
                pf.categoria ASC
        `);

        if (respuestas.rows.length === 0) {
            return res.status(404).render('admin/error', {
                message: 'No hay respuestas de funcionarios para exportar'
            });
        }

        // Crear contenido de texto formateado
        let contenido = 'RESPUESTAS DE EVALUACIÓN DE FUNCIONARIOS\n';
        contenido += '===========================================\n\n';
        contenido += `Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}\n`;
        contenido += `Total de respuestas: ${respuestas.rows.length}\n\n`;
        
        // Encabezados
        const headers = [
            'Nombre Participante', 'ID Dispositivo', 'Tipo Participación',
            'Nombre Funcionario', 'Cargo', 'Sección', 'Pregunta', 
            'Categoría', 'Calificación', 'Fecha Respuesta'
        ];
        
        contenido += headers.join(' | ') + '\n';
        contenido += headers.map(h => '-'.repeat(h.length)).join('-+-') + '\n';
        
        // Datos
        respuestas.rows.forEach(row => {
            const fila = headers.map(header => {
                const valor = row[header] || '';
                return String(valor).replace(/\n/g, ' '); // Eliminar saltos de línea
            });
            contenido += fila.join(' | ') + '\n';
        });

        // Configurar respuesta para descarga
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="respuestas_funcionarios.txt"');
        res.send(contenido);

    } catch (error) {
        console.error('❌ Error al exportar respuestas de funcionarios:', error);
        res.status(500).render('admin/error', {
            message: 'Error al exportar respuestas de funcionarios',
            error: process.env.NODE_ENV === 'production' ? {} : error
        });
    }
});

// Exportar respuestas administrativas en formato texto
router.get('/respuestas-administrativas', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        console.log('=== EXPORTANDO RESPUESTAS ADMINISTRATIVAS ===');
        
        const respuestas = await db.query(`
            SELECT 
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
            ORDER BY 
                CASE 
                    WHEN p.nombre IS NULL OR p.nombre = '' THEN 'ZZZ_Anónimo'
                    ELSE p.nombre 
                END ASC,
                sa.nombre ASC,
                pa.texto ASC
        `);

        if (respuestas.rows.length === 0) {
            return res.status(404).render('admin/error', {
                message: 'No hay respuestas administrativas para exportar'
            });
        }

        // Crear contenido de texto formateado
        let contenido = 'RESPUESTAS DE EVALUACIÓN ADMINISTRATIVA\n';
        contenido += '==========================================\n\n';
        contenido += `Fecha de exportación: ${new Date().toLocaleDateString('es-ES')}\n`;
        contenido += `Total de respuestas: ${respuestas.rows.length}\n\n`;
        
        // Encabezados
        const headers = [
            'Nombre Participante', 'ID Dispositivo', 'Tipo Participación',
            'Sección Administrativa', 'Pregunta', 'Calificación', 'Fecha Respuesta'
        ];
        
        contenido += headers.join(' | ') + '\n';
        contenido += headers.map(h => '-'.repeat(h.length)).join('-+-') + '\n';
        
        // Datos
        respuestas.rows.forEach(row => {
            const fila = headers.map(header => {
                const valor = row[header] || '';
                return String(valor).replace(/\n/g, ' '); // Eliminar saltos de línea
            });
            contenido += fila.join(' | ') + '\n';
        });

        // Configurar respuesta para descarga
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="respuestas_administrativas.txt"');
        res.send(contenido);

    } catch (error) {
        console.error('❌ Error al exportar respuestas administrativas:', error);
        res.status(500).render('admin/error', {
            message: 'Error al exportar respuestas administrativas',
            error: process.env.NODE_ENV === 'production' ? {} : error
        });
    }
});

// Página principal de exportaciones
router.get('/', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        // Obtener conteos para mostrar en la página
        const [conteoFuncionarios, conteoAdministrativas] = await Promise.all([
            db.getTotalRespuestasFuncionarios(),
            db.getTotalRespuestasAdministrativas()
        ]);

        res.render('admin/export', {
            totalFuncionarios: conteoFuncionarios,
            totalAdministrativas: conteoAdministrativas
        });
    } catch (error) {
        console.error('Error al cargar página de exportación:', error);
        res.status(500).render('admin/error', {
            message: 'Error al cargar la página de exportación'
        });
    }
});

module.exports = router;