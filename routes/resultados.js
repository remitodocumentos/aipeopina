//routes/resultados.js
const express = require('express');
const router = express.Router();
const db = require('../db/queries');

// Ruta única para TODOS los resultados (CONSOLIDADO)
router.get('/:tipo?', async (req, res) => {
    try {
        const tipo = req.params.tipo || 'general';
        
        console.log(`=== CARGANDO RESULTADOS CONSOLIDADOS: ${tipo} ===`);
        
        let resultadosFuncionarios = [];
        let resultadosAdministrativos = [];
        let errorCarga = null;
        
        try {
            // Usar la función original de resultados consolidados
            resultadosFuncionarios = await db.getResultadosFuncionarios();
            console.log(`✅ Resultados funcionarios: ${resultadosFuncionarios ? resultadosFuncionarios.length : 0} registros`);
        } catch (error) {
            console.error('❌ Error cargando resultados de funcionarios:', error.message);
            errorCarga = 'Error al cargar resultados de funcionarios';
            // Continuar sin resultados de funcionarios
        }
        
        try {
            // Usar la función original de resultados consolidados
            resultadosAdministrativos = await db.getResultadosAdministrativos();
            console.log(`✅ Resultados administrativos: ${resultadosAdministrativos ? resultadosAdministrativos.length : 0} registros`);
        } catch (error) {
            console.error('❌ Error cargando resultados administrativos:', error.message);
            errorCarga = errorCarga ? errorCarga + ' y administrativos' : 'Error al cargar resultados administrativos';
            // Continuar sin resultados administrativos
        }
        
        // Si hay error de carga o no hay datos
        if (errorCarga && (!resultadosFuncionarios || resultadosFuncionarios.length === 0) && (!resultadosAdministrativos || resultadosAdministrativos.length === 0)) {
            console.log('ℹ️ No hay datos de resultados disponibles');
            return res.render('resultados', {
                resultadosFuncionarios: [],
                resultadosAdministrativos: [],
                mensaje: 'Aún no hay resultados disponibles. Sé el primero en participar.',
                tipoVista: tipo,
                error: null
            });
        }
        
        // Si hay error pero algunos datos están disponibles
        if (errorCarga) {
            console.log('⚠️ Algunos datos cargaron con errores, pero mostrando los disponibles');
        }
        
        res.render('resultados', { 
            resultadosFuncionarios: resultadosFuncionarios || [], 
            resultadosAdministrativos: resultadosAdministrativos || [],
            mensaje: null,
            tipoVista: tipo,
            error: errorCarga
        });
        
    } catch (error) {
        console.error('❌ ERROR CRÍTICO AL CARGAR RESULTADOS:', error);
        res.status(500).render('error', {
            message: 'Error al cargar los resultados',
            details: error.message,
            error: process.env.NODE_ENV === 'production' ? {} : error
        });
    }
});

module.exports = router;