// routes/resultados.js
const express = require('express');
const router = express.Router();
const db = require('../db/queries');

// Página de resultados
router.get('/', async (req, res) => {
    try {
        const resultadosFuncionarios = await db.getResultadosFuncionarios();
        const resultadosAdministrativos = await db.getResultadosAdministrativas();
        res.render('resultados', { 
            resultadosFuncionarios, 
            resultadosAdministrativos 
        });
    } catch (error) {
        console.error('Error al cargar resultados:', error);
        res.status(500).send('Error al cargar los resultados');
    }
});

module.exports = router;