//routes/resultados.js
const express = require('express');
const router = express.Router();
const db = require('../db/queries');

// Ruta única para TODOS los resultados (CONSOLIDADO)
router.get('/:tipo?', async (req, res) => {
    try {
        const tipo = req.params.tipo || 'general';
        
        console.log(`=== CARGANDO RESULTADOS CONSOLIDADOS: ${tipo} ===`);
        
        // Cargar resultados (misma lógica para todos)
        let resultadosFuncionarios = [];
        let resultadosAdministrativos = [];
        
        try {
            resultadosFuncionarios = await db.getResultadosFuncionarios();
            resultadosAdministrativos = await db.getResultadosAdministrativos();
        } catch (error) {
            console.error('Error cargando resultados:', error);
        }
        
        // Determinar si mostrar mensaje de "sin datos"
        const mensaje = (resultadosFuncionarios.length === 0 && resultadosAdministrativos.length === 0) 
            ? 'Aún no hay resultados disponibles. Sé el primero en participar.'
            : null;
        
        // Renderizar MISMA plantilla con diferentes variables
        res.render('resultados', {
            tipoVista: tipo, // 'inicial', 'final', 'general'
            resultadosFuncionarios, 
            resultadosAdministrativos,
            mensaje
            // 👆 SOLO estas variables - nada más
        });
        
    } catch (error) {
        console.error('❌ ERROR al cargar resultados:', error);
        res.status(500).render('error', {
            message: 'Error al cargar los resultados',
            error: process.env.NODE_ENV === 'production' ? {} : error
        });
    }
});

module.exports = router;