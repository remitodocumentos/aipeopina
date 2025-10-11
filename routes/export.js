//routes/export.js
const express = require('express');
const router = express.Router();
const db = require('../db/queries');
const authMiddleware = require('../middleware/auth');
const { Parser } = require('json2csv');

// Exportar resultados en CSV
router.get('/resultados/csv', authMiddleware.isAuthenticated, async (req, res) => {
    try {
        const [resultadosFuncionarios, resultadosAdministrativos] = await Promise.all([
            db.getResultadosFuncionarios(),
            db.getResultadosAdministrativos()
        ]);

        // Combinar resultados
        const allResults = [
            ...resultadosFuncionarios.map(r => ({
                tipo: 'funcionario',
                nombre: r.funcionario_nombre,
                cargo: r.cargo,
                pregunta: r.pregunta_texto,
                respuesta: r.respuesta,
                cantidad: r.cantidad
            })),
            ...resultadosAdministrativos.map(r => ({
                tipo: 'administrativo',
                seccion: r.seccion_nombre,
                pregunta: r.pregunta_texto,
                respuesta: r.respuesta,
                cantidad: r.cantidad
            }))
        ];

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(allResults);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=resultados-evaluacion.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error al exportar CSV:', error);
        res.status(500).json({ error: 'Error al exportar resultados' });
    }
});

module.exports = router;