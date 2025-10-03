const express = require('express');
const router = express.Router();
const db = require('../db/queries');

router.get('/', async (req, res) => {
    try {
        const resultadosFuncionarios = await db.getResultadosFuncionarios();
        const resultadosAdministrativos = await db.getResultadosAdministrativos();
        res.render('resultados', { 
            resultadosFuncionarios, 
            resultadosAdministrativos 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al cargar los resultados');
    }
});

module.exports = router;